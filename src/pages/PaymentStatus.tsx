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
                            module.processRegistrationReferral(data.userId).catch(e => console.error(e?.message || "Unknown Error"));
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
        console.error(err?.message || "Unknown Error");
        setLoading(false);
      }
    };

    processPayment();
    
    return () => {
       if (unsubscribe) unsubscribe();
    };
  }, [status, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#090909] text-white">
      <div className="bg-[#151515] p-8 rounded-[32px] shadow-2xl border border-[#3D3215] flex flex-col items-center text-center max-w-sm w-full relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017]/10 blur-2xl rounded-full pointer-events-none"></div>
         {loading ? (
           <div className="w-12 h-12 border-4 border-[#3D3215] border-t-[#FACC15] rounded-full animate-spin mb-4"></div>
         ) : status === 'success' ? (
           <>
             <CheckCircle className="w-20 h-20 text-[#FACC15] mb-4" />
             <h2 className="text-2xl font-black text-white mb-2">Payment Successful!</h2>
             <p className="text-[#A3A3A3] text-sm mb-6 font-medium">Your transaction has been verified and your balance is updated.</p>
           </>
         ) : (
           <>
             <XCircle className="w-20 h-20 text-rose-500 mb-4" />
             <h2 className="text-2xl font-black text-white mb-2">Payment Cancelled</h2>
             <p className="text-[#A3A3A3] text-sm mb-6 font-medium">You have cancelled the payment process.</p>
           </>
         )}
         <button onClick={() => navigate('/wallet')} className="w-full bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] font-black py-4 rounded-xl uppercase tracking-widest transition-all cursor-pointer active:scale-95 shadow-lg">
           Go to Wallet
         </button>
      </div>
    </div>
  );
}
