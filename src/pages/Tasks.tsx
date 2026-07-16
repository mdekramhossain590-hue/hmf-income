import React, { useState, useEffect } from 'react';
import { History, Loader2, RefreshCw, List, MessageCircle, Video, Copy, Send, Key, ThumbsUp, Mail, Camera, Monitor, Smartphone, MonitorPlay, Heart, Star, User, Music, Globe, Hash, Briefcase, ArrowLeft, ChevronRight, Shield } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { collection, getDocs, query, orderBy, limit, where } from '@/src/lib/mock-firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { getCachedQuery } from '../lib/cache';
import { useLanguage } from '../components/LanguageProvider';
import { motion, AnimatePresence } from 'motion/react';
import { playTapSound } from '../lib/sound';

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Video': return Video;
    case 'Copy': return Copy;
    case 'Send': return Send;
    case 'Key': return Key;
    case 'Facebook': return ThumbsUp;
    case 'Mail': return Mail;
    case 'Instagram': return Camera;
    case 'Monitor': return Monitor;
    case 'Smartphone': return Smartphone;
    case 'Youtube': return MonitorPlay;
    case 'Heart': return Heart;
    case 'Star': return Star;
    case 'User': return User;
    case 'Music': return Music;
    case 'Globe': return Globe;
    case 'Twitter': return Hash;
    case 'Linkedin': return Briefcase;
    default: return MessageCircle;
  }
};

