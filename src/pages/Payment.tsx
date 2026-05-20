import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useLanguage } from '../components/LanguageProvider';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { ShieldCheck, ArrowRight, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export function Payment() {
  const { profile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState({ mode: 'free', fee: 50 });
  const [depositSettings, setDepositSettings] = useState({ bkashNumber: '', nagadNumber: '' });
  
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentTrx, setPaymentTrx] = useState('');
  const [paymentAccount, setPaymentAccount] = useState('');

  useEffect(() => {
    if (profile?.isActive) {
      navigate('/');
      return;
    }

    const fetchConfig = async () => {
      try {
        const actSnap = await getDoc(doc(db, 'settings', 'activation'));
        if (actSnap.exists()) {
          setSettings(actSnap.data() as any);
        }
        
        const depSnap = await getDoc(doc(db, 'settings', 'deposit'));
        if (depSnap.exists()) {
          setDepositSettings(depSnap.data() as any);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfig();
  }, [profile, navigate]);

  const handleFreeActivation = async () => {
    if (!auth.currentUser) return;
    if (settings.mode !== 'free') {
      toast.error("Free activation is currently disabled.");
      return;
    }
    setSubmitting(true);
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'users', auth.currentUser.uid), { isActive: true });
      await batch.commit();
      await refreshProfile();
      toast.success("Account activated automatically!");
      navigate('/');
    } catch (e) {
      toast.error("Failed to activate.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (!paymentMethod || !paymentAccount || !paymentTrx) {
      toast.error('Please fill all fields');
      return;
    }

    setSubmitting(true);
    try {
      const batch = writeBatch(db);
      
      const newTransactionRef = doc(collection(db, "users", auth.currentUser.uid, "transactions"));
      batch.set(newTransactionRef, {
        amount: Number(settings.fee) || 0,
        type: 'activation',
        status: 'pending',
        method: paymentMethod,
        trxId: paymentTrx,
        account: paymentAccount,
        createdAt: serverTimestamp()
      });

      const paymentRequestRef = doc(collection(db, "payment_requests"));
      batch.set(paymentRequestRef, {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || 'user@example.com',
        transactionId: newTransactionRef.id,
        amount: Number(settings.fee) || 0,
        type: 'activation',
        status: 'pending',
        method: paymentMethod,
        trxId: paymentTrx,
        account: paymentAccount,
        createdAt: serverTimestamp()
      });
      
      await batch.commit();
      toast.success('Activation payment submitted. Please wait for approval.');
      navigate('/');
    } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, `payment_requests`);
       toast.error("Error submitting payment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="pt-6 px-4 pb-20 max-w-lg mx-auto">
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
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4 rounded-2xl mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Activation Fee</p>
                <div className="text-3xl font-black text-gray-900 dark:text-white">৳{settings.fee}</div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 p-4 rounded-xl mb-6 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-300">Send money directly to this number via {paymentMethod || 'bKash/Nagad'}:</p>
              <h3 className="text-xl font-bold text-[#0D47A1] dark:text-blue-400 tracking-wider my-2">
                 {paymentMethod === 'bKash' ? depositSettings.bkashNumber : paymentMethod === 'Nagad' ? depositSettings.nagadNumber : 'Select a method below'}
              </h3>
              <p className="text-[10px] text-red-500 font-medium">Use SEND MONEY option only</p>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Payment Method</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 dark:bg-slate-700 dark:border-slate-600 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value="">Select Method</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Your Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. 01700000000" 
                  required 
                  value={paymentAccount}
                  onChange={(e) => setPaymentAccount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 dark:bg-slate-700 dark:border-slate-600 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Transaction ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. 8G9A7B6C" 
                  required 
                  value={paymentTrx}
                  onChange={(e) => setPaymentTrx(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 dark:bg-slate-700 dark:border-slate-600 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg mt-2 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Activation Payment'}
                {!submitting && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
