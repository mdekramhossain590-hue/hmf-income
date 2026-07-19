import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Smartphone, ArrowLeft, Send, Wallet } from 'lucide-react';
import { collection, doc, writeBatch, increment, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { getCachedDoc } from '../lib/cache';
import toast from 'react-hot-toast';

export function Recharge() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedWallet, setSelectedWallet] = useState('main');
  const [mobileNumber, setMobileNumber] = useState('');
  const [operator, setOperator] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const [withdrawSettings, setWithdrawSettings] = useState({ mainMin: 20, mainFee: 0, bonusMin: 20, bonusFee: 0, referralMin: 20, referralFee: 0, tasksMin: 20, tasksFee: 0 });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnapshot = await getCachedDoc(doc(db, "settings", "withdraw"));
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setWithdrawSettings({
            mainMin: data.mainMin || 20,
            mainFee: data.mainFee || 0,
            bonusMin: data.bonusMin || 20,
            bonusFee: data.bonusFee || 0,
            referralMin: data.referralMin || 20,
            referralFee: data.referralFee || 0,
            tasksMin: data.tasksMin || 20,
            tasksFee: data.tasksFee || 0
          });
        }
      } catch(e) {}
    };
    fetchSettings();
  }, []);

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || loading) return;
    
    let currentBal = 0;
    if (selectedWallet === 'main') currentBal = profile?.balances?.main || 0;
    else if (selectedWallet === 'bonus') currentBal = profile?.balances?.bonus || 0;
    else if (selectedWallet === 'referral') currentBal = profile?.balances?.referral || 0;
    else currentBal = profile?.balances?.tasks?.[selectedWallet] || 0;

    const rechargeAmount = parseFloat(amount);
    
    if (isNaN(rechargeAmount) || rechargeAmount < 20) {
      toast.error('Minimum recharge amount is ৳20');
      return;
    }
    
    if (!mobileNumber || mobileNumber.length < 11) {
      toast.error('Please enter a valid 11-digit mobile number');
      return;
    }

    if (!operator) {
      toast.error('Please select an operator');
      return;
    }
    
    if (rechargeAmount > currentBal) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);

    try {
      const batch = writeBatch(db);
      const userRef = doc(db, "users", auth.currentUser.uid);
      
      const updateData: any = {};
      if (selectedWallet === 'main') updateData["balances.main"] = increment(-rechargeAmount);
      else if (selectedWallet === 'bonus') updateData["balances.bonus"] = increment(-rechargeAmount);
      else if (selectedWallet === 'referral') updateData["balances.referral"] = increment(-rechargeAmount);
      else updateData[`balances.tasks.${selectedWallet}`] = increment(-rechargeAmount);
      
      batch.update(userRef, updateData);
      
      let feePercent = 0;
      if (selectedWallet === 'main') feePercent = withdrawSettings.mainFee;
      else if (selectedWallet === 'bonus') feePercent = withdrawSettings.bonusFee;
      else if (selectedWallet === 'referral') feePercent = withdrawSettings.referralFee;
      else feePercent = withdrawSettings.tasksFee;

      const fee = (rechargeAmount * feePercent) / 100;
      const netAmount = rechargeAmount - fee;

      const newTransactionRef = doc(collection(db, "users", auth.currentUser.uid, "transactions"));
      batch.set(newTransactionRef, {
        amount: rechargeAmount,
        fee: fee,
        netAmount: netAmount,
        type: 'withdraw',
        status: 'pending',
        wallet: selectedWallet,
        method: 'Mobile Recharge',
        account: `${operator} - ${mobileNumber}`,
        createdAt: serverTimestamp()
      });

      const paymentRequestRef = doc(collection(db, "payment_requests"));
      batch.set(paymentRequestRef, {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        transactionId: newTransactionRef.id,
        amount: rechargeAmount,
        fee: fee,
        netAmount: netAmount,
        type: 'withdraw',
        status: 'pending',
        wallet: selectedWallet,
        method: 'Mobile Recharge',
        account: `${operator} - ${mobileNumber}`,
        createdAt: serverTimestamp()
      });
      
      await batch.commit();
      await refreshProfile();
      toast.success('Mobile Recharge requested successfully!');
      navigate('/wallet?tab=history');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser?.uid}`);
      toast.error("Error processing recharge.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6 px-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-white" />
        </button>
        <h2 className="text-xl font-display font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-500" />
          Mobile Recharge
        </h2>
        <div className="w-9"></div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700">
        <div className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500 mb-3 shadow-inner">
            <Smartphone className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-center">Fast Recharge</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">Recharge directly to your mobile using wallet balance</p>
        </div>

        <form onSubmit={handleRecharge} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 mb-1.5">Paying From</label>
            <div className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3.5 text-sm font-medium flex justify-between items-center opacity-80">
              <span className="flex items-center gap-2"><Wallet className="w-4 h-4 text-slate-400" /> Add Money Wallet</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">৳{profile?.balances?.main?.toFixed(2) || '0.00'}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 pl-1 italic">Only Add Money balance can be used for mobile recharge.</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 mb-1.5">Mobile Operator</label>
            <div className="grid grid-cols-2 gap-2">
              {['Grameenphone', 'Robi', 'Airtel', 'Banglalink', 'Teletalk'].map((op) => (
                <div 
                  key={op} 
                  onClick={() => setOperator(op)}
                  className={`border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    operator === op 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-500 dark:text-emerald-400 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-xs font-bold whitespace-nowrap">{op}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 mb-1.5">Mobile Number</label>
            <input 
              type="tel" 
              placeholder="e.g. 017XXXXXXXX" 
              required 
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 mb-1.5">Amount (৳)</label>
            <input 
              type="number" 
              placeholder="Minimum ৳20" 
              required 
              min="20"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-display font-medium text-lg"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg mt-6 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Recharge Now
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
