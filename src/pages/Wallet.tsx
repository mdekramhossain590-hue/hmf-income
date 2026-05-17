import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useLanguage } from '../components/LanguageProvider';
import { useSearchParams } from 'react-router-dom';
import { History, ArrowUpRight, ArrowDownLeft, Copy } from 'lucide-react';
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

  const [withdrawSettings, setWithdrawSettings] = useState({ mainMin: 50, mainFee: 0, bonusMin: 50, bonusFee: 0, referralMin: 50, referralFee: 0, tasksMin: 50, tasksFee: 0 });
  const [depositSettings, setDepositSettings] = useState({ bkashNumber: '017XX-XXXXXX', nagadNumber: '017XX-XXXXXX', minDeposit: 100, maxDeposit: 25000 });

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
          tasksFee: data.tasksFee || 0
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
          maxDeposit: data.maxDeposit !== undefined ? data.maxDeposit : 25000
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
    
    if (!depositMethod || !depositTrx) {
      toast.error('Please fill all fields');
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
        createdAt: serverTimestamp()
      });
      
      await batch.commit();
      toast.success(t('deposit_submitted') || 'Deposit submitted');
      (e.target as HTMLFormElement).reset();
      setDepositAmount('');
      setDepositMethod('');
      setDepositTrx('');
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
      
      <div className="flex overflow-x-auto gap-4 pb-4 mb-2 no-scrollbar px-1">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-5 text-white shadow-lg min-w-[160px] text-center flex-shrink-0 relative overflow-hidden border border-indigo-400/30">
           <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 blur-xl rounded-full pointer-events-none"></div>
           <p className="text-xs font-semibold opacity-80 mb-1 uppercase tracking-wider">Main Wallet</p>
           <h3 className="text-3xl font-display font-black tracking-tight">৳ {profile?.balances?.main?.toFixed(2) || '0.00'}</h3>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg min-w-[160px] text-center flex-shrink-0 relative overflow-hidden border border-emerald-400/30">
           <div className="absolute top-0 left-0 w-24 h-24 bg-white opacity-10 blur-xl rounded-full pointer-events-none"></div>
           <p className="text-xs font-semibold opacity-80 mb-1 uppercase tracking-wider">Bonus</p>
           <h3 className="text-3xl font-display font-black tracking-tight">৳ {profile?.balances?.bonus?.toFixed(2) || '0.00'}</h3>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-5 text-white shadow-lg min-w-[160px] text-center flex-shrink-0 relative overflow-hidden border border-purple-400/30">
           <div className="absolute bottom-0 right-0 w-24 h-24 bg-white opacity-10 blur-xl rounded-full pointer-events-none"></div>
           <p className="text-xs font-semibold opacity-80 mb-1 uppercase tracking-wider">Referral</p>
           <h3 className="text-3xl font-display font-black tracking-tight">৳ {profile?.balances?.referral?.toFixed(2) || '0.00'}</h3>
        </div>
        {['Facebook', 'Gmail', 'Instagram', 'Sell Accounts', 'Microjob', 'Typing', 'Watch Ads', 'Other'].map((taskName) => {
          const balance = profile?.balances?.tasks?.[taskName] || 0;
          return (
            <div key={taskName} className="bg-slate-800 dark:bg-slate-800 rounded-2xl p-5 text-white shadow-lg min-w-[160px] text-center flex-shrink-0 relative overflow-hidden border border-slate-700">
               <p className="text-xs font-semibold opacity-80 mb-1 leading-tight uppercase tracking-wider text-slate-400">{taskName}</p>
               <h3 className="text-2xl font-display font-black tracking-tight text-white">৳ {balance.toFixed(2)}</h3>
            </div>
          );
        })}
      </div>
      
      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl mb-6 ring-1 ring-slate-200 dark:ring-slate-800">
        <button 
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-all duration-200 ${activeTab === 'deposit' ? 'bg-white shadow-sm text-indigo-600 dark:bg-slate-800 dark:text-indigo-400' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <ArrowDownLeft className="w-4 h-4" /> {t('deposit')}
        </button>
        <button 
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-all duration-200 ${activeTab === 'withdraw' ? 'bg-white shadow-sm text-indigo-600 dark:bg-slate-800 dark:text-indigo-400' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <ArrowUpRight className="w-4 h-4" /> {t('withdraw')}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-all duration-200 ${activeTab === 'history' ? 'bg-white shadow-sm text-indigo-600 dark:bg-slate-800 dark:text-indigo-400' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <History className="w-4 h-4" /> History
        </button>
      </div>

      {/* Deposit Form */}
      {activeTab === 'deposit' && (
        <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-gray-100 dark:bg-slate-800/80 dark:border-slate-700">
          <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 p-4 rounded-xl mb-4 flex flex-col items-center">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('our_number')}</p>
            <div className="flex items-center gap-3">
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
                  className="p-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors dark:bg-blue-800/40 dark:text-blue-300 dark:hover:bg-blue-800/60 active:scale-95"
                  title="Copy Number"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-red-500 dark:text-red-400 font-medium mt-1">{t('send_money_only')}</p>
          </div>
          <form onSubmit={handleDeposit} className="space-y-3">
            <select 
              value={depositMethod}
              onChange={(e) => setDepositMethod(e.target.value)}
              className="w-full bg-white border border-gray-200 dark:bg-slate-700 dark:border-slate-600 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6]"
            >
              <option value="">{t('select_method') || 'Select Method'}</option>
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
            </select>
            <input 
              type="number" 
              placeholder={`${t('amount')} (${depositSettings.minDeposit}-${depositSettings.maxDeposit})`} 
              required 
              min={depositSettings.minDeposit}
              max={depositSettings.maxDeposit}
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full bg-white border border-gray-200 dark:bg-slate-700 dark:border-slate-600 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6]"
            />
            <input 
              type="text" 
              placeholder={t('trx_id') || 'TrxID'} 
              required 
              value={depositTrx}
              onChange={(e) => setDepositTrx(e.target.value)}
              className="w-full bg-white border border-gray-200 dark:bg-slate-700 dark:border-slate-600 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6]"
            />
            <button type="submit" className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-md mt-2 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition active:scale-[0.98]">
              {t('submit_deposit')}
            </button>
          </form>
        </div>
      )}

      {/* Withdraw Form */}
      {activeTab === 'withdraw' && (
        <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-gray-100 dark:bg-slate-800/80 dark:border-slate-700">
          <form onSubmit={handleWithdraw} className="space-y-3">
            <select 
              value={selectedWallet} 
              onChange={e => setSelectedWallet(e.target.value)}
              className="w-full bg-white border border-gray-200 dark:bg-slate-700 dark:border-slate-600 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6] font-bold"
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
            <select 
              value={withdrawMethod}
              onChange={(e) => setWithdrawMethod(e.target.value)}
              className="w-full bg-white border border-gray-200 dark:bg-slate-700 dark:border-slate-600 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6]"
            >
              <option value="">{t('select_method') || 'Select Method'}</option>
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
            </select>
            <input 
              type="text" 
              placeholder={t('account_number') || 'Account Number'} 
              required 
              value={withdrawAccount}
              onChange={(e) => setWithdrawAccount(e.target.value)}
              className="w-full bg-white border border-gray-200 dark:bg-slate-700 dark:border-slate-600 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6]"
            />
            <input 
              type="number" 
              placeholder={t('amount') || 'Amount'} 
              required 
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full bg-white border border-gray-200 dark:bg-slate-700 dark:border-slate-600 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6]"
            />
            <button type="submit" className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-md mt-2 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition active:scale-[0.98]">
              {t('request_withdraw')}
            </button>
          </form>
        </div>
      )}

      {/* History & Chart Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="text-sm font-display font-bold text-gray-700 dark:text-gray-300 mb-4">Balance Timeline</h3>
            {barChartData.length > 0 ? (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                      cursor={{ fill: 'transparent' }}
                    />
                    <ReferenceLine y={0} stroke="#cbd5e1" />
                    <Bar dataKey="Deposit" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Withdrawal" fill="#ef4444" radius={[0, 0, 4, 4]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-gray-400 text-sm">
                No activity yet.
              </div>
            )}
          </div>

          <div className="space-y-3 mt-4">
            {transactions.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">No transactions found.</div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                      tx.type === 'withdraw' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {tx.type === 'withdraw' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 dark:text-white capitalize">{tx.type}</h4>
                      <p className="text-xs text-gray-500">{tx.createdAt?.toDate().toLocaleString() || 'Pending'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${
                      tx.type === 'withdraw' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {tx.type === 'withdraw' ? '-' : '+'}৳{tx.amount?.toFixed(2)}
                    </p>
                    {tx.status === 'pending' && <p className="text-[10px] text-orange-500 font-bold uppercase mt-1">Pending</p>}
                    {tx.status === 'approved' && <p className="text-[10px] text-green-500 font-bold uppercase mt-1">Approved</p>}
                    {tx.status === 'rejected' && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">Rejected</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
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
