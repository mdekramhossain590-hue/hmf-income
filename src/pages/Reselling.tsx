import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingBag, Truck, CheckCircle2, Clock, 
  AlertCircle, User, MapPin, Search, 
  Package, ChevronRight, ChevronLeft, X, Copy, CreditCard,
  Download, Maximize2, ZoomIn, ZoomOut, Camera
} from 'lucide-react';
import { db } from '../lib/firebase';
import { 
  collection, query, where, 
  serverTimestamp, doc, setDoc, onSnapshot 
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export interface ResellProduct {
  id: string;
  title: string;
  description: string;
  wholesalePrice: number;
  minResalePrice: number;
  imageUrl: string;
  images?: string[];
  category: string;
  stock: number;
}

export interface ResellOrder {
  id: string;
  resellerId: string;
  resellerName: string;
  resellerEmail: string;
  productId: string;
  productTitle: string;
  productImage: string;
  wholesalePrice: number;
  resalePrice: number;
  profit: number;
  deliveryFee: number;
  advanceFeePaid?: number;
  paymentMethod?: 'bkash' | 'nagad' | 'none';
  trxId?: string;
  orderNumberIndex: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNote?: string;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  createdAt: any;
}

const DEFAULT_PRODUCTS: ResellProduct[] = [
  {
    id: 'prod_1',
    title: 'স্মার্ট ওয়াচ ও ফিটনেস ট্র্যাকার (Smart Watch T800)',
    description: 'এইচডি টাচ স্ক্রিন, হার্ট রেট ও স্লিপ মনিটর, কলিং সুবিধা ও রিয়েলটাইম নোটিফিকেশন সহ ওয়াটারপ্রুফ স্মার্ট ওয়াচ।',
    wholesalePrice: 350,
    minResalePrice: 500,
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600&auto=format&fit=crop'
    ],
    category: 'গ্যাজেট',
    stock: 50
  },
  {
    id: 'prod_2',
    title: 'ওয়্যারলেস এয়ারপডস ও ব্লুটুথ হেডফোন (AirPods Pro)',
    description: 'নয়েজ ক্যানসেলেশন, টাচ কন্ট্রোল, ক্রিস্টাল ক্লিয়ার বেস সাউন্ড ও অতিরিক্ত ৩ দিন ব্যাটারি ব্যাকআপ কেস।',
    wholesalePrice: 350,
    minResalePrice: 500,
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?q=80&w=600&auto=format&fit=crop'
    ],
    category: 'হেডফোন',
    stock: 80
  },
  {
    id: 'prod_3',
    title: 'মিনি ট্রিমার ও শেভার ওয়াটারপ্রুফ (Rechargeable Shaver)',
    description: 'ফাস্ট টাইপ-সি চার্জিং, স্টেইনলেস স্টিল ব্লেড, পোর্টেবল পকেট ট্রিমার জেনুইন পারফরম্যান্স সহ।',
    wholesalePrice: 290,
    minResalePrice: 450,
    imageUrl: 'https://images.unsplash.com/photo-1621607512214-68297480165e?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1621607512214-68297480165e?q=80&w=600&auto=format&fit=crop'
    ],
    category: 'পার্সোনাল কেয়ার',
    stock: 45
  },
  {
    id: 'prod_4',
    title: 'প্রিমিয়াম ওয়াটারপ্রুফ ব্যাকপ্যাক (Laptop Travel Bag)',
    description: 'ইউএসবি পোর্ট, অ্যান্টি-থেফট জিপার, ওয়াটারপ্রুফ অক্সফোর্ড ফেব্রিক ও ১৫.৬ ইঞ্চি ল্যাপটপ রাখার সুবিধা।',
    wholesalePrice: 620,
    minResalePrice: 850,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?q=80&w=600&auto=format&fit=crop'
    ],
    category: 'লাইফস্টাইল',
    stock: 30
  }
];

