import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { sendEmailVerification } from 'firebase/auth';
import { Mail, RefreshCw, LogOut, ShieldCheck, Inbox, ArrowRight } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export function EmailVerification() {
  const { user, logOut } = useAuth();
  const { t } = useLanguage();
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleResend = async () => {
    if (!user || timeLeft > 0) return;
    setIsResending(true);
    try {
      await sendEmailVerification(user);
      toast.success(t('verification_email_sent') || 'Verification email sent!');
      setTimeLeft(60);
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        toast.error(t('too_many_requests') || 'Too many requests. Please wait.');
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleRefresh = async () => {
    if (user) {
      setIsRefreshing(true);
      await user.reload();
      if (user.emailVerified) {
        toast.success('Email verified successfully!');
        window.location.reload();
      } else {
        toast.error(t('email_not_verified_yet') || 'Email not verified yet. Please check your inbox.');
        setIsRefreshing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative z-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 max-w-md w-full text-center shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 relative overflow-hidden"
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <div className="relative">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner rotate-3"
          >
            <div className="w-24 h-24 bg-white/50 dark:bg-slate-950/50 rounded-3xl flex items-center justify-center -rotate-3 backdrop-blur-sm border border-white/50 dark:border-slate-800/50">
              <Mail className="w-12 h-12 text-blue-600 dark:text-blue-400 stroke-[1.5]" />
            </div>
          </motion.div>
          
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
              {t('verify_your_email') || 'Verify Your Email'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base mb-8 leading-relaxed px-2">
              {t('verification_link_sent') || `We've sent a secure verification link to `}
              <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md mx-1 inline-block mt-1">{user?.email}</span>
              <br className="hidden sm:block" />
              {t('please_verify_to_continue') || 'Please check your inbox to activate.'}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full relative group overflow-hidden bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 dark:bg-black/10 group-hover:translate-x-full transition-transform duration-500 ease-out -translate-x-full" />
              <ShieldCheck className="w-5 h-5" />
              <span>{isRefreshing ? 'Verifying...' : (t('i_have_verified') || "I've Verified My Email")}</span>
              <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
            
            <button
              onClick={handleResend}
              disabled={isResending || timeLeft > 0}
              className="w-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex justify-center items-center gap-2 border border-blue-100 dark:border-blue-900/30 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Inbox className="w-5 h-5" />
              {isResending ? (
                <span className="animate-pulse">{t('sending') || 'Sending...'}</span>
              ) : timeLeft > 0 ? (
                <span>{t('resend_in') || 'Resend available in'} <span className="w-6 inline-block font-mono">{timeLeft}s</span></span>
              ) : (
                <span>{t('resend_email') || 'Resend Link'}</span>
              )}
            </button>

            <button
              onClick={logOut}
              className="w-full flex justify-center items-center gap-2 py-4 mt-2 text-slate-400 dark:text-slate-500 font-medium hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut className="w-4 h-4" />
              {t('log_out') || 'Log out and try another account'}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
