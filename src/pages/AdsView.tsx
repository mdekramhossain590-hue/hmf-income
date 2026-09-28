import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Play, Wallet, CheckCircle, 
  Loader2, Clock, AlertCircle, Sparkles, ExternalLink, ShieldCheck, Crown, Coins, X, RotateCcw, Lock
} from 'lucide-react';
import { db } from '../lib/firebase';
import { getCachedDoc } from '../lib/cache';
import { 
  doc, getDocs, collection, query, where, Timestamp, 
  addDoc, updateDoc, increment, serverTimestamp, setDoc 
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { triggerRealisticConfetti } from '../lib/confetti';

export const AD_NETWORK_URL = "https://www.profitableratecpmnetwork.com/w19bpauxe?key=f99a0899146f2941c8a884a6c914d013";
const COOLDOWN_DURATION_MS = 24 * 60 * 60 * 1000; // 24 Hours in milliseconds

interface AdSlot {
  id: number;
  title: string;
  subtitle: string;
  slotNumberBn: string;
}

const SLOTS_LIST: AdSlot[] = [
  { id: 1, title: "বিজ্ঞাপন দেখুন ১", subtitle: "শর্ট অ্যাড দেখে টাকা নিন", slotNumberBn: "১" },
  { id: 2, title: "বিজ্ঞাপন দেখুন ২", subtitle: "শর্ট অ্যাড দেখে টাকা নিন", slotNumberBn: "২" },
  { id: 3, title: "বিজ্ঞাপন দেখুন ৩", subtitle: "শর্ট অ্যাড দেখে টাকা নিন", slotNumberBn: "৩" },
  { id: 4, title: "বিজ্ঞাপন দেখুন ৪", subtitle: "শর্ট অ্যাড দেখে টাকা নিন", slotNumberBn: "৪" },
];

function formatCooldownTimer(ms: number) {
  if (ms <= 0) return '০০:০০:০০';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function formatCooldownBn(ms: number) {
  if (ms <= 0) return 'এখনই আনলক হয়েছে';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours} ঘণ্টা ${minutes} মিনিট ${seconds} সে.`;
  }
  return `${minutes} মিনিট ${seconds} সে.`;
}

export function AdsView() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [rewardPerAd, setRewardPerAd] = useState<number>(0.50);
  const [slotCounts, setSlotCounts] = useState<{ [key: number]: number }>({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const [slotCooldowns, setSlotCooldowns] = useState<{ [key: number]: number }>({});
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  
  const [activeSlot, setActiveSlot] = useState<AdSlot | null>(null);
  const [adModalOpen, setAdModalOpen] = useState(false);
  
  // Modal states
  const [timer, setTimer] = useState(15);
  const [timerRunning, setTimerRunning] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [adCancelled, setAdCancelled] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(15);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const adStartTimeRef = useRef<number>(0);
  const hasLeftWindowRef = useRef<boolean>(false);

  // Live 1-second interval ticker for 24h countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch claimed counts & 24-hour cooldowns
  useEffect(() => {
    const fetchData = async () => {
      if (!profile || !user) return;
      try {
        const docSnapshot = await getCachedDoc(doc(db, "settings", "adsIncome"));
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data.rewardPerAdView) {
            setRewardPerAd(Number(data.rewardPerAdView));
          }
        }

        // 1. Load Cooldown timestamps from profile / localStorage
        const userDoc = await getCachedDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : profile;
        const savedCooldowns = userData?.adSlotCooldowns || {};

        const parsedCooldowns: { [key: number]: number } = {};
        [1, 2, 3, 4].forEach(sId => {
          let timeVal = savedCooldowns[sId];
          if (!timeVal) {
            try {
              const localVal = localStorage.getItem(`ad_slot_cooldown_${user.uid}_${sId}`);
              if (localVal) timeVal = Number(localVal);
            } catch (e) {}
          }
          if (timeVal) {
            const timeMs = typeof timeVal === 'number' 
              ? timeVal 
              : (timeVal.toMillis ? timeVal.toMillis() : (timeVal.seconds ? timeVal.seconds * 1000 : Number(timeVal)));
            
            // Only active if within 24 hours
            if (timeMs && (Date.now() - timeMs < COOLDOWN_DURATION_MS)) {
              parsedCooldowns[sId] = timeMs;
            }
          }
        });
        setSlotCooldowns(parsedCooldowns);

        // 2. Load today's ad views for active slots
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const viewsSnap = await getDocs(
          query(
            collection(db, "ad_views"),
            where("userId", "==", user.uid),
            where("viewedAt", ">=", Timestamp.fromDate(startOfDay))
          )
        );
        
        const counts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0 };
        viewsSnap.forEach(d => {
          const data = d.data();
          const sId = data.slotId || (data.adId && Number(String(data.adId).match(/slot_?(\d+)/i)?.[1]));
          if (sId && counts[sId] !== undefined) {
            const viewTime = data.viewedAt?.toMillis?.() || (data.viewedAt?.seconds ? data.viewedAt.seconds * 1000 : 0);
            const lastCd = parsedCooldowns[sId] || 0;
            // Only count if viewed after last cooldown or if no cooldown
            if (!lastCd || viewTime > lastCd + COOLDOWN_DURATION_MS) {
              counts[sId] = Math.min(5, (counts[sId] || 0) + 1);
            }
          }
        });

        // For currently locked slots, ensure count is 5
        [1, 2, 3, 4].forEach(sId => {
          if (parsedCooldowns[sId]) {
            counts[sId] = 5;
          }
        });

        setSlotCounts(counts);
      } catch (error: any) {
        console.error("Ads loading error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profile, user]);

  // Anti-cheat window blur and early return detection
  useEffect(() => {
    if (!adModalOpen || completed || adCancelled) return;

    const handleBlur = () => {
      hasLeftWindowRef.current = true;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        hasLeftWindowRef.current = true;
      } else {
        checkEarlyReturn();
      }
    };

    const handleFocus = () => {
      if (hasLeftWindowRef.current) {
        checkEarlyReturn();
      }
    };

    const checkEarlyReturn = () => {
      if (!adStartTimeRef.current || completed || adCancelled) return;
      const elapsedSeconds = Math.floor((Date.now() - adStartTimeRef.current) / 1000);
      
      if (elapsedSeconds < 15) {
        const remaining = Math.max(1, 15 - elapsedSeconds);
        setTimerRunning(false);
        setRemainingSeconds(remaining);
        setAdCancelled(true);
      } else {
        setTimer(0);
        setTimerRunning(false);
        setCompleted(true);
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [adModalOpen, completed, adCancelled]);

  // Timer Countdown logic
  useEffect(() => {
    if (timerRunning && timer > 0) {
      timerRef.current = setTimeout(() => {
        setTimer(t => {
          if (t <= 1) {
            setCompleted(true);
            setTimerRunning(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer, timerRunning]);

  const handleSlotClick = (slot: AdSlot) => {
    const cdTimestamp = slotCooldowns[slot.id];
    const isLocked = cdTimestamp && (currentTime - cdTimestamp < COOLDOWN_DURATION_MS);

    if (isLocked) {
      const remainingMs = COOLDOWN_DURATION_MS - (currentTime - cdTimestamp);
      toast(`এই স্লটের ৫টি এড শেষ হয়েছে। আবার ২৪ ঘণ্টা পর আনলক হবে। বাকি সময়: ${formatCooldownBn(remainingMs)}`, { icon: '⏳', duration: 4000 });
      return;
    }

    const currentCount = slotCounts[slot.id] || 0;
    if (currentCount >= 5) {
      toast.error(`অ্যাড ${slot.slotNumberBn} এর ৫টি বিজ্ঞাপন দেখা সম্পন্ন হয়েছে!`);
      return;
    }

    setActiveSlot(slot);
    adStartTimeRef.current = Date.now();
    hasLeftWindowRef.current = false;
    setAdCancelled(false);
    setRemainingSeconds(15);
    setTimer(15);
    setTimerRunning(true);
    setCompleted(false);
    setAdModalOpen(true);

    try {
      window.open(AD_NETWORK_URL, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.warn("Could not automatically open window:", e);
    }
  };

  const handleRetry = () => {
    if (!activeSlot) {
      setAdModalOpen(false);
      return;
    }
    handleSlotClick(activeSlot);
  };

  const closeAd = () => {
    setAdModalOpen(false);
    setActiveSlot(null);
    setAdCancelled(false);
  };

  const handleClaim = async () => {
    if (!user || !activeSlot) return;
    setClaimLoading(true);

    const prevCount = slotCounts[activeSlot.id] || 0;
    const nextCount = prevCount + 1;
    const adId = `slot_${activeSlot.id}_view_${nextCount}`;
    const willLock24h = nextCount >= 5;

    const onClaimSuccess = async () => {
      triggerRealisticConfetti();
      toast.success(`অভিনন্দন! ৳${rewardPerAd.toFixed(2)} আপনার ওয়ালেটে জমা হয়েছে!`);
      
      setSlotCounts(prev => ({
        ...prev,
        [activeSlot.id]: Math.min(5, nextCount)
      }));

      // If user finished all 5 ads of this slot, lock for 24 hours!
      if (willLock24h) {
        const completedNow = Date.now();
        setSlotCooldowns(prev => ({ ...prev, [activeSlot.id]: completedNow }));
        try {
          localStorage.setItem(`ad_slot_cooldown_${user.uid}_${activeSlot.id}`, String(completedNow));
        } catch (e) {}

        await updateDoc(doc(db, "users", user.uid), {
          [`adSlotCooldowns.${activeSlot.id}`]: completedNow
        }).catch(() => {});

        setTimeout(() => {
          toast.success(`স্লট ${activeSlot.slotNumberBn} সফলভাবে সম্পন্ন! এটি আবার ২৪ ঘণ্টা পর আনলক হবে।`, { duration: 6000 });
        }, 1200);
      }

      closeAd();
      setClaimLoading(false);
    };

    // 1. Try server API
    try {
      const response = await fetch("/api/ads/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          adId: adId,
          slotId: activeSlot.id
        })
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        await onClaimSuccess();
        return;
      }
    } catch (apiErr) {
      // Fallback to client Firestore
    }

    // 2. Direct Firestore fallback (guaranteed on Vercel)
    try {
      await addDoc(collection(db, "ad_views"), {
        userId: user.uid,
        slotId: activeSlot.id,
        adId: adId,
        rewardAmount: rewardPerAd,
        viewedAt: serverTimestamp()
      });

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        "balances.tasks.Watch Ads": increment(rewardPerAd)
      });

      const leaderboardRef = doc(db, "leaderboard", user.uid);
      await setDoc(leaderboardRef, {
        totalIncome: increment(rewardPerAd),
        updatedAt: serverTimestamp()
      }, { merge: true });

      await onClaimSuccess();
    } catch (clientErr: any) {
      console.error("Direct claim error:", clientErr);
      toast.error("ক্লেইম করতে সমস্যা হয়েছে: " + (clientErr?.message || "Error"));
      setClaimLoading(false);
    }
  };

  const totalCompleted = Object.values(slotCounts).reduce((a, b) => a + b, 0);
  const totalEarned = (totalCompleted * rewardPerAd).toFixed(2);

  return (
    <div className="pt-6 px-4 pb-28 max-w-lg mx-auto text-white select-none">
      
      {/* Top Header / Back Button */}
      <div className="flex items-center justify-between mb-5">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 bg-[#151515] border border-[#3D3215] hover:border-[#D4A017] rounded-full flex items-center justify-center text-[#A3A3A3] hover:text-[#FACC15] transition active:scale-95 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-display font-black tracking-tight text-white flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-[#FACC15]" />
            <span className="bg-gradient-to-r from-[#D4A017] via-[#FACC15] to-[#FFE082] bg-clip-text text-transparent">
              প্রিমিয়াম ইনকাম
            </span>
          </h2>
          <p className="text-[10px] text-[#A3A3A3] font-bold uppercase tracking-widest mt-0.5">
            ৪টি স্লট • ২০টি বিজ্ঞাপন (২৪ ঘণ্টা কুলডাউন)
          </p>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Withdraw Money Card in our dark gold theme */}
      <div 
        onClick={() => navigate('/wallet')}
        className="bg-[#151515] hover:bg-[#1a1a1a] rounded-2xl p-4 mb-5 flex items-center justify-between shadow-lg border border-[#3D3215] hover:border-[#D4A017]/70 transition-all active:scale-[0.99] cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] flex items-center justify-center shadow-md">
            <Wallet className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-black text-base text-white group-hover:text-[#FACC15] transition-colors block leading-tight">
              Withdraw Money
            </span>
            <span className="text-[10px] text-[#A3A3A3] font-bold uppercase tracking-wider">
              উত্তোলন করতে ক্লিক করুন
            </span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15] group-hover:translate-x-1 transition-transform">
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>

      {/* Main "প্রিমিয়াম ইনকাম" Container Card in Dark Luxury Gold */}
      <div className="bg-[#151515] rounded-[32px] p-5 pt-6 pb-7 shadow-2xl border border-[#3D3215] relative overflow-hidden mb-6">
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-[#D4A017]/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-[#8A6508]/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header Title with Crown */}
        <div className="text-center mb-6 relative z-10">
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2 mb-2">
            <span className="text-xl">👑</span>
            <span className="bg-gradient-to-r from-[#D4A017] via-[#FACC15] to-[#FFE082] bg-clip-text text-transparent">
              প্রিমিয়াম ইনকাম
            </span>
          </h2>
          <p className="text-xs text-[#A3A3A3] font-medium leading-relaxed px-2">
            নিচের বাটনে ক্লিক করে কমপক্ষে ১৫ সেকেন্ড ওয়েট করবেন নাহলে রিওয়ার্ড পাবেন না। ৫টি এড দেখার পর স্লটটি ২৪ ঘণ্টা পর আনলক হবে।
          </p>

          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <div className="text-[11px] font-bold text-[#FACC15] bg-[#1C1C1C] px-3.5 py-1 rounded-full border border-[#3D3215] inline-flex items-center gap-1.5 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>মোট সম্পন্ন: {totalCompleted} / ২০টি</span>
              <span>•</span>
              <span>আয়: ৳ {totalEarned}</span>
            </div>
          </div>
        </div>

        {/* 2x2 Grid of 4 Slots (5 ads each) matching screenshot layout */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#FACC15]" />
            <span className="text-xs text-[#A3A3A3] font-bold">স্লট লোড হচ্ছে...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 relative z-10">
            {SLOTS_LIST.map((slot) => {
              const cdTimestamp = slotCooldowns[slot.id];
              const isLocked = Boolean(cdTimestamp && (currentTime - cdTimestamp < COOLDOWN_DURATION_MS));
              const remainingMs = isLocked ? Math.max(0, COOLDOWN_DURATION_MS - (currentTime - cdTimestamp)) : 0;
              const count = isLocked ? 5 : (slotCounts[slot.id] || 0);

              return (
                <div
                  key={slot.id}
                  className={`relative rounded-[24px] p-4 pt-6 flex flex-col items-center text-center transition-all group border ${
                    isLocked
                      ? "bg-[#101010] border-amber-900/40 opacity-90 shadow-inner"
                      : "bg-[#181818] border-[#3D3215] hover:border-[#D4A017]/70 shadow-lg shadow-black/40"
                  }`}
                >
                  {/* Top Right Ribbon Badge */}
                  {isLocked ? (
                    <div className="absolute -top-3 right-1 flex items-center gap-1 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-md z-10 select-none border border-amber-500/40">
                      <Lock className="w-2.5 h-2.5 text-amber-200" />
                      <span>২৪ ঘণ্টা লক</span>
                    </div>
                  ) : (
                    <div className="absolute -top-3 right-1 flex items-center gap-1 bg-gradient-to-r from-[#D4A017] via-[#FACC15] to-[#FFE082] text-[#090909] text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md z-10 select-none">
                      <span className="text-xs">👆</span>
                      <span>এখানে চাপ দিন</span>
                    </div>
                  )}

                  {/* Centered Squircle Button (Play or Lock with Live Countdown) */}
                  {isLocked ? (
                    <button
                      onClick={() => handleSlotClick(slot)}
                      className="w-16 h-16 rounded-[22px] bg-[#121212] border border-amber-500/40 flex flex-col items-center justify-center text-amber-400 shadow-xl mb-3 cursor-pointer active:scale-95 transition-transform"
                      title="২৪ ঘণ্টার কুলডাউন চলছে"
                    >
                      <Lock className="w-5 h-5 text-[#FACC15] mb-0.5" />
                      <span className="text-[9px] font-mono font-black text-[#FACC15] tracking-tighter">
                        {formatCooldownTimer(remainingMs)}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSlotClick(slot)}
                      className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-[#8A6508] via-[#D4A017] to-[#FACC15] flex items-center justify-center text-[#090909] shadow-xl shadow-[#D4A017]/25 mb-3 group-hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      aria-label={slot.title}
                    >
                      <Play className="w-7 h-7 fill-[#090909] translate-x-0.5" />
                    </button>
                  )}

                  {/* Slot Title */}
                  <h3 className={`font-black text-sm mb-1 tracking-tight ${isLocked ? "text-[#737373]" : "text-white"}`}>
                    {slot.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-[10px] text-[#A3A3A3] font-medium mb-3 truncate max-w-full px-1">
                    {isLocked ? `বাকি: ${formatCooldownTimer(remainingMs)}` : slot.subtitle}
                  </p>

                  {/* Pill Action Button */}
                  {isLocked ? (
                    <button
                      onClick={() => handleSlotClick(slot)}
                      className="w-full py-2 px-1.5 rounded-full text-[10px] font-black flex items-center justify-center gap-1 transition-all shadow-sm bg-[#121212] text-amber-400 border border-amber-500/40 cursor-pointer"
                    >
                      <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                      <span>লক: {formatCooldownTimer(remainingMs)}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSlotClick(slot)}
                      className="w-full py-2 px-2.5 rounded-full text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer bg-[#101010] hover:bg-[#1C1C1C] text-[#FACC15] border border-[#3D3215] hover:border-[#D4A017] active:scale-95"
                    >
                      <Play className="w-3 h-3 fill-[#FACC15] text-[#FACC15]" />
                      <span>অ্যাড {slot.slotNumberBn}: {count} / 5</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 15s Ad View & Countdown Modal OR Early Return Cancellation Popup */}
      <AnimatePresence>
        {adModalOpen && activeSlot && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          >
            <div className="w-full max-w-sm bg-[#151515] border border-[#3D3215] rounded-[32px] overflow-hidden shadow-2xl flex flex-col">
              
              {/* IF AD CANCELLED DUE TO EARLY RETURN */}
              {adCancelled ? (
                <div className="p-7 text-center flex flex-col items-center justify-center bg-[#151515]">
                  <div className="w-20 h-20 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-rose-900/50 ring-8 ring-rose-950/40 animate-in zoom-in-75 duration-300">
                    <X className="w-10 h-10 stroke-[3]" />
                  </div>

                  <h3 className="text-2xl font-black text-white text-center mb-3 tracking-tight">
                    অ্যাড বাতিল হয়েছে!
                  </h3>

                  <p className="text-xs text-[#D4D4D4] text-center leading-relaxed mb-6 px-1">
                    আপনি ১৫ সেকেন্ডের আগেই ওয়েবসাইটে ফিরে এসেছেন। আপনার আরও{" "}
                    <span className="text-[#FACC15] font-black text-sm px-1.5 bg-[#1C1C1C] py-0.5 rounded border border-[#3D3215]">
                      {remainingSeconds}
                    </span>{" "}
                    সেকেন্ড অপেক্ষা করা প্রয়োজন ছিল।
                  </p>

                  <button
                    onClick={handleRetry}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 hover:from-rose-500 hover:to-rose-700 text-white font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-950/60 active:scale-95 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-5 h-5 stroke-[2.5]" />
                    <span>আবার চেষ্টা করুন</span>
                  </button>
                </div>
              ) : (
                /* NORMAL COUNTDOWN OR COMPLETED STATE */
                <>
                  <div className="p-4 border-b border-[#3D3215] flex justify-between items-center bg-[#101010]">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${completed ? "bg-emerald-400" : "bg-[#FACC15] animate-ping"}`}></div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-[#FACC15] block leading-none">
                          {activeSlot.title}
                        </span>
                        <span className="text-[10px] text-[#A3A3A3] font-bold">
                          অ্যাড {activeSlot.slotNumberBn}: {(slotCounts[activeSlot.id] || 0) + 1} / 5
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={closeAd} 
                      className="text-xs font-bold text-[#A3A3A3] hover:text-white px-2.5 py-1 rounded-lg bg-[#1C1C1C] border border-[#3D3215] cursor-pointer"
                    >
                      বন্ধ করুন
                    </button>
                  </div>

                  <div className="p-6 text-center flex flex-col items-center justify-center bg-[#151515]">
                    <div className="w-16 h-16 rounded-[24px] bg-gradient-to-tr from-[#8A6508] via-[#D4A017] to-[#FACC15] flex items-center justify-center text-[#090909] shadow-xl shadow-[#D4A017]/25 mb-3">
                      <Play className="w-8 h-8 fill-[#090909] translate-x-0.5" />
                    </div>
                    
                    <h4 className="font-black text-white text-base mb-1">
                      {completed ? "বিজ্ঞাপন দেখা সম্পন্ন হয়েছে!" : "বিজ্ঞাপন দেখা হচ্ছে"}
                    </h4>
                    <p className="text-xs text-[#A3A3A3] mb-4 px-2">
                      {completed 
                        ? "আপনি সফলভাবে ১৫ সেকেন্ড বিজ্ঞাপন দেখেছেন। রিওয়ার্ড গ্রহণ করুন।" 
                        : "বিজ্ঞাপন লিংকটি ওপেন হয়েছে। রিওয়ার্ড পেতে কমপক্ষে ১৫ সেকেন্ড অপেক্ষা করুন।"
                      }
                    </p>

                    <a
                      href={AD_NETWORK_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1C1C1C] hover:bg-[#252525] text-[#FACC15] border border-[#3D3215] text-xs font-bold transition-all shadow-md active:scale-95 mb-4"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>বিজ্ঞাপন পেজ দেখুন (Open Ad Link)</span>
                    </a>

                    <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#737373]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ভেরিফাইড এড পার্টনার
                    </div>
                  </div>

                  <div className="p-5 bg-[#101010] border-t border-[#3D3215]">
                    <div className="flex flex-col items-center justify-center">
                      {!completed ? (
                        <div className="text-center w-full">
                          <div className="flex items-center justify-center gap-2 mb-1.5">
                            <Clock className="w-4 h-4 text-[#FACC15] animate-spin" />
                            <span className="text-3xl font-black text-[#FACC15] tracking-tight">{timer}s</span>
                          </div>
                          <p className="text-[11px] font-bold text-[#A3A3A3]">
                            টাইমার শেষ হওয়া পর্যন্ত অপেক্ষা করুন (আগে ফিরলে এড বাতিল হবে)
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={handleClaim}
                          disabled={claimLoading}
                          className="w-full bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] hover:from-[#D4A017] hover:to-[#FFE082] text-[#090909] font-black uppercase tracking-wider py-3.5 rounded-2xl shadow-xl shadow-[#D4A017]/25 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer text-sm"
                        >
                          {claimLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>ব্যালেন্স যুক্ত হচ্ছে...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5 stroke-[2.5]" />
                              <span>রিওয়ার্ড গ্রহণ করুন (৳ {rewardPerAd.toFixed(2)})</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
