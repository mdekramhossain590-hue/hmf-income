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
      } catch (error) {
        console.error(error);
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
    } catch (error) {
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
        amount: settings.fee,
        method,
        type: 'activation',
        status: 'pending',
        trxId,
        account: senderNumber,
        createdAt: serverTimestamp()
      });
      
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
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 pb-20 max-w-lg mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Activation</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">To unlock all features, please activate your account.</p>
        </div>

        {settings.mode === 'free' ? (
          <div className="text-center">
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-xl mb-6">
              <span className="block font-bold">Good news!</span>
              Registration is currently free.
            </div>
            <button
              onClick={handleFreeActivation}
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl disabled:opacity-50"
            >
               {submitting ? 'Activating...' : 'Activate Now for Free'}
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-6 rounded-2xl mb-6 text-center">
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-2">Activation Fee</p>
              <div className="text-4xl font-black text-gray-900 dark:text-white">৳{settings.fee}</div>
            </div>
            
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

            <form onSubmit={handlePayment} className="space-y-4">
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
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg mt-2 transition flex items-center justify-center gap-2 disabled:opacity-50"
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