export function Reselling() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'catalog' | 'my_orders'>('catalog');
  
  const [products, setProducts] = useState<ResellProduct[]>(DEFAULT_PRODUCTS);
  const [orders, setOrders] = useState<ResellOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Per-card active image slide index
  const [cardSlideIndex, setCardSlideIndex] = useState<Record<string, number>>({});
  // Order modal active image slide index
  const [modalSlideIndex, setModalSlideIndex] = useState(0);

  // Fullscreen Zoom Lightbox state
  const [lightboxProduct, setLightboxProduct] = useState<ResellProduct | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  // Order Modal
  const [selectedProduct, setSelectedProduct] = useState<ResellProduct | null>(null);
  const [customResalePrice, setCustomResalePrice] = useState<number | ''>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [trxId, setTrxId] = useState('');
  const [depositNumbers, setDepositNumbers] = useState({ bkashNumber: '017XX-XXXXXX', nagadNumber: '018XX-XXXXXX' });
  const [submitting, setSubmitting] = useState(false);

  // Per-product selling price state (defaults to Admin's suggested selling price, e.g. 500)
  const [productCustomPrices, setProductCustomPrices] = useState<Record<string, number | ''>>(() => {
    try {
      const saved = localStorage.getItem('reseller_custom_prices_v1');
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });

  const getMaxResalePrice = (product: ResellProduct): number => {
    return Math.max(product.minResalePrice || product.wholesalePrice, product.wholesalePrice);
  };

  const getEffectiveResalePrice = (product: ResellProduct): number => {
    const maxPrice = getMaxResalePrice(product);
    const customPrice = productCustomPrices[product.id];
    if (typeof customPrice === 'number' && !isNaN(customPrice) && customPrice > 0) {
      return Math.round(customPrice);
    }
    return maxPrice;
  };

  const handleSetProductResalePrice = (product: ResellProduct, rawValue: string) => {
    if (rawValue === '') {
      setProductCustomPrices(prev => ({ ...prev, [product.id]: '' }));
      return;
    }
    const numVal = Math.max(0, Math.round(Number(rawValue)));
    const next = {
      ...productCustomPrices,
      [product.id]: numVal
    };
    setProductCustomPrices(next);
    try {
      localStorage.setItem('reseller_custom_prices_v1', JSON.stringify(next));
    } catch (_) {}
  };

  const getProductImages = (product: ResellProduct): string[] => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.filter(Boolean);
    }
    if (product.imageUrl) {
      return [product.imageUrl];
    }
    return ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600'];
  };

  const downloadSingleImage = async (imgUrl: string, fileName: string) => {
    try {
      if (imgUrl.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = imgUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
      const response = await fetch(imgUrl, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch (_) {
      // Fallback: draw via canvas or direct anchor
      const a = document.createElement('a');
      a.href = imgUrl;
      a.download = fileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDownloadProductPhotos = async (product: ResellProduct, specificIndex?: number) => {
    const imgs = getProductImages(product);
    const safeTitle = (product.title || 'product').replace(/[^a-zA-Z0-9\u0980-\u09FF_-]/g, '_').slice(0, 30);
    setDownloadingId(product.id);
    try {
      if (typeof specificIndex === 'number' && imgs[specificIndex]) {
        await downloadSingleImage(imgs[specificIndex], `${safeTitle}_${specificIndex + 1}.jpg`);
        toast.success("ছবি ডাউনলোড সম্পন্ন হয়েছে!");
      } else {
        toast.loading(`${imgs.length}টি ছবি ডাউনলোড হচ্ছে...`, { id: 'dl_photos' });
        for (let i = 0; i < imgs.length; i++) {
          await downloadSingleImage(imgs[i], `${safeTitle}_${i + 1}.jpg`);
          if (imgs.length > 1) {
            await new Promise(res => setTimeout(res, 250));
          }
        }
        toast.success(`প্রোডাক্টের ${imgs.length}টি ছবি ডাউনলোড সম্পন্ন হয়েছে!`, { id: 'dl_photos' });
      }
    } catch (err) {
      toast.error("ছবি ডাউনলোড করতে সমস্যা হয়েছে", { id: 'dl_photos' });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCopyProductDetails = (product: ResellProduct) => {
    const finalCustomerPrice = getEffectiveResalePrice(product);
    const detailsText = `✨ প্রোডাক্ট: ${product.title}\n📦 ক্যাটাগরি: ${product.category}\n📝 বিবরণ:\n${product.description}\n\n💰 মূল্য: ৳${finalCustomerPrice}\n🚚 সারা বাংলাদেশে হোম ডেলিভারি সুবিধা রয়েছে। অর্ডার করতে আপনার নাম, মোবাইল নম্বর ও সম্পূর্ণ ঠিকানা ইনবক্স করুন!`;
    navigator.clipboard.writeText(detailsText);
    toast.success(`কাস্টমার মূল্য (৳${finalCustomerPrice}) সহ বিবরণ কপি হয়েছে!`);
  };

  // Load products, user's reseller orders & deposit numbers
  useEffect(() => {
    let unsubs: (() => void)[] = [];
    let apiLoadedProducts: ResellProduct[] = [];
    let firestoreLoadedProducts: ResellProduct[] = [];

    const mergeAndSetProducts = () => {
      const map = new Map<string, ResellProduct>();
      apiLoadedProducts.forEach(p => map.set(p.id, p));
      firestoreLoadedProducts.forEach(p => map.set(p.id, p));
      const combined = Array.from(map.values());
      if (combined.length > 0) {
        setProducts(combined);
      } else {
        setProducts(DEFAULT_PRODUCTS);
      }
    };

    // Load deposit numbers for advance fee
    try {
      const unsubDep = onSnapshot(doc(db, "settings", "deposit"), (docSnap) => {
        if (docSnap.exists()) {
          const d = docSnap.data();
          setDepositNumbers({
            bkashNumber: d.bkashNumber || '017XX-XXXXXX',
            nagadNumber: d.nagadNumber || '018XX-XXXXXX'
          });
        }
      }, (err) => {
        console.warn("Deposit snapshot error handled:", err?.message);
      });
      unsubs.push(unsubDep);
    } catch (_) {}

    // Load products from Backend Persistent API
    fetch('/api/reselling-products')
      .then(res => res.json())
      .then(data => {
        if (data?.success && Array.isArray(data.products) && data.products.length > 0) {
          apiLoadedProducts = data.products;
          mergeAndSetProducts();
        }
      })
      .catch(() => {});

    // Load products from Firestore
    try {
      const q = query(collection(db, "reselling_products"));
      const unsubProd = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          firestoreLoadedProducts = snap.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          } as ResellProduct));
          mergeAndSetProducts();
        } else if (apiLoadedProducts.length === 0) {
          setProducts(DEFAULT_PRODUCTS);
        }
      }, (err) => {
        console.warn("Resell products snapshot error handled:", err?.message);
        mergeAndSetProducts();
      });
      unsubs.push(unsubProd);
    } catch (e) {
      mergeAndSetProducts();
    }

    // Load user orders
    if (user?.uid) {
      const uid = user.uid;

      // Read local cache for immediate display
      try {
        const localKey = `resell_orders_${uid}`;
        const cached = JSON.parse(localStorage.getItem(localKey) || '[]');
        if (Array.isArray(cached) && cached.length > 0) {
          setOrders(cached);
        }
      } catch (_) {}

      // 1. Direct user subcollection listener
      try {
        const userOrdersRef = collection(db, "users", uid, "reselling_orders");
        const unsubUserOrd = onSnapshot(userOrdersRef, (snap) => {
          const subList: ResellOrder[] = snap.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          } as ResellOrder));

          setOrders(prev => {
            const map = new Map<string, ResellOrder>();
            prev.forEach(o => map.set(o.id, o));
            subList.forEach(o => map.set(o.id, o));
            const merged = Array.from(map.values());
            merged.sort((a, b) => {
              const aTime = (a.createdAt as any)?.seconds || (a.createdAt as any)?.toMillis?.() || 0;
              const bTime = (b.createdAt as any)?.seconds || (b.createdAt as any)?.toMillis?.() || 0;
              return bTime - aTime;
            });
            return merged;
          });
          setLoading(false);
        }, (err) => {
          console.warn("User subcollection orders snapshot error handled:", err?.message);
          setLoading(false);
        });
        unsubs.push(unsubUserOrd);
      } catch (e) {
        setLoading(false);
      }

      // 1.5 Fetch from backend API
      fetch(`/api/reselling-orders?userId=${uid}`)
        .then(res => res.json())
        .then(data => {
          if (data?.success && Array.isArray(data.orders) && data.orders.length > 0) {
            setOrders(prev => {
              const map = new Map<string, ResellOrder>();
              prev.forEach(o => map.set(o.id, o));
              data.orders.forEach((o: any) => map.set(o.id, o));
              const merged = Array.from(map.values());
              merged.sort((a, b) => {
                const aTime = (a.createdAt as any)?.seconds || (a.createdAt as any)?.toMillis?.() || 0;
                const bTime = (b.createdAt as any)?.seconds || (b.createdAt as any)?.toMillis?.() || 0;
                return bTime - aTime;
              });
              return merged;
            });
          }
        })
        .catch(() => {});

      // 2. Also listen to top-level collection reselling_orders
      try {
        const qOrders = query(
          collection(db, "reselling_orders"),
          where("resellerId", "==", uid)
        );
        const unsubOrd = onSnapshot(qOrders, (snap) => {
          const rootList: ResellOrder[] = snap.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          } as ResellOrder));

          setOrders(prev => {
            const map = new Map<string, ResellOrder>();
            prev.forEach(o => map.set(o.id, o));
            rootList.forEach(o => map.set(o.id, o));
            const merged = Array.from(map.values());
            merged.sort((a, b) => {
              const aTime = (a.createdAt as any)?.seconds || (a.createdAt as any)?.toMillis?.() || 0;
              const bTime = (b.createdAt as any)?.seconds || (b.createdAt as any)?.toMillis?.() || 0;
              return bTime - aTime;
            });
            return merged;
          });
          setLoading(false);
        }, (err) => {
          console.warn("Resell orders root snapshot handled:", err?.message);
          setLoading(false);
        });
        unsubs.push(unsubOrd);
      } catch (e) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    return () => {
      unsubs.forEach(fn => fn());
    };
  }, [user?.uid]);

  // Calculate order delivery fee for current user
  // First 2 orders per user get 120 BDT delivery fee
  const userOrderCount = orders.length;
  const isEligibleFor120Delivery = userOrderCount < 2;
  const deliveryFee = isEligibleFor120Delivery ? 120 : 0;

  const handleOpenOrderModal = (product: ResellProduct) => {
    const effectivePrice = getEffectiveResalePrice(product);
    setSelectedProduct(product);
    setModalSlideIndex(cardSlideIndex[product.id] || 0);
    setCustomResalePrice(effectivePrice);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setCustomerNote('');
    setTrxId('');
  };

  const handleOpenLightbox = (product: ResellProduct, startIndex: number = 0) => {
    setLightboxProduct(product);
    setLightboxIndex(startIndex);
    setZoomScale(1);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !user) return;

    const maxPrice = getMaxResalePrice(selectedProduct);
    const resaleVal = Number(customResalePrice);
    if (!resaleVal || resaleVal < selectedProduct.wholesalePrice) {
      toast.error(`বিক্রয়মূল্য আমাদের দেওয়া প্রাইস (৳${selectedProduct.wholesalePrice}) এর কম হতে পারবে না!`);
      return;
    }
    if (resaleVal > maxPrice) {
      toast.error(`বিক্রয়মূল্য সর্বোচ্চ ৳${maxPrice} এর বেশি হতে পারবে না (সীমা: ৳${selectedProduct.wholesalePrice} - ৳${maxPrice})!`);
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      toast.error("কাস্টমারের নাম, ফোন নম্বর এবং সম্পূর্ণ ঠিকানা দেওয়া আবশ্যক!");
      return;
    }

    if (isEligibleFor120Delivery && !trxId.trim()) {
      toast.error("প্রথম ২টি অর্ডারের জন্য ১২০ টাকা ডেলিভারি ফি সেন্ড মানি করে TrxID প্রদান করুন!");
      return;
    }

    setSubmitting(true);
    try {
      const profit = resaleVal - selectedProduct.wholesalePrice;
      const orderNumberIndex = userOrderCount + 1;
      const prodImages = getProductImages(selectedProduct);

      // Create doc in user subcollection first (guaranteed permitted: users/{uid}/**)
      const userOrderRef = doc(collection(db, "users", user.uid, "reselling_orders"));
      const orderId = userOrderRef.id;

      const newOrder = {
        id: orderId,
        userId: user.uid,
        resellerId: user.uid,
        resellerName: profile?.fullName || profile?.name || user.email?.split('@')[0] || 'Reseller',
        resellerEmail: user.email || '',
        productId: selectedProduct.id,
        productTitle: selectedProduct.title,
        productImage: prodImages[0] || selectedProduct.imageUrl,
        wholesalePrice: selectedProduct.wholesalePrice,
        resalePrice: resaleVal,
        profit: profit,
        deliveryFee: deliveryFee,
        advanceFeePaid: isEligibleFor120Delivery ? 120 : 0,
        paymentMethod: isEligibleFor120Delivery ? paymentMethod : 'none',
        trxId: isEligibleFor120Delivery ? trxId.trim() : '',
        orderNumberIndex: orderNumberIndex,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        customerNote: customerNote.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      };

      // 1. Sync to backend persistent storage immediately (guaranteed fast & offline-resilient)
      try {
        await fetch("/api/reselling-orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newOrder,
            createdAt: { seconds: Math.floor(Date.now() / 1000) }
          })
        });
      } catch (_) {}

      // 2. Write to user subcollection & root collection (with timeout so offline Firestore never blocks UI)
      try {
        await Promise.race([
          setDoc(userOrderRef, newOrder),
          new Promise((resolve) => setTimeout(resolve, 3500))
        ]);
      } catch (subErr: any) {
        console.warn("User reselling_orders write caught (handled):", subErr?.message);
      }

      try {
        await Promise.race([
          setDoc(doc(db, "reselling_orders", orderId), newOrder),
          new Promise((resolve) => setTimeout(resolve, 2500))
        ]);
      } catch (rootErr: any) {
        console.warn("Root reselling_orders write caught (handled):", rootErr?.message);
      }

      // Cache locally for offline resilience
      try {
        const localKey = `resell_orders_${user.uid}`;
        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
        localStorage.setItem(localKey, JSON.stringify([newOrder, ...existing.filter((o: any) => o.id !== orderId)].slice(0, 50)));
      } catch (_) {}

      // Optimistically show in orders list
      setOrders(prev => {
        const item: ResellOrder = {
          ...newOrder,
          createdAt: { seconds: Math.floor(Date.now() / 1000) }
        } as any;
        return [item, ...prev.filter(o => o.id !== orderId)];
      });

      toast.success("অর্ডারটি সফলভাবে সাবমিট হয়েছে! এডমিন পেমেন্ট ও তথ্য যাচাই করে ডেলিভারি পাঠাবে।");
      setSelectedProduct(null);
      setTrxId('');
      setActiveTab('my_orders');
    } catch (err: any) {
      console.error("Reselling order error:", err);
      toast.error("অর্ডার সাবমিট করতে সমস্যা হয়েছে: " + (err?.message || "Error"));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-6 px-4 pb-28 max-w-lg mx-auto text-white select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 bg-[#151515] border border-[#3D3215] hover:border-[#D4A017] rounded-full flex items-center justify-center text-[#A3A3A3] hover:text-[#FACC15] transition active:scale-95 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-display font-black tracking-tight text-white flex items-center justify-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#FACC15]" />
            <span className="bg-gradient-to-r from-[#D4A017] via-[#FACC15] to-[#FFE082] bg-clip-text text-transparent">
              প্রোডাক্ট রিসেলিং জোন
            </span>
          </h2>
          <p className="text-[10px] text-[#A3A3A3] font-bold uppercase tracking-widest mt-0.5">
            পাইকারি দামে কিনে লাভসহ কাস্টমারের কাছে সেল করুন
          </p>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Special Offer Alert: First 2 Orders 120 BDT Delivery Fee */}
      <div className="bg-gradient-to-r from-[#1C1C1C] via-[#151515] to-[#1C1C1C] border border-[#D4A017]/50 rounded-2xl p-4 mb-5 shadow-lg relative overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FACC15]/20 border border-[#FACC15]/40 text-[#FACC15] flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-[#FACC15] uppercase tracking-wider">ডেলিভারি চার্জ অফার</h4>
              <span className="px-2 py-0.5 rounded-md bg-[#FACC15]/10 border border-[#FACC15]/30 text-[#FACC15] text-[9px] font-black">
                অর্ডার: {userOrderCount}/২
              </span>
            </div>
            <p className="text-[11px] text-white font-bold mt-1 leading-snug">
              {isEligibleFor120Delivery ? (
                <span>আপনার প্রথম ২ টি অর্ডারে ফিক্সড <strong className="text-[#FACC15]">৳১২০ টাকা</strong> ডেলিভারি চার্জ থাকবে। কাস্টমারের তথ্য দিয়ে সরাসরি সেল করুন!</span>
              ) : (
                <span>আপনার প্রথম ২ টি অর্ডারের ডেলিভারি চার্জ ডিসকাউন্ট সম্পন্ন হয়েছে। পরবর্তী অর্ডারে স্ট্যান্ডার্ড ডেলিভারি নিয়ম প্রযোজ্য।</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="grid grid-cols-2 p-1.5 bg-[#151515] border border-[#3D3215] rounded-2xl gap-1.5 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] shadow-lg shadow-[#D4A017]/20'
              : 'text-[#A3A3A3] hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          প্রোডাক্ট ক্যাটালগ ({filteredProducts.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my_orders')}
          className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all relative cursor-pointer ${
            activeTab === 'my_orders'
              ? 'bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] shadow-lg shadow-[#D4A017]/20'
              : 'text-[#A3A3A3] hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          আমার অর্ডারস ({orders.length})
          {orders.filter(o => o.status === 'pending').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-black animate-pulse">
              {orders.filter(o => o.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: PRODUCT CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
            <input
              type="text"
              placeholder="প্রোডাক্ট বা ক্যাটাগরি দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#151515] border border-[#3D3215] pl-10 pr-4 py-3 rounded-2xl text-xs font-bold text-white placeholder-[#737373] focus:border-[#FACC15] outline-none"
            />
          </div>

          {/* Product Cards Grid */}
          <div className="space-y-5">
            {filteredProducts.map((product) => {
              const maxSellingPrice = getMaxResalePrice(product);
              const rawCustomPrice = productCustomPrices[product.id];
              const inputSellingPrice = rawCustomPrice !== undefined ? rawCustomPrice : maxSellingPrice;
              const effectiveResalePrice = getEffectiveResalePrice(product);
              const estProfit = Math.max(0, effectiveResalePrice - product.wholesalePrice);
              const prodImages = getProductImages(product);
              const activeIdx = Math.min(cardSlideIndex[product.id] || 0, prodImages.length - 1);
              const currentImage = prodImages[activeIdx] || prodImages[0];

              return (
                <div 
                  key={product.id}
                  className="bg-[#151515] rounded-[24px] p-4 border border-[#3D3215] hover:border-[#D4A017]/60 transition-all shadow-xl flex flex-col justify-between gap-3.5 relative overflow-hidden"
                >
                  {/* Multi-Photo Interactive Slider & Gallery */}
                  <div className="space-y-2">
                    <div className="relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden bg-[#101010] border border-[#3D3215] group">
                      <img 
                        src={currentImage} 
                        alt={product.title}
                        onClick={() => handleOpenLightbox(product, activeIdx)}
                        className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-[1.02]" 
                      />

                      {/* Category & Stock Top Left Overlay */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-[#FACC15]/40 text-[#FACC15] text-[10px] font-black uppercase">
                          {product.category}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[10px] font-black">
                          স্টক: {product.stock} টি
                        </span>
                      </div>

                      {/* Photo Count & Fullscreen Zoom Button Top Right */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        {prodImages.length > 1 && (
                          <span className="px-2 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/15 text-white text-[10px] font-black flex items-center gap-1">
                            <Camera className="w-3 h-3 text-[#FACC15]" />
                            {activeIdx + 1}/{prodImages.length}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenLightbox(product, activeIdx)}
                          className="w-7 h-7 rounded-lg bg-black/75 hover:bg-[#FACC15] text-white hover:text-black border border-white/20 flex items-center justify-center transition cursor-pointer"
                          title="ফুলস্ক্রিন জুম ভিউ"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Prev / Next Slider Arrows (When multiple photos exist) */}
                      {prodImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCardSlideIndex(prev => ({
                                ...prev,
                                [product.id]: (activeIdx - 1 + prodImages.length) % prodImages.length
                              }));
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/75 hover:bg-[#FACC15] text-white hover:text-black border border-white/20 flex items-center justify-center transition cursor-pointer shadow-lg"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCardSlideIndex(prev => ({
                                ...prev,
                                [product.id]: (activeIdx + 1) % prodImages.length
                              }));
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/75 hover:bg-[#FACC15] text-white hover:text-black border border-white/20 flex items-center justify-center transition cursor-pointer shadow-lg"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Gallery Strip (When > 1 image) */}
                    {prodImages.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {prodImages.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCardSlideIndex(prev => ({ ...prev, [product.id]: idx }))}
                            className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                              idx === activeIdx
                                ? 'border-[#FACC15] scale-105 shadow-md shadow-[#FACC15]/20'
                                : 'border-[#3D3215] opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Title, Description & Simple 3-Box Price + Auto Profit Display */}
                  <div className="space-y-2.5">
                    <h3 className="text-sm font-black text-white leading-snug">
                      {product.title}
                    </h3>
                    <p className="text-[11px] text-[#A3A3A3] line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Clean 3-Column Price Box: Admin Fixed Price (350) -> Reseller Selling Price (350-500) -> Auto Profit (150) */}
                    <div className="bg-[#101010] p-3.5 rounded-2xl border border-[#3D3215] space-y-2.5">
                      <div className="grid grid-cols-3 gap-2 items-center">
                        {/* 1. Admin Fixed Price */}
                        <div className="bg-[#151515] p-2.5 rounded-xl border border-[#3D3215] text-center">
                          <span className="text-[9px] text-[#A3A3A3] font-black block uppercase">আমাদের প্রাইস</span>
                          <span className="text-sm font-black text-white mt-0.5 block">৳{product.wholesalePrice}</span>
                        </div>

                        {/* 2. Reseller Selling Price Input (350 - 500) */}
                        <div className="bg-[#151515] p-2 rounded-xl border border-[#FACC15]/50 text-center">
                          <span className="text-[9px] text-[#FACC15] font-black block uppercase">
                            বিক্রয়মূল্য (৳{product.wholesalePrice}-{maxSellingPrice})
                          </span>
                          <div className="flex items-center justify-center gap-0.5 mt-0.5">
                            <span className="text-xs font-black text-[#FACC15]">৳</span>
                            <input
                              type="number"
                              min={product.wholesalePrice}
                              max={maxSellingPrice}
                              value={inputSellingPrice}
                              onChange={(e) => handleSetProductResalePrice(product, e.target.value)}
                              onBlur={() => {
                                const val = Number(inputSellingPrice);
                                if (!val || val < product.wholesalePrice) {
                                  handleSetProductResalePrice(product, String(product.wholesalePrice));
                                } else if (val > maxSellingPrice) {
                                  handleSetProductResalePrice(product, String(maxSellingPrice));
                                }
                              }}
                              className="w-16 bg-[#090909] border border-[#3D3215] focus:border-[#FACC15] px-1.5 py-0.5 rounded-lg text-xs font-black text-[#FACC15] text-center outline-none"
                              title={`৳${product.wholesalePrice} থেকে ৳${maxSellingPrice} এর মধ্যে বিক্রয়মূল্য লিখুন`}
                            />
                          </div>
                        </div>

                        {/* 3. Auto Profit Display */}
                        <div className="bg-emerald-950/25 p-2.5 rounded-xl border border-emerald-500/40 text-center">
                          <span className="text-[9px] text-emerald-400 font-black block uppercase">আপনার প্রফিট</span>
                          <span className="text-sm font-black text-emerald-400 mt-0.5 block">+৳{estProfit}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-[#3D3215]/60 text-[10px]">
                        <span className="text-[#A3A3A3] font-bold">
                          বিক্রয় সীমা: <strong className="text-[#FACC15]">৳{product.wholesalePrice} – ৳{maxSellingPrice}</strong> (যা বেশিতে বিক্রি করবেন সেটাই লাভ)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reseller Toolkit: Download Photos & Copy Description */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={downloadingId === product.id}
                      onClick={() => handleDownloadProductPhotos(product)}
                      className="py-2.5 px-3 rounded-xl bg-[#1C1C1C] hover:bg-[#262626] border border-[#3D3215] hover:border-[#FACC15]/50 text-[#FACC15] text-[11px] font-black flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>
                        {downloadingId === product.id
                          ? 'ডাউনলোড হচ্ছে...'
                          : prodImages.length > 1
                            ? `সব ছবি ডাউনলোড (${prodImages.length})`
                            : 'ছবি ডাউনলোড'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyProductDetails(product)}
                      className="py-2.5 px-3 rounded-xl bg-[#1C1C1C] hover:bg-[#262626] border border-[#3D3215] hover:border-[#FACC15]/50 text-white text-[11px] font-black flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#FACC15]" />
                      <span>বিবরণ কপি (৳{effectiveResalePrice})</span>
                    </button>
                  </div>

                  {/* Resell Order Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenOrderModal(product)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer hover:opacity-95 active:scale-[0.98] transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    কাস্টমারের জন্য সেল করুন (৳{effectiveResalePrice})
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MY RESELLER ORDERS */}
      {activeTab === 'my_orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-[#151515] rounded-[24px] p-8 border border-[#3D3215] text-center space-y-3">
              <Package className="w-10 h-10 text-[#737373] mx-auto" />
              <h3 className="text-sm font-black text-white uppercase">এখনো কোনো রিসেলিং অর্ডার করা হয়নি</h3>
              <p className="text-xs text-[#A3A3A3]">ক্যাটালগ থেকে প্রোডাক্ট নির্বাচন করে কাস্টমারের ঠিকানায় সরাসরি অর্ডার করুন।</p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="px-5 py-2.5 rounded-xl bg-[#262626] text-[#FACC15] border border-[#3D3215] text-xs font-bold uppercase tracking-wider inline-block cursor-pointer hover:bg-[#333333]"
              >
                প্রোডাক্টস দেখুন
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const isPending = order.status === 'pending';
              const isProcessing = order.status === 'processing';
              const isDelivered = order.status === 'delivered';
              const isCancelled = order.status === 'cancelled';

              return (
                <div 
                  key={order.id}
                  className="bg-[#151515] rounded-[24px] p-4 border border-[#3D3215] space-y-3 shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <img 
                      src={order.productImage} 
                      alt="" 
                      className="w-16 h-16 rounded-xl object-cover bg-[#101010] border border-[#3D3215] shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[9px] font-black text-[#A3A3A3] uppercase">
                          অর্ডার #{order.orderNumberIndex}
                        </span>

                        {isDelivered && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-black flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            ডেলিভার্ড (প্রফিট ক্যাশব্যাক)
                          </span>
                        )}
                        {isProcessing && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[9px] font-black flex items-center gap-1">
                            <Truck className="w-2.5 h-2.5 animate-pulse" />
                            ডেলিভারি চলমান
                          </span>
                        )}
                        {isPending && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[9px] font-black flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 animate-spin" />
                            যাচাই চলছে
                          </span>
                        )}
                        {isCancelled && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[9px] font-black flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5" />
                            বাতিল
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-black text-white leading-tight line-clamp-1">
                        {order.productTitle}
                      </h4>
                      
                      <div className="flex items-center justify-between text-[10px] mt-1.5">
                        <span className="text-[#A3A3A3] font-bold">বিক্রয়মূল্য: ৳{order.resalePrice}</span>
                        <span className="text-emerald-400 font-black">প্রফিট: +৳{order.profit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info Box */}
                  <div className="bg-[#101010] p-3 rounded-2xl border border-[#3D3215] text-[10px] space-y-1">
                    <p className="text-white font-bold flex items-center gap-1.5">
                      <User className="w-3 h-3 text-[#FACC15]" />
                      কাস্টমার: {order.customerName} ({order.customerPhone})
                    </p>
                    <p className="text-[#A3A3A3] font-medium flex items-start gap-1.5">
                      <MapPin className="w-3 h-3 text-[#FACC15] shrink-0 mt-0.5" />
                      ঠিকানা: {order.customerAddress}
                    </p>
                    {order.customerNote && (
                      <p className="text-[#737373] italic pt-0.5">
                        নোট: "{order.customerNote}"
                      </p>
                    )}
                    <p className="text-amber-400 font-bold pt-1 border-t border-[#3D3215]/60 flex items-center justify-between">
                      <span>ডেলিভারি চার্জ: ৳{order.deliveryFee}</span>
                      <span className="text-[#A3A3A3]">মোট পাইকারি পরিশোধ: ৳{order.wholesalePrice + order.deliveryFee}</span>
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* RESELL ORDER SUBMISSION MODAL */}
      <AnimatePresence>
        {selectedProduct && (() => {
          const modalImages = getProductImages(selectedProduct);
          const safeModalIdx = Math.min(modalSlideIndex, modalImages.length - 1);
          const activeModalImg = modalImages[safeModalIdx] || modalImages[0];

          return (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !submitting && setSelectedProduct(null)}
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
                      রিসেলিং অর্ডার ফর্ম
                    </h3>
                  </div>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setSelectedProduct(null)}
                    className="w-7 h-7 rounded-full bg-[#1C1C1C] border border-[#3D3215] text-[#A3A3A3] hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmitOrder} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                  <div className="p-5 overflow-y-auto space-y-4 flex-1">
                  
                  {/* Product Summary & Multi-Photo Switcher Box */}
                  <div className="bg-[#101010] p-3 rounded-2xl border border-[#3D3215] space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          onClick={() => handleOpenLightbox(selectedProduct, safeModalIdx)}
                          className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#3D3215] shrink-0 cursor-zoom-in group"
                        >
                          <img 
                            src={activeModalImg} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <Maximize2 className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-white truncate max-w-[190px]">
                            {selectedProduct.title}
                          </h4>
                          <p className="text-[10px] text-[#FACC15] font-black mt-0.5">
                            পাইকারি দাম: ৳{selectedProduct.wholesalePrice}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDownloadProductPhotos(selectedProduct)}
                          className="p-2 rounded-xl bg-[#1C1C1C] border border-[#3D3215] text-[#FACC15] hover:border-[#FACC15] cursor-pointer"
                          title="সব ছবি ডাউনলোড করুন"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyProductDetails(selectedProduct)}
                          className="p-2 rounded-xl bg-[#1C1C1C] border border-[#3D3215] text-white hover:border-[#FACC15] cursor-pointer"
                          title="বিবরণ কপি করুন"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {modalImages.length > 1 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
                        {modalImages.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setModalSlideIndex(i)}
                            className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                              i === safeModalIdx ? 'border-[#FACC15]' : 'border-[#3D3215] opacity-60'
                            }`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Simple Fixed Price -> Selling Price (350-500) -> Auto Profit Box inside Order Modal */}
                  <div className="bg-[#101010] p-4 rounded-2xl border border-[#3D3215] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#FACC15] uppercase tracking-wider">
                        প্রোডাক্ট প্রাইসিং ও আপনার প্রফিট
                      </span>
                      <span className="text-[10px] font-black text-[#A3A3A3]">
                        বিক্রয় সীমা: ৳{selectedProduct.wholesalePrice} – ৳{getMaxResalePrice(selectedProduct)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-stretch">
                      {/* 1. Admin Fixed Price */}
                      <div className="bg-[#151515] p-2.5 rounded-xl border border-[#3D3215] flex flex-col justify-center text-center">
                        <span className="text-[9px] font-black text-[#A3A3A3] uppercase block mb-1">
                          আমাদের প্রাইস
                        </span>
                        <span className="text-sm font-black text-white">
                          ৳{selectedProduct.wholesalePrice}
                        </span>
                      </div>

                      {/* 2. Reseller Selling Price Input */}
                      <div className="bg-[#151515] p-2.5 rounded-xl border border-[#FACC15]/60 flex flex-col justify-center text-center">
                        <label className="text-[9px] font-black text-[#FACC15] uppercase block mb-1">
                          বিক্রয়মূল্য (৳)
                        </label>
                        <input
                          type="number"
                          required
                          min={selectedProduct.wholesalePrice}
                          max={getMaxResalePrice(selectedProduct)}
                          placeholder={`${getMaxResalePrice(selectedProduct)}`}
                          value={customResalePrice}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const val = raw === '' ? '' : Number(raw);
                            setCustomResalePrice(val);
                            handleSetProductResalePrice(selectedProduct, raw);
                          }}
                          className="w-full bg-[#090909] border border-[#3D3215] focus:border-[#FACC15] px-2 py-1 rounded-lg text-sm font-black text-[#FACC15] text-center outline-none"
                        />
                      </div>

                      {/* 3. Auto Profit */}
                      <div className="bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/40 flex flex-col justify-center text-center">
                        <span className="text-[9px] font-black text-emerald-400 uppercase block mb-1">
                          আপনার প্রফিট
                        </span>
                        <span className="text-sm font-black text-emerald-400">
                          +৳{Math.max(0, (Number(customResalePrice) || 0) - selectedProduct.wholesalePrice)}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-[#A3A3A3] font-bold">
                      * আমাদের দেওয়া দাম <strong className="text-white">৳{selectedProduct.wholesalePrice}</strong> ফিক্সড। আপনি <strong className="text-[#FACC15]">৳{selectedProduct.wholesalePrice} – ৳{getMaxResalePrice(selectedProduct)}</strong> এর ভেতর যত টাকায় বিক্রি করবেন সেটাই আপনার প্রফিট।
                    </p>

                    {/* Customer Final Payable Summary */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#3D3215] text-xs">
                      <span className="text-[#A3A3A3] font-bold">ডেলিভারিসহ কাস্টমারের মোট বিল:</span>
                      <span className="font-black text-white text-sm">
                        ৳{(Number(customResalePrice) || 0) + deliveryFee}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Charge Calculation Box */}
                  <div className="bg-[#101010] p-3 rounded-2xl border border-[#3D3215] text-[10px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">ডেলিভারি চার্জ:</span>
                      <span className="text-[#FACC15] font-black">৳{deliveryFee}</span>
                    </div>
                    {isEligibleFor120Delivery ? (
                      <p className="text-emerald-400 text-[9px] font-bold">
                        ✓ প্রথম ২ টি অর্ডারের জন্য স্পেশাল ফিক্সড ৳১২০ ডেলিভারি চার্জ প্রযোজ্য।
                      </p>
                    ) : (
                      <p className="text-[#A3A3A3] text-[9px]">
                        স্ট্যান্ডার্ড ডেলিভারি চার্জ হিসাব করা হয়েছে।
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-[#3D3215] text-xs">
                      <span className="text-[#A3A3A3] font-bold">মোট পাইকারি খরচে আপনার পরিশোধ:</span>
                      <span className="text-white font-black">৳{selectedProduct.wholesalePrice + deliveryFee}</span>
                    </div>
                  </div>

                  {/* Advance Delivery Fee Payment Box (For First 2 Orders) */}
                  {isEligibleFor120Delivery && (
                    <div className="bg-gradient-to-br from-[#1C1C1C] via-[#151515] to-[#201A08] border border-[#FACC15]/40 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#FACC15]" />
                        <h4 className="text-xs font-black text-[#FACC15] uppercase tracking-wider">
                          অগ্রীম ৳১২০ টাকা ডেলিভারি চার্জ পেমেন্ট
                        </h4>
                      </div>
                      <p className="text-[10px] text-[#A3A3A3] font-bold leading-relaxed">
                        আপনার ১ম/২য় রিসেলিং অর্ডারের জন্য অগ্রীম ৳১২০ টাকা নিচে প্রদত্ত নম্বরে সেন্ড মানি/ক্যাশ ইন করে TrxID দিয়ে সাবমিট করুন:
                      </p>

                      {/* Numbers Grid */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-black">
                        <div className="bg-[#101010] p-2.5 rounded-xl border border-[#3D3215]">
                          <span className="text-[#FACC15] block text-[9px] uppercase font-bold">Bkash Personal/Send Money</span>
                          <div className="flex items-center justify-between mt-1 text-white">
                            <span className="font-mono">{depositNumbers.bkashNumber}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(depositNumbers.bkashNumber);
                                toast.success("Bkash নম্বর কপি করা হয়েছে!");
                              }}
                              className="p-1 hover:text-[#FACC15] text-[#A3A3A3] cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="bg-[#101010] p-2.5 rounded-xl border border-[#3D3215]">
                          <span className="text-[#FACC15] block text-[9px] uppercase font-bold">Nagad Personal/Send Money</span>
                          <div className="flex items-center justify-between mt-1 text-white">
                            <span className="font-mono">{depositNumbers.nagadNumber}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(depositNumbers.nagadNumber);
                                toast.success("Nagad নম্বর কপি করা হয়েছে!");
                              }}
                              className="p-1 hover:text-[#FACC15] text-[#A3A3A3] cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Payment Method Selector */}
                      <div>
                        <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-wider block mb-1">
                          পেমেন্ট মেথড নির্বাচন করুন
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('bkash')}
                            className={`py-2 px-3 rounded-xl text-xs font-black border transition cursor-pointer ${
                              paymentMethod === 'bkash'
                                ? 'bg-pink-950/40 border-pink-500 text-pink-400'
                                : 'bg-[#101010] border-[#3D3215] text-[#A3A3A3]'
                            }`}
                          >
                            Bkash (বিকাশ)
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('nagad')}
                            className={`py-2 px-3 rounded-xl text-xs font-black border transition cursor-pointer ${
                              paymentMethod === 'nagad'
                                ? 'bg-orange-950/40 border-orange-500 text-orange-400'
                                : 'bg-[#101010] border-[#3D3215] text-[#A3A3A3]'
                            }`}
                          >
                            Nagad (নগদ)
                          </button>
                        </div>
                      </div>

                      {/* TrxID Input */}
                      <div>
                        <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-wider block mb-1">
                          পেমেন্ট Transaction ID (TrxID)
                        </label>
                        <input
                          type="text"
                          required={isEligibleFor120Delivery}
                          placeholder="যেমন: BAX9281034"
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value)}
                          className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-xl text-xs font-mono font-bold text-[#FACC15] placeholder-[#737373] focus:border-[#FACC15] outline-none uppercase"
                        />
                      </div>
                    </div>
                  )}

                  {/* Customer Delivery Information */}
                  <div className="space-y-3 pt-1">
                    <h4 className="text-xs font-black text-[#FACC15] uppercase tracking-wider pl-1">
                      কাস্টমারের ডেলিভারি তথ্য
                    </h4>

                    <div>
                      <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-wider block mb-1 pl-1">
                        ১. কাস্টমারের নাম (Customer Name)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: মোঃ সাকিব হোসেন"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-xl text-xs font-bold text-white placeholder-[#737373] focus:border-[#FACC15] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-wider block mb-1 pl-1">
                        ২. কাস্টমারের মোবাইল নম্বর (Phone)
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="01712345678"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-xl text-xs font-bold text-white placeholder-[#737373] focus:border-[#FACC15] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-wider block mb-1 pl-1">
                        ৩. কাস্টমারের সম্পূর্ণ ডেলিভারি ঠিকানা (Address)
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="জেলা, থানা, বাসা নং ও এলাকা..."
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-xl text-xs font-bold text-white placeholder-[#737373] focus:border-[#FACC15] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-wider block mb-1 pl-1">
                        ৪. বিশেষ নোট (Optional Note)
                      </label>
                      <input
                        type="text"
                        placeholder="সাইজ, কালার বা বিশেষ কোনো তথ্য..."
                        value={customerNote}
                        onChange={(e) => setCustomerNote(e.target.value)}
                        className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-xl text-xs font-bold text-white placeholder-[#737373] focus:border-[#FACC15] outline-none"
                      />
                    </div>
                  </div>
                  </div>

                  {/* Sticky Order Submit Button Footer */}
                  <div className="p-4 bg-[#101010] border-t border-[#3D3215] shrink-0">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {submitting ? (
                        <span>প্রসেসিং হচ্ছে...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>অর্ডার প্লেস করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* FULLSCREEN ZOOM LIGHTBOX GALLERY MODAL */}
      <AnimatePresence>
        {lightboxProduct && (() => {
          const lbImages = getProductImages(lightboxProduct);
          const safeLbIdx = Math.min(lightboxIndex, lbImages.length - 1);
          const currentLbImg = lbImages[safeLbIdx] || lbImages[0];

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 z-[140] backdrop-blur-lg flex flex-col justify-between p-4 select-none"
            >
              {/* Top Toolbar */}
              <div className="flex items-center justify-between gap-2 bg-[#151515]/90 border border-[#3D3215] rounded-2xl px-4 py-3">
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-white truncate max-w-[160px] sm:max-w-xs">
                    {lightboxProduct.title}
                  </h4>
                  <span className="text-[10px] text-[#FACC15] font-black">
                    ছবি {safeLbIdx + 1} / {lbImages.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoomScale(prev => (prev >= 2.2 ? 1 : Number((prev + 0.6).toFixed(1))))}
                    className="px-2.5 py-1.5 rounded-xl bg-[#1C1C1C] border border-[#3D3215] text-white hover:border-[#FACC15] text-[10px] font-black flex items-center gap-1 cursor-pointer"
                  >
                    {zoomScale > 1 ? <ZoomOut className="w-3.5 h-3.5 text-[#FACC15]" /> : <ZoomIn className="w-3.5 h-3.5 text-[#FACC15]" />}
                    <span>{zoomScale}x</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadProductPhotos(lightboxProduct, safeLbIdx)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#1C1C1C] border border-[#3D3215] text-[#FACC15] hover:border-[#FACC15] text-[10px] font-black flex items-center gap-1 cursor-pointer"
                    title="এই ছবিটি ডাউনলোড করুন"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">ডাউনলোড</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLightboxProduct(null);
                      setZoomScale(1);
                    }}
                    className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 hover:bg-rose-600 hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Center Interactive Image Area */}
              <div className="relative flex-1 flex items-center justify-center overflow-auto my-3">
                <img
                  src={currentLbImg}
                  alt={lightboxProduct.title}
                  onClick={() => setZoomScale(prev => (prev > 1 ? 1 : 2))}
                  style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center' }}
                  className="max-h-[68vh] max-w-full object-contain rounded-2xl transition-transform duration-200 cursor-zoom-in"
                />

                {lbImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setZoomScale(1);
                        setLightboxIndex((safeLbIdx - 1 + lbImages.length) % lbImages.length);
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/80 border border-[#FACC15]/40 text-[#FACC15] hover:bg-[#FACC15] hover:text-black flex items-center justify-center shadow-xl cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setZoomScale(1);
                        setLightboxIndex((safeLbIdx + 1) % lbImages.length);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/80 border border-[#FACC15]/40 text-[#FACC15] hover:bg-[#FACC15] hover:text-black flex items-center justify-center shadow-xl cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Bottom Thumbnail Strip & Action Footer */}
              <div className="bg-[#151515]/90 border border-[#3D3215] rounded-2xl p-3 space-y-2.5">
                {lbImages.length > 1 && (
                  <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
                    {lbImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setZoomScale(1);
                          setLightboxIndex(i);
                        }}
                        className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                          i === safeLbIdx ? 'border-[#FACC15] scale-105' : 'border-[#3D3215] opacity-50 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadProductPhotos(lightboxProduct)}
                    className="py-2.5 rounded-xl bg-[#1C1C1C] border border-[#3D3215] text-[#FACC15] text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>সব ছবি ডাউনলোড ({lbImages.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const prod = lightboxProduct;
                      setLightboxProduct(null);
                      setZoomScale(1);
                      handleOpenOrderModal(prod);
                    }}
                    className="py-2.5 rounded-xl bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-black text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>অর্ডার করুন</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
