import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingBag, Truck, CheckCircle2, Clock, 
  AlertCircle, DollarSign, User, Phone, MapPin, Search, 
  Sparkles, Package, ShieldCheck, ChevronRight, X, Plus, Info, ExternalLink 
} from 'lucide-react';
import { db } from '../lib/firebase';
import { 
  collection, query, where, getDocs, addDoc, 
  serverTimestamp, doc, updateDoc, increment, orderBy, onSnapshot 
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
    wholesalePrice: 450,
    minResalePrice: 650,
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600&auto=format&fit=crop',
    category: 'গ্যাজেট',
    stock: 50
  },
  {
    id: 'prod_2',
    title: 'ওয়্যারলেস এয়ারপডস ও ব্লুটুথ হেডফোন (AirPods Pro)',
    description: 'নয়েজ ক্যানসেলেশন, টাচ কন্ট্রোল, ক্রিস্টাল ক্লিয়ার বেস সাউন্ড ও অতিরিক্ত ৩ দিন ব্যাটারি ব্যাকআপ কেস।',
    wholesalePrice: 380,
    minResalePrice: 550,
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=600&auto=format&fit=crop',
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
    category: 'পার্সোনাল কেয়ার',
    stock: 45
  },
  {
    id: 'prod_4',
    title: 'প্রিমিয়াম ওয়াটারপ্রুফ ব্যাকপ্যাক (Laptop Travel Bag)',
    description: 'ইউএসবি পোর্ট, অ্যান্টি-থেফট জিপার, ওয়াটারপ্রুফ অক্সফোর্ড ফেব্রিক ও ১৫.৬ ইঞ্চি ল্যাপটপ রাখার সুবিধা।',
    wholesalePrice: 620,
    minResalePrice: 890,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
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
  
  // Order Modal
  const [selectedProduct, setSelectedProduct] = useState<ResellProduct | null>(null);
  const [customResalePrice, setCustomResalePrice] = useState<number | ''>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load products & user's reseller orders
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    // Load products
    try {
      const q = query(collection(db, "reselling_products"));
      const unsubProd = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const list: ResellProduct[] = snap.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          } as ResellProduct));
          setProducts(list);
        } else {
          setProducts(DEFAULT_PRODUCTS);
        }
      });
      unsubs.push(unsubProd);
    } catch (e) {
      setProducts(DEFAULT_PRODUCTS);
    }

    // Load user orders
    if (user?.uid) {
      try {
        const qOrders = query(
          collection(db, "reselling_orders"),
          where("resellerId", "==", user.uid)
        );
        const unsubOrd = onSnapshot(qOrders, (snap) => {
          const ordList: ResellOrder[] = snap.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          } as ResellOrder));
          
          ordList.sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() || 0;
            const bTime = b.createdAt?.toMillis?.() || 0;
            return bTime - aTime;
          });
          setOrders(ordList);
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
    setSelectedProduct(product);
    setCustomResalePrice(product.minResalePrice);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setCustomerNote('');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !user) return;

    const resaleVal = Number(customResalePrice);
    if (!resaleVal || resaleVal < selectedProduct.wholesalePrice) {
      toast.error(`কাস্টম রিসেল দাম অন্তত পাইকারি মূল্য ৳${selectedProduct.wholesalePrice} এর বেশি হতে হবে!`);
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      toast.error("কাস্টমারের নাম, ফোন নম্বর এবং সম্পূর্ণ ঠিকানা দেওয়া আবশ্যক!");
      return;
    }

    setSubmitting(true);
    try {
      const profit = resaleVal - selectedProduct.wholesalePrice;
      const orderNumberIndex = userOrderCount + 1;

      const newOrder = {
        resellerId: user.uid,
        resellerName: profile?.fullName || profile?.name || user.email?.split('@')[0] || 'Reseller',
        resellerEmail: user.email || '',
        productId: selectedProduct.id,
        productTitle: selectedProduct.title,
        productImage: selectedProduct.imageUrl,
        wholesalePrice: selectedProduct.wholesalePrice,
        resalePrice: resaleVal,
        profit: profit,
        deliveryFee: deliveryFee,
        orderNumberIndex: orderNumberIndex,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        customerNote: customerNote.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "reselling_orders"), newOrder);

      toast.success("অর্ডারটি সফলভাবে সাবমিট হয়েছে! এডমিন যাচাই করে কাস্টমারের কাছে ডেলিভারি পাঠাবে।");
      setSelectedProduct(null);
      setActiveTab('my_orders');
    } catch (err: any) {
      console.error("Reselling order error:", err);
      toast.error("অর্ডার সাবমিট করতে সমস্যা হয়েছে: " + (err?.message || "Error"));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
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
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const estProfit = product.minResalePrice - product.wholesalePrice;
              return (
                <div 
                  key={product.id}
                  className="bg-[#151515] rounded-[24px] p-4 border border-[#3D3215] hover:border-[#D4A017]/60 transition-all shadow-xl flex flex-col justify-between gap-3 relative overflow-hidden"
                >
                  <div className="flex gap-3">
                    <img 
                      src={product.imageUrl} 
                      alt={product.title} 
                      className="w-24 h-24 rounded-2xl object-cover bg-[#101010] border border-[#3D3215] shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-[#3D3215]/60 text-[#FACC15] text-[9px] font-black uppercase">
                          {product.category}
                        </span>
                        <span className="text-[9px] text-emerald-400 font-bold">
                          স্টক: {product.stock} টি
                        </span>
                      </div>
                      
                      <h3 className="text-xs font-black text-white leading-tight line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-[10px] text-[#A3A3A3] line-clamp-2 mt-1 leading-snug">
                        {product.description}
                      </p>

                      <div className="flex items-center gap-3 mt-2">
                        <div>
                          <span className="text-[9px] text-[#A3A3A3] font-bold block uppercase">পাইকারি দাম</span>
                          <span className="text-sm font-black text-[#FACC15]">৳{product.wholesalePrice}</span>
                        </div>
                        <div className="h-6 w-px bg-[#3D3215]"></div>
                        <div>
                          <span className="text-[9px] text-[#A3A3A3] font-bold block uppercase">অনুমোদিত লাভ</span>
                          <span className="text-xs font-black text-emerald-400">৳{estProfit}+</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resell Order Button */}
                  <button
                    onClick={() => handleOpenOrderModal(product)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer hover:opacity-95 active:scale-[0.98] transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    কাস্টমারের জন্য সেল করুন (Order Now)
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
                            ডেলিভারি চলান
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
        {selectedProduct && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submitting && setSelectedProduct(null)}
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
                    রিসেলিং অর্ডার ফর্ম
                  </h3>
                </div>
                <button
                  disabled={submitting}
                  onClick={() => setSelectedProduct(null)}
                  className="w-7 h-7 rounded-full bg-[#1C1C1C] border border-[#3D3215] text-[#A3A3A3] hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmitOrder} className="p-5 overflow-y-auto space-y-4">
                
                {/* Product Summary Box */}
                <div className="bg-[#101010] p-3 rounded-2xl border border-[#3D3215] flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={selectedProduct.imageUrl} 
                      alt="" 
                      className="w-12 h-12 rounded-xl object-cover border border-[#3D3215] shrink-0" 
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-white truncate max-w-[200px]">
                        {selectedProduct.title}
                      </h4>
                      <p className="text-[10px] text-[#A3A3A3] font-bold">
                        পাইকারি দাম: ৳{selectedProduct.wholesalePrice}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resale Price Input & Live Profit Calculator */}
                <div className="bg-[#101010] p-4 rounded-2xl border border-[#3D3215] space-y-2">
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-wider block pl-0.5">
                    আপনার কাস্টমার বিক্রয়মূল্য (৳)
                  </label>
                  <input
                    type="number"
                    required
                    min={selectedProduct.wholesalePrice}
                    placeholder={`যেমন: ${selectedProduct.minResalePrice}`}
                    value={customResalePrice}
                    onChange={(e) => setCustomResalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#151515] border border-[#3D3215] px-4 py-3 rounded-xl text-sm font-black text-[#FACC15] focus:border-[#FACC15] outline-none"
                  />

                  {/* Calculated Profit Display */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[#A3A3A3] font-bold">আপনার অর্জিত লাভ (Profit):</span>
                    <span className="font-black text-emerald-400 text-sm">
                      +৳{Math.max(0, (Number(customResalePrice) || 0) - selectedProduct.wholesalePrice)}
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

                {/* Order Submit Button */}
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
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
