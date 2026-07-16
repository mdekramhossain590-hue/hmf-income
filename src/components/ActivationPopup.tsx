import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from '@/src/lib/mock-firestore';
import { auth, db } from '../lib/firebase';
import { getCachedDoc } from '../lib/cache';
import { processRegistrationReferral } from '../lib/referral';
import { Lock, CreditCard, ShieldCheck, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export function ActivationPopup({ onClose }: { onClose: () => void }) {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [settings, setSettings] = useState({ mode: 'free', fee: 50 });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getCachedDoc(doc(db, 'settings', 'activation'));
        if (docSnap.exists()) {
          setSettings(docSnap.data() as any);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleActivate = async () => {
    if (!auth.currentUser) return;
    setActivating(true);

    if (settings.mode === 'paid') {
      const currentMain = profile?.balances?.main || 0;
      if (currentMain < settings.fee) {
        toast.error(`Insufficient balance. You need ৳${settings.fee} to activate.`);
        setActivating(false);
        return;
      }
      
      try {
        const currentRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(currentRef, {
          'balances.main': increment(-settings.fee),
          isActive: true
        });
        await processRegistrationReferral(auth.currentUser.uid);
        await refreshProfile();
        toast.success("Account activated successfully!");
      } catch (error) {
        toast.error("An error occurred during activation.");
      }
    } else {
      // Free activation
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          isActive: true
        });
        await processRegistrationReferral(auth.currentUser.uid);
        await refreshProfile();
        toast.success("Account activated successfully!");
      } catch (error) {
        toast.error("Failed to activate account.");
      }
    }
    setActivating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800/80 relative"
      >
        {/* Banner with modern circular meshes */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-lg"></div>
          
          <div className="w-16 h-16 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
            {settings.mode === 'paid' ? (
              <Lock className="w-8 h-8 text-white animate-pulse" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-emerald-300" />
            )}
          </div>
          <h2 className="text-2xl font-display font-black tracking-tight">Account Activation</h2>
          <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mt-1">অ্যাকাউন্ট ভেরিফিকেশন ও অ্যাক্টিভেশন</p>
        </div>
        
        <div className="p-6 space-y-5 text-center">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-slate-450 text-xs font-black uppercase tracking-wider">Checking Requirements...</p>
            </div>
          ) : (
            <>
              <div className="text-left bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850/60">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                  আপনার অ্যাকাউন্টটি বর্তমানে <strong className="text-rose-500 underline">ইন-অ্যাক্টিভ</strong> রয়েছে। কাজ শুরু করতে, টাস্ক সম্পন্ন করতে এবং ডেইলি উইথড্র নিতে অ্যাকাউন্টটি অ্যাক্টিভ করা বাধ্যতামূলক।
                </p>
              </div>
              
              {/* Fee badge */}
              <div className="bg-gradient-to-tr from-slate-50 to-indigo-50/30 dark:from-slate-955 dark:to-indigo-950/20 p-5 rounded-2xl border border-slate-150/45 dark:border-indigo-900/15 flex justify-between items-center text-left">
                <div>
                  <span className="block text-[10px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest">Activation Mode</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-300">
                    {settings.mode === 'paid' ? 'Paid Activation (ফি)' : 'Instant Trial (ফ্রি)'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest text-right">Fee (চার্জ)</span>
                  {settings.mode === 'paid' ? (
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">৳{settings.fee}</span>
                  ) : (
                    <span className="text-2xl font-black text-emerald-500">FREE</span>
                  )}
                </div>
              </div>

              {settings.mode === 'paid' && (
                <p className="text-[11px] text-slate-450 dark:text-slate-400 font-bold bg-indigo-50/30 dark:bg-slate-800/40 py-2.5 px-3 rounded-xl border border-indigo-100/10 flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                  অ্যাক্টিভেশন ফি বিকাশ, রকেট বা নগদের মাধ্যমে পেমেন্ট করুন।
                </p>
              )}

              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    navigate('/payment');
                    onClose();
                  }}
                  disabled={activating}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-[18px] text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/10 bg-indigo-600 hover:bg-indigo-550 text-white transition-all active:scale-[0.98] disabled:opacity-75"
                >
                  <ShieldCheck className="w-4 h-4" /> Act Now / পেমেন্ট করুন
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onClose}
                  className="w-full text-slate-450 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-black uppercase tracking-wider transition-colors py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl"
                >
                  Cancel / পরে করব
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
