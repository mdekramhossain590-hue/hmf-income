import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';
import { 
  collection, 
  writeBatch, 
  doc, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp, 
  increment,
  setDoc,
  updateDoc 
} from 'firebase/firestore';
import { getCachedDoc } from '../lib/cache';
import { 
  ArrowLeft, 
  BookOpen, 
  Search, 
  ExternalLink, 
  Sparkles, 
  ShoppingBag, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Copy, 
  X, 
  Wallet,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  driveLink: string;
  thumbnailUrl?: string;
  status: 'active' | 'inactive';
  salesCount?: number;
  createdAt?: any;
}

export interface CourseOrder {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  thumbnailUrl?: string;
  amount: number;
  paymentMethod: 'wallet' | 'bkash' | 'nagad' | 'rocket';
  senderNumber?: string;
  trxId?: string;
  status: 'pending' | 'approved' | 'rejected';
  driveLink?: string;
  createdAt?: any;
}

const DEFAULT_COURSES: Omit<Course, 'id'>[] = [
  {
    title: "প্রফেশনাল ডিজিটাল স্কিল ও ফ্রিল্যান্সিং ক্যারিয়ার গাইডলাইন",
    description: "অনলাইন মার্কেটপ্লেসে সফল ক্যারিয়ার গড়ার কমপ্লিট স্টেপ-বাই-স্টেপ মাস্টারক্লাস। ক্লায়েন্ট হান্টিং, কাজের পেমেন্ট ও রিমোট আর্নিং কৌশল।",
    thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
    price: 1200,
    discountPrice: 499,
    driveLink: "https://drive.google.com",
    status: 'active'
  },
  {
    title: "ক্যানভা প্রো ও প্রফেশনাল গ্রাফিক্স ডিজাইন মাস্টারক্লাস",
    description: "সোশ্যাল মিডিয়া অ্যাড ব্যানার, লোগো, ইউটিউব থাম্বনেইল ও পোস্টার ডিজাইন তৈরি করার ফুল কোর্স।",
    thumbnailUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop",
    price: 650,
    discountPrice: 250,
    driveLink: "https://drive.google.com",
    status: 'active'
  }
];

