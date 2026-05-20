import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';
import { collection, onSnapshot, writeBatch, doc, increment, serverTimestamp, setDoc } from 'firebase/firestore';
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
    // Listen to real-time drive offers
    const unsub = onSnapshot(collection(db, "drive_offers"), (snapshot) => {
      const list: DriveOffer[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.status === 'active') {
          list.push({ id: docSnap.id, ...data } as DriveOffer);
        }
      });
      setOffers(list);
      setLoading(false);
    }, (error) => {
      console.error("Failed to load drive offers:", error);
      setLoading(false);
    });

    return unsub;
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
    } catch (err) {
      toast.error("Failed to load samples");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentTabOffers = offers.filter(of => of.operator === activeTab);

  const getOperatorStyles = (op: string) => {
    switch (op) {
      case 'Grameenphone':
        return {
          brandColor: 'text-sky-600 dark:text-sky-400',
          bgGradient: 'from-sky-500 to-blue-600',
          badgeColor: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-300/30',
          tabActive: 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
        };
      case 'Robi':
        return {
          brandColor: 'text-red-500 dark:text-red-400',
          bgGradient: 'from-orange-500 to-red-600',
          badgeColor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300/30',
          tabActive: 'bg-red-600 text-white shadow-lg shadow-red-600/30'
        };
      case 'Banglalink':
        return {
          brandColor: 'text-amber-500 dark:text-amber-400',
          bgGradient: 'from-amber-400 to-orange-500',
          badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300/30',
          tabActive: 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
        };
      case 'Airtel':
        return {
          brandColor: 'text-rose-500 dark:text-rose-400',
          bgGradient: 'from-rose-400 to-pink-600',
          badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-300/30',
          tabActive: 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
        };
      case 'Teletalk':
        return {
          brandColor: 'text-emerald-500 dark:text-emerald-400',
          bgGradient: 'from-emerald-400 to-teal-600',
          badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300/30',
          tabActive: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
        };
      default:
        return {
          brandColor: 'text-indigo-500',
          bgGradient: 'from-indigo-500 to-purple-600',
          badgeColor: 'bg-indigo-100 text-indigo-700',
          tabActive: 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
        };
    }
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !selectedOffer) return;

    if (!mobileNumber || mobileNumber.length < 11 || !mobileNumber.startsWith('01')) {
      toast.error('ভ্যালিড ১১-ডিজিটের বাংলাদেশি মোবাইল নাম্বার লিখুন (যেমন: 017XXXXXXXX)');
      return;
    }

    let walletBalance = 0;
    if (selectedWallet === 'main') walletBalance = profile?.balances?.main || 0;
    else if (selectedWallet === 'bonus') walletBalance = profile?.balances?.bonus || 0;
    else if (selectedWallet === 'referral') walletBalance = profile?.balances?.referral || 0;

    if (walletBalance < selectedOffer.salePrice) {
      toast.error('দুঃখিত! আপনার নির্বাচন করা ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই।');
      return;
    }

    setPurchasing(true);

    try {
      const batch = writeBatch(db);
      const userRef = doc(db, 'users', auth.currentUser.uid);

      // 1. Deduct balance from selected wallet
      const balanceField = `balances.${selectedWallet}`;
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
        wallet: selectedWallet,
        method: 'Drive Package',
        account: `${selectedOffer.operator} - ${mobileNumber} [${selectedOffer.title}] - ${region}`,
        createdAt: serverTimestamp()
      });

      // 3. Create transaction sub-document on student
      batch.set(newTxRef, {
        amount: selectedOffer.salePrice,
        fee: 0,
        netAmount: selectedOffer.salePrice,
        type: 'withdraw',
        status: 'pending',
        wallet: selectedWallet,
        method: 'Drive Package',
        account: `${selectedOffer.operator} - ${mobileNumber} [${selectedOffer.title}] - ${region}`,
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
    <div className="pt-6 px-4 pb-24">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white dark:bg-slate-800 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-white" />
        </button>
        <h2 className="text-xl font-display font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
          <Wifi className="w-5 h-5 text-sky-500 animate-pulse" />
          Drive Offers (প্যাকেজ)
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Operator Filter Tabs */}
      <div className="flex space-x-1.5 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-2xl mb-6 overflow-x-auto select-none no-scrollbar ring-1 ring-slate-200 dark:ring-slate-850">
        {(['Grameenphone', 'Robi', 'Banglalink', 'Airtel', 'Teletalk'] as const).map(op => {
          const isActive = activeTab === op;
          const styles = getOperatorStyles(op);
          return (
            <button
              key={op}
              onClick={() => setActiveTab(op)}
              className={`flex-1 min-w-[76px] py-3 text-[11px] font-black uppercase tracking-wider rounded-[14px] transition-all whitespace-nowrap px-2 ${
                isActive ? styles.tabActive : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {op === 'Grameenphone' ? 'GP' : op === 'Banglalink' ? 'BL' : op}
            </button>
          );
        })}
      </div>

      {/* User Info & Wallet Balance Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-[24px] p-5 mb-6 border border-white/5 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full"></div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <p className="text-[10px] text-indigo-300 uppercase font-black tracking-widest mb-1">Your Main Wallet</p>
            <h3 className="text-2xl font-black font-display text-white">
              ৳ {profile?.balances?.main?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="bg-white/10 dark:bg-slate-800/80 p-2.5 rounded-xl border border-white/10 flex items-center gap-1.5 text-xs text-indigo-200">
            <Gift className="w-4 h-4 text-emerald-400" />
            <span>Bonus: ৳{profile?.balances?.bonus?.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Offers Loader & Section List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 h-32 rounded-3xl animate-pulse border border-slate-100 dark:border-slate-700"></div>
          ))}
        </div>
      ) : currentTabOffers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800/40 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-805">
          <Wifi className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 dark:text-slate-350">কোনো ড্রাইভ অফার নেই</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[240px] mx-auto">এই অপারেটরে বর্তমানে কোনো অফার নেই। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।</p>
          
          {profile?.role === 'admin' && offers.length === 0 && (
            <button 
              onClick={handleImportSamples}
              className="mt-4 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 mx-auto active:scale-95 transition-all shadow-md shadow-indigo-600/10"
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
                className="bg-white dark:bg-slate-800 p-5 rounded-[24px] shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50 flex items-center justify-between gap-4 relative overflow-hidden"
              >
                {/* Op Color Highlight Line */}
                <div className={`absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b ${opStyles.bgGradient}`}></div>
                
                <div className="flex-1 min-w-0 pl-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${opStyles.badgeColor}`}>
                      {of.operator}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{of.validity}</span>
                  </div>
                  
                  <h4 className="font-black text-slate-900 dark:text-white leading-tight uppercase font-sans tracking-tight text-sm line-clamp-2">
                    {of.title}
                  </h4>
                  
                  <div className="h-2"></div>
                  
                  <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">৳{of.salePrice}</span>
                    <span className="text-xs text-slate-400 line-through">৳{of.originalPrice}</span>
                    <span className="text-[9.5px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">Save ৳{savings}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => setSelectedOffer(of)}
                    className={`px-5 py-3.5 rounded-[16px] text-xs font-black uppercase tracking-widest flex items-center gap-1 bg-gradient-to-r text-white shadow-md transition-all active:scale-95 flex-shrink-0 ${opStyles.bgGradient}`}
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
      <div className="mt-8 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-350 flex items-center gap-1.5 mb-2">
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          ব্যবহারের নিয়মাবলী:
        </h5>
        <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pl-4 list-disc font-medium leading-relaxed">
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
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />

            {/* Dialog Card Sheet */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 50 }}
              className="fixed inset-x-4 bottom-6 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:w-full md:max-w-md bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-2xl z-55 ring-1 ring-slate-100 dark:ring-slate-700/50"
            >
              <h3 className="text-xl font-display font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2 mb-1">
                <Gift className="w-5 h-5 text-indigo-500" /> Confirm Purchase
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-450 mb-4 font-medium">অফারের জন্য নাম্বার দিন এবং ওয়ালেট কনফার্ম করুন।</p>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 mb-5 text-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Selected Package</span>
                <h4 className="font-black text-slate-900 dark:text-white mt-1 leading-tight text-base">{selectedOffer.title}</h4>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">অপারেটর: <strong className="text-slate-800 dark:text-white">{selectedOffer.operator}</strong></span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">৳{selectedOffer.salePrice}</span>
                </div>
              </div>

              <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                {/* Mobile Number */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1 mb-1.5">Recipient Mobile Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="e.g. 01712345678"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 dark:text-white rounded-2xl pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono font-bold tracking-wider"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-[15px]" />
                  </div>
                </div>

                {/* Division / Regional limits */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1 mb-1.5">Select Division (বিভাগ)</label>
                  <div className="relative">
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 dark:text-white rounded-2xl pl-10 pr-4 py-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold appearance-none cursor-pointer"
                    >
                      <option value="Nationwide (সারা দেশ)">Nationwide (সারা দেশ)</option>
                      <option value="Dhaka (ঢাকা বিভাগ)">Dhaka (ঢাকা বিভাগ)</option>
                      <option value="Chittagong (চট্টগ্রাম বিভাগ)">Chittagong (চট্টগ্রাম বিভাগ)</option>
                      <option value="Rajshahi (রাজশাহী বিভাগ)">Rajshahi (রাজশাহী বিভাগ)</option>
                      <option value="Khulna (খুলনা বিভাগ)">Khulna (খুলনা বিভাগ)</option>
                      <option value="Barisal (বরিশাল বিভাগ)">Barisal (বরিশাল বিভাগ)</option>
                      <option value="Sylhet (সিলেট বিভাগ)">Sylhet (সিলেট বিভাগ)</option>
                      <option value="Rangpur (রংপুর বিভাগ)">Rangpur (রংপুর বিভাগ)</option>
                      <option value="Mymensingh (ময়মনসিংহ বিভাগ)">Mymensingh (ময়মনসিংহ বিভাগ)</option>
                    </select>
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-[15px]" />
                  </div>
                </div>

                {/* Wallet Select */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1 mb-1.5">Select Pay Wallet</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedWallet('main')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        selectedWallet === 'main'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-500 dark:text-indigo-400 shadow-sm font-bold'
                          : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350 hover:border-indigo-300'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-black opacity-75">Main Money</span>
                      <span className="text-xs font-black mt-1">৳{profile?.balances?.main?.toFixed(1) || '0.0'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedWallet('bonus')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        selectedWallet === 'bonus'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-500 dark:text-indigo-400 shadow-sm font-bold'
                          : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350 hover:border-indigo-300'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-black opacity-75">Bonus Money</span>
                      <span className="text-xs font-black mt-1">৳{profile?.balances?.bonus?.toFixed(1) || '0.0'}</span>
                    </button>
                  </div>
                </div>

                {/* Submit & Cancel Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedOffer(null)}
                    className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold py-3 px-4 rounded-2xl text-[11px] uppercase tracking-widest transition-transform hover:scale-[1.01] active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={purchasing}
                    className="w-full bg-indigo-600 hover:bg-indigo-550 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-black py-3 px-4 rounded-2xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.01] active:scale-[0.98] shadow-lg shadow-indigo-600/20 disabled:opacity-75"
                  >
                    {purchasing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
