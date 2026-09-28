import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
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
      } catch (error: any) {
        console.error(error?.message || "Unknown Error");
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
        const userSnap = await getDoc(currentRef);
        if (userSnap.exists()) {
           const actualBal = userSnap.data().balances?.main || 0;
           if (actualBal < settings.fee) {
              toast.error('Insufficient balance to activate.');
              setActivating(false);
              return;
           }
        }
        await updateDoc(currentRef, {
          'balances.main': increment(-settings.fee),
          'balances.bonus': increment(10),
          isActive: true
        });
        const leaderboardRef = doc(db, 'leaderboard', auth.currentUser.uid);
        await updateDoc(leaderboardRef, { bonus: increment(10), totalIncome: increment(10) });
        await processRegistrationReferral(auth.currentUser.uid);
        await refreshProfile();
        toast.success("Account activated successfully!");
      } catch (error: any) {
        toast.error("An error occurred during activation.");
      }
    } else {
      // Free activation
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          isActive: true,
          'balances.bonus': increment(10)
        });
        const leaderboardRef = doc(db, 'leaderboard', auth.currentUser.uid);
        await updateDoc(leaderboardRef, { bonus: increment(10), totalIncome: increment(10) });
        await processRegistrationReferral(auth.currentUser.uid);
        await refreshProfile();
        toast.success("Account activated successfully!");
      } catch (error: any) {
        toast.error("Failed to activate account.");
      }
    }
    setActivating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090909]/85 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#151515] rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden border border-[#3D3215] relative"
      >
        {/* Banner with modern circular meshes */}
        <div className="bg-gradient-to-br from-[#8A6508] via-[#D4A017] to-[#FACC15] p-8 text-center text-[#090909] relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#8A6508]/20 rounded-full blur-lg"></div>
          
          <div className="w-16 h-16 bg-[#090909]/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#090909]/20 shadow-inner">
            {settings.mode === 'paid' ? (
              <Lock className="w-8 h-8 text-[#090909] animate-pulse" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-[#090909]" />
            )}
          </div>
          <h2 className="text-2xl font-display font-black tracking-tight">Account Activation</h2>
          <p className="text-[#1A1A1A] text-xs font-bold uppercase tracking-widest mt-1">অ্যাকাউন্ট ভেরিফিকেশন ও অ্যাক্টিভেশন</p>
        </div>
        
        <div className="p-6 space-y-5 text-center">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-[#3D3215] border-t-[#D4A017] rounded-full animate-spin"></div>
              <p className="text-[#737373] text-xs font-black uppercase tracking-wider">Checking Requirements...</p>
            </div>
          ) : (
            <>
              <div className="text-left bg-[#101010] p-4 rounded-2xl border border-[#3D3215]">
                <p className="text-xs sm:text-sm text-[#A3A3A3] font-semibold leading-relaxed">
                  আপনার অ্যাকাউন্টটি বর্তমানে <strong className="text-[#EF4444] underline">ইন-অ্যাক্টিভ</strong> রয়েছে। কাজ শুরু করতে, টাস্ক সম্পন্ন করতে এবং ডেইলি উইথড্র নিতে অ্যাকাউন্টটি অ্যাক্টিভ করা বাধ্যতামূলক।
                </p>
              </div>
              
              {/* Fee badge */}
              <div className="bg-[#101010] p-5 rounded-2xl border border-[#3D3215] flex justify-between items-center text-left">
                <div>
                  <span className="block text-[10px] font-black text-[#737373] uppercase tracking-widest">Activation Mode</span>
                  <span className="text-sm font-bold text-[#FFFFFF]">
                    {settings.mode === 'paid' ? 'Paid Activation (ফি)' : 'Free Activation (ফ্রি)'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-black text-[#737373] uppercase tracking-widest text-right">Fee (চার্জ)</span>
                  {settings.mode === 'paid' ? (
                    <span className="text-2xl font-black text-[#FACC15]">৳{settings.fee}</span>
                  ) : (
                    <span className="text-2xl font-black text-[#22C55E]">FREE</span>
                  )}
                </div>
              </div>

              {settings.mode === 'paid' && (
                <p className="text-[11px] text-[#A3A3A3] font-bold bg-[#1C1C1C] py-2.5 px-3 rounded-xl border border-[#3D3215] flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#FACC15] animate-ping"></span>
                  অ্যাক্টিভেশন ফি বিকাশ, রকেট বা নগদের মাধ্যমে পেমেন্ট করুন।
                </p>
              )}

              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    if (settings.mode === 'paid') {
                      navigate('/payment');
                      onClose();
                    } else {
                      handleActivate();
                    }
                  }}
                  disabled={activating}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-[18px] text-xs font-black uppercase tracking-widest shadow-lg shadow-[#D4A017]/20 bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] transition-all active:scale-[0.98] disabled:opacity-75"
                >
                  {settings.mode === 'paid' ? <><ShieldCheck className="w-4 h-4 text-[#090909]" /> Act Now / পেমেন্ট করুন</> : <><ShieldCheck className="w-4 h-4 text-[#090909]" /> Activate for Free</>}
                  <ChevronRight className="w-4 h-4 text-[#090909]" />
                </button>

                <button
                  onClick={onClose}
                  className="w-full text-[#737373] hover:text-[#FFFFFF] text-xs font-black uppercase tracking-wider transition-colors py-2.5 hover:bg-[#1C1C1C] rounded-xl"
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
