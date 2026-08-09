import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';
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
      } catch (err) {
        console.error(err);
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
        account: senderNumber,
        createdAt: serverTimestamp()
      });
      
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
    <div className="pt-6 px-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white dark:bg-slate-800 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-white" />
        </button>
        <h2 className="text-xl font-display font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-indigo-500" />
          Add Funds
        </h2>
        <div className="w-10"></div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700">
        <div className="flex gap-4 mb-6">
          {depositSettings.bkashEnabled && (
            <button
              type="button"
              onClick={() => setMethod('bKash')}
              className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${method === 'bKash' ? 'border-[#E2136E] bg-[#E2136E]/10 scale-105' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              <img src="https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png" alt="bKash" className="h-8 object-contain" />
              <span className="text-xs font-bold dark:text-white">bKash</span>
            </button>
          )}
          {depositSettings.nagadEnabled && (
            <button
              type="button"
              onClick={() => setMethod('Nagad')}
              className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${method === 'Nagad' ? 'border-[#F7931E] bg-[#F7931E]/10 scale-105' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              <img src="https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png" alt="Nagad" className="h-8 object-contain" />
              <span className="text-xs font-bold dark:text-white">Nagad</span>
            </button>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 mb-6 text-center border border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">Send Money To ({method})</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-black tracking-widest text-slate-800 dark:text-white">
              {getActiveNumber()}
            </span>
            <button 
              onClick={() => handleCopy(getActiveNumber())}
              className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all"
            >
              {copiedNumber === getActiveNumber() ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-slate-400" />}
            </button>
          </div>
        </div>

        <form onSubmit={handleDeposit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Amount (৳)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min ৳${depositSettings.minDeposit}`}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-base text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Sender Number</label>
            <input
              type="text"
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              placeholder="017XX-XXXXXX"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-base text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Transaction ID (TrxID)</label>
            <input
              type="text"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              placeholder="e.g. 8ABCDEFGH"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-base text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 px-4 rounded-xl text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all active:scale-95 mt-4"
          >
            {loading ? 'Processing...' : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Submit Request
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
