import { processRegistrationReferral } from "../lib/referral";
import { useNavigate } from "react-router-dom";
import {
  Clock, XCircle, User, Bell, Wallet, ListChecks, Target, Users, Send, MoreVertical, Settings, HelpCircle, LogOut, Award, Shield, FileText, Calculator, Megaphone, Trophy, Copy, Check, Link, Eye, EyeOff, Smartphone, BookOpen, Banknote, MonitorPlay, Wifi, Sun, Moon, X, Trash2, Activity, ArrowDownLeft, ArrowUpRight, CheckCircle, MessageCircle, Star, Gift, Download, Coins, Briefcase,
  BadgeCheck, RotateCcw, Gamepad2} from "lucide-react";
import { useAuth } from "../components/AuthProvider";
import React, { useState, useEffect } from "react";
import { triggerRealisticConfetti } from "../lib/confetti";
import { useLanguage } from "../components/LanguageProvider";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, updateDoc, setDoc, collection, query, orderBy, limit, writeBatch, deleteDoc, getDocs, getCountFromServer, where, serverTimestamp, increment } from 'firebase/firestore';
import { ActivationPopup } from "../components/ActivationPopup";
import { Celebration } from "../components/Celebration";
import { motion, AnimatePresence } from "motion/react";
import { playTapSound, playSuccessSound } from "../lib/sound";
import { useTheme } from "../components/ThemeProvider";
import { getCachedDoc, getCachedQuery } from "../lib/cache";
import toast from "react-hot-toast";
import { deferredPrompt, clearPwaPrompt, onPwaPrompt } from "../pwa";

