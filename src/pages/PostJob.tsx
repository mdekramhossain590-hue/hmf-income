import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Briefcase, Link as LinkIcon, DollarSign, List, FileText, 
  CheckCircle, PlusCircle, AlertCircle, RefreshCw, Layers, ShieldCheck, HelpCircle 
} from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { useLanguage } from '../components/LanguageProvider';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, query, where, getDocs, doc, setDoc, writeBatch, increment, serverTimestamp 
} from 'firebase/firestore';
import { Celebration } from '../components/Celebration';
import toast from 'react-hot-toast';

export function PostJob() {
  const [showCelebration, setShowCelebration] = useState(false);
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [category, setCategory] = useState('Facebook');
  const [reward, setReward] = useState(2); // Minimum 2 Taka per job
  const [slots, setSlots] = useState(10); // Minimum 10 slots
  const [selectedProofs, setSelectedProofs] = useState<string[]>(['text']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User's own posted jobs
  const [userJobs, setUserJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const totalCost = reward * slots;

  useEffect(() => {
    if (!auth.currentUser) return;
    fetchUserJobs();
  }, []);

  const fetchUserJobs = async () => {
    try {
      setLoadingJobs(true);
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, where('postedByUid', '==', auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const jobsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort client-side to avoid needing a complex composite index immediately
      jobsList.sort((a: any, b: any) => {
        const tA = a.createdAt?.toDate ? a.createdAt.toDate() : 0;
        const tB = b.createdAt?.toDate ? b.createdAt.toDate() : 0;
        return tB - tA;
      });
      setUserJobs(jobsList);
    } catch (err) {
      console.error('Error fetching user jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleToggleProof = (proof: string) => {
    if (selectedProofs.includes(proof)) {
      if (selectedProofs.length > 1) {
        setSelectedProofs(selectedProofs.filter(p => p !== proof));
      } else {
        toast.error('At least one proof requirement is needed!');
      }
    } else {
      setSelectedProofs([...selectedProofs, proof]);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !profile) return;

    if (reward < 1) {
      toast.error('Minimum reward per task is ৳1.00');
      return;
    }
    if (slots < 5) {
      toast.error('Minimum total slots is 5');
      return;
    }
    if (totalCost > (profile.balances?.main || 0)) {
      toast.error('Insufficient Main Balance! Please deposit money to your main wallet first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);

      // 1. Create the pending job
      const jobRef = doc(collection(db, 'jobs'));
      const newJobData = {
        title,
        description,
        link,
        type: category,
        reward,
        allowedCompletions: slots,
        remainingSlots: slots,
        userLimit: 1, // Single completion per user
        status: 'pending',
        postedBy: profile.fullName || 'User',
        postedByUid: auth.currentUser.uid,
        totalCost,
        requiredProofs: selectedProofs,
        createdAt: serverTimestamp(),
        icon: getCategoryIconName(category),
        color: getCategoryColor(category),
        bg: getCategoryBg(category)
      };

      batch.set(jobRef, newJobData);

      // 2. Deduct cost from user's main balance
      const userRef = doc(db, 'users', auth.currentUser.uid);
      batch.update(userRef, {
        'balances.main': increment(-totalCost)
      });

      // 3. Create a transaction log
      const txRef = doc(collection(db, 'users', auth.currentUser.uid, 'transactions'));
      batch.set(txRef, {
        amount: totalCost,
        type: 'post_job',
        status: 'completed',
        createdAt: serverTimestamp(),
        description: `Posted Job: ${title} (${slots} Slots)`
      });

      await batch.commit();
      
      setShowCelebration(true);
      toast.success('Job posted successfully! Waiting for admin approval.');
      
      // Reset form
      setTitle('');
      setDescription('');
      setLink('');
      setCategory('Facebook');
      setReward(2);
      setSlots(10);
      setSelectedProofs(['text']);
      
      // Refresh user profile and job list
      await refreshProfile();
      fetchUserJobs();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'jobs/user_post');
      toast.error('Failed to post job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIconName = (cat: string) => {
    switch (cat) {
      case 'Facebook': return 'Facebook';
      case 'Gmail': return 'Mail';
      case 'Instagram': return 'Instagram';
      case 'Telegram': return 'Send';
      case 'Sell Accounts': return 'User';
      case 'Microjob': return 'Monitor';
      case 'Typing': return 'Key';
      case 'Watch Ads': return 'Video';
      default: return 'Globe';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Facebook': return 'text-[#1877F2]';
      case 'Gmail': return 'text-[#EA4335]';
      case 'Instagram': return 'text-[#E1306C]';
      case 'Telegram': return 'text-[#229ED9]';
      default: return 'text-indigo-500';
    }
  };

  const getCategoryBg = (cat: string) => {
    switch (cat) {
      case 'Facebook': return 'bg-blue-100';
      case 'Gmail': return 'bg-red-100';
      case 'Instagram': return 'bg-pink-100';
      case 'Telegram': return 'bg-sky-100';
      default: return 'bg-indigo-100';
    }
  };

  return (
    <div className="pt-6 px-4 pb-24">
      <Celebration isVisible={showCelebration} onComplete={() => setShowCelebration(false)} />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/')}
          className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-black text-slate-850 dark:text-white uppercase tracking-tight">
          {t('post_job_title') || 'Post a Job / জব পোস্ট'}
        </h2>
        <div className="w-11"></div> {/* Spacer for alignment */}
      </div>

      {/* Main Balance Info */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-5 mb-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute right-[-10px] top-[-10px] opacity-10">
          <Briefcase className="w-32 h-32" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-100 block mb-1">
          Available Wallet Balance
        </span>
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-3xl font-black tracking-tight leading-none">
              ৳{(profile?.balances?.main || 0).toFixed(2)}
            </h3>
            <p className="text-[11px] font-bold text-blue-200 mt-2">
              জব পোস্ট করার জন্য আপনার মেইন ব্যালেন্স ব্যবহার করা হবে।
            </p>
          </div>
          <button 
            onClick={() => navigate('/wallet')} 
            className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider active:scale-95 transition-all"
          >
            Deposit
          </button>
        </div>
      </div>

      {/* Create Job Form */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
          <PlusCircle className="w-5 h-5 text-indigo-500" />
          <h3 className="font-black text-sm dark:text-white uppercase tracking-wider">
            নতুন টাস্ক বা জব পাবলিশ করুন
          </h3>
        </div>

        <form onSubmit={handlePostJob} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1 px-1">
              Task Title / জবের শিরোনাম
            </label>
            <input 
              type="text" 
              placeholder="e.g. Subscribe to my Youtube Channel" 
              required 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 dark:text-white" 
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1 px-1">
              Task Instructions / কিভাবে কাজটি করতে হবে
            </label>
            <textarea 
              placeholder="e.g. 1. Go to the link. 2. Subscribe. 3. Send Screenshot" 
              required 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold h-24 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 dark:text-white" 
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1 px-1">
              Target Link / জবের লিংক
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-450">
                <LinkIcon className="w-4 h-4" />
              </span>
              <input 
                type="url" 
                placeholder="https://youtube.com/..." 
                required 
                value={link} 
                onChange={e => setLink(e.target.value)} 
                className="w-full bg-slate-50 dark:bg-slate-900 border-none pl-11 pr-4 py-3 rounded-2xl text-sm font-bold placeholder:text-slate-400 text-blue-500 focus:ring-2 focus:ring-indigo-500/20" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1 px-1">
                Category / ক্যাটাগরি
              </label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold dark:text-white"
              >
                {['Facebook', 'Gmail', 'Instagram', 'Telegram', 'Sell Accounts', 'Microjob', 'Typing', 'Watch Ads', 'Other'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1 px-1">
                Reward (৳) / কাজের রেট
              </label>
              <input 
                type="number" 
                min="1" 
                step="0.5"
                required 
                value={reward} 
                onChange={e => setReward(Math.max(1, parseFloat(e.target.value) || 0))} 
                className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-black text-indigo-600 dark:text-indigo-400" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1 px-1">
                Total Slots / কয়জন কাজ করবে
              </label>
              <input 
                type="number" 
                min="5" 
                required 
                value={slots} 
                onChange={e => setSlots(Math.max(5, parseInt(e.target.value) || 0))} 
                className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold dark:text-white" 
              />
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl flex flex-col justify-center text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Total Cost / মোট খরচ
              </span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                ৳{totalCost.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Proof Options */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-2">
            <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block pl-1">
              Required Proofs / প্রমাণ যাচাইয়ের ধরণ
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'text', label: 'Written Proof (text)' },
                { id: 'screenshot', label: 'Screenshot Upload' },
                { id: 'username', label: 'User Details / Username' }
              ].map(proof => (
                <button
                  type="button"
                  key={proof.id}
                  onClick={() => handleToggleProof(proof.id)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    selectedProofs.includes(proof.id)
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-indigo-600 dark:border-indigo-600'
                      : 'bg-white text-slate-500 border-slate-100 dark:bg-slate-800 dark:border-slate-700/50'
                  }`}
                >
                  {proof.id}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] py-4 rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
            Submit Job for Approval (৳{totalCost.toFixed(2)})
          </button>
        </form>
      </div>

      {/* User Posted Jobs List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-black text-sm dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4.5 h-4.5 text-blue-500" />
            আপনার পূর্বের জব সমূহ ({userJobs.length})
          </h3>
          <button 
            onClick={fetchUserJobs}
            className="text-xs text-indigo-500 font-bold flex items-center gap-1 active:scale-95"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {loadingJobs ? (
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-400" />
          </div>
        ) : userJobs.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl text-center text-slate-400 border border-slate-100 dark:border-slate-700">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-500" />
            আপনি এখনো কোনো জব পোস্ট করেননি।
          </div>
        ) : (
          <div className="space-y-3">
            {userJobs.map((job) => (
              <div 
                key={job.id} 
                className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 flex justify-between items-start"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md">
                      {job.type}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      job.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : job.status === 'pending'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <h4 className="font-bold dark:text-white text-sm leading-snug truncate">
                    {job.title}
                  </h4>
                  <div className="flex gap-4 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <span>Rate: ৳{job.reward}</span>
                    <span>Slots: {job.allowedCompletions}</span>
                    <span>Cost: ৳{job.totalCost}</span>
                  </div>
                </div>
                
                {job.status === 'pending' && (
                  <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 dark:bg-amber-900/10 px-2 py-1.5 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Pending Review
                  </div>
                )}
                {job.status === 'active' && (
                  <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Live
                  </div>
                )}
                {job.status === 'rejected' && (
                  <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 dark:bg-rose-900/10 px-2 py-1.5 rounded-xl border border-rose-100 dark:border-rose-900/30 flex flex-col items-end">
                    <span>Rejected</span>
                    <span className="text-[8px] text-slate-400 capitalize -mt-0.5 font-bold">Balance Refunded</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
