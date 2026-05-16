import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { collection, query, onSnapshot, doc, writeBatch, serverTimestamp, setDoc, orderBy, deleteDoc, increment } from 'firebase/firestore';
import { processReferralCommission } from '../lib/referral';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { Trash2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminPanel() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'jobs' | 'submissions' | 'settings' | 'requests'>('submissions');
  
  const [jobs, setJobs] = useState<any[]>([]);
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

    return () => { unsubJ(); unsubS(); unsubP(); unsubSpin(); unsubReferral(); unsubBanner(); unsubGameSettings(); unsubWithdrawSettings(); unsubDepositSettings(); unsubActivationSettings(); unsubPopupSettings(); unsubSupportSettings(); unsubSiteSettings(); };
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

  return (
    <div className="pt-6 px-4 pb-20">
      <h2 className="text-2xl font-bold mb-4 text-[#0D47A1] dark:text-blue-400">Admin Panel</h2>
      <div className="flex bg-gray-200 dark:bg-slate-800 p-1 rounded-xl mb-6 flex-wrap gap-1">
        <button onClick={() => setActiveTab('submissions')} className={`flex-1 min-w-[70px] py-1 px-1 rounded-lg text-[11px] font-bold transition ${activeTab === 'submissions' ? 'bg-white shadow dark:bg-slate-700 text-[#0D47A1] dark:text-blue-400' : 'text-gray-500'}`}>Submissions</button>
        <button onClick={() => setActiveTab('jobs')} className={`flex-1 min-w-[70px] py-1 px-1 rounded-lg text-[11px] font-bold transition ${activeTab === 'jobs' ? 'bg-white shadow dark:bg-slate-700 text-[#0D47A1] dark:text-blue-400' : 'text-gray-500'}`}>Jobs</button>
        <button onClick={() => setActiveTab('requests')} className={`flex-1 min-w-[70px] py-1 px-1 rounded-lg text-[11px] font-bold transition ${activeTab === 'requests' ? 'bg-white shadow dark:bg-slate-700 text-[#0D47A1] dark:text-blue-400' : 'text-gray-500'}`}>Payments</button>
        <button onClick={() => setActiveTab('settings')} className={`flex-1 min-w-[70px] py-1 px-1 rounded-lg text-[11px] font-bold transition ${activeTab === 'settings' ? 'bg-white shadow dark:bg-slate-700 text-[#0D47A1] dark:text-blue-400' : 'text-gray-500'}`}>Settings</button>
      </div>

      {activeTab === 'jobs' && (
        <div>
          <form onSubmit={handleCreateJob} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-3 mb-6">
            <h3 className="font-bold text-lg dark:text-white">Create New Job</h3>
            <input type="text" placeholder="Title" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded" />
            <textarea placeholder="Description" required value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded" />
            
            <select value={newJob.type} onChange={e => setNewJob({...newJob, type: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded text-sm">
              <option value="Facebook">Facebook</option>
              <option value="Gmail">Gmail</option>
              <option value="Instagram">Instagram</option>
              <option value="Sell Accounts">Sell Accounts</option>
              <option value="Microjob">Microjob</option>
              <option value="Typing">Typing</option>
              <option value="Watch Ads">Watch Ads</option>
              <option value="Other">Other</option>
            </select>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Icon</label>
                <select value={newJob.icon} onChange={e => setNewJob({...newJob, icon: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded text-sm">
                  <option value="Facebook">Facebook (ThumbsUp)</option>
                  <option value="Instagram">Instagram (Camera)</option>
                  <option value="Youtube">Youtube (MonitorPlay)</option>
                  <option value="Mail">Mail</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Smartphone">Smartphone</option>
                  <option value="Video">Video</option>
                  <option value="Copy">Copy</option>
                  <option value="Send">Send</option>
                  <option value="Key">Key</option>
                  <option value="MessageCircle">MessageCircle</option>
                  <option value="Heart">Heart</option>
                  <option value="Star">Star</option>
                  <option value="User">User</option>
                  <option value="Music">Music</option>
                  <option value="Globe">Globe</option>
                  <option value="Twitter">Twitter / X (Hash)</option>
                  <option value="Linkedin">LinkedIn (Briefcase)</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Icon Color Class</label>
                <input type="text" placeholder="e.g. text-blue-500" required value={newJob.color} onChange={e => setNewJob({...newJob, color: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded text-sm" />
              </div>
              <div className="flex-1">
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Bg Color Class</label>
                <input type="text" placeholder="e.g. bg-blue-100" required value={newJob.bg} onChange={e => setNewJob({...newJob, bg: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded text-sm" />
              </div>
            </div>
            
            <input type="text" placeholder="Action Link (e.g., youtube link)" required value={newJob.link} onChange={e => setNewJob({...newJob, link: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded" />
            <input type="number" placeholder="Reward Amount" required value={newJob.reward} onChange={e => setNewJob({...newJob, reward: Number(e.target.value)})} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded" />
            
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Allowed Completions Per User</label>
                <input type="number" required min="0" placeholder="0 for unlimited" value={newJob.allowedCompletions} onChange={e => setNewJob({...newJob, allowedCompletions: Number(e.target.value)})} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded text-sm" />
                <span className="text-[10px] text-gray-400">0 = unlimited</span>
              </div>
              <div className="flex-1">
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Deadline (Optional)</label>
                <input type="date" value={newJob.deadline} onChange={e => setNewJob({...newJob, deadline: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded text-sm" />
              </div>
            </div>
            
            <div className="pt-2">
              <label className="text-sm font-bold dark:text-gray-300">Required Proofs:</label>
              <div className="flex gap-2 flex-wrap mt-2">
                {['text', 'screenshot', 'username', 'password', 'videoUrl'].map(p => (
                  <button type="button" key={p} onClick={() => toggleProof(p)} className={`px-3 py-1 rounded-full text-xs font-bold border ${newJob.requiredProofs.includes(p) ? 'bg-[#0D47A1] text-white' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            
            <button type="submit" className="w-full bg-green-500 text-white font-bold py-2 rounded-xl">Create Job</button>
          </form>

          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm flex justify-between items-center border border-gray-100 dark:border-slate-700">
                <div>
                  <h4 className="font-bold dark:text-white">{job.title}</h4>
                  <p className="text-xs text-gray-500">Reward: ৳{job.reward} | Needs: {job.requiredProofs.join(', ')}</p>
                </div>
                <button onClick={() => handleDeleteJob(job.id)} className="p-2 text-red-500 bg-red-50 rounded-full dark:bg-red-900/30">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="space-y-3">
          {submissions.filter(s => s.status === 'pending').length === 0 && <div className="text-center p-10 dark:text-gray-400">No pending submissions</div>}
          
          {submissions.filter(s => s.status === 'pending').map(sub => (
            <div key={sub.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-orange-200 dark:border-orange-500/30">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold dark:text-white">{sub.title}</h4>
                  <p className="text-xs text-gray-500">{sub.userEmail} &bull; ৳{sub.reward}</p>
                </div>
                <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded font-bold uppercase">Pending</span>
              </div>
              
              <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg text-sm mb-3">
                {sub.proofs.text && <p className="mb-1 dark:text-gray-300"><strong>Text:</strong> {sub.proofs.text}</p>}
                {sub.proofs.username && <p className="mb-1 dark:text-gray-300"><strong>Username:</strong> {sub.proofs.username}</p>}
                {sub.proofs.password && <p className="mb-1 dark:text-gray-300"><strong>Password:</strong> {sub.proofs.password}</p>}
                {sub.proofs.videoUrl && <p className="mb-1 dark:text-gray-300"><strong>Video:</strong> <a href={sub.proofs.videoUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline font-semibold break-all">{sub.proofs.videoUrl}</a></p>}
                {sub.proofs.screenshot && (
                  <a href={sub.proofs.screenshot} target="_blank" rel="noreferrer" className="text-blue-500 underline font-semibold">View Screenshot</a>
                )}
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => reviewSubmission(sub.id, sub.userId, sub.reward, sub.title, sub.jobType || 'Other', 'approved')} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold flex justify-center items-center gap-1">
                  <CheckCircle className="w-4 h-4"/> Approve
                </button>
                <button onClick={() => reviewSubmission(sub.id, sub.userId, sub.reward, sub.title, sub.jobType || 'Other', 'rejected')} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-bold flex justify-center items-center gap-1">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))}
          
          <h3 className="font-bold mt-6 mb-3 dark:text-white">Reviewed History</h3>
          {submissions.filter(s => s.status !== 'pending').slice(0, 10).map(sub => (
            <div key={sub.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center opacity-70">
              <div>
                <p className="font-semibold text-sm dark:text-gray-300">{sub.title}</p>
                <p className="text-[10px] text-gray-500">{sub.userEmail}</p>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${sub.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {sub.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-3">
          {paymentRequests.filter(req => req.status === 'pending').length === 0 && <div className="text-center p-10 dark:text-gray-400">No pending payment requests</div>}
          
          {paymentRequests.filter(req => req.status === 'pending').map(req => (
            <div key={req.id} className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border ${req.type === 'withdraw' ? 'border-red-200 dark:border-red-500/30' : 'border-green-200 dark:border-green-500/30'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold capitalize dark:text-white">{req.type}</h4>
                  <p className="text-xs text-gray-500">{req.userEmail} &bull; ৳{req.amount}</p>
                </div>
                <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded font-bold uppercase">Pending</span>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg text-sm mb-3">
                <p className="mb-1 dark:text-gray-300"><strong>Method:</strong> {req.method}</p>
                {req.type === 'deposit' && <p className="mb-1 dark:text-gray-300"><strong>TrxID:</strong> {req.trxId}</p>}
                {req.type === 'withdraw' && <p className="mb-1 dark:text-gray-300"><strong>Account:</strong> {req.account}</p>}
                {req.type === 'withdraw' && <p className="mb-1 dark:text-gray-300"><strong>From Wallet:</strong> {req.wallet}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handlePaymentRequest(req.id, req.userId, req.amount, req.type, 'approved', req.transactionId, req.wallet)} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold flex justify-center items-center gap-1">
                  <CheckCircle className="w-4 h-4"/> Approve
                </button>
                <button onClick={() => handlePaymentRequest(req.id, req.userId, req.amount, req.type, 'rejected', req.transactionId, req.wallet)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-bold flex justify-center items-center gap-1">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))}

          <h3 className="font-bold mt-6 mb-3 dark:text-white">Recent Payments</h3>
          {paymentRequests.filter(req => req.status !== 'pending').slice(0, 10).map(req => (
            <div key={req.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center opacity-70">
              <div>
                <p className="font-semibold text-sm capitalize dark:text-gray-300">{req.type} &bull; ৳{req.amount}</p>
                <p className="text-[10px] text-gray-500">{req.userEmail}</p>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${req.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {req.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold text-lg mb-4 dark:text-white">Popup Settings</h3>
            <p className="text-xs text-gray-500 mb-4">Configure the popup window shown when users open the app.</p>
            
            <div className="space-y-4 mb-4">
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Popup Title</label>
                <input
                  type="text"
                  value={popupSettings.title}
                  onChange={(e) => setPopupSettings(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded"
                />
              </div>
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Popup Subtitle</label>
                <input
                  type="text"
                  value={popupSettings.subtitle}
                  onChange={(e) => setPopupSettings(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded"
                />
              </div>
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Telegram Button Text</label>
                <input
                  type="text"
                  value={popupSettings.telegramText}
                  onChange={(e) => setPopupSettings(prev => ({ ...prev, telegramText: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded"
                />
              </div>
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Telegram Link</label>
                <input
                  type="text"
                  value={popupSettings.telegramLink}
                  onChange={(e) => setPopupSettings(prev => ({ ...prev, telegramLink: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded"
                />
              </div>
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Skip Button Text</label>
                <input
                  type="text"
                  value={popupSettings.skipText}
                  onChange={(e) => setPopupSettings(prev => ({ ...prev, skipText: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded"
                />
              </div>
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Skip Button Link</label>
                <input
                  type="text"
                  value={popupSettings.skipLink}
                  onChange={(e) => setPopupSettings(prev => ({ ...prev, skipLink: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded"
                />
              </div>
            </div>
            <button
              onClick={handleSavePopupSettings}
              disabled={isSavingSettings}
              className="w-full bg-[#0D47A1] text-white font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {isSavingSettings ? 'Saving...' : 'Save Popup Settings'}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold text-lg mb-4 dark:text-white">Site Settings</h3>
            <p className="text-xs text-gray-500 mb-4">Configure logo and favicon.</p>
            
            <div className="space-y-4 mb-4">
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Logo URL (or Upload)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={siteSettings.logoUrl}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                    className="flex-1 bg-gray-50 dark:bg-slate-700 border p-2 rounded"
                    placeholder="https://example.com/logo.png"
                  />
                  <div className="relative overflow-hidden inline-block">
                    <button type="button" className="bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-500 px-4 py-2 rounded font-bold text-sm h-full">
                      Upload
                    </button>
                    <input type="file" accept="image/*" onChange={(e) => handleUploadImage(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
                {siteSettings.logoUrl && <img src={siteSettings.logoUrl} alt="Logo" className="mt-2 h-10 object-contain" />}
              </div>
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Favicon URL (or Upload)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={siteSettings.faviconUrl}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, faviconUrl: e.target.value }))}
                    className="flex-1 bg-gray-50 dark:bg-slate-700 border p-2 rounded"
                    placeholder="https://example.com/favicon.ico"
                  />
                  <div className="relative overflow-hidden inline-block">
                    <button type="button" className="bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-500 px-4 py-2 rounded font-bold text-sm h-full">
                      Upload
                    </button>
                    <input type="file" accept="image/*" onChange={(e) => handleUploadImage(e, 'favicon')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
                {siteSettings.faviconUrl && <img src={siteSettings.faviconUrl} alt="Favicon" className="mt-2 w-8 h-8 object-contain" />}
              </div>
            </div>
            <button
              onClick={handleSaveSiteSettings}
              disabled={isSavingSettings}
              className="w-full bg-[#0D47A1] text-white font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {isSavingSettings ? 'Saving...' : 'Save Site Settings'}
            </button>
          </div>

          {/* Support Settings */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold text-lg mb-4 dark:text-white">Support Settings</h3>
            <p className="text-xs text-gray-500 mb-4">Configure contact info and links for the Help & Support page.</p>
            
            <div className="space-y-4 mb-4">
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Email Address</label>
                <input
                  type="email"
                  value={supportSettings.email}
                  onChange={(e) => setSupportSettings(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded"
                  placeholder="support@example.com"
                />
              </div>
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">WhatsApp Number/Link</label>
                <input
                  type="text"
                  value={supportSettings.whatsapp}
                  onChange={(e) => setSupportSettings(prev => ({ ...prev, whatsapp: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded"
                  placeholder="https://wa.me/XXXXXXXXXX or Number"
                />
              </div>
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Telegram Link</label>
                <input
                  type="text"
                  value={supportSettings.telegram}
                  onChange={(e) => setSupportSettings(prev => ({ ...prev, telegram: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded"
                  placeholder="https://t.me/yourchannel"
                />
              </div>
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Facebook Page/Group Link</label>
                <input
                  type="text"
                  value={supportSettings.facebook}
                  onChange={(e) => setSupportSettings(prev => ({ ...prev, facebook: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded"
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>
            <button
              onClick={handleSaveSupportSettings}
              disabled={isSavingSettings}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {isSavingSettings ? 'Saving...' : 'Save Support Settings'}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold text-lg mb-4 dark:text-white">Spin Wheel Settings</h3>
            <p className="text-xs text-gray-500 mb-4">Set the 8 reward values for the spin wheel. Use 0 for "Try Again" or "Better Luck Next Time".</p>
            
            <div className="grid grid-cols-4 gap-2 mb-4">
              {spinRewards.map((reward, index) => (
                <div key={index}>
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">Slice {index + 1}</label>
                  <input
                    type="number"
                    value={reward}
                    onChange={(e) => {
                      const newRewards = [...spinRewards];
                      newRewards[index] = Number(e.target.value);
                      setSpinRewards(newRewards);
                    }}
                    className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded text-center font-bold"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveSpinSettings}
              disabled={isSavingSettings}
              className="w-full bg-[#0D47A1] text-white font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {isSavingSettings ? 'Saving...' : 'Save Spin Settings'}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold text-lg mb-4 dark:text-white">Referral Settings</h3>
            
            <div className="space-y-4 mb-4">
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Gen 1 Fixed Bonus (৳)</label>
                <p className="text-[10px] text-gray-400 mb-2">Awarded once upon successful referral sign up / first task</p>
                <input
                  type="number"
                  value={referralSettings.fixedBonus}
                  onChange={(e) => setReferralSettings(prev => ({ ...prev, fixedBonus: Number(e.target.value) }))}
                  className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded font-bold"
                />
              </div>

              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Gen 2 Fixed Bonus (৳)</label>
                <p className="text-[10px] text-gray-400 mb-2">Awarded to gen 2 referrer</p>
                <input
                  type="number"
                  value={referralSettings.gen2FixedBonus}
                  onChange={(e) => setReferralSettings(prev => ({ ...prev, gen2FixedBonus: Number(e.target.value) }))}
                  className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded font-bold"
                />
              </div>

              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Gen 3 Fixed Bonus (৳)</label>
                <p className="text-[10px] text-gray-400 mb-2">Awarded to gen 3 referrer</p>
                <input
                  type="number"
                  value={referralSettings.gen3FixedBonus}
                  onChange={(e) => setReferralSettings(prev => ({ ...prev, gen3FixedBonus: Number(e.target.value) }))}
                  className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded font-bold"
                />
              </div>

              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Gen 1 Commission (%)</label>
                <p className="text-[10px] text-gray-400 mb-2">Direct referrals (people referred directly by the user)</p>
                <input
                  type="number"
                  value={referralSettings.gen1Percent}
                  onChange={(e) => setReferralSettings(prev => ({ ...prev, gen1Percent: Number(e.target.value) }))}
                  className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded font-bold"
                />
              </div>

              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Gen 2 Commission (%)</label>
                <p className="text-[10px] text-gray-400 mb-2">Level 2 referrals</p>
                <input
                  type="number"
                  value={referralSettings.gen2Percent}
                  onChange={(e) => setReferralSettings(prev => ({ ...prev, gen2Percent: Number(e.target.value) }))}
                  className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded font-bold"
                />
              </div>

              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Gen 3 Commission (%)</label>
                <p className="text-[10px] text-gray-400 mb-2">Level 3 referrals</p>
                <input
                  type="number"
                  value={referralSettings.gen3Percent}
                  onChange={(e) => setReferralSettings(prev => ({ ...prev, gen3Percent: Number(e.target.value) }))}
                  className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded font-bold"
                />
              </div>
            </div>

            <button
              onClick={handleSaveReferralSettings}
              disabled={isSavingSettings}
              className="w-full bg-green-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {isSavingSettings ? 'Saving...' : 'Save Referral Settings'}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold text-lg mb-4 dark:text-white">Scrolling Banner Settings</h3>
            
            <div className="space-y-4 mb-4">
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Banner Text</label>
                <input
                  type="text"
                  value={bannerSettings.text}
                  onChange={(e) => setBannerSettings(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Welcome to our app..."
                  className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded font-medium"
                />
              </div>

              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Banner Link (URL)</label>
                <input
                  type="text"
                  value={bannerSettings.link}
                  onChange={(e) => setBannerSettings(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="https://t.me/yourchannel"
                  className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded font-medium"
                />
              </div>
            </div>

            <button
              onClick={handleSaveBannerSettings}
              disabled={isSavingSettings}
              className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {isSavingSettings ? 'Saving...' : 'Save Banner Settings'}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold text-lg mb-4 dark:text-white">Game Unlock Settings</h3>
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] text-gray-500 font-bold block mb-1">Spin Base Task Req</label>
                  <input type="number" value={gameSettings.spinTaskReq} onChange={(e) => setGameSettings(prev => ({ ...prev, spinTaskReq: Number(e.target.value) }))} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded" />
                </div>
                <div>
                  <label className="text-[12px] text-gray-500 font-bold block mb-1">Spin Base Refer Req</label>
                  <input type="number" value={gameSettings.spinReferReq} onChange={(e) => setGameSettings(prev => ({ ...prev, spinReferReq: Number(e.target.value) }))} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] text-gray-500 font-bold block mb-1">Math Base Task Req</label>
                  <input type="number" value={gameSettings.mathTaskReq} onChange={(e) => setGameSettings(prev => ({ ...prev, mathTaskReq: Number(e.target.value) }))} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded" />
                </div>
                <div>
                  <label className="text-[12px] text-gray-500 font-bold block mb-1">Math Base Refer Req</label>
                  <input type="number" value={gameSettings.mathReferReq} onChange={(e) => setGameSettings(prev => ({ ...prev, mathReferReq: Number(e.target.value) }))} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded" />
                </div>
              </div>
            </div>
            <button onClick={handleSaveGameSettings} disabled={isSavingSettings} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">
              {isSavingSettings ? 'Saving...' : 'Save Game Unlock Settings'}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold text-lg mb-4 dark:text-white">Account Activation</h3>
            <div className="space-y-4 mb-4">
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Activation Mode</label>
                <select value={activationSettings.mode} onChange={(e) => setActivationSettings(prev => ({ ...prev, mode: e.target.value as 'free'|'paid' }))} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded text-sm">
                  <option value="free">Free Activation</option>
                  <option value="paid">Paid Activation</option>
                </select>
              </div>
              {activationSettings.mode === 'paid' && (
                <div>
                  <label className="text-[12px] text-gray-500 font-bold block mb-1">Activation Fee (৳)</label>
                  <input type="number" value={activationSettings.fee} onChange={(e) => setActivationSettings(prev => ({ ...prev, fee: Number(e.target.value) }))} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded" />
                </div>
              )}
            </div>
            <button onClick={handleSaveActivationSettings} disabled={isSavingSettings} className="w-full bg-cyan-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">
              {isSavingSettings ? 'Saving...' : 'Save Activation Settings'}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold text-lg mb-4 dark:text-white">Withdrawal Settings</h3>
            <div className="space-y-4 mb-4 grid grid-cols-2 gap-2">
              <div className="col-span-2"><h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">Main Wallet</h4></div>
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Minimum (৳)</label>
                <input type="number" value={withdrawSettings.mainMin} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, mainMin: Number(e.target.value) }))} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded text-sm" />
              </div>
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Fee (%)</label>
                <input type="number" value={withdrawSettings.mainFee} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, mainFee: Number(e.target.value) }))} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded text-sm" />
              </div>

              <div className="col-span-2 mt-2"><h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">Bonus Wallet</h4></div>
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Minimum (৳)</label>
                <input type="number" value={withdrawSettings.bonusMin} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, bonusMin: Number(e.target.value) }))} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded text-sm" />
              </div>
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Fee (%)</label>
                <input type="number" value={withdrawSettings.bonusFee} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, bonusFee: Number(e.target.value) }))} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded text-sm" />
              </div>

              <div className="col-span-2 mt-2"><h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">Referral Wallet</h4></div>
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Minimum (৳)</label>
                <input type="number" value={withdrawSettings.referralMin} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, referralMin: Number(e.target.value) }))} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded text-sm" />
              </div>
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Fee (%)</label>
                <input type="number" value={withdrawSettings.referralFee} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, referralFee: Number(e.target.value) }))} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded text-sm" />
              </div>

              <div className="col-span-2 mt-2"><h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">Tasks Wallets</h4></div>
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Minimum (৳)</label>
                <input type="number" value={withdrawSettings.tasksMin} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, tasksMin: Number(e.target.value) }))} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded text-sm" />
              </div>
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Fee (%)</label>
                <input type="number" value={withdrawSettings.tasksFee} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, tasksFee: Number(e.target.value) }))} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded text-sm" />
              </div>
            </div>
            <button onClick={handleSaveWithdrawSettings} disabled={isSavingSettings} className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">
              {isSavingSettings ? 'Saving...' : 'Save Withdrawal Settings'}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold text-lg mb-4 dark:text-white">Deposit Settings</h3>
            <div className="space-y-4 mb-4">
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">bKash Number</label>
                <input type="text" value={depositSettings.bkashNumber} onChange={(e) => setDepositSettings(prev => ({ ...prev, bkashNumber: e.target.value }))} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded" />
              </div>
              <div>
                <label className="text-[12px] text-gray-500 font-bold block mb-1">Nagad Number</label>
                <input type="text" value={depositSettings.nagadNumber} onChange={(e) => setDepositSettings(prev => ({ ...prev, nagadNumber: e.target.value }))} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[12px] text-gray-500 font-bold block mb-1">Min Deposit</label>
                  <input type="number" value={depositSettings.minDeposit} onChange={(e) => setDepositSettings(prev => ({ ...prev, minDeposit: Number(e.target.value) }))} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded" />
                </div>
                <div className="flex-1">
                  <label className="text-[12px] text-gray-500 font-bold block mb-1">Max Deposit</label>
                  <input type="number" value={depositSettings.maxDeposit} onChange={(e) => setDepositSettings(prev => ({ ...prev, maxDeposit: Number(e.target.value) }))} className="w-full bg-gray-50 dark:bg-slate-700 border p-2 rounded" />
                </div>
              </div>
            </div>
            <button onClick={handleSaveDepositSettings} disabled={isSavingSettings} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">
              {isSavingSettings ? 'Saving...' : 'Save Deposit Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
