import { useState, useEffect } from 'react';
import { History, List, Star, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { getCachedQuery } from '../lib/cache';
import { useLanguage } from '../components/LanguageProvider';
import { motion, AnimatePresence } from 'motion/react';

export function Reviews() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'jobs' | 'history'>('jobs');
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [jobs, setJobs] = useState<any[]>([]);
  const { t } = useLanguage();
  const { siteSettings } = useAuth();

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const loadData = async () => {
      try {
        const q = query(
          collection(db, "users", auth.currentUser!.uid, "tasks"),
          orderBy("completedAt", "desc"),
          limit(100)
        );
        const taskSnap = await getCachedQuery(q, `reviews_history_${auth.currentUser!.uid}`);
        const history = taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)).filter((item: any) => item.type === 'Review');
        setTaskHistory(history);
        
        const jobsQuery = query(collection(db, "jobs"), orderBy("createdAt", "desc"), limit(50));
        const jobsSnap = await getCachedQuery(jobsQuery, "jobs_review_list");
        const fetchedJobs = jobsSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((j: any) => j.status === 'active' && j.type === 'Review');
        setJobs(fetchedJobs);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'reviews');
      }
    };
    loadData();
  }, []);

  const startTask = (jobId: string) => {
    navigate(`/tasks/${jobId}`);
  };

  const filteredHistory = taskHistory.filter((item) => {
    if (!filterStartDate && !filterEndDate) return true;
    if (!item.completedAt) return false;
    
    const itemDate = item.completedAt.toDate();
    
    if (filterStartDate) {
      const start = new Date(filterStartDate);
      start.setHours(0, 0, 0, 0);
      if (itemDate < start) return false;
    }
    
    if (filterEndDate) {
      const end = new Date(filterEndDate);
      end.setHours(23, 59, 59, 999);
      if (itemDate > end) return false;
    }
    
    return true;
  });

  if (siteSettings?.reviewsEnabled === false) {
    return (
      <div className="pt-10 px-4 pb-20 max-w-md mx-auto text-center font-sans">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50 flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-500 mb-4 ring-1 ring-amber-100 dark:ring-amber-900/30 font-sans">
            <Star className="w-8 h-8 opacity-75 animate-bounce" />
          </div>
          <h2 className="text-xl font-display font-black mb-2 tracking-tight text-slate-800 dark:text-white">রিভিউ জবস বন্ধ আছে</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-6">
            দুঃখিত! এডমিন আপাতত রিভিউ জব অপশনটি বন্ধ রেখেছেন। অনুগ্রহ করে পরবর্তীতে আবার চেষ্টা করুন।
          </p>
          <button 
            type="button"
            onClick={() => navigate('/')}
            className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-2xl text-xs transition duration-200 uppercase tracking-widest active:scale-95 cursor-pointer"
          >
            Dashboard এ ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 px-4 pb-20">
      <h2 className="text-2xl font-display font-black mb-4 tracking-tight text-slate-800 dark:text-white text-center">My Reviews</h2>

      {/* Trust Banner Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-[20px] p-3 mb-6 flex items-center justify-center gap-2 cursor-default">
        <Shield className="w-4 h-4 text-blue-500" />
        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Verified Authentic Reviews</span>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl mb-6 ring-1 ring-slate-200 dark:ring-slate-800">
        <button 
          onClick={() => setActiveTab('jobs')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${activeTab === 'jobs' ? 'bg-white shadow-sm text-indigo-600 dark:bg-slate-800 dark:text-indigo-400' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <List className="w-4 h-4" /> Available Reviews
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${activeTab === 'history' ? 'bg-white shadow-sm text-indigo-600 dark:bg-slate-800 dark:text-indigo-400' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <History className="w-4 h-4" /> History
        </button>
      </div>

      <AnimatePresence mode="wait">
      {activeTab === 'jobs' && (
        <motion.div 
          key="jobs-tab"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {jobs.length === 0 ? (
              <div className="col-span-full text-center py-10 text-slate-400 dark:text-slate-500 font-medium">No review tasks available right now.</div>
            ) : (
              jobs.map((job) => {
                return (
                  <div key={job.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm hover:shadow-md ring-1 ring-slate-100 dark:ring-slate-700/50 flex flex-col items-center text-center transition-all">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-700/50 flex items-center justify-center mb-3 text-indigo-500">
                      <Star className="w-6 h-6" />
                    </div>
                    <h4 className="font-display font-bold text-[12px] leading-tight mb-1 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 w-full truncate">
                      <span className="truncate">{job.title}</span>
                    </h4>
                    <span className="text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-black tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full mb-3 border border-emerald-100 dark:border-emerald-800/50">৳ {job.reward}</span>
                    <button 
                      onClick={() => startTask(job.id)}
                      className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                    >
                      {t('start')}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'history' && (
        <motion.div 
          key="history-tab"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {/* Date Filter */}
          <div className="flex gap-3 mb-6 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
            <div className="flex-1">
              <label className="block text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1 ml-1">Start Date</label>
              <input 
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl p-2.5 text-slate-800 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                max={filterEndDate || undefined}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1 ml-1">End Date</label>
              <input 
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl p-2.5 text-slate-800 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                min={filterStartDate || undefined}
              />
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">{taskHistory.length > 0 ? 'No reviews found in this date range.' : 'No review history yet.'}</p>
            </div>
          ) : (
            <motion.div 
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {filteredHistory.map((historyItem) => (
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 }
                  }}
                  key={historyItem.id} 
                  className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center rounded-full">
                      <Star className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-display font-bold text-gray-800 dark:text-white">{historyItem.title}</h4>
                      <p className="text-xs text-gray-500">{historyItem.completedAt?.toDate().toLocaleString() || 'Just now'}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center justify-end">
                    <p className="text-[9px] font-display font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800/50 mt-1">৳ {historyItem.reward || 0}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
