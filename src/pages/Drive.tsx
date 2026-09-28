import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';
import { collection, writeBatch, doc, increment, serverTimestamp, setDoc, getDocs, getDoc } from 'firebase/firestore';
import { ArrowLeft, Wifi, ShoppingBag, Phone, MapPin, Wallet, CheckCircle2, ShieldCheck, HelpCircle, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

interface DriveOffer {
  id: string;
  title: string;
  operator: string;
  validity: string;
  originalPrice: number;
  salePrice: number;
  status: 'active' | 'inactive';
}

const DEFAULT_OFFERS: Omit<DriveOffer, 'id'>[] = [
  { title: "GP 40GB + 800 Minute Combo (All BD)", operator: "Grameenphone", validity: "30 Days", originalPrice: 799, salePrice: 580, status: 'active' },
  { title: "GP 50GB Internet Pack (All BD)", operator: "Grameenphone", validity: "30 Days", originalPrice: 699, salePrice: 512, status: 'active' },
  { title: "Robi 35GB + 700 Minute Pack (All BD)", operator: "Robi", validity: "30 Days", originalPrice: 649, salePrice: 470, status: 'active' },
  { title: "Robi 15GB Pack (Robi User Only)", operator: "Robi", validity: "7 Days", originalPrice: 249, salePrice: 175, status: 'active' },
  { title: "BL 30GB + 600 Min Mega Offer", operator: "Banglalink", validity: "30 Days", originalPrice: 599, salePrice: 420, status: 'active' },
  { title: "BL Unlimited Internet 45GB (Nationwide)", operator: "Banglalink", validity: "30 Days", originalPrice: 699, salePrice: 490, status: 'active' },
  { title: "Airtel 45GB + 900 Min Bundle (Super)", operator: "Airtel", validity: "30 Days", originalPrice: 749, salePrice: 540, status: 'active' },
  { title: "Airtel 12GB + 250 Minute (Weekly)", operator: "Airtel", validity: "7 Days", originalPrice: 199, salePrice: 145, status: 'active' },
  { title: "Teletalk 25GB + 350 Min Pack", operator: "Teletalk", validity: "30 Days", originalPrice: 449, salePrice: 320, status: 'active' },
];

export function Drive() {
  const { profile, refreshProfile, siteSettings } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'Grameenphone' | 'Robi' | 'Banglalink' | 'Airtel' | 'Teletalk'>('Grameenphone');
  const [offers, setOffers] = useState<DriveOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Purchase Modal State
  const [selectedOffer, setSelectedOffer] = useState<DriveOffer | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [region, setRegion] = useState('Nationwide (সারা দেশ)');
  const [selectedWallet, setSelectedWallet] = useState<'main' | 'bonus' | 'referral'>('main');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (siteSettings?.driveOffersEnabled === false) {
      toast.error("দুঃখিত, ড্রাইভ অফার সিস্টেমটি সাময়িকভাবে বন্ধ আছে।");
      navigate('/');
    }
  }, [siteSettings, navigate]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "drive_offers"));
        const list: DriveOffer[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (data.status === 'active') {
            list.push({ id: docSnap.id, ...data } as DriveOffer);
          }
        });
        setOffers(list);
      } catch (error: any) {
        console.error("Failed to load drive offers:", error?.message || "Unknown Error");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOffers();
  }, []);

  // Import Sample Offers if none exist
  const handleImportSamples = async () => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      DEFAULT_OFFERS.forEach((of, index) => {
        const id = `offer_${index + Date.now()}`;
        const ref = doc(db, "drive_offers", id);
        batch.set(ref, of);
      });
      await batch.commit();
      toast.success("Default Drive Offers loaded successfully!");
    } catch (err: any) {
      toast.error("Failed to load samples");
      console.error(err?.message || "Unknown Error");
    } finally {
      setLoading(false);
    }
  };

  const currentTabOffers = offers.filter(of => of.operator === activeTab);

  const getOperatorStyles = (op: string) => {
    switch (op) {
      case 'Grameenphone':
        return {
          brandColor: 'text-sky-400',
          bgGradient: 'from-[#8A6508] via-[#D4A017] to-[#FACC15]',
          badgeColor: 'bg-sky-950/40 text-sky-400 border-sky-800/40',
          tabActive: 'bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] shadow-md shadow-[#D4A017]/20 font-black'
        };
      case 'Robi':
        return {
          brandColor: 'text-red-400',
          bgGradient: 'from-[#8A6508] via-[#D4A017] to-[#FACC15]',
          badgeColor: 'bg-red-950/40 text-red-400 border-red-800/40',
          tabActive: 'bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] shadow-md shadow-[#D4A017]/20 font-black'
        };
      case 'Banglalink':
        return {
          brandColor: 'text-amber-400',
          bgGradient: 'from-[#8A6508] via-[#D4A017] to-[#FACC15]',
          badgeColor: 'bg-amber-950/40 text-amber-400 border-amber-800/40',
          tabActive: 'bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] shadow-md shadow-[#D4A017]/20 font-black'
        };
      case 'Airtel':
        return {
          brandColor: 'text-rose-400',
          bgGradient: 'from-[#8A6508] via-[#D4A017] to-[#FACC15]',
          badgeColor: 'bg-rose-950/40 text-rose-400 border-rose-800/40',
          tabActive: 'bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] shadow-md shadow-[#D4A017]/20 font-black'
        };
      case 'Teletalk':
        return {
          brandColor: 'text-emerald-400',
          bgGradient: 'from-[#8A6508] via-[#D4A017] to-[#FACC15]',
          badgeColor: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
          tabActive: 'bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] shadow-md shadow-[#D4A017]/20 font-black'
        };
      default:
        return {
          brandColor: 'text-[#FACC15]',
          bgGradient: 'from-[#8A6508] via-[#D4A017] to-[#FACC15]',
          badgeColor: 'bg-[#1C1C1C] text-[#FACC15] border-[#3D3215]',
          tabActive: 'bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] shadow-md shadow-[#D4A017]/20 font-black'
        };
    }
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !selectedOffer || isSubmitting) return;
    setIsSubmitting(true);

    // Clean mobile number (strip non-digits and strip leading country code if any)
    let cleanedNumber = mobileNumber.replace(/\D/g, '');
    if (cleanedNumber.startsWith('8801')) {
      cleanedNumber = cleanedNumber.substring(2);
    }

    if (!cleanedNumber || cleanedNumber.length !== 11 || !cleanedNumber.startsWith('01')) {
      toast.error('ভ্যালিড ১১-ডিজিটের বাংলাদেশি মোবাইল নাম্বার লিখুন (যেমন: 017XXXXXXXX)');
      return;
    }

    const prefix = cleanedNumber.substring(0, 3);
    const op = selectedOffer.operator;

    let isValidPrefix = false;
    let expectedPrefixMsg = '';

    if (op === 'Grameenphone') {
      isValidPrefix = (prefix === '017');
      expectedPrefixMsg = '017';
    } else if (op === 'Robi') {
      isValidPrefix = (prefix === '018');
      expectedPrefixMsg = '018';
    } else if (op === 'Banglalink') {
      isValidPrefix = (prefix === '019');
      expectedPrefixMsg = '019';
    } else if (op === 'Airtel') {
      isValidPrefix = (prefix === '016');
      expectedPrefixMsg = '016';
    } else if (op === 'Teletalk') {
      isValidPrefix = (prefix === '015');
      expectedPrefixMsg = '015';
    } else {
      isValidPrefix = true;
    }

    if (!isValidPrefix) {
      toast.error(`দুঃখিত! ${op} অপারেটরের জন্য মোবাইল নাম্বারটি অবশ্যই ${expectedPrefixMsg} দিয়ে শুরু হতে হবে।`);
      return;
    }

    // Force payment to strictly proceed from 'main' wallet (Add Money / Deposit wallet)
    const walletBalance = profile?.balances?.main || 0;

    if (walletBalance < selectedOffer.salePrice) {
      toast.error('দুঃখিত! আপনার মেইন ওয়ালেট ব্যালেন্সে (অ্যাড মানি করা টাকা) পর্যাপ্ত ব্যালেন্স নেই। অনুগ্রহ করে ওয়ালেট পেজ থেকে অ্যাড মানি করুন।');
      return;
    }

    setPurchasing(true);

    try {
      const batch = writeBatch(db);
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
         const actualBal = userSnap.data().balances?.main || 0;
         if (actualBal < selectedOffer.salePrice) {
            toast.error('Insufficient balance!');
            setPurchasing(false);
            return;
         }
      }

      // 1. Deduct balance from main wallet only
      const balanceField = 'balances.main';
      batch.update(userRef, {
        [balanceField]: increment(-selectedOffer.salePrice)
      });

      // 2. Create payment/order request
      const reqId = `drive_req_${Date.now()}`;
      const reqRef = doc(db, 'payment_requests', reqId);
      
      const newTxRef = doc(collection(db, 'users', auth.currentUser.uid, 'transactions'));

      batch.set(reqRef, {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || '',
        transactionId: newTxRef.id,
        amount: selectedOffer.salePrice,
        fee: 0,
        netAmount: selectedOffer.salePrice,
        type: 'withdraw',
        status: 'pending',
        wallet: 'main',
        method: 'Drive Package',
        account: `${selectedOffer.operator} - ${cleanedNumber} [${selectedOffer.title}] - ${region}`,
        createdAt: serverTimestamp()
      });

      // 3. Create transaction sub-document on student
      batch.set(newTxRef, {
        amount: selectedOffer.salePrice,
        fee: 0,
        netAmount: selectedOffer.salePrice,
        type: 'withdraw',
        status: 'pending',
        wallet: 'main',
        method: 'Drive Package',
        account: `${selectedOffer.operator} - ${cleanedNumber} [${selectedOffer.title}] - ${region}`,
        createdAt: serverTimestamp()
      });

      // 4. Send interactive notification
      const notifRef = doc(collection(db, "users", auth.currentUser.uid, "notifications"));
      batch.set(notifRef, {
        title: 'Drive Bundle Ordered!',
        message: `৳${selectedOffer.salePrice} কেটে নেওয়া হয়েছে। আপনার '${selectedOffer.title}' অর্ডারটি পেন্ডিং রয়েছে।`,
        type: 'payment_pending',
        read: false,
        createdAt: serverTimestamp()
      });

      await batch.commit();
      await refreshProfile();
      toast.success('অর্ডার অফারটি সফলভাবে কেনা হয়েছে! অ্যাডমিন শিগগিরই প্রসেস করবেন।', { duration: 5000 });
      setSelectedOffer(null);
      setMobileNumber('');
      navigate('/wallet?tab=history');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `payment_requests/${auth.currentUser.uid}`);
      toast.error('অর্ডার প্লেস করা সম্ভব হয়নি!');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="pt-6 px-4 pb-24 bg-[#090909] min-h-screen text-white">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-[#151515] border border-[#3D3215] text-[#FACC15] rounded-full shadow-md hover:scale-105 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-display font-black tracking-tight text-white flex items-center gap-2">
          <Wifi className="w-5 h-5 text-[#FACC15] animate-pulse" />
          <span className="bg-gradient-to-r from-[#D4A017] via-[#FACC15] to-[#FFE082] bg-clip-text text-transparent">
            Drive Offers (প্যাকেজ)
          </span>
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Operator Filter Tabs */}
      <div className="flex space-x-1.5 p-1 bg-[#151515] rounded-2xl mb-6 overflow-x-auto select-none no-scrollbar border border-[#3D3215]">
        {(['Grameenphone', 'Robi', 'Banglalink', 'Airtel', 'Teletalk'] as const).map(op => {
          const isActive = activeTab === op;
          const styles = getOperatorStyles(op);
          return (
            <button
              key={op}
              onClick={() => setActiveTab(op)}
              className={`flex-1 min-w-[76px] py-3 text-[11px] font-black uppercase tracking-wider rounded-[14px] transition-all whitespace-nowrap px-2 cursor-pointer ${
                isActive ? styles.tabActive : 'text-[#A3A3A3] hover:text-[#FACC15]'
              }`}
            >
              {op === 'Grameenphone' ? 'GP' : op === 'Banglalink' ? 'BL' : op}
            </button>
          );
        })}
      </div>

      {/* User Info & Wallet Balance Banner */}
      <div className="bg-gradient-to-r from-[#1C1C1C] via-[#151515] to-[#101010] text-white rounded-[24px] p-5 mb-6 border border-[#3D3215] relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017]/10 blur-2xl rounded-full"></div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <p className="text-[10px] text-[#A3A3A3] uppercase font-black tracking-widest mb-1">Your Main Wallet</p>
            <h3 className="text-2xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-[#D4A017] via-[#FACC15] to-[#FFE082]">
              ৳ {profile?.balances?.main?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="bg-[#1C1C1C] p-2.5 rounded-xl border border-[#3D3215] flex items-center gap-1.5 text-xs text-[#FACC15]">
            <Gift className="w-4 h-4 text-[#FACC15]" />
            <span>Bonus: ৳{profile?.balances?.bonus?.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Offers Loader & Section List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#151515] h-32 rounded-3xl animate-pulse border border-[#3D3215]"></div>
          ))}
        </div>
      ) : currentTabOffers.length === 0 ? (
        <div className="text-center py-16 bg-[#151515] rounded-[32px] border-2 border-dashed border-[#3D3215]">
          <Wifi className="w-12 h-12 text-[#737373] mx-auto mb-3" />
          <h4 className="font-bold text-[#A3A3A3]">কোনো ড্রাইভ অফার নেই</h4>
          <p className="text-xs text-[#737373] mt-1 max-w-[240px] mx-auto">এই অপারেটরে বর্তমানে কোনো অফার নেই। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।</p>
          
          {profile?.role === 'admin' && offers.length === 0 && (
            <button 
              onClick={handleImportSamples}
              className="mt-4 px-5 py-2.5 bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] font-black rounded-xl text-xs flex items-center justify-center gap-2 mx-auto active:scale-95 transition-all shadow-md shadow-[#D4A017]/20"
            >
              Import Preset Drive Offers
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {currentTabOffers.map(of => {
            const savings = of.originalPrice - of.salePrice;
            const opStyles = getOperatorStyles(of.operator);
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                key={of.id}
                className="bg-[#151515] p-5 rounded-[24px] shadow-sm border border-[#3D3215] flex items-center justify-between gap-4 relative overflow-hidden hover:border-[#D4A017]/50 transition-all"
              >
                {/* Op Color Highlight Line */}
                <div className={`absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b ${opStyles.bgGradient}`}></div>
                
                <div className="flex-1 min-w-0 pl-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${opStyles.badgeColor}`}>
                      {of.operator}
                    </span>
                    <span className="text-[9px] font-bold text-[#737373] uppercase tracking-widest">{of.validity}</span>
                  </div>
                  
                  <h4 className="font-black text-white leading-tight uppercase font-sans tracking-tight text-sm line-clamp-2">
                    {of.title}
                  </h4>
                  
                  <div className="h-2"></div>
                  
                  <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                    <span className="text-xl font-black text-[#FACC15]">৳{of.salePrice}</span>
                    <span className="text-xs text-[#737373] line-through">৳{of.originalPrice}</span>
                    <span className="text-[9.5px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-md">Save ৳{savings}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => setSelectedOffer(of)}
                    className={`px-5 py-3.5 rounded-[16px] text-xs font-black uppercase tracking-widest flex items-center gap-1 bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] shadow-md shadow-[#D4A017]/20 transition-all active:scale-95 flex-shrink-0 cursor-pointer hover:opacity-95`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Buy
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Dynamic Instruction Guide */}
      <div className="mt-8 bg-[#151515] p-4 rounded-3xl border border-[#3D3215]">
        <h5 className="font-bold text-sm text-[#FACC15] flex items-center gap-1.5 mb-2">
          <HelpCircle className="w-4 h-4 text-[#FACC15]" />
          ব্যবহারের নিয়মাবলী:
        </h5>
        <ul className="text-xs text-[#A3A3A3] space-y-1.5 pl-4 list-disc font-medium leading-relaxed">
          <li>অফিসিয়াল প্যাক কিনতে অফারটি নির্বাচন করে মোবাইল নাম্বার প্রদান করুন।</li>
          <li>আপনার মোবাইল একাউন্টে কোনো বকেয়া ব্যালেন্স বা ইমার্জেন্সি ব্যালেন্স থাকলে অফারটি চালু হতে দেরি হতে পারে।</li>
          <li>অর্ডার সম্পন্ন হতে সাধারণত ১০ থেকে ৩০ মিনিট সময় লাগতে পারে। কোনো অতিরিক্ত বিলম্বের ক্ষেত্রে আমাদের সাপোর্টে যোগাযোগ করুন।</li>
        </ul>
      </div>

      {/* Offer Purchase Dialog Popup */}
      <AnimatePresence>
        {selectedOffer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOffer(null)}
              className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
            />

            {/* Dialog Card Sheet */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 50 }}
              className="fixed inset-x-4 bottom-6 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:w-full md:max-w-md bg-[#151515] rounded-[32px] p-6 shadow-2xl z-55 border border-[#3D3215]"
            >
              <h3 className="text-xl font-display font-black tracking-tight text-white flex items-center gap-2 mb-1">
                <Gift className="w-5 h-5 text-[#FACC15]" /> Confirm Purchase
              </h3>
              <p className="text-xs text-[#A3A3A3] mb-4 font-medium">অফারের জন্য নাম্বার দিন এবং ওয়ালেট কনফার্ম করুন।</p>

              <div className="bg-[#1C1C1C] p-4 rounded-2xl border border-[#3D3215] mb-5 text-sm">
                <span className="text-[10px] uppercase font-bold text-[#A3A3A3] tracking-wider">Selected Package</span>
                <h4 className="font-black text-white mt-1 leading-tight text-base">{selectedOffer.title}</h4>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#3D3215]">
                  <span className="text-xs font-bold text-[#A3A3A3]">অপারেটর: <strong className="text-white">{selectedOffer.operator}</strong></span>
                  <span className="text-lg font-black text-[#FACC15]">৳{selectedOffer.salePrice}</span>
                </div>
              </div>

              <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                {/* Mobile Number */}
                <div>
                  <label className="block text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1.5">Recipient Mobile Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="e.g. 01712345678"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full bg-[#101010] border border-[#3D3215] text-white rounded-2xl pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#D4A017]/20 transition-all font-mono font-bold tracking-wider"
                    />
                    <Phone className="w-4 h-4 text-[#A3A3A3] absolute left-3.5 top-[15px]" />
                  </div>
                </div>

                {/* Division / Regional limits */}
                <div>
                  <label className="block text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1.5">Select Division (বিভাগ)</label>
                  <div className="relative">
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full bg-[#101010] border border-[#3D3215] text-white rounded-2xl pl-10 pr-4 py-3.5 text-xs focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#D4A017]/20 transition-all font-bold appearance-none cursor-pointer"
                    >
                      <option value="Nationwide (সারা দেশ)" className="bg-[#151515] text-white">Nationwide (সারা দেশ)</option>
                      <option value="Dhaka (ঢাকা বিভাগ)" className="bg-[#151515] text-white">Dhaka (ঢাকা বিভাগ)</option>
                      <option value="Chittagong (চট্টগ্রাম বিভাগ)" className="bg-[#151515] text-white">Chittagong (চট্টগ্রাম বিভাগ)</option>
                      <option value="Rajshahi (রাজশাহী বিভাগ)" className="bg-[#151515] text-white">Rajshahi (রাজশাহী বিভাগ)</option>
                      <option value="Khulna (খুলনা বিভাগ)" className="bg-[#151515] text-white">Khulna (খুলনা বিভাগ)</option>
                      <option value="Barisal (বরিশাল বিভাগ)" className="bg-[#151515] text-white">Barisal (বরিশাল বিভাগ)</option>
                      <option value="Sylhet (সিলেট বিভাগ)" className="bg-[#151515] text-white">Sylhet (সিলেট বিভাগ)</option>
                      <option value="Rangpur (রংপুর বিভাগ)" className="bg-[#151515] text-white">Rangpur (রংপুর বিভাগ)</option>
                      <option value="Mymensingh (ময়মনসিংহ বিভাগ)" className="bg-[#151515] text-white">Mymensingh (ময়মনসিংহ বিভাগ)</option>
                    </select>
                    <MapPin className="w-4 h-4 text-[#A3A3A3] absolute left-3.5 top-[15px]" />
                  </div>
                </div>

                {/* Wallet Information */}
                <div className="bg-[#1C1C1C] border border-[#3D3215] p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-[#FACC15] mb-1.5">
                    <Wallet className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-wider font-sans">Payment Source: Main Wallet</span>
                  </div>
                  <p className="text-xs text-[#A3A3A3] font-bold mb-2">
                    পেমেন্ট শুধুমাত্র আপনার অ্যাড মানি করা মেইন ব্যালেন্স থেকে কাটা হবে। টাস্ক বা বোনাস ব্যালেন্স প্রযোজ্য নয়।
                  </p>
                  <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-[#3D3215] text-[#FACC15]">
                    <span className="text-[#A3A3A3]">Your Main Wallet Balance:</span>
                    <span className="font-extrabold text-sm text-[#FACC15]">৳{profile?.balances?.main?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>

                {/* Submit & Cancel Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedOffer(null)}
                    className="w-full bg-[#1C1C1C] hover:bg-[#252525] border border-[#3D3215] text-[#A3A3A3] hover:text-white font-bold py-3 px-4 rounded-2xl text-[11px] uppercase tracking-widest transition-transform hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={purchasing}
                    className="w-full bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] hover:opacity-95 text-[#090909] font-black py-3 px-4 rounded-2xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.01] active:scale-[0.98] shadow-lg shadow-[#D4A017]/20 disabled:opacity-75 cursor-pointer"
                  >
                    {purchasing ? (
                      <div className="w-4 h-4 border-2 border-[#090909]/30 border-t-[#090909] rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Purchase
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
