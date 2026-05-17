import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, AuthProvider as FirebaseAuthProvider } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, updateDoc, increment, addDoc, getDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';
import { useLanguage } from '../components/LanguageProvider';
import { getDeviceId } from '../lib/device';
import toast from 'react-hot-toast';

export function Auth() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  const isRegisterRoute = window.location.pathname.includes('/register') || window.location.pathname.includes('/signup');
  
  const [isLogin, setIsLogin] = useState(!initialRef && !isRegisterRoute);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [referCode, setReferCode] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { refreshProfile, siteSettings } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.formEvent ? e.formEvent.preventDefault() : e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const deviceId = getDeviceId();
        
        // Update device ID on login to track existing users or updated devices
        await updateDoc(doc(db, "users", user.uid), {
          deviceId: deviceId,
          lastLoginAt: serverTimestamp()
        }).catch(() => {/* ignore errors */});

        await refreshProfile();
        toast.success("Logged In Successfully!");
        navigate('/');
      } else {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Device ID Check
        const deviceId = getDeviceId();
        const deviceQuery = query(collection(db, "users"), where("deviceId", "==", deviceId));
        const deviceSnapshot = await getDocs(deviceQuery);
        
        if (!deviceSnapshot.empty) {
          await user.delete().catch(() => {});
          await auth.signOut();
          toast.error(t('only_one_account_allowed'));
          setLoading(false);
          return;
        }
        
        await createProfileForUser(user, name, email);
        
        await refreshProfile();
        toast.success("Account Created Successfully! ৳10 Bonus Added.");
        navigate('/');
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error("This email is already in use.");
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        toast.error("Invalid email or password.");
      } else {
        toast.error("Error: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const createProfileForUser = async (user: any, displayName: string, userEmail: string) => {
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const uidStr = user.uid.substring(user.uid.length - 4).toUpperCase();
    const myReferCode = `HMF-${randomStr}-${uidStr}`;
    const deviceId = getDeviceId();

    try {
      const userRole = userEmail.toLowerCase() === 'mdekramhossain590@gmail.com' ? "admin" : "user";
      await setDoc(doc(db, "users", user.uid), {
        fullName: displayName,
        email: userEmail,
        myReferCode: myReferCode,
        usedReferCode: referCode || "none",
        balances: { main: 0, bonus: 10, referral: 0 },
        role: userRole,
        isActive: false,
        deviceId: deviceId, // Store device ID
        isBlocked: false, // Default not blocked
        createdAt: serverTimestamp()
      });

      await setDoc(doc(db, "leaderboard", user.uid), {
        fullName: displayName || 'User',
        bonus: 10,
        referrals: 0,
        totalIncome: 10,
        updatedAt: serverTimestamp()
      }, { merge: true });

      if (referCode) {
        try {
          let currentReferCode = referCode;
          let gen1 = 10, gen2 = 0, gen3 = 0;
          
          try {
            const refDoc = await getDoc(doc(db, "settings", "referral"));
            if (refDoc && refDoc.exists()) {
              const data = refDoc.data();
              gen1 = data.fixedBonus || 0;
              gen2 = data.gen2FixedBonus || 0;
              gen3 = data.gen3FixedBonus || 0;
            }
          } catch (e) {
            console.error("Could not fetch referral settings", e);
          }
          
          const bonuses = [gen1, gen2, gen3];
          
          for (let level = 0; level < 3; level++) {
            if (!currentReferCode || currentReferCode === 'none') break;
            const fixedBonus = bonuses[level];
            
            const q = query(collection(db, "users"), where("myReferCode", "==", currentReferCode));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) break;
            
            const referrerDoc = querySnapshot.docs[0];
            const referrerId = referrerDoc.id;
            const referrerData = referrerDoc.data();
            
            if (fixedBonus > 0) {
              await addDoc(collection(db, `users/${referrerId}/referrals`), {
                referredEmail: userEmail,
                referredName: displayName || 'Anonymous',
                bonusEarned: fixedBonus,
                level: level + 1,
                createdAt: serverTimestamp()
              });

              await updateDoc(doc(db, "users", referrerId), {
                "balances.referral": increment(fixedBonus),
                totalReferrals: increment(level === 0 ? 1 : 0)
              });
              
              const leaderboardRef = doc(db, 'leaderboard', referrerId);
              await setDoc(leaderboardRef, {
                fullName: referrerData.fullName || 'User',
                referrals: increment(level === 0 ? 1 : 0),
                bonus: increment(0),
                totalIncome: increment(fixedBonus),
                updatedAt: serverTimestamp()
              }, { merge: true });
            }
            
            currentReferCode = referrerData.usedReferCode;
          }
        } catch (err) {
          console.error("Referral process error:", err);
        }
      }
    } catch (dbError) {
      handleFirestoreError(dbError, OperationType.CREATE, `users/${user.uid}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white relative overflow-hidden" style={{ paddingBottom: 0 }}>
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-30 pointer-events-none"></div>
      
      <div className="text-center mb-8 flex flex-col items-center relative z-10">
        <img src={siteSettings?.logoUrl || "/favicon.svg"} alt="Logo" className="w-24 h-24 mb-4 drop-shadow-2xl rounded-3xl bg-white dark:bg-slate-800 border p-2 border-white dark:border-slate-700 object-cover rotate-3 hover:rotate-0 transition-transform duration-300" />
        <h1 className="text-4xl font-black tracking-tight mb-2 text-slate-900 dark:text-white uppercase">HMF <span className="text-indigo-600 dark:text-indigo-400 font-outline-2">INCOME</span></h1>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-[0.2em] uppercase">Premium Earning Platform</p>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 p-6 rounded-3xl shadow-xl dark:shadow-2xl relative z-10">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white tracking-tight">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          )}
          {!isLogin && (
            <input
              type="text"
              placeholder="Referral Code (Optional)"
              value={referCode}
              onChange={(e) => setReferCode(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold rounded-xl px-4 py-3.5 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:bg-indigo-700 hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>
        
        <p className="text-center mt-5 text-sm text-slate-500 dark:text-slate-400 font-medium">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer hover:underline underline-offset-4 bg-transparent border-none p-0 outline-none transition-colors"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}