export function Tasks() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'jobs' | 'history'>('jobs');
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const initCategory = searchParams.get('category') || 'All';
  const [selectedCategory, setSelectedCategory] = useState<string>(initCategory);
  const [viewingCategory, setViewingCategory] = useState<string | null>(null);
  const { t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullStartY, setPullStartY] = useState(0);
  const [pullMoveY, setPullMoveY] = useState(0);

  // Fetch History
  const loadData = async (forceRefresh = false) => {
    if (!auth.currentUser) return;
      try {
      if (forceRefresh) setIsRefreshing(true);
        const q = query(
          collection(db, "submissions"),
          where("userId", "==", auth.currentUser!.uid),
          limit(100)
        );
        const taskSnap = forceRefresh ? await getDocs(q) : await getCachedQuery(q, `tasks_history_${auth.currentUser!.uid}`);
        const historyData = taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        historyData.sort((a, b) => {
          const aTime = a.submittedAt?.toMillis?.() || 0;
          const bTime = b.submittedAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
        setTaskHistory(historyData.slice(0, 50));
        
        const jobsQuery = query(collection(db, "jobs"), orderBy("createdAt", "desc"), limit(100));
        const jobSnap = forceRefresh ? await getDocs(jobsQuery) : await getCachedQuery(jobsQuery, "jobs_active_list");
        setJobs(jobSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter((j: any) => j.status === 'active'));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'jobs or tasks');
      } finally {
        if (forceRefresh) setIsRefreshing(false);
      }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 0) {
      setPullStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartY > 0 && window.scrollY <= 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - pullStartY;
      if (diff > 0) {
        setPullMoveY(Math.min(diff, 100));
        // if (e.cancelable) e.preventDefault(); // can't preventDefault easily here due to passive listener
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullMoveY > 60 && !isRefreshing) {
      playTapSound();
      loadData(true);
    }
    setPullStartY(0);
    setPullMoveY(0);
  };

  const startTask = (jobId: string) => {
    navigate(`/tasks/${jobId}`);
  };

  const filteredJobs = jobs.filter(job => job.type !== 'Review' && (viewingCategory === 'All' || job.type === viewingCategory));
  
  const categoryDetails = [
    { name: 'All', icon: Briefcase, bg: 'bg-indigo-50 dark:bg-indigo-950/20', color: 'text-indigo-500 hover:text-indigo-600' },
    { name: 'Facebook', icon: ThumbsUp, bg: 'bg-blue-50 dark:bg-blue-950/20', color: 'text-[#1877F2]' },
    { name: 'Gmail', icon: Mail, bg: 'bg-red-50 dark:bg-red-950/20', color: 'text-[#EA4335]' },
    { name: 'Instagram', icon: Camera, bg: 'bg-pink-50 dark:bg-pink-950/20', color: 'text-[#E1306C]' },
    { name: 'Telegram', icon: Send, bg: 'bg-sky-50 dark:bg-sky-950/20', color: 'text-[#229ED9]' },
    { name: 'Sell Accounts', icon: User, bg: 'bg-amber-50 dark:bg-amber-950/20', color: 'text-amber-500' },
    { name: 'Microjob', icon: Monitor, bg: 'bg-violet-50 dark:bg-violet-950/20', color: 'text-violet-500' },
    { name: 'Typing', icon: Key, bg: 'bg-emerald-50 dark:bg-emerald-950/20', color: 'text-emerald-500' },
    { name: 'Watch Ads', icon: MonitorPlay, bg: 'bg-rose-50 dark:bg-rose-950/20', color: 'text-red-600' },
    { name: 'Other', icon: Globe, bg: 'bg-slate-50 dark:bg-slate-900/40', color: 'text-slate-500' }
  ];

  const getCategoryCount = (category: string) => {
    if (category === 'All') {
      return jobs.filter(job => job.type !== 'Review').length;
    }
    return jobs.filter(job => job.type === category).length;
  };

  return (
    <div 
      className="pt-6 px-4 pb-20 min-h-screen"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div 
        className="flex justify-center items-center overflow-hidden transition-all duration-300"
        style={{ height: pullMoveY > 0 ? `${pullMoveY}px` : (isRefreshing ? '60px' : '0px') }}
      >
        <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-md ${isRefreshing ? 'animate-spin' : ''}`}
             style={{ transform: `rotate(${pullMoveY * 3}deg)` }}>
          <RefreshCw className={`w-5 h-5 text-indigo-500 ${isRefreshing ? '' : 'opacity-70'}`} />
        </div>
      </div>
      <h2 className="text-2xl font-display font-black mb-4 tracking-tight text-slate-800 dark:text-white text-center">{t('my_tasks')}</h2>
      
      {/* Trust Banner Banner */}
      <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-[20px] p-3 mb-6 flex items-center justify-center gap-2 cursor-default">
        <Shield className="w-4 h-4 text-emerald-500" />
        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">100% Guaranteed Secure Tasks</span>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl mb-4 ring-1 ring-slate-200 dark:ring-slate-800">
        <button 
          onClick={() => setActiveTab('jobs')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${activeTab === 'jobs' ? 'bg-white shadow-sm text-indigo-600 dark:bg-slate-800 dark:text-indigo-400' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <List className="w-4 h-4" /> {t('available_jobs')}
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
          {viewingCategory === null ? (
            /* Index View: Only Category Cards with no lists underneath */
            <div className="mb-6">
              <h3 className="text-[12px] font-black uppercase tracking-widest text-[#0D47A1] dark:text-blue-400 mb-3 ml-1">
                {t('courses_categories') || 'Categories'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {categoryDetails.map((cat) => {
                  const CatIcon = cat.icon;
                  const count = getCategoryCount(cat.name);
                  
                  return (
                    <motion.button 
                      key={cat.name}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setViewingCategory(cat.name);
                        playTapSound?.();
                      }}
                      className="flex items-center gap-3 p-3 rounded-2xl border transition-all text-left relative overflow-hidden group bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
                    >
                      {/* Official branding icon badge */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 ${cat.bg} ${cat.color}`}>
                        <CatIcon className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black uppercase tracking-wide truncate text-slate-850 dark:text-white">
                          {cat.name}
                        </p>
                        <span className="text-[9px] font-bold text-slate-400">
                          {count} {count === 1 ? 'Job' : 'Jobs'}
                        </span>
                      </div>

                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Sub-page / Category Detail View */
            <div>
              {/* Elegant back button to Categories */}
              <button 
                onClick={() => setViewingCategory(null)}
                className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-4.5 py-2.5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all mb-4 hover:bg-indigo-100/50 dark:hover:bg-indigo-950/30"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {t('back') || 'Back'}
              </button>

              {/* Category Brand Header */}
              {(() => {
                const currentCat = categoryDetails.find(c => c.name === viewingCategory) || { name: viewingCategory, icon: Briefcase, bg: 'bg-indigo-50 dark:bg-indigo-950/20', color: 'text-indigo-500' };
                const CatIcon = currentCat.icon;
                
                return (
                  <div className="flex items-center justify-between p-4 mb-4 bg-gradient-to-tr from-indigo-50 to-indigo-100/30 dark:from-slate-800/40 dark:to-slate-900/40 rounded-3xl border border-indigo-100/10 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${currentCat.bg} ${currentCat.color}`}>
                        <CatIcon className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#0D47A1] dark:text-blue-400">
                          {viewingCategory}
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 block -mt-0.5">
                          {t('available_jobs') || 'Available Jobs'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1.5 rounded-full shadow-sm ring-2 ring-indigo-500/10">
                      {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'}
                    </span>
                  </div>
                );
              })()}

              {/* Jobs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredJobs.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-white dark:bg-slate-850 rounded-3xl p-6 text-slate-400 dark:text-slate-500 font-medium">
                    <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    No jobs currently available in this category.
                  </div>
                ) : (
                  filteredJobs.map((job) => {
                    const Icon = getIcon(job.icon);
                    const userSubmission = taskHistory.find((h: any) => h.jobId === job.id);
                    return (
                      <div key={job.id} className="relative bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm hover:shadow-md ring-1 ring-slate-100 dark:ring-slate-700/50 flex flex-col items-center text-center transition-all overflow-hidden">
                        {userSubmission && (
                          <div className="absolute top-0 right-0">
                             <span className={`text-[8px] px-2 py-0.5 rounded-bl-lg font-black uppercase tracking-widest ${
                               userSubmission.status === 'approved' ? 'bg-emerald-500 text-white' :
                               userSubmission.status === 'rejected' ? 'bg-red-500 text-white' :
                               'bg-amber-500 text-white'
                             }`}>
                               {userSubmission.status || 'pending'}
                             </span>
                          </div>
                        )}
                        <div className={`w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 flex items-center justify-center mb-3 text-indigo-500`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <h4 className="font-display font-bold text-[12px] leading-tight mb-1 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 w-full truncate">
                          <span className="truncate">{job.title}</span>
                        </h4>
                        <span className="text-indigo-600 dark:text-indigo-400 text-[15px] font-display font-bold mb-3 tracking-tight drop-shadow-sm">৳ {job.reward}</span>
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
            </div>
          )}
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
          {taskHistory.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No task history yet.</p>
            </div>
          ) : (
            taskHistory.map((historyItem) => (
              <div key={historyItem.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                    historyItem.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                    historyItem.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                    'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                  }`}>
                    <List className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-display font-bold text-gray-800 dark:text-white line-clamp-1">{historyItem.title}</h4>
                    <p className="text-xs text-gray-500">{(historyItem.submittedAt || historyItem.completedAt)?.toDate().toLocaleString() || 'Just now'}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className={`text-sm font-display font-black ${
                    historyItem.status === 'approved' ? 'text-green-600 dark:text-green-400' :
                    historyItem.status === 'rejected' ? 'text-red-500 line-through' :
                    'text-orange-500'
                  }`}>+৳{historyItem.reward}</p>
                  <span className={`text-[10px] mt-1 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                    historyItem.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    historyItem.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {historyItem.status || 'pending'}
                  </span>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
