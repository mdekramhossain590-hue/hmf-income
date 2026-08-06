import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { doc, getDoc, updateDoc, increment, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

export function PaymentStatus({ status }: { status: 'success' | 'cancel' }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

useEffect(() => {
    let unsubscribe: any;
    
    const processPayment = async () => {
      const id = searchParams.get('id');
      if (!id) {
        setLoading(false);
        return;
      }

      if (status === 'cancel') {
         await updateDoc(doc(db, "payment_requests", id), { status: "cancelled" }).catch(()=>{});
         setLoading(false);
         return;
      }

      try {
        const docRef = doc(db, "payment_requests", id);
        
        // Listen for status changes
        import('firebase/firestore').then(({ onSnapshot }) => {
           unsubscribe = onSnapshot(docRef, (docSnap) => {
             if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.status === 'completed') {
                   setLoading(false);
                   if (data.type === 'activation') {
                      toast.success(`Account activated successfully!`);
                      if (data.userId) {
                         import('../lib/referral').then(module => {
                            module.processRegistrationReferral(data.userId).catch(console.error);
                         });
                      }
                   } else {
                      toast.success(`Successfully added ৳${data.amount} to your balance!`);
                   }
                   if (unsubscribe) unsubscribe();
                } else if (data.status === 'cancelled') {
                   setLoading(false);
                   if (unsubscribe) unsubscribe();
                }
             }
           });
        });
        
      } catch (err: any) {
        console.error(err);
        setLoading(false);
      }
    };

    processPayment();
    
    return () => {
       if (unsubscribe) unsubscribe();
    };
  }, [status, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-2xl flex flex-col items-center text-center max-w-sm w-full">
         {loading ? (
           <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
         ) : status === 'success' ? (
           <>
             <CheckCircle className="w-20 h-20 text-emerald-500 mb-4" />
             <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Payment Successful!</h2>
             <p className="text-slate-500 dark:text-slate-400 mb-6">Your transaction has been verified and your balance is updated.</p>
           </>
         ) : (
           <>
             <XCircle className="w-20 h-20 text-rose-500 mb-4" />
             <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Payment Cancelled</h2>
             <p className="text-slate-500 dark:text-slate-400 mb-6">You have cancelled the payment process.</p>
           </>
         )}
         <button onClick={() => navigate('/wallet')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl uppercase tracking-widest transition-all">
           Go to Wallet
         </button>
      </div>
    </div>
  );
}
