import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Lock, CreditCard, ShieldCheck } from 'lucide-react';
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
        const docSnap = await getDoc(doc(db, 'settings', 'activation'));
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
        // Simple update approach - deduct fee & activate
        const currentRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(currentRef, {
          'balances.main': increment(-settings.fee),
          isActive: true
        });
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
        await refreshProfile();
        toast.success("Account activated successfully!");
      } catch (error) {
        toast.error("Failed to activate account.");
      }
    }
    setActivating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-700">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-center text-white relative">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            {settings.mode === 'paid' ? <Lock className="w-8 h-8 text-white" /> : <ShieldCheck className="w-8 h-8 text-white" />}
          </div>
          <h2 className="text-xl font-bold">Account Activation</h2>
          <p className="text-indigo-100 text-sm mt-1">Activate to unlock all features</p>
        </div>
        
        <div className="p-6 space-y-4 text-center">
          {loading ? (
            <p className="text-gray-500 text-sm py-4">Checking requirements...</p>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your account is currently inactive. You must activate it to participate in tasks, spin the wheel, and earn rewards.
              </p>
              
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-xl border border-gray-100 dark:border-slate-600">
                <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Activation Fee</span>
                {settings.mode === 'paid' ? (
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">৳ {settings.fee}</span>
                ) : (
                  <span className="text-2xl font-black text-green-500">FREE</span>
                )}
              </div>

              {settings.mode === 'paid' && (
                <p className="text-xs text-gray-500 font-medium">
                  You need to pay the activation fee via bKash/Nagad.
                </p>
              )}

              <button
                onClick={() => {
                  navigate('/payment');
                  onClose();
                }}
                disabled={activating}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition shadow-sm
                  ${activating ? 'opacity-70 cursor-not-allowed bg-indigo-400 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
              >
                <>
                  <ShieldCheck className="w-5 h-5" /> Proceed to Activation
                </>
              </button>
            </>
          )}

          <button
            onClick={onClose}
            className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-semibold transition py-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
