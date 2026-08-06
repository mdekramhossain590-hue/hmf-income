import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useLanguage } from '../components/LanguageProvider';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { getCachedDoc } from '../lib/cache';
import { ShieldCheck, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export function Payment() {
  const { profile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState({ mode: 'free', fee: 50 });

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

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/uddoktapay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           amount: settings.fee, 
           uid: auth.currentUser?.uid, 
           name: profile?.fullName || "User", 
           email: profile?.email || "user@example.com",
           type: 'activation'
        })
      });
      
      const text = await res.text();
      let data;
      try {
         data = JSON.parse(text);
      } catch (e) {
         throw new Error("Server did not return a valid API response. Ensure you are running the Node.js backend server.");
      }
      if (!res.ok) throw new Error(data.error || 'Payment gateway error');
      if (data.url) {
        window.open(data.url, "_blank") || (window.location.href = data.url);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to initialize payment');
      setSubmitting(false);
    }
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
            
            <form onSubmit={handlePayment} className="space-y-4">
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg mt-2 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Shield className="w-5 h-5" />
                {submitting ? 'Processing...' : 'Pay with UddoktaPay'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
