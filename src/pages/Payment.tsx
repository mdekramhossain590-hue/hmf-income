import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useLanguage } from '../components/LanguageProvider';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { getCachedDoc } from '../lib/cache';
import { ShieldCheck, Shield, Copy, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function Payment() {
  const { profile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState({ mode: 'free', fee: 50 });
  const [method, setMethod] = useState('bKash');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState('');

  const [depositSettings, setDepositSettings] = useState({ 
    bkashNumber: '017XX-XXXXXX', 
    nagadNumber: '017XX-XXXXXX', 
    bkashEnabled: true, 
    nagadEnabled: true
  });

  useEffect(() => {
    if (profile?.isActive) {
      navigate('/');
      return;
    }

    const fetchConfig = async () => {
      try {
        const actSnap = await getCachedDoc(doc(db, 'settings', 'activation'));
        if (actSnap.exists()) {
          setSettings(actSnap.data() as any);
        }
        
        const depSnap = await getCachedDoc(doc(db, "settings", "deposit"));
        if (depSnap.exists()) {
          const data = depSnap.data();
          setDepositSettings({
            bkashNumber: data.bkashNumber || '017XX-XXXXXX',
            nagadNumber: data.nagadNumber || '017XX-XXXXXX',
            bkashEnabled: data.bkashEnabled !== false,
            nagadEnabled: data.nagadEnabled !== false
          });
          if (data.bkashEnabled !== false) setMethod('bKash');
          else if (data.nagadEnabled !== false) setMethod('Nagad');
        }
      } catch (error: any) {
        console.error(error?.message || "Unknown Error");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [profile, navigate]);

  const handleFreeActivation = async () => {
    if (!auth.currentUser) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        isActive: true,
      });
      await refreshProfile();
      toast.success("Account activated successfully!");
      navigate('/');
    } catch (error: any) {
      toast.error("An error occurred during activation.");
      setSubmitting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(text);
    toast.success('Number copied to clipboard!');
    setTimeout(() => setCopiedNumber(''), 2000);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    if (!senderNumber || senderNumber.length < 11) {
      toast.error('Please enter a valid sender number');
      return;
    }
    if (!trxId || trxId.length < 4) {
      toast.error('Please enter a valid transaction ID');
      return;
    }

    setSubmitting(true);
    
    try {
      await addDoc(collection(db, 'payment_requests'), {
        userId: auth.currentUser.uid,
        amount: Number(settings.fee),
        method,
        type: 'activation',
        status: 'pending',
        trxId,
        wallet: 'main',
        account: senderNumber,
        createdAt: serverTimestamp()
      });
      
      setSenderNumber('');
      setTrxId('');
      toast.success('Activation request submitted! Please wait for admin approval.');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit activation request');
      setSubmitting(false);
    }
  };

  const getActiveNumber = () => {
    if (method === 'bKash') return depositSettings.bkashNumber;
    if (method === 'Nagad') return depositSettings.nagadNumber;
    return '';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-[#3D3215] border-t-[#FACC15] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 pb-20 max-w-lg mx-auto text-white">
      <div className="bg-[#151515] rounded-3xl p-6 shadow-2xl border border-[#3D3215] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A017]/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="text-center mb-6 relative z-10">
          <div className="w-16 h-16 bg-[#101010] border border-[#3D3215] text-[#FACC15] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Account Activation</h2>
          <p className="text-[#A3A3A3] text-sm mt-1">To unlock all features, please activate your account.</p>
        </div>

        {settings.mode === 'free' ? (
          <div className="text-center relative z-10">
            <div className="bg-[#101010] border border-[#3D3215] text-[#FFE082] p-4 rounded-2xl mb-6">
              <span className="block font-bold text-[#FACC15]">Good news!</span>
              Registration is currently free.
            </div>
            <button
              onClick={handleFreeActivation}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] font-black py-4 rounded-xl shadow-lg disabled:opacity-50 active:scale-95 transition-all cursor-pointer"
            >
               {submitting ? 'Activating...' : 'Activate Now for Free'}
            </button>
          </div>
        ) : (
          <div className="relative z-10">
            <div className="bg-[#101010] border border-[#3D3215] p-6 rounded-2xl mb-6 text-center">
              <p className="text-xs text-[#D4A017] font-bold uppercase tracking-widest mb-2">Activation Fee</p>
              <div className="text-4xl font-black text-[#FACC15]">৳{settings.fee}</div>
            </div>
            
            <div className="flex gap-4 mb-6">
              {depositSettings.bkashEnabled && (
                <button
                  type="button"
                  onClick={() => setMethod('bKash')}
                  className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all cursor-pointer ${method === 'bKash' ? 'border-[#E2136E] bg-[#E2136E]/10 scale-105' : 'border-[#3D3215] bg-[#101010] hover:bg-[#1C1C1C]'}`}
                >
                  <img src="https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png" alt="bKash" className="h-8 object-contain" />
                  <span className="text-xs font-bold text-white">bKash</span>
                </button>
              )}
              {depositSettings.nagadEnabled && (
                <button
                  type="button"
                  onClick={() => setMethod('Nagad')}
                  className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all cursor-pointer ${method === 'Nagad' ? 'border-[#F7931E] bg-[#F7931E]/10 scale-105' : 'border-[#3D3215] bg-[#101010] hover:bg-[#1C1C1C]'}`}
                >
                  <img src="https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png" alt="Nagad" className="h-8 object-contain" />
                  <span className="text-xs font-bold text-white">Nagad</span>
                </button>
              )}
            </div>

            <div className="bg-[#101010] rounded-2xl p-4 mb-6 text-center border border-[#3D3215]">
              <p className="text-xs text-[#737373] font-bold uppercase tracking-wider mb-2">Send Money To ({method})</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-black tracking-widest text-[#FACC15] font-mono">
                  {getActiveNumber()}
                </span>
                <button 
                  onClick={() => handleCopy(getActiveNumber())}
                  className="p-2 bg-[#1C1C1C] border border-[#3D3215] rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all text-[#FACC15] cursor-pointer"
                >
                  {copiedNumber === getActiveNumber() ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#A3A3A3] mb-2 uppercase tracking-wider">Sender Number</label>
                <input
                  type="text"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="017XX-XXXXXX"
                  className="w-full bg-[#101010] border border-[#3D3215] rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:ring-2 focus:ring-[#D4A017] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#A3A3A3] mb-2 uppercase tracking-wider">Transaction ID (TrxID)</label>
                <input
                  type="text"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="e.g. 8ABCDEFGH"
                  className="w-full bg-[#101010] border border-[#3D3215] rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:ring-2 focus:ring-[#D4A017] transition-all uppercase"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] font-black py-4 rounded-xl shadow-lg mt-2 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
              >
                <Shield className="w-5 h-5" />
                {submitting ? 'Processing...' : 'Submit Request'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
