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
        
        const jobsQuery = query(collection(db, "jobs"), orderBy("createdAt", "desc"), limit(500));
        const jobsSnap = await getCachedQuery(jobsQuery, "jobs_review_list");
        const fetchedJobs = jobsSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((j: any) => j.status === 'active' && j.type === 'Review');
        setJobs(fetchedJobs);
      } catch (error: any) {
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
      <div className="pt-10 px-4 pb-20 max-w-md mx-auto text-center font-sans text-white">
        <div className="bg-[#151515] p-8 rounded-[32px] shadow-sm border border-[#3D3215] flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-[#101010] border border-[#3D3215] flex items-center justify-center text-[#FACC15] mb-4 font-sans">
            <Star className="w-8 h-8 opacity-75 animate-bounce" />
          </div>
          <h2 className="text-xl font-display font-black mb-2 tracking-tight text-white">রিভিউ জবস বন্ধ আছে</h2>
          <p className="text-xs text-[#A3A3A3] font-bold leading-relaxed mb-6">
            দুঃখিত! এডমিন আপাতত রিভিউ জব অপশনটি বন্ধ রেখেছেন। অনুগ্রহ করে পরবর্তীতে আবার চেষ্টা করুন।
          </p>
          <button 
            type="button"
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] font-black py-3 px-6 rounded-2xl text-xs transition duration-200 uppercase tracking-widest active:scale-95 cursor-pointer shadow-md"
          >
            Dashboard এ ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 px-4 pb-20 text-white">
      <h2 className="text-2xl font-display font-black mb-4 tracking-tight text-white text-center">My Reviews</h2>

      {/* Trust Banner Banner */}
      <div className="bg-[#151515] border border-[#3D3215] rounded-[20px] p-3 mb-6 flex items-center justify-center gap-2 cursor-default">
        <Shield className="w-4 h-4 text-[#FACC15]" />
        <span className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest">Verified Authentic Reviews</span>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#101010] p-1 rounded-xl mb-6 border border-[#3D3215]">
        <button 
          onClick={() => setActiveTab('jobs')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${activeTab === 'jobs' ? 'bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] shadow-md' : 'bg-transparent text-[#A3A3A3] hover:text-white'}`}
        >
          <List className="w-4 h-4" /> Available Reviews
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${activeTab === 'history' ? 'bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] shadow-md' : 'bg-transparent text-[#A3A3A3] hover:text-white'}`}
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
              <div className="col-span-full text-center py-10 text-[#737373] font-medium">No review tasks available right now.</div>
            ) : (
              jobs.map((job) => {
                return (
                  <div key={job.id} className="bg-[#151515] p-4 rounded-2xl shadow-sm hover:shadow-md border border-[#3D3215] hover:border-[#D4A017] flex flex-col items-center text-center transition-all">
                    <div className="w-12 h-12 rounded-xl bg-[#101010] border border-[#3D3215] flex items-center justify-center mb-3 text-[#FACC15]">
                      <Star className="w-6 h-6" />
                    </div>
                    <h4 className="font-display font-bold text-[12px] leading-tight mb-1 text-white flex items-center justify-center gap-1 w-full truncate">
                      <span className="truncate">{job.title}</span>
                    </h4>
                    <span className="text-[#FACC15] text-[15px] font-display font-bold mb-3 tracking-tight">৳ {job.reward}</span>
                    <button 
                      onClick={() => startTask(job.id)}
                      className="w-full bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-[#D4A017]/20 cursor-pointer"
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
          <div className="flex gap-3 mb-6 bg-[#151515] p-3 rounded-2xl shadow-sm border border-[#3D3215]">
            <div className="flex-1">
              <label className="block text-[10px] uppercase font-black tracking-widest text-[#A3A3A3] mb-1 ml-1">Start Date</label>
              <input 
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full text-xs font-bold border border-[#3D3215] bg-[#101010] rounded-xl p-2.5 text-white outline-none focus:border-[#D4A017] transition-colors"
                max={filterEndDate || undefined}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] uppercase font-black tracking-widest text-[#A3A3A3] mb-1 ml-1">End Date</label>
              <input 
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full text-xs font-bold border border-[#3D3215] bg-[#101010] rounded-xl p-2.5 text-white outline-none focus:border-[#D4A017] transition-colors"
                min={filterStartDate || undefined}
              />
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="text-center py-10 text-[#737373]">
              <History className="w-12 h-12 mx-auto mb-3 opacity-20 text-[#D4A017]" />
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
                  className="bg-[#151515] p-4 rounded-xl shadow-sm border border-[#3D3215] flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#D4A017]/10 border border-[#3D3215] text-[#FACC15] flex items-center justify-center rounded-full">
                      <Star className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-display font-bold text-white">{historyItem.title}</h4>
                      <p className="text-xs text-[#737373]">{historyItem.completedAt?.toDate().toLocaleString() || 'Just now'}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center justify-end">
                    <p className="text-sm font-display font-black text-[#FACC15]">+৳ {historyItem.reward || 0}</p>
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
