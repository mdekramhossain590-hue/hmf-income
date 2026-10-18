import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, updateDoc, increment, addDoc, getDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { processRegistrationReferral } from '../lib/referral';
import { useAuth, generateUserReferralCode } from '../components/AuthProvider';
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

  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0); // 0 = none, 1 = enter email, 2 = enter OTP and new password
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');

  
  const navigate = useNavigate();
  const { refreshProfile, siteSettings } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const cleanEmail = email.trim();
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const user = userCredential.user;
        const deviceId = getDeviceId();
        
        // Update device ID on login to track existing users or updated devices
        try {
          await updateDoc(doc(db, "users", user.uid), {
            deviceId: deviceId,
            lastLoginAt: serverTimestamp()
          });
        } catch (_) {}

        try {
          await refreshProfile(user.uid);
        } catch (_) {}

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

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const deviceId = getDeviceId();

      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        const defaultReferCode = generateUserReferralCode(user.displayName || user.email || 'User');
        const newProfileData: any = {
          id: user.uid,
          uid: user.uid,
          email: user.email?.toLowerCase() || '',
          fullName: user.displayName || user.email?.split('@')[0] || 'User',
          name: user.displayName || user.email?.split('@')[0] || 'User',
          role: (user.email?.toLowerCase() === 'mdekramhossain590@gmail.com') ? 'admin' : 'user',
          myReferCode: defaultReferCode,
          usedReferCode: referCode ? referCode.trim() : 'none',
          balances: { main: 10, bonus: 0, referral: 0, partner: 0, tasks: 0 },
          balance: 10,
          isActive: true,
          deviceId: deviceId,
          totalReferrals: 0,
          partnerReferrals: 0,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        };

        await setDoc(userDocRef, newProfileData, { merge: true });

        if (referCode && referCode.trim() !== '') {
          try {
            await processRegistrationReferral(user.uid, user.email?.toLowerCase() || '', referCode.trim());
          } catch (_) {}
        }
      } else {
        try {
          await updateDoc(userDocRef, {
            deviceId: deviceId,
            lastLoginAt: serverTimestamp()
          });
        } catch (_) {}
      }

      try {
        await refreshProfile(user.uid);
      } catch (_) {}

      toast.success("Google দিয়ে সফলভাবে লগইন হয়েছেন!");
      navigate('/');
    } catch (error: any) {
      console.error("Google login error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error("লগইন উইন্ডো বন্ধ করা হয়েছে");
      } else if (error.code === 'auth/popup-blocked') {
        toast.error("পপআপ রিকোয়েস্ট ব্লক করা হয়েছে। ব্রাউজারে পপআপ এলাউ করুন।");
      } else {
        toast.error("গুগল লগইন করতে সমস্যা হয়েছে: " + (error.message || "Error"));
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
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      
      toast.success("OTP sent to your email!");
      setResetStep(2);
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndReset = async () => {
    if (!email || !resetOtp || !resetNewPassword) {
      toast.error("Please fill all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: resetOtp, newPassword: resetNewPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      
      toast.success("Password changed successfully! You can now login.");
      setResetStep(0);
      setIsLogin(true);
      setPassword('');
      setResetOtp('');
      setResetNewPassword('');
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
    } catch (e: any) {
      console.warn("Could not fetch activation settings, defaulting to inactive:", e?.message || "Unknown Error");
    }

    try {
      const userRole = userEmail.toLowerCase() === 'mdekramhossain590@gmail.com' ? "admin" : "user";
      await setDoc(doc(db, "users", user.uid), {
        fullName: displayName,
        email: userEmail,
        myReferCode: myReferCode,
        usedReferCode: referCode ? referCode.replace(/[\u200B-\u200D\uFEFF\s]/g, '').trim().toUpperCase() : "none",
        balances: { main: 0, bonus: 0, referral: 0, partner: 0 },
        role: userRole,
        isActive: initialIsActive,
        referralBonusPaid: false,
        deviceId: deviceId, // Store device ID
        isBlocked: false, // Default not blocked
        createdAt: serverTimestamp()
      });

      await setDoc(doc(db, "leaderboard", user.uid), {
        fullName: displayName || 'User',
        bonus: 0,
        referrals: 0,
        totalIncome: 0,
        updatedAt: serverTimestamp()
      }, { merge: true });

      if (referCode && initialIsActive) {
        await processRegistrationReferral(user.uid);
      }
    } catch (dbError: any) {

      handleFirestoreError(dbError, OperationType.CREATE, `users/${user.uid}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-[#090909] text-white relative overflow-hidden" style={{ paddingBottom: 0 }}>
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[#D4A017] rounded-full filter blur-3xl opacity-15 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-[#8A6508] rounded-full filter blur-3xl opacity-15 pointer-events-none"></div>
      
      <div className="text-center mb-8 flex flex-col items-center relative z-10">
        {siteSettings?.logoUrl && (
          <div className="max-w-[240px] max-h-24 mb-4 drop-shadow-2xl rounded-2xl bg-[#151515]/90 border border-[#3D3215] px-4 py-2 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-300">
            <img src={siteSettings.logoUrl} alt="Logo" className="max-h-20 max-w-full object-contain" />
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-white uppercase text-center">HMF <span className="bg-gradient-to-r from-[#D4A017] via-[#FACC15] to-[#FFE082] bg-clip-text text-transparent">EARNING ZONE</span></h1>
        <p className="text-[10px] text-[#A3A3A3] font-bold tracking-[0.2em] uppercase">Premium Earning Platform</p>
      </div>

      <div className="bg-[#151515] border border-[#3D3215] p-6 rounded-3xl shadow-2xl relative z-10">
        <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">
          {resetStep === 1 ? 'Reset Password' : resetStep === 2 ? 'Enter OTP' : isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        <form onSubmit={e => { e.preventDefault(); if (resetStep === 2) handleVerifyOtpAndReset(); else if (resetStep === 1) handleForgotPassword(); else handleSubmit(e); }} className="space-y-4">
          {resetStep === 1 ? (
            <input
              type="email"
              placeholder="Enter your Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#101010] border border-[#3D3215] rounded-xl px-4 py-3.5 text-base text-white placeholder-[#737373] focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#D4A017]/20 transition-all"
            />
          ) : resetStep === 2 ? (
            <>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                required
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value)}
                className="w-full bg-[#101010] border border-[#3D3215] rounded-xl px-4 py-3.5 text-base text-white placeholder-[#737373] focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#D4A017]/20 transition-all"
              />
              <div className="relative mt-3">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  required
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  className="w-full bg-[#101010] border border-[#3D3215] rounded-xl px-4 py-3.5 pr-12 text-base text-white placeholder-[#737373] focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#D4A017]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#FACC15] focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </>
          ) : (
            <>
              {!isLogin && (
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#101010] border border-[#3D3215] rounded-xl px-4 py-3.5 text-base text-white placeholder-[#737373] focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#D4A017]/20 transition-all"
                />
              )}
              <input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#101010] border border-[#3D3215] rounded-xl px-4 py-3.5 text-base text-white placeholder-[#737373] focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#D4A017]/20 transition-all"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#101010] border border-[#3D3215] rounded-xl px-4 py-3.5 pr-12 text-base text-white placeholder-[#737373] focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#D4A017]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#FACC15] focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {isLogin && (
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    disabled={loading}
                    className="text-xs text-[#FACC15] font-medium hover:underline focus:outline-none disabled:opacity-50"
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
                    className="w-full bg-[#101010] border border-[#3D3215] rounded-xl px-4 py-3.5 pr-12 text-base text-white placeholder-[#737373] focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#D4A017]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#FACC15] focus:outline-none"
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
                  onChange={(e) => setReferCode(e.target.value.replace(/[​-‍﻿\s]/g, '').trim())}
                  className="w-full bg-[#101010] border border-[#3D3215] rounded-xl px-4 py-3.5 text-base text-white placeholder-[#737373] focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#D4A017]/20 transition-all"
                />
              )}
            </>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] hover:opacity-95 text-[#090909] font-black py-3.5 rounded-xl shadow-lg shadow-[#D4A017]/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
          >
            {loading ? 'Processing...' : (resetStep === 1 ? 'Send OTP' : resetStep === 2 ? 'Reset Password' : isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {resetStep === 0 && (
          <>
            <div className="relative my-5 flex items-center justify-center">
              <div className="border-t border-[#3D3215] w-full"></div>
              <span className="bg-[#151515] px-3 text-[10px] font-black uppercase text-[#A3A3A3] shrink-0 tracking-wider">OR</span>
              <div className="border-t border-[#3D3215] w-full"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-[#101010] hover:bg-[#1C1C1C] border border-[#3D3215] hover:border-[#D4A017] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="text-xs sm:text-sm">Continue with Google (গুগল দিয়ে শুরু করুন)</span>
            </button>
          </>
        )}

        <p className="text-center mt-6 text-sm text-[#A3A3A3] font-medium">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-[#FACC15] font-bold cursor-pointer hover:underline underline-offset-4 bg-transparent border-none p-0 outline-none transition-colors"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>

        {/* Security Badges */}
        <div className="mt-8 pt-6 border-t border-[#3D3215] flex justify-center gap-6">
          <div className="flex flex-col items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity cursor-default">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#FACC15]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            <span className="text-[9px] font-bold text-[#737373] uppercase tracking-widest">SSL Secure</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity cursor-default">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#D4A017]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M12 2v6"/><path d="M12 8c-3.3 0-6 2.7-6 6v3h12v-3c0-3.3-2.7-6-6-6Z"/><path d="M4 17h16"/></svg>
            <span className="text-[9px] font-bold text-[#737373] uppercase tracking-widest">Bot Protected</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity cursor-default">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#FFE082]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
            <span className="text-[9px] font-bold text-[#737373] uppercase tracking-widest">Verified Users</span>
          </div>
        </div>
      </div>
    </div>
  );
}
