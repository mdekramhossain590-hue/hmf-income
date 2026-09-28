import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where, writeBatch } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { getCachedQuery } from '../lib/cache';
import { Activity, CheckCircle, Clock, XCircle, ArrowDownCircle, ArrowUpCircle, Trash2 } from 'lucide-react';
import { useLanguage } from '../components/LanguageProvider';
import { useAuth } from '../components/AuthProvider';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export function ActivityHistory() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const { t, language } = useLanguage();
  const { profile } = useAuth();

  const handleClearHistory = async () => {
    if (!auth.currentUser) return;
    const confirm = window.confirm("আপনি কি সমস্ত সাম্প্রতিক লেনদেন ও কাজের হিস্ট্রি মুছতে চান?");
    if (!confirm) return;
    try {
      setIsClearing(true);
      toast.loading("হিস্ট্রি মোছা হচ্ছে...", { id: "clear_act_history" });
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

      setActivities([]);
      toast.success("অ্যাক্টিভিটি হিস্ট্রি সফলভাবে খালি করা হয়েছে!", { id: "clear_act_history" });
    } catch (e: any) {
      toast.error("হিস্ট্রি মুছতে ত্রুটি: " + (e?.message || "Unknown error"), { id: "clear_act_history" });
    } finally {
      setIsClearing(false);
    }
  };

  const getRefBonus = (ref: any) => {
    let raw = ref.bonusEarned !== undefined ? Number(ref.bonusEarned) : 0;
    if (raw > 0) {
       return raw;
    }
    if (ref.level === 3) return 0;
    if (ref.level === 2) return 3;
    return 5;
  };

  useEffect(() => {
    if (!auth.currentUser) return;
    
    import('firebase/firestore').then(({ onSnapshot }) => {
      let txList: any[] = [];
      let subList: any[] = [];
      let refList: any[] = [];

      const updateCombined = () => {
        const combined = [
          ...txList.map((t) => {
            const d = t.createdAt?.toDate ? t.createdAt.toDate() : t.createdAt ? new Date(t.createdAt) : new Date(0);
            return { ...t, date: d, _originalType: t.type || 'transaction' };
          }),
          ...subList.map((t) => {
            const timeField = t.submittedAt || t.completedAt;
            const d = timeField?.toDate ? timeField.toDate() : timeField ? new Date(timeField) : new Date(0);
            return { ...t, date: d, _originalType: t.type || 'task' };
          }),
          ...refList.map((t) => {
            const d = t.createdAt?.toDate ? t.createdAt.toDate() : t.createdAt ? new Date(t.createdAt) : new Date(0);
            return { ...t, date: d, _originalType: 'referral' };
          }),
        ];

        combined.sort((a, b) => b.date.getTime() - a.date.getTime());
        setActivities(combined.slice(0, 100));
        setLoading(false);
      };

      const unsubTx = onSnapshot(query(collection(db, "users", auth.currentUser!.uid, "transactions"), orderBy("createdAt", "desc"), limit(100)), (snap) => {
        txList = snap.docs.map(d => ({ id: d.id, type: "transaction", ...d.data() }));
        updateCombined();
      });

      const unsubSub = onSnapshot(query(collection(db, "submissions"), where("userId", "==", auth.currentUser!.uid), limit(100)), (snap) => {
        subList = snap.docs.map(d => ({ id: d.id, type: "task", ...d.data() }));
        updateCombined();
      });

      const unsubRef = onSnapshot(query(collection(db, "users", auth.currentUser!.uid, "referrals"), orderBy("createdAt", "desc"), limit(100)), (snap) => {
        refList = snap.docs.map(d => ({ id: d.id, type: "referral", ...d.data() }));
        updateCombined();
      });

      return () => {
        unsubTx();
        unsubSub();
        unsubRef();
      };
    });
  }, [auth.currentUser?.uid]);

  return (
    <div className="pt-6 px-4 pb-24 max-w-lg mx-auto bg-[#090909] min-h-screen text-white">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1C1C1C] border border-[#3D3215] text-[#FACC15] flex items-center justify-center rounded-2xl shadow-inner">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-white tracking-tight">
              Activity History
            </h2>
            <p className="text-xs text-[#A3A3A3] font-medium mt-0.5">
              Your recent tasks and transactions
            </p>
          </div>
        </div>
        {profile?.role === "admin" && activities.length > 0 && (
          <button
            onClick={handleClearHistory}
            disabled={isClearing}
            className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 bg-rose-950/40 hover:bg-rose-900/40 px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-rose-800/40"
            title="সমস্ত অ্যাক্টিভিটি হিস্ট্রি খালি করুন"
          >
            <Trash2 className="w-3.5 h-3.5" /> হিস্ট্রি মুছুন
          </button>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-[#3D3215] border-t-[#FACC15] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-[#A3A3A3]">Loading history...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 bg-[#151515] rounded-[24px] border border-[#3D3215] shadow-sm">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-20 text-[#737373]" />
            <p className="text-sm font-medium text-[#A3A3A3]">No activity found.</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const isTask = activity.type === "task";
            const isReferral = activity.type === "referral";
            const isWithdraw = !isTask && !isReferral && activity._originalType === "withdraw";
            const isDeposit = !isTask && !isReferral && activity._originalType === "deposit";

            let title = "";
            let rewardStr = "";
            let badgeColor = "";
            let IconComponent = CheckCircle;
            let statusLabel = "";
            let statusColor = "";

            let displayAmount = parseFloat(activity.reward || activity.amount || activity.bonusEarned || 0).toFixed(2);
            if (isReferral) {
                displayAmount = getRefBonus(activity).toFixed(2);
            }

            if (isReferral) {
                title = (language === "Bengali" ? "রেফারেল: " : "Referral: ") + (activity.referredName || activity.referredEmail?.split("@")[0] || "User");
                rewardStr = `+৳${displayAmount}`;
                badgeColor = "bg-[#1C1C1C] text-[#FACC15] border border-[#3D3215]";
                IconComponent = CheckCircle;
                statusLabel = language === "Bengali" ? "সম্পন্ন" : "Completed";
                statusColor = "text-[#FACC15] bg-[#3D3215]/50 border border-[#D4A017]/30";
            } else if (isTask) {
              title = activity.title || t("completed_task_activity") || "Completed Task";
              rewardStr = `+৳${displayAmount}`;
              
              const taskStatus = activity.status || 'pending';
              if (taskStatus === 'approved') {
                badgeColor = "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40";
                IconComponent = CheckCircle;
                statusLabel = language === "Bengali" ? "অনুমোদিত" : "Approved";
                statusColor = "text-emerald-400 bg-emerald-950/40 border border-emerald-800/30";
              } else if (taskStatus === 'rejected') {
                badgeColor = "bg-red-950/40 text-red-400 border border-red-800/40";
                IconComponent = XCircle;
                statusLabel = language === "Bengali" ? "বাতিল" : "Rejected";
                statusColor = "text-red-400 bg-red-950/40 border border-red-800/30";
                rewardStr = `+৳0`;
              } else {
                badgeColor = "bg-[#3D3215]/30 text-[#FFE082] border border-[#3D3215]";
                IconComponent = Clock;
                statusLabel = language === "Bengali" ? "অপেক্ষমান" : "Pending";
                statusColor = "text-[#FFE082] bg-[#3D3215]/40 border border-[#D4A017]/20";
              }
            } else {
              if (activity._originalType === 'partner_bonus') {
                title = language === "Bengali" ? "পার্টনার বোনাস" : "Partner Bonus";
                rewardStr = `+৳${displayAmount}`;
                badgeColor = "bg-[#1C1C1C] text-[#FACC15] border border-[#3D3215]";
                IconComponent = CheckCircle;
                statusLabel = language === "Bengali" ? "সম্পন্ন" : "Completed";
                statusColor = "text-[#FACC15] bg-[#3D3215]/40 border border-[#D4A017]/30";
              } else if (activity._originalType === 'activation') {
                title = language === "Bengali" ? "অ্যাকাউন্ট অ্যাক্টিভেশন" : "Account Activation";
                rewardStr = `-৳${displayAmount}`;
                badgeColor = "bg-rose-950/40 text-rose-400 border border-rose-800/40";
                IconComponent = CheckCircle;
                const aStatus = activity.status || 'completed';
                if (aStatus === 'pending') {
                  statusLabel = language === "Bengali" ? "অপেক্ষমান" : "Pending";
                  statusColor = "text-amber-400 bg-amber-950/40 border border-amber-800/30";
                } else if (aStatus === 'rejected') {
                  statusLabel = language === "Bengali" ? "বাতিল" : "Rejected";
                  statusColor = "text-rose-400 bg-rose-950/40 border border-rose-800/30";
                } else {
                  statusLabel = language === "Bengali" ? "সম্পন্ন" : "Completed";
                  statusColor = "text-rose-400 bg-rose-950/40 border border-rose-800/30";
                }
              } else if (activity._originalType === 'gift_claim') {
                title = language === "Bengali" ? "গিফট কোড ক্লেইম" : "Gift Code Claim";
                rewardStr = `+৳${displayAmount}`;
                badgeColor = "bg-[#1C1C1C] text-[#FACC15] border border-[#3D3215]";
                IconComponent = CheckCircle;
                statusLabel = language === "Bengali" ? "সম্পন্ন" : "Completed";
                statusColor = "text-[#FACC15] bg-[#3D3215]/40 border border-[#D4A017]/30";
              } else if (isWithdraw) {
                title = language === "Bengali" ? "টাকা উত্তোলন" : "Withdrawal";
                rewardStr = `-৳${displayAmount}`;
                
                const wStatus = activity.status || 'pending';
                if (wStatus === 'approved') {
                  badgeColor = "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40";
                  IconComponent = ArrowUpCircle;
                  statusLabel = language === "Bengali" ? "সম্পন্ন" : "Completed";
                  statusColor = "text-emerald-400 bg-emerald-950/40 border border-emerald-800/30";
                } else if (wStatus === 'rejected') {
                  badgeColor = "bg-red-950/40 text-red-400 border border-red-800/40";
                  IconComponent = XCircle;
                  statusLabel = language === "Bengali" ? "বাতিল" : "Rejected";
                  statusColor = "text-red-400 bg-red-950/40 border border-red-800/30";
                } else {
                  badgeColor = "bg-[#3D3215]/30 text-[#FFE082] border border-[#3D3215]";
                  IconComponent = Clock;
                  statusLabel = language === "Bengali" ? "অপেক্ষমান" : "Pending";
                  statusColor = "text-[#FFE082] bg-[#3D3215]/40 border border-[#D4A017]/20";
                }
              } else if (isDeposit) {
                title = language === "Bengali" ? "টাকা জমা" : "Deposit";
                rewardStr = `+৳${displayAmount}`;
                
                const dStatus = activity.status || 'approved';
                if (dStatus === 'approved') {
                  badgeColor = "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40";
                  IconComponent = ArrowDownCircle;
                  statusLabel = language === "Bengali" ? "সম্পন্ন" : "Completed";
                  statusColor = "text-emerald-400 bg-emerald-950/40 border border-emerald-800/30";
                } else if (dStatus === 'rejected') {
                  badgeColor = "bg-red-950/40 text-red-400 border border-red-800/40";
                  IconComponent = XCircle;
                  statusLabel = language === "Bengali" ? "বাতিল" : "Rejected";
                  statusColor = "text-red-400 bg-red-950/40 border border-red-800/30";
                } else {
                  badgeColor = "bg-[#3D3215]/30 text-[#FFE082] border border-[#3D3215]";
                  IconComponent = Clock;
                  statusLabel = language === "Bengali" ? "অপেক্ষমান" : "Pending";
                  statusColor = "text-[#FFE082] bg-[#3D3215]/40 border border-[#D4A017]/20";
                }
              } else {
                title = activity.description || "Transaction";
                rewardStr = `৳${displayAmount}`;
                badgeColor = "bg-[#1C1C1C] text-[#A3A3A3] border border-[#3D3215]";
                IconComponent = CheckCircle;
                statusLabel = language === "Bengali" ? "সম্পন্ন" : "Completed";
                statusColor = "text-[#A3A3A3] bg-[#151515] border border-[#3D3215]";
              }
            }

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                key={`${activity.id}-${index}`}
                className="bg-[#151515] rounded-2xl shadow-sm border border-[#3D3215] p-4 flex items-center justify-between gap-3 group hover:border-[#D4A017]/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 ${badgeColor}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[14px] font-bold text-white truncate">
                      {title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-medium text-[#A3A3A3]">
                        {activity.date.toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className={`text-[15px] font-black ${isWithdraw ? 'text-rose-400' : 'text-[#FACC15]'}`}>
                    {rewardStr}
                  </span>
                  <span className={`text-[9px] mt-1 px-1.5 py-0.5 rounded font-black uppercase tracking-widest ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
