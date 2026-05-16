import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { sendEmailVerification } from 'firebase/auth';
import { Mail, RefreshCw, LogOut } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import toast from 'react-hot-toast';

export function EmailVerification() {
  const { user, logOut } = useAuth();
  const { t } = useLanguage();
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

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
      await user.reload();
      if (user.emailVerified) {
        window.location.reload();
      } else {
        toast.error(t('email_not_verified_yet') || 'Email not verified yet. Please check your inbox.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative z-50">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
          {t('verify_your_email') || 'Verify Your Email'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
          {t('verification_link_sent') || `We've sent a verification link to `}
          <span className="font-bold text-slate-700 dark:text-slate-300">{user?.email}</span>.
          {t('please_verify_to_continue') || ' Please click the link to activate your account.'}
        </p>

        <div className="space-y-3">
          <button
            onClick={handleRefresh}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            <RefreshCw className="w-5 h-5" />
            {t('i_have_verified') || "I've Verified"}
          </button>
          
          <button
            onClick={handleResend}
            disabled={isResending || timeLeft > 0}
            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {isResending ? (
              <span className="animate-pulse">{t('sending') || 'Sending...'}</span>
            ) : timeLeft > 0 ? (
              <span>{t('resend_in') || 'Resend in'} {timeLeft}s</span>
            ) : (
              <span>{t('resend_email') || 'Resend Email'}</span>
            )}
          </button>

          <button
            onClick={logOut}
            className="w-full flex justify-center items-center gap-2 py-4 text-slate-400 font-bold hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t('log_out') || 'Log Out'}
          </button>
        </div>
      </div>
    </div>
  );
}
