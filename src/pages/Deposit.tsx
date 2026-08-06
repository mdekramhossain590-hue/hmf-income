import React, { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export function Deposit() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) < 10) {
      toast.error('Minimum deposit amount is ৳10');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/uddoktapay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), uid: profile?.uid, name: profile?.fullName || "User", email: profile?.email || "user@example.com" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment gateway error');

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
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
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">
          Add money to your main balance using UddoktaPay. You can use this balance to buy drive offers or perform mobile recharges.
        </p>

        <form onSubmit={handleDeposit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Amount (৳)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (Min 10)"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-base text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
                Pay with UddoktaPay
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
