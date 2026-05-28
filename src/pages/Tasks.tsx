import { useState, useEffect } from 'react';
import { History, List, MessageCircle, Video, Copy, Send, Key, ThumbsUp, Mail, Camera, Monitor, Smartphone, MonitorPlay, Heart, Star, User, Music, Globe, Hash, Briefcase } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
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
  const { t } = useLanguage();

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Fetch History
    const q = query(
      collection(db, "users", auth.currentUser.uid, "tasks"),
      orderBy("completedAt", "desc")
    );
    
    const unsubscribeHistory = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTaskHistory(history);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}/tasks`);
    });
    
    // Fetch Jobs
    const jobsQuery = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      const fetchedJobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter((j: any) => j.status === 'active');
      setJobs(fetchedJobs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'jobs');
    });

    return () => { unsubscribeHistory(); unsubscribeJobs(); };
  }, []);

  const startTask = (jobId: string) => {
    navigate(`/tasks/${jobId}`);
  };

  const filteredJobs = jobs.filter(job => job.type !== 'Review' && (selectedCategory === 'All' || job.type === selectedCategory));
  
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
    <div className="pt-6 px-4 pb-20">
      <h2 className="text-2xl font-display font-black mb-6 tracking-tight text-slate-800 dark:text-white text-center">{t('my_tasks')}</h2>
      
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
          {/* Category Section with Official Logos */}
          <div className="mb-6">
            <h3 className="text-[12px] font-black uppercase tracking-widest text-[#0D47A1] dark:text-blue-400 mb-3 ml-1">
              {t('courses_categories') || 'Categories'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {categoryDetails.map((cat) => {
                const CatIcon = cat.icon;
                const isSelected = selectedCategory === cat.name;
                const count = getCategoryCount(cat.name);
                
                return (
                  <motion.button 
                    key={cat.name}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      playTapSound?.();
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left relative overflow-hidden group ${
                      isSelected 
                        ? 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white border-indigo-600 shadow-md shadow-indigo-650/20' 
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {/* Official branding icon badge */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : `${cat.bg} ${cat.color}`
                    }`}>
                      <CatIcon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-black uppercase tracking-wide truncate ${isSelected ? 'text-white' : 'text-slate-850 dark:text-white'}`}>
                        {cat.name}
                      </p>
                      <span className={`text-[9px] font-bold ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {count} {count === 1 ? 'Job' : 'Jobs'}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Section Divider with Selected Category Title */}
          <div className="flex items-center justify-between mb-4 mt-2 px-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
              {selectedCategory === 'All' ? t('available_jobs') : `${selectedCategory}`}
            </h3>
            <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full ring-1 ring-indigo-100 dark:ring-indigo-900/30">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredJobs.length === 0 ? (
              <div className="col-span-full text-center py-10 text-slate-400 dark:text-slate-500 font-medium">No jobs available in this category.</div>
            ) : (
              filteredJobs.map((job) => {
                const Icon = getIcon(job.icon);
                return (
                  <div key={job.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm hover:shadow-md ring-1 ring-slate-100 dark:ring-slate-700/50 flex flex-col items-center text-center transition-all">
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
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center rounded-full">
                    <List className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-display font-bold text-gray-800 dark:text-white">{historyItem.title}</h4>
                    <p className="text-xs text-gray-500">{historyItem.completedAt?.toDate().toLocaleString() || 'Just now'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-display font-black text-green-600 dark:text-green-400">+৳{historyItem.reward}</p>
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