export function Courses() {
  const { profile, siteSettings, setProfile } = useAuth();
  const navigate = useNavigate();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'store' | 'my_courses'>('store');

  const [courses, setCourses] = useState<Course[]>([]);
  const [myOrders, setMyOrders] = useState<CourseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Checkout modal
  const [purchasingCourse, setPurchasingCourse] = useState<Course | null>(null);
  const [checkoutMethod, setCheckoutMethod] = useState<'wallet' | 'bkash' | 'nagad' | 'rocket'>('wallet');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Admin deposit numbers for manual payments
  const [depositSettings, setDepositSettings] = useState({
    bkashNumber: '01700-000000',
    nagadNumber: '01800-000000',
    rocketNumber: '01900-000000'
  });

  useEffect(() => {
    if (siteSettings?.coursesEnabled === false) {
      toast.error("দুঃখিত, কোর্স সেকশনটি এডমিন দ্বারা সাময়িকভাবে বন্ধ আছে।");
      navigate('/');
    }
  }, [siteSettings, navigate]);

  // Fetch deposit numbers
  useEffect(() => {
    const fetchDepositNumbers = async () => {
      try {
        const snap = await getCachedDoc(doc(db, "settings", "deposit"));
        if (snap.exists()) {
          const data = snap.data();
          setDepositSettings({
            bkashNumber: data.bkashNumber || '01700-000000',
            nagadNumber: data.nagadNumber || '01800-000000',
            rocketNumber: data.rocketNumber || data.bkashNumber || '01900-000000'
          });
        }
      } catch (err: any) {
        console.error("Deposit settings fetch error:", err?.message || err);
      }
    };
    fetchDepositNumbers();
  }, []);

  // Fetch active courses
  useEffect(() => {
    let isMounted = true;
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "courses"));
        if (!isMounted) return;
        const list: Course[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (data.status === 'active') {
            list.push({ id: docSnap.id, ...data } as Course);
          }
        });
        setCourses(list);
      } catch (error: any) {
        console.error("Failed to load courses:", error?.message || "Unknown Error");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchCourses();
      } else {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubAuth();
    };
  }, []);

  // Fetch user orders
  useEffect(() => {
    if (!auth.currentUser) {
      setOrdersLoading(false);
      return;
    }

    const uid = auth.currentUser.uid;
    let isMounted = true;

    // Fetch from backend persistent storage
    fetch(`/api/course-orders?userId=${encodeURIComponent(uid)}`)
      .then(r => r.json())
      .then(data => {
        if (!isMounted || !data?.orders) return;
        const apiList: CourseOrder[] = data.orders;
        setMyOrders(prev => {
          const map = new Map<string, CourseOrder>();
          prev.forEach(o => map.set(o.id, o));
          apiList.forEach(o => map.set(o.id, o));
          const merged = Array.from(map.values());
          merged.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          return merged;
        });
        setOrdersLoading(false);
      })
      .catch(() => {});

    // Listen to user subcollection
    const userOrdersRef = collection(db, "users", uid, "course_orders");
    const unsubUserOrders = onSnapshot(userOrdersRef, (snap) => {
      if (!isMounted) return;
      const subList: CourseOrder[] = [];
      snap.forEach(docSnap => {
        subList.push({ id: docSnap.id, ...docSnap.data() } as CourseOrder);
      });

      setMyOrders(prev => {
        const map = new Map<string, CourseOrder>();
        prev.forEach(o => map.set(o.id, o));
        subList.forEach(o => map.set(o.id, o));
        const merged = Array.from(map.values());
        merged.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        return merged;
      });
      setOrdersLoading(false);
    }, () => {
      setOrdersLoading(false);
    });

    // Also attempt top-level course_orders
    let unsubTopOrders: (() => void) | null = null;
    try {
      const q = query(
        collection(db, "course_orders"),
        where("userId", "==", uid)
      );

      unsubTopOrders = onSnapshot(q, (snap) => {
        if (!isMounted) return;
        const topList: CourseOrder[] = [];
        snap.forEach(docSnap => {
          topList.push({ id: docSnap.id, ...docSnap.data() } as CourseOrder);
        });

        setMyOrders(prev => {
          const map = new Map<string, CourseOrder>();
          prev.forEach(o => map.set(o.id, o));
          topList.forEach(o => map.set(o.id, o));
          const merged = Array.from(map.values());
          merged.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          return merged;
        });
        setOrdersLoading(false);
      }, () => {
        if (isMounted) setOrdersLoading(false);
      });
    } catch (_err) {
      setOrdersLoading(false);
    }

    return () => {
      isMounted = false;
      unsubUserOrders();
      if (unsubTopOrders) unsubTopOrders();
    };
  }, []);

  // Helper: check ownership status
  const getOwnershipStatus = (courseId: string) => {
    const order = myOrders.find(o => o.courseId === courseId);
    if (!order) return null;
    return order.status; // 'approved' | 'pending' | 'rejected'
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} কপি করা হয়েছে!`);
  };

  // Seed sample courses
  const handleImportSampleCourses = async () => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      DEFAULT_COURSES.forEach((cItem, idx) => {
        const id = `course_${idx + 1}_${Date.now()}`;
        const ref = doc(db, "courses", id);
        batch.set(ref, {
          ...cItem,
          createdAt: serverTimestamp()
        });
      });
      await batch.commit();
      toast.success("নমুনা কোর্স সফলভাবে যুক্ত হয়েছে!");
      
      const snapshot = await getDocs(collection(db, "courses"));
      const list: Course[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.status === 'active') list.push({ id: docSnap.id, ...data } as Course);
      });
      setCourses(list);
    } catch (err: any) {
      toast.error("কোর্স লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  // Handle purchase submission
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchasingCourse || !auth.currentUser) {
      toast.error("অনুগ্রহ করে লগইন করুন");
      return;
    }

    const price = purchasingCourse.discountPrice ?? purchasingCourse.price ?? 0;
    const isWallet = checkoutMethod === 'wallet';

    if (isWallet) {
      const userBalance = profile?.balances?.main ?? profile?.balance ?? 0;
      if (userBalance < price) {
        toast.error(`আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই! প্রয়োজনীয়: ৳${price}, বর্তমান: ৳${userBalance}`);
        return;
      }
    } else {
      if (!senderNumber.trim()) {
        toast.error("প্রেরক ফোন নাম্বার প্রদান করুন");
        return;
      }
      if (!trxId.trim()) {
        toast.error("ট্রানজেকশন আইডি (TrxID) প্রদান করুন");
        return;
      }
    }

    setIsSubmittingOrder(true);
    try {
      const userOrderRef = doc(collection(db, 'users', auth.currentUser.uid, 'course_orders'));
      const topOrderRef = doc(db, 'course_orders', userOrderRef.id);

      const orderData: Record<string, any> = {
        id: userOrderRef.id,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || '',
        userName: profile?.fullName || profile?.name || 'Customer',
        courseId: purchasingCourse.id,
        courseTitle: purchasingCourse.title,
        thumbnailUrl: purchasingCourse.thumbnailUrl || '',
        amount: price,
        paymentMethod: checkoutMethod,
        driveLink: purchasingCourse.driveLink || '',
        createdAt: serverTimestamp()
      };

      if (isWallet) {
        orderData.status = 'approved';

        const batch = writeBatch(db);
        const userRef = doc(db, 'users', auth.currentUser.uid);

        // Deduct balance
        batch.update(userRef, {
          'balances.main': increment(-price)
        });

        // Record transaction
        const txRef = doc(collection(db, 'users', auth.currentUser.uid, 'transactions'));
        batch.set(txRef, {
          title: `কোর্স ক্রয়: ${purchasingCourse.title}`,
          amount: price,
          type: 'withdraw',
          wallet: 'main',
          status: 'approved',
          createdAt: serverTimestamp()
        });

        // Save order
        batch.set(userOrderRef, orderData);

        const localOrderObj: CourseOrder = {
          ...orderData,
          createdAt: { seconds: Math.floor(Date.now() / 1000) }
        } as any;

        try {
          await fetch('/api/course-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localOrderObj)
          });
        } catch (_) {}

        try {
          await Promise.race([
            batch.commit(),
            new Promise((resolve) => setTimeout(resolve, 3500))
          ]);
        } catch (_bErr) {}

        try {
          await Promise.race([
            setDoc(topOrderRef, orderData),
            new Promise((resolve) => setTimeout(resolve, 2500))
          ]);
        } catch (_sync) {}

        try {
          const courseRef = doc(db, 'courses', purchasingCourse.id);
          await Promise.race([
            updateDoc(courseRef, { salesCount: increment(1) }),
            new Promise((resolve) => setTimeout(resolve, 2000))
          ]);
        } catch (_sc) {}

        setMyOrders(prev => [localOrderObj, ...prev.filter(o => o.id !== orderId)]);

        if (setProfile && profile) {
          setProfile({
            ...profile,
            balances: {
              ...profile.balances,
              main: Math.max(0, (profile.balances?.main || 0) - price)
            }
          });
        }

        toast.success("অভিনন্দন! কোর্স ক্রয় সফল হয়েছে।");
        setPurchasingCourse(null);
        setActiveTab('my_courses');
      } else {
        orderData.status = 'pending';
        orderData.senderNumber = senderNumber.trim();
        orderData.trxId = trxId.trim();

        const localOrderObj: CourseOrder = {
          ...orderData,
          createdAt: { seconds: Math.floor(Date.now() / 1000) }
        } as any;

        try {
          await fetch('/api/course-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localOrderObj)
          });
        } catch (_) {}

        try {
          await Promise.race([
            setDoc(userOrderRef, orderData),
            new Promise((resolve) => setTimeout(resolve, 3500))
          ]);
        } catch (_subErr) {}

        try {
          await Promise.race([
            setDoc(topOrderRef, orderData),
            new Promise((resolve) => setTimeout(resolve, 2500))
          ]);
        } catch (_sync) {}

        setMyOrders(prev => [localOrderObj, ...prev.filter(o => o.id !== orderId)]);

        toast.success("অর্ডার জমা হয়েছে! এডমিন TrxID যাচাই করে দ্রুত অনুমোদন করবেন।");
        setPurchasingCourse(null);
        setSenderNumber('');
        setTrxId('');
        setActiveTab('my_courses');
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error(err?.message || "অর্ডার সম্পন্ন করতে সমস্যা হয়েছে");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Filtered courses
  const filteredCourses = courses.filter(item => {
    const q = searchQuery.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#090909] text-white pb-32">
      {/* Dynamic Glassy Header */}
      <div className="sticky top-0 z-40 bg-[#090909]/95 backdrop-blur-2xl border-b border-[#3D3215] px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-2xl bg-[#151515] border border-[#3D3215] flex items-center justify-center text-[#A3A3A3] hover:text-[#FACC15] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center flex-1">
            <h1 className="text-base font-black tracking-tight font-display flex items-center justify-center gap-1.5 uppercase leading-none text-white">
              <Sparkles className="w-4 h-4 text-[#FACC15]" />
              অনলাইন কোর্সসমূহ
            </h1>
            <p className="text-[10px] text-[#A3A3A3] font-bold uppercase tracking-widest mt-0.5">LEARN & GROW SKILLS</p>
          </div>

          <div className="w-10 flex justify-end">
            <div className="px-2.5 py-1 rounded-xl bg-[#151515] border border-[#3D3215] text-[#FACC15] text-[10px] font-black flex items-center gap-1 shadow-sm">
              <Wallet className="w-3 h-3 text-[#FACC15]" />
              ৳{profile?.balances?.main ?? profile?.balance ?? 0}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-4 space-y-4">
        {/* Top Segmented Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-[#151515] border border-[#3D3215] rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('store')}
            className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'store'
                ? 'bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] shadow-lg shadow-[#D4A017]/20'
                : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            কোর্স স্টোর
          </button>

          <button
            onClick={() => setActiveTab('my_courses')}
            className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all relative cursor-pointer ${
              activeTab === 'my_courses'
                ? 'bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] shadow-lg shadow-[#D4A017]/20'
                : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            আমার কোর্সসমূহ ({myOrders.length})
            {myOrders.some(o => o.status === 'pending') && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* TAB 1: STORE */}
        {activeTab === 'store' && (
          <div className="space-y-4">
            {/* Search Bar Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
              <input 
                type="text" 
                placeholder="কোর্সের নাম বা বিষয় দিয়ে খুঁজুন..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#151515] border border-[#3D3215] pl-11 pr-4 py-3 rounded-2xl text-xs font-semibold shadow-sm focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] transition-all outline-none text-white placeholder-[#737373]" 
              />
            </div>

            {/* Product List */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-[#3D3215] border-t-[#FACC15] rounded-full animate-spin"></div>
                <p className="text-[#A3A3A3] text-xs font-black uppercase tracking-wider">কোর্সসমূহ লোড হচ্ছে...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="bg-[#151515] rounded-[28px] p-8 text-center border border-[#3D3215] shadow-sm">
                <div className="w-16 h-16 bg-[#101010] border border-[#3D3215] text-[#FACC15] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">কোনো কোর্স পাওয়া যায়নি</h3>
                <p className="text-[11px] text-[#A3A3A3] font-bold mt-1.5 leading-relaxed">
                  আপনার অনুসন্ধান অনুযায়ী কোনো কোর্স খুঁজে পাওয়া যায়নি।
                </p>
                {profile?.role === 'admin' && courses.length === 0 && (
                  <button 
                    onClick={handleImportSampleCourses}
                    className="mt-5 inline-flex items-center gap-2 bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl shadow-lg shadow-[#D4A017]/20 transition-all cursor-pointer"
                  >
                    নমুনা কোর্স ইম্পোর্ট করুন
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredCourses.map((course, idx) => {
                    const ownership = getOwnershipStatus(course.id);
                    const originalPrice = course.price || 0;
                    const finalPrice = course.discountPrice ?? originalPrice;
                    const hasDiscount = course.discountPrice && course.discountPrice < originalPrice;

                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.04 }}
                        className="bg-[#151515] rounded-[24px] overflow-hidden border border-[#3D3215] hover:border-[#D4A017]/60 shadow-lg shadow-black/40 transition-all flex flex-col"
                      >
                        {/* Cover Image */}
                        <div className="aspect-[16/9] w-full relative overflow-hidden bg-[#101010]">
                          <img 
                            src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"} 
                            alt={course.title} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-black/20 to-transparent"></div>

                          {/* Price Tag */}
                          <div className="absolute bottom-3 left-3 bg-[#101010]/90 px-3 py-1.5 rounded-xl border border-[#3D3215] backdrop-blur-md flex items-center gap-2">
                            {hasDiscount && (
                              <span className="text-[10px] text-[#A3A3A3] line-through font-bold">
                                ৳{originalPrice}
                              </span>
                            )}
                            <span className="text-base font-black text-[#FACC15]">
                              ৳{finalPrice}
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="text-sm font-black text-white leading-snug">
                              {course.title}
                            </h3>
                            <p className="text-[11px] text-[#A3A3A3] font-medium leading-relaxed mt-1.5">
                              {course.description}
                            </p>
                          </div>

                          {/* Actions */}
                          <div>
                            {ownership === 'approved' ? (
                              <a
                                href={course.driveLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-black uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
                              >
                                <ExternalLink className="w-4 h-4" />
                                কোর্স এক্সেস করুন (ড্রাইভ লিংক)
                              </a>
                            ) : ownership === 'pending' ? (
                              <div className="w-full py-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2">
                                <Clock className="w-4 h-4 animate-spin" />
                                পেমেন্ট যাচাই চলছে...
                              </div>
                            ) : (
                              <button
                                onClick={() => setPurchasingCourse(course)}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] text-xs font-black uppercase tracking-wider shadow-lg shadow-[#D4A017]/20 flex items-center justify-center gap-2 transition-all cursor-pointer font-bold hover:opacity-95"
                              >
                                <ShoppingBag className="w-4 h-4" />
                                এখনই কিনুন (৳{finalPrice})
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY COURSES */}
        {activeTab === 'my_courses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#FACC15]" />
                আমার ক্রয়কৃত কোর্সসমূহ ({myOrders.length})
              </h2>
            </div>

            {ordersLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-[#3D3215] border-t-[#FACC15] rounded-full animate-spin"></div>
                <p className="text-[#A3A3A3] text-xs font-black uppercase tracking-wider">অর্ডার লোড হচ্ছে...</p>
              </div>
            ) : myOrders.length === 0 ? (
              <div className="bg-[#151515] rounded-[28px] p-8 text-center border border-[#3D3215] shadow-sm">
                <div className="w-16 h-16 bg-[#101010] border border-[#3D3215] text-[#FACC15] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">কোনো কোর্স কেনা হয়নি</h3>
                <p className="text-[11px] text-[#A3A3A3] font-medium mt-1 leading-relaxed">
                  স্টোর থেকে আপনার পছন্দের কোর্স কিনুন এবং এখানে এক্সেস করুন।
                </p>
                <button
                  onClick={() => setActiveTab('store')}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] text-[10px] font-black uppercase tracking-wider shadow-lg shadow-[#D4A017]/20 cursor-pointer"
                >
                  কোর্স স্টোর ব্রাউজ করুন
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myOrders.map((order) => {
                  const isApproved = order.status === 'approved';
                  const isPending = order.status === 'pending';
                  const isRejected = order.status === 'rejected';

                  const originalCourse = courses.find(c => c.id === order.courseId);
                  const courseLink = order.driveLink || originalCourse?.driveLink;

                  return (
                    <div 
                      key={order.id} 
                      className="bg-[#151515] rounded-[22px] p-4 border border-[#3D3215] space-y-3 shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <img 
                          src={order.thumbnailUrl || originalCourse?.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"} 
                          alt="" 
                          className="w-16 h-16 rounded-xl object-cover bg-[#101010] border border-[#3D3215] shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            {isApproved && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-black flex items-center gap-1">
                                <CheckCircle className="w-2.5 h-2.5" />
                                আনলকড
                              </span>
                            )}
                            {isPending && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[9px] font-black flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 animate-spin" />
                                যাচাই চলছে
                              </span>
                            )}
                            {isRejected && (
                              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[9px] font-black flex items-center gap-1">
                                <AlertCircle className="w-2.5 h-2.5" />
                                বাতিল হয়েছে
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-black text-white leading-tight line-clamp-1">
                            {order.courseTitle}
                          </h4>
                          <p className="text-[10px] text-[#FACC15] font-bold mt-1">
                            মূল্য: ৳{order.amount} ({order.paymentMethod.toUpperCase()})
                          </p>
                        </div>
                      </div>

                      {/* Link button for approved courses */}
                      {isApproved && courseLink && (
                        <a
                          href={courseLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer hover:opacity-95"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          কোর্স এক্সেস করুন (ড্রাইভ লিংক)
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CHECKOUT / PAYMENT MODAL */}
      <AnimatePresence>
        {purchasingCourse && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmittingOrder && setPurchasingCourse(null)}
              className="fixed inset-0 bg-black/85 z-[100] backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 mx-auto w-[calc(100%-2rem)] max-w-md bg-[#151515] rounded-[30px] overflow-hidden shadow-2xl z-[110] border border-[#3D3215] max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-[#3D3215] flex items-center justify-between bg-[#101010] shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#FACC15]" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    পেমেন্ট ও কোর্স অর্ডার
                  </h3>
                </div>
                <button
                  disabled={isSubmittingOrder}
                  onClick={() => setPurchasingCourse(null)}
                  className="w-7 h-7 rounded-full bg-[#1C1C1C] border border-[#3D3215] text-[#A3A3A3] hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCheckoutSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-5 overflow-y-auto space-y-4 flex-1">
                {/* Course Summary Item */}
                <div className="bg-[#101010] p-3 rounded-2xl border border-[#3D3215] flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={purchasingCourse.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"} 
                      alt="" 
                      className="w-12 h-12 rounded-xl object-cover border border-[#3D3215] shrink-0" 
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-white truncate max-w-[200px]">
                        {purchasingCourse.title}
                      </h4>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <span className="text-sm font-black text-[#FACC15]">
                      ৳{purchasingCourse.discountPrice ?? purchasingCourse.price ?? 0}
                    </span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-wider block mb-2 pl-1">
                    পেমেন্ট মেথড নির্বাচন করুন
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Wallet option */}
                    <button
                      type="button"
                      onClick={() => setCheckoutMethod('wallet')}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        checkoutMethod === 'wallet'
                          ? 'bg-[#1C1C1C] border-[#FACC15] ring-1 ring-[#FACC15]'
                          : 'bg-[#101010] border-[#3D3215] opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Wallet className="w-4 h-4 text-[#FACC15]" />
                        <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/40">
                          ইনস্ট্যান্ট
                        </span>
                      </div>
                      <span className="text-xs font-black text-white">ওয়ালেট ব্যালেন্স</span>
                      <span className="text-[10px] text-[#A3A3A3] mt-0.5 font-bold">
                        আছে: ৳{profile?.balances?.main ?? profile?.balance ?? 0}
                      </span>
                    </button>

                    {/* bKash option */}
                    <button
                      type="button"
                      onClick={() => setCheckoutMethod('bkash')}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        checkoutMethod === 'bkash'
                          ? 'bg-[#E2136E]/15 border-[#E2136E] ring-1 ring-[#E2136E]'
                          : 'bg-[#101010] border-[#3D3215] opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-[#E2136E]">bKash</span>
                        <span className="text-[9px] font-black text-[#A3A3A3]">ম্যানুয়াল</span>
                      </div>
                      <span className="text-xs font-black text-white">বিকাশ সেন্ড মানি</span>
                    </button>

                    {/* Nagad option */}
                    <button
                      type="button"
                      onClick={() => setCheckoutMethod('nagad')}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        checkoutMethod === 'nagad'
                          ? 'bg-[#F7931E]/15 border-[#F7931E] ring-1 ring-[#F7931E]'
                          : 'bg-[#101010] border-[#3D3215] opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-[#F7931E]">Nagad</span>
                        <span className="text-[9px] font-black text-[#A3A3A3]">ম্যানুয়াল</span>
                      </div>
                      <span className="text-xs font-black text-white">নগদ সেন্ড মানি</span>
                    </button>

                    {/* Rocket option */}
                    <button
                      type="button"
                      onClick={() => setCheckoutMethod('rocket')}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        checkoutMethod === 'rocket'
                          ? 'bg-[#8C3494]/15 border-[#8C3494] ring-1 ring-[#8C3494]'
                          : 'bg-[#101010] border-[#3D3215] opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-[#8C3494]">Rocket</span>
                        <span className="text-[9px] font-black text-[#A3A3A3]">ম্যানুয়াল</span>
                      </div>
                      <span className="text-xs font-black text-white">রকেট সেন্ড মানি</span>
                    </button>
                  </div>
                </div>

                {/* Sub-form based on selected payment method */}
                {checkoutMethod === 'wallet' ? (
                  <div className="bg-[#101010] p-4 rounded-2xl border border-[#3D3215] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#A3A3A3] font-bold">বর্তমান মূল ব্যালেন্স:</span>
                      <span className="font-black text-white">৳{profile?.balances?.main ?? profile?.balance ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#A3A3A3] font-bold">কোর্স মূল্য:</span>
                      <span className="font-black text-[#FACC15]">৳{purchasingCourse.discountPrice ?? purchasingCourse.price ?? 0}</span>
                    </div>

                    {(profile?.balances?.main ?? 0) < (purchasingCourse.discountPrice ?? purchasingCourse.price ?? 0) && (
                      <div className="pt-2">
                        <p className="text-[10px] text-rose-400 font-bold mb-2">
                          পর্যাপ্ত ব্যালেন্স নেই! ডিপোজিট করে ওয়ালেটে টাকা যোগ করুন।
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate('/deposit')}
                          className="w-full py-2 rounded-xl bg-[#1C1C1C] border border-[#3D3215] text-[#FACC15] text-[10px] font-black uppercase tracking-wider"
                        >
                          ডিপোজিট করুন
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Admin Number Box */}
                    <div className="bg-[#101010] p-3.5 rounded-2xl border border-[#3D3215] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-[#A3A3A3] uppercase">
                          এডমিন {checkoutMethod.toUpperCase()} পার্সোনাল নম্বর
                        </span>
                        <span className="text-[9px] font-bold text-amber-400">Send Money</span>
                      </div>

                      <div className="flex items-center justify-between bg-[#151515] px-3 py-2 rounded-xl border border-[#3D3215]">
                        <span className="text-xs font-mono font-black text-white">
                          {checkoutMethod === 'bkash' 
                            ? depositSettings.bkashNumber 
                            : checkoutMethod === 'nagad' 
                              ? depositSettings.nagadNumber 
                              : depositSettings.rocketNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(
                            checkoutMethod === 'bkash' 
                              ? depositSettings.bkashNumber 
                              : checkoutMethod === 'nagad' 
                                ? depositSettings.nagadNumber 
                                : depositSettings.rocketNumber, 
                            "নম্বর"
                          )}
                          className="text-[10px] font-black text-[#FACC15] flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          কপি
                        </button>
                      </div>

                      <p className="text-[9px] text-[#737373] leading-relaxed">
                        উপরের নম্বরে ৳{purchasingCourse.discountPrice ?? purchasingCourse.price ?? 0} টাকা সেন্ড মানি করে আপনার প্রেরক নম্বর ও ট্রানজেকশন আইডি দিন।
                      </p>
                    </div>

                    {/* Sender Number Input */}
                    <div>
                      <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-wider block mb-1 pl-1">
                        আপনার প্রেরক নম্বর (Sender Mobile)
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="যেমন: 017XXXXXXXX"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        className="w-full bg-[#101010] border border-[#3D3215] px-4 py-2.5 rounded-xl text-xs font-bold text-white placeholder:text-[#737373] focus:border-[#FACC15] outline-none"
                      />
                    </div>

                    {/* TrxID Input */}
                    <div>
                      <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-wider block mb-1 pl-1">
                        ট্রানজেকশন আইডি (TrxID)
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="যেমন: BKL782910..."
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        className="w-full bg-[#101010] border border-[#3D3215] px-4 py-2.5 rounded-xl text-xs font-bold font-mono text-white placeholder:text-[#737373] focus:border-[#FACC15] outline-none uppercase"
                      />
                    </div>
                  </div>
                )}
                </div>

                {/* Sticky Submit Button Footer */}
                <div className="p-4 bg-[#101010] border-t border-[#3D3215] shrink-0">
                  <button
                    type="submit"
                    disabled={isSubmittingOrder || (checkoutMethod === 'wallet' && (profile?.balances?.main ?? 0) < (purchasingCourse.discountPrice ?? purchasingCourse.price ?? 0))}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] disabled:opacity-50 text-[#090909] text-xs font-black uppercase tracking-widest shadow-lg shadow-[#D4A017]/20 flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
                  >
                    {isSubmittingOrder ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        প্রসেস হচ্ছে...
                      </>
                    ) : checkoutMethod === 'wallet' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        ওয়ালেট থেকে পে করুন (৳{purchasingCourse.discountPrice ?? purchasingCourse.price ?? 0})
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        পেমেন্ট কনফার্ম করুন (Submit)
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
