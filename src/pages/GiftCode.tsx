import React, { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { doc, getDoc, updateDoc, increment, arrayUnion, serverTimestamp, writeBatch, collection } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { Gift, Sparkles } from 'lucide-react';
import { Celebration } from '../components/Celebration';
import { triggerRealisticConfetti } from '../lib/confetti';

export function GiftCode() {
  const { profile, refreshProfile } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (code.trim().length < 5) {
      toast.error('Invalid Gift Code');
      return;
    }

    setLoading(true);
    try {
      const codeRef = doc(db, 'giftCodes', code.trim().toUpperCase());
      const codeSnap = await getDoc(codeRef);

      if (!codeSnap.exists()) {
        toast.error('Invalid Gift Code');
        setLoading(false);
        return;
      }

      const data = codeSnap.data();

      if (data.status !== 'active') {
        toast.error('This code is no longer active');
        setLoading(false);
        return;
      }

      if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
        toast.error('This code has expired');
        setLoading(false);
        return;
      }

      const usedBy = data.usedBy || [];
      if (usedBy.includes(auth.currentUser.uid)) {
        toast.error('You have already claimed this code');
        setLoading(false);
        return;
      }

      if (data.maxUses > 0 && usedBy.length >= data.maxUses) {
        toast.error('This code has reached its usage limit');
        setLoading(false);
        return;
      }

      let amount = 0;
      if (data.type === 'fixed') {
        amount = data.amount || 0;
      } else if (data.type === 'random') {
        const min = data.minAmount || 0;
        const max = data.maxAmount || 0;
        amount = Math.floor(Math.random() * (max - min + 1)) + min;
      }

      const batch = writeBatch(db);

      // Update user wallet
      const userRef = doc(db, 'users', auth.currentUser.uid);
      batch.update(userRef, {
        'balances.gift': increment(amount)
      });

      // Add to transaction history
      const txRef = doc(collection(db, 'users', auth.currentUser.uid, 'transactions'));
      batch.set(txRef, {
        type: 'gift_claim',
        amount: amount,
        wallet: 'gift',
        description: `Claimed Gift Code: ${code.trim().toUpperCase()}`,
        status: 'approved',
        createdAt: serverTimestamp()
      });

      // Update gift code status
      const isExhausted = data.maxUses > 0 && usedBy.length + 1 >= data.maxUses;
      batch.update(codeRef, {
        usedBy: arrayUnion(auth.currentUser.uid),
        status: isExhausted ? 'exhausted' : 'active'
      });

      await batch.commit();

      setShowCelebration(true);

      toast.success(`You received ৳${amount} from the gift code!`);
      setCode('');
      await refreshProfile();

    } catch (error) {
      console.error("Error claiming code:", error);
      toast.error('Failed to claim gift code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6 px-4 pb-24">
      <Celebration isVisible={showCelebration} onComplete={() => setShowCelebration(false)} />
      <h2 className="text-2xl font-display font-black mb-6 tracking-tight text-slate-800 dark:text-white text-center">Gift Code</h2>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 max-w-md mx-auto"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4 transform -rotate-6">
            <Gift className="w-8 h-8 text-white transform rotate-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Claim Your Reward</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Enter a valid gift code below to claim your surprise reward!</p>
        </div>

        <form onSubmit={handleClaim} className="space-y-4">
          <div>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE (5-8 CHARS)"
                className="w-full bg-slate-50 border-2 border-slate-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-white rounded-xl px-4 py-4 text-center text-xl font-black tracking-widest focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all uppercase placeholder:font-normal placeholder:text-sm placeholder:tracking-normal"
                maxLength={8}
                disabled={loading}
              />
              <Sparkles className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || code.trim().length < 5}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : 'Claim Reward'}
          </button>
        </form>
        
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
           <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">How it works</h4>
           <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-disc pl-4">
              <li>Enter a 5-8 character promotional code.</li>
              <li>Rewards can be fixed or random amounts.</li>
              <li>Funds will be added to your Gift Wallet.</li>
              <li>Each code can only be used once per user.</li>
           </ul>
        </div>
      </motion.div>
    </div>
  );
}
