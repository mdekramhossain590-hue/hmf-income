import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, updateDoc, increment, addDoc, getDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { processRegistrationReferral } from '../lib/referral';
import { useAuth } from '../components/AuthProvider';
import { useLanguage } from '../components/LanguageProvider';
import { getDeviceId } from '../lib/device';
import toast from 'react-hot-toast';

import { Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  
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

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const createProfileForUser = async (user: any, displayName: string, userEmail: string) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let myReferCode = '';
    for (let i = 0; i < 2; i++) {
      myReferCode += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 6; i++) {
      myReferCode += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    const deviceId = getDeviceId();

    // Fetch activation mode to determine initial activation state
    let initialIsActive = false;
    try {
      const actSnap = await getDoc(doc(db, 'settings', 'activation'));
      if (actSnap.exists()) {
        const actData = actSnap.data();
        initialIsActive = actData?.mode === 'free';
      }
    } catch (e) {
      console.warn("Could not fetch activation settings, defaulting to inactive:", e);
    }

    try {
      const userRole = userEmail.toLowerCase() === 'mdekramhossain590@gmail.com' ? "admin" : "user";
      await setDoc(doc(db, "users", user.uid), {
        fullName: displayName,
        email: userEmail,
        myReferCode: myReferCode,
        usedReferCode: referCode ? referCode.replace(/[\u200B-\u200D\uFEFF\s]/g, '').trim().toUpperCase() : "none",
        balances: { main: 0, bonus: 10, referral: 0, partner: 0 },
        role: userRole,
        isActive: initialIsActive,
        referralBonusPaid: false,
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

      if (referCode && initialIsActive) {
        await processRegistrationReferral(user.uid);
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
        {siteSettings?.logoUrl && (
          <img src={siteSettings.logoUrl} alt="Logo" className="w-24 h-24 mb-4 drop-shadow-2xl rounded-3xl bg-white dark:bg-slate-800 border p-2 border-white dark:border-slate-700 object-cover rotate-3 hover:rotate-0 transition-transform duration-300" />
        )}
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
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-base text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-base text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 pr-12 text-base text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {isLogin && (
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline focus:outline-none disabled:opacity-50"
              >
                Forgot Password?
              </button>
            </div>
          )}
          {!isLogin && (
            <div className="relative mt-3">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 pr-12 text-base text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          )}
          {!isLogin && (
            <input
              type="text"
              placeholder="Referral Code (Optional)"
              value={referCode}
              onChange={(e) => setReferCode(e.target.value.replace(/[\u200B-\u200D\uFEFF\s]/g, '').trim())}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-base text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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

        <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer hover:underline underline-offset-4 bg-transparent border-none p-0 outline-none transition-colors"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>

        {/* Security Badges */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-6">
          <div className="flex flex-col items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity cursor-default">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">SSL Secure</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity cursor-default">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M12 2v6"/><path d="M12 8c-3.3 0-6 2.7-6 6v3h12v-3c0-3.3-2.7-6-6-6Z"/><path d="M4 17h16"/></svg>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Bot Protected</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity cursor-default">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Verified Users</span>
          </div>
        </div>
      </div>
    </div>
  );
}