export function Dashboard() {
  const [showCelebration, setShowCelebration] = useState(false);
  const [claimingPartner, setClaimingPartner] = useState(false);

  const {
    profile,
    user,
    loading,
    logOut,
    refreshProfile,
    siteSettings,
    isQuotaExceeded,
  } = useAuth();

  const alreadyClaimedPartner = (() => {
    if (!profile?.partnerClaimedAt) return false;
    try {
      const lastClaimed = new Date(profile.partnerClaimedAt.toDate ? profile.partnerClaimedAt.toDate() : profile.partnerClaimedAt).toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];
      return lastClaimed === todayStr;
    } catch (e: any) {
      return false;
    }
  })();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [showActivationPopup, setShowActivationPopup] = useState(false);
  const [banner, setBanner] = useState({
    text: "Welcome to HMF EARNING ZONE! Complete tasks and earn money daily.",
    link: "#",
  });
  const [partnerSettings, setPartnerSettings] = useState({ requiredReferrals: 10, dailyBonus: 100, enabled: false });
  
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPwaInstall, setShowPwaInstall] = useState(false);




  useEffect(() => {
    const checkMissedReferral = async () => {
      if (profile && profile.isActive && !profile.referralBonusPaid && profile.usedReferCode && profile.usedReferCode !== 'none') {
        console.log("Retrying missed referral processing...");
        try {
          await processRegistrationReferral(auth.currentUser!.uid);
          await refreshProfile();
        } catch (e: any) {
          console.error(e?.message || "Unknown Error");
        }
      }
    };
    checkMissedReferral();
  }, [profile?.isActive, profile?.referralBonusPaid, profile?.usedReferCode]);

  useEffect(() => {
    // Show PWA prompt if available on load
    const unsubscribe = onPwaPrompt((prompt) => {
      if (prompt && !localStorage.getItem("pwa_prompt_dismissed")) {
        setShowPwaInstall(true);
      }
    });
    return unsubscribe;
  }, []);
  const [showBalance, setShowBalance] = useState(true);
  const [comingSoonFeature, setComingSoonFeature] = useState<{
    title: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
    link?: string;
    linkText?: string;
  } | null>(null);
  const { t, language } = useLanguage();
    const [actualReferralsCount, setActualReferralsCount] = useState(profile?.totalReferrals || 0);
  const partnerReferralsCount = profile?.partnerReferrals || 0;

  useEffect(() => {
    if (!auth.currentUser) return;
    const fixReferrals = async () => {
      try {
        const snap = await getDocs(collection(db, "users", (auth.currentUser?.uid as string), "referrals"));
        const gen1 = snap.docs.filter(d => !d.data().level || d.data().level === 1).length;
        setActualReferralsCount(gen1);
        if (profile && gen1 !== profile.totalReferrals) {
           updateDoc(doc(db, "users", (auth.currentUser?.uid as string)), { totalReferrals: gen1 }).catch(e => {});
        }
      } catch (e: any) {}
    };
    fixReferrals();
  }, [profile?.totalReferrals]);






  const [dbNotifications, setDbNotifications] = useState<any[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);


  useEffect(() => {
    if (!auth.currentUser) return;

    let unsubscribe: () => void;
    import('firebase/firestore').then(({ onSnapshot }) => {
      const notificationsRef = collection(
        db,
        "users",
        auth.currentUser!.uid,
        "notifications",
      );
      const q = query(
        notificationsRef,
        orderBy("createdAt", "desc"),
        limit(20),
      );
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        const items: any[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() });
        });
        setDbNotifications(items);
      }, (err) => {
        console.warn("Error fetching db notifications:", err?.message || "Unknown Error");
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [(auth.currentUser?.uid as string)]);

  const [userTx, setUserTx] = useState<any[]>([]);
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [userReferrals, setUserReferrals] = useState<any[]>([]);
  const [topLeaders, setTopLeaders] = useState<any[]>([]);
  const [currentLeaderIndex, setCurrentLeaderIndex] = useState(0);


  useEffect(() => {
    if (topLeaders.length > 0) {
      const interval = setInterval(() => {
        setCurrentLeaderIndex((prev) => (prev + 1) % topLeaders.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [topLeaders]);



  useEffect(() => {
    if (!auth.currentUser) return;
    const fetchGlobalData = async () => {
      let actualUsersCount = 0;
      try {
        const snap = await getCountFromServer(collection(db, "users"));
        actualUsersCount = snap.data().count;
      } catch (e: any) {}

      let estimatedPaid = 0;
      let estimatedTasks = 0;

      // 1. Fetch Top Leaders
      try {
        const snapshot = await getDocs(query(collection(db, "users"), limit(1000)));
        const fetchedLeaders = snapshot.docs.map((doc) => {
          try {
            const data = doc.data();
            const main = Number(data.balances?.main || 0);
            const bonus = Number(data.balances?.bonus || 0);
            const ref = Number(data.balances?.referral || 0);
            
            let taskSum = 0;
            let currentTasksCount = 0;
            
            if (data.balances?.tasks && typeof data.balances.tasks === 'object') {
              taskSum = Object.values(data.balances.tasks).reduce((a: any, b: any) => Number(a || 0) + Number(b || 0), 0) as number;
              currentTasksCount = Object.keys(data.balances.tasks).length;
            }
            
            const totalIncome = main + bonus + ref + taskSum;
            
            estimatedPaid += totalIncome;
            estimatedTasks += currentTasksCount + Number(data.totalReferrals || 0);

            return {
              id: doc.id,
              fullName: data.fullName || "User",
              photoURL: data.photoURL || null,
              totalIncome,
            };
          } catch (err: any) {
            console.warn("Skipping malformed user record:", doc.id, err?.message || "Unknown Error");
            return null;
          }
        }).filter(Boolean) as any[];
        
        fetchedLeaders.sort((a, b) => b.totalIncome - a.totalIncome);
        setTopLeaders(fetchedLeaders.slice(0, 3));
      } catch (err: any) {
        console.warn("Failed fetching top leaders", err?.message || "Unknown Error");
      }

      // 2. Fetch Stats
      try {
        const statsDoc = await getDoc(doc(db, "admin", "stats"));
      } catch (err: any) {
        console.warn("Failed fetching platform stats", err?.message || "Unknown Error");
      }
    };
    fetchGlobalData();
  }, [auth.currentUser]);


  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    let unsubTx: (() => void) | null = null;
    let unsubTasks: (() => void) | null = null;
    let unsubRef: (() => void) | null = null;

    import('firebase/firestore').then(({ onSnapshot }) => {
      // 1. Live transactions
      const txRef = collection(db, "users", uid, "transactions");
      const txQuery = query(txRef, orderBy("createdAt", "desc"), limit(5));
      unsubTx = onSnapshot(txQuery, (snapshot) => {
        const txItems = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          type: "transaction",
          ...docSnap.data(),
        }));
        setUserTx(txItems);
      }, (err) => {
        console.warn("Live tx listener error:", err?.message || err);
      });

      // 2. Live submissions/tasks
      const tasksQuery = query(
        collection(db, "submissions"),
        where("userId", "==", uid),
        limit(20)
      );
      unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
        const docs = [...snapshot.docs];
        docs.sort((a, b) => {
          const aData = a.data();
          const bData = b.data();
          const aTime = aData.submittedAt?.toMillis?.() || 0;
          const bTime = bData.submittedAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
        const taskItems = docs.slice(0, 5).map((docSnap) => ({
          id: docSnap.id,
          type: "task",
          ...docSnap.data(),
        }));
        setUserTasks(taskItems);
      }, (err) => {
        console.warn("Live tasks listener error:", err?.message || err);
      });

      // 3. Live referrals
      const refQuery = query(
        collection(db, "users", uid, "referrals"),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      unsubRef = onSnapshot(refQuery, (snapshot) => {
        const refItems = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          type: "referral",
          ...docSnap.data(),
        }));
        setUserReferrals(refItems);
      }, (err) => {
        console.warn("Live ref listener error:", err?.message || err);
      });
    });

    return () => {
      if (unsubTx) unsubTx();
      if (unsubTasks) unsubTasks();
      if (unsubRef) unsubRef();
    };
  }, [(auth.currentUser?.uid as string)]);

  
    const getRefBonus = (ref: any) => {
    let raw = ref.bonusEarned !== undefined ? Number(ref.bonusEarned) : 0;
    if (raw > 0) {
       return raw;
    }
    if (ref.level === 3) return 0;
    if (ref.level === 2) return 3;
    return 5;
  };

  const getCombinedActivity = () => {
    const combined = [
      ...userTx
        .filter((t) => t.type !== "task")
        .map((t) => {
          const d = t.createdAt?.toDate
            ? t.createdAt.toDate()
            : t.createdAt
              ? new Date(t.createdAt)
              : new Date(0);
          return { ...t, date: d };
        }),
      ...userTasks.map((t) => {
        const timeField = t.submittedAt || t.completedAt;
        const d = timeField?.toDate
          ? timeField.toDate()
          : timeField
            ? new Date(timeField)
            : new Date(0);
        // We ensure a 'task' type to match styling logic, but keep original type for display if needed
        return { ...t, date: d, _originalType: t.type, type: "task" };
      }),
      ...userReferrals.map((t) => {
        const d = t.createdAt?.toDate
          ? t.createdAt.toDate()
          : t.createdAt
            ? new Date(t.createdAt)
            : new Date(0);
        return { ...t, date: d, _originalType: t.type, type: "referral" };
      }),
    ];

    combined.sort((a, b) => b.date.getTime() - a.date.getTime());
    return combined.slice(0, 5);
  };

  const handleResetAdminBalance = async () => {
    if (!auth.currentUser) return;
    const confirm = window.confirm("আপনি কি অ্যাডমিন ব্যালেন্স ৳ 0.00 করতে চান?");
    if (!confirm) return;
    try {
      toast.loading("ব্যালেন্স ০ করা হচ্ছে...", { id: "reset_bal" });
      const uid = auth.currentUser.uid;
      await updateDoc(doc(db, "users", uid), {
        balance: 0,
        balances: { main: 0, bonus: 0, referral: 0, partner: 0, tasks: 0 }
      });
      await setDoc(doc(db, "leaderboard", uid), {
        totalIncome: 0,
        bonus: 0
      }, { merge: true });
      if (refreshProfile) await refreshProfile();
      toast.success("ব্যালেন্স সফলভাবে ৳ 0.00 করা হয়েছে!", { id: "reset_bal" });
    } catch (e: any) {
      toast.error("ব্যালেন্স রিসেট ব্যর্থ: " + (e?.message || "Unknown error"), { id: "reset_bal" });
    }
  };

  const handleClearMyActivity = async () => {
    if (!auth.currentUser) return;
    const confirm = window.confirm("আপনি কি সমস্ত সাম্প্রতিক লেনদেন ও কাজের হিস্ট্রি মুছতে চান?");
    if (!confirm) return;
    try {
      toast.loading("অ্যাক্টিভিটি হিস্ট্রি মোছা হচ্ছে...", { id: "clear_act" });
      const uid = auth.currentUser.uid;
      const txSnap = await getDocs(collection(db, "users", uid, "transactions"));
      const taskSnap = await getDocs(collection(db, "users", uid, "tasks"));
      const refSnap = await getDocs(collection(db, "users", uid, "referrals"));
      const subSnap = await getDocs(query(collection(db, "submissions"), where("userId", "==", uid)));

      const batch = writeBatch(db);
      txSnap.docs.forEach(d => batch.delete(d.ref));
      taskSnap.docs.forEach(d => batch.delete(d.ref));
      refSnap.docs.forEach(d => batch.delete(d.ref));
      subSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();

      setUserTx([]);
      setUserTasks([]);
      setUserReferrals([]);
      toast.success("সাম্প্রতিক হিস্ট্রি সফলভাবে খালি করা হয়েছে!", { id: "clear_act" });
    } catch (e: any) {
      toast.error("মুছতে ত্রুটি: " + (e?.message || "Unknown error"), { id: "clear_act" });
    }
  };


  const unreadCount = dbNotifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(
        doc(db, "users", (auth.currentUser?.uid as string), "notifications", id),
        { read: true },
      );
    } catch (e: any) {
      console.error("Failed to mark notification as read:", e?.message || "Unknown Error");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!auth.currentUser || dbNotifications.length === 0) return;
    try {
      const unreadNotifications = dbNotifications.filter((n) => !n.read);
      if (unreadNotifications.length === 0) return;

      const batch = writeBatch(db);
      unreadNotifications.forEach((n) => {
        const docRef = doc(
          db,
          "users",
          auth.currentUser!.uid,
          "notifications",
          n.id,
        );
        batch.update(docRef, { read: true });
      });
      await batch.commit();
      toast.success(t("mark_all_read") || "All marked as read");
    } catch (e: any) {
      console.error("Failed to mark all as read:", e?.message || "Unknown Error");
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.currentUser) return;
    try {
      await deleteDoc(
        doc(db, "users", (auth.currentUser?.uid as string), "notifications", id),
      );
      toast.success(
        language === "Bengali"
          ? "নোটিফিকেশনটি মুছে ফেলা হয়েছে"
          : "Notification deleted",
      );
    } catch (err: any) {
      console.error("Failed to delete notification:", err?.message || "Unknown Error");
      toast.error(
        language === "Bengali" ? "মুছে ফেলতে ব্যর্থ হয়েছে" : "Failed to delete",
      );
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (!auth.currentUser || dbNotifications.length === 0) return;

    const confirmMessage =
      t("delete_all_confirm") ||
      "Are you sure you want to delete all notifications?";
    

    try {
      const batch = writeBatch(db);
      dbNotifications.forEach((n) => {
        const docRef = doc(
          db,
          "users",
          auth.currentUser!.uid,
          "notifications",
          n.id,
        );
        batch.delete(docRef);
      });
      await batch.commit();
      toast.success(
        language === "Bengali"
          ? "সব নোটিফিকেশন মুছে ফেলা হয়েছে"
          : "All notifications cleared",
      );
    } catch (err: any) {
      console.error("Failed to delete all notifications:", err?.message || "Unknown Error");
      toast.error(
        language === "Bengali"
          ? "সব মুছতে ব্যর্থ হয়েছে"
          : "Failed to clear all",
      );
    }
  };

  const handleCopy = (text: string, type: "code" | "link") => {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };


  useEffect(() => {
    if (
      auth.currentUser?.email === "mdekramhossain590@gmail.com" &&
      profile &&
      profile.role !== "admin"
    ) {
      const dbRef = doc(db, "users", (auth.currentUser?.uid as string));
      updateDoc(dbRef, { role: "admin" })
        .then(() => refreshProfile())
        .catch(() => {});
    }
  }, [profile, auth.currentUser, refreshProfile]);


  useEffect(() => {
    // Show popup immediately after login if inactive
    if (profile && profile.isActive === false && profile.role !== "admin") {
      // Check if we haven't already dismissed it recently (optional), but let's just show it once on mount
      setShowActivationPopup(true);
    }
  }, [profile?.isActive, profile?.role]);


  useEffect(() => {
    // Fetch banner and partner settings
    const fetchSettings = async () => {
      try {
        const [bannerSnap, partnerSnap] = await Promise.all([
          getCachedDoc(doc(db, "settings", "banner")),
          getCachedDoc(doc(db, "settings", "partner"))
        ]);

        if (bannerSnap.exists()) {
          setBanner(bannerSnap.data() as { text: string; link: string });
        }
        if (partnerSnap.exists()) {
          const d = partnerSnap.data();
          setPartnerSettings({
            requiredReferrals: d.requiredReferrals !== undefined ? d.requiredReferrals : 10,
            dailyBonus: d.dailyBonus !== undefined ? d.dailyBonus : 100,
            enabled: d.enabled === true
          });
        }
      } catch (error: any) {
        console.warn("Settings config not available yet:", error.message);
      }
    };
    fetchSettings();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const timeData = {
    year: currentTime.getFullYear(),
    month: currentTime.getMonth() + 1,
    day: currentTime.getDate(),
    hours: currentTime.getHours(),
    minutes: currentTime.getMinutes(),
    seconds: currentTime.getSeconds(),
  };

  return (
    <div className="pt-6 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 -ml-1 text-[#FACC15] hover:bg-[#1C1C1C] rounded-full transition relative z-20"
          >
            <MoreVertical className="w-6 h-6" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-[#090909]/80 backdrop-blur-sm"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="fixed inset-y-0 left-0 right-0 mx-auto w-full sm:max-w-[480px] z-[101] pointer-events-none flex">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                    className="h-full w-72 bg-[#151515] shadow-2xl flex flex-col pointer-events-auto border-r border-[#3D3215]"
                  >
                    <div className="px-5 py-6 bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] border-b border-[#3D3215] font-bold tracking-wide flex items-center gap-3.5">
                      {siteSettings?.logoUrl ? (
                        <div className="h-12 min-w-[48px] max-w-[120px] rounded-xl bg-[#090909] border border-black/20 p-1 flex items-center justify-center overflow-hidden shadow-lg shrink-0">
                          <img
                            src={siteSettings.logoUrl}
                            alt="Logo"
                            className="max-h-full max-w-full object-contain rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-black/15 flex items-center justify-center flex-shrink-0">
                          <Target className="w-7 h-7 text-[#090909]" />
                        </div>
                      )}
                      <div>
                        <p className="text-base font-black">{t("main_menu")}</p>
                        <p className="text-[10px] text-[#1A1A1A] font-bold uppercase tracking-wider mt-0.5">
                          {t("access_all_features")}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3">
                      {/* Current Time inside Menu */}
                      <div className="mb-4 bg-[#101010] rounded-2xl p-3 border border-[#3D3215]">
                        <div className="text-center mb-2.5">
                          <span className="text-[10px] font-bold text-[#737373] uppercase tracking-widest">
                            {t("current_time")}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-gradient-to-br from-[#8A6508] to-[#D4A017] text-[#090909] py-1.5 rounded-lg flex flex-col items-center justify-center shadow-lg shadow-black/40">
                            <span className="text-sm font-black leading-none">
                              {timeData.year}
                            </span>
                            <span className="text-[9px] font-bold opacity-90 mt-0.5">
                              {t("year")}
                            </span>
                          </div>
                          <div className="bg-gradient-to-br from-[#D4A017] to-[#FACC15] text-[#090909] py-1.5 rounded-lg flex flex-col items-center justify-center shadow-lg shadow-black/40">
                            <span className="text-sm font-black leading-none">
                              {timeData.month.toString().padStart(2, "0")}
                            </span>
                            <span className="text-[9px] font-bold opacity-90 mt-0.5">
                              {t("mon")}
                            </span>
                          </div>
                          <div className="bg-gradient-to-br from-[#EAB308] to-[#FFE082] text-[#090909] py-1.5 rounded-lg flex flex-col items-center justify-center shadow-lg shadow-black/40">
                            <span className="text-sm font-black leading-none">
                              {timeData.day.toString().padStart(2, "0")}
                            </span>
                            <span className="text-[9px] font-bold opacity-90 mt-0.5">
                              {t("day")}
                            </span>
                          </div>
                          <div className="bg-gradient-to-br from-[#8A6508] to-[#D4A017] text-[#090909] py-1.5 rounded-lg flex flex-col items-center justify-center shadow-lg shadow-black/40">
                            <span className="text-sm font-black leading-none">
                              {timeData.hours.toString().padStart(2, "0")}
                            </span>
                            <span className="text-[9px] font-bold opacity-90 mt-0.5">
                              {t("hrs")}
                            </span>
                          </div>
                          <div className="bg-gradient-to-br from-[#D4A017] to-[#FACC15] text-[#090909] py-1.5 rounded-lg flex flex-col items-center justify-center shadow-lg shadow-black/40">
                            <span className="text-sm font-black leading-none">
                              {timeData.minutes.toString().padStart(2, "0")}
                            </span>
                            <span className="text-[9px] font-bold opacity-90 mt-0.5">
                              {t("min")}
                            </span>
                          </div>
                          <div className="bg-gradient-to-br from-[#EAB308] to-[#FFE082] text-[#090909] py-1.5 rounded-lg flex flex-col items-center justify-center shadow-lg shadow-black/40">
                            <span className="text-sm font-black leading-none">
                              {timeData.seconds.toString().padStart(2, "0")}
                            </span>
                            <span className="text-[9px] font-bold opacity-90 mt-0.5">
                              {t("sec")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 text-sm text-[#A3A3A3] hover:bg-[#1C1C1C] hover:text-[#FACC15] rounded-xl transition font-medium group"
                        >
                          <div className="bg-[#1C1C1C] p-2 rounded-xl group-hover:bg-[#252525] shadow-sm border border-[#3D3215]">
                            <User className="w-4 h-4 text-[#FACC15]" />
                          </div>{" "}
                          {t("my_profile")}
                        </button>
                        <button
                          onClick={() => {
                            navigate("/wallet");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 text-sm text-[#A3A3A3] hover:bg-[#1C1C1C] hover:text-[#FACC15] rounded-xl transition font-medium group"
                        >
                          <div className="bg-[#1C1C1C] p-2 rounded-xl group-hover:bg-[#252525] shadow-sm border border-[#3D3215]">
                            <Wallet className="w-4 h-4 text-[#FACC15]" />
                          </div>{" "}
                          {t("wallet_history")}
                        </button>
                        <button
                          onClick={() => {
                            navigate("/tasks");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 text-sm text-[#A3A3A3] hover:bg-[#1C1C1C] hover:text-[#FACC15] rounded-xl transition font-medium group"
                        >
                          <div className="bg-[#1C1C1C] p-2 rounded-xl group-hover:bg-[#252525] shadow-sm border border-[#3D3215]">
                            <ListChecks className="w-4 h-4 text-[#FACC15]" />
                          </div>{" "}
                          {t("my_tasks")}
                        </button>
                        <button
                          onClick={() => {
                            navigate("/refer");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 text-sm text-[#A3A3A3] hover:bg-[#1C1C1C] hover:text-[#FACC15] rounded-xl transition font-medium group"
                        >
                          <div className="bg-[#1C1C1C] p-2 rounded-xl group-hover:bg-[#252525] shadow-sm border border-[#3D3215]">
                            <Users className="w-4 h-4 text-[#FACC15]" />
                          </div>{" "}
                          {t("refer_earn")}
                        </button>
                        <button
                          onClick={() => {
                            navigate("/leaderboard");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 text-sm text-[#A3A3A3] hover:bg-[#1C1C1C] hover:text-[#FACC15] rounded-xl transition font-medium group"
                        >
                          <div className="bg-[#1C1C1C] p-2 rounded-xl group-hover:bg-[#252525] shadow-sm border border-[#3D3215]">
                            <Target className="w-4 h-4 text-[#FACC15]" />
                          </div>{" "}
                          {t("leaderboard")}
                        </button>
                        <button
                          onClick={() => {
                            navigate("/rewards");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 text-sm text-[#A3A3A3] hover:bg-[#1C1C1C] hover:text-[#FACC15] rounded-xl transition font-medium group"
                        >
                          <div className="bg-[#1C1C1C] p-2 rounded-xl group-hover:bg-[#252525] shadow-sm border border-[#3D3215]">
                            <Award className="w-4 h-4 text-[#FACC15]" />
                          </div>{" "}
                          {t("rewards_badges")}
                        </button>

                        {(profile?.role === "admin" ||
                          profile?.role === "employee" ||
                          auth.currentUser?.email ===
                            "mdekramhossain590@gmail.com") && (
                          <div className="pt-2 mt-2 border-t border-[#3D3215]">
                            <button
                              onClick={() => {
                                navigate("/admin");
                                setMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-3 text-sm text-[#FACC15] hover:bg-[#1C1C1C] rounded-xl transition font-medium group"
                            >
                              <div className="bg-[#1C1C1C] p-2 rounded-xl group-hover:bg-[#252525] shadow-sm border border-[#3D3215]">
                                <Target className="w-4 h-4 text-[#FACC15]" />
                              </div>{" "}
                              {t("admin_panel")}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 border-t border-[#3D3215] pt-3 space-y-1">
                        
                        <button
                          onClick={() => {
                            navigate("/settings");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#A3A3A3] hover:bg-[#1C1C1C] hover:text-[#FFFFFF] rounded-xl transition"
                        >
                          <Settings className="w-[18px] h-[18px]" />{" "}
                          {t("settings")}
                        </button>
                        <button
                          onClick={() => {
                            navigate("/support");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#A3A3A3] hover:bg-[#1C1C1C] hover:text-[#FFFFFF] rounded-xl transition"
                        >
                          <MessageCircle className="w-[18px] h-[18px]" />{" "}
                          {t("help_support")}
                        </button>
                        <button
                          onClick={() => {
                            navigate("/faq");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#A3A3A3] hover:bg-[#1C1C1C] hover:text-[#FFFFFF] rounded-xl transition"
                        >
                          <HelpCircle className="w-[18px] h-[18px]" />{" "}
                          {t("faq")}
                        </button>
                        <button
                          onClick={() => {
                            navigate("/privacy");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#A3A3A3] hover:bg-[#1C1C1C] hover:text-[#FFFFFF] rounded-xl transition"
                        >
                          <Shield className="w-[18px] h-[18px]" />{" "}
                          {t("privacy_policy")}
                        </button>
                        <button
                          onClick={() => {
                            navigate("/terms");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#A3A3A3] hover:bg-[#1C1C1C] hover:text-[#FFFFFF] rounded-xl transition"
                        >
                          <FileText className="w-[18px] h-[18px]" />{" "}
                          {t("terms_conditions")}
                        </button>
                      </div>

                      <button
                        onClick={async () => {
                          await logOut();
                          navigate("/");
                        }}
                        className="w-full mt-4 flex items-center gap-3 px-3 py-3.5 text-sm text-[#EF4444] hover:bg-[#EF4444]/10 rounded-xl transition font-bold border border-[#EF4444]/30 bg-[#EF4444]/5"
                      >
                        <LogOut className="w-[18px] h-[18px]" /> {t("log_out")}
                      </button>
                      <div className="pb-6"></div>
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="w-12 h-12 rounded-full bg-[#1C1C1C] animate-pulse shadow-lg border-2 border-[#3D3215]"></div>
          ) : profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-[#3D3215]"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8A6508] to-[#D4A017] text-[#090909] flex items-center justify-center font-bold text-xl shadow-lg border-2 border-[#3D3215]">
              <User className="w-6 h-6" />
            </div>
          )}
          <div>
            <p className="text-[11px] font-bold text-[#737373] uppercase tracking-widest leading-none">
              {t("welcome_back")}
            </p>
            {loading ? (
              <div className="h-7 w-32 bg-[#1C1C1C] rounded animate-pulse mt-1"></div>
            ) : (
              <h3 className="font-display font-medium text-xl leading-none text-[#FFFFFF] mt-1 tracking-tight flex items-center gap-1.5">
                {profile?.fullName || user?.displayName || "User"}
                {partnerSettings?.enabled && partnerReferralsCount >= (partnerSettings?.requiredReferrals || 10) && (
                  <BadgeCheck className="w-5 h-5 text-[#FACC15] fill-[#FACC15]/20" />
                )}
              </h3>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-[#151515] border border-[#3D3215] flex items-center justify-center text-[#FACC15] shadow-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-[#FACC15]" />
            ) : (
              <Moon className="w-5 h-5 text-[#FACC15]" />
            )}
          </button>

          <button
            onClick={() => {
              playTapSound();
              setShowNotificationCenter(true);
            }}
            className="w-10 h-10 rounded-full bg-[#151515] border border-[#3D3215] flex items-center justify-center text-[#FACC15] relative shadow-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D4A017] text-[#090909] font-black text-[9px] min-w-4 h-4 rounded-full flex items-center justify-center px-1 border border-[#090909] animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Scrolling Banner */}
      <div className="bg-[#151515] rounded-xl py-2.5 px-3 mb-4 flex items-center border border-[#3D3215] shadow-sm overflow-hidden">
        <span className="text-[#FACC15] mr-2 flex-shrink-0">
          <Megaphone className="w-5 h-5 animate-pulse" />
        </span>
        <div className="flex-1 overflow-hidden relative leading-none flex items-center h-5">
          <div className="animate-marquee whitespace-nowrap absolute">
            <a
              href={banner.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-[#A3A3A3] hover:text-[#FACC15]"
            >
              {banner.text}
            </a>
          </div>
        </div>
      </div>

      {/* Top Earners */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-[13px] font-black text-[#FFFFFF] uppercase tracking-wide flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FACC15]" />
            Top Earners
          </h3>
          <button
            onClick={() => {
              playTapSound();
              navigate("/leaderboard");
            }}
            className="text-[10px] font-bold text-[#FACC15] uppercase tracking-widest bg-[#1C1C1C] border border-[#3D3215] px-3 py-1.5 rounded-full hover:bg-[#252525] transition"
          >
            View All
          </button>
        </div>
        <div className="relative w-full h-[90px]">
          <AnimatePresence mode="wait">
            {topLeaders.length > 0 ? (
              (() => {
                const leader = topLeaders[currentLeaderIndex];
                const index = currentLeaderIndex;
                const isFirst = index === 0;
                const isSecond = index === 1;
                const isThird = index === 2;

                let bgColor = "from-[#151515] to-[#101010]";
                let borderColor = "border-[#3D3215]";
                let avatarBg = "bg-[#1C1C1C]";
                let badgeBg = "bg-[#3D3215] text-[#A3A3A3]";
                let amountColor = "text-[#A3A3A3]";
                
                if (isFirst) {
                  bgColor = "from-[#1C1C1C] to-[#151515]";
                  borderColor = "border-[#D4A017]";
                  avatarBg = "bg-[#252525]";
                  badgeBg = "bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909]";
                  amountColor = "text-[#FACC15]";
                } else if (isSecond) {
                  badgeBg = "bg-[#D4A017]/30 text-[#FACC15]";
                  amountColor = "text-[#FFE082]";
                } else if (isThird) {
                  badgeBg = "bg-[#8A6508]/40 text-[#D4A017]";
                  amountColor = "text-[#D4A017]";
                }

                return (
                  <motion.div
                    key={leader.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`absolute inset-0 w-full bg-gradient-to-br ${bgColor} border ${borderColor} rounded-[20px] p-3 flex items-center gap-4 relative overflow-hidden group shadow-sm`}
                  >
                    {isFirst && <div className="absolute top-0 right-0 w-16 h-16 bg-[#D4A017]/10 blur-xl rounded-full"></div>}
                    
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center font-black text-lg shadow-md ring-2 ring-[#3D3215] overflow-hidden">
                        {leader.photoURL ? (
                          <img src={leader.photoURL} alt="avatar" className={`w-full h-full object-cover ${avatarBg}`} />
                        ) : (
                          <User className="w-6 h-6 text-[#737373]" />
                        )}
                      </div>
                      <div className={`absolute -top-1 -right-1 ${badgeBg} w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ring-1 ring-[#090909]`}>
                        {index + 1}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#FFFFFF] truncate w-full mb-0.5">
                        {leader.fullName}
                      </p>
                      <p className="text-[10px] font-medium text-[#737373] uppercase tracking-widest leading-none mb-1">
                        Rank #{index + 1}
                      </p>
                    </div>
                    
                    <div className="shrink-0 flex flex-col items-end pl-2 border-l border-[#3D3215]">
                      <p className="text-[10px] font-bold text-[#737373] mb-0.5">
                        INCOME
                      </p>
                      <p className={`text-sm font-black ${amountColor}`}>
                        ৳{leader.totalIncome.toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                );
              })()
            ) : (
              <div className="absolute inset-0 w-full text-center py-4 text-xs font-medium text-[#737373] flex items-center justify-center bg-[#151515] rounded-[20px] border border-dashed border-[#3D3215]">
                Check back soon to see top earners!
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Total Balance Credit Card */}
      <div className="relative mb-8 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full aspect-[1.58/1] bg-gradient-to-br from-[#1A1508] via-[#101010] to-[#0A0A0A] rounded-2xl sm:rounded-[24px] p-4 sm:p-6 text-white shadow-2xl relative overflow-hidden border border-[#3D3215] group"
        >
          {/* Animated Background Orbs */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4A017]/15 blur-[60px] rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8A6508]/15 blur-[60px] rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            {/* Card Top */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-black opacity-60 mb-0.5 sm:mb-1 text-[#A3A3A3]">
                  {t("digital_wallet")}
                </p>
                <div className="flex items-center gap-2">
                  {siteSettings?.logoUrl && (
                    <div className="h-7 sm:h-8 max-w-[80px] sm:max-w-[100px] flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg px-1.5 py-0.5 border border-[#3D3215]">
                      <img
                        src={siteSettings.logoUrl}
                        alt="Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                  <h2 className="text-xl sm:text-2xl font-display font-black italic tracking-tighter drop-shadow-sm text-white">
                    HMF <span className="text-[#FACC15]">EARNING ZONE</span>
                  </h2>
                  <div className="w-px h-4 sm:h-5 bg-[#3D3215]"></div>
                  <span className="text-[8px] sm:text-[10px] font-bold text-[#FACC15] uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#D4A017]/15 rounded-full border border-[#D4A017]/30 font-mono">
                    Platinum
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/5 backdrop-blur-md border border-[#3D3215] flex items-center justify-center">
                  <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4A017]" />
                </div>
              </div>
            </div>

            {/* Card Middle: Chip & Balance */}
            <div className="mt-2 sm:mt-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="w-8 h-6 sm:w-10 sm:h-8 bg-gradient-to-br from-[#FFE082] via-[#FACC15] to-[#8A6508] rounded-md mb-2 sm:mb-3 flex flex-col gap-0.5 sm:gap-1 p-1 sm:p-1.5 shadow-inner">
                    <div className="w-full h-px bg-black/20"></div>
                    <div className="w-full h-px bg-black/20"></div>
                    <div className="w-full h-px bg-black/20"></div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <p className="text-[8px] sm:text-[10px] text-[#A3A3A3] font-bold uppercase tracking-widest">
                      {t("total_balance")}
                    </p>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-1 sm:p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-[#3D3215]"
                    >
                      {showBalance ? (
                        <EyeOff className="w-3 h-3 text-[#A3A3A3]" />
                      ) : (
                        <Eye className="w-3 h-3 text-[#A3A3A3]" />
                      )}
                    </button>
                    {profile?.role === "admin" && (
                      <button
                        onClick={handleResetAdminBalance}
                        title="অ্যাডমিন ব্যালেন্স ৳ 0.00 করুন"
                        className="p-1 sm:px-2 py-1 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded-lg text-[10px] font-bold border border-rose-400/20 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span className="hidden sm:inline">ব্যালেন্স ০ করুন</span>
                      </button>
                    )}
                  </div>
                  {loading ? (
                    <div className="h-8 sm:h-10 w-28 sm:w-40 bg-[#1C1C1C] rounded-lg animate-pulse mt-1"></div>
                  ) : (
                    <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight text-white mt-1 leading-none">
                      {showBalance
                        ? `৳ ${((profile?.balances?.main || 0) + (profile?.balances?.bonus || 0) + (profile?.balances?.referral || 0) + (profile?.balances?.gift || 0) + (profile?.balances?.partner || 0) + (typeof profile?.balances?.tasks === 'object' ? Object.values(profile.balances.tasks).reduce((a: any, b: any) => Number(a) + Number(b), 0) as number : Number(profile?.balances?.tasks || 0))).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "৳ ••••••"}
                    </h1>
                  )}
                </div>

                <button
                  onClick={() => navigate("/wallet?tab=withdraw")}
                  className="bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg shadow-[#D4A017]/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 sm:gap-2"
                >
                  <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#090909]" />
                  {t("withdraw")}
                </button>
              </div>
            </div>

            {/* Card Bottom: User & ID */}
            <div className="flex justify-between items-end border-t border-[#3D3215] pt-2 sm:pt-4">
              <div>
                <p className="text-[8px] sm:text-[9px] text-[#A3A3A3] font-bold mb-0.5 uppercase tracking-widest font-sans">
                  {t("card_holder")}
                </p>
                <p className="text-xs sm:text-[14px] font-bold tracking-wide uppercase truncate max-w-[120px] sm:max-w-[150px] font-display text-white">
                  {profile?.fullName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[8px] sm:text-[9px] text-[#A3A3A3] font-bold mb-0.5 uppercase tracking-widest font-sans">
                  {t("member_id")}
                </p>
                <p className="text-xs sm:text-[14px] font-mono font-bold tracking-[0.1em] text-[#FACC15]">
                  {profile?.myReferCode || "HE000001"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Partner Program Section */}
      {partnerSettings.enabled && (
        <div className="bg-[#151515] border border-[#3D3215] rounded-3xl p-5 mb-8 text-left relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-black text-[#FACC15] capitalize">Partner Program</h3>
              <p className="text-[11px] font-bold text-[#737373] mt-1 uppercase tracking-widest">Get ৳{partnerSettings.dailyBonus} daily by inviting {partnerSettings.requiredReferrals}+ active users</p>
            </div>
            <div className="bg-[#1C1C1C] border border-[#3D3215] p-2.5 rounded-2xl">
              <Coins className="w-5 h-5 text-[#FACC15]" />
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5 px-1">
              <span className="text-[10px] font-bold text-[#737373] uppercase tracking-widest">Progress</span>
              <span className="text-xs font-black text-[#FACC15]">{partnerReferralsCount} / {partnerSettings.requiredReferrals}</span>
            </div>
            <div className="h-2.5 w-full bg-[#101010] rounded-full overflow-hidden border border-[#3D3215]">
              <div 
                className="h-full bg-gradient-to-r from-[#D4A017] to-[#FACC15] rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, (partnerReferralsCount / partnerSettings.requiredReferrals) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          <button
            disabled={claimingPartner}
            className={`w-full font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-xs ${alreadyClaimedPartner ? 'bg-[#1C1C1C] text-[#737373] border border-[#3D3215] shadow-none cursor-not-allowed' : 'bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] shadow-[#D4A017]/25 hover:brightness-110'}`}
            onClick={async () => {
              if (alreadyClaimedPartner) {
                toast.error(language === 'Bengali' ? 'আগামীকাল পর্যন্ত অপেক্ষা করুন।' : 'Please wait until tomorrow to claim again.');
                return;
              }
              if (!auth.currentUser) return;
              if (claimingPartner) return;
              if (partnerReferralsCount < partnerSettings.requiredReferrals) {
                toast.error(`You need at least ${partnerSettings.requiredReferrals} referrals to claim.`);
                return;
              }
              
              const now = new Date();
              const todayStr = now.toISOString().split('T')[0];
              const lastClaimed = profile?.partnerClaimedAt ? new Date(profile.partnerClaimedAt.toDate ? profile.partnerClaimedAt.toDate() : profile.partnerClaimedAt).toISOString().split('T')[0] : null;
              
              if (lastClaimed === todayStr) {
                toast.error("You have already claimed today's partner bonus!");
                return;
              }
              
              try {
                setClaimingPartner(true);
                const batch = writeBatch(db);
                // import serverTimestamp from firestore:
                
                
                batch.update(doc(db, "users", (auth.currentUser?.uid as string)), {
                  "balances.partner": increment(partnerSettings.dailyBonus),
                  partnerClaimedAt: serverTimestamp()
                });
                
                const txRef = doc(collection(db, "users", (auth.currentUser?.uid as string), "transactions"));
                batch.set(txRef, {
                  amount: partnerSettings.dailyBonus,
                  type: 'partner_bonus',
                  status: 'completed',
                  createdAt: serverTimestamp(),
                  description: 'Daily Partner Bonus'
                });
                
                await batch.commit();
                if (refreshProfile) await refreshProfile();
                setShowCelebration(true);
                toast.success(`৳${partnerSettings.dailyBonus} daily partner bonus claimed!`);
              } catch (err: any) {
                console.error(err?.message || "Unknown Error");
                toast.error("Failed to claim bonus.");
              } finally {
                setClaimingPartner(false);
              }
            }}
          >
            {alreadyClaimedPartner ? 'Claimed Today' : `Claim Daily ৳${partnerSettings.dailyBonus}`}
          </button>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="bg-[#151515] p-4 sm:p-5 rounded-[32px] shadow-sm border border-[#3D3215] mb-8 select-none">
        <h3 className="text-[13px] font-black text-[#FFFFFF] mb-4 px-2 uppercase tracking-wide flex items-center gap-2">
          <Star className="w-4 h-4 text-[#FACC15] fill-[#FACC15]" />
          Premium Features
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Gift Code */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playTapSound();
              navigate("/gift");
            }}
            className="relative flex items-center gap-3 p-3 sm:p-4 rounded-[24px] border transition-all cursor-pointer group bg-[#101010] border-[#3D3215] hover:bg-[#1C1C1C] hover:border-[#D4A017]/60"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-[16px] flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#D4A017] to-[#8A6508] text-[#090909] shadow-md shadow-[#D4A017]/20 group-hover:scale-105 transition-transform">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <span className="text-[11px] sm:text-[13px] font-bold truncate text-[#FFFFFF]">
                Gift Code
              </span>
              <span className="text-[9px] font-black text-[#FACC15] uppercase tracking-widest flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15]"></div>
                CLAIM
              </span>
            </div>
          </motion.div>

          {/* Drive Offers */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playTapSound();
              if (siteSettings?.driveOffersEnabled === false) {
                setComingSoonFeature({
                  title: "Drive Offers Suspended",
                  desc: "দুঃখিত, ড্রাইভ অফার প্যাক ক্রয় করার সুবিধাটি এডমিন দ্বারা সাময়িকভাবে বন্ধ রাখা হয়েছে। নতুন অফারগুলোর সাথে শীঘ্রই পুনরায় সার্ভিসটি চালু হবে। আমাদের সাথে থাকুন!",
                  icon: <Wifi className="w-7 h-7" />,
                  color: "from-blue-600 to-indigo-700",
                });
              } else {
                navigate("/drive");
              }
            }}
            className={`relative flex items-center gap-3 p-3 sm:p-4 rounded-[24px] border transition-all cursor-pointer group ${
              siteSettings?.driveOffersEnabled === false
                ? "bg-[#101010] border-[#3D3215] opacity-60"
                : "bg-[#101010] border-[#3D3215] hover:bg-[#1C1C1C] hover:border-[#D4A017]/60"
            }`}
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-[16px] flex items-center justify-center relative overflow-hidden ${
                siteSettings?.driveOffersEnabled === false
                  ? "bg-[#1C1C1C] text-[#737373]"
                  : "bg-gradient-to-br from-[#FFE082] to-[#D4A017] text-[#090909] shadow-md shadow-[#D4A017]/20 group-hover:scale-105 transition-transform"
              }`}
            >
              <Wifi className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <span
                className={`text-[11px] sm:text-[13px] font-bold truncate ${siteSettings?.driveOffersEnabled === false ? "text-[#737373]" : "text-[#FFFFFF]"}`}
              >
                {t("drive_offer")}
              </span>
              {siteSettings?.driveOffersEnabled === false ? (
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                  OFFLINE
                </span>
              ) : (
                <span className="text-[9px] font-black text-[#FACC15] uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15]"></div>
                  LIVE NOW
                </span>
              )}
            </div>
          </motion.div>

          {/* Recharge */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playTapSound();
              navigate("/recharge");
            }}
            className={`relative flex items-center gap-3 p-3 sm:p-4 rounded-[24px] border transition-all cursor-pointer group ${
              siteSettings?.rechargeEnabled === false
                ? "bg-[#101010] border-[#3D3215] opacity-60"
                : "bg-[#101010] border-[#3D3215] hover:bg-[#1C1C1C] hover:border-[#D4A017]/60"
            }`}
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-[16px] flex items-center justify-center relative overflow-hidden ${
                siteSettings?.rechargeEnabled === false
                  ? "bg-[#1C1C1C] text-[#737373]"
                  : "bg-gradient-to-br from-[#D4A017] to-[#8A6508] text-[#090909] shadow-md shadow-[#D4A017]/20 group-hover:scale-105 transition-transform"
              }`}
            >
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <span
                className={`text-[11px] sm:text-[13px] font-bold truncate ${siteSettings?.rechargeEnabled === false ? "text-[#737373]" : "text-[#FFFFFF]"}`}
              >
                {t("recharge")}
              </span>
              {siteSettings?.rechargeEnabled === false ? (
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                  OFFLINE
                </span>
              ) : (
                <span className="text-[9px] font-black text-[#FACC15] uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15]"></div>
                  LIVE NOW
                </span>
              )}
            </div>
          </motion.div>

          {/* Courses */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playTapSound();
              if (siteSettings?.coursesEnabled === false) {
                setComingSoonFeature({
                  title: "Premium Courses",
                  desc: "খুব শীঘ্রই আমাদের প্রিমিয়াম কোর্সগুলো (ডিজিটাল মার্কেটিং, ভিডিও এডিটিং ও গ্রাফিক্স ডিজাইন) ড্যাশবোর্ডে লাইভ হবে যা শিখে আপনি স্থায়ীভাবে ইনকাম বাড়াতে পারবেন। আমাদের সাথেই থাকুন!",
                  icon: <BookOpen className="w-7 h-7" />,
                  color: "from-[#D4A017] to-[#8A6508]",
                });
              } else {
                navigate("/courses");
              }
            }}
            className={`relative flex items-center gap-3 p-3 sm:p-4 rounded-[24px] border transition-all cursor-pointer group ${
              siteSettings?.coursesEnabled === false
                ? "bg-[#101010] border-[#3D3215] opacity-60"
                : "bg-[#101010] border-[#3D3215] hover:bg-[#1C1C1C] hover:border-[#D4A017]/60"
            }`}
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-[16px] flex items-center justify-center relative overflow-hidden ${
                siteSettings?.coursesEnabled === false
                  ? "bg-[#1C1C1C] text-[#737373]"
                  : "bg-gradient-to-br from-[#FACC15] to-[#D4A017] text-[#090909] shadow-md shadow-[#D4A017]/20 group-hover:scale-105 transition-transform"
              }`}
            >
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <span
                className={`text-[11px] sm:text-[13px] font-bold truncate ${siteSettings?.coursesEnabled === false ? "text-[#737373]" : "text-[#FFFFFF]"}`}
              >
                {t("courses")}
              </span>
              {siteSettings?.coursesEnabled === false ? (
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                  OFFLINE
                </span>
              ) : (
                <span className="text-[9px] font-black text-[#FACC15] uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15]"></div>
                  LIVE NOW
                </span>
              )}
            </div>
          </motion.div>

          {/* Top-Up (Replaces Salary) */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playTapSound();
              window.open("https://rushtopbd.shop", "_blank", "noopener,noreferrer");
            }}
            className="relative flex items-center gap-3 p-3 sm:p-4 rounded-[24px] border border-[#3D3215] bg-[#101010] hover:bg-[#1A1508] hover:border-[#FACC15]/60 transition-all cursor-pointer group shadow-sm"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-[16px] flex items-center justify-center bg-gradient-to-br from-[#8A6508]/30 to-[#D4A017]/20 border border-[#D4A017]/40 text-[#FACC15] group-hover:scale-105 transition-transform shadow-inner">
              <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#FACC15]" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <span className="text-[11px] sm:text-[13px] font-bold truncate text-[#FFFFFF] group-hover:text-[#FACC15] transition-colors">
                Top-Up
              </span>
              <span className="text-[9px] font-black text-[#FACC15] uppercase tracking-widest flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15] animate-pulse"></div>
                LIVE NOW
              </span>
            </div>
          </motion.div>

          {/* Ads View */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playTapSound();
              if (siteSettings?.adsViewEnabled) {
                navigate("/ads");
              } else {
                setComingSoonFeature({
                  title: "Ads View Earnings",
                  desc: "ভিডিও ও বিজ্ঞাপন দেখে প্রতি ভিউতে অতিরিক্ত বোনাস টাকা ক্যাশব্যাক করার হাই-পেইড সেলফ ইনকাম ফিচারটি আমাদের পরবর্তী আপডেটে উন্নত এড-নেটওয়ার্ক ও ইনস্ট্যান্ট উইথড্র সুবিধা সহ চালু হচ্ছে। আমাদের সাথেই থাকুন!",
                  icon: <MonitorPlay className="w-7 h-7" />,
                  color: "from-[#D4A017] to-[#8A6508]",
                  link: siteSettings?.adsViewLink || "",
                  linkText:
                    siteSettings?.adsViewText || "অফিসিয়াল চ্যানেল এ যুক্ত হন",
                });
              }
            }}
            className={`relative flex items-center gap-3 p-3 sm:p-4 rounded-[24px] border transition-all cursor-pointer group ${
              !siteSettings?.adsViewEnabled
                ? "bg-[#101010] border-[#3D3215] opacity-60"
                : "bg-[#101010] border-[#3D3215] hover:bg-[#1C1C1C] hover:border-[#D4A017]/60"
            }`}
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-[16px] flex items-center justify-center relative overflow-hidden ${
                !siteSettings?.adsViewEnabled
                  ? "bg-[#1C1C1C] text-[#737373]"
                  : "bg-gradient-to-br from-[#FFE082] to-[#D4A017] text-[#090909] shadow-md shadow-[#D4A017]/20 group-hover:scale-105 transition-transform"
              }`}
            >
              <MonitorPlay
                className="w-5 h-5 sm:w-6 sm:h-6"
                strokeWidth={1.5}
              />
            </div>
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <span
                className={`text-[11px] sm:text-[13px] font-bold truncate ${!siteSettings?.adsViewEnabled ? "text-[#737373]" : "text-[#FFFFFF]"}`}
              >
                {t("ads_view")}
              </span>
              {!siteSettings?.adsViewEnabled ? (
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                  OFFLINE
                </span>
              ) : (
                <span className="text-[9px] font-black text-[#FACC15] uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15]"></div>
                  LIVE NOW
                </span>
              )}
            </div>
          </motion.div>

          {/* Reviews */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playTapSound();
              navigate("/reviews");
            }}
            className={`relative flex items-center gap-3 p-3 sm:p-4 rounded-[24px] border transition-all cursor-pointer group ${
              siteSettings?.reviewsEnabled === false
                ? "bg-[#101010] border-[#3D3215] opacity-60"
                : "bg-[#101010] border-[#3D3215] hover:bg-[#1C1C1C] hover:border-[#D4A017]/60"
            }`}
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-[16px] flex items-center justify-center relative overflow-hidden ${
                siteSettings?.reviewsEnabled === false
                  ? "bg-[#1C1C1C] text-[#737373]"
                  : "bg-gradient-to-br from-[#FACC15] to-[#8A6508] text-[#090909] shadow-md shadow-[#D4A017]/20 group-hover:scale-105 transition-transform"
              }`}
            >
              <Star
                className="w-5 h-5 sm:w-6 sm:h-6 fill-current"
                strokeWidth={1.5}
              />
            </div>
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <span
                className={`text-[11px] sm:text-[13px] font-bold truncate ${siteSettings?.reviewsEnabled === false ? "text-[#737373]" : "text-[#FFFFFF]"}`}
              >
                Reviews
              </span>
              {siteSettings?.reviewsEnabled === false ? (
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                  OFFLINE
                </span>
              ) : (
                <span className="text-[9px] font-black text-[#FACC15] uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15]"></div>
                  HOT NOW
                </span>
              )}
            </div>
          </motion.div>

          {/* Post a Job */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playTapSound();
              navigate("/post-job");
            }}
            className="relative flex items-center gap-3 p-3 sm:p-4 rounded-[24px] border border-[#3D3215] bg-[#101010] hover:bg-[#1C1C1C] hover:border-[#D4A017]/60 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-[16px] flex items-center justify-center bg-gradient-to-br from-[#D4A017] to-[#8A6508] text-[#090909] shadow-md shadow-[#D4A017]/20 group-hover:scale-105 transition-transform relative overflow-hidden">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <span className="text-[11px] sm:text-[13px] font-bold truncate text-[#FFFFFF]">
                Post Job
              </span>
              <span className="text-[9px] font-black text-[#FACC15] uppercase tracking-widest flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15] animate-pulse"></div>
                জব পোস্ট
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="bg-[#151515] rounded-2xl p-4 shadow-sm border border-[#3D3215] mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017]/5 blur-2xl rounded-full"></div>
        <h3 className="font-display font-medium text-[#FFFFFF] mb-3 text-base flex items-center gap-2 relative z-10 tracking-tight">
          <Link className="w-4 h-4 text-[#FACC15]" />
          {t("share_to_earn")}
        </h3>
        <div className="flex flex-col gap-3 relative z-10">
          <div className="flex items-center gap-2 bg-[#101010] p-3 rounded-xl border border-[#3D3215] transition-colors hover:border-[#D4A017]/50">
            <span className="text-xs text-[#A3A3A3] font-medium whitespace-nowrap min-w-[50px]">
              {t("code")}:
            </span>
            <span className="font-mono font-bold text-[#FACC15] flex-1 truncate">
              {profile?.myReferCode || (
                <span className="text-xs text-[#737373] animate-pulse">Generating...</span>
              )}
            </span>
            <button
              onClick={() => handleCopy(profile?.myReferCode || "", "code")}
              className="p-1.5 rounded-md bg-[#1C1C1C] text-[#FACC15] hover:bg-[#252525] shadow-sm border border-[#3D3215] transition-colors"
              disabled={!profile?.myReferCode}
            >
              {copiedCode ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 bg-[#101010] p-3 rounded-xl border border-[#3D3215] transition-colors hover:border-[#D4A017]/50">
            <span className="text-xs text-[#A3A3A3] font-medium whitespace-nowrap min-w-[50px]">
              {t("link")}:
            </span>
            <span className="text-xs text-[#A3A3A3] flex-1 truncate opacity-90 select-all">
              {profile?.myReferCode
                ? `${window.location.origin}/register?ref=${profile.myReferCode}`
                : <span className="text-xs text-[#737373] animate-pulse">Generating link...</span>}
            </span>
            <button
              onClick={() =>
                handleCopy(
                  `${window.location.origin}/register?ref=${profile?.myReferCode}`,
                  "link",
                )
              }
              className="p-1.5 rounded-md bg-[#1C1C1C] text-[#FACC15] hover:bg-[#252525] shadow-sm border border-[#3D3215] transition-colors flex-shrink-0"
              disabled={!profile?.myReferCode}
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Premium Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <motion.div
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playTapSound();
            navigate("/wallet");
          }}
          className="flex items-center gap-3 p-3 rounded-2xl bg-[#151515] border border-[#3D3215] shadow-sm cursor-pointer hover:border-[#D4A017]/50 transition"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-[#D4A017] to-[#8A6508] text-[#090909] flex items-center justify-center shadow-inner">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-[#FFFFFF] text-sm truncate">
              {t("wallet")}
            </h4>
            <p className="text-[10px] text-[#737373] font-medium truncate">
              History & Withdraw
            </p>
          </div>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playTapSound();
            navigate("/tasks");
          }}
          className="flex items-center gap-3 p-3 rounded-2xl bg-[#151515] border border-[#3D3215] shadow-sm cursor-pointer hover:border-[#D4A017]/50 transition"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-[#FFE082] to-[#D4A017] text-[#090909] flex items-center justify-center shadow-inner">
            <ListChecks className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-[#FFFFFF] text-sm truncate">
              {t("tasks")}
            </h4>
            <p className="text-[10px] text-[#737373] font-medium truncate">
              Earn doing tasks
            </p>
          </div>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playTapSound();
            navigate("/spin");
          }}
          className="flex items-center gap-3 p-3 rounded-2xl bg-[#151515] border border-[#3D3215] shadow-sm cursor-pointer hover:border-[#D4A017]/50 transition"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-[#FACC15] to-[#8A6508] text-[#090909] flex items-center justify-center shadow-inner">
            <Target className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-[#FFFFFF] text-sm truncate">
              {t("spin")}
            </h4>
            <p className="text-[10px] text-[#737373] font-medium truncate">
              Lucky Wheel
            </p>
          </div>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playTapSound();
            navigate("/math");
          }}
          className="flex items-center gap-3 p-3 rounded-2xl bg-[#151515] border border-[#3D3215] shadow-sm cursor-pointer hover:border-[#D4A017]/50 transition"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-[#FFE082] to-[#D4A017] text-[#090909] flex items-center justify-center shadow-inner">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-[#FFFFFF] text-sm truncate">
              {t("math")}
            </h4>
            <p className="text-[10px] text-[#737373] font-medium truncate">
              Solve & Earn
            </p>
          </div>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playTapSound();
            navigate("/refer");
          }}
          className="flex items-center gap-3 p-3 rounded-2xl bg-[#151515] border border-[#3D3215] shadow-sm cursor-pointer hover:border-[#D4A017]/50 transition"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-[#D4A017] to-[#8A6508] text-[#090909] flex items-center justify-center shadow-inner">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-[#FFFFFF] text-sm truncate">
              {t("refer")}
            </h4>
            <p className="text-[10px] text-[#737373] font-medium truncate">
              Invite Friends
            </p>
          </div>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playTapSound();
            navigate("/leaderboard");
          }}
          className="flex items-center gap-3 p-3 rounded-2xl bg-[#151515] border border-[#3D3215] shadow-sm cursor-pointer hover:border-[#D4A017]/50 transition"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-[#FACC15] to-[#8A6508] text-[#090909] flex items-center justify-center shadow-inner">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-[#FFFFFF] text-sm truncate">
              {t("leaderboard")}
            </h4>
            <p className="text-[10px] text-[#737373] font-medium truncate">
              Top Earners
            </p>
          </div>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playTapSound();
            navigate("/rewards");
          }}
          className="flex items-center gap-3 p-3 rounded-2xl bg-[#151515] border border-[#3D3215] shadow-sm cursor-pointer hover:border-[#D4A017]/50 transition"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-[#FFE082] to-[#D4A017] text-[#090909] flex items-center justify-center shadow-inner">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-[#FFFFFF] text-sm truncate">
              {t("rewards_badges")}
            </h4>
            <p className="text-[10px] text-[#737373] font-medium truncate">
              Claim prizes
            </p>
          </div>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playTapSound();
            navigate("/support");
          }}
          className="flex items-center gap-3 p-3 rounded-2xl bg-[#151515] border border-[#3D3215] shadow-sm cursor-pointer hover:border-[#D4A017]/50 transition"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-[#D4A017] to-[#8A6508] text-[#090909] flex items-center justify-center shadow-inner">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-[#FFFFFF] text-sm truncate">
              {t("help_support")}
            </h4>
            <p className="text-[10px] text-[#737373] font-medium truncate">
              Get Help
            </p>
          </div>
        </motion.div>
      </div>



      {/* Recent Activity Feed */}
      <div className="bg-[#151515] rounded-2xl p-4 shadow-sm border border-[#3D3215] mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017]/5 blur-2xl rounded-full"></div>
        <div className="flex justify-between items-center mb-4 relative z-10">
          <h3 className="font-display font-medium text-[#FFFFFF] text-base flex items-center gap-2 tracking-tight">
            <Activity className="w-4 h-4 text-[#FACC15]" />
            {t("recent_activity")}
          </h3>
          <div className="flex items-center gap-2.5">
            {profile?.role === "admin" && getCombinedActivity().length > 0 && (
              <button
                onClick={handleClearMyActivity}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-950/40 hover:bg-rose-900/40 px-2.5 py-1 rounded-lg transition-all cursor-pointer border border-rose-900/50"
                title="রিসেন্ট অ্যাক্টিভিটি হিস্ট্রি মুছুন"
              >
                <Trash2 className="w-3 h-3" /> হিস্ট্রি মুছুন
              </button>
            )}
            <Link to="/activity" className="text-xs font-bold text-[#FACC15] hover:underline">
              {language === "Bengali" ? "সব দেখুন" : "View All"}
            </Link>
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          {getCombinedActivity().length === 0 ? (
            <div className="text-center py-8 text-[#737373] font-medium">
              <Activity className="w-10 h-10 mx-auto mb-2 opacity-20 text-[#737373]" />
              <p className="text-xs">{t("no_recent_activity")}</p>
            </div>
          ) : (
            getCombinedActivity().map((activity) => {
              const isTask = activity.type === "task";
              const isReferral = activity.type === "referral";
              const isWithdraw = !isTask && !isReferral && activity.type === "withdraw";
              const isDeposit = !isTask && !isReferral && activity.type === "deposit";

              let title = "";
              let rewardStr = "";
              let badgeColor = "";
              let IconComponent = CheckCircle;
              let statusLabel = "";
              let statusColor = "";

              // Fix reward value formatting by falling back
              let displayAmount = parseFloat(
                activity.reward || activity.amount || activity.bonusEarned || 0,
              ).toFixed(2);
              if (isReferral) {
                displayAmount = getRefBonus(activity).toFixed(2);
              }

              if (isReferral) {
                title = (language === "Bengali" ? "রেফারেল: " : "Referral: ") + (activity.referredName || activity.referredEmail?.split("@")[0] || "User");
                rewardStr = `+৳${displayAmount}`;
                badgeColor = "bg-[#1C1C1C] text-[#FACC15] border border-[#3D3215]";
                IconComponent = CheckCircle;
                statusLabel = language === "Bengali" ? "সম্পন্ন" : "Completed";
                statusColor = "text-[#FACC15] bg-[#3D3215]/30";
              } else if (isTask) {
                title = activity.title || t("completed_task_activity");
                rewardStr = `+৳${displayAmount}`;
                
                const taskStatus = activity.status || 'pending';
                if (taskStatus === 'approved') {
                  badgeColor = "bg-[#1C1C1C] text-[#FACC15] border border-[#3D3215]";
                  IconComponent = CheckCircle;
                  statusLabel = language === "Bengali" ? "অনুমোদিত" : "Approved";
                  statusColor = "text-[#FACC15] bg-[#3D3215]/30";
                } else if (taskStatus === 'rejected') {
                  badgeColor = "bg-red-950/20 text-red-400 border border-red-900/30";
                  IconComponent = XCircle;
                  statusLabel = language === "Bengali" ? "বাতিল" : "Rejected";
                  statusColor = "text-red-400 bg-red-950/30";
                  rewardStr = `+৳0`;
                } else {
                  badgeColor = "bg-[#1C1C1C] text-[#FFE082] border border-[#3D3215]";
                  IconComponent = Clock;
                  statusLabel = language === "Bengali" ? "অপেক্ষমান" : "Pending";
                  statusColor = "text-[#FFE082] bg-[#3D3215]/30";
                }
              } else {
                // Transaction
                if (isWithdraw) {
                  title =
                    language === "Bengali" ? "টাকা উত্তোলন" : "Withdrawals";
                  rewardStr = `-৳${displayAmount}`;
                  badgeColor =
                    "bg-rose-950/20 text-rose-400 border border-rose-900/30";
                  IconComponent = ArrowUpRight;
                } else if (isDeposit) {
                  title = language === "Bengali" ? "টাকা ডিপোজিট" : "Deposits";
                  rewardStr = `+৳${displayAmount}`;
                  badgeColor =
                    "bg-[#1C1C1C] text-[#FACC15] border border-[#3D3215]";
                  IconComponent = ArrowDownLeft;
                } else {
                  title =
                    activity.title ||
                    (activity.type
                      ? activity.type.toUpperCase()
                      : language === "Bengali"
                        ? "লেনদেন"
                        : "Transaction");
                  rewardStr = `+৳${displayAmount}`;
                  badgeColor =
                    "bg-[#1C1C1C] text-[#D4A017] border border-[#3D3215]";
                  IconComponent = ArrowDownLeft;
                }

                if (activity.status === "pending") {
                  statusLabel = language === "Bengali" ? "পেন্ডিং" : "Pending";
                  statusColor =
                    "text-[#FFE082] bg-[#3D3215]/30";
                } else if (activity.status === "approved") {
                  statusLabel =
                    language === "Bengali" ? "অনুমোদিত" : "Approved";
                  statusColor =
                    "text-[#FACC15] bg-[#3D3215]/30";
                } else if (activity.status === "rejected") {
                  statusLabel = language === "Bengali" ? "বাতিল" : "Rejected";
                  statusColor =
                    "text-rose-450 bg-rose-950/30";
                } else {
                  statusLabel =
                    language === "Bengali" ? "সম্পন্ন" : "Completed";
                  statusColor =
                    "text-[#FACC15] bg-[#3D3215]/30";
                }
              }

              const formattedDate =
                activity.date instanceof Date && !isNaN(activity.date.getTime())
                  ? activity.date.toLocaleDateString(
                      language === "Bengali" ? "bn-BD" : "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )
                  : "Just now";

              return (
                <div
                  key={activity.id}
                  className="bg-[#101010] p-3 rounded-xl border border-[#3D3215] flex justify-between items-center transition-all hover:bg-[#1C1C1C]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-inner shrink-0 ${badgeColor}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#FFFFFF] tracking-tight line-clamp-1">
                        {title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[#737373] font-medium">
                          {formattedDate}
                        </span>
                        {statusLabel && (
                          <span
                            className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${statusColor}`}
                          >
                            {statusLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-1">
                    <span
                      className={`text-sm font-black tracking-tight ${
                        isWithdraw || activity.status === "rejected"
                          ? "text-rose-450"
                          : "text-[#FACC15]"
                      }`}
                    >
                      {rewardStr}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Celebration isVisible={showCelebration} onComplete={() => setShowCelebration(false)} />
      {showActivationPopup && (
        <ActivationPopup onClose={() => setShowActivationPopup(false)} />
      )}

      {/* Trust & Security Section */}
      <div className="bg-[#151515] p-5 rounded-[32px] shadow-sm border border-[#3D3215] mb-8 select-none">
        <h3 className="text-[13px] font-black text-[#FFFFFF] mb-4 px-2 uppercase tracking-wide flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#FACC15]" />
          Trust & Security
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center justify-center p-4 bg-[#101010] rounded-2xl border border-[#3D3215] text-center transition-transform hover:scale-[1.02]">
            <Shield className="w-8 h-8 text-[#FACC15] mb-2 drop-shadow-sm" />
            <h4 className="text-[11px] font-bold text-[#FFFFFF] uppercase tracking-widest">
              Secure Platform
            </h4>
            <p className="text-[10px] text-[#A3A3A3] mt-1 leading-tight font-medium">
              Your data and earnings are fully protected.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-[#101010] rounded-2xl border border-[#3D3215] text-center transition-transform hover:scale-[1.02]">
            <Award className="w-8 h-8 text-[#FFE082] mb-2 drop-shadow-sm" />
            <h4 className="text-[11px] font-bold text-[#FFFFFF] uppercase tracking-widest">
              Verified Payouts
            </h4>
            <p className="text-[10px] text-[#A3A3A3] mt-1 leading-tight font-medium">
              Thousands of users are getting paid securely.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-[#101010] rounded-2xl border border-[#3D3215] text-center transition-transform hover:scale-[1.02]">
            <CheckCircle className="w-8 h-8 text-[#D4A017] mb-2 drop-shadow-sm" />
            <h4 className="text-[11px] font-bold text-[#FFFFFF] uppercase tracking-widest">
              Trusted Tasks
            </h4>
            <p className="text-[10px] text-[#A3A3A3] mt-1 leading-tight font-medium">
              All jobs are verified by our team.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-[#101010] rounded-2xl border border-[#3D3215] text-center transition-transform hover:scale-[1.02]">
            <MessageCircle className="w-8 h-8 text-[#8A6508] mb-2 drop-shadow-sm" />
            <h4 className="text-[11px] font-bold text-[#FFFFFF] uppercase tracking-widest">
              24/7 Support
            </h4>
            <p className="text-[10px] text-[#A3A3A3] mt-1 leading-tight font-medium">
              Our team is always ready to assist you.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-[#3D3215] flex flex-wrap justify-center gap-4 text-[11px] font-bold uppercase tracking-widest text-[#737373]">
          <button
            onClick={() => navigate("/terms")}
            className="hover:text-[#FACC15] transition-colors"
          >
            Terms of Service
          </button>
          <span className="opacity-30">•</span>
          <button
            onClick={() => navigate("/privacy")}
            className="hover:text-[#FACC15] transition-colors"
          >
            Privacy Policy
          </button>
          <span className="opacity-30">•</span>
          <button
            onClick={() => navigate("/faq")}
            className="hover:text-[#FACC15] transition-colors"
          >
            Help Center
          </button>
        </div>
      </div>

      {/* Notification Center Popover / Modal */}
      <AnimatePresence>
        {showNotificationCenter && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Background Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotificationCenter(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              id="notifications-overlay-backdrop"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-[#151515] w-full max-w-md rounded-3xl p-5 shadow-2xl border border-[#3D3215] relative z-10 flex flex-col max-h-[80vh] overflow-hidden"
              id="notifications-modal-container"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#3D3215] mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#D4A017]/10 border border-[#3D3215] rounded-lg text-[#FACC15] shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-base">
                    {t("notification_center")}
                  </h4>
                </div>
                <button
                  onClick={() => setShowNotificationCenter(false)}
                  className="p-1.5 hover:bg-[#1C1C1C] text-[#A3A3A3] hover:text-white rounded-full transition"
                  id="notifications-close-header-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Actions & Summary */}
              {dbNotifications.length > 0 && (
                <div className="flex justify-between items-center mb-3.5 px-1">
                  <span className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-wider">
                    {t("recent_notifications")} ({unreadCount}{" "}
                    {language === "Bengali" ? "টি অপঠিত" : "unread"})
                  </span>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[11px] font-black text-[#FACC15] hover:underline transition-all flex items-center gap-1"
                        id="notifications-mark-read-all-action-btn"
                      >
                        {t("mark_all_read")}
                      </button>
                    )}
                    <button
                      onClick={handleDeleteAllNotifications}
                      className="text-[11px] font-black text-rose-400 hover:text-rose-300 hover:underline transition-all flex items-center gap-1 shrink-0"
                      id="notifications-delete-all-action-btn"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t("clear_all")}
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Scrollable List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar min-h-[220px]">
                {loading ? (
                  <div className="flex flex-col gap-2 py-8 items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-4 border-[#D4A017] border-t-transparent animate-spin"></div>
                  </div>
                ) : dbNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 bg-[#1C1C1C] rounded-full flex items-center justify-center text-[#D4A017]/50 mb-3 border border-dashed border-[#3D3215]">
                      <Bell className="w-5 h-5 opacity-60" />
                    </div>
                    <p className="text-sm font-bold text-[#A3A3A3]">
                      {t("no_new_notifications")}
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                  {dbNotifications.map((notif) => {
                    const createdDate = notif.createdAt
                      ? notif.createdAt.toDate
                        ? notif.createdAt.toDate()
                        : new Date(notif.createdAt)
                      : null;
                    const dateString = createdDate
                      ? createdDate.toLocaleString(
                          language === "Bengali" ? "bn-BD" : "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : "";

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -50, scale: 0.9, transition: { duration: 0.2 } }}
                        layout
                        key={notif.id}
                        onClick={() => {
                          if (!notif.read) {
                            handleMarkAsRead(notif.id);
                          }
                        }}
                        className={`group p-3.5 rounded-2xl border transition-all text-left relative cursor-pointer flex gap-3 ${
                          notif.read
                            ? "bg-[#101010] border-[#3D3215]/50"
                            : "bg-[#1C1C1C] border-[#D4A017]/40 shadow-sm shadow-[#D4A017]/5 hover:border-[#D4A017]"
                        }`}
                        id={`notification-card-item-${notif.id}`}
                      >
                        {/* Status Icon */}
                        <div className="mt-1 shrink-0 relative">
                          <div
                            className={`p-1.5 rounded-xl ${
                              notif.read
                                ? "bg-[#151515] text-[#737373]"
                                : "bg-[#D4A017]/15 text-[#FACC15]"
                            }`}
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </div>
                          {!notif.read && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#FACC15] rounded-full" />
                          )}
                        </div>

                        {/* Title and Body */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h5
                              className={`font-bold text-xs truncate leading-snug ${
                                notif.read
                                  ? "text-[#A3A3A3]"
                                  : "text-white"
                              }`}
                            >
                              {notif.title || "Update"}
                            </h5>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {dateString && (
                                <span className="text-[10px] text-[#737373] font-medium whitespace-nowrap">
                                  {dateString}
                                </span>
                              )}
                              <button
                                onClick={(e) =>
                                  handleDeleteNotification(notif.id, e)
                                }
                                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 hover:bg-rose-950/30 text-[#737373] hover:text-rose-400 rounded-lg transition-all"
                                title="Delete"
                                id={`notification-delete-individual-btn-${notif.id}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-[#A3A3A3] mt-1 leading-relaxed break-words pr-4">
                            {notif.message}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Polish and Upgraded Coming Soon Modal Dialog */}
      <AnimatePresence>
        {comingSoonFeature && (
          <>
            {/* Backdrop with elegant blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setComingSoonFeature(null)}
              className="fixed inset-0 bg-black/80 z-50 backdrop-blur-md"
            />

            {/* Modal Card sheet with gorgeous micro-animations */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="fixed inset-x-4 bottom-8 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:w-full md:max-w-md bg-[#151515] rounded-[32px] p-6 shadow-2xl z-55 border border-[#3D3215] overflow-hidden"
            >
              {/* Decorative premium gold blobs */}
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#D4A017]/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-[#FACC15]/10 rounded-full blur-2xl pointer-events-none"></div>

              {/* Background gradient hint */}
              <div
                className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D4A017] via-[#FACC15] to-[#D4A017]"
              ></div>

              <div className="text-center pt-4">
                <div
                  className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-[#D4A017] to-[#8A6508] text-black flex items-center justify-center mx-auto mb-4 pb-0.5 shadow-xl shadow-[#D4A017]/20 border border-[#FACC15]/40"
                >
                  {comingSoonFeature.icon}
                </div>

                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-[#FACC15] flex items-center justify-center gap-1.5 leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15] animate-ping"></span>
                  SYSTEM NOTICE &bull; জরুরি নোটিশ
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white mt-2.5 mb-3">
                  {comingSoonFeature.title}
                </h3>

                <div className="bg-[#101010] p-4 rounded-2xl border border-[#3D3215] text-[#A3A3A3] text-xs sm:text-sm leading-relaxed font-semibold">
                  {comingSoonFeature.desc}
                </div>

                <div className="h-6"></div>

                <div className="flex flex-col gap-2">
                  {comingSoonFeature.link && (
                    <a
                      href={comingSoonFeature.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-[#D4A017] via-[#FACC15] to-[#D4A017] text-black font-black py-3 px-4 rounded-[18px] text-[11px] uppercase tracking-widest transition-transform hover:scale-[1.01] active:scale-[0.98] shadow-md shadow-[#D4A017]/20 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />{" "}
                      {comingSoonFeature.linkText ||
                        "Go to Link"}
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setComingSoonFeature(null)}
                    className="w-full bg-[#1C1C1C] border border-[#3D3215] text-white font-black py-3 px-4 rounded-[18px] text-[11px] uppercase tracking-widest transition-all hover:bg-[#252525] active:scale-[0.98]"
                  >
                    বন্ধ করুন (Close)
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Secure Platform Banner End */}
      <div className="flex flex-col items-center justify-center gap-1.5 mt-8 mb-24 opacity-60">
        <Shield className="w-5 h-5 text-[#D4A017]" />
        <p className="text-[10px] font-bold text-[#D4A017] uppercase tracking-widest leading-none">
          Registered & Verified System
        </p>
        <p className="text-[9px] font-semibold text-[#A3A3A3] leading-none">
          End-to-End Encrypted
        </p>
      </div>
    </div>
  );
}
