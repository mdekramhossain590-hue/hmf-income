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
        <button onClick={() => navigate(-1)} className="p-3 bg-[#151515] rounded-2xl shadow-sm border border-[#3D3215] hover:scale-105 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-2xl font-display font-black tracking-tight text-white flex items-center gap-2">
          <Wallet className="w-6 h-6 text-[#FACC15]" />
          Deposit
        </h2>
        <div className="w-12"></div>
      </div>

      <div className="bg-[#151515] rounded-3xl p-6 shadow-2xl shadow-black/60 border border-[#3D3215] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A017]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FACC15]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10">
            <h3 className="text-sm font-bold text-[#A3A3A3] mb-4 uppercase tracking-widest flex items-center gap-2">
                1. Select Payment Method
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
            {depositSettings.bkashEnabled && (
                <button
                type="button"
                onClick={() => setMethod('bKash')}
                className={`group py-4 px-3 rounded-2xl flex flex-col items-center justify-center gap-3 border-2 transition-all duration-300 ${method === 'bKash' ? 'border-[#E2136E] bg-[#E2136E]/10 scale-105' : 'bg-[#101010] border-[#3D3215] hover:bg-[#1C1C1C]'}`}
                >
                <div className="p-2 bg-[#1C1C1C] border border-[#3D3215] rounded-xl shadow-sm">
                    <img src="https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png" alt="bKash" className="h-8 w-8 object-contain" />
                </div>
                <span className={`text-sm font-bold tracking-wide ${method === 'bKash' ? 'text-[#E2136E]' : 'text-[#A3A3A3]'}`}>bKash</span>
                </button>
            )}
            {depositSettings.nagadEnabled && (
                <button
                type="button"
                onClick={() => setMethod('Nagad')}
                className={`group py-4 px-3 rounded-2xl flex flex-col items-center justify-center gap-3 border-2 transition-all duration-300 ${method === 'Nagad' ? 'border-[#F7931E] bg-[#F7931E]/10 scale-105' : 'bg-[#101010] border-[#3D3215] hover:bg-[#1C1C1C]'}`}
                >
                <div className="p-2 bg-[#1C1C1C] border border-[#3D3215] rounded-xl shadow-sm">
                    <img src="https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png" alt="Nagad" className="h-8 w-8 object-contain" />
                </div>
                <span className={`text-sm font-bold tracking-wide ${method === 'Nagad' ? 'text-[#F7931E]' : 'text-[#A3A3A3]'}`}>Nagad</span>
                </button>
            )}
            </div>

            <h3 className="text-sm font-bold text-[#A3A3A3] mb-4 uppercase tracking-widest flex items-center gap-2">
                2. Send Money
            </h3>

            <div className="bg-[#101010] rounded-2xl p-5 mb-8 border border-[#3D3215] shadow-inner">
                <div className="flex flex-col items-center justify-center gap-1 mb-4">
                    <span className="text-[11px] text-[#FACC15] font-bold uppercase tracking-widest bg-[#D4A017]/10 border border-[#3D3215] px-3 py-1 rounded-full">Official {method} Number</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <span className="text-3xl sm:text-4xl font-black tracking-tight text-[#FACC15] font-mono">
                    {getActiveNumber()}
                    </span>
                    <button 
                    onClick={() => handleCopy(getActiveNumber())}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${copiedNumber === getActiveNumber() ? 'bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] shadow-lg shadow-[#D4A017]/25' : 'bg-[#1C1C1C] text-[#A3A3A3] hover:text-white shadow-sm border border-[#3D3215]'}`}
                    >
                    {copiedNumber === getActiveNumber() ? (
                        <><CheckCircle2 className="w-4 h-4" /> Copied!</>
                    ) : (
                        <><Copy className="w-4 h-4 text-[#D4A017]" /> Copy</>
                    )}
                    </button>
                </div>
                <div className="mt-4 flex items-start gap-2 bg-[#1C1C1C] border border-[#3D3215] p-3 rounded-xl">
                    <Info className="w-4 h-4 text-[#FACC15] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#A3A3A3] font-medium leading-relaxed">
                        Send <span className="font-bold text-[#FFE082]">Send Money</span> (not Cash Out) to this number. After sending, copy the Transaction ID (TrxID) and enter it below.
                    </p>
                </div>
            </div>

            <h3 className="text-sm font-bold text-[#A3A3A3] mb-4 uppercase tracking-widest flex items-center gap-2">
                3. Submit Details
            </h3>

            <form onSubmit={handleDeposit} className="space-y-5">
            <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#A3A3A3] uppercase tracking-wider pl-1">Amount Sent (৳)</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFE082] font-bold">৳</span>
                    <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`${depositSettings.minDeposit} - ${depositSettings.maxDeposit}`}
                    className="w-full bg-[#101010] border border-[#3D3215] rounded-2xl pl-10 pr-4 py-4 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 focus:border-[#D4A017] transition-all placeholder:font-normal placeholder:text-[#737373]"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#A3A3A3] uppercase tracking-wider pl-1">Your Sender Number</label>
                <input
                type="text"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                placeholder="e.g. 01712345678"
                className="w-full bg-[#101010] border border-[#3D3215] rounded-2xl px-4 py-4 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 focus:border-[#D4A017] transition-all placeholder:font-normal placeholder:text-[#737373]"
                />
            </div>

            <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#A3A3A3] uppercase tracking-wider pl-1">Transaction ID (TrxID)</label>
                <input
                type="text"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                placeholder="e.g. 9ABCDEFGHJ"
                className="w-full bg-[#101010] border border-[#3D3215] rounded-2xl px-4 py-4 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 focus:border-[#D4A017] transition-all uppercase placeholder:font-normal placeholder:text-[#737373] placeholder:normal-case"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden group bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] font-black py-4 px-6 rounded-2xl text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-[#D4A017]/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-8"
            >
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
