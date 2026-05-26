import { useState, useEffect } from 'react';
import { History, List, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { useLanguage } from '../components/LanguageProvider';
import { motion, AnimatePresence } from 'motion/react';

export function Reviews() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'jobs' | 'history'>('jobs');
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Fetch History
    const q = query(
      collection(db, "users", auth.currentUser.uid, "tasks"),
      orderBy("completedAt", "desc")
    );
    
    const unsubscribeHistory = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(item => item.type === 'Review');
      setTaskHistory(history);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}/tasks`);
    });
    
    // Fetch Review Jobs
    const jobsQuery = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      const fetchedJobs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((j: any) => j.status === 'active' && j.type === 'Review');
      setJobs(fetchedJobs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'jobs');
    });

    return () => { unsubscribeHistory(); unsubscribeJobs(); };
  }, []);

  const startTask = (jobId: string) => {
    navigate(`/tasks/${jobId}`);
  };

  return (
    <div className="pt-6 px-4 pb-20">
      <h2 className="text-2xl font-display font-black mb-6 tracking-tight text-slate-800 dark:text-white text-center">My Reviews</h2>
      
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
                    <span className="text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-black tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full mb-3 border border-emerald-100 dark:border-emerald-800/50">Direct Payment</span>
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
              <p className="text-sm">No review history yet.</p>
            </div>
          ) : (
            taskHistory.map((historyItem) => (
              <div key={historyItem.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center">
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
                  <p className="text-[9px] font-display font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800/50 mt-1">Direct Paid</p>
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
