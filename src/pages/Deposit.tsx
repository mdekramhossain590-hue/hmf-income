import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, ShieldCheck, Copy, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { getCachedDoc } from '../lib/cache';

export function Deposit() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bKash');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState('');
  
  const [depositSettings, setDepositSettings] = useState({
     bkashNumber: '017XX-XXXXXX',
     nagadNumber: '017XX-XXXXXX',
     minDeposit: 100,
     maxDeposit: 25000,
     bkashEnabled: true,
     nagadEnabled: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getCachedDoc(doc(db, "settings", "deposit"));
        if (snap.exists()) {
          const data = snap.data();
          setDepositSettings({
            bkashNumber: data.bkashNumber || '017XX-XXXXXX',
            nagadNumber: data.nagadNumber || '017XX-XXXXXX',
            minDeposit: data.minDeposit || 100,
            maxDeposit: data.maxDeposit || 25000,
            bkashEnabled: data.bkashEnabled !== false,
            nagadEnabled: data.nagadEnabled !== false
          });
          if (data.bkashEnabled !== false) setMethod('bKash');
          else if (data.nagadEnabled !== false) setMethod('Nagad');
        }
      } catch (err: any) {
        console.error(err?.message || "Unknown Error");
      }
    };
    fetchSettings();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(text);
    toast.success('Number copied to clipboard!');
    setTimeout(() => setCopiedNumber(''), 2000);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;

    if (!amount || isNaN(Number(amount)) || Number(amount) < depositSettings.minDeposit) {
      toast.error(`Minimum deposit amount is ৳${depositSettings.minDeposit}`);
      return;
    }

    if (!senderNumber || senderNumber.length < 11) {
      toast.error('Please enter a valid sender number');
      return;
    }

    if (!trxId || trxId.length < 4) {
      toast.error('Please enter a valid transaction ID');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'payment_requests'), {
        userId: profile.uid,
        amount: Number(amount),
        method,
        type: 'deposit',
        status: 'pending',
        trxId,
        wallet: 'main',
        account: senderNumber,
        createdAt: serverTimestamp()
      });
      
      setAmount('');
      setSenderNumber('');
      setTrxId('');
      toast.success('Deposit request submitted! Please wait for admin approval.');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit deposit request');
    } finally {
      setLoading(false);
    }
  };

  const getActiveNumber = () => {
    if (method === 'bKash') return depositSettings.bkashNumber;
    if (method === 'Nagad') return depositSettings.nagadNumber;
    return '';
  };

  return (
    <div className="pt-6 px-4 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/50 backdrop-blur-xl dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-white" />
        </button>
        <h2 className="text-2xl font-display font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
          <Wallet className="w-6 h-6 text-indigo-500" />
          Deposit
        </h2>
        <div className="w-12"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-2xl dark:bg-slate-800/80 rounded-3xl p-6 shadow-2xl shadow-indigo-500/5 border border-white/50 dark:border-slate-700 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-widest flex items-center gap-2">
                1. Select Payment Method
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
            {depositSettings.bkashEnabled && (
                <button
                type="button"
                onClick={() => setMethod('bKash')}
                className={`group py-4 px-3 rounded-2xl flex flex-col items-center justify-center gap-3 border-2 transition-all duration-300 ${method === 'bKash' ? 'border-[#E2136E] bg-[#E2136E]/10 scale-105' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                    <img src="https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png" alt="bKash" className="h-8 w-8 object-contain" />
                </div>
                <span className={`text-sm font-bold tracking-wide ${method === 'bKash' ? 'text-[#E2136E]' : 'text-slate-700 dark:text-slate-300'}`}>bKash</span>
                </button>
            )}
            {depositSettings.nagadEnabled && (
                <button
                type="button"
                onClick={() => setMethod('Nagad')}
                className={`group py-4 px-3 rounded-2xl flex flex-col items-center justify-center gap-3 border-2 transition-all duration-300 ${method === 'Nagad' ? 'border-[#F7931E] bg-[#F7931E]/10 scale-105' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                    <img src="https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png" alt="Nagad" className="h-8 w-8 object-contain" />
                </div>
                <span className={`text-sm font-bold tracking-wide ${method === 'Nagad' ? 'text-[#F7931E]' : 'text-slate-700 dark:text-slate-300'}`}>Nagad</span>
                </button>
            )}
            </div>

            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-widest flex items-center gap-2">
                2. Send Money
            </h3>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-indigo-950/30 rounded-2xl p-5 mb-8 border border-indigo-100/50 dark:border-indigo-500/20 shadow-inner">
                <div className="flex flex-col items-center justify-center gap-1 mb-4">
                    <span className="text-[11px] text-indigo-600/80 dark:text-indigo-400 font-bold uppercase tracking-widest bg-indigo-100/50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">Official {method} Number</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-800 dark:text-white font-mono">
                    {getActiveNumber()}
                    </span>
                    <button 
                    onClick={() => handleCopy(getActiveNumber())}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${copiedNumber === getActiveNumber() ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700'}`}
                    >
                    {copiedNumber === getActiveNumber() ? (
                        <><CheckCircle2 className="w-4 h-4" /> Copied!</>
                    ) : (
                        <><Copy className="w-4 h-4" /> Copy</>
                    )}
                    </button>
                </div>
                <div className="mt-4 flex items-start gap-2 bg-indigo-500/10 p-3 rounded-xl">
                    <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium leading-relaxed">
                        Send <span className="font-bold">Send Money</span> (not Cash Out) to this number. After sending, copy the Transaction ID (TrxID) and enter it below.
                    </p>
                </div>
            </div>

            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-widest flex items-center gap-2">
                3. Submit Details
            </h3>

            <form onSubmit={handleDeposit} className="space-y-5">
            <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">Amount Sent (৳)</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                    <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`${depositSettings.minDeposit} - ${depositSettings.maxDeposit}`}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-4 text-lg font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:font-normal placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">Your Sender Number</label>
                <input
                type="text"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                placeholder="e.g. 01712345678"
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-base font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:font-normal placeholder:text-slate-400"
                />
            </div>

            <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">Transaction ID (TrxID)</label>
                <input
                type="text"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                placeholder="e.g. 9ABCDEFGHJ"
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-base font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all uppercase placeholder:font-normal placeholder:text-slate-400 placeholder:normal-case"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden group bg-slate-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-black py-4 px-6 rounded-2xl text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-8"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-2">
                    {loading ? 'Processing...' : (
                    <>
                        Submit Deposit <ArrowRight className="w-4 h-4" />
                    </>
                    )}
                </span>
            </button>
            </form>
        </div>
      </div>
    </div>
  );
}
