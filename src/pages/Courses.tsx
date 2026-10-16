import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
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
  addDoc 
} from 'firebase/firestore';
import { getCachedDoc } from '../lib/cache';
import { 
  ArrowLeft, 
  BookOpen, 
  Search, 
  Play, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ChevronRight, 
  Video, 
  ShoppingBag, 
  Download, 
  Key, 
  Check, 
  Clock, 
  AlertCircle, 
  Smartphone, 
  GraduationCap, 
  Copy, 
  Tag, 
  X, 
  ShieldCheck, 
  Wallet,
  CheckCircle,
  FileText,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export interface TutorialItem {
  title: string;
  description: string;
  thumbnailUrl?: string;
  videoLink: string;
  duration?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoLink?: string;
  type?: 'course' | 'premium_app';
  category: string;
  price?: number;
  discountPrice?: number;
  driveLink?: string;
  accessKey?: string;
  setupInstructions?: string;
  status: 'active' | 'inactive';
  items?: TutorialItem[];
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
  courseType: 'course' | 'premium_app';
  thumbnailUrl: string;
  amount: number;
  paymentMethod: 'wallet' | 'bkash' | 'nagad' | 'rocket';
  senderNumber?: string;
  trxId?: string;
  status: 'pending' | 'approved' | 'rejected';
  driveLink?: string;
  accessKey?: string;
  createdAt?: any;
}

const DEFAULT_COURSES: Omit<Course, 'id'>[] = [
  {
    title: "প্রফেশনাল ডিজিটাল স্কিল ও ফ্রিল্যান্সিং ক্যারিয়ার গাইডলাইন",
    description: "অনলাইন মার্কেটপ্লেসে সফল ক্যারিয়ার গড়ার কমপ্লিট স্টেপ-বাই-স্টেপ মাস্টারক্লাস। ক্লায়েন্ট হান্টিং, কাজের পেমেন্ট ও রিমোট আর্নিং কৌশল।",
    thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
    videoLink: "https://www.youtube.com",
    type: 'course',
    category: "ডিজিটাল স্কিল",
    price: 1200,
    discountPrice: 499,
    driveLink: "https://drive.google.com",
    setupInstructions: "ভিডিও লেসনগুলো ক্রমানুসারে দেখুন এবং প্রয়োজনীয় রিসোর্স ফাইল ও গাইডলাইন দেওয়া ড্রাইভ লিংক থেকে ডাউনলোড করুন।",
    status: 'active',
    items: [
      {
        title: "ক্লাস ১: ডিজিটাল মার্কেটপ্লেস ও ক্যারিয়ার সম্ভাবনা",
        description: "মার্কেটপ্লেস পরিচিতি ও সফল ফ্রিল্যান্সিং এর মৌলিক ধারণা।",
        videoLink: "https://www.youtube.com",
        duration: "২৫ মিনিট"
      },
      {
        title: "ক্লাস ২: আকর্ষণীয় প্রোফাইল ও পোর্টফোলিও সেটআপ",
        description: "আন্তর্জাতিক ক্লায়েন্টদের জন্য স্ট্যান্ডার্ড পোর্টফোলিও তৈরির নিয়ম।",
        videoLink: "https://www.youtube.com",
        duration: "৩২ মিনিট"
      },
      {
        title: "ক্লাস ৩: ক্লায়েন্ট কমিউনিকেশন ও কাজ ডেলিভারি",
        description: "ক্লায়েন্টদের সাথে চ্যাট ও সঠিক টাইমে প্রজেক্ট সাবমিশন কৌশল।",
        videoLink: "https://www.youtube.com",
        duration: "২৮ মিনিট"
      },
      {
        title: "ক্লাস ৪: হাই-ভ্যালু প্রজেক্ট ও রিমোট ইনকাম সিক্রেট",
        description: "লং টার্ম প্রজেক্ট এবং নিয়মিত আয়ের কার্যকরী রোডম্যাপ।",
        videoLink: "https://www.youtube.com",
        duration: "৪০ মিনিট"
      }
    ]
  },
  {
    title: "KineMaster & CapCut VIP Lifetime (ওয়াটারমার্ক ছাড়া প্রিমিয়াম অ্যাপ)",
    description: "কোনো ওয়াটারমার্ক ছাড়াই ফুল ৪কে (4K) ৬০fps ভিডিও এক্সপোর্ট, আনলিমিটেড প্রিমিয়াম এফেক্টস, ট্রানজিশন ও ভিআইপি এসেট সহ অ্যান্ড্রয়েডের সেরা ভিডিও এডিটর প্যাকেজ।",
    thumbnailUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop",
    videoLink: "https://www.youtube.com",
    type: 'premium_app',
    category: "প্রিমিয়াম অ্যাপস",
    price: 450,
    discountPrice: 199,
    driveLink: "https://drive.google.com",
    accessKey: "VIP-PRO-EDIT-2026-ACTIVE",
    setupInstructions: "১. দেওয়া গুগল ড্রাইভ লিংক থেকে APK ডাউনলোড করুন।\n২. পূর্বের সাধারণ ভার্সন আনইনস্টল করে এটি ইনস্টল দিন।\n৩. অ্যাপ ওপেন করে দেওয়া লাইসেন্স কি-টি দিয়ে অ্যাক্টিভেট করুন।",
    status: 'active'
  },
  {
    title: "ক্যানভা প্রো ও প্রফেশনাল গ্রাফিক্স ডিজাইন মাস্টারক্লাস",
    description: "ক্যানভা প্রো ব্যবহার করে সোশ্যাল মিডিয়া অ্যাড ব্যানার, লোগো, ইউটিউব থাম্বনেইল ও প্রিমিয়াম পোস্টার ডিজাইন তৈরি করার ফুল কোর্স ও ১০০০+ রেডিমেড টেমপ্লেট বান্ডেল।",
    thumbnailUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop",
    videoLink: "https://www.youtube.com",
    type: 'course',
    category: "গ্রাফিক্স ও ভিডিও",
    price: 650,
    discountPrice: 250,
    driveLink: "https://drive.google.com",
    setupInstructions: "ড্রাইভ ফোল্ডারে ১০০০+ রেডিমেড পিএসডি ও ক্যানভা এডিটেবল টেমপ্লেট দেওয়া হয়েছে।",
    status: 'active',
    items: [
      {
        title: "পর্ব ১: কালার কম্বিনেশন ও টাইপোগ্রাফি রুলস",
        description: "প্রফেশনাল ডিজাইনারদের মতো আকর্ষণীয় কালার প্যালেট নির্বাচন ও ফন্ট ব্যবহার।",
        videoLink: "https://www.youtube.com",
        duration: "২০ মিনিট"
      },
      {
        title: "পর্ব ২: হাই-ক্লিক থ্রু রেট (CTR) ইউটিউব থাম্বনেইল মেকিং",
        description: "ভিউ বাড়ানোর মতো আকর্ষণীয় ইউটিউব থাম্বনেইল তৈরি করুন মাত্র ৫ মিনিটে।",
        videoLink: "https://www.youtube.com",
        duration: "৩০ মিনিট"
      }
    ]
  },
  {
    title: "Alight Motion Pro APK (Uncompressed XML & Presets Support)",
    description: "মোশন গ্রাফিক্স, প্রিসেট ইমপোর্ট ও প্রিমিয়াম ইফেক্ট সাপোর্ট সহ ১০০% অ্যাড-ফ্রি ও কোনো ল্যাগ ছাড়াই ফুল আনলকড আল্ট্রা মোশন ভার্সন।",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    videoLink: "https://www.youtube.com",
    type: 'premium_app',
    category: "প্রিমিয়াম অ্যাপস",
    price: 350,
    discountPrice: 150,
    driveLink: "https://drive.google.com",
    accessKey: "AM-MOTION-ULTRA-KEY",
    setupInstructions: "ডাউনলোড লিংকে গিয়ে সরাসরি ইনস্টল করুন। কোনো বাড়তি লগইনের প্রয়োজন নেই।",
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

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'course' | 'premium_app'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals & Viewers
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [purchasingCourse, setPurchasingCourse] = useState<Course | null>(null);
  const [viewingUnlockedCourse, setViewingUnlockedCourse] = useState<Course | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);

  // Checkout states
  const [checkoutMethod, setCheckoutMethod] = useState<'wallet' | 'bkash' | 'nagad' | 'rocket'>('wallet');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Admin deposit numbers for manual payments
  const [depositSettings, setDepositSettings] = useState({
    bkashNumber: '01700-000000',
    nagadNumber: '01800-000000',
    rocketNumber: '01900-000000'
  });

  useEffect(() => {
    if (siteSettings?.coursesEnabled === false) {
      toast.error("দুঃখিত, কোর্স সেশনটি এডমিন দ্বারা সাময়িকভাবে বন্ধ আছে।");
      navigate('/');
    }
  }, [siteSettings, navigate]);

  // Fetch admin deposit numbers
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

  // Fetch live courses
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

  // Fetch user orders with robust error handling and subcollection fallback
  useEffect(() => {
    if (!auth.currentUser) {
      setOrdersLoading(false);
      return;
    }

    const uid = auth.currentUser.uid;
    let isMounted = true;

    // 1. Listen to user subcollection (guaranteed permitted under users/{userId}/**)
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
    }, (_err) => {
      // Subcollection fallback notice
      setOrdersLoading(false);
    });

    // 2. Also listen to top-level course_orders if permitted, merging seamlessly
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
      }, (err) => {
        // Top-level query may be constrained by remote security rules; silently fallback to user subcollection
        if (isMounted) {
          setOrdersLoading(false);
        }
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

  // Helper: check if a course is owned and approved
  const getOwnershipStatus = (courseId: string) => {
    const order = myOrders.find(o => o.courseId === courseId);
    if (!order) return null;
    return order.status; // 'approved' | 'pending' | 'rejected'
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`${label} কপি করা হয়েছে!`);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Seed sample courses if needed
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
      toast.success("নমুনা কোর্স ও অ্যাপস সফলভাবে যুক্ত হয়েছে!");
      
      // Refresh list
      const snapshot = await getDocs(collection(db, "courses"));
      const list: Course[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.status === 'active') list.push({ id: docSnap.id, ...data } as Course);
      });
      setCourses(list);
    } catch (err: any) {
      toast.error("কোর্স লোড করতে ব্যর্থ হয়েছে");
      handleFirestoreError(err, OperationType.WRITE, 'courses');
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
        toast.error(`আপনার মূল ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই! প্রয়োজনীয়: ৳${price}, বর্তমান ব্যালেন্স: ৳${userBalance}`);
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
        courseType: purchasingCourse.type || 'course',
        thumbnailUrl: purchasingCourse.thumbnailUrl || '',
        amount: price,
        paymentMethod: checkoutMethod,
        driveLink: purchasingCourse.driveLink || '',
        accessKey: purchasingCourse.accessKey || '',
        createdAt: serverTimestamp()
      };

      if (isWallet) {
        // Wallet purchase is INSTANTLY APPROVED!
        orderData.status = 'approved';

        const batch = writeBatch(db);
        const userRef = doc(db, 'users', auth.currentUser.uid);

        // 1. Deduct balance from main wallet
        batch.update(userRef, {
          'balances.main': increment(-price)
        });

        // 2. Record transaction
        const txRef = doc(collection(db, 'users', auth.currentUser.uid, 'transactions'));
        batch.set(txRef, {
          title: `${purchasingCourse.type === 'premium_app' ? 'অ্যাপ ক্রয়' : 'কোর্স ক্রয়'}: ${purchasingCourse.title}`,
          amount: price,
          type: 'withdraw',
          wallet: 'main',
          status: 'approved',
          createdAt: serverTimestamp()
        });

        // 3. Save order to user subcollection
        batch.set(userOrderRef, orderData);

        await batch.commit();

        // 4. Safely sync to top-level course_orders and update salesCount
        try {
          await setDoc(topOrderRef, orderData);
        } catch (syncErr) {
          console.warn("Top-level order sync fallback active:", syncErr);
        }

        try {
          const courseRef = doc(db, 'courses', purchasingCourse.id);
          await updateDoc(courseRef, { salesCount: increment(1) });
        } catch (_scErr) {
          // Non-blocking
        }

        // Update local profile balance
        if (setProfile && profile) {
          setProfile({
            ...profile,
            balances: {
              ...profile.balances,
              main: Math.max(0, (profile.balances?.main || 0) - price)
            }
          });
        }

        toast.success("অভিনন্দন! আপনার ক্রয় সফল হয়েছে এবং কন্টেন্ট আনলক করা হয়েছে।");
        setPurchasingCourse(null);
        setActiveTab('my_courses');
      } else {
        // Manual bKash / Nagad / Rocket payment is PENDING admin verification
        orderData.status = 'pending';
        orderData.senderNumber = senderNumber.trim();
        orderData.trxId = trxId.trim();

        // Save order to user subcollection
        await setDoc(userOrderRef, orderData);

        // Safely sync to top-level course_orders
        try {
          await setDoc(topOrderRef, orderData);
        } catch (syncErr) {
          console.warn("Top-level order sync fallback active:", syncErr);
        }

        try {
          const courseRef = doc(db, 'courses', purchasingCourse.id);
          await updateDoc(courseRef, { salesCount: increment(1) });
        } catch (_scErr) {
          // Non-blocking
        }

        toast.success("অর্ডার সফলভাবে জমা হয়েছে! এডমিন TrxID যাচাই করে দ্রুত অনুমোদন করবেন।");
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
    const itemType = item.type || 'course';
    const matchesType = selectedType === 'all' || itemType === selectedType;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      item.title.toLowerCase().includes(q) || 
      item.description.toLowerCase().includes(q) || 
      item.category.toLowerCase().includes(q);
    return matchesType && matchesCategory && matchesSearch;
  });

  // Approved purchased courses list
  const approvedPurchases = myOrders.filter(o => o.status === 'approved');

  return (
    <div className="min-h-screen bg-[#090909] text-white pb-32">
      {/* Dynamic Glassy Header */}
      <div className="sticky top-0 z-40 bg-[#090909]/95 backdrop-blur-2xl border-b border-[#3D3215] px-4 py-4 transition-colors">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-2xl bg-[#151515] border border-[#3D3215] flex items-center justify-center text-[#A3A3A3] hover:text-[#FACC15] hover:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center flex-1">
            <h1 className="text-base font-black tracking-tight font-display flex items-center justify-center gap-1.5 uppercase leading-none text-white">
              <Sparkles className="w-4 h-4 text-[#FACC15]" />
              কোর্স ও প্রিমিয়াম অ্যাপস
            </h1>
            <p className="text-[10px] text-[#A3A3A3] font-bold uppercase tracking-widest mt-0.5">LEARN & DIGITAL STORE</p>
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
        {/* Top Segmented Navigation: Store vs My Purchases */}
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
            মার্কেটপ্লেস (Store)
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
            আমার সংগ্রহ ({myOrders.length})
            {myOrders.some(o => o.status === 'pending') && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* -------------------- TAB 1: STORE / MARKETPLACE -------------------- */}
        {activeTab === 'store' && (
          <div className="space-y-4">
            {/* Hero Welcome banner */}
            <div className="bg-gradient-to-br from-[#1C1C1C] via-[#151515] to-[#101010] border border-[#3D3215] rounded-[28px] p-5 text-white relative overflow-hidden shadow-xl shadow-black/50">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#D4A017]/10 rounded-full blur-xl"></div>
              
              <div className="flex items-center gap-2 mb-2 bg-[#D4A017]/15 border border-[#D4A017]/30 text-[#FACC15] px-3 py-1 rounded-full w-fit">
                <Sparkles className="w-3.5 h-3.5 text-[#FACC15] animate-pulse" />
                <span className="text-[9px] font-black tracking-wider uppercase">Premium Courses & Apps</span>
              </div>
              
              <h2 className="text-lg sm:text-xl font-black font-display tracking-tight leading-tight text-white">
                দক্ষতা অর্জন করুন ও <br/>প্রিমিয়াম অ্যাপস উপভোগ করুন!
              </h2>
              <p className="text-[11px] text-[#A3A3A3] font-medium leading-relaxed mt-1.5">
                সকল ধরনের স্কিল ডেভেলপমেন্ট কোর্স, লার্নিং প্রোগ্রাম ও প্রয়োজনীয় প্রিমিয়াম অ্যাপস সহজে কিনুন বিকাশ, নগদ অথবা ওয়ালেট ব্যালেন্স দিয়ে।
              </p>
            </div>

            {/* Type Filter Pills (All / Courses / Apps) */}
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'সব আইটেম', icon: Layers },
                { id: 'course', label: 'অনলাইন কোর্স', icon: GraduationCap },
                { id: 'premium_app', label: 'প্রিমিয়াম অ্যাপস', icon: Smartphone }
              ].map((pill) => {
                const isActive = selectedType === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setSelectedType(pill.id as any)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                      isActive
                        ? 'bg-[#1C1C1C] text-[#FACC15] border-[#FACC15] shadow-sm'
                        : 'bg-[#151515] text-[#A3A3A3] border-[#3D3215] hover:text-white'
                    }`}
                  >
                    <pill.icon className="w-3.5 h-3.5" />
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Search Bar Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
              <input 
                type="text" 
                placeholder="সার্চ করুন (কোর্স বা অ্যাপের নাম, ক্যাটাগরি...)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#151515] border border-[#3D3215] pl-11 pr-4 py-3 rounded-2xl text-xs font-semibold shadow-sm focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] transition-all outline-none text-white placeholder-[#737373]" 
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide select-none -mx-4 px-4">
              {[
                { id: 'all', label: 'সকল ক্যাটাগরি' },
                { id: 'ডিজিタル স্কিল', label: 'ডিজিটাল স্কিল' },
                { id: 'গ্রাফিক্স ও ভিডিও', label: 'গ্রাফিক্স ও ভিডিও' },
                { id: 'প্রিমিয়াম অ্যাপস', label: 'প্রিমিয়াম অ্যাপস' },
                { id: 'অনলাইন ক্যারিয়ার', label: 'অনলাইন ক্যারিয়ার' },
                { id: 'অন্যান্য', label: 'অন্যান্য' }
              ].map((cat) => {
                const isCatActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 border cursor-pointer ${
                      isCatActive 
                        ? 'bg-[#D4A017] text-[#090909] border-[#D4A017] font-black' 
                        : 'bg-[#151515] text-[#A3A3A3] border-[#3D3215] hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-[#3D3215] border-t-[#FACC15] rounded-full animate-spin"></div>
                <p className="text-[#A3A3A3] text-xs font-black uppercase tracking-wider">কোর্স ও অ্যাপস লোড হচ্ছে...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="bg-[#151515] rounded-[28px] p-8 text-center border border-[#3D3215] shadow-sm">
                <div className="w-16 h-16 bg-[#101010] border border-[#3D3215] text-[#FACC15] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">কোনো আইটেম পাওয়া যায়নি</h3>
                <p className="text-[11px] text-[#A3A3A3] font-bold mt-1.5 leading-relaxed">
                  আপনার অনুসন্ধান অনুযায়ী কোনো কোর্স বা অ্যাপ খুঁজে পাওয়া যায়নি।
                </p>
                {profile?.role === 'admin' && courses.length === 0 && (
                  <button 
                    onClick={handleImportSampleCourses}
                    className="mt-5 inline-flex items-center gap-2 bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl shadow-lg shadow-[#D4A017]/20 transition-all cursor-pointer"
                  >
                    নমুনা কোর্স ও প্রিমিয়াম অ্যাপস ইম্পোর্ট করুন
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredCourses.map((course, idx) => {
                    const ownership = getOwnershipStatus(course.id);
                    const isCourse = course.type !== 'premium_app';
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
                        className="bg-[#151515] rounded-[24px] overflow-hidden border border-[#3D3215] hover:border-[#D4A017]/60 shadow-lg shadow-black/40 transition-all group flex flex-col"
                      >
                        {/* Cover Image Container */}
                        <div className="aspect-[16/9] w-full relative overflow-hidden bg-[#101010]">
                          <img 
                            src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"} 
                            alt={course.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-black/30 to-transparent"></div>

                          {/* Top Badges */}
                          <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                            <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-md backdrop-blur-md flex items-center gap-1 border ${
                              isCourse 
                                ? 'bg-amber-500/90 text-black border-amber-400' 
                                : 'bg-emerald-500/90 text-black border-emerald-400'
                            }`}>
                              {isCourse ? <GraduationCap className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                              {isCourse ? 'অনলাইন কোর্স' : 'প্রিমিয়াম অ্যাপ'}
                            </span>

                            <span className="px-2.5 py-1 rounded-xl bg-[#101010]/90 border border-[#3D3215] text-[#FACC15] text-[9px] font-black uppercase tracking-widest backdrop-blur-md">
                              {course.category}
                            </span>
                          </div>

                          {/* Bottom Info over Image */}
                          <div className="absolute bottom-3 inset-x-3 flex items-end justify-between">
                            <div>
                              {hasDiscount && (
                                <span className="text-[10px] text-[#A3A3A3] line-through font-bold block">
                                  ৳{originalPrice}
                                </span>
                              )}
                              <div className="flex items-center gap-1.5">
                                <span className="text-xl font-black text-[#FACC15] font-display">
                                  ৳{finalPrice}
                                </span>
                                {hasDiscount && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[9px] font-black">
                                    অফার
                                  </span>
                                )}
                              </div>
                            </div>

                            {course.items && course.items.length > 0 && (
                              <span className="text-[10px] font-black text-white/90 bg-black/70 px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                                <Layers className="w-3 h-3 text-[#FACC15]" />
                                {course.items.length} লেসন
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Body Details */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <h3 className="text-sm font-black text-white leading-snug group-hover:text-[#FACC15] transition-colors line-clamp-2">
                              {course.title}
                            </h3>
                            <p className="text-[11px] text-[#A3A3A3] font-medium line-clamp-2 mt-1 leading-relaxed">
                              {course.description}
                            </p>
                          </div>

                          {/* Action Buttons depending on ownership */}
                          <div className="pt-1 flex gap-2">
                            <button
                              onClick={() => setSelectedCourse(course)}
                              className="px-3 py-2.5 rounded-xl bg-[#101010] hover:bg-[#1C1C1C] text-[#A3A3A3] hover:text-white border border-[#3D3215] text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              বিস্তারিত
                            </button>

                            {ownership === 'approved' ? (
                              <button
                                onClick={() => {
                                  setViewingUnlockedCourse(course);
                                  setActiveLessonIndex(0);
                                }}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md shadow-emerald-900/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:opacity-95"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                আনলকড - দেখুন
                              </button>
                            ) : ownership === 'pending' ? (
                              <div className="flex-1 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 animate-spin" />
                                যাচাই চলছে...
                              </div>
                            ) : (
                              <button
                                onClick={() => setPurchasingCourse(course)}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] text-[10px] font-black uppercase tracking-wider shadow-lg shadow-[#D4A017]/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer font-bold hover:opacity-95"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
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

        {/* -------------------- TAB 2: MY PURCHASES -------------------- */}
        {activeTab === 'my_courses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#FACC15]" />
                আমার ক্রয়কৃত কোর্স ও অ্যাপস ({myOrders.length})
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
                <h3 className="text-sm font-black text-white uppercase tracking-wider">কোনো কোর্স বা অ্যাপ কেনা হয়নি</h3>
                <p className="text-[11px] text-[#A3A3A3] font-medium mt-1 leading-relaxed">
                  মার্কেটপ্লেস থেকে আপনার পছন্দের কোর্স অথবা প্রিমিয়াম অ্যাপ কিনুন এবং এখানে লাইফটাইম এক্সেস করুন।
                </p>
                <button
                  onClick={() => setActiveTab('store')}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] text-[10px] font-black uppercase tracking-wider shadow-lg shadow-[#D4A017]/20 cursor-pointer"
                >
                  মার্কেটপ্লেস ব্রাউজ করুন
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myOrders.map((order) => {
                  const isApproved = order.status === 'approved';
                  const isPending = order.status === 'pending';
                  const isRejected = order.status === 'rejected';

                  // Find original course details if exists
                  const originalCourse = courses.find(c => c.id === order.courseId);

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
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                              order.courseType === 'premium_app'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            }`}>
                              {order.courseType === 'premium_app' ? 'প্রিমিয়াম অ্যাপ' : 'অনলাইন কোর্স'}
                            </span>

                            {isApproved && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-black flex items-center gap-1">
                                <CheckCircle className="w-2.5 h-2.5" />
                                এক্টিভ / আনলকড
                              </span>
                            )}
                            {isPending && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[9px] font-black flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 animate-spin" />
                                পেন্ডিং (যাচাই চলছে)
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

                          <div className="flex items-center gap-2 text-[10px] text-[#A3A3A3] mt-1 font-bold">
                            <span>মূল্য: ৳{order.amount}</span>
                            <span>•</span>
                            <span className="uppercase">পেমেন্ট: {order.paymentMethod}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Notice or Unlocked Access button */}
                      {isApproved ? (
                        <div className="pt-2 border-t border-[#3D3215] flex gap-2">
                          <button
                            onClick={() => {
                              // If original course exists, use it; otherwise create a viewable wrapper
                              if (originalCourse) {
                                setViewingUnlockedCourse(originalCourse);
                              } else {
                                setViewingUnlockedCourse({
                                  id: order.courseId,
                                  title: order.courseTitle,
                                  type: order.courseType,
                                  description: 'আপনার ক্রয়কৃত ডিজিটাল প্রডাক্ট।',
                                  thumbnailUrl: order.thumbnailUrl,
                                  driveLink: order.driveLink,
                                  accessKey: order.accessKey,
                                  category: 'ডিজিটাল প্রডাক্ট',
                                  status: 'active'
                                });
                              }
                              setActiveLessonIndex(0);
                            }}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[10px] font-black uppercase tracking-widest shadow-md shadow-emerald-950 flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-95"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            {order.courseType === 'premium_app' ? 'অ্যাপ ডাউনলোড ও কী দেখুন' : 'কোর্স লেসন ও ড্রাইভ ফাইল দেখুন'}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </button>
                        </div>
                      ) : isPending ? (
                        <div className="p-2.5 rounded-xl bg-[#101010] border border-[#3D3215] text-[10px] text-[#A3A3A3] space-y-1">
                          <div className="flex justify-between font-bold">
                            <span>প্রেরক নাম্বার: {order.senderNumber}</span>
                            <span className="text-[#FACC15]">TrxID: {order.trxId}</span>
                          </div>
                          <p className="text-[9px] text-amber-400/90 font-medium">
                            এডমিন পেমেন্ট চেক করে খুব দ্রুত আপনার কোর্স/অ্যাপটি আনলক করে দেবেন। অনুগ্রহ করে অপেক্ষা করুন।
                          </p>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-900/30 text-[10px] text-rose-300">
                          ভুল TrxID বা অসঙ্গতির কারণে অর্ডারটি বাতিল করা হয়েছে। প্রয়োজনে সাপোর্টে যোগাযোগ করুন।
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* -------------------- MODAL: PRODUCT DETAILS -------------------- */}
      <AnimatePresence>
        {selectedCourse && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCourse(null)}
              className="fixed inset-0 bg-black/80 z-50 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 bottom-6 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:w-full md:max-w-md bg-[#151515] rounded-[30px] overflow-hidden shadow-2xl z-50 border border-[#3D3215] max-h-[85vh] flex flex-col"
            >
              {/* Header Image */}
              <div className="aspect-video w-full relative bg-[#101010] shrink-0">
                <img 
                  src={selectedCourse.thumbnailUrl} 
                  alt={selectedCourse.title} 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center hover:bg-black transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 bg-black/80 text-[#FACC15] border border-[#3D3215] rounded-lg text-[9px] font-black uppercase tracking-widest backdrop-blur-md">
                    {selectedCourse.category}
                  </span>
                  <span className="px-2.5 py-1 bg-black/80 text-white border border-[#3D3215] rounded-lg text-[9px] font-black uppercase tracking-widest backdrop-blur-md">
                    {selectedCourse.type === 'premium_app' ? 'প্রিমিয়াম অ্যাপ' : 'অনলাইন কোর্স'}
                  </span>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-5 overflow-y-auto space-y-4">
                <div>
                  <h3 className="text-base font-black text-white leading-snug">
                    {selectedCourse.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xl font-black text-[#FACC15] font-display">
                      ৳{selectedCourse.discountPrice ?? selectedCourse.price ?? 0}
                    </span>
                    {selectedCourse.discountPrice && selectedCourse.price && selectedCourse.discountPrice < selectedCourse.price && (
                      <span className="text-xs text-[#A3A3A3] line-through font-bold">
                        ৳{selectedCourse.price}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-[#101010] p-4 rounded-2xl border border-[#3D3215] text-[#A3A3A3] text-xs leading-relaxed font-medium">
                  {selectedCourse.description}
                </div>

                {/* Modules breakdown */}
                {selectedCourse.items && selectedCourse.items.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#FACC15]" />
                      কোর্স লেসন মডিউলসমূহ ({selectedCourse.items.length})
                    </h4>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {selectedCourse.items.map((item, idx) => (
                        <div key={idx} className="bg-[#101010] p-2.5 rounded-xl border border-[#3D3215] flex items-center justify-between text-xs">
                          <div className="min-w-0 pr-2">
                            <h5 className="font-bold text-white text-[11px] truncate">{item.title}</h5>
                            <p className="text-[9px] text-[#737373] truncate">{item.description}</p>
                          </div>
                          {item.duration && (
                            <span className="text-[9px] font-bold text-[#FACC15] shrink-0 bg-[#151515] px-2 py-0.5 rounded-md border border-[#3D3215]">
                              {item.duration}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Fixed Action */}
              <div className="p-4 bg-[#101010] border-t border-[#3D3215] flex gap-2">
                <button
                  onClick={() => {
                    const toBuy = selectedCourse;
                    setSelectedCourse(null);
                    setPurchasingCourse(toBuy);
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] text-xs font-black uppercase tracking-widest shadow-lg shadow-[#D4A017]/20 flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  এখনই কিনুন (৳{selectedCourse.discountPrice ?? selectedCourse.price ?? 0})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* -------------------- MODAL: CHECKOUT / PAYMENT -------------------- */}
      <AnimatePresence>
        {purchasingCourse && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmittingOrder && setPurchasingCourse(null)}
              className="fixed inset-0 bg-black/85 z-50 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 bottom-6 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:w-full md:max-w-md bg-[#151515] rounded-[30px] overflow-hidden shadow-2xl z-50 border border-[#3D3215] max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-[#3D3215] flex items-center justify-between bg-[#101010]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#FACC15]" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    পেমেন্ট ও অর্ডার কনফার্মেশন
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
              <form onSubmit={handleCheckoutSubmit} className="p-5 overflow-y-auto space-y-4">
                {/* Course Summary Item */}
                <div className="bg-[#101010] p-3 rounded-2xl border border-[#3D3215] flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={purchasingCourse.thumbnailUrl} 
                      alt="" 
                      className="w-12 h-12 rounded-xl object-cover border border-[#3D3215] shrink-0" 
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-white truncate max-w-[200px]">
                        {purchasingCourse.title}
                      </h4>
                      <p className="text-[9px] text-[#A3A3A3] font-bold uppercase mt-0.5">
                        {purchasingCourse.type === 'premium_app' ? 'প্রিমিয়াম অ্যাপ' : 'অনলাইন কোর্স'}
                      </p>
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
                      <span className="text-[9px] text-[#A3A3A3] mt-0.5 font-bold">TrxID যাচাই</span>
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
                      <span className="text-[9px] text-[#A3A3A3] mt-0.5 font-bold">TrxID যাচাই</span>
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
                      <span className="text-[9px] text-[#A3A3A3] mt-0.5 font-bold">TrxID যাচাই</span>
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
                      <span className="text-[#A3A3A3] font-bold">কর্তনযোগ্য মূল্য:</span>
                      <span className="font-black text-[#FACC15]">৳{purchasingCourse.discountPrice ?? purchasingCourse.price ?? 0}</span>
                    </div>
                    <div className="pt-2 border-t border-[#3D3215] flex items-center justify-between text-xs">
                      <span className="text-[#A3A3A3] font-bold">অবশিষ্ট থাকবে:</span>
                      <span className={`font-black ${(profile?.balances?.main ?? 0) >= (purchasingCourse.discountPrice ?? purchasingCourse.price ?? 0) ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ৳{Math.max(0, (profile?.balances?.main ?? 0) - (purchasingCourse.discountPrice ?? purchasingCourse.price ?? 0))}
                      </span>
                    </div>

                    {(profile?.balances?.main ?? 0) < (purchasingCourse.discountPrice ?? purchasingCourse.price ?? 0) && (
                      <div className="pt-2">
                        <p className="text-[10px] text-rose-400 font-bold mb-2">
                          পর্যাপ্ত ব্যালেন্স নেই! ডিপোজিট করে ব্যালেন্স যোগ করতে পারেন।
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate('/deposit')}
                          className="w-full py-2 rounded-xl bg-[#1C1C1C] border border-[#3D3215] text-[#FACC15] text-[10px] font-black uppercase tracking-wider"
                        >
                          ডিপোজিট পেইজে যান
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Admin Number Copy Box */}
                    <div className="bg-[#101010] p-3.5 rounded-2xl border border-[#3D3215] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-[#A3A3A3] uppercase">
                          এডমিন {checkoutMethod.toUpperCase()} পার্সোনাল নাম্বার
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
                            "নাম্বার"
                          )}
                          className="text-[10px] font-black text-[#FACC15] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          কপি
                        </button>
                      </div>

                      <p className="text-[9px] text-[#737373] leading-relaxed">
                        উপরের নাম্বারে ৳{purchasingCourse.discountPrice ?? purchasingCourse.price ?? 0} টাকা সেন্ড মানি করুন। তারপর নিচের বক্সে আপনার প্রেরক নাম্বার ও ট্রানজেকশন আইডি (TrxID) দিন।
                      </p>
                    </div>

                    {/* Sender Number Input */}
                    <div>
                      <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-wider block mb-1 pl-1">
                        আপনার প্রেরক নাম্বার (Sender Mobile)
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
                        ট্রানজেকশন আইডি (Transaction ID / TrxID)
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

                {/* Submit Button */}
                <div className="pt-2">
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
                        ওয়ালেট থেকে পে ও আনলক করুন (৳{purchasingCourse.discountPrice ?? purchasingCourse.price ?? 0})
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        পেমেন্ট কনফার্ম করুন (Submit Order)
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* -------------------- MODAL: UNLOCKED CONTENT / LESSON PLAYER / APP VIEWER -------------------- */}
      <AnimatePresence>
        {viewingUnlockedCourse && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingUnlockedCourse(null)}
              className="fixed inset-0 bg-black/90 z-50 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 bottom-6 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:w-full md:max-w-lg bg-[#151515] rounded-[30px] overflow-hidden shadow-2xl z-50 border border-emerald-500/40 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-[#3D3215] flex items-center justify-between bg-[#101010]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <h3 className="text-xs font-black text-white truncate max-w-[280px]">
                    {viewingUnlockedCourse.title}
                  </h3>
                </div>
                <button
                  onClick={() => setViewingUnlockedCourse(null)}
                  className="w-7 h-7 rounded-full bg-[#1C1C1C] border border-[#3D3215] text-[#A3A3A3] hover:text-white flex items-center justify-center cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-5 overflow-y-auto space-y-4">
                {/* Is it a Premium App? */}
                {viewingUnlockedCourse.type === 'premium_app' ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-[#101010] border border-emerald-500/30 text-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-black text-white">প্রিমিয়াম অ্যাপ আনলকড!</h4>
                      <p className="text-[11px] text-[#A3A3A3] leading-relaxed">
                        নিচের ডাউনলোড লিংক থেকে অ্যাপটি নামিয়ে নিন এবং এক্টিভেশন কোডটি ব্যবহার করুন।
                      </p>
                    </div>

                    {/* Download Button */}
                    {viewingUnlockedCourse.driveLink && (
                      <a
                        href={viewingUnlockedCourse.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 hover:opacity-95 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        গুগল ড্রাইভ / ডাউনলোড লিংক থেকে নামান
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* License Key Box */}
                    {viewingUnlockedCourse.accessKey && (
                      <div className="bg-[#101010] p-4 rounded-2xl border border-[#3D3215] space-y-2">
                        <span className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-wider block">
                          লাইসেন্স / ভিআইপি এক্টিভেশন কি (License Key)
                        </span>
                        <div className="flex items-center justify-between bg-[#151515] px-3 py-2.5 rounded-xl border border-emerald-500/30">
                          <code className="text-xs font-mono font-black text-emerald-400">
                            {viewingUnlockedCourse.accessKey}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(viewingUnlockedCourse.accessKey!, "এক্টিভেশন কোড")}
                            className="text-[10px] font-black text-[#FACC15] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedText === viewingUnlockedCourse.accessKey ? 'কপি হয়েছে' : 'কপি করুন'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Setup instructions */}
                    {viewingUnlockedCourse.setupInstructions && (
                      <div className="bg-[#101010] p-4 rounded-2xl border border-[#3D3215] space-y-2">
                        <h5 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#FACC15]" />
                          ইনস্টলেশন ও ব্যবহারের নিয়মাবলি
                        </h5>
                        <p className="text-xs text-[#A3A3A3] font-medium leading-relaxed whitespace-pre-line">
                          {viewingUnlockedCourse.setupInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* It's a Course */
                  <div className="space-y-4">
                    {/* Active Video Player frame */}
                    {viewingUnlockedCourse.items && viewingUnlockedCourse.items.length > 0 ? (
                      <div className="space-y-3">
                        {/* Currently playing lesson banner */}
                        <div className="bg-[#101010] p-4 rounded-2xl border border-[#3D3215] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-[#FACC15] uppercase tracking-wider">
                              লেসন #{activeLessonIndex + 1}
                            </span>
                            {viewingUnlockedCourse.items[activeLessonIndex]?.duration && (
                              <span className="text-[9px] text-[#A3A3A3] font-bold">
                                সময়: {viewingUnlockedCourse.items[activeLessonIndex].duration}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-black text-white">
                            {viewingUnlockedCourse.items[activeLessonIndex]?.title}
                          </h4>
                          <p className="text-[10px] text-[#A3A3A3] leading-relaxed">
                            {viewingUnlockedCourse.items[activeLessonIndex]?.description}
                          </p>

                          <a
                            href={viewingUnlockedCourse.items[activeLessonIndex]?.videoLink || viewingUnlockedCourse.videoLink || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:opacity-95 transition-all shadow-md"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            ভিডিও ক্লাসটি ওপেন করুন (Watch Video)
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        {/* All Lessons Playlist */}
                        <div className="space-y-2">
                          <h5 className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-wider">
                            সকল ক্লাস লেসনসমূহ ({viewingUnlockedCourse.items.length})
                          </h5>
                          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                            {viewingUnlockedCourse.items.map((item, idx) => {
                              const isCurrent = activeLessonIndex === idx;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => setActiveLessonIndex(idx)}
                                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                                    isCurrent
                                      ? 'bg-[#1C1C1C] border-[#FACC15]'
                                      : 'bg-[#101010] border-[#3D3215] opacity-80 hover:opacity-100'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                                      isCurrent ? 'bg-[#FACC15] text-black' : 'bg-[#1C1C1C] text-[#A3A3A3]'
                                    }`}>
                                      {idx + 1}
                                    </span>
                                    <div className="min-w-0">
                                      <h6 className="text-[11px] font-bold text-white truncate max-w-[240px]">
                                        {item.title}
                                      </h6>
                                    </div>
                                  </div>
                                  <Play className={`w-3 h-3 shrink-0 ${isCurrent ? 'text-[#FACC15] fill-current' : 'text-[#737373]'}`} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Single video link fallback */
                      viewingUnlockedCourse.videoLink && (
                        <a
                          href={viewingUnlockedCourse.videoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          কোর্স ভিডিও প্লে করুন
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )
                    )}

                    {/* Google Drive / Materials Link */}
                    {viewingUnlockedCourse.driveLink && (
                      <a
                        href={viewingUnlockedCourse.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 rounded-2xl bg-[#101010] hover:bg-[#1C1C1C] text-[#FACC15] border border-[#3D3215] hover:border-[#FACC15] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        কোর্স রিসোর্স ও ড্রাইভ ফাইল (Google Drive)
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Setup / Notes instructions */}
                    {viewingUnlockedCourse.setupInstructions && (
                      <div className="bg-[#101010] p-4 rounded-2xl border border-[#3D3215] space-y-1.5">
                        <h5 className="text-[11px] font-black text-white uppercase tracking-wider">
                          শিক্ষকের দিকনির্দেশনা ও নোটস
                        </h5>
                        <p className="text-xs text-[#A3A3A3] font-medium leading-relaxed whitespace-pre-line">
                          {viewingUnlockedCourse.setupInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
