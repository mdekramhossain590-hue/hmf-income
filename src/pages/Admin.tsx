import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { collection, query, onSnapshot, doc, writeBatch, serverTimestamp, setDoc, orderBy, deleteDoc, increment, updateDoc } from 'firebase/firestore';
import { processReferralCommission } from '../lib/referral';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { Trash2, CheckCircle, XCircle, Users, ShieldAlert, ShieldCheck, Wallet, ListChecks, Settings, User, Eye, Calculator, MessageSquare, Globe, Coins, Megaphone, Gamepad2, CreditCard, Lock, BellRing, RefreshCw, Smartphone, Mail, Camera, MessageCircle, Send } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export function AdminPanel() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'jobs' | 'submissions' | 'settings' | 'requests' | 'users'>('submissions');
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [spinRewards, setSpinRewards] = useState<number[]>([1, 2, 5, 10, 0, 50, 100, 0]);
  const [referralSettings, setReferralSettings] = useState({ fixedBonus: 10, gen2FixedBonus: 0, gen3FixedBonus: 0, gen1Percent: 0, gen2Percent: 0, gen3Percent: 0 });
  const [bannerSettings, setBannerSettings] = useState({ text: 'Welcome to HMF Income! Complete tasks and earn money daily.', link: '#' });
  const [gameSettings, setGameSettings] = useState({ spinTaskReq: 0, spinReferReq: 0, mathTaskReq: 0, mathReferReq: 0 });
  const [withdrawSettings, setWithdrawSettings] = useState({ mainMin: 50, mainFee: 0, bonusMin: 50, bonusFee: 0, referralMin: 50, referralFee: 0, tasksMin: 50, tasksFee: 0 });
  const [depositSettings, setDepositSettings] = useState({ bkashNumber: '017XX-XXXXXX', nagadNumber: '017XX-XXXXXX', minDeposit: 100, maxDeposit: 25000 });
  const [activationSettings, setActivationSettings] = useState({ mode: 'free', fee: 50 });
  const [supportSettings, setSupportSettings] = useState({ email: 'support@example.com', whatsapp: '', telegram: '', facebook: '' });
  const [popupSettings, setPopupSettings] = useState({ 
    telegramText: 'Join Telegram',
    telegramLink: 'https://t.me/', 
    skipText: 'Skip', 
    skipLink: '#',
    title: 'Welcome!',
    subtitle: 'Join our official channel for updates'
  });
  const [siteSettings, setSiteSettings] = useState({ logoUrl: '', faviconUrl: '' });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    reward: 10,
    link: '',
    type: 'Facebook',
    icon: 'MessageCircle', // hardcode or select
    color: 'text-blue-500',
    bg: 'bg-blue-100',
    requiredProofs: ['text'] as string[],
    allowedCompletions: 1, // 0 for unlimited
    deadline: '',
  });

  const isAdmin = profile?.role === 'admin' || auth.currentUser?.email === 'mdekramhossain590@gmail.com';

  useEffect(() => {
    if (!isAdmin) return;
    
    const jQ = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const unsubJ = onSnapshot(jQ, (snap) => setJobs(snap.docs.map(d => ({id: d.id, ...d.data()}))), (err) => handleFirestoreError(err, OperationType.GET, 'jobs'));
    
    const sQ = query(collection(db, "submissions"), orderBy("submittedAt", "desc"));
    const unsubS = onSnapshot(sQ, (snap) => setSubmissions(snap.docs.map(d => ({id: d.id, ...d.data()}))), (err) => handleFirestoreError(err, OperationType.GET, 'submissions'));
    
    const pQ = query(collection(db, "payment_requests"), orderBy("createdAt", "desc"));
    const unsubP = onSnapshot(pQ, (snap) => setPaymentRequests(snap.docs.map(d => ({id: d.id, ...d.data()}))), (err) => handleFirestoreError(err, OperationType.GET, 'payment_requests'));
    
    const unsubSpin = onSnapshot(doc(db, "settings", "spin"), (doc) => {
      if (doc.exists()) {
        setSpinRewards(doc.data().rewards || [1, 2, 5, 10, 0, 50, 100, 0]);
      }
    }, (err) => console.log(err));

    const unsubReferral = onSnapshot(doc(db, "settings", "referral"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setReferralSettings({ 
          fixedBonus: data.fixedBonus || 0,
          gen2FixedBonus: data.gen2FixedBonus || 0,
          gen3FixedBonus: data.gen3FixedBonus || 0,
          gen1Percent: data.gen1Percent || data.percentageCommission || 0,
          gen2Percent: data.gen2Percent || 0,
          gen3Percent: data.gen3Percent || 0
        });
      }
    }, (err) => console.log(err));

    const unsubBanner = onSnapshot(doc(db, "settings", "banner"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setBannerSettings({ text: data.text || '', link: data.link || '#' });
      }
    }, (err) => console.log(err));

    const unsubGameSettings = onSnapshot(doc(db, "settings", "games"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setGameSettings({ 
          spinTaskReq: data.spinTaskReq || 0, 
          spinReferReq: data.spinReferReq || 0,
          mathTaskReq: data.mathTaskReq || 0,
          mathReferReq: data.mathReferReq || 0
        });
      }
    }, (err) => console.log(err));

    const unsubWithdrawSettings = onSnapshot(doc(db, "settings", "withdraw"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setWithdrawSettings({
          mainMin: data.mainMin || 50,
          mainFee: data.mainFee || 0,
          bonusMin: data.bonusMin || 50,
          bonusFee: data.bonusFee || 0,
          referralMin: data.referralMin || 50,
          referralFee: data.referralFee || 0,
          tasksMin: data.tasksMin || 50,
          tasksFee: data.tasksFee || 0
        });
      }
    }, (err) => console.log(err));

    const unsubDepositSettings = onSnapshot(doc(db, "settings", "deposit"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setDepositSettings({
          bkashNumber: data.bkashNumber || '017XX-XXXXXX',
          nagadNumber: data.nagadNumber || '017XX-XXXXXX',
          minDeposit: data.minDeposit !== undefined ? data.minDeposit : 100,
          maxDeposit: data.maxDeposit !== undefined ? data.maxDeposit : 25000
        });
      }
    }, (err) => console.log(err));

    const unsubPopupSettings = onSnapshot(doc(db, "settings", "popup"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setPopupSettings({
          telegramText: data.telegramText || 'Join Telegram',
          telegramLink: data.telegramLink || 'https://t.me/',
          skipText: data.skipText || 'Skip',
          skipLink: data.skipLink || '#',
          title: data.title || 'Welcome!',
          subtitle: data.subtitle || 'Join our official channel for updates'
        });
      }
    }, (err) => console.log(err));

    const unsubActivationSettings = onSnapshot(doc(db, "settings", "activation"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setActivationSettings({
          mode: data.mode || 'free',
          fee: data.fee || 50
        });
      }
    }, (err) => console.log(err));

    const unsubSupportSettings = onSnapshot(doc(db, "settings", "support"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSupportSettings({
          email: data.email || 'support@example.com',
          whatsapp: data.whatsapp || '',
          telegram: data.telegram || '',
          facebook: data.facebook || ''
        });
      }
    }, (err) => console.log(err));

    const unsubSiteSettings = onSnapshot(doc(db, "settings", "site"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSiteSettings({
          logoUrl: data.logoUrl || '',
          faviconUrl: data.faviconUrl || ''
        });
      }
    }, (err) => console.log(err));

    const uQ = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubU = onSnapshot(uQ, (snap) => setUserList(snap.docs.map(d => ({id: d.id, ...d.data()}))), (err) => handleFirestoreError(err, OperationType.GET, 'users'));

    return () => { unsubJ(); unsubS(); unsubP(); unsubSpin(); unsubReferral(); unsubBanner(); unsubGameSettings(); unsubWithdrawSettings(); unsubDepositSettings(); unsubActivationSettings(); unsubPopupSettings(); unsubSupportSettings(); unsubSiteSettings(); unsubU(); };
  }, [isAdmin]);

  if (!isAdmin) return <div className="p-10 text-center">Access Denied</div>;

  const handleSaveActivationSettings = async () => {
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "activation"), {
        mode: activationSettings.mode,
        fee: activationSettings.fee,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast.success("Activation settings saved!");
    } catch (e) {
      toast.error("Failed to save activation settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB.");
      return;
    }

    const toastId = toast.loading(`Uploading ${type}...`);
    try {
      const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary configuration missing in .env.");
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || "Failed to upload image");
      }

      const data = await res.json();
      const imageUrl = data.secure_url;

      setSiteSettings(prev => ({
        ...prev,
        [type === 'logo' ? 'logoUrl' : 'faviconUrl']: imageUrl
      }));
      toast.success(`${type} uploaded successfully!`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message || `Failed to upload ${type}`, { id: toastId });
    }
  };

  const handleSaveSiteSettings = async () => {
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "site"), {
        ...siteSettings,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast.success("Site settings saved!");
      
      // Update favicon immediately
      if (siteSettings.faviconUrl) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = siteSettings.faviconUrl;
      }
    } catch (e) {
      toast.error("Failed to save site settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const toggleProof = (proofType: string) => {
    setNewJob(prev => ({
      ...prev,
      requiredProofs: prev.requiredProofs.includes(proofType) 
        ? prev.requiredProofs.filter(p => p !== proofType)
        : [...prev.requiredProofs, proofType]
    }));
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const jobRef = doc(collection(db, "jobs"));
      await setDoc(jobRef, {
        ...newJob,
        postedBy: profile?.fullName || 'Admin',
        status: 'active',
        createdAt: serverTimestamp()
      });
      toast.success('Job created.');
      setNewJob({ ...newJob, title: '', description: '', link: '', allowedCompletions: 1, deadline: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'jobs');
    }
  };
  
  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteDoc(doc(db, "jobs", jobId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `jobs/${jobId}`);
    }
  };

  const reviewSubmission = async (subId: string, userId: string, subReward: number, subTitle: string, jobType: string, status: 'approved' | 'rejected') => {
    try {
      const batch = writeBatch(db);
      
      const subRef = doc(db, "submissions", subId);
      batch.update(subRef, {
        status,
        reviewedAt: serverTimestamp()
      });
      
      if (status === 'approved') {
        const userRef = doc(db, "users", userId);
        const updateData: any = {
          totalTasksCompleted: increment(1)
        };
        if (jobType) {
          updateData[`balances.tasks.${jobType}`] = increment(subReward);
        } else {
          updateData["balances.main"] = increment(subReward);
        }
        batch.update(userRef, updateData);
        
        const txRef = doc(collection(db, "users", userId, "transactions"));
        batch.set(txRef, {
          amount: subReward,
          type: 'task',
          status: 'completed',
          createdAt: serverTimestamp()
        });
        
        const taskHisRef = doc(collection(db, "users", userId, "tasks"));
        batch.set(taskHisRef, {
          title: subTitle,
          reward: subReward,
          completedAt: serverTimestamp()
        });

        const leaderboardRef = doc(db, "leaderboard", userId);
        batch.set(leaderboardRef, {
          totalIncome: increment(subReward),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      const notifRef = doc(collection(db, "users", userId, "notifications"));
      batch.set(notifRef, {
        title: status === 'approved' ? 'Task Approved' : 'Task Rejected',
        message: `Your submission for "${subTitle}" was ${status}. ${status === 'approved' ? `You earned ৳${subReward}!` : ''}`,
        type: status === 'approved' ? 'task_approved' : 'task_rejected',
        read: false,
        createdAt: serverTimestamp()
      });
      
      await batch.commit();

      if (status === 'approved') {
        await processReferralCommission(userId, subReward, `Job: ${subTitle}`);
      }

      toast.success(`Submission ${status}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `submissions/${subId}`);
    }
  };

  const handleSaveSpinSettings = async () => {
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "spin"), {
        rewards: spinRewards,
        updatedAt: serverTimestamp()
      });
      toast.success('Spin settings saved!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/spin');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveReferralSettings = async () => {
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "referral"), {
        fixedBonus: Number(referralSettings.fixedBonus),
        gen2FixedBonus: Number(referralSettings.gen2FixedBonus),
        gen3FixedBonus: Number(referralSettings.gen3FixedBonus),
        gen1Percent: Number(referralSettings.gen1Percent),
        gen2Percent: Number(referralSettings.gen2Percent),
        gen3Percent: Number(referralSettings.gen3Percent),
        updatedAt: serverTimestamp()
      });
      toast.success('Referral settings saved!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/referral');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveBannerSettings = async () => {
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "banner"), {
        ...bannerSettings,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast.success('Banner settings saved!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/banner');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveGameSettings = async () => {
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "games"), {
        ...gameSettings,
        updatedAt: serverTimestamp()
      });
      toast.success('Game unlock settings saved!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/games');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveWithdrawSettings = async () => {
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "withdraw"), {
        ...withdrawSettings,
        updatedAt: serverTimestamp()
      });
      toast.success('Withdraw settings saved!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/withdraw');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveDepositSettings = async () => {
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "deposit"), {
        ...depositSettings,
        updatedAt: serverTimestamp()
      });
      toast.success('Deposit settings saved!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/deposit');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSavePopupSettings = async () => {
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "popup"), {
        ...popupSettings,
        updatedAt: serverTimestamp()
      });
      toast.success('Popup settings saved!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/popup');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveSupportSettings = async () => {
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "support"), {
        ...supportSettings,
        updatedAt: serverTimestamp()
      });
      toast.success('Support settings saved!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/support');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handlePaymentRequest = async (reqId: string, reqUserId: string, reqAmount: number, reqType: 'deposit' | 'withdraw' | 'activation', status: 'approved' | 'rejected', txId: string, wallet: string) => {
    try {
      const batch = writeBatch(db);
      
      const reqRef = doc(db, "payment_requests", reqId);
      batch.update(reqRef, { status, updatedAt: serverTimestamp() });
      
      if (txId) {
        const txRef = doc(db, "users", reqUserId, "transactions", txId);
        batch.update(txRef, { status, updatedAt: serverTimestamp() });
      }
      
      const userRef = doc(db, "users", reqUserId);
      
      if (reqType === 'deposit' && status === 'approved') {
        batch.update(userRef, { "balances.main": increment(reqAmount) });
      } else if (reqType === 'withdraw' && status === 'rejected') {
        const updateData: any = {};
        if (wallet === 'main') updateData["balances.main"] = increment(reqAmount);
        else if (wallet === 'bonus') updateData["balances.bonus"] = increment(reqAmount);
        else if (wallet === 'referral') updateData["balances.referral"] = increment(reqAmount);
        else updateData[`balances.tasks.${wallet}`] = increment(reqAmount);
        
        batch.update(userRef, updateData);
      } else if (reqType === 'activation' && status === 'approved') {
        batch.update(userRef, { isActive: true });
      }
      
      const notifRef = doc(collection(db, "users", reqUserId, "notifications"));
      batch.set(notifRef, {
        title: `${reqType === 'deposit' ? 'Deposit' : reqType === 'activation' ? 'Account Activation' : 'Withdrawal'} ${status}`,
        message: `Your ${reqType} request of ৳${reqAmount} has been ${status}.`,
        type: `payment_${status}`,
        read: false,
        createdAt: serverTimestamp()
      });
      
      await batch.commit();
      toast.success(`${reqType} request ${status}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `payment_requests/${reqId}`);
      toast.error('Failed to process request');
    }
  };

  const handleToggleBlock = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isBlocked: !currentStatus,
        updatedAt: serverTimestamp()
      });
      toast.success(currentStatus ? 'User Unblocked' : 'User Blocked');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  return (
    <div className="pt-6 px-4 pb-20">
      <h2 className="text-2xl font-bold mb-4 text-[#0D47A1] dark:text-blue-400">Admin Panel</h2>
      <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-[20px] mb-8 flex-wrap gap-1.5 ring-1 ring-slate-200 dark:ring-slate-800">
        {[
          { id: 'submissions', label: 'Review', icon: CheckCircle, color: 'text-orange-500' },
          { id: 'requests', label: 'Payments', icon: Wallet, color: 'text-emerald-500' },
          { id: 'jobs', label: 'Jobs', icon: ListChecks, color: 'text-blue-500' },
          { id: 'users', label: 'Users', icon: Users, color: 'text-indigo-500' },
          { id: 'settings', label: 'Configs', icon: Settings, color: 'text-rose-500' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex-1 min-w-[80px] py-2.5 px-2 rounded-[14px] text-[11px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 active:scale-95 ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-slate-800 shadow-md shadow-slate-200 dark:shadow-black/20 text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : 'text-slate-400'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="font-black dark:text-white uppercase tracking-tight text-sm">Pending Reviews ({submissions.filter(s => s.status === 'pending').length})</h3>
          </div>

          {submissions.filter(s => s.status === 'pending').length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-slate-800/40 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-600">
                <CheckCircle className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Inbox Zero! No pending reviews</p>
            </div>
          )}
          
          {submissions.filter(s => s.status === 'pending').map(sub => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={sub.id} 
              className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/[0.03] blur-2xl rounded-full"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800/30">Action Needed</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{new Date(sub.submittedAt?.toDate()).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-black text-lg text-slate-900 dark:text-white leading-tight uppercase italic tracking-tighter">{sub.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                      <User className="w-3 h-3" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{sub.userEmail}</p>
                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                    <p className="text-xs font-black text-blue-600 dark:text-blue-400">৳{sub.reward}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 mb-5">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-200 dark:border-slate-700 pb-2">Proof Submission</p>
                <div className="space-y-2">
                  {sub.proofs.text && <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase">Comment:</span><p className="text-sm font-medium dark:text-slate-200">{sub.proofs.text}</p></div>}
                  {sub.proofs.username && <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase">Username:</span><p className="text-sm font-mono font-bold text-indigo-500">{sub.proofs.username}</p></div>}
                  {sub.proofs.password && <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase">Password:</span><p className="text-sm font-mono font-bold text-rose-500">{sub.proofs.password}</p></div>}
                  {sub.proofs.videoUrl && <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase">Video URL:</span><a href={sub.proofs.videoUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-500 underline truncate">{sub.proofs.videoUrl}</a></div>}
                  {sub.proofs.screenshot && (
                    <div className="pt-2">
                      <a href={sub.proofs.screenshot} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-black text-white bg-slate-900 dark:bg-slate-700 px-4 py-2 rounded-xl hover:scale-[1.02] active:scale-95 transition-all w-fit shadow-md">
                        <Eye className="w-3.5 h-3.5" /> View Proof Image
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => reviewSubmission(sub.id, sub.userId, sub.reward, sub.title, sub.jobType || 'Other', 'approved')} 
                  className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <CheckCircle className="w-4 h-4"/> Approve
                </button>
                <button 
                  onClick={() => reviewSubmission(sub.id, sub.userId, sub.reward, sub.title, sub.jobType || 'Other', 'rejected')} 
                  className="bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] flex justify-center items-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </motion.div>
          ))}
          
          <div className="pt-6">
            <h3 className="font-black dark:text-white uppercase tracking-tight text-xs mb-4 opacity-50 px-1">Recently Reviewed</h3>
            <div className="grid gap-2">
              {submissions.filter(s => s.status !== 'pending').slice(0, 5).map(sub => (
                <div key={sub.id} className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <div className="flex-1 overflow-hidden pr-4">
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate uppercase tracking-tight italic">{sub.title}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">{sub.userEmail}</p>
                  </div>
                  <div className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${sub.status === 'approved' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-rose-100 text-rose-600 border border-rose-200'}`}>
                    {sub.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateJob} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
            <h3 className="font-black text-lg dark:text-white uppercase tracking-tight italic">Create New Task</h3>
            <div className="grid gap-3">
              <input type="text" placeholder="Task Title" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold placeholder:text-slate-400" />
              <textarea placeholder="Job Description / Instructions" required value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold h-24 placeholder:text-slate-400" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1 block">Category</label>
                <select value={newJob.type} onChange={e => setNewJob({...newJob, type: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold">
                  {['Facebook', 'Gmail', 'Instagram', 'Sell Accounts', 'Microjob', 'Typing', 'Watch Ads', 'Other'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1 block">Reward (৳)</label>
                <input type="number" placeholder="0.00" required value={newJob.reward} onChange={e => setNewJob({...newJob, reward: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-black text-blue-600" />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">Appearance & Requirements</p>
              <div className="grid grid-cols-2 gap-2">
                <select value={newJob.icon} onChange={e => setNewJob({...newJob, icon: e.target.value})} className="bg-white dark:bg-slate-800 border-none px-3 py-2 rounded-xl text-xs font-bold shadow-sm">
                  <option value="Facebook">Facebook Profile</option>
                  <option value="Instagram">Instagram Page</option>
                  <option value="Youtube">Youtube Display</option>
                  <option value="Mail">Email / Gmail</option>
                  <option value="Monitor">Computer / Desktop</option>
                  <option value="Smartphone">Mobile Device</option>
                  <option value="Video">Video Player</option>
                  <option value="Copy">Copy Task</option>
                  <option value="Send">Direct Message</option>
                  <option value="Key">Lock / Secure</option>
                  <option value="MessageCircle">Chatting</option>
                  <option value="Heart">Likes / Reaction</option>
                  <option value="Star">Review / Star</option>
                  <option value="User">User Account</option>
                  <option value="Globe">Global Link</option>
                </select>
                <input type="text" placeholder="Icon Color (e.g. text-blue-500)" value={newJob.color} onChange={e => setNewJob({...newJob, color: e.target.value})} className="bg-white dark:bg-slate-800 border-none px-3 py-2 rounded-xl text-xs font-bold shadow-sm" />
              </div>
            </div>

            <div className="grid gap-3">
              <input type="text" placeholder="Task Redirect Link (Full URL)" required value={newJob.link} onChange={e => setNewJob({...newJob, link: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900/50 border-none px-4 py-3 rounded-2xl text-xs font-bold italic text-blue-500" />
            </div>
            
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Required Proofs To Check</p>
              <div className="flex gap-2 flex-wrap">
                {['text', 'screenshot', 'username', 'password', 'videoUrl'].map(p => (
                  <button 
                    type="button" 
                    key={p} 
                    onClick={() => toggleProof(p)} 
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-90 ${
                      newJob.requiredProofs.includes(p) 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' 
                      : 'bg-white text-slate-500 border-slate-100 dark:bg-slate-800 dark:border-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            
            <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-[0.2em] py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-xs">Publish Job Now</button>
          </form>

          <div className="grid gap-3">
            <h3 className="font-black dark:text-white uppercase tracking-tight text-xs mb-1 px-1 opacity-50">Active Tasks ({jobs.length})</h3>
            {jobs.map(job => (
              <div key={job.id} className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm flex justify-between items-center border border-slate-100 dark:border-slate-700 transition-all hover:border-blue-200">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold dark:text-white truncate uppercase tracking-tight text-sm">{job.title}</h4>
                  <p className="text-[10px] font-black text-blue-500/80 uppercase tracking-widest">৳{job.reward} &bull; {job.type}</p>
                </div>
                <button onClick={() => handleDeleteJob(job.id)} className="p-3 text-rose-500 bg-rose-50 dark:bg-rose-900/30 rounded-2xl hover:scale-105 active:scale-90 transition-all ml-4">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="font-black dark:text-white uppercase tracking-tight text-sm">Payment Queue ({paymentRequests.filter(req => req.status === 'pending').length})</h3>
          </div>

          {paymentRequests.filter(req => req.status === 'pending').length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-slate-800/40 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <CheckCircle className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">All caught up! No requests</p>
            </div>
          )}
          
          {paymentRequests.filter(req => req.status === 'pending').map(req => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={req.id} 
              className={`bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden ring-1 ${
                req.type === 'withdraw' ? 'ring-rose-500/10' : 'ring-emerald-500/10'
              }`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/[0.03] blur-3xl rounded-full"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                      req.type === 'withdraw' 
                      ? 'bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800/30' 
                      : 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800/30'
                    }`}>
                      {req.type}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{new Date(req.createdAt?.toDate()).toLocaleTimeString()}</span>
                  </div>
                  <h4 className="font-black text-2xl text-slate-900 dark:text-white leading-none mt-2">৳{req.amount}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                      <User className="w-3 h-3" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 italic truncate max-w-[180px]">{req.userEmail}</p>
                  </div>
                </div>
                {req.type === 'deposit' && (
                  <div className="bg-indigo-50 dark:bg-indigo-900/40 p-2 rounded-xl text-center ring-1 ring-indigo-200 dark:ring-indigo-800">
                    <p className="text-[8px] font-black uppercase text-indigo-500 tracking-tighter">Gateway</p>
                    <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">{req.method}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 mb-5 text-sm">
                {req.type === 'withdraw' && (
                  <div className="space-y-1">
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5 mb-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Wallet</span>
                      <span className="font-bold uppercase tracking-widest text-[10px] text-blue-500">{req.wallet} Wallet</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Method</span>
                      <span className="font-bold">{req.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Account</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-200 tracking-wider">{req.account}</span>
                    </div>
                  </div>
                )}
                {req.type === 'deposit' && (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Transaction ID</span>
                      <span className="font-mono font-bold text-indigo-600 selection:bg-indigo-100 tracking-wider">{req.trxId}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 mt-1.5 pt-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Recipient</span>
                      <span className="font-bold text-xs">{req.method} Personal</span>
                    </div>
                  </div>
                )}
                {req.type === 'activation' && (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase">TrxID</span>
                      <span className="font-mono font-bold text-emerald-600 tracking-wider">{req.trxId}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handlePaymentRequest(req.id, req.userId, req.amount, req.type, 'approved', req.transactionId, req.wallet)} 
                  className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  Pay Now
                </button>
                <button 
                  onClick={() => handlePaymentRequest(req.id, req.userId, req.amount, req.type, 'rejected', req.transactionId, req.wallet)} 
                  className="bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                >
                  Decline
                </button>
              </div>
            </motion.div>
          ))}
          
          <div className="pt-6">
            <h3 className="font-black dark:text-white uppercase tracking-tight text-xs mb-4 opacity-50 px-1">Payment History</h3>
            <div className="grid gap-2">
              {paymentRequests.filter(req => req.status !== 'pending').slice(0, 5).map(req => (
                <div key={req.id} className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center opacity-70">
                  <div className="flex-1 overflow-hidden pr-4">
                    <p className="font-black text-[13px] text-slate-800 dark:text-slate-200 italic uppercase">৳{req.amount} &bull; {req.type}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold truncate tracking-widest uppercase">{req.userEmail}</p>
                  </div>
                  <div className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-rose-100 text-rose-600 border-rose-200'}`}>
                    {req.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="font-black dark:text-white flex items-center gap-2 uppercase tracking-tight text-sm">
              <Users className="w-4 h-4 text-indigo-500" /> Database Entities ({userList.length})
            </h3>
          </div>
          
          <div className="grid gap-4">
            {userList.map(user => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                key={user.id} 
                className="bg-white dark:bg-slate-800 p-5 rounded-[28px] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-slate-100 dark:bg-slate-700"></div>
                
                <div className="flex-1 pl-2">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-base italic">{user.fullName || 'Anonymous'}</h4>
                    <div className="flex gap-1">
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest border ${user.isBlocked ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-emerald-100 text-emerald-600 border-emerald-200'}`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                      {user.role === 'admin' && (
                        <span className="text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest bg-indigo-100 text-indigo-600 border border-indigo-200">System Admin</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center"><User className="w-2.5 h-2.5" /></div>
                      <p className="text-[11px] font-bold truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center"><Calculator className="w-2.5 h-2.5" /></div>
                      <p className="text-[11px] font-mono font-bold tracking-tighter opacity-80">{user.deviceId || 'ID NOT LINKED'}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Main Balance</p>
                      <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">৳{(user.balances?.main || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Bonus</p>
                      <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">৳{(user.balances?.bonus || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button 
                    onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                    disabled={user.role === 'admin'}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-[0.1em] text-[10px] transition-all active:scale-95 disabled:opacity-30 ${
                      user.isBlocked 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                        : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                    }`}
                  >
                    {user.isBlocked ? (
                      <>
                        <ShieldCheck className="w-4 h-4" /> Grant Access
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4" /> Restrict User
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Popup Settings */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight italic">Popup System</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Global Announcements</p>
              </div>
            </div>
            
            <div className="space-y-4 flex-1">
              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block group-focus-within:text-indigo-500 transition-colors">Announcement Title</label>
                <input type="text" value={popupSettings.title} onChange={(e) => setPopupSettings(prev => ({ ...prev, title: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold placeholder:text-slate-400 ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block group-focus-within:text-indigo-500 transition-colors">Subtitle / Body</label>
                <input type="text" value={popupSettings.subtitle} onChange={(e) => setPopupSettings(prev => ({ ...prev, subtitle: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold placeholder:text-slate-400 ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Telegram Link</label>
                  <input type="text" value={popupSettings.telegramLink} onChange={(e) => setPopupSettings(prev => ({ ...prev, telegramLink: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-xs font-bold ring-1 ring-slate-100 dark:ring-slate-800" />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Skip Link</label>
                  <input type="text" value={popupSettings.skipLink} onChange={(e) => setPopupSettings(prev => ({ ...prev, skipLink: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-xs font-bold ring-1 ring-slate-100 dark:ring-slate-800" />
                </div>
              </div>
            </div>
            
            <button onClick={handleSavePopupSettings} disabled={isSavingSettings} className="mt-6 w-full bg-indigo-600 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-xs flex items-center justify-center gap-2">
              {isSavingSettings ? <><RefreshCw className="w-4 h-4 animate-spin" /> Updating...</> : 'Save Popup'}
            </button>
          </motion.div>

          {/* Site Identity */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight italic">Brand Identity</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Visual Branding</p>
              </div>
            </div>
            
            <div className="space-y-5 flex-1">
              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block group-focus-within:text-emerald-500">Logo (Master Asset)</label>
                <div className="flex gap-2">
                  <input type="text" value={siteSettings.logoUrl} onChange={(e) => setSiteSettings(prev => ({ ...prev, logoUrl: e.target.value }))} className="flex-1 bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-[11px] font-bold ring-1 ring-slate-100 dark:ring-slate-800" />
                  <div className="relative overflow-hidden group">
                    <button type="button" className="bg-slate-100 dark:bg-slate-700 px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-300">Upload</button>
                    <input type="file" accept="image/*" onChange={(e) => handleUploadImage(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
                {siteSettings.logoUrl && <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 inline-block"><img src={siteSettings.logoUrl} alt="Logo Preview" className="h-8 object-contain" /></div>}
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block group-focus-within:text-emerald-500">Favicon (Browser Tab)</label>
                <div className="flex gap-2">
                  <input type="text" value={siteSettings.faviconUrl} onChange={(e) => setSiteSettings(prev => ({ ...prev, faviconUrl: e.target.value }))} className="flex-1 bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-[11px] font-bold ring-1 ring-slate-100 dark:ring-slate-800" />
                  <div className="relative overflow-hidden group">
                    <button type="button" className="bg-slate-100 dark:bg-slate-700 px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-300">Upload</button>
                    <input type="file" accept="image/*" onChange={(e) => handleUploadImage(e, 'favicon')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
            
            <button onClick={handleSaveSiteSettings} disabled={isSavingSettings} className="mt-6 w-full bg-emerald-600 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all text-xs">Update Identity</button>
          </motion.div>

          {/* Support Channels */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight italic">Support Grid</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Contact Config</p>
              </div>
            </div>
            
            <div className="grid gap-4">
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-[20px] ring-1 ring-slate-100 dark:ring-slate-800">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400"><Mail className="w-4 h-4" /></div>
                <input type="email" value={supportSettings.email} onChange={(e) => setSupportSettings(prev => ({ ...prev, email: e.target.value }))} className="bg-transparent border-none p-0 flex-1 text-sm font-bold focus:ring-0" placeholder="Support Email" />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-[20px] ring-1 ring-slate-100 dark:ring-slate-800">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-500"><Smartphone className="w-4 h-4" /></div>
                <input type="text" value={supportSettings.whatsapp} onChange={(e) => setSupportSettings(prev => ({ ...prev, whatsapp: e.target.value }))} className="bg-transparent border-none p-0 flex-1 text-sm font-bold focus:ring-0" placeholder="WhatsApp Link" />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-[20px] ring-1 ring-slate-100 dark:ring-slate-800">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-500"><Send className="w-4 h-4" /></div>
                <input type="text" value={supportSettings.telegram} onChange={(e) => setSupportSettings(prev => ({ ...prev, telegram: e.target.value }))} className="bg-transparent border-none p-0 flex-1 text-sm font-bold focus:ring-0" placeholder="Telegram Link" />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-[20px] ring-1 ring-slate-100 dark:ring-slate-800">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600"><MessageCircle className="w-4 h-4" /></div>
                <input type="text" value={supportSettings.facebook} onChange={(e) => setSupportSettings(prev => ({ ...prev, facebook: e.target.value }))} className="bg-transparent border-none p-0 flex-1 text-sm font-bold focus:ring-0" placeholder="Facebook Profile" />
              </div>
            </div>
            
            <button onClick={handleSaveSupportSettings} disabled={isSavingSettings} className="mt-6 w-full bg-blue-600 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all text-xs">Save Channels</button>
          </motion.div>

          {/* Spin Wheel Settings */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-500">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight italic">Fortune Wheel</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Reward Probability</p>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 flex-1">
              {spinRewards.map((reward, index) => (
                <div key={index} className="group">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter pl-1 mb-1 block">Slice {index + 1}</label>
                  <input
                    type="number"
                    value={reward}
                    onChange={(e) => {
                      const newRewards = [...spinRewards];
                      newRewards[index] = Number(e.target.value);
                      setSpinRewards(newRewards);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none px-1 py-2 rounded-xl text-center font-black text-xs ring-1 ring-slate-100 dark:ring-slate-800"
                  />
                </div>
              ))}
            </div>
            
            <button onClick={handleSaveSpinSettings} disabled={isSavingSettings} className="mt-6 w-full bg-amber-600 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg shadow-amber-600/20 active:scale-95 transition-all text-xs">Sync Rewards</button>
          </motion.div>

          {/* Referral Engine */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight italic">Referral Engine</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Yield Configuration</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(gen => (
                  <div key={gen} className="group">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Gen {gen} (৳)</label>
                    <input 
                      type="number" 
                      value={gen === 1 ? referralSettings.fixedBonus : (gen === 2 ? referralSettings.gen2FixedBonus : referralSettings.gen3FixedBonus)} 
                      onChange={(e) => setReferralSettings(prev => ({ ...prev, [gen === 1 ? 'fixedBonus' : (gen === 2 ? 'gen2FixedBonus' : 'gen3FixedBonus')]: Number(e.target.value) }))} 
                      className="w-full bg-slate-50 dark:bg-slate-900 border-none px-2 py-2.5 rounded-xl text-center text-sm font-black ring-1 ring-slate-100 dark:ring-slate-800" 
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[1, 2, 3].map(gen => (
                  <div key={gen} className="group">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Yield {gen} (%)</label>
                    <input 
                      type="number" 
                      value={gen === 1 ? referralSettings.gen1Percent : (gen === 2 ? referralSettings.gen2Percent : referralSettings.gen3Percent)} 
                      onChange={(e) => setReferralSettings(prev => ({ ...prev, [gen === 1 ? 'gen1Percent' : (gen === 2 ? 'gen2Percent' : 'gen3Percent')]: Number(e.target.value) }))} 
                      className="w-full bg-slate-100 dark:bg-slate-700/50 border-none px-2 py-2.5 rounded-xl text-center text-sm font-black text-orange-500" 
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <button onClick={handleSaveReferralSettings} disabled={isSavingSettings} className="mt-6 w-full bg-orange-600 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg shadow-orange-600/20 active:scale-95 transition-all text-xs">Reload Engine</button>
          </motion.div>

          {/* Announcement Scroller */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-500">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight italic">Global Banner</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Ticker Configuration</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <textarea value={bannerSettings.text} onChange={(e) => setBannerSettings(prev => ({ ...prev, text: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold h-24 ring-1 ring-slate-100 dark:ring-slate-800" placeholder="Marquee News Text..." />
              <input type="text" value={bannerSettings.link} onChange={(e) => setBannerSettings(prev => ({ ...prev, link: e.target.value }))} className="w-full bg-slate-100 dark:bg-slate-900/50 border-none px-4 py-3 rounded-2xl text-xs font-bold text-purple-500 italic" placeholder="Promo Link URL" />
            </div>
            
            <button onClick={handleSaveBannerSettings} disabled={isSavingSettings} className="mt-6 w-full bg-purple-600 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg shadow-purple-600/20 active:scale-95 transition-all text-xs">Update Marquee</button>
          </motion.div>

          {/* Game Gates */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight italic">Game Unlock Logic</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Gatekeeping Rules</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-800">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">Spin Requirements</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-white dark:bg-slate-800 px-3 py-2 rounded-xl shadow-sm">
                    <span className="text-[9px] font-bold text-slate-400">Tasks</span>
                    <input type="number" value={gameSettings.spinTaskReq} onChange={(e) => setGameSettings(prev => ({ ...prev, spinTaskReq: Number(e.target.value) }))} className="w-10 bg-transparent border-none p-0 text-right text-xs font-black" />
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-slate-800 px-3 py-2 rounded-xl shadow-sm">
                    <span className="text-[9px] font-bold text-slate-400">Refers</span>
                    <input type="number" value={gameSettings.spinReferReq} onChange={(e) => setGameSettings(prev => ({ ...prev, spinReferReq: Number(e.target.value) }))} className="w-10 bg-transparent border-none p-0 text-right text-xs font-black" />
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-800">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Math Requirements</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-white dark:bg-slate-800 px-3 py-2 rounded-xl shadow-sm">
                    <span className="text-[9px] font-bold text-slate-400">Tasks</span>
                    <input type="number" value={gameSettings.mathTaskReq} onChange={(e) => setGameSettings(prev => ({ ...prev, mathTaskReq: Number(e.target.value) }))} className="w-10 bg-transparent border-none p-0 text-right text-xs font-black" />
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-slate-800 px-3 py-2 rounded-xl shadow-sm">
                    <span className="text-[9px] font-bold text-slate-400">Refers</span>
                    <input type="number" value={gameSettings.mathReferReq} onChange={(e) => setGameSettings(prev => ({ ...prev, mathReferReq: Number(e.target.value) }))} className="w-10 bg-transparent border-none p-0 text-right text-xs font-black" />
                  </div>
                </div>
              </div>
            </div>
            
            <button onClick={handleSaveGameSettings} disabled={isSavingSettings} className="mt-6 w-full bg-blue-600 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all text-xs italic">Sync Logic</button>
          </motion.div>

          {/* Account Integrity */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-500">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight italic">Account Integrity</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Security Gates</p>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider dark:text-white">Activation Mode</span>
                <select value={activationSettings.mode} onChange={(e) => setActivationSettings(prev => ({ ...prev, mode: e.target.value as 'free'|'paid' }))} className="bg-white dark:bg-slate-800 border-none rounded-xl text-[10px] font-black uppercase ring-1 ring-slate-100 dark:ring-slate-700 py-1.5 px-3">
                  <option value="free">Permissive (Free)</option>
                  <option value="paid">Restrictive (Paid)</option>
                </select>
              </div>
              {activationSettings.mode === 'paid' && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-400">Mandatory Fee</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-cyan-500">৳</span>
                    <input type="number" value={activationSettings.fee} onChange={(e) => setActivationSettings(prev => ({ ...prev, fee: Number(e.target.value) }))} className="w-16 bg-white dark:bg-slate-800 border-none rounded-xl text-center text-sm font-black p-2 ring-1 ring-slate-100 dark:ring-slate-700" />
                  </div>
                </div>
              )}
            </div>
            
            <button onClick={handleSaveActivationSettings} disabled={isSavingSettings} className="mt-6 w-full bg-cyan-600 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg shadow-cyan-600/20 active:scale-95 transition-all text-xs">Lock Configuration</button>
          </motion.div>

          {/* Withdrawal Protocol */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight italic">Payout Protocol</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Financial Limits</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { key: 'Main', min: withdrawSettings.mainMin, fee: withdrawSettings.mainFee, minSetter: 'mainMin', feeSetter: 'mainFee', color: 'text-blue-500' },
                { key: 'Bonus', min: withdrawSettings.bonusMin, fee: withdrawSettings.bonusFee, minSetter: 'bonusMin', feeSetter: 'bonusFee', color: 'text-indigo-500' },
                { key: 'Referral', min: withdrawSettings.referralMin, fee: withdrawSettings.referralFee, minSetter: 'referralMin', feeSetter: 'referralFee', color: 'text-orange-500' },
                { key: 'Tasks', min: withdrawSettings.tasksMin, fee: withdrawSettings.tasksFee, minSetter: 'tasksMin', feeSetter: 'tasksFee', color: 'text-emerald-500' }
              ].map(wallet => (
                <div key={wallet.key} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl flex items-center justify-between ring-1 ring-slate-100 dark:ring-slate-800">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${wallet.color} w-16`}>{wallet.key}</span>
                  <div className="flex-1 flex gap-2 justify-end">
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Min ৳</span>
                      <input type="number" value={wallet.min} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, [wallet.minSetter]: Number(e.target.value) }))} className="w-14 bg-white dark:bg-slate-800 text-[11px] font-black p-1.5 rounded-lg text-center" />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Fee %</span>
                      <input type="number" value={wallet.fee} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, [wallet.feeSetter]: Number(e.target.value) }))} className="w-12 bg-white dark:bg-slate-800 text-[11px] font-black p-1.5 rounded-lg text-center text-rose-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button onClick={handleSaveWithdrawSettings} disabled={isSavingSettings} className="mt-6 w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-xl active:scale-95 transition-all text-xs">Execute Protocol</button>
          </motion.div>

          {/* Deposit Gateways */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight italic">Funding Gateways</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Inbound Channels</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#e2136e] flex items-center justify-center text-white text-[10px] font-black">BKASH</div>
                  <input type="text" value={depositSettings.bkashNumber} onChange={(e) => setDepositSettings(prev => ({ ...prev, bkashNumber: e.target.value }))} className="flex-1 bg-white dark:bg-slate-800 border-none rounded-xl px-3 py-2.5 text-sm font-black tracking-widest text-[#e2136e] ring-1 ring-slate-100 dark:ring-slate-700" placeholder="01XXX-XXXXXX" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#ea232a] flex items-center justify-center text-white text-[10px] font-black">NAGAD</div>
                  <input type="text" value={depositSettings.nagadNumber} onChange={(e) => setDepositSettings(prev => ({ ...prev, nagadNumber: e.target.value }))} className="flex-1 bg-white dark:bg-slate-800 border-none rounded-xl px-3 py-2.5 text-sm font-black tracking-widest text-[#ea232a] ring-1 ring-slate-100 dark:ring-slate-700" placeholder="01XXX-XXXXXX" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Min (৳)</label>
                  <input type="number" value={depositSettings.minDeposit} onChange={(e) => setDepositSettings(prev => ({ ...prev, minDeposit: Number(e.target.value) }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-black" />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Max (৳)</label>
                  <input type="number" value={depositSettings.maxDeposit} onChange={(e) => setDepositSettings(prev => ({ ...prev, maxDeposit: Number(e.target.value) }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-black opacity-50" />
                </div>
              </div>
            </div>
            
            <button onClick={handleSaveDepositSettings} disabled={isSavingSettings} className="mt-6 w-full bg-emerald-600 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all text-xs">Update Gateways</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
