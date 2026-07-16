import { useNavigate } from "react-router-dom";
import {
  Clock, XCircle, User, Bell, Wallet, ListChecks, Target, Users, Send, MoreVertical, Settings, HelpCircle, LogOut, Award, Shield, FileText, Calculator, Megaphone, Trophy, Copy, Check, Link, Eye, EyeOff, Smartphone, BookOpen, Banknote, MonitorPlay, Wifi, Sun, Moon, X, Trash2, Activity, ArrowDownLeft, ArrowUpRight, CheckCircle, MessageCircle, Star, Gift, Download, Coins, Briefcase,
} from "lucide-react";
import { useAuth } from "../components/AuthProvider";
import React, { useState, useEffect } from "react";
import { triggerRealisticConfetti } from "../lib/confetti";
import { useLanguage } from "../components/LanguageProvider";
import { auth, db } from "../lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  writeBatch,
  deleteDoc,
  getDocs,
  getCountFromServer, where,
} from '@/src/lib/mock-firestore';
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
  const {
    profile,
    user,
    loading,
    logOut,
    refreshProfile,
    siteSettings,
    isQuotaExceeded,
  } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [showActivationPopup, setShowActivationPopup] = useState(false);
  const [banner, setBanner] = useState({
    text: "Welcome to HMF Income! Complete tasks and earn money daily.",
    link: "#",
  });
  const [partnerSettings, setPartnerSettings] = useState({ requiredReferrals: 10, dailyBonus: 100, enabled: false });
  
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPwaInstall, setShowPwaInstall] = useState(false);



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
  const [actualReferralsCount, setActualReferralsCount] = useState<number>(profile?.totalReferrals || 0);

  useEffect(() => {
    const uid = user?.uid;
    if (!uid) return;
    const fetchReferralCount = async () => {
      try {
        const { getCountFromServer, query, collection, where } = await import('@/src/lib/mock-firestore');
        const snap = await getCountFromServer(query(collection(db, "users", uid, "referrals")));
        setActualReferralsCount(snap.data().count);
      } catch (error) {
        console.error("Failed to fetch actual referral count:", error);
      }
    };
    fetchReferralCount();
  }, [user?.uid]);

  const [dbNotifications, setDbNotifications] = useState<any[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);


  useEffect(() => {
    if (!auth.currentUser) return;

    // Using cached read for notifications to save quota
    const fetchNotifications = async () => {
      try {
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
        const snapshot = await getCachedQuery(
          q,
          `notifications_${auth.currentUser!.uid}`,
        );
        const items: any[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() });
        });
        setDbNotifications(items);
      } catch (err) {
        console.warn("Error fetching db notifications:", err);
      }
    };

    fetchNotifications();
  }, [auth.currentUser?.uid]);

  const [userTx, setUserTx] = useState<any[]>([]);
  const [userTasks, setUserTasks] = useState<any[]>([]);
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
      } catch(e) {}

      let estimatedPaid = 0;
      let estimatedTasks = 0;

      // 1. Fetch Top Leaders
      try {
        const snapshot = await getDocs(query(collection(db, "users"), limit(100)));
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
            estimatedTasks += currentTasksCount + Number(data.referralCount || 0);

            return {
              id: doc.id,
              fullName: data.fullName || "User",
              photoURL: data.photoURL || null,
              totalIncome,
            };
          } catch (err) {
            console.warn("Skipping malformed user record:", doc.id, err);
            return null;
          }
        }).filter(Boolean) as any[];
        
        fetchedLeaders.sort((a, b) => b.totalIncome - a.totalIncome);
        setTopLeaders(fetchedLeaders.slice(0, 3));
      } catch (err) {
        console.warn("Failed fetching top leaders", err);
      }

      // 2. Fetch Stats
      try {
        const statsDoc = await getDoc(doc(db, "admin", "stats"));
      } catch (err) {
        console.warn("Failed fetching platform stats", err);
      }
    };
    fetchGlobalData();
  }, [auth.currentUser]);


  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchActivity = async () => {
      try {
        // Sub to transactions, last 5 items
        const txRef = collection(
          db,
          "users",
          auth.currentUser!.uid,
          "transactions",
        );
        const txQuery = query(txRef, orderBy("createdAt", "desc"), limit(5));
        const txSnapshot = await getCachedQuery(
          txQuery,
          `dashboard_tx_${auth.currentUser!.uid}`,
        );
        const txItems: any[] = [];
        txSnapshot.forEach((docSnap) => {
          txItems.push({
            id: docSnap.id,
            type: "transaction",
            ...docSnap.data(),
          });
        });
        setUserTx(txItems);

        // Sub to completed tasks, last 5 items
        const tasksRef = collection(
          db,
          "users",
          auth.currentUser!.uid,
          "tasks",
        );
        const tasksQuery = query(
          collection(db, "submissions"),
          where("userId", "==", auth.currentUser!.uid),
          limit(20)
        );
        const taskSnapshot = await getCachedQuery(
          tasksQuery,
          `dashboard_tasks_${auth.currentUser!.uid}`,
        );
        
        // Mock the snapshot behavior to sort locally
        const docs = taskSnapshot.docs;
        docs.sort((a, b) => {
          const aData = a.data();
          const bData = b.data();
          const aTime = aData.submittedAt?.toMillis?.() || 0;
          const bTime = bData.submittedAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
        const limitedDocs = docs.slice(0, 5);
        taskSnapshot.forEach = (cb) => limitedDocs.forEach(cb);
        const taskItems: any[] = [];
        taskSnapshot.forEach((docSnap) => {
          taskItems.push({ id: docSnap.id, type: "task", ...docSnap.data() });
        });
        setUserTasks(taskItems);
      } catch (e) {
        console.warn("Error fetching activity:", e);
      }
    };

    fetchActivity();
  }, [auth.currentUser?.uid]);

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
    ];
    combined.sort((a, b) => b.date.getTime() - a.date.getTime());
    return combined.slice(0, 5);
  };

  const unreadCount = dbNotifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(
        doc(db, "users", auth.currentUser.uid, "notifications", id),
        { read: true },
      );
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
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
    } catch (e) {
      console.error("Failed to mark all as read:", e);
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.currentUser) return;
    try {
      await deleteDoc(
        doc(db, "users", auth.currentUser.uid, "notifications", id),
      );
      toast.success(
        language === "Bengali"
          ? "নোটিফিকেশনটি মুছে ফেলা হয়েছে"
          : "Notification deleted",
      );
    } catch (err) {
      console.error("Failed to delete notification:", err);
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
    if (!window.confirm(confirmMessage)) return;

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
    } catch (err) {
      console.error("Failed to delete all notifications:", err);
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
      const dbRef = doc(db, "users", auth.currentUser.uid);
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
            className="p-1 -ml-1 text-[#0D47A1] dark:text-blue-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition relative z-20"
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
                  className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="fixed inset-y-0 left-0 right-0 mx-auto w-full sm:max-w-[480px] z-[101] pointer-events-none flex">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                    className="h-full w-72 bg-white dark:bg-slate-900 shadow-2xl flex flex-col pointer-events-auto border-r border-slate-100 dark:border-slate-700/50"
                  >
                    <div className="px-5 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-b border-blue-500/30 font-bold tracking-wide flex items-center gap-3">
                      {siteSettings?.logoUrl ? (
                        <img
                          src={siteSettings.logoUrl}
                          alt="Logo"
                          className="w-12 h-12 rounded-xl bg-white object-cover shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="text-base">{t("main_menu")}</p>
                        <p className="text-[10px] text-blue-100 opacity-90 font-medium uppercase tracking-wider mt-0.5">
                          {t("access_all_features")}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3">
                      {/* Current Time inside Menu */}
                      <div className="mb-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/50">
                        <div className="text-center mb-2.5">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">
                            {t("current_time")}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-gradient-to-br from-rose-500 to-red-600 text-white py-1.5 rounded-lg flex flex-col items-center justify-center shadow-lg shadow-rose-900/20">
                            <span className="text-sm font-black leading-none">
                              {timeData.year}
                            </span>
                            <span className="text-[9px] font-bold opacity-90 mt-0.5">
                              {t("year")}
                            </span>
                          </div>
                          <div className="bg-gradient-to-br from-orange-400 to-amber-500 text-white py-1.5 rounded-lg flex flex-col items-center justify-center shadow-lg shadow-orange-900/20">
                            <span className="text-sm font-black leading-none">
                              {timeData.month.toString().padStart(2, "0")}
                            </span>
                            <span className="text-[9px] font-bold opacity-90 mt-0.5">
                              {t("mon")}
                            </span>
                          </div>
                          <div className="bg-gradient-to-br from-emerald-400 to-green-500 text-white py-1.5 rounded-lg flex flex-col items-center justify-center shadow-lg shadow-emerald-900/20">
                            <span className="text-sm font-black leading-none">
                              {timeData.day.toString().padStart(2, "0")}
                            </span>
                            <span className="text-[9px] font-bold opacity-90 mt-0.5">
                              {t("day")}
                            </span>
                          </div>
                          <div className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white py-1.5 rounded-lg flex flex-col items-center justify-center shadow-lg shadow-blue-900/20">
                            <span className="text-sm font-black leading-none">
                              {timeData.hours.toString().padStart(2, "0")}
                            </span>
                            <span className="text-[9px] font-bold opacity-90 mt-0.5">
                              {t("hrs")}
                            </span>
                          </div>
                          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white py-1.5 rounded-lg flex flex-col items-center justify-center shadow-lg shadow-indigo-900/20">
                            <span className="text-sm font-black leading-none">
                              {timeData.minutes.toString().padStart(2, "0")}
                            </span>
                            <span className="text-[9px] font-bold opacity-90 mt-0.5">
                              {t("min")}
                            </span>
                          </div>
                          <div className="bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white py-1.5 rounded-lg flex flex-col items-center justify-center shadow-lg shadow-fuchsia-900/20">
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
                          className="w-full flex items-center gap-3 px-3 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition font-medium group"
                        >
                          <div className="bg-white dark:bg-slate-800 p-2 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/50 shadow-sm border border-slate-200 dark:border-slate-700/50">
                            <User className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                          </div>{" "}
                          {t("my_profile")}
                        </button>
                        <button
                          onClick={() => {
                            navigate("/wallet");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-green-600 dark:hover:text-green-400 rounded-xl transition font-medium group"
                        >
                          <div className="bg-white dark:bg-slate-800 p-2 rounded-xl group-hover:bg-green-50 dark:group-hover:bg-green-900/50 shadow-sm border border-slate-200 dark:border-slate-700/50">
                            <Wallet className="w-4 h-4 text-green-500 dark:text-green-400" />
                          </div>{" "}
                          {t("wallet_history")}
                        </button>
                        <button
                          onClick={() => {
                            navigate("/tasks");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-purple-600 dark:hover:text-purple-400 rounded-xl transition font-medium group"
                        >
                          <div className="bg-white dark:bg-slate-800 p-2 rounded-xl group-hover:bg-purple-50 dark:group-hover:bg-purple-900/50 shadow-sm border border-slate-200 dark:border-slate-700/50">
                            <ListChecks className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>{" "}
                          {t("my_tasks")}
                        </button>
                        <button
                          onClick={() => {
                            navigate("/refer");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-orange-600 dark:hover:text-orange-400 rounded-xl transition font-medium group"
                        >
                          <div className="bg-white dark:bg-slate-800 p-2 rounded-xl group-hover:bg-orange-50 dark:group-hover:bg-orange-900/50 shadow-sm border border-slate-200 dark:border-slate-700/50">
                            <Users className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                          </div>{" "}
                          {t("refer_earn")}
                        </button>
                        <button
                          onClick={() => {
                            navigate("/leaderboard");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition font-medium group"
                        >
                          <div className="bg-white dark:bg-slate-800 p-2 rounded-xl group-hover:bg-rose-50 dark:group-hover:bg-rose-900/50 shadow-sm border border-slate-200 dark:border-slate-700/50">
                            <Target className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                          </div>{" "}
                          {t("leaderboard")}
                        </button>
                        <button
                          onClick={() => {
                            navigate("/rewards");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-xl transition font-medium group"
                        >
                          <div className="bg-white dark:bg-slate-800 p-2 rounded-xl group-hover:bg-yellow-50 dark:group-hover:bg-yellow-900/50 shadow-sm border border-slate-200 dark:border-slate-700/50">
                            <Award className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                          </div>{" "}
                          {t("rewards_badges")}
                        </button>

                        {(profile?.role === "admin" ||
                          profile?.role === "employee" ||
                          auth.currentUser?.email ===
                            "mdekramhossain590@gmail.com") && (
                          <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700/50">
                            <button
                              onClick={() => {
                                navigate("/admin");
                                setMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-3 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition font-medium group"
                            >
                              <div className="bg-indigo-50 dark:bg-indigo-950 p-2 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 shadow-sm border border-indigo-200 dark:border-indigo-800/50">
                                <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              </div>{" "}
                              {t("admin_panel")}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 border-t border-slate-200 dark:border-slate-700/50 pt-3 space-y-1">
                        <button
                          onClick={async () => {
                            if (siteSettings?.apkUrl) {
                              window.open(siteSettings.apkUrl, "_blank");
                            } else if (deferredPrompt) {
                              deferredPrompt.prompt();
                              const { outcome } =
                                await deferredPrompt.userChoice;
                              if (outcome === "accepted") {
                                clearPwaPrompt();
                              }
                            } else {
                              setShowPwaInstall(true); // Always show manual fallback or instructions modal
                            }
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition bg-indigo-50/50 dark:bg-indigo-900/10 mb-2"
                        >
                          <Download className="w-[18px] h-[18px]" />{" "}
                          {t("download_app") || "Download App"}
                        </button>
                        <button
                          onClick={() => {
                            navigate("/settings");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white rounded-xl transition"
                        >
                          <Settings className="w-[18px] h-[18px]" />{" "}
                          {t("settings")}
                        </button>
                        <button
                          onClick={() => {
                            navigate("/support");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white rounded-xl transition"
                        >
                          <MessageCircle className="w-[18px] h-[18px]" />{" "}
                          {t("help_support")}
                        </button>
                        <button
                          onClick={() => {
                            navigate("/faq");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white rounded-xl transition"
                        >
                          <HelpCircle className="w-[18px] h-[18px]" />{" "}
                          {t("faq")}
                        </button>
                        <button
                          onClick={() => {
                            navigate("/privacy");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white rounded-xl transition"
                        >
                          <Shield className="w-[18px] h-[18px]" />{" "}
                          {t("privacy_policy")}
                        </button>
                        <button
                          onClick={() => {
                            navigate("/terms");
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white rounded-xl transition"
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
                        className="w-full mt-4 flex items-center gap-3 px-3 py-3.5 text-sm text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition font-bold border border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950/20"
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
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse shadow-lg border-2 border-transparent"></div>
          ) : profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-white dark:border-slate-800"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-xl shadow-lg border-2 border-white dark:border-slate-800">
              <User className="w-6 h-6" />
            </div>
          )}
          <div>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none">
              {t("welcome_back")}
            </p>
            {loading ? (
              <div className="h-7 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mt-1"></div>
            ) : (
              <h3 className="font-display font-medium text-xl leading-none text-gray-800 dark:text-white mt-1 tracking-tight">
                {profile?.fullName || user?.displayName || "User"}
              </h3>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/30 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-blue-400 shadow-sm hover:scale-105 active:scale-95 transition-transform"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-[#0D47A1]" />
            )}
          </button>

          <button
            onClick={() => {
              playTapSound();
              setShowNotificationCenter(true);
            }}
            className="w-10 h-10 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/30 dark:border-slate-700 flex items-center justify-center text-[#0D47A1] dark:text-blue-400 relative shadow-sm hover:scale-105 active:scale-95 transition-transform"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ff4d8d] text-white font-black text-[9px] min-w-4 h-4 rounded-full flex items-center justify-center px-1 border border-white dark:border-slate-800 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Scrolling Banner */}
      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-slate-800 dark:to-slate-700 rounded-xl py-2.5 px-3 mb-4 flex items-center border border-blue-200 dark:border-slate-600 shadow-sm overflow-hidden">
        <span className="text-[#0D47A1] dark:text-blue-400 mr-2 flex-shrink-0">
          <Megaphone className="w-5 h-5 animate-pulse" />
        </span>
        <div className="flex-1 overflow-hidden relative leading-none flex items-center h-5">
          <div className="animate-marquee whitespace-nowrap absolute">
            <a
              href={banner.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-[#0D47A1] dark:hover:text-blue-400"
            >
              {banner.text}
            </a>
          </div>
        </div>
      </div>

      {/* Top Earners */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Top Earners
          </h3>
          <button
            onClick={() => {
              playTapSound();
              navigate("/leaderboard");
            }}
            className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
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

                let bgColor = "from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/30";
                let borderColor = "border-slate-200 dark:border-slate-700";
                let avatarBg = "bg-slate-50";
                let badgeBg = "bg-slate-300 text-slate-700";
                let amountColor = "text-slate-600 dark:text-slate-400";
                
                if (isFirst) {
                  bgColor = "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10";
                  borderColor = "border-amber-100 dark:border-amber-800/30";
                  avatarBg = "bg-amber-50";
                  badgeBg = "bg-yellow-400 text-yellow-900";
                  amountColor = "text-amber-600 dark:text-amber-400";
                } else if (isSecond) {
                   // defaults to slate/silver
                } else if (isThird) {
                  bgColor = "from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10";
                  borderColor = "border-orange-100 dark:border-orange-800/30";
                  avatarBg = "bg-orange-50";
                  badgeBg = "bg-orange-400 text-orange-900";
                  amountColor = "text-orange-600 dark:text-orange-400";
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
                    {isFirst && <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/10 blur-xl rounded-full"></div>}
                    
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 text-white flex items-center justify-center font-black text-lg shadow-md ring-2 ring-white dark:ring-slate-800 overflow-hidden">
                        {leader.photoURL ? (
                          <img src={leader.photoURL} alt="avatar" className={`w-full h-full object-cover ${avatarBg}`} />
                        ) : (
                          <User className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                        )}
                      </div>
                      <div className={`absolute -top-1 -right-1 ${badgeBg} w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ring-1 ring-white dark:ring-slate-800`}>
                        {index + 1}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate w-full mb-0.5">
                        {leader.fullName}
                      </p>
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none mb-1">
                        Rank #{index + 1}
                      </p>
                    </div>
                    
                    <div className="shrink-0 flex flex-col items-end pl-2 border-l border-white/40 dark:border-slate-600/40">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">
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
              <div className="absolute inset-0 w-full text-center py-4 text-xs font-medium text-slate-400 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 rounded-[20px] border border-dashed border-slate-300 dark:border-slate-700">
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
          className="w-full aspect-[1.58/1] bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#1e1b4b] rounded-2xl sm:rounded-[24px] p-4 sm:p-6 text-white shadow-2xl relative overflow-hidden border border-white/5 group"
        >
          {/* Animated Background Orbs */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 blur-[60px] rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/20 blur-[60px] rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            {/* Card Top */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-black opacity-60 mb-0.5 sm:mb-1">
                  {t("digital_wallet")}
                </p>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-display font-black italic tracking-tighter drop-shadow-sm">
                    HMF <span className="text-blue-400">INCOME</span>
                  </h2>
                  <div className="w-px h-4 sm:h-5 bg-white/20"></div>
                  <span className="text-[8px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 font-mono">
                    Platinum
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
                  <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                </div>
              </div>
            </div>

            {/* Card Middle: Chip & Balance */}
            <div className="mt-2 sm:mt-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="w-8 h-6 sm:w-10 sm:h-8 bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-500 rounded-md mb-2 sm:mb-3 flex flex-col gap-0.5 sm:gap-1 p-1 sm:p-1.5 shadow-inner">
                    <div className="w-full h-px bg-black/10"></div>
                    <div className="w-full h-px bg-black/10"></div>
                    <div className="w-full h-px bg-black/10"></div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <p className="text-[8px] sm:text-[10px] text-white/50 font-bold uppercase tracking-widest">
                      {t("total_balance")}
                    </p>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-1 sm:p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
                    >
                      {showBalance ? (
                        <EyeOff className="w-3 h-3 text-white/60" />
                      ) : (
                        <Eye className="w-3 h-3 text-white/60" />
                      )}
                    </button>
                  </div>
                  {loading ? (
                    <div className="h-8 sm:h-10 w-28 sm:w-40 bg-white/10 rounded-lg animate-pulse mt-1"></div>
                  ) : (
                    <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight text-white mt-1 leading-none">
                      {showBalance
                        ? `৳ ${((profile?.balances?.main || 0) + (profile?.balances?.bonus || 0) + (profile?.balances?.referral || 0) + (profile?.balances?.gift || 0) + Object.values(profile?.balances?.tasks || {}).reduce((a, b) => (a as number) + (b as number), 0)).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "৳ ••••••"}
                    </h1>
                  )}
                </div>

                <button
                  onClick={() => navigate("/wallet?tab=withdraw")}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/30 active:scale-95 transition-all flex items-center gap-1.5 sm:gap-2"
                >
                  <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {t("withdraw")}
                </button>
              </div>
            </div>

            {/* Card Bottom: User & ID */}
            <div className="flex justify-between items-end border-t border-white/10 pt-2 sm:pt-4">
              <div>
                <p className="text-[8px] sm:text-[9px] text-white/40 font-bold mb-0.5 uppercase tracking-widest font-sans">
                  {t("card_holder")}
                </p>
                <p className="text-xs sm:text-[14px] font-bold tracking-wide uppercase truncate max-w-[120px] sm:max-w-[150px] font-display">
                  {profile?.fullName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[8px] sm:text-[9px] text-white/40 font-bold mb-0.5 uppercase tracking-widest font-sans">
                  {t("member_id")}
                </p>
                <p className="text-xs sm:text-[14px] font-mono font-bold tracking-[0.1em]">
                  {profile?.myReferCode || "####"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Partner Program Section */}
      {partnerSettings.enabled && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-3xl p-5 mb-8 text-left relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-black text-indigo-700 dark:text-indigo-400 capitalize">Partner Program</h3>
              <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Get ৳{partnerSettings.dailyBonus} daily by inviting {partnerSettings.requiredReferrals}+ active users</p>
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2.5 rounded-2xl">
              <Coins className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5 px-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Progress</span>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{actualReferralsCount} / {partnerSettings.requiredReferrals}</span>
            </div>
            <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, ((actualReferralsCount) / partnerSettings.requiredReferrals) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          <button
            onClick={async () => {
              if (!auth.currentUser) return;
              if ((actualReferralsCount) < partnerSettings.requiredReferrals) {
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
                const batch = writeBatch(db);
                // import serverTimestamp from firestore:
                const { serverTimestamp, increment } = await import('@/src/lib/mock-firestore');
                
                batch.update(doc(db, "users", auth.currentUser.uid), {
                  "balances.partner": increment(partnerSettings.dailyBonus),
                  partnerClaimedAt: serverTimestamp()
                });
                
                const txRef = doc(collection(db, "users", auth.currentUser.uid, "transactions"));
                batch.set(txRef, {
                  amount: partnerSettings.dailyBonus,
                  type: 'partner_bonus',
                  status: 'completed',
                  createdAt: serverTimestamp(),
                  description: 'Daily Partner Bonus'
                });
                
                await batch.commit();
                setShowCelebration(true);
                toast.success(`৳${partnerSettings.dailyBonus} daily partner bonus claimed!`);
              } catch (err) {
                console.error(err);
                toast.error("Failed to claim bonus.");
              }
            }}
            className="w-full bg-indigo-600 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-xs"
          >
            Claim Daily ৳{partnerSettings.dailyBonus}
          </button>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="bg-white/80 backdrop-blur-xl dark:bg-slate-800/80 p-4 sm:p-5 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 mb-8 select-none">
        <h3 className="text-[13px] font-black text-slate-800 dark:text-slate-200 mb-4 px-2 uppercase tracking-wide flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
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
            className="relative flex items-center gap-3 p-3 sm:p-4 rounded-[24px] border transition-all cursor-pointer group bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-slate-700/80 hover:border-purple-200 dark:hover:border-slate-600"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-[16px] flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <span className="text-[11px] sm:text-[13px] font-bold truncate text-slate-800 dark:text-slate-200">
                Gift Code
              </span>
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
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
                ? "bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 opacity-70 saturate-50"
                : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700/80 hover:border-blue-200 dark:hover:border-slate-600"
            }`}
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-[16px] flex items-center justify-center relative overflow-hidden ${
                siteSettings?.driveOffersEnabled === false
                  ? "bg-slate-200/50 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform"
              }`}
            >
              <Wifi className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <span
                className={`text-[11px] sm:text-[13px] font-bold truncate ${siteSettings?.driveOffersEnabled === false ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-slate-200"}`}
              >
                {t("drive_offer")}
              </span>
              {siteSettings?.driveOffersEnabled === false ? (
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                  OFFLINE
                </span>
              ) : (
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
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
                ? "bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 opacity-70 saturate-50"
                : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700/80 hover:border-emerald-200 dark:hover:border-slate-600"
            }`}
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-[16px] flex items-center justify-center relative overflow-hidden ${
                siteSettings?.rechargeEnabled === false
                  ? "bg-slate-200/50 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  : "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform"
              }`}
            >
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <span
                className={`text-[11px] sm:text-[13px] font-bold truncate ${siteSettings?.rechargeEnabled === false ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-slate-200"}`}
              >
                {t("recharge")}
              </span>
              {siteSettings?.rechargeEnabled === false ? (
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                  OFFLINE
                </span>
              ) : (
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
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
                  color: "from-purple-500 to-indigo-650",
                });
              } else {
                navigate("/courses");
              }
            }}
            className={`relative flex items-center gap-3 p-3 sm:p-4 rounded-[24px] border transition-all cursor-pointer group ${
              siteSettings?.coursesEnabled === false
                ? "bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 opacity-70 saturate-50"
                : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-slate-700/80 hover:border-purple-200 dark:hover:border-slate-600"
            }`}
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-[16px] flex items-center justify-center relative overflow-hidden ${
                siteSettings?.coursesEnabled === false
                  ? "bg-slate-200/50 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  : "bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform"
              }`}
            >
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <span
                className={`text-[11px] sm:text-[13px] font-bold truncate ${siteSettings?.coursesEnabled === false ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-slate-200"}`}
              >
                {t("courses")}
              </span>
              {siteSettings?.coursesEnabled === false ? (
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                  OFFLINE
                </span>
              ) : (
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  LIVE NOW
                </span>
              )}
            </div>
          </motion.div>

          {/* Salary */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playTapSound();
              setComingSoonFeature({
                title: "Monthly Salary",
                desc: 'একটি নির্দিষ্ট সংখ্যক রেফার ও টাস্ক সম্পন্নকারী বিশ্বস্ত ইউজারদের জন্য মাসিক নিয়মিত "ফিক্সড স্যালারি" বা ফিক্সড বেতন ফিচার আসছে! কাজের ধারাবাহিকতা বজায় রাখুন।',
                icon: <Banknote className="w-7 h-7" />,
                color: "from-amber-500 to-orange-600",
              });
            }}
            className="relative flex items-center gap-3 p-3 sm:p-4 rounded-[24px] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 opacity-70 saturate-50 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-[16px] flex items-center justify-center bg-slate-200/50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <Banknote className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <span className="text-[11px] sm:text-[13px] font-bold truncate text-slate-500 dark:text-slate-400">
                {t("salary")}
              </span>
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                OFFLINE
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
                  color: "from-rose-500 to-pink-600",
                  link: siteSettings?.adsViewLink || "",
                  linkText:
                    siteSettings?.adsViewText || "অফিসিয়াল চ্যানেল এ যুক্ত হন",
                });
              }
            }}
            className={`relative flex items-center gap-3 p-3 sm:p-4 rounded-[24px] border transition-all cursor-pointer group ${
              !siteSettings?.adsViewEnabled
                ? "bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 opacity-70 saturate-50"
                : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-slate-700/80 hover:border-rose-200 dark:hover:border-slate-600"
            }`}
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-[16px] flex items-center justify-center relative overflow-hidden ${
                !siteSettings?.adsViewEnabled
                  ? "bg-slate-200/50 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  : "bg-gradient-to-br from-rose-400 to-orange-500 text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform"
              }`}
            >
              <MonitorPlay
                className="w-5 h-5 sm:w-6 sm:h-6"
                strokeWidth={1.5}
              />
            </div>
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <span
                className={`text-[11px] sm:text-[13px] font-bold truncate ${!siteSettings?.adsViewEnabled ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-slate-200"}`}
              >
                {t("ads_view")}
              </span>
              {!siteSettings?.adsViewEnabled ? (
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                  OFFLINE
                </span>
              ) : (
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
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
                ? "bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 opacity-70 saturate-50"
                : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-700/80 hover:border-amber-200 dark:hover:border-slate-600"
            }`}
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-[16px] flex items-center justify-center relative overflow-hidden ${
                siteSettings?.reviewsEnabled === false
                  ? "bg-slate-200/50 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  : "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform"
              }`}
            >
              <Star
                className="w-5 h-5 sm:w-6 sm:h-6 fill-current"
                strokeWidth={1.5}
              />
            </div>
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <span
                className={`text-[11px] sm:text-[13px] font-bold truncate ${siteSettings?.reviewsEnabled === false ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-slate-200"}`}
              >
                Reviews
              </span>
              {siteSettings?.reviewsEnabled === false ? (
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                  OFFLINE
                </span>
              ) : (
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
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
            className="relative flex items-center gap-3 p-3 sm:p-4 rounded-[24px] border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-slate-700/80 hover:border-indigo-200 dark:hover:border-slate-600 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-[16px] flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform relative overflow-hidden">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <span className="text-[11px] sm:text-[13px] font-bold truncate text-slate-800 dark:text-slate-200">
                Post Job
              </span>
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                জব পোস্ট
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05] blur-2xl rounded-full"></div>
        <h3 className="font-display font-medium text-slate-800 dark:text-white mb-3 text-base flex items-center gap-2 relative z-10 tracking-tight">
          <Link className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          {t("share_to_earn")}
        </h3>
        <div className="flex flex-col gap-3 relative z-10">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 transition-colors hover:border-indigo-200 dark:hover:border-indigo-500/30">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap min-w-[50px]">
              {t("code")}:
            </span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 flex-1 truncate">
              {profile?.myReferCode || "Unavailable"}
            </span>
            <button
              onClick={() => handleCopy(profile?.myReferCode || "", "code")}
              className="p-1.5 rounded-md bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
              disabled={!profile?.myReferCode}
            >
              {copiedCode ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 transition-colors hover:border-indigo-200 dark:hover:border-indigo-500/30">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap min-w-[50px]">
              {t("link")}:
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300 flex-1 truncate opacity-90">
              {profile?.myReferCode
                ? `${window.location.origin}/register?ref=${profile.myReferCode}`
                : "Unavailable"}
            </span>
            <button
              onClick={() =>
                handleCopy(
                  `${window.location.origin}/register?ref=${profile?.myReferCode}`,
                  "link",
                )
              }
              className="p-1.5 rounded-md bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors flex-shrink-0"
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
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 shadow-sm cursor-pointer"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center shadow-inner shadow-blue-800/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">
              {t("wallet")}
            </h4>
            <p className="text-[10px] text-gray-500 font-medium truncate">
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
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 shadow-sm cursor-pointer"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center shadow-inner shadow-purple-800/20">
            <ListChecks className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">
              {t("tasks")}
            </h4>
            <p className="text-[10px] text-gray-500 font-medium truncate">
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
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 shadow-sm cursor-pointer"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-inner shadow-amber-800/20">
            <Target className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">
              {t("spin")}
            </h4>
            <p className="text-[10px] text-gray-500 font-medium truncate">
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
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 shadow-sm cursor-pointer"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-white flex items-center justify-center shadow-inner shadow-cyan-800/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">
              {t("math")}
            </h4>
            <p className="text-[10px] text-gray-500 font-medium truncate">
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
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 shadow-sm cursor-pointer"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center shadow-inner shadow-green-800/20">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">
              {t("refer")}
            </h4>
            <p className="text-[10px] text-gray-500 font-medium truncate">
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
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 shadow-sm cursor-pointer"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 text-white flex items-center justify-center shadow-inner shadow-rose-800/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">
              {t("leaderboard")}
            </h4>
            <p className="text-[10px] text-gray-500 font-medium truncate">
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
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 shadow-sm cursor-pointer"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-white flex items-center justify-center shadow-inner shadow-yellow-800/20">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">
              {t("rewards_badges")}
            </h4>
            <p className="text-[10px] text-gray-500 font-medium truncate">
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
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 shadow-sm cursor-pointer"
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center shadow-inner shadow-teal-800/20">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">
              {t("help_support")}
            </h4>
            <p className="text-[10px] text-gray-500 font-medium truncate">
              Get Help
            </p>
          </div>
        </motion.div>
      </div>



      {/* Recent Activity Feed */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05] blur-2xl rounded-full"></div>
        <div className="flex justify-between items-center mb-4 relative z-10">
          <h3 className="font-display font-medium text-slate-800 dark:text-white text-base flex items-center gap-2 tracking-tight">
            <Activity className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            {t("recent_activity")}
          </h3>
          <Link to="/activity" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
            {language === "Bengali" ? "সব দেখুন" : "View All"}
          </Link>
        </div>

        <div className="space-y-3 relative z-10">
          {getCombinedActivity().length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 font-medium">
              <Activity className="w-10 h-10 mx-auto mb-2 opacity-20 text-slate-500" />
              <p className="text-xs">{t("no_recent_activity")}</p>
            </div>
          ) : (
            getCombinedActivity().map((activity) => {
              const isTask = activity.type === "task";
              const isWithdraw = !isTask && activity.type === "withdraw";
              const isDeposit = !isTask && activity.type === "deposit";

              let title = "";
              let rewardStr = "";
              let badgeColor = "";
              let IconComponent = CheckCircle;
              let statusLabel = "";
              let statusColor = "";

              // Fix reward value formatting by falling back
              const displayAmount = parseFloat(
                activity.reward || activity.amount || 0,
              ).toFixed(2);

              if (isTask) {
                title = activity.title || t("completed_task_activity");
                rewardStr = `+৳${displayAmount}`;
                
                const taskStatus = activity.status || 'pending';
                if (taskStatus === 'approved') {
                  badgeColor = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400";
                  IconComponent = CheckCircle;
                  statusLabel = language === "Bengali" ? "অনুমোদিত" : "Approved";
                  statusColor = "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30";
                } else if (taskStatus === 'rejected') {
                  badgeColor = "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400";
                  IconComponent = XCircle;
                  statusLabel = language === "Bengali" ? "বাতিল" : "Rejected";
                  statusColor = "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30";
                  rewardStr = `+৳0`;
                } else {
                  badgeColor = "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400";
                  IconComponent = Clock;
                  statusLabel = language === "Bengali" ? "অপেক্ষমান" : "Pending";
                  statusColor = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30";
                }
              } else {
                // Transaction
                if (isWithdraw) {
                  title =
                    language === "Bengali" ? "টাকা উত্তোলন" : "Withdrawals";
                  rewardStr = `-৳${displayAmount}`;
                  badgeColor =
                    "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400";
                  IconComponent = ArrowUpRight;
                } else if (isDeposit) {
                  title = language === "Bengali" ? "টাকা ডিপোজিট" : "Deposits";
                  rewardStr = `+৳${displayAmount}`;
                  badgeColor =
                    "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400";
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
                    "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400";
                  IconComponent = ArrowDownLeft;
                }

                if (activity.status === "pending") {
                  statusLabel = language === "Bengali" ? "পেন্ডিং" : "Pending";
                  statusColor =
                    "text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30";
                } else if (activity.status === "approved") {
                  statusLabel =
                    language === "Bengali" ? "অনুমোদিত" : "Approved";
                  statusColor =
                    "text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30";
                } else if (activity.status === "rejected") {
                  statusLabel = language === "Bengali" ? "বাতিল" : "Rejected";
                  statusColor =
                    "text-rose-400 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/30";
                } else {
                  statusLabel =
                    language === "Bengali" ? "সম্পন্ন" : "Completed";
                  statusColor =
                    "text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30";
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
                  className="bg-slate-50/70 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/50 flex justify-between items-center transition-all hover:bg-slate-100/70 dark:hover:bg-slate-900/65"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-inner shrink-0 ${badgeColor}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white tracking-tight line-clamp-1">
                        {title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
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
                          ? "text-rose-650 dark:text-rose-450"
                          : "text-emerald-600 dark:text-emerald-400"
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
      <div className="bg-white/80 backdrop-blur-xl dark:bg-slate-800/80 p-5 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 mb-8 select-none">
        <h3 className="text-[13px] font-black text-slate-800 dark:text-slate-200 mb-4 px-2 uppercase tracking-wide flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-500" />
          Trust & Security
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 text-center transition-transform hover:scale-[1.02]">
            <Shield className="w-8 h-8 text-emerald-500 mb-2 drop-shadow-sm" />
            <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
              Secure Platform
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight font-medium">
              Your data and earnings are fully protected.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30 text-center transition-transform hover:scale-[1.02]">
            <Award className="w-8 h-8 text-blue-500 mb-2 drop-shadow-sm" />
            <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
              Verified Payouts
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight font-medium">
              Thousands of users are getting paid securely.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800/30 text-center transition-transform hover:scale-[1.02]">
            <CheckCircle className="w-8 h-8 text-purple-500 mb-2 drop-shadow-sm" />
            <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
              Trusted Tasks
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight font-medium">
              All jobs are verified by our team.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-800/30 text-center transition-transform hover:scale-[1.02]">
            <MessageCircle className="w-8 h-8 text-rose-500 mb-2 drop-shadow-sm" />
            <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
              24/7 Support
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight font-medium">
              Our team is always ready to assist you.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap justify-center gap-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          <button
            onClick={() => navigate("/terms")}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Terms of Service
          </button>
          <span className="opacity-30">•</span>
          <button
            onClick={() => navigate("/privacy")}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Privacy Policy
          </button>
          <span className="opacity-30">•</span>
          <button
            onClick={() => navigate("/faq")}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              id="notifications-overlay-backdrop"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 relative z-10 flex flex-col max-h-[80vh] overflow-hidden"
              id="notifications-modal-container"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950 rounded-lg text-indigo-500 shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-base">
                    {t("notification_center")}
                  </h4>
                </div>
                <button
                  onClick={() => setShowNotificationCenter(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-full transition"
                  id="notifications-close-header-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Actions & Summary */}
              {dbNotifications.length > 0 && (
                <div className="flex justify-between items-center mb-3.5 px-1">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {t("recent_notifications")} ({unreadCount}{" "}
                    {language === "Bengali" ? "টি অপঠিত" : "unread"})
                  </span>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[11px] font-black text-[#0D47A1] dark:text-blue-400 hover:underline transition-all flex items-center gap-1"
                        id="notifications-mark-read-all-action-btn"
                      >
                        {t("mark_all_read")}
                      </button>
                    )}
                    <button
                      onClick={handleDeleteAllNotifications}
                      className="text-[11px] font-black text-rose-500 hover:text-rose-600 hover:underline transition-all flex items-center gap-1 shrink-0"
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
                    <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                  </div>
                ) : dbNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-3 border border-dashed border-slate-200 dark:border-slate-700">
                      <Bell className="w-5 h-5 opacity-60" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      {t("no_new_notifications")}
                    </p>
                  </div>
                ) : (
                  dbNotifications.map((notif) => {
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
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (!notif.read) {
                            handleMarkAsRead(notif.id);
                          }
                        }}
                        className={`group p-3.5 rounded-2xl border transition-all text-left relative cursor-pointer flex gap-3 ${
                          notif.read
                            ? "bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/50"
                            : "bg-indigo-50/15 dark:bg-indigo-950/10 border-indigo-500/20 shadow-sm shadow-indigo-500/5 hover:border-indigo-500/40"
                        }`}
                        id={`notification-card-item-${notif.id}`}
                      >
                        {/* Status Icon */}
                        <div className="mt-1 shrink-0 relative">
                          <div
                            className={`p-1.5 rounded-xl ${
                              notif.read
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                                : "bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-500 dark:text-indigo-400"
                            }`}
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </div>
                          {!notif.read && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-600 rounded-full" />
                          )}
                        </div>

                        {/* Title and Body */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h5
                              className={`font-bold text-xs truncate leading-snug ${
                                notif.read
                                  ? "text-slate-600 dark:text-slate-300"
                                  : "text-slate-805 dark:text-white"
                              }`}
                            >
                              {notif.title || "Update"}
                            </h5>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {dateString && (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                                  {dateString}
                                </span>
                              )}
                              <button
                                onClick={(e) =>
                                  handleDeleteNotification(notif.id, e)
                                }
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                                title="Delete"
                                id={`notification-delete-individual-btn-${notif.id}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-words pr-4">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    );
                  })
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
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-md"
            />

            {/* Modal Card sheet with gorgeous micro-animations */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="fixed inset-x-4 bottom-8 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:w-full md:max-w-md bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-2xl z-55 border border-slate-100 dark:border-slate-800 overflow-hidden"
            >
              {/* Decorative premium glass blobs */}
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

              {/* Background gradient hint */}
              <div
                className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${comingSoonFeature.color}`}
              ></div>

              <div className="text-center pt-4">
                <div
                  className={`w-16 h-16 rounded-[24px] bg-gradient-to-br ${comingSoonFeature.color} text-white flex items-center justify-center mx-auto mb-4 pb-0.5 shadow-xl shadow-indigo-500/10`}
                >
                  {comingSoonFeature.icon}
                </div>

                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1.5 leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  SYSTEM NOTICE &bull; জরুরি নোটিশ
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-black tracking-tight text-slate-900 dark:text-white mt-2.5 mb-3">
                  {comingSoonFeature.title}
                </h3>

                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-semibold">
                  {comingSoonFeature.desc}
                </div>

                <div className="h-6"></div>

                <div className="flex flex-col gap-2">
                  {(comingSoonFeature.link || siteSettings?.telegramUrl) && (
                    <a
                      href={
                        comingSoonFeature.link ||
                        siteSettings?.telegramUrl ||
                        "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-black py-3 px-4 rounded-[18px] text-[11px] uppercase tracking-widest transition-transform hover:scale-[1.01] active:scale-[0.98] shadow-md shadow-blue-500/10 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />{" "}
                      {comingSoonFeature.linkText ||
                        "অফিসিয়াল চ্যানেল এ যুক্ত হন"}
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setComingSoonFeature(null)}
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 font-black py-3 px-4 rounded-[18px] text-[11px] uppercase tracking-widest transition-all hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98]"
                  >
                    বন্ধ করুন (Close)
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PWA Install Modal */}
      <AnimatePresence>
        {showPwaInstall && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center sm:p-4"
              onClick={() => {
                setShowPwaInstall(false);
                localStorage.setItem("pwa_prompt_dismissed", "true");
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-[80px] sm:bottom-auto w-full sm:w-[400px] z-[101] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700/50 mx-4"
              style={{ width: "calc(100% - 32px)" }}
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6 relative">
                  <button
                    onClick={() => {
                      setShowPwaInstall(false);
                      localStorage.setItem("pwa_prompt_dismissed", "true");
                    }}
                    className="absolute top-0 right-0 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800">
                    {siteSettings?.logoUrl ? (
                      <img
                        src={siteSettings.logoUrl}
                        alt="Logo"
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <Download className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                      Install App
                    </h3>
                    {siteSettings?.apkUrl ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-tight mt-1">
                        Download the official HMF Income Android app directly to
                        your device.
                      </p>
                    ) : deferredPrompt ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-tight mt-1">
                        Get an optimized experience by adding HMF Income to your
                        home screen.
                      </p>
                    ) : (
                      <div className="text-sm text-slate-500 dark:text-slate-400 leading-tight mt-1">
                        <p className="mb-2">
                          To install this app on your device manually:
                        </p>
                        <ol className="list-decimal pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                          <li>
                            Tap the browser's <b>Menu</b> or <b>Share</b>{" "}
                            button.
                          </li>
                          <li>
                            Select <b>"Add to Home screen"</b>.
                          </li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPwaInstall(false);
                      localStorage.setItem("pwa_prompt_dismissed", "true");
                    }}
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition"
                  >
                    {siteSettings?.apkUrl
                      ? "Not Now"
                      : deferredPrompt
                        ? "Not Now"
                        : "Close"}
                  </button>
                  {siteSettings?.apkUrl ? (
                    <button
                      onClick={() => {
                        window.open(siteSettings.apkUrl, "_blank");
                        setShowPwaInstall(false);
                      }}
                      className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" /> Download
                    </button>
                  ) : deferredPrompt ? (
                    <button
                      onClick={async () => {
                        if (deferredPrompt) {
                          deferredPrompt.prompt();
                          const { outcome } = await deferredPrompt.userChoice;
                          if (outcome === "accepted") {
                            clearPwaPrompt();
                          }
                        }
                        setShowPwaInstall(false);
                      }}
                      className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition"
                    >
                      Install Now
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowPwaInstall(false);
                      }}
                      className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2"
                    >
                      Got It
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Secure Platform Banner End */}
      <div className="flex flex-col items-center justify-center gap-1.5 mt-8 mb-24 opacity-60">
        <Shield className="w-5 h-5 text-slate-400" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
          Registered & Verified System
        </p>
        <p className="text-[9px] font-semibold text-slate-400 leading-none">
          End-to-End Encrypted
        </p>
      </div>
    </div>
  );
}
