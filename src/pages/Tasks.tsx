import { useState, useEffect } from 'react';
import { History, List, MessageCircle, Video, Copy, Send, Key, ThumbsUp, Mail, Camera, Monitor, Smartphone, MonitorPlay, Heart, Star, User, Music, Globe, Hash, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { useLanguage } from '../components/LanguageProvider';

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
  const [activeTab, setActiveTab] = useState<'jobs' | 'history'>('jobs');
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
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

  const filteredJobs = jobs.filter(job => selectedCategory === 'All' || job.type === selectedCategory);
  
  const categories = ['All', 'Facebook', 'Gmail', 'Instagram', 'Sell Accounts', 'Microjob', 'Typing', 'Watch Ads', 'Other'];

  return (
    <div className="pt-6 px-4 pb-20">
      <h2 className="text-2xl font-black mb-6 tracking-tight text-slate-800 dark:text-white text-center">{t('my_tasks')}</h2>
      
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

      {activeTab === 'jobs' && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar px-1">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'}`}
              >
                {cat}
              </button>
            ))}
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
                    <h4 className="font-bold text-[11px] leading-tight mb-1 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 w-full truncate">
                      <span className="truncate">{job.title}</span>
                    </h4>
                    <span className="text-indigo-600 dark:text-indigo-400 text-sm font-black mb-3 tracking-tight">৳ {job.reward}</span>
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
        </>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3">
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
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white">{historyItem.title}</h4>
                    <p className="text-xs text-gray-500">{historyItem.completedAt?.toDate().toLocaleString() || 'Just now'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-green-600 dark:text-green-400">+৳{historyItem.reward}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
