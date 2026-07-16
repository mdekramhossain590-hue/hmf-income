import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from '@/src/lib/mock-firestore';
import { db, auth } from '../lib/firebase';
import { getCachedQuery } from '../lib/cache';
import { Activity, CheckCircle, Clock, XCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useLanguage } from '../components/LanguageProvider';
import { motion } from 'motion/react';

export function ActivityHistory() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchAllActivity = async () => {
      try {
        // Fetch transactions
        const txRef = collection(db, "users", auth.currentUser!.uid, "transactions");
        const txQuery = query(txRef, orderBy("createdAt", "desc"), limit(100));
        const txSnapshot = await getCachedQuery(txQuery, `activity_tx_${auth.currentUser!.uid}`);
        
        const txItems: any[] = [];
        txSnapshot.forEach((docSnap) => {
          txItems.push({
            id: docSnap.id,
            type: "transaction",
            ...docSnap.data(),
          });
        });

        // Fetch submissions
        const subQuery = query(
          collection(db, "submissions"),
          where("userId", "==", auth.currentUser!.uid),
          limit(100)
        );
        const subSnapshot = await getCachedQuery(subQuery, `activity_sub_${auth.currentUser!.uid}`);
        
        const subItems: any[] = [];
        subSnapshot.docs.forEach((docSnap) => {
          subItems.push({
            id: docSnap.id,
            type: "task",
            ...docSnap.data(),
          });
        });

        const combined = [
          ...txItems.map((t) => {
            const d = t.createdAt?.toDate ? t.createdAt.toDate() : t.createdAt ? new Date(t.createdAt) : new Date(0);
            return { ...t, date: d, _originalType: t.type };
          }),
          ...subItems.map((t) => {
            const timeField = t.submittedAt || t.completedAt;
            const d = timeField?.toDate ? timeField.toDate() : timeField ? new Date(timeField) : new Date(0);
            return { ...t, date: d, _originalType: t.type };
          }),
        ];

        combined.sort((a, b) => b.date.getTime() - a.date.getTime());
        setActivities(combined.slice(0, 100));
      } catch (e) {
        console.warn("Error fetching all activity:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAllActivity();
  }, [auth.currentUser?.uid]);

  return (
    <div className="pt-6 px-4 pb-24 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center rounded-2xl">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-display font-black text-slate-800 dark:text-white tracking-tight">
            Activity History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Your recent tasks and transactions
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-500">Loading history...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-100 dark:border-slate-700/50 shadow-sm">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-20 text-slate-500 dark:text-slate-400" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No activity found.</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const isTask = activity.type === "task";
            const isWithdraw = !isTask && activity._originalType === "withdraw";
            const isDeposit = !isTask && activity._originalType === "deposit";

            let title = "";
            let rewardStr = "";
            let badgeColor = "";
            let IconComponent = CheckCircle;
            let statusLabel = "";
            let statusColor = "";

            const displayAmount = parseFloat(activity.reward || activity.amount || 0).toFixed(2);

            if (isTask) {
              title = activity.title || t("completed_task_activity") || "Completed Task";
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
              if (isWithdraw) {
                title = language === "Bengali" ? "টাকা উত্তোলন" : "Withdrawal";
                rewardStr = `-৳${displayAmount}`;
                
                const wStatus = activity.status || 'pending';
                if (wStatus === 'approved') {
                  badgeColor = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400";
                  IconComponent = ArrowUpCircle;
                  statusLabel = language === "Bengali" ? "সম্পন্ন" : "Completed";
                  statusColor = "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30";
                } else if (wStatus === 'rejected') {
                  badgeColor = "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400";
                  IconComponent = XCircle;
                  statusLabel = language === "Bengali" ? "বাতিল" : "Rejected";
                  statusColor = "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30";
                } else {
                  badgeColor = "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400";
                  IconComponent = Clock;
                  statusLabel = language === "Bengali" ? "অপেক্ষমান" : "Pending";
                  statusColor = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30";
                }
              } else if (isDeposit) {
                title = language === "Bengali" ? "টাকা জমা" : "Deposit";
                rewardStr = `+৳${displayAmount}`;
                
                const dStatus = activity.status || 'approved';
                if (dStatus === 'approved') {
                  badgeColor = "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400";
                  IconComponent = ArrowDownCircle;
                  statusLabel = language === "Bengali" ? "সম্পন্ন" : "Completed";
                  statusColor = "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30";
                } else if (dStatus === 'rejected') {
                  badgeColor = "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400";
                  IconComponent = XCircle;
                  statusLabel = language === "Bengali" ? "বাতিল" : "Rejected";
                  statusColor = "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30";
                } else {
                  badgeColor = "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400";
                  IconComponent = Clock;
                  statusLabel = language === "Bengali" ? "অপেক্ষমান" : "Pending";
                  statusColor = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30";
                }
              } else {
                title = activity.description || "Transaction";
                rewardStr = `৳${displayAmount}`;
                badgeColor = "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
                IconComponent = CheckCircle;
                statusLabel = language === "Bengali" ? "সম্পন্ন" : "Completed";
                statusColor = "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800";
              }
            }

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                key={`${activity.id}-${index}`}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-4 flex items-center justify-between gap-3 group hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 ${badgeColor}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[14px] font-bold text-slate-800 dark:text-white truncate">
                      {title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
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
                  <span className={`text-[15px] font-black ${isWithdraw ? 'text-slate-700 dark:text-slate-300' : 'text-emerald-600 dark:text-emerald-400'}`}>
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
