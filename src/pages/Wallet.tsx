import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useLanguage } from '../components/LanguageProvider';
import { useSearchParams } from 'react-router-dom';
import { History, ArrowUpRight, ArrowDownLeft, Copy, Wallet as WalletIcon } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, writeBatch, increment, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { BarChart, Bar, ReferenceLine, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export function Wallet() {
  const { profile, refreshProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>(
    (searchParams.get('tab') as 'deposit' | 'withdraw' | 'history') || 'deposit'
  );

  useEffect(() => {
    const tab = searchParams.get('tab') as 'deposit' | 'withdraw' | 'history';
    if (tab && ['deposit', 'withdraw', 'history'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('main');
  const [transactions, setTransactions] = useState<any[]>([]);
  const { t } = useLanguage();

  const [withdrawSettings, setWithdrawSettings] = useState({ mainMin: 50, mainFee: 0, bonusMin: 50, bonusFee: 0, referralMin: 50, referralFee: 0, tasksMin: 50, tasksFee: 0, customAmounts: "110, 210, 310, 410, 510" });
  const [depositSettings, setDepositSettings] = useState({ bkashNumber: '017XX-XXXXXX', nagadNumber: '017XX-XXXXXX', minDeposit: 100, maxDeposit: 25000, bkashEnabled: true, nagadEnabled: true, bkashQrUrl: '', nagadQrUrl: '' });

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(
      collection(db, "users", auth.currentUser.uid, "transactions"),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(historyItems);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}/transactions`);
    });

    const unsubSettings = onSnapshot(doc(db, "settings", "withdraw"), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setWithdrawSettings({
          mainMin: data.mainMin || 50,
          mainFee: data.mainFee || 0,
          bonusMin: data.bonusMin || 50,
          bonusFee: data.bonusFee || 0,
          referralMin: data.referralMin || 50,
          referralFee: data.referralFee || 0,
          tasksMin: data.tasksMin || 50,
          tasksFee: data.tasksFee || 0,
          customAmounts: data.customAmounts || "110, 210, 310, 410, 510"
        });
      }
    });

    const unsubDepositSettings = onSnapshot(doc(db, "settings", "deposit"), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setDepositSettings({
          bkashNumber: data.bkashNumber || '017XX-XXXXXX',
          nagadNumber: data.nagadNumber || '017XX-XXXXXX',
          minDeposit: data.minDeposit !== undefined ? data.minDeposit : 100,
          maxDeposit: data.maxDeposit !== undefined ? data.maxDeposit : 25000,
          bkashEnabled: data.bkashEnabled !== false,
          nagadEnabled: data.nagadEnabled !== false,
          bkashQrUrl: data.bkashQrUrl || '',
          nagadQrUrl: data.nagadQrUrl || ''
        });
      }
    });

    return () => {
      unsubscribe();
      unsubSettings();
      unsubDepositSettings();
    };
  }, []);

  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('');
  const [depositTrx, setDepositTrx] = useState('');
  const [depositAccount, setDepositAccount] = useState('');
  
  const [withdrawMethod, setWithdrawMethod] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [showConfirmWithdraw, setShowConfirmWithdraw] = useState(false);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    const amount = parseFloat(depositAmount);
    
    if (isNaN(amount) || amount < depositSettings.minDeposit || amount > depositSettings.maxDeposit) {
      toast.error(`Deposit must be between ${depositSettings.minDeposit} and ${depositSettings.maxDeposit}`);
      return;
    }
    
    if (!depositMethod || !depositTrx || !depositAccount) {
      toast.error('Please fill all fields, including sender number');
      return;
    }

    try {
      const batch = writeBatch(db);
      
      const newTransactionRef = doc(collection(db, "users", auth.currentUser.uid, "transactions"));
      batch.set(newTransactionRef, {
        amount: amount,
        type: 'deposit',
        status: 'pending',
        method: depositMethod,
        trxId: depositTrx,
        account: depositAccount,
        createdAt: serverTimestamp()
      });

      const paymentRequestRef = doc(collection(db, "payment_requests"));
      batch.set(paymentRequestRef, {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        transactionId: newTransactionRef.id,
        amount: amount,
        type: 'deposit',
        status: 'pending',
        method: depositMethod,
        trxId: depositTrx,
        account: depositAccount,
        createdAt: serverTimestamp()
      });
      
      await batch.commit();
      toast.success(t('deposit_submitted') || 'Deposit submitted');
      (e.target as HTMLFormElement).reset();
      setDepositAmount('');
      setDepositMethod('');
      setDepositTrx('');
      setDepositAccount('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `payment_requests`);
      toast.error("Error processing deposit.");
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    let currentBal = 0;
    if (selectedWallet === 'main') currentBal = profile?.balances?.main || 0;
    else if (selectedWallet === 'bonus') currentBal = profile?.balances?.bonus || 0;
    else if (selectedWallet === 'referral') currentBal = profile?.balances?.referral || 0;
    else currentBal = profile?.balances?.tasks?.[selectedWallet] || 0;

    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error(t('invalid_amount'));
      return;
    }

    let minAmount = 50;
    if (selectedWallet === 'main') minAmount = withdrawSettings.mainMin;
    else if (selectedWallet === 'bonus') minAmount = withdrawSettings.bonusMin;
    else if (selectedWallet === 'referral') minAmount = withdrawSettings.referralMin;
    else minAmount = withdrawSettings.tasksMin;

    if (amount < minAmount) {
      toast.error(`Minimum withdraw amount for ${selectedWallet} is ৳${minAmount}`);
      return;
    }
    
    if (!withdrawMethod || !withdrawAccount) {
      toast.error('Please fill all fields');
      return;
    }
    
    if (amount > currentBal) {
      toast.error(t('insufficient_balance'));
      return;
    }

    setShowConfirmWithdraw(true);
  };

  const executeWithdraw = async () => {
    if (!auth.currentUser) return;
    
    const amount = parseFloat(withdrawAmount);
    
    try {
      const batch = writeBatch(db);
      const userRef = doc(db, "users", auth.currentUser.uid);
      
      const updateData: any = {};
      if (selectedWallet === 'main') updateData["balances.main"] = increment(-amount);
      else if (selectedWallet === 'bonus') updateData["balances.bonus"] = increment(-amount);
      else if (selectedWallet === 'referral') updateData["balances.referral"] = increment(-amount);
      else updateData[`balances.tasks.${selectedWallet}`] = increment(-amount);
      
      batch.update(userRef, updateData);
      
      let feePercent = 0;
      if (selectedWallet === 'main') feePercent = withdrawSettings.mainFee;
      else if (selectedWallet === 'bonus') feePercent = withdrawSettings.bonusFee;
      else if (selectedWallet === 'referral') feePercent = withdrawSettings.referralFee;
      else feePercent = withdrawSettings.tasksFee;

      const fee = (amount * feePercent) / 100;
      const netAmount = amount - fee;

      const newTransactionRef = doc(collection(db, "users", auth.currentUser.uid, "transactions"));
      batch.set(newTransactionRef, {
        amount: amount,
        fee: fee,
        netAmount: netAmount,
        type: 'withdraw',
        status: 'pending',
        wallet: selectedWallet,
        method: withdrawMethod,
        account: withdrawAccount,
        createdAt: serverTimestamp()
      });

      const paymentRequestRef = doc(collection(db, "payment_requests"));
      batch.set(paymentRequestRef, {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        transactionId: newTransactionRef.id,
        amount: amount,
        fee: fee,
        netAmount: netAmount,
        type: 'withdraw',
        status: 'pending',
        wallet: selectedWallet,
        method: withdrawMethod,
        account: withdrawAccount,
        createdAt: serverTimestamp()
      });
      
      await batch.commit();
      await refreshProfile();
      toast.success(t('withdraw_successful') || 'Withdraw requested!');
      setWithdrawAmount('');
      setWithdrawMethod('');
      setWithdrawAccount('');
      setShowConfirmWithdraw(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser?.uid}`);
      toast.error("Error processing withdrawal.");
      setShowConfirmWithdraw(false);
    }
  };

  // Process data for the chart from transactions
  const barChartData = [...transactions].reverse().map((t) => {
    return {
      name: t.createdAt ? t.createdAt.toDate().toLocaleDateString() : 'Now',
      Deposit: t.type !== 'withdraw' ? t.amount : 0,
      Withdrawal: t.type === 'withdraw' ? -t.amount : 0
    };
  });

  return (
    <div className="pt-6 px-4 pb-24">
      <h2 className="text-2xl font-display font-black mb-6 tracking-tight text-slate-800 dark:text-white text-center">{t('wallet')}</h2>
      
      <div className="mb-8">
        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 rounded-[1.5rem] p-6 text-white shadow-xl shadow-indigo-500/20 mb-4 relative overflow-hidden border border-indigo-400/30">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 blur-2xl rounded-full pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400 opacity-20 blur-2xl rounded-full pointer-events-none"></div>
           <p className="text-xs font-semibold opacity-90 mb-1 uppercase tracking-widest text-indigo-100 flex items-center gap-1.5"><WalletIcon className="w-4 h-4" /> Add Money Balance</p>
           <h3 className="text-4xl font-display font-black tracking-tight mt-1">৳ {profile?.balances?.main?.toFixed(2) || '0.00'}</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
           <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[1.25rem] p-4 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden border border-emerald-400/30">
             <div className="absolute top-0 left-0 w-20 h-20 bg-white opacity-10 blur-xl rounded-full pointer-events-none"></div>
             <p className="text-[10px] font-bold opacity-90 mb-1 uppercase tracking-widest text-emerald-50 text-center">Bonus</p>
             <h3 className="text-2xl font-display font-black tracking-tight text-center">৳ {profile?.balances?.bonus?.toFixed(2) || '0.00'}</h3>
           </div>
           <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-[1.25rem] p-4 text-white shadow-lg shadow-purple-500/20 relative overflow-hidden border border-purple-400/30">
             <div className="absolute bottom-0 right-0 w-20 h-20 bg-white opacity-10 blur-xl rounded-full pointer-events-none"></div>
             <p className="text-[10px] font-bold opacity-90 mb-1 uppercase tracking-widest text-purple-50 text-center">Referral</p>
             <h3 className="text-2xl font-display font-black tracking-tight text-center">৳ {profile?.balances?.referral?.toFixed(2) || '0.00'}</h3>
           </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-[1.5rem] p-4 shadow-sm border border-slate-100 dark:border-slate-700">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-3 ml-1 uppercase tracking-widest text-center">Task Earnings</p>
          <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar px-1 items-center">
            {['Facebook', 'Gmail', 'Instagram', 'Sell Accounts', 'Microjob', 'Typing', 'Watch Ads', 'Other'].map((taskName) => {
              const balance = profile?.balances?.tasks?.[taskName] || 0;
              return (
                <div key={taskName} className="bg-slate-50 dark:bg-slate-900/50 rounded-[1rem] p-3 min-w-[110px] text-center flex-shrink-0 relative overflow-hidden border border-slate-200 dark:border-slate-700/50">
                   <p className="text-[9px] font-bold opacity-80 mb-1 leading-tight uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">{taskName}</p>
                   <h3 className="text-base font-display font-black tracking-tight text-slate-800 dark:text-white">৳ {balance.toFixed(2)}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl mb-6 ring-1 ring-slate-200 dark:ring-slate-700/50 backdrop-blur-sm relative z-10 mx-1">
        <button 
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 ${activeTab === 'deposit' ? 'bg-white shadow-md text-indigo-600 dark:bg-slate-700 dark:text-white scale-[1.02]' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <ArrowDownLeft className="w-4 h-4" /> {t('deposit')}
        </button>
        <button 
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 ${activeTab === 'withdraw' ? 'bg-white shadow-md text-indigo-600 dark:bg-slate-700 dark:text-white scale-[1.02]' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <ArrowUpRight className="w-4 h-4" /> {t('withdraw')}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 ${activeTab === 'history' ? 'bg-white shadow-md text-indigo-600 dark:bg-slate-700 dark:text-white scale-[1.02]' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <History className="w-4 h-4" /> History
        </button>
      </div>

      {/* Deposit Form */}
      {activeTab === 'deposit' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white/70 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-slate-100 dark:bg-slate-800/80 dark:border-slate-700"
        >
          <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 p-5 rounded-2xl mb-6 flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 z-10">{t('our_number')}</p>
            <div className="flex items-center gap-3 z-10 bg-white dark:bg-slate-800 py-2 px-4 rounded-xl shadow-sm border border-blue-100 dark:border-slate-700">
              <h3 className="text-xl font-display font-black text-[#0D47A1] dark:text-blue-400 tracking-wider">
                {depositMethod === 'bKash' ? depositSettings.bkashNumber : depositMethod === 'Nagad' ? depositSettings.nagadNumber : 'Select a method first'}
              </h3>
              {(depositMethod === 'bKash' || depositMethod === 'Nagad') && (
                <button
                  type="button"
                  onClick={() => {
                    const num = depositMethod === 'bKash' ? depositSettings.bkashNumber : depositSettings.nagadNumber;
                    navigator.clipboard.writeText(num);
                    toast.success('Number copied!');
                  }}
                  className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors dark:bg-blue-800/40 dark:text-blue-300 dark:hover:bg-blue-800/60 active:scale-95"
                  title="Copy Number"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <p className="text-[10px] text-red-500 dark:text-red-400 font-bold mt-3 z-10 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full">{t('send_money_only')}</p>
          </div>
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 mb-1.5">{t('select_method') || 'Select Method'}</label>
              <select 
                value={depositMethod}
                onChange={(e) => setDepositMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
              >
                <option value="">Choose Method</option>
                {depositSettings.bkashEnabled && <option value="bKash">bKash</option>}
                {depositSettings.nagadEnabled && <option value="Nagad">Nagad</option>}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 mb-1.5">{t('amount')} (৳{depositSettings.minDeposit} - ৳{depositSettings.maxDeposit})</label>
              <input 
                type="number" 
                placeholder={`e.g. 500`} 
                required 
                min={depositSettings.minDeposit}
                max={depositSettings.maxDeposit}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-display font-medium text-lg transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 mb-1.5">{t('trx_id') || 'TrxID'}</label>
              <input 
                type="text" 
                placeholder="Enter Transaction ID" 
                required 
                value={depositTrx}
                onChange={(e) => setDepositTrx(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 mb-1.5">{t('sender_number') || 'Sender Number'}</label>
              <input 
                type="text" 
                placeholder="Number you sent from (e.g. 017...)" 
                required 
                value={depositAccount}
                onChange={(e) => setDepositAccount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono transition-all"
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg mt-4 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition active:scale-[0.98] text-base">
              {t('submit_deposit')}
            </button>
          </form>
        </motion.div>
      )}

      {/* Withdraw Form */}
      {activeTab === 'withdraw' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white/70 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-slate-100 dark:bg-slate-800/80 dark:border-slate-700"
        >
          <div className="bg-indigo-50 border border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 p-5 rounded-2xl mb-6 flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
            <ArrowUpRight className="w-8 h-8 text-indigo-500 mb-2 z-10" />
            <h3 className="font-bold text-slate-800 dark:text-white z-10">Withdraw Funds</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1 z-10">Select wallet and method to withdraw your balance</p>
          </div>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 mb-1.5">From Wallet</label>
              <select 
                value={selectedWallet} 
                onChange={e => setSelectedWallet(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all"
              >
                <option value="main">Main Wallet (৳{profile?.balances?.main?.toFixed(2) || '0.00'})</option>
                <option value="bonus">Bonus (৳{profile?.balances?.bonus?.toFixed(2) || '0.00'})</option>
                <option value="referral">Referral (৳{profile?.balances?.referral?.toFixed(2) || '0.00'})</option>
                {['Facebook', 'Gmail', 'Instagram', 'Sell Accounts', 'Microjob', 'Typing', 'Watch Ads', 'Other'].map((taskName) => {
                  const balance = profile?.balances?.tasks?.[taskName] || 0;
                  return (
                    <option key={taskName} value={taskName}>{taskName} (৳{balance.toFixed(2)})</option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 mb-1.5">{t('select_method') || 'Method'}</label>
              <select 
                value={withdrawMethod}
                onChange={(e) => setWithdrawMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
              >
                <option value="">Choose Method</option>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 mb-1.5">{t('account_number') || 'Account details'}</label>
              <input 
                type="text" 
                placeholder="e.g. 017XXXXXXXX" 
                required 
                value={withdrawAccount}
                onChange={(e) => setWithdrawAccount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 mb-2">উইথড্র পরিমাণ (Withdraw Amount)</label>
              
              {/* Select amount options configured by admin */}
              {(() => {
                const amountOptions = (withdrawSettings.customAmounts || "110, 210, 310, 410, 510")
                  .split(',')
                  .map(s => s.trim())
                  .filter(Boolean);

                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {amountOptions.map((opt) => {
                        const isSelected = withdrawAmount === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setWithdrawAmount(opt)}
                            className={`py-3 px-4 rounded-2xl border text-sm font-black transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-600 text-white font-black shadow-md shadow-indigo-500/10' 
                                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500'
                            }`}
                          >
                            <span className="text-sm font-extrabold">{opt}</span>
                            <span className="text-xs font-normal">৳</span>
                          </button>
                        );
                      })}
                      
                      {/* Custom Amount option button */}
                      <button
                        type="button"
                        onClick={() => {
                          const customInput = prompt("Enter custom amount (৳):");
                          if (customInput && !isNaN(parseFloat(customInput))) {
                            setWithdrawAmount(parseFloat(customInput).toString());
                          }
                        }}
                        className={`py-3 px-4 rounded-2xl border text-xs font-black transition-all duration-205 flex items-center justify-center gap-1 shadow-sm active:scale-95 ${
                          withdrawAmount && !amountOptions.includes(withdrawAmount)
                            ? 'bg-indigo-600 border-indigo-600 text-white font-black shadow-md' 
                            : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-400'
                        }`}
                      >
                        {withdrawAmount && !amountOptions.includes(withdrawAmount) ? (
                          <span className="font-extrabold">{withdrawAmount} ৳</span>
                        ) : (
                          <span>অন্যান্য পরিমাণ</span>
                        )}
                      </button>
                    </div>

                    {/* Green box showing dynamic charging and net payout */}
                    {withdrawAmount && (
                      (() => {
                        const amt = parseFloat(withdrawAmount) || 0;
                        let currentFeePercent = 0;
                        if (selectedWallet === 'main') currentFeePercent = withdrawSettings.mainFee;
                        else if (selectedWallet === 'bonus') currentFeePercent = withdrawSettings.bonusFee;
                        else if (selectedWallet === 'referral') currentFeePercent = withdrawSettings.referralFee;
                        else currentFeePercent = withdrawSettings.tasksFee;

                        const fee = (amt * currentFeePercent) / 100;
                        const netAmount = Math.max(0, amt - fee);

                        return (
                          <div className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-around text-center text-sm font-bold text-emerald-600 dark:text-emerald-400 transition-all duration-300">
                            <div>
                              <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider mb-0.5">চার্জ (Charge)</p>
                              <p className="text-sm font-black text-rose-500 dark:text-rose-400">{fee.toFixed(2)} ৳</p>
                            </div>
                            <div className="w-px h-8 bg-emerald-500/20"></div>
                            <div>
                              <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider mb-0.5">পাবেন (Will Receive)</p>
                              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{netAmount.toFixed(2)} ৳</p>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                );
              })()}
            </div>
            <button type="submit" className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg mt-4 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition active:scale-[0.98] text-base">
              {t('request_withdraw')}
            </button>
          </form>
        </motion.div>
      )}

      {/* History & Chart Tab */}
      {activeTab === 'history' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="space-y-4"
        >
          <div className="bg-white/90 backdrop-blur-md dark:bg-slate-800/90 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-display font-bold text-slate-700 dark:text-slate-300 mb-4 capitalize tracking-wide hidden">Balance Timeline</h3>
            {barChartData.length > 0 ? (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px -2px rgb(0 0 0 / 0.15)', fontSize: '12px', fontWeight: 'bold' }}
                      cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                    />
                    <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3"/>
                    <Bar dataKey="Deposit" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="Withdrawal" fill="#ef4444" radius={[0, 0, 4, 4]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-slate-400 text-sm">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                  <History className="w-5 h-5 opacity-50" />
                </div>
                <p>No activity yet.</p>
              </div>
            )}
          </div>

          <div className="space-y-3 mt-4">
            {transactions.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">No transactions found.</div>
            ) : (
              transactions.map((tx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={tx.id} 
                  className="bg-white/90 backdrop-blur-md dark:bg-slate-800/90 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-2xl shadow-inner ${
                      tx.type === 'withdraw' ? 'bg-rose-50 text-rose-500 dark:bg-rose-900/20 dark:text-rose-400' : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400'
                    }`}>
                      {tx.type === 'withdraw' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white capitalize">{tx.type}</h4>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5 tracking-wide">{tx.createdAt?.toDate().toLocaleDateString() || 'Pending'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-black tracking-tight ${
                      tx.type === 'withdraw' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {tx.type === 'withdraw' ? '-' : '+'}৳{tx.amount?.toFixed(2)}
                    </p>
                    {tx.status === 'pending' && <p className="text-[10px] text-amber-500 font-bold uppercase mt-1 tracking-wider bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full inline-block">Pending</p>}
                    {tx.status === 'approved' && <p className="text-[10px] text-emerald-500 font-bold uppercase mt-1 tracking-wider bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full inline-block">Approved</p>}
                    {tx.status === 'rejected' && <p className="text-[10px] text-rose-500 font-bold uppercase mt-1 tracking-wider bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full inline-block">Rejected</p>}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Confirmation Modal */}
      {showConfirmWithdraw && (() => {
        let currentFeePercent = 0;
        if (selectedWallet === 'main') currentFeePercent = withdrawSettings.mainFee;
        else if (selectedWallet === 'bonus') currentFeePercent = withdrawSettings.bonusFee;
        else if (selectedWallet === 'referral') currentFeePercent = withdrawSettings.referralFee;
        else currentFeePercent = withdrawSettings.tasksFee;
        
        return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Confirm Withdraw</h3>
            <div className="space-y-2 mb-6">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                <strong>Amount:</strong> ৳{parseFloat(withdrawAmount).toFixed(2)}
              </p>
              {currentFeePercent > 0 && (
                <>
                  <p className="text-gray-600 dark:text-gray-300 text-sm text-red-500">
                    <strong>Fee ({currentFeePercent}%):</strong> ৳{((parseFloat(withdrawAmount) * currentFeePercent) / 100).toFixed(2)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-bold text-green-600 dark:text-green-400">
                    <strong>Net Received:</strong> ৳{(parseFloat(withdrawAmount) - (parseFloat(withdrawAmount) * currentFeePercent) / 100).toFixed(2)}
                  </p>
                </>
              )}
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                <strong>Wallet:</strong> {selectedWallet}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                <strong>Method:</strong> {withdrawMethod}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                <strong>Account:</strong> {withdrawAccount}
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmWithdraw(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button 
                onClick={executeWithdraw}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
