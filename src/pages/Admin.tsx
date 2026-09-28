import { sendPushNotification } from '../lib/push';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/AuthProvider';
import { File as FileIcon } from 'lucide-react';
import QRCode from 'react-qr-code';
import { collection, query, onSnapshot, doc, writeBatch, serverTimestamp, setDoc, orderBy, deleteDoc, increment, updateDoc, getDocs, deleteField, getDoc, limit, FieldPath, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { getCachedDoc, getCachedQuery, clearCache } from '../lib/cache';
import { uploadImageOrFallback } from '../lib/imageUpload';
import { processReferralCommission, processRegistrationReferral } from '../lib/referral';
import { Trash2, CheckCircle, XCircle, Users, ShieldAlert, ShieldCheck, Wallet, ListChecks, Settings, User, Eye, Calculator, MessageSquare, Globe, Coins, Megaphone, Gamepad2, CreditCard, Lock, BellRing, RefreshCw, Smartphone, Mail, Camera, MessageCircle, Send, BookOpen, Layers, Copy, HelpCircle, Database, Search, Download, Gift, Sparkles, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function AdminPanel() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'submissions' | 'settings' | 'requests' | 'users' | 'drives' | 'courses' | 'faqs' | 'gifts'>('dashboard');
  
  // Gift Codes States
  const [giftCodes, setGiftCodes] = useState<any[]>([]);
  const [newGiftCode, setNewGiftCode] = useState('');
  const [giftType, setGiftType] = useState<'fixed' | 'random'>('fixed');
  const [giftAmount, setGiftAmount] = useState<number | ''>(10);
  const [giftMinAmount, setGiftMinAmount] = useState<number | ''>(5);
  const [giftMaxAmount, setGiftMaxAmount] = useState<number | ''>(50);
  const [giftMaxUses, setGiftMaxUses] = useState<number | ''>(1);
  const [giftExpiresInHours, setGiftExpiresInHours] = useState<number | ''>(24);
  const [isCreatingGift, setIsCreatingGift] = useState(false);

  // Courses Administration States
  const [adminCourses, setAdminCourses] = useState<any[]>([]);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseThumbnail, setNewCourseThumbnail] = useState('');
  const [newCourseLink, setNewCourseLink] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState<' ' | ' ' | ''>(' ');
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseItems, setCourseItems] = useState<{ title: string; description: string; thumbnailUrl: string; videoLink: string; }[]>([]);
  const [optTitle, setOptTitle] = useState('');
  const [optDesc, setOptDesc] = useState('');
  const [optThumbnail, setOptThumbnail] = useState('');
  const [optLink, setOptLink] = useState('');
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyTarget, setNotifyTarget] = useState<'all' | string>('all');
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionCategory, setSubmissionCategory] = useState<string>('All');
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [spinRewards, setSpinRewards] = useState<number[]>([1, 2, 5, 10, 0, 50, 100, 0]);
  const [referralSettings, setReferralSettings] = useState({ fixedBonus: 5, gen2FixedBonus: 3, gen3FixedBonus: 1, gen1Percent: 0, gen2Percent: 0, gen3Percent: 0 });
  const [bannerSettings, setBannerSettings] = useState({ text: 'Welcome to HMF EARNING ZONE! Complete tasks and earn money daily.', link: '#' });
  const [gameSettings, setGameSettings] = useState({ spinTaskReq: 0, spinReferReq: 0, mathTaskReq: 0, mathReferReq: 0 });
  const [partnerSettings, setPartnerSettings] = useState({ requiredReferrals: 10, dailyBonus: 100, enabled: true, withdrawEnabled: true });
  const [withdrawSettings, setWithdrawSettings] = useState({ mainMin: 50, mainFee: 0, bonusMin: 50, bonusFee: 0, referralMin: 50, referralFee: 0, tasksMin: 50, tasksFee: 0, mainAmounts: "110, 210, 310, 410, 510", bonusAmounts: "110, 210, 310, 410, 510", referralAmounts: "110, 210, 310, 410, 510", tasksAmounts: "110, 210, 310, 410, 510", partnerAmounts: "110, 210, 310, 410, 510", giftAmounts: "110, 210, 310, 410, 510" });
  const [depositSettings, setDepositSettings] = useState({ bkashNumber: '017XX-XXXXXX', nagadNumber: '017XX-XXXXXX', minDeposit: 100, maxDeposit: 25000, bkashEnabled: true, nagadEnabled: true, bkashQrUrl: '', nagadQrUrl: '' });
  const [activationSettings, setActivationSettings] = useState({ mode: 'free', fee: 50 });
  const [supportSettings, setSupportSettings] = useState({ email: 'support@example.com', whatsapp: '', telegram: '', facebook: '' });
  const [popupSettings, setPopupSettings] = useState({ 
    telegramText: 'TOP-UP NOW',
    telegramLink: 'https://rushtopbd.shop', 
    skipText: 'MAYBE LATER', 
    skipLink: '#',
    title: '🎮 RUSH TOP BD — NOW LIVE!',
    subtitle: '🔥 আপনার প্রিয় গেমের Top-Up এখন আরও সহজ!'
  });
  const [siteSettings, setSiteSettings] = useState({ siteName: '', logoUrl: '', telegramUrl: '', apkUrl: 'https://www.mediafire.com/file/glio303il0rsfr4/app-release.apk/file', dailyTaskLimit: 0, driveOffersEnabled: true, coursesEnabled: true, adsViewEnabled: false, reviewsEnabled: true, adsViewLink: '', adsViewText: 'Watch Ads' });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);
  const [settingsSubTab, setSettingsSubTab] = useState<'identity' | 'gateways' | 'rewards' | 'security' | 'danger'>('identity');
  
  const [faqsList, setFaqsList] = useState<{question_en: string; answer_en: string; question_bn: string; answer_bn: string}[]>([]);
  const [newFaq, setNewFaq] = useState({ question_en: '', answer_en: '', question_bn: '', answer_bn: '' });
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);

  const [employeeConfigUser, setEmployeeConfigUser] = useState<any | null>(null);
  const [employeePermissions, setEmployeePermissions] = useState<string[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isPrompt?: boolean;
    promptExpected?: string;
    confirmText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const [promptInput, setPromptInput] = useState('');
  
  const [editingUserBalance, setEditingUserBalance] = useState<{ id: string; fullName: string; main: number; bonus: number; referral: number; partner: number; tasks: number } | null>(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState<{ id: string; fullName: string; email: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  
  
  const saveUserBalance = async () => {
    if (!editingUserBalance) return;
    try {
      await updateDoc(doc(db, "users", editingUserBalance.id), {
        "balances.main": Number(editingUserBalance.main || 0),
        "balances.bonus": Number(editingUserBalance.bonus || 0),
        "balances.referral": Number(editingUserBalance.referral || 0),
        "balances.partner": Number(editingUserBalance.partner || 0),
        "balances.tasks": Number(editingUserBalance.tasks || 0)
      });
      await setDoc(doc(db, "leaderboard", editingUserBalance.id), {
        totalIncome: Number(editingUserBalance.main || 0) + Number(editingUserBalance.bonus || 0) + Number(editingUserBalance.referral || 0) + Number(editingUserBalance.partner || 0) + Number(editingUserBalance.tasks || 0)
      }, { merge: true });
      toast.success("Balances updated!");
      setEditingUserBalance(null);
      loadData(true);
    } catch(err: any) {
      toast.error(err.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changingPasswordUser || !newPassword) return;
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: changingPasswordUser.id, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      toast.success(`Password for ${changingPasswordUser.fullName} updated successfully!`);
      setChangingPasswordUser(null);
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    reward: 3,
    link: '',
    type: 'Facebook',
    icon: 'MessageCircle', // hardcode or select
    color: 'text-blue-500',
    bg: 'bg-blue-100',
    requiredProofs: ['text'] as string[],
    allowedCompletions: 1, // Total job slots
    userLimit: 1, // 0 for unlimited per user, 1 for once, 2 for twice etc
    deadline: '',
    isAccountSell: false,
    todaysPassword: '',
    reviewComments: [] as string[]
  });

  const handleEditJobClick = (job: any) => {
    setNewJob({
      title: job.title || '',
      description: job.description || '',
      reward: job.reward || 0,
      link: job.link || '',
      type: job.type || 'Other',
      icon: job.icon || 'MessageCircle',
      color: job.color || 'text-blue-500',
      bg: job.bg || 'bg-blue-100',
      requiredProofs: job.requiredProofs || ['text'],
      allowedCompletions: job.allowedCompletions || 1,
      userLimit: job.userLimit || 1,
      deadline: job.deadline || '',
      isAccountSell: job.isAccountSell || false,
      todaysPassword: job.todaysPassword || '',
      reviewComments: job.reviewComments || []
    });
    setEditingJobId(job.id);
  };

  const handleCancelEditJob = () => {
    setNewJob({
      title: '', description: '', reward: 3, link: '', type: 'Facebook', icon: 'MessageCircle', color: 'text-blue-500', bg: 'bg-blue-100', requiredProofs: ['text'], allowedCompletions: 1, userLimit: 1, deadline: '', isAccountSell: false, todaysPassword: '', reviewComments: []
    });
    setEditingJobId(null);
  };

  const [newDriveTitle, setNewDriveTitle] = useState('');
  const [newDriveOperator, setNewDriveOperator] = useState('Grameenphone');
  const [newDriveValidity, setNewDriveValidity] = useState('30 Days');
  const [newDriveOriginalPrice, setNewDriveOriginalPrice] = useState('');
  const [newDriveSalePrice, setNewDriveSalePrice] = useState('');
  const [adminOffers, setAdminOffers] = useState<any[]>([]);

  const isFullAdmin = profile?.role === 'admin' || auth.currentUser?.email === 'mdekramhossain590@gmail.com';
  const isEmployee = profile?.role === 'employee';
  const isAdmin = isFullAdmin || isEmployee;
  const userPermissions = profile?.permissions || [];

  const ALL_TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: Calculator, color: 'text-[#FACC15]' },
    { id: 'submissions', label: 'Review', icon: CheckCircle, color: 'text-[#FACC15]' },
    { id: 'requests', label: 'Payments', icon: Wallet, color: 'text-[#FACC15]' },
    { id: 'drives', label: 'Drives', icon: Smartphone, color: 'text-[#FACC15]' },
    { id: 'jobs', label: 'Jobs', icon: ListChecks, color: 'text-[#FACC15]' },
    { id: 'courses', label: 'Courses', icon: BookOpen, color: 'text-[#FACC15]' },
    { id: 'users', label: 'Users', icon: Users, color: 'text-[#FACC15]' },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle, color: 'text-[#FACC15]' },
    { id: 'gifts', label: 'Gifts', icon: Gift, color: 'text-[#FACC15]' },
    { id: 'settings', label: 'Configs', icon: Settings, color: 'text-[#FACC15]' },
    { id: 'migrate', label: 'Migration', icon: Database, color: 'text-[#FACC15]' }
  ];

  const allowedTabs = ALL_TABS.filter(tab => isFullAdmin || userPermissions.includes(tab.id));

  const loadSettings = useCallback(async (forceRef = false) => {
    try {
      const fetchDoc = async (coll: string, docName: string, setFn: (data: any) => void, mapFn?: (data: any) => any) => {
        const s = await getCachedDoc(doc(db, coll, docName), forceRef);
        if (s.exists()) setFn(mapFn ? mapFn(s.data()) : s.data());
      };

      await Promise.all([
        fetchDoc("settings", "spin", d => setSpinRewards(d.rewards || [1, 2, 5, 10, 0, 50, 100, 0])),
        fetchDoc("settings", "referral", d => setReferralSettings({ 
           fixedBonus: d.fixedBonus || 0, gen2FixedBonus: d.gen2FixedBonus || 0, gen3FixedBonus: d.gen3FixedBonus || 0,
           gen1Percent: d.gen1Percent || d.percentageCommission || 0, gen2Percent: d.gen2Percent || 0, gen3Percent: d.gen3Percent || 0
        })),
        fetchDoc("settings", "banner", d => setBannerSettings({ text: d.text || '', link: d.link || '#' })),
        fetchDoc("settings", "partner", d => setPartnerSettings({
           requiredReferrals: d.requiredReferrals !== undefined ? d.requiredReferrals : 10,
           dailyBonus: d.dailyBonus !== undefined ? d.dailyBonus : 100,
           enabled: d.enabled !== false,
           withdrawEnabled: d.withdrawEnabled !== false
        })),
        fetchDoc("settings", "games", d => setGameSettings({ spinTaskReq: d.spinTaskReq || 0, spinReferReq: d.spinReferReq || 0, mathTaskReq: d.mathTaskReq || 0, mathReferReq: d.mathReferReq || 0 })),
        fetchDoc("settings", "withdraw", d => setWithdrawSettings({
           mainMin: d.mainMin !== undefined ? d.mainMin : 50, mainFee: d.mainFee !== undefined ? d.mainFee : 0, bonusMin: d.bonusMin !== undefined ? d.bonusMin : 50, bonusFee: d.bonusFee !== undefined ? d.bonusFee : 0, referralMin: d.referralMin !== undefined ? d.referralMin : 50, referralFee: d.referralFee !== undefined ? d.referralFee : 0, tasksMin: d.tasksMin !== undefined ? d.tasksMin : 50, tasksFee: d.tasksFee !== undefined ? d.tasksFee : 0, mainAmounts: d.mainAmounts || "110, 210, 310, 410, 510", bonusAmounts: d.bonusAmounts || "110, 210, 310, 410, 510", referralAmounts: d.referralAmounts || "110, 210, 310, 410, 510", tasksAmounts: d.tasksAmounts || "110, 210, 310, 410, 510", partnerAmounts: d.partnerAmounts || "110, 210, 310, 410, 510", giftAmounts: d.giftAmounts || "110, 210, 310, 410, 510"
        })),
        fetchDoc("settings", "deposit", d => setDepositSettings({
           bkashNumber: d.bkashNumber || '017XX-XXXXXX', nagadNumber: d.nagadNumber || '017XX-XXXXXX', minDeposit: d.minDeposit !== undefined ? d.minDeposit : 100, maxDeposit: d.maxDeposit !== undefined ? d.maxDeposit : 25000, bkashEnabled: d.bkashEnabled !== false, nagadEnabled: d.nagadEnabled !== false, bkashQrUrl: d.bkashQrUrl || '', nagadQrUrl: d.nagadQrUrl || ''
        })),
        fetchDoc("settings", "popup", d => setPopupSettings({
           telegramText: d.telegramText || 'Join Telegram', telegramLink: d.telegramLink || 'https://t.me/', skipText: d.skipText || 'Skip', skipLink: d.skipLink || '#', title: d.title || 'Welcome!', subtitle: d.subtitle || 'Join our official channel for updates'
        })),
        fetchDoc("settings", "activation", d => setActivationSettings({ mode: d.mode || 'free', fee: d.fee || 50 })),
        fetchDoc("settings", "support", d => setSupportSettings({ email: d.email || 'support@example.com', whatsapp: d.whatsapp || '', telegram: d.telegram || '', facebook: d.facebook || '' })),
        fetchDoc("settings", "site", d => setSiteSettings({
           siteName: d.siteName || '', logoUrl: d.logoUrl || '', telegramUrl: d.telegramUrl || '', apkUrl: d.apkUrl || 'https://www.mediafire.com/file/glio303il0rsfr4/app-release.apk/file', dailyTaskLimit: d.dailyTaskLimit || 0, driveOffersEnabled: d.driveOffersEnabled !== false, coursesEnabled: d.coursesEnabled !== false, adsViewEnabled: d.adsViewEnabled === true, reviewsEnabled: d.reviewsEnabled !== false, adsViewLink: d.adsViewLink || '', adsViewText: d.adsViewText || 'Watch Ads'
        })),
        fetchDoc("settings", "faqs", d => setFaqsList(d.faqs || []))
      ]);
    } catch(err) { console.warn("Error loading settings:", err?.message || "Unknown Error"); }
  }, []);

  const loadData = useCallback(async (forceRef = false) => {
    // Left empty since we will use onSnapshot
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    
    const unsubs: any[] = [];
    const logErr = (err: any) => { toast.error("Firebase Error: " + err?.message); console.error(err?.message || "Firebase Error"); };
    
    if (['jobs', 'submissions', 'dashboard'].includes(activeTab)) {
      unsubs.push(onSnapshot(query(collection(db, "jobs"), limit(100)), (snap) => {
        const sorted = snap.docs.map(d => ({id: d.id, ...d.data()} as any));
        sorted.sort((a, b) => (b.createdAt?.toMillis?.() || b.createdAt?.seconds || 0) - (a.createdAt?.toMillis?.() || a.createdAt?.seconds || 0));
        setJobs(sorted);
      }, logErr));
      unsubs.push(onSnapshot(query(collection(db, "submissions"), limit(100)), (snap) => {
        const sorted = snap.docs.map(d => ({id: d.id, ...d.data()} as any));
        sorted.sort((a, b) => (b.submittedAt?.toMillis?.() || b.submittedAt?.seconds || 0) - (a.submittedAt?.toMillis?.() || a.submittedAt?.seconds || 0));
        setSubmissions(sorted);
      }, logErr));
    }
    
    if (['requests', 'dashboard'].includes(activeTab)) {
      unsubs.push(onSnapshot(query(collection(db, "payment_requests"), limit(100)), (snap) => {
        const sorted = snap.docs.map(d => ({id: d.id, ...d.data()} as any));
        sorted.sort((a, b) => (b.createdAt?.toMillis?.() || b.createdAt?.seconds || 0) - (a.createdAt?.toMillis?.() || a.createdAt?.seconds || 0));
        setPaymentRequests(sorted);
      }, logErr));
    }
    
    if (['users', 'dashboard'].includes(activeTab)) {
      unsubs.push(onSnapshot(query(collection(db, "users"), limit(500)), (snap) => {
        if (!userSearchTerm) {
          const sorted = snap.docs.map(d => ({id: d.id, ...d.data()} as any));
          sorted.sort((a, b) => (b.createdAt?.toMillis?.() || b.createdAt?.seconds || 0) - (a.createdAt?.toMillis?.() || a.createdAt?.seconds || 0));
          setUserList(sorted);
        }
      }, logErr));
    }
    
    if (['drives', 'courses'].includes(activeTab)) {
      unsubs.push(onSnapshot(query(collection(db, "drive_offers"), limit(50)), (snap) => {
        setAdminOffers(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
      }, logErr));
      unsubs.push(onSnapshot(query(collection(db, "courses"), limit(50)), (snap) => {
        setAdminCourses(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
      }, logErr));
    }
    
    if (activeTab === 'gifts') {
      unsubs.push(onSnapshot(query(collection(db, "giftCodes"), orderBy("createdAt", "desc"), limit(100)), (snap) => {
        setGiftCodes(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
      }, logErr));
    }
    
    return () => unsubs.forEach(u => u());
  }, [isAdmin, activeTab]);

  useEffect(() => {
    loadSettings();
    loadData();
  }, [loadSettings, loadData]);


    const handleDeleteDuplicateAdmins = async () => {
    try {
      toast.success("Delete admins started...");
      toast.loading("Finding and deleting accounts...");
      
      
      let deleted = 0;
      let kept = 0;
      
      const adminUsers = userList.filter(u => u.email === "mdekramhossain590@gmail.com");
      
      for (const user of adminUsers) {
        const data = user;
        if (data.myReferCode === "NN743526") {
           kept++;
        } else {
           await deleteDoc(doc(db, "users", user.id)).catch(()=>{});
           await deleteDoc(doc(db, "leaderboard", user.id)).catch(()=>{});
           deleted++;
        }
      }
      
      toast.dismiss();
      toast.success(`Deleted ${deleted} duplicates, kept ${kept} original.`);
          clearCache();
          loadData(true);
    } catch (e: any) {
      toast.error(e.message);
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
      
      // Update favicon immediately (using logo)
      if (siteSettings.logoUrl) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = siteSettings.logoUrl;
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'settings/site');
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
      const cleanedReviewComments = newJob.type === 'Review' && Array.isArray(newJob.reviewComments)
        ? newJob.reviewComments.map(line => line.trim()).filter(line => line !== '')
        : [];

      const jobPayload = {
        ...newJob,
        reviewComments: cleanedReviewComments
      };

      if (editingJobId) {
        const jobRef = doc(db, "jobs", editingJobId);
        await updateDoc(jobRef, {
          ...jobPayload,
          updatedAt: serverTimestamp()
        });
        toast.success('Job updated.');
        setEditingJobId(null);
      } else {
        const jobRef = doc(collection(db, "jobs"));
        await setDoc(jobRef, {
          ...jobPayload,
          postedBy: profile?.fullName || 'Admin',
          status: 'active',
          createdAt: serverTimestamp()
        });
        toast.success('Job created.');
      }
      setNewJob({ title: '', description: '', reward: 3, link: '', type: 'Facebook', icon: 'MessageCircle', color: 'text-blue-500', bg: 'bg-blue-100', requiredProofs: ['text'], allowedCompletions: 1, userLimit: 1, deadline: '', isAccountSell: false, todaysPassword: '', reviewComments: [] });
      await loadData(true);
    } catch (err) {
      handleFirestoreError(err, editingJobId ? OperationType.UPDATE : OperationType.CREATE, 'jobs');
    }
  };
  
  const handleDeleteJob = (jobId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Job',
      message: 'Are you sure you want to delete this job?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "jobs", jobId));
          await loadData(true);
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `jobs/${jobId}`);
        }
      }
    });
  };

  const handleApproveJob = async (jobId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Approve User Job',
      message: 'Are you sure you want to approve this job? It will become active for all users.',
      onConfirm: async () => {
        try {
          const jobRef = doc(db, "jobs", jobId);
          await updateDoc(jobRef, {
            status: 'active',
            updatedAt: serverTimestamp()
          });
          toast.success('User job approved and is now live!');
          clearCache();
          await loadData(true);
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `jobs/${jobId}`);
        }
      }
    });
  };

  const handleRejectJob = async (job: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reject User Job',
      message: `Are you sure you want to reject this job? ${job.totalCost} will be refunded to the user's main balance.`,
      onConfirm: async () => {
        try {
          const batch = writeBatch(db);
          
          // 1. Update job status
          const jobRef = doc(db, "jobs", job.id);
          batch.set(jobRef, {
            status: 'rejected',
            updatedAt: serverTimestamp()
          }, { merge: true });

          // 2. Refund balance
          if (job.postedByUid) {
            const userRef = doc(db, "users", job.postedByUid);
            batch.set(userRef, {
              balances: { main: increment(job.totalCost) }
            }, { merge: true });

            // 3. Create transaction refund log
            const txRef = doc(collection(db, 'users', job.postedByUid, 'transactions'));
            batch.set(txRef, {
              amount: job.totalCost,
              type: 'refund_job',
              status: 'completed',
              createdAt: serverTimestamp(),
              description: `Refund: Job "${job.title}" rejected by admin`
            });
          }

          await batch.commit();
          toast.success('Job rejected and user has been fully refunded.');
          clearCache();
          await loadData(true);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `jobs/${job.id}`);
        }
      }
    });
  };

  const reviewSubmission = (subId: string, userId: string, subReward: number, subTitle: string, jobType: string, jobId: string | undefined, status: 'approved' | 'rejected') => {
    setConfirmDialog({
      isOpen: true,
      title: `${status === 'approved' ? 'Approve' : 'Reject'} Submission`,
      message: `Are you sure you want to ${status.toUpperCase()} this job submission?`,
      onConfirm: async () => {
        try {
          const batch = writeBatch(db);
          const safeReward = Number(subReward || 0);

          const subRef = doc(db, "submissions", subId);
          const subSnap = await getDoc(subRef);
          if (!subSnap.exists()) {
            toast.error("Submission not found. It may have been deleted.");
            return;
          }
          batch.update(subRef, {
            status,
            reviewedAt: serverTimestamp()
          });
          
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);
          const userExists = userSnap.exists();
          
          if (userExists) {
            if (status === 'approved') {
              const safeJobType = (jobType || 'Other').replace(/[.\/#\[\]]/g, '');
              const rewardToAdd = safeReward;

              const updateData: any = {
                totalTasksCompleted: increment(1),
                balances: {
                  tasks: {
                    [safeJobType]: increment(rewardToAdd)
                  }
                }
              };

              if (!jobType) {
                updateData.balances.main = increment(safeReward);
              }
              batch.set(userRef, updateData, { merge: true });
              
              const txRef = doc(collection(db, "users", userId, "transactions"));
              batch.set(txRef, {
                amount: safeReward,
                type: 'task',
                status: 'completed',
                createdAt: serverTimestamp()
              });

              const leaderboardRef = doc(db, "leaderboard", userId);
              batch.set(leaderboardRef, {
                totalIncome: increment(safeReward),
                updatedAt: serverTimestamp()
              }, { merge: true });
              
              const taskHisRef = doc(collection(db, "users", userId, "tasks"));
              batch.set(taskHisRef, {
                title: subTitle,
                reward: safeReward,
                type: jobType || 'Other',
                completedAt: serverTimestamp()
              });
            }

            if (jobId) {
              const jobRef = doc(db, "jobs", jobId);
              const jobSnap = await getDoc(jobRef);
              if (jobSnap.exists()) {
                batch.update(jobRef, {
                  pendingCount: increment(-1),
                  ...(status === 'approved' ? { completedCount: increment(1) } : { remainingCount: increment(1) })
                });
              } else {
                console.warn(`Job ${jobId} not found, skipping job update.`);
              }
            }

            const notifRef = doc(collection(db, "users", userId, "notifications"));
            batch.set(notifRef, {
              title: status === 'approved' ? 'Task Approved' : 'Task Rejected',
              message: `Your submission for "${subTitle}" was ${status}. ${status === 'approved' ? `You earned ${safeReward}!` : ''}`,
              type: status === 'approved' ? 'task_approved' : 'task_rejected',
              read: false,
              createdAt: serverTimestamp()
            });
          } else {
            console.warn(`[Admin] User document users/${userId} does not exist. Skipping balance/notification updates but updating the submission status to ${status}.`);
          }
          
          await batch.commit();

          if (status === 'approved' && userExists) {
            await processReferralCommission(userId, safeReward, `Job: ${subTitle}`);
          }

          toast.success(`Submission ${status}`);
          clearCache();
          await loadData(true);
        } catch (err: any) {
          console.error("Failed to approve/reject task:", err?.message || "Unknown Error");
          handleFirestoreError(err, OperationType.UPDATE, `submissions or batch`);
        }
      }
    });
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

  const handleSavePartnerSettings = async () => {
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "partner"), {
        ...partnerSettings,
        updatedAt: serverTimestamp()
      });
      toast.success('Partner settings saved!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/partner');
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

  const handleSaveActivationSettings = async () => {
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "activation"), {
        ...activationSettings,
        updatedAt: serverTimestamp()
      });
      toast.success('Activation settings saved!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/activation');
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

  const handlePaymentRequest = (reqId: string, reqUserId: string, reqAmount: number, reqType: 'deposit' | 'withdraw' | 'activation', status: 'approved' | 'rejected', txId: string, wallet: string) => {
    setConfirmDialog({
      isOpen: true,
      title: `${status === 'approved' ? 'Approve' : 'Reject'} Request`,
      message: `Are you sure you want to ${status.toUpperCase()} this ${reqType} request?`,
      onConfirm: async () => {
        try {
          const batch = writeBatch(db);
          
          const reqRef = doc(db, "payment_requests", reqId);
          batch.set(reqRef, { status, updatedAt: serverTimestamp() }, { merge: true });
          
          const userRef = doc(db, "users", reqUserId);
          const userSnap = await getDoc(userRef);
          const userExists = userSnap.exists();
          
          if (userExists) {
            if (txId) {
              const txRef = doc(db, "users", reqUserId, "transactions", txId);
              batch.set(txRef, { status, updatedAt: serverTimestamp() }, { merge: true });
            }
            
            if (reqType === 'deposit' && status === 'approved') {
              batch.set(userRef, { balances: { main: increment(reqAmount) } }, { merge: true });
            } else if (reqType === 'withdraw' && status === 'rejected') {
              const updateData: any = { balances: {} };
              if (wallet === 'main') updateData.balances.main = increment(reqAmount);
              else if (wallet === 'bonus') updateData.balances.bonus = increment(reqAmount);
              else if (wallet === 'referral') updateData.balances.referral = increment(reqAmount);
              else if (wallet === 'partner') updateData.balances.partner = increment(reqAmount);
              else updateData.balances.tasks = { [wallet]: increment(reqAmount) };
              
              batch.set(userRef, updateData, { merge: true });
            } else if (reqType === 'activation' && status === 'approved') {
              batch.set(userRef, { isActive: true, 'balances.bonus': increment(10) }, { merge: true });
              const leaderboardRef = doc(db, "leaderboard", reqUserId);
              batch.set(leaderboardRef, { bonus: increment(10), totalIncome: increment(10) }, { merge: true });
            }
            
            const notifRef = doc(collection(db, "users", reqUserId, "notifications"));
            batch.set(notifRef, {
              title: `${reqType === 'deposit' ? 'Deposit' : reqType === 'activation' ? 'Account Activation' : 'Withdrawal'} ${status}`,
              message: `Your ${reqType} request of ${reqAmount} has been ${status}.`,
              type: `payment_${status}`,
              read: false,
              createdAt: serverTimestamp()
            });
          } else {
            console.warn(`[Admin] User document users/${reqUserId} does not exist. Skipping balance/transaction/notification updates but updating the payment request status to ${status}.`);
          }
          
          await batch.commit();

          if (reqType === 'activation' && status === 'approved' && userExists) {
            await processRegistrationReferral(reqUserId);
          }

          toast.success(`${reqType} request ${status}`);
          clearCache();
          await loadData(true);
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `payment_requests/${reqId}`);
          toast.error('Failed to process request');
        }
      }
    });
  };

  
  const handleDeleteGiftCode = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this gift code?")) return;
    try {
      await deleteDoc(doc(db, "giftCodes", id));
      toast.success("Gift code deleted successfully");
      loadData(true);
    } catch (err) {
      toast.error("Failed to delete gift code");
      console.error(err?.message || "Unknown Error");
    }
  };

  const handleCreateGiftCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGiftCode || newGiftCode.length < 5) {
      toast.error('Code must be at least 5 characters');
      return;
    }
    
    try {
      const upperCode = newGiftCode.trim().toUpperCase();
      const codeRef = doc(db, 'giftCodes', upperCode);
      const docSnap = await getDoc(codeRef);
      if (docSnap.exists()) {
        toast.error('This code already exists');
        return;
      }
      
      const now = serverTimestamp();
      let expiresDate = null;
      if (giftExpiresInHours && Number(giftExpiresInHours) > 0) {
        expiresDate = new Date();
        expiresDate.setHours(expiresDate.getHours() + Number(giftExpiresInHours));
      }
      
      await setDoc(codeRef, {
        code: upperCode,
        type: giftType,
        amount: giftType === 'fixed' ? Number(giftAmount) : null,
        minAmount: giftType === 'random' ? Number(giftMinAmount) : null,
        maxAmount: giftType === 'random' ? Number(giftMaxAmount) : null,
        maxUses: giftMaxUses ? Number(giftMaxUses) : 0,
        usedBy: [],
        status: 'active',
        expiresAt: expiresDate,
        createdAt: now,
      });
      
      toast.success('Gift code created successfully');
      setNewGiftCode('');
      loadData(true);
    } catch (err) {
      toast.error('Failed to create gift code');
      console.error(err?.message || "Unknown Error");
    }
  };

const handleToggleBlock = (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'UNBLOCK' : 'BLOCK';
    setConfirmDialog({
      isOpen: true,
      title: `${action} User`,
      message: `Are you sure you want to ${action} this user?`,
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, "users", userId), {
            isBlocked: !currentStatus,
            updatedAt: serverTimestamp()
          });
          toast.success(currentStatus ? 'User Unblocked' : 'User Blocked');
          clearCache();
          await loadData(true);
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
        }
      }
    });
  };

  
  const fixExploit = async () => {
    toast("Fixing exploit in progress... Please wait.");
    console.log("Starting fixExploit");
    try {
      const { db } = await import('../lib/firebase');
      const { collection, getDocs, doc, updateDoc, query, where, getDoc, deleteDoc } = await import('firebase/firestore');
      
      const usersSnap = await getDocs(collection(db, 'users'));
      console.log("Total users fetched:", usersSnap.docs.length);
      toast.success(`Fetched ${usersSnap.docs.length} users. Processing...`);

      let fixedCount = 0;

      for (const userDoc of usersSnap.docs) {
        const data = userDoc.data();
        let spins = data.totalSpinsPlayed || 0;
        let maths = data.totalMathsPlayed || 0;
        
        // Get transactions for everyone to check real counts
        const txSnap = await getDocs(collection(db, `users/${userDoc.id}/transactions`));
        
        let spinTxs = [];
        let mathTxs = [];
        
        txSnap.forEach(tx => {
          const d = tx.data();
          if (d.status === 'approved (spin)') spinTxs.push({ id: tx.id, ...d });
          if (d.status === 'approved (math)') mathTxs.push({ id: tx.id, ...d });
        });
        
        if (spins > 5 || maths > 5 || spinTxs.length > 5 || mathTxs.length > 5) {
          let deduction = 0;
          
          spinTxs.sort((a, b) => ((a.createdAt?.toMillis ? a.createdAt.toMillis() : 0)) - ((b.createdAt?.toMillis ? b.createdAt.toMillis() : 0)));
          mathTxs.sort((a, b) => ((a.createdAt?.toMillis ? a.createdAt.toMillis() : 0)) - ((b.createdAt?.toMillis ? b.createdAt.toMillis() : 0)));
          
          const extraSpins = spinTxs.slice(5);
          const extraMaths = mathTxs.slice(5);
          
          for (const tx of extraSpins) {
            deduction += Number(tx.amount || 0);
            await deleteDoc(doc(db, `users/${userDoc.id}/transactions`, tx.id));
          }
          
          for (const tx of extraMaths) {
            deduction += Number(tx.amount || 0);
            await deleteDoc(doc(db, `users/${userDoc.id}/transactions`, tx.id));
          }
          
          if (deduction > 0 || spins > 5 || maths > 5) {
             let currentBonus = Number(data.balances?.bonus || 0);
             let currentMain = Number(data.balances?.main || 0);
             
             if (currentBonus >= deduction) {
                 currentBonus -= deduction;
             } else {
                 let remainder = deduction - currentBonus;
                 currentBonus = 0;
                 currentMain = Math.max(0, currentMain - remainder);
             }
             
             await updateDoc(doc(db, 'users', userDoc.id), {
               'balances.bonus': currentBonus,
               'balances.main': currentMain,
               'totalSpinsPlayed': Math.min(5, spins, spinTxs.length),
               'totalMathsPlayed': Math.min(5, maths, mathTxs.length)
             });
             
             // Update leaderboard
             const lbDoc = await getDoc(doc(db, 'leaderboard', userDoc.id));
             if (lbDoc.exists()) {
                const currentIncome = Number(lbDoc.data().totalIncome || 0);
                await updateDoc(doc(db, 'leaderboard', userDoc.id), {
                   totalIncome: Math.max(0, currentIncome - deduction),
                   bonus: currentBonus
                });
             }
          }
          fixedCount++;
        }
      }
      toast.success(`Fixed exploit for ${fixedCount} users!`);
      loadData(true);
    } catch(err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleActive = (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'DEACTIVATE' : 'ACTIVATE';
    setConfirmDialog({
      isOpen: true,
      title: `${action} User`,
      message: `Are you sure you want to ${action} this user's account?`,
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, "users", userId), {
            isActive: !currentStatus,
            updatedAt: serverTimestamp()
          });
          
          if (!currentStatus) {
            await processRegistrationReferral(userId);
          }
          
          toast.success(currentStatus ? 'User Deactivated' : 'User Activated');
          clearCache();
          await loadData(true);
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
        }
      }
    });
  };

  const handleDeleteUser = (userId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete User Document',
      message: 'Are you sure you want to delete this user? This will permanently wipe their user document.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "users", userId));
          await deleteDoc(doc(db, "leaderboard", userId)).catch(() => {});
          toast.success('User deleted successfully');
          clearCache();
          await loadData(true);
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
        }
      }
    });
  };

  // Helper to wipe user subcollections (tasks, transactions, etc.) and reset balance to clean 0
  const wipeUserSubcollectionsAndResetBalance = async (uid: string, userEmail: string) => {
    const userSubs = ["tasks", "mathHistory", "transactions", "referrals", "notifications"];
    for (const s of userSubs) {
      try {
        const subQs = await getDocs(collection(db, `users/${uid}/${s}`));
        if (!subQs.empty) {
          let b = writeBatch(db);
          let count = 0;
          for (const subDoc of subQs.docs) {
            b.delete(subDoc.ref);
            count++;
            if (count % 400 === 0) {
              await b.commit();
              b = writeBatch(db);
            }
          }
          if (count % 400 !== 0) {
            await b.commit();
          }
        }
      } catch (err) {
        console.warn(`Failed wiping subcollection ${s} for ${uid}:`, err);
      }
    }

    // Delete any submissions created by this uid
    try {
      const mySubmissionsQs = await getDocs(query(collection(db, "submissions"), where("userId", "==", uid)));
      if (!mySubmissionsQs.empty) {
        let b = writeBatch(db);
        mySubmissionsQs.docs.forEach((d) => b.delete(d.ref));
        await b.commit();
      }
    } catch (subErr) {
      console.warn("Failed wiping user submissions:", subErr);
    }

    // Preserve or generate myReferCode
    let referCodeToKeep = profile?.myReferCode;
    try {
      const uSnap = await getDoc(doc(db, "users", uid));
      if (uSnap.exists() && uSnap.data().myReferCode) {
        referCodeToKeep = uSnap.data().myReferCode;
      }
    } catch (e: any) {}
    if (!referCodeToKeep || !/^[A-Z]{2}[0-9]{6}$/.test(referCodeToKeep)) {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numbers = '0123456789';
      let prefix = '';
      const name = profile?.fullName || profile?.name || 'HE';
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2 && parts[0][0] && parts[1][0] && /[a-zA-Z]/.test(parts[0][0]) && /[a-zA-Z]/.test(parts[1][0])) {
        prefix = (parts[0][0] + parts[1][0]).toUpperCase();
      } else {
        for (let i = 0; i < 2; i++) {
          prefix += letters.charAt(Math.floor(Math.random() * letters.length));
        }
      }
      let digits = '';
      for (let i = 0; i < 6; i++) {
        digits += numbers.charAt(Math.floor(Math.random() * numbers.length));
      }
      referCodeToKeep = `${prefix}${digits}`;
    }

    // Reset user doc balance and stats to strictly 0 (no merge: true, so no old residual map properties remain)
    await setDoc(doc(db, "users", uid), {
      email: userEmail,
      role: 'admin',
      fullName: profile?.fullName || profile?.name || 'Administrator',
      name: profile?.name || profile?.fullName || 'Administrator',
      myReferCode: referCodeToKeep,
      balance: 0,
      balances: {
        main: 0,
        bonus: 0,
        referral: 0,
        partner: 0,
        tasks: 0,
        gift: 0
      },
      totalIncome: 0,
      bonus: 0,
      approvedTasks: 0,
      rejectedTasks: 0,
      totalTasksCompleted: 0,
      totalReferrals: 0,
      totalSpinsPlayed: 0,
      totalMathsPlayed: 0,
      partnerReferrals: 0,
      isActive: true,
      phone: profile?.phone || '',
      deviceId: profile?.deviceId || '',
      updatedAt: serverTimestamp()
    });

    await setDoc(doc(db, "leaderboard", uid), {
      fullName: profile?.fullName || profile?.name || 'Administrator',
      totalIncome: 0,
      bonus: 0,
      updatedAt: serverTimestamp()
    });
  };

  // Master Factory Reset & Wipe - ALL-IN-ONE: ব্যালেন্স ০, ডাটা ওয়াইপ, সেটিংস ও কনফিগ রিসেট (শুধুমাত্র সুপার অ্যাডমিন)
  const handleMasterFactoryReset = () => {
    if (!isFullAdmin) {
      toast.error("রিসেট করার কোনো অনুমতি আপনার নেই! শুধুমাত্র প্রধান সুপার অ্যাডমিন এটি করতে পারবেন।");
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'মাস্টার ফ্যাক্টরি রিসেট ও ফুল ডাটা ওয়াইপ (Master Factory Reset)',
      message: 'আপনি কি নিশ্চিত যে সম্পূর্ণ সিস্টেম ফ্যাক্টরি রিসেট করতে চান? এতে এক ক্লিকেই:\n১. আপনার অ্যাডমিন ব্যালেন্স ও ইনকাম নিশ্চিতভাবে ৳ 0.00 হবে এবং রিসেন্ট হিস্ট্রি সম্পূর্ণ খালি হবে।\n২. সমস্ত টেস্ট ইউজার, কাজ (Jobs), সাবমিশন, পেমেন্ট রিকোয়েস্ট, ড্রাইভ, কোর্স ও ট্রানজেকশন মুছে যাবে।\n৩. সমস্ত সেটিংস ও কনফিগ (সাইট, বিকাশ/নগদ গেটওয়ে, রেফারেল, স্পিন, উইথড্র নোটিশ ইত্যাদি) ব্র্যান্ড নিউ অফিশিয়াল ডিফল্টে রিসেট হবে।\n৪. ৩টি রিয়েল স্টার্টার মাইক্রোটাস্ক ফ্রেশভাবে তৈরি হবে।',
      isPrompt: true,
      promptExpected: 'RESET',
      confirmText: 'মাস্টার রিসেট করুন',
      isDanger: true,
      onConfirm: async () => {
        try {
          toast.loading("১/৪: ডাটাবেজের সমস্ত কাজ, সাবমিশন ও ট্রানজেকশন মুছে ফেলা হচ্ছে...", { id: "master_reset" });
          setIsSavingSettings(true);

          const adminEmail = profile?.email || auth.currentUser?.email || 'mdekramhossain590@gmail.com';
          const currentUid = auth.currentUser?.uid;

          // Helper to delete collection in atomic batches
          const cleanCol = async (collPath: string) => {
            try {
              const qs = await getDocs(collection(db, collPath));
              if (qs.empty) return;
              let batch = writeBatch(db);
              let count = 0;
              for (const docSnap of qs.docs) {
                batch.delete(docSnap.ref);
                count++;
                if (count % 400 === 0) {
                  await batch.commit();
                  batch = writeBatch(db);
                }
              }
              if (count % 400 !== 0) {
                await batch.commit();
              }
            } catch (err: any) {
              console.warn(`Error cleaning collection ${collPath}:`, err?.message || err);
            }
          };

          // 1. Wipe all operational collections
          await cleanCol("jobs");
          await cleanCol("submissions");
          await cleanCol("payment_requests");
          await cleanCol("drive_offers");
          await cleanCol("courses");
          await cleanCol("giftCodes");
          await cleanCol("ad_views");
          await cleanCol("reports");
          await cleanCol("leaderboard");
          await cleanCol("notifications");

          toast.loading("২/৪: টেস্ট ইউজার ডিলিট এবং ব্যালেন্স ০.০০ করা হচ্ছে...", { id: "master_reset" });

          // 2. Wipe non-admin users and their subcollections
          const uQs = await getDocs(collection(db, "users"));
          let userBatch = writeBatch(db);
          let userBatchCount = 0;

          for (const uDoc of uQs.docs) {
            const uData = uDoc.data();
            const uid = uDoc.id;
            const isAdmin = uData.role === 'admin' || uData.email === adminEmail || uid === currentUid;

            if (!isAdmin) {
              const userSubs = ["tasks", "mathHistory", "transactions", "referrals", "notifications"];
              for (const s of userSubs) {
                try {
                  const subQs = await getDocs(collection(db, `users/${uid}/${s}`));
                  for (const subDoc of subQs.docs) {
                    userBatch.delete(subDoc.ref);
                    userBatchCount++;
                    if (userBatchCount % 400 === 0) {
                      await userBatch.commit();
                      userBatch = writeBatch(db);
                    }
                  }
                } catch (subErr) {
                  console.warn(`Subcollection delete failed for users/${uid}/${s}:`, subErr);
                }
              }
              userBatch.delete(doc(db, "users", uid));
              userBatchCount++;
              if (userBatchCount % 400 === 0) {
                await userBatch.commit();
                userBatch = writeBatch(db);
              }
            }
          }

          if (userBatchCount % 400 !== 0) {
            await userBatch.commit();
          }

          // 3. For ALL admin accounts (especially currentUid), completely wipe subcollections and reset balance to clean 0
          for (const uDoc of uQs.docs) {
            const uData = uDoc.data();
            const uid = uDoc.id;
            const isAdmin = uData.role === 'admin' || uData.email === adminEmail || uid === currentUid;
            if (isAdmin) {
              await wipeUserSubcollectionsAndResetBalance(uid, uData.email || adminEmail);
            }
          }
          if (currentUid && !uQs.docs.some(d => d.id === currentUid)) {
            await wipeUserSubcollectionsAndResetBalance(currentUid, adminEmail);
          }

          toast.loading("৩/৪: সমস্ত সেটিংস ও কনফিগ অফিশিয়াল ডিফল্টে রিসেট হচ্ছে...", { id: "master_reset" });

          // Reset ALL settings & configs to brand-new official defaults
          await setDoc(doc(db, "settings", "site"), {
            siteName: "HMF EARNING ZONE",
            logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
            telegramUrl: "https://t.me/hmfincome",
            dailyTaskLimit: 0,
            driveOffersEnabled: true,
            coursesEnabled: true,
            rechargeEnabled: true,
            adsViewEnabled: true,
            reviewsEnabled: true,
            apkUrl: "https://www.mediafire.com/file/glio303il0rsfr4/app-release.apk/file",
            updatedAt: serverTimestamp()
          });

          await setDoc(doc(db, "settings", "deposit"), {
            bkashNumber: "01700000000",
            bkashEnabled: true,
            nagadNumber: "01800000000",
            nagadEnabled: true,
            rocketNumber: "01900000000",
            rocketEnabled: true,
            minDeposit: 50,
            maxDeposit: 10000,
            depositNotice: "বিকাশ বা নগদ পার্সোনাল নাম্বারে Send Money করুন এবং ট্রানজেকশন আইডি (TrxID) নিচে সাবমিট করুন।"
          });

          await setDoc(doc(db, "settings", "withdraw"), {
            minWithdraw: 50,
            maxWithdraw: 5000,
            withdrawNotice: "প্রতিদিন সকাল ৯টা থেকে রাত ১০টা পর্যন্ত উইথড্র রিকোয়েস্ট গ্রহণ করা হয়। ১-২৪ ঘণ্টার মধ্যে পেমেন্ট সম্পন্ন হবে।",
            presetAmounts: [50, 100, 200, 300, 500, 1000],
            methods: ["bKash", "Nagad", "Rocket", "Recharge"]
          });

          await setDoc(doc(db, "settings", "spin"), {
            rewards: [1, 2, 5, 10, 0, 20, 50, 0],
            dailyLimit: 5,
            cost: 0
          });

          await setDoc(doc(db, "settings", "games"), {
            mathQuizReward: 1,
            dailyMathLimit: 10
          });

          await setDoc(doc(db, "settings", "referral"), {
            tier1: 5,
            tier2: 3,
            tier3: 1,
            signupBonus: 50
          });

          await setDoc(doc(db, "settings", "partner"), {
            requiredReferrals: 10,
            dailyBonus: 20,
            withdrawEnabled: true
          });

          await setDoc(doc(db, "settings", "activation"), {
            fee: 0,
            enabled: false
          });

          await setDoc(doc(db, "settings", "popup"), {
            enabled: true,
            title: "🎮 RUSH TOP BD — NOW LIVE!",
            subtitle: "🔥 আপনার প্রিয় গেমের Top-Up এখন আরও সহজ!",
            telegramText: "TOP-UP NOW",
            telegramLink: "https://rushtopbd.shop",
            skipText: "MAYBE LATER",
            skipLink: "#"
          });

          await setDoc(doc(db, "settings", "banner"), {
            enabled: true,
            text: "🔥 স্বাগতম HMF EARNING ZONE-এ! প্রতিদিন মাইক্রো টাস্ক ও স্পিন করে আয় করুন।"
          });

          await setDoc(doc(db, "settings", "support"), {
            telegramUrl: "https://t.me/hmfincome",
            whatsappNumber: "01700000000",
            email: "support@hmfearningzone.com",
            notice: "যেকোনো সাহায্য বা পেমেন্ট সমস্যার জন্য আমাদের টেলিগ্রাম বা হোয়াটসঅ্যাপে যোগাযোগ করুন।"
          });

          await setDoc(doc(db, "settings", "faqs"), {
            faqs: [
              {
                question_bn: "কিভাবে কাজ করে আয় করব?",
                answer_bn: "টাস্ক মেন্যুতে গিয়ে বিভিন্ন সহজ মাইক্রো-টাস্ক (টেলিগ্রাম জয়েন, ইউটিউব সাবস্ক্রাইব ইত্যাদি) নিয়ম মেনে সম্পন্ন করে স্ক্রিনশট প্রুফ জমা দিন। অ্যাডমিন ভেরিফাই করলে আপনার একাউন্টে টাকা যোগ হবে।",
                question_en: "How to earn money from tasks?",
                answer_en: "Go to the Tasks section, complete micro-tasks as instructed, and submit proof screenshots. Once verified by admin, reward will be credited."
              },
              {
                question_bn: "কিভাবে টাকা উইথড্র করব?",
                answer_bn: "ওয়ালেট অপশনে গিয়ে 'উইথড্র' বাটনে চাপ দিন। আপনার বিকাশ, নগদ বা রকেট নাম্বার এবং কাঙ্ক্ষিত পরিমাণ লিখে সাবমিট করুন।",
                question_en: "How to withdraw earnings?",
                answer_en: "Visit the Wallet page, click Withdraw, choose your preferred payment method (bKash/Nagad/Rocket), enter amount and account number."
              },
              {
                question_bn: "রেফারেল বোনাস কিভাবে পাওয়া যায়?",
                answer_bn: "আপনার নিজস্ব রেফার কোড দিয়ে বন্ধুদের সাইন আপ করান। তারা জয়েন করলে সাথে সাথে আপনি ৩ জেনারেশন রেফার বোনাস পাবেন।",
                question_en: "How does the referral bonus work?",
                answer_en: "Share your referral link with friends. You will earn multi-tier bonuses when they sign up and complete activities."
              },
              {
                question_bn: "স্পিন ও কুইজ খেলে কি সত্যি আয় হয়?",
                answer_bn: "হ্যাঁ! প্রতিদিন আপনি নির্দিষ্ট সংখ্যক ফ্রি স্পিন ও সহজ গণিত কুইজ খেলে সরাসরি বোনাস ব্যালেন্স আয় করতে পারবেন।",
                question_en: "Can I earn from Spin and Math Quiz?",
                answer_en: "Yes! Every day you can play free lucky spins and solve simple math quizzes to earn bonus balance directly."
              }
            ]
          });

          await setDoc(doc(db, "admin", "stats"), {
            totalUsers: 1,
            totalPaid: 0,
            tasksCompleted: 0,
            activeJobs: 3
          });

          toast.loading("৪/৪: স্টার্টার মাইক্রোটাস্ক তৈরি এবং লোকাল ক্যাশ ক্লিয়ার হচ্ছে...", { id: "master_reset" });

          // Seed 3 clean starter jobs
          const starterJobs = [
            {
              id: "job_starter_telegram",
              title: "Telegram অফিসিয়াল চ্যানেলে জয়েন করুন",
              description: "আমাদের অফিশিয়াল টেলিগ্রাম চ্যানেলে জয়েন করে একটিভ থাকুন এবং প্রতিদিনের নতুন কাজ ও পেমেন্ট প্রুফ সবার আগে পান।",
              category: "Telegram",
              type: "Telegram",
              reward: 3.00,
              capacity: 1000,
              completedCount: 0,
              proofRequirement: "আপনার টেলিগ্রাম ইউজারনেম (@username) এবং চ্যানেলে জয়েন করার স্ক্রিনশট দিন।",
              requiredProofs: ["screenshot", "text"],
              link: "https://t.me/hmfincome",
              status: "active",
              createdAt: serverTimestamp(),
              postedBy: "Admin"
            },
            {
              id: "job_starter_youtube",
              title: "YouTube ভিডিও দেখুন ও চ্যানেল সাবস্ক্রাইব করুন",
              description: "প্রদত্ত লিংকে গিয়ে সম্পূর্ণ ভিডিওটি মনোযোগ সহকারে দেখুন, একটি লাইক দিন এবং চ্যানেলটি সাবস্ক্রাইব করে বেল আইকন প্রেস করুন।",
              category: "YouTube",
              type: "YouTube",
              reward: 4.00,
              capacity: 1000,
              completedCount: 0,
              proofRequirement: "ভিডিওতে লাইক ও সাবস্ক্রাইব করার প্রমাণস্বরূপ ফুল স্ক্রিনশট সাবমিট করুন।",
              requiredProofs: ["screenshot"],
              link: "https://youtube.com",
              status: "active",
              createdAt: serverTimestamp(),
              postedBy: "Admin"
            },
            {
              id: "job_starter_facebook",
              title: "Facebook অফিসিয়াল পেজ ফলো ও লাইক",
              description: "আমাদের ফেসবুক অফিশিয়াল পেজটিতে লাইক ও ফলো দিন। পেজের পিন পোস্টে একটি সুন্দর কমেন্ট করুন।",
              category: "Facebook",
              type: "Facebook",
              reward: 3.00,
              capacity: 1000,
              completedCount: 0,
              proofRequirement: "আপনার ফেসবুক আইডির নাম এবং পেজ ফলো করার স্ক্রিনশট আপলোড করুন।",
              requiredProofs: ["screenshot", "text"],
              link: "https://facebook.com",
              status: "active",
              createdAt: serverTimestamp(),
              postedBy: "Admin"
            }
          ];

          for (const j of starterJobs) {
            await setDoc(doc(db, "jobs", j.id), j);
          }

          // Clear local cache & localStorage completely
          clearCache();
          try {
            localStorage.clear();
          } catch (e) {}

          toast.success("অভিনন্দন! সম্পূর্ণ সিস্টেম সফলভাবে ফ্যাক্টরি রিসেট হয়েছে, ব্যালেন্স ৳ 0.00 করা হয়েছে!", { id: "master_reset", duration: 5000 });
          setTimeout(() => {
            window.location.reload();
          }, 1000);

        } catch (err: any) {
          console.error("Error during master factory reset:", err);
          toast.error("রিসেট করতে ত্রুটি: " + (err?.message || "Unknown Error"), { id: "master_reset" });
        } finally {
          setIsSavingSettings(false);
        }
      }
    });
  };

  // Backward-compatible aliases pointing to the unified master reset
  const handleResetMyBalanceAndActivity = handleMasterFactoryReset;
  const handleWipeData = handleMasterFactoryReset;
  const handleFreshSetup = handleMasterFactoryReset;

  const handleSaveEmployeeConfig = async () => {
    if (!employeeConfigUser) return;
    try {
      const userRef = doc(db, "users", employeeConfigUser.id);
      if (employeePermissions.length > 0) {
        await updateDoc(userRef, {
          role: 'employee',
          permissions: employeePermissions,
          updatedAt: serverTimestamp()
        });
        toast.success(`User set as Employee Admin`);
      } else {
        await updateDoc(userRef, {
          role: 'user',
          permissions: deleteField(),
          updatedAt: serverTimestamp()
        });
        toast.success(`Removed Employee privileges`);
      }
      setEmployeeConfigUser(null);
    } catch (err: any) {
      console.error("Employee Config Error:", err?.message || "Unknown Error");
      toast.error("Failed to update employee roles: " + (err.message || 'Unknown error'));
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading("Uploading image...", { id: "upload_img" });
      const url = await uploadImageOrFallback(file, 400);
      if (target === 'logo') {
        setSiteSettings(prev => ({ ...prev, logoUrl: url }));
      }
      toast.success("Image uploaded successfully!", { id: "upload_img" });
    } catch (err: any) {
      toast.error("Upload failed: " + (err?.message || "Unknown error"), { id: "upload_img" });
    } finally {
      e.target.value = '';
    }
  };

  const handleSaveFaqs = async (updatedFaqs: any[]) => {
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "faqs"), {
        faqs: updatedFaqs,
        updatedAt: serverTimestamp()
      });
      toast.success('FAQs updated!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/faqs');
    } finally {
      setIsSavingSettings(false);
      setNewFaq({ question_en: '', answer_en: '', question_bn: '', answer_bn: '' });
      setEditingFaqIndex(null);
    }
  };

  const handleDownloadAccounts = () => {
    const categorySubmissions = submissions.filter(s => s.status === 'pending' && (s.jobType || 'Other') === submissionCategory);
    if (categorySubmissions.length === 0) {
      toast.error("No pending submissions to export.");
      return;
    }

    let csvContent = "\uFEFF"; // BOM for UTF-8 Excel support
    csvContent += "Username,Password,2FA\n";
    let count = 0;
    
    categorySubmissions.forEach(sub => {
      if (sub.proofs?.username || sub.proofs?.password) {
        const u = sub.proofs.username ? `"${sub.proofs.username.replace(/"/g, '""')}"` : "";
        const p = sub.proofs.password ? `"${sub.proofs.password.replace(/"/g, '""')}"` : "";
        const t = sub.proofs.twoFactorCode ? `"${sub.proofs.twoFactorCode.replace(/"/g, '""')}"` : "";
        csvContent += `${u},${p},${t}\n`;
        count++;
      }
    });

    if (count === 0) {
      toast.error("No accounts found in these submissions.");
      return;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${submissionCategory}_Accounts.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${count} accounts!`);
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFaqIndex !== null) {
      const updated = [...faqsList];
      updated[editingFaqIndex] = newFaq;
      handleSaveFaqs(updated);
    } else {
      handleSaveFaqs([...faqsList, newFaq]);
    }
  };

  const handleDeleteFaq = (index: number) => {
    if(window.confirm('Are you sure you want to delete this FAQ?')) {
      const updated = faqsList.filter((_, i) => i !== index);
      handleSaveFaqs(updated);
    }
  };


  const handleResetPartnerReferrals = async () => {
    if (!isFullAdmin) {
      toast.error("রিসেট করার কোনো অনুমতি আপনার নেই! শুধুমাত্র প্রধান সুপার অ্যাডমিন এটি করতে পারবেন।");
      return;
    }
    if (!window.confirm("Are you sure you want to reset partner referrals for ALL users? This cannot be undone.")) return;
    setIsSavingSettings(true);
    try {
      const uQs = await getDocs(collection(db, "users"));
      const batch = writeBatch(db);
      let count = 0;
      for (const uDoc of uQs.docs) {
        batch.update(doc(db, "users", uDoc.id), { partnerReferrals: 0 });
        count++;
        if (count % 400 === 0) {
          await batch.commit();
        }
      }
      if (count % 400 !== 0) await batch.commit();
      toast.success("Successfully reset partner referrals for all users!");
    } catch (e: any) {
      toast.error("Failed to reset: " + e.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCancelEditFaq = () => {
    setEditingFaqIndex(null);
    setNewFaq({ question_en: '', answer_en: '', question_bn: '', answer_bn: '' });
  };

  return (
    <div className="pt-6 px-4 pb-20 bg-[#090909] min-h-screen text-white">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#D4A017] via-[#FACC15] to-[#FFE082] bg-clip-text text-transparent">Admin Panel</h2>
        <button
          onClick={async () => {
            const toastId = toast.loading('Syncing latest admin data...');
            try {
              clearCache();
              await Promise.all([
                loadSettings(true),
                loadData(true)
              ]);
              toast.success('Admin data synced fully!', { id: toastId });
            } catch (err) {
              toast.error('Failed to sync admin data', { id: toastId });
            }
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#1C1C1C] hover:bg-[#3D3215]/40 text-[#FACC15] rounded-full font-black text-[10px] uppercase tracking-widest transition-all border border-[#3D3215] active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Live Data
        </button>
      </div>
      <div className="flex bg-[#151515] p-1.5 rounded-[20px] mb-8 flex-wrap gap-1.5 ring-1 ring-[#3D3215] border border-[#3D3215]">
        {allowedTabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => {
              if (tab.id === 'migrate') {
                navigate('/admin/migrate');
              } else {
                setActiveTab(tab.id as any);
              }
            }} 
            className={`flex-1 min-w-[80px] py-2.5 px-2 rounded-[14px] text-[11px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 active:scale-95 ${
              activeTab === tab.id 
                ? 'bg-gradient-to-br from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] shadow-lg shadow-[#D4A017]/20 font-black' 
                : 'text-[#A3A3A3] hover:text-[#FACC15] hover:bg-[#1C1C1C]'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#090909]' : 'text-[#737373]'}`} />
            {tab.label}
          </button>
        ))}
      </div>
      
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-white uppercase tracking-tight text-sm">Financial Overview</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#151515] p-5 rounded-3xl border border-[#3D3215]">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Total Approved Deposits</span>
                <span className="text-3xl font-black text-white">
                  {paymentRequests.filter(r => r.type === 'deposit' && r.status === 'approved').reduce((acc, curr) => acc + Number(curr.amount || 0), 0).toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-[#737373] uppercase">
                  {paymentRequests.filter(r => r.type === 'deposit' && r.status === 'approved').length} Transactions
                </span>
              </div>
            </div>
            
            <div className="bg-[#151515] p-5 rounded-3xl border border-[#3D3215]">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Total Approved Withdrawals</span>
                <span className="text-3xl font-black text-white">
                  {paymentRequests.filter(r => r.type === 'withdraw' && r.status === 'approved').reduce((acc, curr) => acc + Number(curr.amount || 0), 0).toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-[#737373] uppercase">
                  {paymentRequests.filter(r => r.type === 'withdraw' && r.status === 'approved').length} Transactions
                </span>
              </div>
            </div>
            
            <div className="bg-[#151515] p-5 rounded-3xl border border-[#3D3215]">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-[#FACC15] uppercase tracking-widest">Pending Deposits</span>
                <span className="text-3xl font-black text-[#FACC15]">
                  {paymentRequests.filter(r => r.type === 'deposit' && r.status === 'pending').reduce((acc, curr) => acc + Number(curr.amount || 0), 0).toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-[#737373] uppercase">
                  {paymentRequests.filter(r => r.type === 'deposit' && r.status === 'pending').length} Action Required
                </span>
              </div>
            </div>

            <div className="bg-[#151515] p-5 rounded-3xl border border-[#3D3215]">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-[#FFE082] uppercase tracking-widest">Pending Withdrawals</span>
                <span className="text-3xl font-black text-[#FFE082]">
                  {paymentRequests.filter(r => r.type === 'withdraw' && r.status === 'pending').reduce((acc, curr) => acc + Number(curr.amount || 0), 0).toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-[#737373] uppercase">
                  {paymentRequests.filter(r => r.type === 'withdraw' && r.status === 'pending').length} Action Required
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#151515] p-5 rounded-3xl border border-[#3D3215]">
            <h4 className="font-bold text-white mb-4">Recent Transactions Flow</h4>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {paymentRequests.slice(0, 50).map(req => (
                <div key={req.id} className="flex items-center justify-between p-3 bg-[#101010] rounded-2xl border border-[#3D3215]">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      req.type === 'deposit' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20' :
                      req.type === 'withdraw' ? 'bg-rose-900/30 text-rose-400 border border-rose-500/20' :
                      'bg-[#1C1C1C] text-[#FACC15] border border-[#3D3215]'
                    }`}>
                      {req.type === 'deposit' ? '+' : req.type === 'withdraw' ? '-' : <Calculator className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-white capitalize">{req.type}</p>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${
                          req.status === 'approved' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/30' :
                          req.status === 'rejected' ? 'bg-rose-900/40 text-rose-400 border border-rose-500/30' :
                          'bg-[#3D3215]/50 text-[#FACC15] border border-[#D4A017]/30'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#A3A3A3]">{req.method || 'System'}  {new Date(req.createdAt?.toDate()).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className={`font-black text-lg ${req.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {req.type === 'deposit' ? '+' : '-'}{req.amount}
                  </div>
                </div>
              ))}
              {paymentRequests.length === 0 && (
                <p className="text-center text-[#737373] py-4 text-sm font-medium">No transactions found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="font-black text-white uppercase tracking-tight text-sm">Pending Reviews ({submissions.filter(s => s.status === 'pending').length})</h3>
            {submissionCategory !== 'All' && (
              <button 
                onClick={handleDownloadAccounts} 
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Export Accounts
              </button>
            )}
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
             <button onClick={() => setSubmissionCategory('All')} className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${submissionCategory === 'All' ? 'bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] shadow-md' : 'bg-[#151515] border border-[#3D3215] text-[#A3A3A3] hover:text-[#FACC15] hover:bg-[#1C1C1C]'}`}>All ({submissions.filter(s => s.status === 'pending').length})</button>
             {Array.from(new Set(submissions.filter(s => s.status === 'pending').map(s => s.jobType || 'Other'))).map(cat => {
                const catCount = submissions.filter(s => s.status === 'pending' && (s.jobType || 'Other') === cat).length;
                return (
                  <button key={cat} onClick={() => setSubmissionCategory(cat)} className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${submissionCategory === cat ? 'bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] shadow-md' : 'bg-[#151515] border border-[#3D3215] text-[#A3A3A3] hover:text-[#FACC15] hover:bg-[#1C1C1C]'}`}>
                    {cat} ({catCount})
                  </button>
                );
             })}
          </div>

          {submissions.filter(s => s.status === 'pending' && (submissionCategory === 'All' || (s.jobType || 'Other') === submissionCategory)).length === 0 && (
            <div className="text-center py-16 bg-[#151515] rounded-3xl border-2 border-dashed border-[#3D3215]">
              <div className="w-16 h-16 bg-[#1C1C1C] rounded-full flex items-center justify-center mx-auto mb-4 text-[#FACC15] border border-[#3D3215]">
                <CheckCircle className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-[#A3A3A3] uppercase tracking-widest">Inbox Zero! No pending reviews</p>
            </div>
          )}
          
          {submissions.filter(s => s.status === 'pending' && (submissionCategory === 'All' || (s.jobType || 'Other') === submissionCategory)).map(sub => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={sub.id} 
              className="bg-[#151515] p-5 rounded-3xl shadow-sm border border-[#3D3215] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FACC15]/[0.05] blur-2xl rounded-full"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FACC15] bg-[#3D3215]/40 px-2 py-0.5 rounded-full border border-[#D4A017]/40">Action Needed</span>
                    <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest">{new Date(sub.submittedAt?.toDate()).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-black text-lg text-white leading-tight uppercase italic tracking-tighter">{sub.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-5 h-5 rounded-full bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15]">
                      <User className="w-3 h-3" />
                    </div>
                    <p className="text-[11px] font-bold text-[#A3A3A3] truncate max-w-[150px]">{sub.userEmail}</p>
                    <div className="w-1 h-1 rounded-full bg-[#3D3215]"></div>
                    <p className="text-xs font-black text-[#FACC15]">{sub.reward}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#101010] p-4 rounded-2xl border border-[#3D3215] mb-5">
                <p className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest mb-2 border-b border-[#3D3215] pb-2">Proof Submission</p>
                <div className="space-y-2">
                  {sub.proofs.text && (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#1C1C1C] border border-[#3D3215]">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-[#A3A3A3] uppercase block mb-0.5">Comment:</span>
                        <p className="text-sm font-medium text-white break-all">{sub.proofs.text}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(sub.proofs.text);
                          toast.success("Comment copied!");
                        }}
                        className="p-1 px-1.5 rounded-lg text-[#A3A3A3] hover:text-[#FACC15] hover:bg-[#151515] transition-colors shrink-0 self-center border border-transparent hover:border-[#3D3215]"
                        title="Copy Comment"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {sub.proofs.username && (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#1C1C1C] border border-[#3D3215]">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-[#A3A3A3] uppercase block mb-0.5">Username:</span>
                        <p className="text-sm font-mono font-bold text-[#FACC15] break-all">{sub.proofs.username}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(sub.proofs.username);
                          toast.success("Username copied!");
                        }}
                        className="p-1 px-1.5 rounded-lg text-[#A3A3A3] hover:text-[#FACC15] hover:bg-[#151515] transition-colors shrink-0 self-center border border-transparent hover:border-[#3D3215]"
                        title="Copy Username"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {sub.proofs.password && (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#1C1C1C] border border-[#3D3215]">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-[#A3A3A3] uppercase block mb-0.5">Password:</span>
                        <p className="text-sm font-mono font-bold text-rose-400 break-all">{sub.proofs.password}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(sub.proofs.password);
                          toast.success("Password copied!");
                        }}
                        className="p-1 px-1.5 rounded-lg text-[#A3A3A3] hover:text-rose-400 hover:bg-[#151515] transition-colors shrink-0 self-center border border-transparent hover:border-[#3D3215]"
                        title="Copy Password"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {sub.proofs.twoFactorCode && (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#1C1C1C] border border-[#3D3215]">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-[#A3A3A3] uppercase block mb-0.5">2FA / Recovery:</span>
                        <p className="text-sm font-mono font-bold text-emerald-400 break-all">{sub.proofs.twoFactorCode}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(sub.proofs.twoFactorCode);
                          toast.success("2FA copied!");
                        }}
                        className="p-1 px-1.5 rounded-lg text-[#A3A3A3] hover:text-emerald-400 hover:bg-[#151515] transition-colors shrink-0 self-center border border-transparent hover:border-[#3D3215]"
                        title="Copy 2FA"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {sub.proofs.videoUrl && (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#1C1C1C] border border-[#3D3215]">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-[#A3A3A3] uppercase block mb-0.5">Video URL:</span>
                        <a href={sub.proofs.videoUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#FACC15] underline truncate block">{sub.proofs.videoUrl}</a>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(sub.proofs.videoUrl);
                          toast.success("Video URL copied!");
                        }}
                        className="p-1 px-1.5 rounded-lg text-[#A3A3A3] hover:text-[#FACC15] hover:bg-[#151515] transition-colors shrink-0 self-center border border-transparent hover:border-[#3D3215]"
                        title="Copy Video URL"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {sub.proofs.screenshot && (
                    <div className="pt-2">
                      <button 
                        onClick={() => setViewingScreenshot(sub.proofs.screenshot)}
                        className="flex items-center gap-2 text-xs font-black text-[#090909] bg-gradient-to-r from-[#D4A017] to-[#FACC15] px-4 py-2 rounded-xl hover:opacity-95 active:scale-95 transition-all w-fit shadow-md cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Proof Image
                      </button>
                    </div>
                  )}

                  {sub.proofs.fileUrl && (
                    <div className="pt-2">
                      <a 
                        href={sub.proofs.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs font-black text-white bg-[#1C1C1C] hover:bg-[#3D3215]/40 border border-[#3D3215] px-4 py-2 rounded-xl active:scale-95 transition-all w-fit shadow-md cursor-pointer"
                      >
                        <FileIcon className="w-3.5 h-3.5 text-[#FACC15]" /> View Proof File
                      </a>
                    </div>
                  )}

                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => reviewSubmission(sub.id, sub.userId, sub.reward, sub.title, sub.jobType || 'Other', sub.jobId, 'approved')} 
                  className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] flex justify-center items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <CheckCircle className="w-4 h-4"/> Approve
                </button>
                <button 
                  onClick={() => reviewSubmission(sub.id, sub.userId, sub.reward, sub.title, sub.jobType || 'Other', sub.jobId, 'rejected')} 
                  className="bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] flex justify-center items-center gap-2 shadow-lg shadow-rose-600/20 active:scale-95 transition-all"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </motion.div>
          ))}
          
          <div className="pt-6">
            <h3 className="font-black text-white uppercase tracking-tight text-xs mb-4 opacity-50 px-1">Recently Reviewed</h3>
            <div className="grid gap-2">
              {submissions.filter(s => s.status !== 'pending').slice(0, 100).map(sub => (
                <div key={sub.id} className="bg-[#151515] p-3 rounded-2xl shadow-sm border border-[#3D3215] flex justify-between items-center transition-all hover:bg-[#1C1C1C]">
                  <div className="flex-1 overflow-hidden pr-4">
                    <p className="font-bold text-xs text-white truncate uppercase tracking-tight italic">{sub.title}</p>
                    <p className="text-[10px] text-[#A3A3A3] font-medium truncate">{sub.userEmail}</p>
                  </div>
                  <div className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${sub.status === 'approved' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950/40 text-rose-400 border border-rose-500/30'}`}>
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
          <form onSubmit={handleCreateJob} className="bg-[#151515] p-6 rounded-3xl shadow-sm border border-[#3D3215] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-lg text-white uppercase tracking-tight italic">{editingJobId ? 'Edit Task' : 'Create New Task'}</h3>
              {editingJobId && (
                <button type="button" onClick={handleCancelEditJob} className="text-xs font-bold text-[#A3A3A3] hover:text-[#FACC15]">Cancel Edit</button>
              )}
            </div>
            <div className="grid gap-3">
              <input type="text" placeholder="Task Title" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white placeholder:text-[#737373] focus:border-[#D4A017] outline-none" />
              <textarea placeholder="Job Description / Instructions" required value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white h-24 placeholder:text-[#737373] focus:border-[#D4A017] outline-none" />
              <input type="text" placeholder="Action Link (e.g. Telegram Group Link, URL)" value={newJob.link || ''} onChange={e => setNewJob({...newJob, link: e.target.value})} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold placeholder:text-[#737373] text-[#FACC15] focus:border-[#D4A017] outline-none" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest px-2 mb-1 block">Category</label>
                <select 
                  value={newJob.type} 
                  onChange={e => {
                    const newType = e.target.value;
                    let updatedJob = { ...newJob, type: newType };
                    if (newType === 'Review') {
                      updatedJob.title = "German Doner Kebab (GDK)   ";
                      updatedJob.description = "      (5 Star)                      ";
                      updatedJob.link = "https://www.google.com/search?shndl=30&shem=rimspwouoe&q=German+Doner+Kebab+(GDK)&kgmid=/g/11wpz8mg0y";
                      updatedJob.icon = 'Star';
                      updatedJob.color = 'text-[#FACC15]';
                      updatedJob.requiredProofs = ['text', 'screenshot', 'username'];
                      
                      const defaultComments = [
                        "Ive tried GDK in other locations, and Metrocenter branch is just as good. Consistent taste, clean, and fast.",
                        "Super convenient inside Metrocenter. Grabbed a Kebab Box between shopping trips. No long wait even during lunch rush.fas",
                        "What makes GDK different is the sauce selection. Tried Garlic + Chilli. Kebab was packed well and didnt get soggy.",
                        "The waffle bread is absolutely incredible! GDK always delivers high-quality donor and the service is extremely friendly.",
                        "Amazing kebab! Fresh ingredients, tasty sauces, and super clean. Best place in Metrocenter for a quick bite.",
                        "Really friendly staff and super quick service. The donor meat is perfectly seasoned and not greasy at all.",
                        "Absolutely love GDK. The food is always piping hot, fresh, and full of flavor. Highly recommend the Boss Box!",
                        "Best doner kebab around here. Friendly staff, modern clean seating, and consistently delicious food.",
                        "German Doner Kebab never disappoints! The combination of garlic and spicy sauce is just amazing.",
                        "Great dining experience at the Metrocenter branch. The doner wraps are fresh, juicy, and huge!",
                        "I am absolutely in love with GDK's signature sauce. The meat is tender and the waffle bread is so soft.",
                        "A must-visit spot inside Metrocenter! Super clean environment, polite workers, and top-tier kebabs.",
                        "Really tasty and healthy portion sizes. The GDK doner is far superior to standard kebabs.",
                        "Excellent service! The team is efficient even when it is crowded. The food is consistently outstanding.",
                        "Outstanding taste and amazing packaging! Everything feels very hygienic and fresh.",
                        "Highly impressed by the speed and cleanliness. The kebab was packed with meat and extremely flavorful.",
                        "The chili sauce is perfectly spicy and pairs so well with the garlic sauce. Best doner ever!",
                        "Lovely food and brilliant service! Great addition to Metrocenter, definitely coming back again.",
                        "The meat is so tender and flavorful, and the veggies are incredibly crisp. Highly recommended!",
                        "Quick, yummy, and very clean! Definitely my go-to spot whenever I visit Metrocenter.",
                        "GDK is on another level. The waffle bread kebab is unique, tasty, and loaded with fresh fillings.",
                        "Perfect quick lunch while shopping. Warm food, delicious taste, and lovely helpful staff.",
                        "Their doner box with fries is top notch! Perfect blend of spices and very satisfying portion.",
                        "Great service, clean tables, and incredible flavor. The doner is juicy and absolutely delicious.",
                        "Highly professional staff, excellent customer service, and unmatched kebab quality. Simply the best.",
                        "The bread is light and crispy, and the meat is beautifully cooked. Best fast food in Metrocenter!",
                        "Brilliant taste, gorgeous sauces, and absolutely spot on. Will definitely recommend GDK to friends.",
                        "Loved the Doner Spring Rolls and the classic kebab. GDK Metrocenter is always top notch!",
                        "Super fast preparation and extremely delicious. The garlic sauce is out of this world!",
                        "Super clean, very friendly service, and absolutely scrumptious kebabs. A solid five stars!"
                      ];
                      updatedJob.reviewComments = defaultComments;
                    }
                    setNewJob(updatedJob);
                  }} 
                  className="w-full bg-[#101010] border border-[#3D3215] text-white px-4 py-3 rounded-2xl text-sm font-bold focus:border-[#D4A017] outline-none"
                >
                  {['Facebook', 'Gmail', 'Instagram', 'Telegram', 'Review', 'Sell Accounts', 'Microjob', 'Typing', 'Watch Ads', 'Other'].map(cat => <option key={cat} value={cat} className="bg-[#151515] text-white">{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest px-2 mb-1 block">Reward ()</label>
                <input type="number" placeholder="0.00" required value={newJob.reward} onChange={e => setNewJob({...newJob, reward: Number(e.target.value)})} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-black text-[#FACC15] placeholder:text-[#737373] focus:border-[#D4A017] outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest px-2 mb-1 block">Total Slots (All Users)</label>
                <input type="number" value={newJob.allowedCompletions} onChange={e => setNewJob({...newJob, allowedCompletions: Number(e.target.value)})} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white placeholder:text-[#737373] focus:border-[#D4A017] outline-none" placeholder="0 for unlimited" />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest px-2 mb-1 block">Max Per User</label>
                <input type="number" value={newJob.userLimit} onChange={e => setNewJob({...newJob, userLimit: Number(e.target.value)})} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-[#FACC15] placeholder:text-[#737373] focus:border-[#D4A017] outline-none" placeholder="0 for unlimited" />
              </div>
            </div>

            <div className="p-4 bg-[#101010] border border-[#3D3215] rounded-3xl space-y-3">
              <p className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest mb-1 pl-1">Appearance & Requirements</p>
              <div className="grid grid-cols-2 gap-2">
                <select value={newJob.icon} onChange={e => setNewJob({...newJob, icon: e.target.value})} className="bg-[#1C1C1C] border border-[#3D3215] text-white px-3 py-2 rounded-xl text-xs font-bold shadow-sm focus:border-[#D4A017] outline-none">
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
                  <option value="Send">Telegram / Message</option>
                  <option value="User">User Account</option>
                  <option value="Globe">Global Link</option>
                </select>
                <input type="text" placeholder="Icon Color (e.g. text-[#FACC15])" value={newJob.color} onChange={e => setNewJob({...newJob, color: e.target.value})} className="bg-[#1C1C1C] border border-[#3D3215] text-white px-3 py-2 rounded-xl text-xs font-bold shadow-sm focus:border-[#D4A017] outline-none" />
              </div>
            </div>

            <div className="grid gap-3">
              <input type="text" placeholder="Task Redirect Link (Full URL)" required value={newJob.link} onChange={e => setNewJob({...newJob, link: e.target.value})} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-xs font-bold italic text-[#FACC15] focus:border-[#D4A017] outline-none" />
            </div>
            
            <div className="space-y-3">
              <p className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1">Required Proofs To Check</p>
              <div className="flex gap-2 flex-wrap">
                {['text', 'screenshot', 'username', 'password', 'videoUrl', '2facode'].map(p => (
                  <button 
                    type="button" 
                    key={p} 
                    onClick={() => toggleProof(p)} 
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-90 ${
                      newJob.requiredProofs.includes(p) 
                      ? 'bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] border-[#FACC15] shadow-lg shadow-[#D4A017]/20 font-black' 
                      : 'bg-[#101010] text-[#A3A3A3] border-[#3D3215] hover:text-[#FACC15]'
                    }`}
                  >
                    {p === '2facode' ? '2FA Code' : p}
                  </button>
                ))}
              </div>
            </div>

            {newJob.type === "Review" && (
              <div className="p-4 bg-[#1C1C1C] rounded-3xl space-y-3 border border-[#3D3215]">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-[#FACC15] uppercase tracking-widest pl-1">
                    Google Review Comments (English)
                  </p>
                  <span className="text-[10px] bg-[#3D3215]/50 text-[#FACC15] font-bold px-2 py-0.5 rounded-full border border-[#D4A017]/30">
                    {Array.isArray(newJob.reviewComments) ? newJob.reviewComments.length : 0} 
                  </span>
                </div>
                <textarea
                  placeholder="Review comments list (one per line)"
                  value={Array.isArray(newJob.reviewComments) ? newJob.reviewComments.join('\n') : ''}
                  onChange={e => {
                    const commentsArray = e.target.value.split('\n');
                    setNewJob({ ...newJob, reviewComments: commentsArray });
                  }}
                  className="w-full bg-[#101010] border border-[#3D3215] text-white px-4 py-3 rounded-2xl text-xs font-bold h-36 placeholder:text-[#737373] focus:border-[#D4A017] outline-none"
                />
                <p className="text-[9px] text-[#A3A3A3] font-bold pl-1 leading-relaxed">
                  * Each submission assigns a random comment to the user to copy.
                </p>
              </div>
            )}

            <div className="p-4 bg-[#1C1C1C] rounded-3xl space-y-3 border border-[#3D3215]">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-[#FACC15] uppercase tracking-widest">Account Selling Config</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newJob.isAccountSell} onChange={e => setNewJob({...newJob, isAccountSell: e.target.checked})} className="w-4 h-4 text-[#FACC15] rounded border-[#3D3215] bg-[#101010] focus:ring-[#D4A017]" />
                  <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">Enable Sell UI</span>
                </label>
              </div>
              
              {newJob.isAccountSell && (
                <div className="grid gap-3 mt-2">
                  <input type="text" placeholder="Today's Password (e.g. ayan@770)" value={newJob.todaysPassword} onChange={e => setNewJob({...newJob, todaysPassword: e.target.value})} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold placeholder:text-[#737373] text-[#FACC15] focus:border-[#D4A017] outline-none" />
                </div>
              )}
            </div>
            
            <button type="submit" className="w-full bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] font-black uppercase tracking-[0.2em] py-4 rounded-2xl shadow-xl hover:opacity-95 active:scale-95 transition-all text-xs cursor-pointer">{editingJobId ? 'Update Job Now' : 'Publish Job Now'}</button>
          </form>

          <div className="grid gap-3">
            {jobs.filter(job => job.status === 'pending').length > 0 && (
              <div className="space-y-3 mb-6">
                <h3 className="font-black text-[#FACC15] uppercase tracking-tight text-xs mb-1 px-1 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FACC15] animate-pulse"></div>
                  Pending User Job Requests ({jobs.filter(job => job.status === 'pending').length})
                </h3>
                {jobs.filter(job => job.status === 'pending').map(job => (
                  <div key={job.id} className="bg-[#151515] p-4 rounded-3xl shadow-sm border border-[#3D3215] space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#FACC15] bg-[#3D3215]/50 px-2 py-0.5 rounded-md border border-[#D4A017]/30">
                          {job.type}
                        </span>
                        <h4 className="font-bold text-white text-sm leading-snug truncate mt-1">{job.title}</h4>
                        <p className="text-xs text-[#A3A3A3] mt-1 line-clamp-2">{job.description}</p>
                        <p className="text-[10px] font-black text-[#FACC15] uppercase tracking-widest mt-1">
                          Link: <a href={job.link} target="_blank" rel="noopener noreferrer" className="underline">{job.link}</a>
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-xs font-black text-white">Rate: {job.reward}</p>
                        <p className="text-[10px] font-bold text-[#A3A3A3]">Slots: {job.allowedCompletions}</p>
                        <p className="text-[10px] font-black text-emerald-400">Total: {job.totalCost}</p>
                        <p className="text-[8px] font-black text-[#737373] uppercase mt-1">By: {job.postedBy}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 justify-end pt-2 border-t border-[#3D3215]">
                      <button 
                        onClick={() => handleRejectJob(job)} 
                        className="px-4 py-2 text-rose-400 bg-rose-950/40 border border-rose-600/30 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-900/50 active:scale-95 transition-all"
                      >
                        Reject & Refund
                      </button>
                      <button 
                        onClick={() => handleApproveJob(job.id)} 
                        className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-black uppercase tracking-wider active:scale-95 transition-all"
                      >
                        Approve Job
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 className="font-black text-white uppercase tracking-tight text-xs mb-1 px-1 opacity-50">
              Active/All Tasks ({jobs.filter(job => job.status !== 'pending').length})
            </h3>
            {jobs.filter(job => job.status !== 'pending').map(job => (
              <div key={job.id} className="bg-[#151515] p-4 rounded-3xl shadow-sm flex justify-between items-center border border-[#3D3215] transition-all hover:border-[#D4A017]/40">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-white truncate uppercase tracking-tight text-sm">{job.title}</h4>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                      job.status === 'active' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950/40 text-rose-400 border border-rose-500/30'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-[#FACC15]/80 uppercase tracking-widest">{job.reward} &bull; {job.type} &bull; Slots: {job.remainingSlots}/{job.allowedCompletions}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => handleEditJobClick(job)} className="p-3 text-[#FACC15] bg-[#1C1C1C] border border-[#3D3215] rounded-2xl hover:border-[#D4A017] active:scale-90 transition-all">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteJob(job.id)} className="p-3 text-rose-400 bg-rose-950/30 border border-rose-800/30 rounded-2xl hover:bg-rose-900/40 active:scale-90 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="font-black text-white uppercase tracking-tight text-sm">Payment Queue ({paymentRequests.filter(req => req.status === 'pending').length})</h3>
          </div>

          {paymentRequests.filter(req => req.status === 'pending').length === 0 && (
            <div className="text-center py-16 bg-[#151515] rounded-3xl border-2 border-dashed border-[#3D3215]">
              <div className="w-16 h-16 bg-[#1C1C1C] rounded-full flex items-center justify-center mx-auto mb-4 text-[#FACC15] border border-[#3D3215]">
                <CheckCircle className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-[#A3A3A3] uppercase tracking-widest">All caught up! No requests</p>
            </div>
          )}
          
          {paymentRequests.filter(req => req.status === 'pending').map(req => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={req.id} 
              className={`bg-[#151515] p-5 rounded-3xl shadow-sm border border-[#3D3215] relative overflow-hidden ring-1 ${
                req.type === 'withdraw' ? 'ring-rose-500/20' : 'ring-emerald-500/20'
              }`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FACC15]/[0.04] blur-3xl rounded-full"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                      req.type === 'withdraw' 
                      ? 'bg-rose-950/40 text-rose-400 border-rose-500/30' 
                      : 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {req.type}
                    </span>
                    <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest">{new Date(req.createdAt?.toDate()).toLocaleTimeString()}</span>
                  </div>
                  <h4 className="font-black text-2xl text-white leading-none mt-2">{req.amount}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-5 h-5 rounded-full bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15]">
                      <User className="w-3 h-3" />
                    </div>
                    <p className="text-[11px] font-bold text-[#A3A3A3] italic truncate max-w-[180px]">{req.userEmail}</p>
                  </div>
                </div>
                {req.type === 'deposit' && (
                  <div className="bg-[#1C1C1C] border border-[#3D3215] p-2 rounded-xl text-center">
                    <p className="text-[8px] font-black uppercase text-[#FACC15] tracking-tighter">Gateway</p>
                    <p className="text-[10px] font-bold text-white">{req.method}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-[#101010] p-4 rounded-2xl border border-[#3D3215] mb-5 text-sm">
                {req.type === 'withdraw' && (
                  <div className="space-y-1">
                    <div className="flex justify-between border-b border-[#3D3215] pb-1.5 mb-1.5 font-sans">
                      <span className="text-[10px] font-black text-[#A3A3A3] uppercase">Wallet</span>
                      <span className="font-bold uppercase tracking-widest text-[10px] text-[#FACC15]">{req.wallet} Wallet</span>
                    </div>
                    <div className="flex justify-between font-sans">
                      <span className="text-[10px] font-black text-[#A3A3A3] uppercase">Method</span>
                      <span className="font-bold text-white">{req.method}</span>
                    </div>
                    <div className="flex justify-between items-center font-sans">
                      <span className="text-[10px] font-black text-[#A3A3A3] uppercase">Account</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-white tracking-wider text-[11px]">{req.account}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(req.account);
                            toast.success('Account copied!');
                          }}
                          className="hover:text-[#FACC15] text-[#A3A3A3] transition p-0.5 rounded cursor-pointer active:scale-95"
                          title="Copy Account Number"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-center mt-3 p-2 bg-white rounded-lg w-fit mx-auto">
                      <QRCode value={req.account} size={90} />
                    </div>
                  </div>
                )}
                {req.type === 'deposit' && (
                  <div className="space-y-1">
                    <div className="flex justify-between border-b border-[#3D3215] pb-1.5 mb-1.5 font-sans">
                      <span className="text-[10px] font-black text-[#A3A3A3] uppercase">Sender Number</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-white tracking-wider text-[11px]">{req.account || 'Unknown'}</span>
                        {req.account && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(req.account);
                              toast.success('Sender number copied!');
                            }}
                            className="hover:text-[#FACC15] text-[#A3A3A3] transition p-0.5 rounded cursor-pointer active:scale-95"
                            title="Copy Sender Number"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center font-sans">
                      <span className="text-[10px] font-black text-[#A3A3A3] uppercase">Transaction ID</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#FACC15] tracking-wider text-[11px]">{req.trxId}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(req.trxId);
                            toast.success('Transaction ID copied!');
                          }}
                          className="hover:text-[#FACC15] text-[#A3A3A3] transition p-0.5 rounded cursor-pointer active:scale-95"
                          title="Copy Transaction ID"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between border-t border-[#3D3215] mt-1.5 pt-1.5 font-sans">
                      <span className="text-[10px] font-black text-[#A3A3A3] uppercase">Method</span>
                      <span className="font-bold text-xs uppercase text-[#FACC15]">{req.method || 'Bkash/Nagad'}</span>
                    </div>
                  </div>
                )}
                {req.type === 'activation' && (
                  <div className="space-y-1">
                    <div className="flex justify-between border-b border-[#3D3215] pb-1.5 mb-1.5 font-sans">
                      <span className="text-[10px] font-black text-[#A3A3A3] uppercase">Sender Number</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-white tracking-wider text-[11px]">{req.account || 'Unknown'}</span>
                        {req.account && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(req.account);
                              toast.success('Sender number copied!');
                            }}
                            className="hover:text-emerald-400 text-[#A3A3A3] transition p-0.5 rounded cursor-pointer active:scale-95"
                            title="Copy Sender Number"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center font-sans">
                      <span className="text-[10px] font-black text-[#A3A3A3] uppercase">Transaction ID</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-emerald-400 tracking-wider text-[11px]">{req.trxId}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(req.trxId);
                            toast.success('Transaction ID copied!');
                          }}
                          className="hover:text-emerald-400 text-[#A3A3A3] transition p-0.5 rounded cursor-pointer active:scale-95"
                          title="Copy Transaction ID"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between border-t border-[#3D3215] mt-1.5 pt-1.5 font-sans">
                      <span className="text-[10px] font-black text-[#A3A3A3] uppercase">Method</span>
                      <span className="font-bold text-xs uppercase text-emerald-400">{req.method || 'Bkash/Nagad'}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handlePaymentRequest(req.id, req.userId, req.amount, req.type, 'approved', req.transactionId, req.wallet)} 
                  className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  Pay Now
                </button>
                <button 
                  onClick={() => handlePaymentRequest(req.id, req.userId, req.amount, req.type, 'rejected', req.transactionId, req.wallet)} 
                  className="bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-rose-600/20 active:scale-95 transition-all"
                >
                  Decline
                </button>
              </div>
            </motion.div>
          ))}
          
          <div className="pt-6">
            <h3 className="font-black text-white uppercase tracking-tight text-xs mb-4 opacity-50 px-1">Payment History</h3>
            <div className="grid gap-2">
              {paymentRequests.filter(req => req.status !== 'pending').slice(0, 100).map(req => (
                <div key={req.id} className="bg-[#151515] p-3 rounded-2xl shadow-sm border border-[#3D3215] flex justify-between items-center opacity-85">
                  <div className="flex-1 overflow-hidden pr-4">
                    <p className="font-black text-[13px] text-white italic uppercase flex items-center gap-1.5">
                      {req.amount} &bull; {req.type}
                      {req.method && <span className="px-1.5 py-0.5 bg-[#1C1C1C] border border-[#3D3215] rounded text-[9px] not-italic text-[#FACC15]">{req.method}</span>}
                    </p>
                    <p className="text-[9px] text-[#A3A3A3] font-bold truncate tracking-widest uppercase">{req.userEmail} {req.account ? ` ${req.account}` : ''}</p>
                  </div>
                  <div className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${req.status === 'approved' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' : 'bg-rose-950/40 text-rose-400 border-rose-500/30'}`}>
                    {req.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gifts' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateGiftCode} className="bg-[#151515] p-6 rounded-[32px] border border-[#3D3215] shadow-sm space-y-4">
            <h3 className="font-black text-white uppercase tracking-tight text-sm">Create Gift Code</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest pl-1">Gift Code (5-8 Chars)</label>
                <input type="text" value={newGiftCode} onChange={(e) => setNewGiftCode(e.target.value.toUpperCase())} maxLength={8} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-[#FACC15] uppercase focus:border-[#D4A017] outline-none" placeholder="e.g. SUMMER50" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest pl-1">Reward Type</label>
                <select value={giftType} onChange={(e) => setGiftType(e.target.value as 'fixed'|'random')} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white focus:border-[#D4A017] outline-none">
                  <option value="fixed" className="bg-[#151515] text-white">Fixed Amount</option>
                  <option value="random" className="bg-[#151515] text-white">Random Amount</option>
                </select>
              </div>
              
              {giftType === 'fixed' ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest pl-1">Amount ()</label>
                  <input type="number" min="1" value={giftAmount} onChange={(e) => setGiftAmount(e.target.value === '' ? '' : isNaN(parseFloat(e.target.value)) ? "" : parseFloat(e.target.value))} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white focus:border-[#D4A017] outline-none" required />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest pl-1">Min Amount ()</label>
                    <input type="number" min="1" value={giftMinAmount} onChange={(e) => setGiftMinAmount(e.target.value === '' ? '' : isNaN(parseFloat(e.target.value)) ? "" : parseFloat(e.target.value))} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white focus:border-[#D4A017] outline-none" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest pl-1">Max Amount ()</label>
                    <input type="number" min="1" value={giftMaxAmount} onChange={(e) => setGiftMaxAmount(e.target.value === '' ? '' : isNaN(parseFloat(e.target.value)) ? "" : parseFloat(e.target.value))} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white focus:border-[#D4A017] outline-none" required />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest pl-1">Max Uses (0 = unlimited)</label>
                <input type="number" min="0" value={giftMaxUses} onChange={(e) => setGiftMaxUses(e.target.value === '' ? '' : isNaN(parseInt(e.target.value)) ? "" : parseInt(e.target.value))} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white focus:border-[#D4A017] outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest pl-1">Expires In (Hours)</label>
                <input type="number" min="1" value={giftExpiresInHours} onChange={(e) => setGiftExpiresInHours(e.target.value === '' ? '' : isNaN(parseInt(e.target.value)) ? "" : parseInt(e.target.value))} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white focus:border-[#D4A017] outline-none" required />
              </div>
            </div>

            <button type="submit" disabled={isCreatingGift} className="w-full bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg transition-all text-xs disabled:opacity-50 cursor-pointer">
              {isCreatingGift ? 'Creating...' : 'Create Code'}
            </button>
          </form>

          <div className="space-y-3">
            <h3 className="font-black text-white uppercase tracking-tight text-xs pl-1">Active & Past Codes ({giftCodes.length})</h3>
            
            {giftCodes.length === 0 && (
              <div className="text-center py-12 bg-[#151515] rounded-[32px] border-2 border-dashed border-[#3D3215]">
                <p className="text-xs font-bold text-[#A3A3A3] uppercase tracking-widest">No gift codes found.</p>
              </div>
            )}

            <div className="grid gap-3">
              {giftCodes.map((code) => {
                const isExpired = code.expiresAt && code.expiresAt.toDate() < new Date();
                return (
                  <div key={code.id} className="bg-[#151515] p-4 rounded-xl border border-[#3D3215] flex flex-col gap-2 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black font-mono text-[#FACC15] text-lg tracking-widest">{code.code}</h4>
                        <p className="text-xs text-[#A3A3A3] mt-1">
                          {code.type === 'fixed' ? `${code.amount} Fixed` : `${code.minAmount} - ${code.maxAmount} Random`}
                          <span className="mx-2 text-[#737373]">&bull;</span>
                          {code.usedBy?.length || 0} / {code.maxUses || 'Unlimited'} Uses
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border ${
                          code.status === 'active' && !isExpired ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' : 'bg-rose-950/40 text-rose-400 border-rose-500/30'
                        }`}>
                          {isExpired ? 'EXPIRED' : code.status}
                        </span>
                        <button onClick={() => handleDeleteGiftCode(code.id)} className="p-2 text-rose-400 bg-rose-950/30 border border-rose-800/30 rounded-lg hover:bg-rose-900/40 active:scale-90 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'faqs' && (
        <div className="space-y-6">
          <form onSubmit={handleAddFaq} className="bg-[#151515] p-6 rounded-[32px] border border-[#3D3215] shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-white uppercase tracking-tight text-sm">{editingFaqIndex !== null ? 'Edit FAQ' : 'Add New FAQ'}</h3>
              {editingFaqIndex !== null && (
                <button type="button" onClick={handleCancelEditFaq} className="text-xs font-bold text-[#A3A3A3] hover:text-[#FACC15]">Cancel</button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <input type="text" placeholder="Question (English)" value={newFaq.question_en} onChange={(e) => setNewFaq({...newFaq, question_en: e.target.value})} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white placeholder:text-[#737373] focus:border-[#D4A017] outline-none" required />
                <textarea placeholder="Answer (English)" value={newFaq.answer_en} onChange={(e) => setNewFaq({...newFaq, answer_en: e.target.value})} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white placeholder:text-[#737373] focus:border-[#D4A017] outline-none h-24" required />
              </div>
              <div className="space-y-2">
                <input type="text" placeholder="Question (Bengali)" value={newFaq.question_bn} onChange={(e) => setNewFaq({...newFaq, question_bn: e.target.value})} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white placeholder:text-[#737373] focus:border-[#D4A017] outline-none" required />
                <textarea placeholder="Answer (Bengali)" value={newFaq.answer_bn} onChange={(e) => setNewFaq({...newFaq, answer_bn: e.target.value})} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white placeholder:text-[#737373] focus:border-[#D4A017] outline-none h-24" required />
              </div>
            </div>

            <button type="submit" disabled={isSavingSettings} className="w-full bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg transition-all text-xs disabled:opacity-50 cursor-pointer">
              {editingFaqIndex !== null ? 'Update FAQ' : 'Create FAQ'}
            </button>
          </form>

          <div className="space-y-3">
            <h3 className="font-black text-white uppercase tracking-tight text-xs pl-1">Live FAQs ({faqsList.length})</h3>
            
            {faqsList.length === 0 && (
              <div className="text-center py-12 bg-[#151515] rounded-[32px] border-2 border-dashed border-[#3D3215]">
                <p className="text-xs font-bold text-[#A3A3A3] uppercase tracking-widest">No FAQs registered yet.</p>
              </div>
            )}

            <div className="grid gap-3">
              {faqsList.map((faq, index) => (
                <div key={index} className="bg-[#151515] p-4 rounded-xl border border-[#3D3215] flex flex-col gap-2 shadow-sm">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white text-sm">{faq.question_en}</h4>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingFaqIndex(index); setNewFaq(faq); }} className="p-2 text-[#FACC15] bg-[#1C1C1C] border border-[#3D3215] rounded-lg hover:border-[#D4A017] active:scale-90 transition-all">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteFaq(index)} className="p-2 text-rose-400 bg-rose-950/30 border border-rose-800/30 rounded-lg hover:bg-rose-900/40 active:scale-90 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[#A3A3A3]">{faq.answer_en}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'drives' && (
        <div className="space-y-6">
          {/* Create Drive Offer Form */}
          <div className="bg-[#151515] p-6 rounded-[32px] border border-[#3D3215] shadow-sm">
            <h3 className="font-black text-white uppercase tracking-tight text-sm mb-4">Create New Drive Offer</h3>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newDriveTitle || !newDriveOriginalPrice || !newDriveSalePrice) {
                  toast.error("Please fill all required fields");
                  return;
                }
                const originalCost = parseFloat(newDriveOriginalPrice);
                const saleCost = parseFloat(newDriveSalePrice);
                if (saleCost >= originalCost) {
                  toast.error("Sale price must be less than original price");
                  return;
                }
                try {
                  const id = `offer_${Date.now()}`;
                  await setDoc(doc(db, "drive_offers", id), {
                    title: newDriveTitle,
                    operator: newDriveOperator,
                    validity: newDriveValidity,
                    originalPrice: originalCost,
                    salePrice: saleCost,
                    status: 'active'
                  });
                  toast.success("Drive pack created successfully!");
          clearCache();
          await loadData(true);
                  setNewDriveTitle('');
                  setNewDriveOriginalPrice('');
                  setNewDriveSalePrice('');
                  setNewDriveValidity('30 Days');
                } catch (err) {
                  toast.error("Failed to create drive offer");
                  console.error(err?.message || "Unknown Error");
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">Package Title</label>
                  <input type="text" placeholder="e.g. GP 40GB + 800 Min Combo" required value={newDriveTitle} onChange={(e) => setNewDriveTitle(e.target.value)} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white placeholder:text-[#737373] focus:border-[#D4A017] outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">Mobile Operator</label>
                  <select value={newDriveOperator} onChange={(e) => setNewDriveOperator(e.target.value)} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white focus:border-[#D4A017] outline-none">
                    <option value="Grameenphone" className="bg-[#151515] text-white">Grameenphone</option>
                    <option value="Robi" className="bg-[#151515] text-white">Robi</option>
                    <option value="Banglalink" className="bg-[#151515] text-white">Banglalink</option>
                    <option value="Airtel" className="bg-[#151515] text-white">Airtel</option>
                    <option value="Teletalk" className="bg-[#151515] text-white">Teletalk</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">Validity</label>
                  <input type="text" placeholder="e.g. 30 Days" required value={newDriveValidity} onChange={(e) => setNewDriveValidity(e.target.value)} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white placeholder:text-[#737373] focus:border-[#D4A017] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">Original</label>
                  <input type="number" placeholder="e.g. 799" required value={newDriveOriginalPrice} onChange={(e) => setNewDriveOriginalPrice(e.target.value)} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white placeholder:text-[#737373] focus:border-[#D4A017] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">Sale</label>
                  <input type="number" placeholder="e.g. 580" required value={newDriveSalePrice} onChange={(e) => setNewDriveSalePrice(e.target.value)} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-[#FACC15] placeholder:text-[#737373] focus:border-[#D4A017] outline-none" />
                </div>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg transition-all text-xs cursor-pointer">
                Create Drive Pack
              </button>
            </form>
          </div>

          {/* Drive Packs List */}
          <div className="space-y-3">
            <h3 className="font-black text-white uppercase tracking-tight text-xs pl-1">Live Drive Packs ({adminOffers.length})</h3>
            
            {adminOffers.length === 0 && (
              <div className="text-center py-12 bg-[#151515] rounded-[32px] border-2 border-dashed border-[#3D3215]">
                <p className="text-xs font-bold text-[#A3A3A3] uppercase tracking-widest">No active drive packs registered yet.</p>
              </div>
            )}

            <div className="grid gap-3">
              {adminOffers.map(of => {
                const operatorTags: Record<string, string> = {
                  Grameenphone: 'text-sky-400 bg-sky-950/30 border-sky-800/40',
                  Robi: 'text-red-400 bg-red-950/30 border-red-800/40',
                  Banglalink: 'text-amber-400 bg-amber-950/30 border-amber-800/40',
                  Airtel: 'text-rose-400 bg-rose-950/30 border-rose-800/40',
                  Teletalk: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40',
                };
                return (
                  <div key={of.id} className="bg-[#151515] p-4 rounded-xl border border-[#3D3215] flex items-center justify-between gap-4 shadow-sm">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] px-2 py-0.5 font-bold uppercase tracking-wide rounded-full border ${operatorTags[of.operator] || 'text-[#FACC15] border-[#3D3215] bg-[#1C1C1C]'}`}>
                          {of.operator}
                        </span>
                        <span className="text-[10px] text-[#A3A3A3] font-bold uppercase tracking-wide">{of.validity}</span>
                      </div>
                      <h4 className="font-black text-white text-sm truncate uppercase">{of.title}</h4>
                      <p className="text-xs font-bold text-[#A3A3A3] mt-1">Regular: <span className="line-through">{of.originalPrice}</span> &bull; Sale: <span className="text-[#FACC15]">{of.salePrice}</span></p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={async () => {
                          try {
                            const newStatus = of.status === 'active' ? 'inactive' : 'active';
                            await updateDoc(doc(db, "drive_offers", of.id), { status: newStatus });
                            toast.success(`Package set ${newStatus}`);
          clearCache();
          await loadData(true);
                          } catch (e) {
                            toast.error("Failed to alter status");
                          }
                        }}
                        className={`text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl border ${of.status === 'active' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' : 'bg-[#1C1C1C] text-[#A3A3A3] border-[#3D3215]'}`}
                      >
                        {of.status === 'active' ? 'Active' : 'Paused'}
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm("Delete this Drive Pack?")) {
                            try {
                              await deleteDoc(doc(db, "drive_offers", of.id));
                              toast.success("Pack deleted");
          clearCache();
          await loadData(true);
                            } catch (e) {
                              toast.error("Failed to delete pack");
                            }
                          }
                        }}
                        className="p-2 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/30 text-rose-400 rounded-xl active:scale-95 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="space-y-6">
          {/* Create/Edit Course Form */}
          <div className="bg-[#151515] p-6 rounded-[32px] border border-[#3D3215] shadow-sm relative overflow-hidden">
            <h3 className="font-black text-white uppercase tracking-tight text-sm mb-4">
              {editingCourseId ? 'কোর্স এডিট করুন' : 'নতুন কোর্স তৈরি করুন'}
            </h3>
            
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newCourseTitle || !newCourseDesc || !newCourseThumbnail || !newCourseLink) {
                  toast.error("সব ফিল্ড পূরণ করুন");
                  return;
                }
                
                try {
                  const id = editingCourseId || `course_${Date.now()}`;
                  await setDoc(doc(db, "courses", id), {
                    title: newCourseTitle,
                    description: newCourseDesc,
                    thumbnailUrl: newCourseThumbnail,
                    videoLink: newCourseLink,
                    category: newCourseCategory,
                    status: 'active',
                    items: courseItems,
                    updatedAt: serverTimestamp()
                  }, { merge: true });
                  
                  toast.success(editingCourseId ? "কোর্স আপডেট হয়েছে!" : "কোর্স তৈরি হয়েছে!");
          clearCache();
          await loadData(true);
                  
                  // Clear form
                  setNewCourseTitle('');
                  setNewCourseDesc('');
                  setNewCourseThumbnail('');
                  setNewCourseLink('');
                  setNewCourseCategory('ইউটিউব মার্কেটিং');
                  setCourseItems([]);
                  setEditingCourseId(null);
                } catch (err) {
                  toast.error("কোর্স সংরক্ষণ ব্যর্থ হয়েছে");
                  console.error(err?.message || "Unknown Error");
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">কোর্সের নাম (Title)</label>
                  <input 
                    type="text" 
                    placeholder="যেমন: ইউটিউব মার্কেটিং মাস্টারক্লাস" 
                    required 
                    value={newCourseTitle} 
                    onChange={(e) => setNewCourseTitle(e.target.value)} 
                    className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white placeholder:text-[#737373] focus:border-[#D4A017] outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">ক্যাটাগরি (Category)</label>
                  <select 
                    value={newCourseCategory} 
                    onChange={(e) => setNewCourseCategory(e.target.value as any)} 
                    className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white focus:border-[#D4A017] outline-none"
                  >
                    <option value="ইউটিউব মার্কেটিং" className="bg-[#151515] text-white">ইউটিউব মার্কেটিং</option>
                    <option value="ফেসবুক মার্কেটিং" className="bg-[#151515] text-white">ফেসবুক মার্কেটিং</option>
                    <option value="অন্যান্য" className="bg-[#151515] text-white">অন্যান্য</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">থাম্বনেইল লিংক (Thumbnail URL)</label>
                  <input 
                    type="url" 
                    placeholder="https://images.unsplash.com/..." 
                    required 
                    value={newCourseThumbnail} 
                    onChange={(e) => setNewCourseThumbnail(e.target.value)} 
                    className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white placeholder:text-[#737373] focus:border-[#D4A017] outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">ভিডিও লিংক (Video/Instruction Link)</label>
                  <input 
                    type="url" 
                    placeholder="https://youtube.com/watch?v=..." 
                    required 
                    value={newCourseLink} 
                    onChange={(e) => setNewCourseLink(e.target.value)} 
                    className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white placeholder:text-[#737373] focus:border-[#D4A017] outline-none transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">বিস্তারিত বিবরণ (Detailed Description)</label>
                <textarea 
                  placeholder="এই কোর্সে কি কি শেখানো হবে বিস্তারিত লিখুন..." 
                  required 
                  rows={4} 
                  value={newCourseDesc} 
                  onChange={(e) => setNewCourseDesc(e.target.value)} 
                  className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white placeholder:text-[#737373] focus:border-[#D4A017] outline-none transition-all"
                />
              </div>

              {/* Option Creator UI Section */}
              <div className="bg-[#101010] p-5 rounded-[24px] border border-[#3D3215] space-y-4">
                <div className="flex items-center gap-1.5 border-b border-[#3D3215] pb-2">
                  <Layers className="w-4 h-4 text-[#FACC15]" />
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-tight">মাল্টিপল অপশন / সাব-টিউটোরিয়াল (Multiple Option Items)</h4>
                    <p className="text-[9px] text-[#A3A3A3] font-bold uppercase mt-0.5">Add sub-tutorials for How to complete tasks, How to withdraw, etc.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">অপশন টাইটেল (Option Title)</label>
                    <input 
                      type="text" 
                      placeholder="যেমন: কিভাবে কাজটি সম্পন্ন করবেন" 
                      value={optTitle} 
                      onChange={(e) => setOptTitle(e.target.value)} 
                      className="w-full bg-[#151515] border border-[#3D3215] px-4 py-2.5 rounded-xl text-xs font-bold text-white placeholder:text-[#737373] focus:border-[#D4A017] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">অপশন থাম্বনেইল (Option Thumbnail URL)</label>
                    <input 
                      type="url" 
                      placeholder="https://images.unsplash.com/..." 
                      value={optThumbnail} 
                      onChange={(e) => setOptThumbnail(e.target.value)} 
                      className="w-full bg-[#151515] border border-[#3D3215] px-4 py-2.5 rounded-xl text-xs font-bold text-white placeholder:text-[#737373] focus:border-[#D4A017] outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">অপশন ভিডিও লিংক (Option Video/Instruction Link)</label>
                    <input 
                      type="url" 
                      placeholder="https://youtube.com/watch?v=..." 
                      value={optLink} 
                      onChange={(e) => setOptLink(e.target.value)} 
                      className="w-full bg-[#151515] border border-[#3D3215] px-4 py-2.5 rounded-xl text-xs font-bold text-white placeholder:text-[#737373] focus:border-[#D4A017] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">সংক্ষিপ্ত বিবরণ (Option Description)</label>
                    <input 
                      type="text" 
                      placeholder="ছোট একটি বিবরণ দিন" 
                      value={optDesc} 
                      onChange={(e) => setOptDesc(e.target.value)} 
                      className="w-full bg-[#151515] border border-[#3D3215] px-4 py-2.5 rounded-xl text-xs font-bold text-white placeholder:text-[#737373] focus:border-[#D4A017] outline-none" 
                    />
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => {
                    if (!optTitle || !optLink) {
                      toast.error("টাইটেল এবং ভিডিও লিংক দিন");
                      return;
                    }
                    const newItem = {
                      title: optTitle,
                      description: optDesc || 'টিউটোরিয়াল',
                      thumbnailUrl: optThumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
                      videoLink: optLink
                    };
                    setCourseItems(prev => [...prev, newItem]);
                    // Clear option fields
                    setOptTitle('');
                    setOptDesc('');
                    setOptThumbnail('');
                    setOptLink('');
                    toast.success("অপশন যুক্ত হয়েছে!");
                  }}
                  className="bg-[#1C1C1C] hover:bg-[#252525] border border-[#3D3215] text-[#FACC15] font-black px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  যুক্ত করুন (+ Add Option)
                </button>

                {/* Render added list items */}
                {courseItems.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-[#3D3215]">
                    <p className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1">যুক্ত অপশনসমূহ ({courseItems.length})</p>
                    <div className="grid gap-2 max-h-[220px] overflow-y-auto pr-1">
                      {courseItems.map((item, index) => (
                        <div key={index} className="bg-[#151515] p-3 rounded-xl border border-[#3D3215] flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-[#1C1C1C] border border-[#3D3215] text-[#FACC15] text-[9px] font-black flex items-center justify-center shrink-0">
                              {index + 1}
                            </span>
                            <img src={item.thumbnailUrl} alt="" className="w-10 h-8 object-cover rounded bg-[#101010] shrink-0 border border-[#3D3215]" />
                            <div className="min-w-0">
                              <h5 className="text-xs font-black text-white truncate max-w-[200px] leading-tight">{item.title}</h5>
                              <p className="text-[9px] text-[#A3A3A3] truncate max-w-[200px] leading-tight">{item.videoLink}</p>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => {
                              setCourseItems(prev => prev.filter((_, idx) => idx !== index));
                              toast.success("অপশন মুছে ফেলা হয়েছে!");
                            }}
                            className="text-[9px] font-black uppercase text-rose-400 hover:text-rose-300 hover:underline shrink-0 cursor-pointer"
                          >
                            মুছুন
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2.5">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg transition-all text-xs cursor-pointer"
                >
                  {editingCourseId ? 'আপডেট করুন (Save Changes)' : 'কোর্স তৈরি করুন (Create)'}
                </button>
                
                {editingCourseId && (
                  <button 
                    type="button"
                    onClick={() => {
                      setNewCourseTitle('');
                      setNewCourseDesc('');
                      setNewCourseThumbnail('');
                      setNewCourseLink('');
                      setNewCourseCategory('ইউটিউব মার্কেটিং');
                      setCourseItems([]);
                      setEditingCourseId(null);
                    }}
                    className="bg-[#1C1C1C] border border-[#3D3215] text-[#A3A3A3] hover:text-white font-bold px-6 py-3.5 rounded-2xl text-xs cursor-pointer"
                  >
                    বাতিল (Cancel)
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Admin Courses List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-black text-white uppercase tracking-tight text-xs">লাইভ কোর্সসমূহ ({adminCourses.length})</h3>
              
              <button 
                onClick={async () => {
                  try {
                    const batch = writeBatch(db);
                    const DEFAULT_ITEMS = [
                      {
                        title: "ইউটিউব মার্কেটিং বেসিক",
                        description: "ভিডিও আপলোড, এসইও এবং চ্যানেল অপটিমাইজেশন শিখুন",
                        thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
                        videoLink: "https://www.youtube.com",
                        category: "ইউটিউব মার্কেটিং",
                        status: 'active'
                      },
                      {
                        title: "ফেসবুক ভিডিও ক্যাম্পেইন",
                        description: "ফেসবুক পেজ গ্রোথ ও পেইড অ্যাড ক্যাম্পেইন সেটআপ",
                        thumbnailUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600&auto=format&fit=crop",
                        videoLink: "https://www.youtube.com",
                        category: "ফেসবুক মার্কেটিং",
                        status: 'active'
                      },
                      {
                        title: "ডিজিটাল প্রোডাক্ট সেলিং",
                        description: "অনলাইনে পণ্য বিক্রি এবং মার্কেটিং স্ট্র্যাটেজি",
                        thumbnailUrl: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=600&auto=format&fit=crop",
                        videoLink: "https://www.youtube.com",
                        category: "অন্যান্য",
                        status: 'active'
                      }
                    ];
                    DEFAULT_ITEMS.forEach((it, ix) => {
                      const id = `course_imported_${ix + Date.now()}`;
                      batch.set(doc(db, "courses", id), it);
                    });
                    await batch.commit();
                    toast.success("ডেমো কোর্সগুলো যুক্ত হয়েছে!");
                  } catch (err) {
                    toast.error("ব্যর্থ হয়েছে");
                  }
                }}
                className="text-[10px] font-black uppercase text-[#FACC15] hover:underline cursor-pointer"
              >
                + ডেমো কোর্স ইম্পোর্ট করুন
              </button>
            </div>

            {adminCourses.length === 0 && (
              <div className="text-center py-12 bg-[#151515] rounded-[32px] border-2 border-dashed border-[#3D3215]">
                <p className="text-xs font-bold text-[#A3A3A3] uppercase tracking-widest">কোন কোর্স পাওয়া যায়নি</p>
              </div>
            )}

            <div className="grid gap-4">
              {adminCourses.map(course => (
                <div key={course.id} className="bg-[#151515] p-4 rounded-2xl border border-[#3D3215] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <img 
                      src={course.thumbnailUrl} 
                      alt="" 
                      className="w-16 h-12 object-cover rounded-xl bg-[#101010] border border-[#3D3215] shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] px-2 py-0.5 bg-[#1C1C1C] border border-[#3D3215] text-[#FACC15] font-bold rounded-lg uppercase">
                          {course.category}
                        </span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider border ${course.status === 'active' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' : 'bg-[#1C1C1C] text-[#A3A3A3] border-[#3D3215]'}`}>
                          {course.status}
                        </span>
                      </div>
                      <h4 className="font-black text-white text-xs mt-1 truncate uppercase">{course.title}</h4>
                      <p className="text-[10px] text-[#A3A3A3] font-bold max-w-sm truncate leading-none mt-1">{course.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 w-full sm:w-auto shrink-0 border-t sm:border-y-0 border-[#3D3215] pt-3 sm:pt-0">
                    <button 
                      onClick={() => {
                        setNewCourseTitle(course.title || '');
                        setNewCourseDesc(course.description || '');
                        setNewCourseThumbnail(course.thumbnailUrl || '');
                        setNewCourseLink(course.videoLink || '');
                        setNewCourseCategory(course.category || 'ইউটিউব মার্কেটিং');
                        setCourseItems(course.items || []);
                        setEditingCourseId(course.id);
                        toast.success("এডিট মোড সক্রিয় করা হয়েছে!");
                      }}
                      className="text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl border border-[#3D3215] bg-[#1C1C1C] text-[#FACC15] hover:border-[#D4A017] transition-all cursor-pointer"
                    >
                      এডিট
                    </button>
                    
                    <button 
                      onClick={async () => {
                        try {
                          const toggledStatus = course.status === 'active' ? 'inactive' : 'active';
                          await updateDoc(doc(db, "courses", course.id), { status: toggledStatus });
                          toast.success(`কোর্সটি ${toggledStatus} করা হয়েছে`);
          clearCache();
          await loadData(true);
                        } catch (err) {
                          toast.error("ব্যর্থ হয়েছে");
                        }
                      }}
                      className={`text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl border cursor-pointer ${course.status === 'active' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' : 'bg-[#1C1C1C] text-[#A3A3A3] border-[#3D3215]'}`}
                    >
                      {course.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </button>

                    <button 
                      onClick={async () => {
                        if (confirm("আপনি কি নিশ্চিত এই কোর্সটি মুছে ফেলতে চান?")) {
                          try {
                            await deleteDoc(doc(db, "courses", course.id));
                            toast.success("মুছে ফেলা হয়েছে!");
          clearCache();
          await loadData(true);
                          } catch (err) {
                            toast.error("ব্যর্থ হয়েছে!");
                          }
                        }
                      }}
                      className="p-2 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/30 text-rose-400 rounded-xl transition-colors cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 px-1">
            <h3 className="font-black text-white flex items-center gap-2 uppercase tracking-tight text-sm">
              <Users className="w-4 h-4 text-[#FACC15]" /> Database Entities ({userList.length})
            </h3>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteDuplicateAdmins(); }}
                className="bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Delete Duplicate Admins
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); fixExploit(); }}
                className="bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/40 text-[#FACC15] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Fix Spin/Math Exploit
              </button>
              
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault(); e.stopPropagation();
                  setNotifyTarget('all');
                  setNotifyTitle('');
                  setNotifyMessage('');
                  setShowNotifyModal(true);
                }}
                className="bg-[#1C1C1C] hover:bg-[#252525] border border-[#3D3215] text-[#FACC15] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <BellRing className="w-3 h-3" /> Global Notify
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search by email or exact ID (Press Enter)"
                value={userSearchTerm}
                onChange={e => setUserSearchTerm(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && userSearchTerm.trim().length > 0) {
                     const qTerm = userSearchTerm.trim().toLowerCase();
                     try {
                        const byEmail = await getDocs(query(collection(db, "users"), where("email", "==", qTerm)));
                        const byId = await getDoc(doc(db, "users", qTerm));
                        let results: any[] = [];
                        if (byId.exists()) results.push({id: byId.id, ...byId.data()});
                        byEmail.forEach(d => { if(d.id !== qTerm) results.push({id: d.id, ...d.data()}) });
                        setUserList(results);
                        if (results.length === 0) toast.error("No users found");
                     } catch(err) { console.error(err?.message || "Unknown Error"); }
                  } else if (e.key === 'Enter' && userSearchTerm.trim().length === 0) {
                     const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(500)));
                     setUserList(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
                  }
                }}
                className="w-full bg-[#151515] border border-[#3D3215] rounded-xl pl-9 pr-4 py-2 text-sm font-bold placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#FACC15] text-white transition-all"
              />
            </div>
          </div>
          
          <div className="grid gap-4">
            {userList.filter(user => 
              (user.fullName || 'Anonymous').toLowerCase().includes(userSearchTerm.toLowerCase()) || 
              (user.email || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
              (user.id || '').toLowerCase().includes(userSearchTerm.toLowerCase())
            ).map(user => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                key={user.id} 
                className="bg-[#151515] p-5 rounded-[28px] shadow-sm border border-[#3D3215] flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FACC15]"></div>
                
                <div className="flex-1 pl-2">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-black text-white uppercase tracking-tight text-base italic">{user.fullName || 'Anonymous'}</h4>
                    <div className="flex gap-1 flex-wrap">
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest border ${user.isBlocked ? 'bg-rose-950/40 text-rose-400 border-rose-800/30' : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'}`}>
                        {user.isBlocked ? 'Blocked' : 'Normal Access'}
                      </span>
                      {user.role !== 'admin' && (
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest border ${user.isActive ? 'bg-blue-950/40 text-blue-400 border-blue-800/30' : 'bg-amber-950/40 text-amber-400 border-amber-800/30'}`}>
                          {user.isActive ? 'Activated' : 'Inactive'}
                        </span>
                      )}
                      {user.role === 'employee' && (
                        <span className="text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest bg-teal-950/40 text-teal-300 border border-teal-800/40">Employee</span>
                      )}
                      {user.role === 'admin' && (
                        <span className="text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest bg-[#1C1C1C] text-[#FACC15] border border-[#3D3215]">System Admin</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                    <div className="flex items-center gap-2 text-[#A3A3A3]">
                      <div className="w-5 h-5 rounded bg-[#1C1C1C] border border-[#3D3215] text-[#FACC15] flex items-center justify-center shrink-0"><User className="w-3 h-3" /></div>
                      <p className="text-[11px] font-bold truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[#A3A3A3]">
                      <div className="w-5 h-5 rounded bg-[#1C1C1C] border border-[#3D3215] text-[#FACC15] flex items-center justify-center shrink-0"><Calculator className="w-3 h-3" /></div>
                      <p className="text-[11px] font-mono font-bold tracking-tighter opacity-80">{user.deviceId || 'ID NOT LINKED'}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="bg-[#1C1C1C] px-3 py-1.5 rounded-xl border border-[#3D3215]">
                      <p className="text-[8px] font-black text-[#A3A3A3] uppercase tracking-widest leading-none mb-0.5">Main Balance</p>
                      <p className="text-xs font-black text-white leading-tight">{(user.balances?.main || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-[#1C1C1C] px-3 py-1.5 rounded-xl border border-[#3D3215]">
                      <p className="text-[8px] font-black text-[#A3A3A3] uppercase tracking-widest leading-none mb-0.5">Bonus Earnings</p>
                      <p className="text-xs font-black text-white leading-tight">{(user.balances?.bonus || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-[#1C1C1C] px-3 py-1.5 rounded-xl border border-[#3D3215]">
                      <p className="text-[8px] font-black text-[#A3A3A3] uppercase tracking-widest leading-none mb-0.5">Referral Earnings</p>
                      <p className="text-xs font-black text-white leading-tight">{(user.balances?.referral || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-[#1C1C1C] px-3 py-1.5 rounded-xl border border-[#3D3215]">
                      <p className="text-[8px] font-black text-[#A3A3A3] uppercase tracking-widest leading-none mb-0.5">Task Earnings</p>
                      <p className="text-xs font-black text-white leading-tight">{(
                        Object.values(user.balances?.tasks || {}).reduce((a: any, b: any) => Number(a || 0) + Number(b || 0), 0) as number
                      ).toFixed(2)}</p>
                    </div>
                    <div className="bg-[#1C1C1C] px-3 py-1.5 rounded-xl border border-[#D4A017]/40">
                      <p className="text-[8px] font-black text-[#FACC15] uppercase tracking-widest leading-none mb-0.5">Total</p>
                      <p className="text-xs font-black text-[#FACC15] leading-tight">{(
                        Number(user.balances?.main || 0) +
                        Number(user.balances?.bonus || 0) +
                        Number(user.balances?.referral || 0) +
                        Number(Object.values(user.balances?.tasks || {}).reduce((a: any, b: any) => Number(a || 0) + Number(b || 0), 0))
                      ).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
                  <button
                    onClick={() => {
                      setNotifyTarget(user.id);
                      setNotifyTitle('');
                      setNotifyMessage('');
                      setShowNotifyModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black uppercase tracking-[0.1em] text-[10px] transition-all active:scale-95 bg-[#1C1C1C] text-[#FACC15] border border-[#3D3215] hover:border-[#D4A017] cursor-pointer"
                  >
                    <BellRing className="w-3.5 h-3.5" /> Notify
                  </button>

                  {isFullAdmin && user.role !== 'admin' && (
                    <button 
                      onClick={() => {
                        setEmployeeConfigUser(user);
                        setEmployeePermissions(user.permissions || []);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black uppercase tracking-[0.1em] text-[10px] transition-all active:scale-95 bg-purple-950/40 text-purple-300 border border-purple-800/40 hover:bg-purple-900/60 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Config Employee
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setEditingUserBalance({
                        id: user.id,
                        fullName: user.fullName || 'Anonymous',
                        main: Number(user.balances?.main || 0),
                        bonus: Number(user.balances?.bonus || 0),
                        referral: Number(user.balances?.referral || 0),
                        partner: Number(user.balances?.partner || 0),
                        tasks: Number(Object.values(user.balances?.tasks || {}).reduce((a: any, b: any) => Number(a || 0) + Number(b || 0), 0))
                      });
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black uppercase tracking-[0.1em] text-[10px] transition-all active:scale-95 bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/60 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" /> Edit Balance
                  </button>
                  {isFullAdmin && user.role !== 'admin' && (
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black uppercase tracking-[0.1em] text-[10px] transition-all active:scale-95 bg-rose-950/40 text-rose-400 border border-rose-800/40 hover:bg-rose-900/60 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete User
                    </button>
                  )}
                  {user.role !== 'admin' && (
                    <button 
                      onClick={() => handleToggleActive(user.id, user.isActive || false)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black uppercase tracking-[0.1em] text-[10px] transition-all active:scale-95 disabled:opacity-30 cursor-pointer ${
                        !user.isActive 
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-950/40' 
                          : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/40'
                      }`}
                    >
                      {!user.isActive ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" /> Activate
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Deactivate
                        </>
                      )}
                    </button>
                  )}
                  <button 
                    onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                    disabled={user.role === 'admin'}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black uppercase tracking-[0.1em] text-[10px] transition-all active:scale-95 disabled:opacity-30 cursor-pointer ${
                      user.isBlocked 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40' 
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40'
                    }`}
                  >
                    {user.isBlocked ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" /> Grant Access
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5" /> Restrict User
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
        <div className="space-y-6">
          {/* Settings Sub Tabs Menu */}
          <div className="flex bg-[#151515] p-1.5 rounded-[24px] overflow-x-auto gap-2 no-scrollbar ring-1 ring-[#3D3215] border border-[#3D3215]">
            {[
              { id: 'identity', label: 'সাইট আইডেন্টিটি', sub: 'Identity & Info', icon: Globe },
              { id: 'gateways', label: 'পেমেন্ট গেটওয়ে', sub: 'Deposit & Cashout', icon: Wallet },
              { id: 'rewards', label: 'রিওয়ার্ড ও রেফারেল', sub: 'Referrals & Spins', icon: Coins },
              { id: 'security', label: 'সিকিউরিটি ও পপআপ', sub: 'Gates & Popups', icon: Lock },
              ...(isFullAdmin ? [{ id: 'danger', label: 'সিস্টেম রিসেট', sub: 'System Reset', icon: Trash2 }] : [])
            ].map(st => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSettingsSubTab(st.id as any)}
                className={`flex-1 min-w-[170px] md:min-w-0 py-3 px-4 rounded-[18px] text-[11px] font-black transition-all duration-200 flex items-center gap-2.5 whitespace-nowrap active:scale-95 cursor-pointer ${
                  settingsSubTab === st.id
                    ? 'bg-gradient-to-r from-[#8A6508] via-[#D4A017] to-[#FACC15] text-[#090909] shadow-lg shadow-[#D4A017]/20 font-black'
                    : 'text-[#A3A3A3] hover:text-[#FACC15] hover:bg-[#1C1C1C]'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  settingsSubTab === st.id ? 'bg-[#090909]/20 text-[#090909]' : 'bg-[#1C1C1C] border border-[#3D3215] text-[#FACC15]'
                }`}>
                  <st.icon className="w-4 h-4" />
                </div>
                <div className="text-left flex flex-col">
                  <span className="font-extrabold text-[12px] tracking-tight">{st.label}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider leading-none ${
                    settingsSubTab === st.id ? 'text-[#090909]/70' : 'text-[#737373]'
                  }`}>{st.sub}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Popup Settings */}
            {settingsSubTab === 'security' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#151515] p-6 rounded-[32px] shadow-sm border border-[#3D3215] flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15]">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-white uppercase tracking-tight italic">Popup System</h3>
                    <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest leading-none">Global Announcements</p>
                  </div>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div className="group">
                    <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block group-focus-within:text-[#FACC15] transition-colors">Announcement Title</label>
                    <input type="text" value={popupSettings.title} onChange={(e) => setPopupSettings(prev => ({ ...prev, title: e.target.value }))} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white placeholder:text-[#737373] focus:border-[#FACC15] focus:outline-none transition-all" />
                  </div>
                  <div className="group">
                    <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block group-focus-within:text-[#FACC15] transition-colors">Subtitle / Body</label>
                    <input type="text" value={popupSettings.subtitle} onChange={(e) => setPopupSettings(prev => ({ ...prev, subtitle: e.target.value }))} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white placeholder:text-[#737373] focus:border-[#FACC15] focus:outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="group">
                      <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">Telegram Link</label>
                      <input type="text" value={popupSettings.telegramLink} onChange={(e) => setPopupSettings(prev => ({ ...prev, telegramLink: e.target.value }))} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-xs font-bold text-white focus:border-[#FACC15] focus:outline-none" />
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">Skip Link</label>
                      <input type="text" value={popupSettings.skipLink} onChange={(e) => setPopupSettings(prev => ({ ...prev, skipLink: e.target.value }))} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-xs font-bold text-white focus:border-[#FACC15] focus:outline-none" />
                    </div>
                  </div>
                </div>
                
                <button type="button" onClick={handleSavePopupSettings} disabled={isSavingSettings} className="mt-6 w-full bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer">
                  {isSavingSettings ? <><RefreshCw className="w-4 h-4 animate-spin" /> Updating...</> : 'Save Popup'}
                </button>
              </motion.div>
            )}

          {/* Site Identity */}
          {settingsSubTab === 'identity' && (
            <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#151515] p-6 rounded-[32px] shadow-sm border border-[#3D3215] flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15]">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-white uppercase tracking-tight italic">Identity & Limits</h3>
                <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest leading-none">Branding & Task Controls</p>
              </div>
            </div>
            
            <div className="space-y-5 flex-1">
              <div className="group">
                <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block group-focus-within:text-[#FACC15]">Site Name</label>
                <input type="text" value={siteSettings.siteName} onChange={(e) => setSiteSettings(prev => ({ ...prev, siteName: e.target.value }))} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-[11px] font-bold text-white focus:border-[#FACC15] focus:outline-none" />
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block group-focus-within:text-[#FACC15]">Logo (Master Asset)</label>
                <div className="flex gap-2">
                  <input type="text" value={siteSettings.logoUrl} onChange={(e) => setSiteSettings(prev => ({ ...prev, logoUrl: e.target.value }))} className="flex-1 bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-[11px] font-bold text-white focus:border-[#FACC15] focus:outline-none" />
                  <div className="relative overflow-hidden group shrink-0">
                    <button type="button" className="bg-[#1C1C1C] border border-[#3D3215] px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-wider text-[#FACC15] hover:border-[#D4A017] transition-all">Upload</button>
                    <input type="file" accept="image/*" onChange={(e) => handleUploadImage(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
                {siteSettings.logoUrl && (
                  <div className="mt-3 p-3 bg-[#101010] rounded-2xl border border-[#3D3215] flex items-center gap-3">
                    <div className="h-12 min-w-[48px] max-w-[160px] bg-black/60 rounded-xl p-1 flex items-center justify-center border border-[#3D3215]/50 overflow-hidden">
                      <img src={siteSettings.logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div>
                      <span className="text-[11px] text-green-400 font-bold flex items-center gap-1">✓ লোগো সফলভাবে লোড হয়েছে</span>
                      <p className="text-[9px] text-[#A3A3A3] mt-0.5">সব ডিভাইসে পারফেক্টলি ফিট হবে</p>
                    </div>
                  </div>
                )}
                <p className="text-[9.5px] text-[#FACC15]/80 pl-1 mt-2 leading-relaxed">
                  💡 <strong>লোগোর সাইজ ও শেপ নির্দেশিকা:</strong> স্কয়ার (১:১ রেশিও, যেমন 512×512px) অথবা ওয়াইড/ব্যানার (৩:১ রেশিও, যেমন 600×200px) স্বচ্ছ (Transparent PNG) লোগো সেরা। সাইট যেকোনো শেপ স্বয়ংক্রিয়ভাবে পারফেক্ট সাইজে অ্যাডজাস্ট করে নেয়।
                </p>
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block group-focus-within:text-[#FACC15]">Floating Telegram URL</label>
                <input type="text" value={siteSettings.telegramUrl} onChange={(e) => setSiteSettings(prev => ({ ...prev, telegramUrl: e.target.value }))} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-[11px] font-bold text-white focus:border-[#FACC15] focus:outline-none" placeholder="https://t.me/yourchannel" />
              </div>
              <div className="group mt-3">
                <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block group-focus-within:text-[#FACC15]">Direct APK Download URL</label>
                <input type="text" value={siteSettings.apkUrl || ''} onChange={(e) => setSiteSettings(prev => ({ ...prev, apkUrl: e.target.value }))} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-[11px] font-bold text-white focus:border-[#FACC15] focus:outline-none" placeholder="https://example.com/app.apk" />
                <p className="text-[9px] text-[#737373] pl-1 mt-1">If provided, this URL will be used for out-of-store direct APK installs instead of PWA installation.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="group">
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block group-focus-within:text-[#FACC15]">Ads View Button Text</label>
                  <input type="text" value={siteSettings.adsViewText} onChange={(e) => setSiteSettings(prev => ({ ...prev, adsViewText: e.target.value }))} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-[11px] font-bold text-white focus:border-[#FACC15] focus:outline-none" placeholder="Watch Ads" />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block group-focus-within:text-[#FACC15]">Ads View Link</label>
                  <input type="text" value={siteSettings.adsViewLink} onChange={(e) => setSiteSettings(prev => ({ ...prev, adsViewLink: e.target.value }))} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-[11px] font-bold text-white focus:border-[#FACC15] focus:outline-none" placeholder="https://..." />
                </div>
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block group-focus-within:text-[#FACC15]">Daily Task Limit (Per User)</label>
                <input type="number" value={siteSettings.dailyTaskLimit} onChange={(e) => setSiteSettings(prev => ({ ...prev, dailyTaskLimit: Number(e.target.value) }))} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-[11px] font-bold text-white focus:border-[#FACC15] focus:outline-none" placeholder="0 for unlimited" />
                <p className="text-[9px] text-[#737373] mt-1 px-1">Maximum tasks a user can submit in 24 hours.</p>
              </div>
              <div className="p-4 bg-[#101010] rounded-2xl border border-[#3D3215] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-tight">Drive Offer Option</h4>
                  <p className="text-[9px] text-[#A3A3A3] font-bold uppercase tracking-wider">Enable/Disable Drive Offer page access</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${siteSettings.driveOffersEnabled ? 'text-[#FACC15]' : 'text-[#737373]'}`}>
                    {siteSettings.driveOffersEnabled ? 'ON' : 'OFF'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSiteSettings(prev => ({ ...prev, driveOffersEnabled: !prev.driveOffersEnabled }))}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${siteSettings.driveOffersEnabled ? 'bg-[#FACC15]' : 'bg-[#262626] border border-[#3D3215]'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${siteSettings.driveOffersEnabled ? 'translate-x-6 bg-[#090909]' : 'bg-[#737373]'}`} />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-[#101010] rounded-2xl border border-[#3D3215] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-tight">Course Feature Option</h4>
                  <p className="text-[9px] text-[#A3A3A3] font-bold uppercase tracking-wider">Enable/Disable Course action access</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${siteSettings.coursesEnabled !== false ? 'text-[#FACC15]' : 'text-[#737373]'}`}>
                    {siteSettings.coursesEnabled !== false ? 'ON' : 'OFF'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSiteSettings(prev => ({ ...prev, coursesEnabled: !prev.coursesEnabled }))}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${siteSettings.coursesEnabled !== false ? 'bg-[#FACC15]' : 'bg-[#262626] border border-[#3D3215]'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${siteSettings.coursesEnabled !== false ? 'translate-x-6 bg-[#090909]' : 'bg-[#737373]'}`} />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-[#101010] rounded-2xl border border-[#3D3215] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-tight">Ads View Earnings</h4>
                  <p className="text-[9px] text-[#A3A3A3] font-bold uppercase tracking-wider">Enable/Disable Ads View action access</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${siteSettings.adsViewEnabled ? 'text-[#FACC15]' : 'text-[#737373]'}`}>
                    {siteSettings.adsViewEnabled ? 'ON' : 'OFF'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSiteSettings(prev => ({ ...prev, adsViewEnabled: !prev.adsViewEnabled }))}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${siteSettings.adsViewEnabled ? 'bg-[#FACC15]' : 'bg-[#262626] border border-[#3D3215]'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${siteSettings.adsViewEnabled ? 'translate-x-6 bg-[#090909]' : 'bg-[#737373]'}`} />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-[#101010] rounded-2xl border border-[#3D3215] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-tight">Review Jobs Option</h4>
                  <p className="text-[9px] text-[#A3A3A3] font-bold uppercase tracking-wider">Enable/Disable Review Jobs action access</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${siteSettings.reviewsEnabled !== false ? 'text-[#FACC15]' : 'text-[#737373]'}`}>
                    {siteSettings.reviewsEnabled !== false ? 'ON' : 'OFF'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSiteSettings(prev => ({ ...prev, reviewsEnabled: prev.reviewsEnabled === false ? true : false }))}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${siteSettings.reviewsEnabled !== false ? 'bg-[#FACC15]' : 'bg-[#262626] border border-[#3D3215]'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${siteSettings.reviewsEnabled !== false ? 'translate-x-6 bg-[#090909]' : 'bg-[#737373]'}`} />
                  </button>
                </div>
              </div>
            </div>
            
            <button onClick={handleSaveSiteSettings} disabled={isSavingSettings} className="mt-6 w-full bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-xs cursor-pointer">Update Identity</button>
          </motion.div>

          {/* Support Channels */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#151515] p-6 rounded-[32px] shadow-sm border border-[#3D3215]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-white uppercase tracking-tight italic">Support Grid</h3>
                <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest leading-none">Contact Config</p>
              </div>
            </div>
            
            <div className="grid gap-4">
              <div className="flex items-center gap-3 bg-[#101010] p-3 rounded-[20px] border border-[#3D3215]">
                <div className="w-8 h-8 rounded-xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15]"><Mail className="w-4 h-4" /></div>
                <input type="email" value={supportSettings.email} onChange={(e) => setSupportSettings(prev => ({ ...prev, email: e.target.value }))} className="bg-transparent border-none p-0 flex-1 text-sm font-bold text-white placeholder:text-[#737373] focus:ring-0" placeholder="Support Email" />
              </div>
              <div className="flex items-center gap-3 bg-[#101010] p-3 rounded-[20px] border border-[#3D3215]">
                <div className="w-8 h-8 rounded-xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-emerald-400"><Smartphone className="w-4 h-4" /></div>
                <input type="text" value={supportSettings.whatsapp} onChange={(e) => setSupportSettings(prev => ({ ...prev, whatsapp: e.target.value }))} className="bg-transparent border-none p-0 flex-1 text-sm font-bold text-white placeholder:text-[#737373] focus:ring-0" placeholder="WhatsApp Link" />
              </div>
              <div className="flex items-center gap-3 bg-[#101010] p-3 rounded-[20px] border border-[#3D3215]">
                <div className="w-8 h-8 rounded-xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15]"><Send className="w-4 h-4" /></div>
                <input type="text" value={supportSettings.telegram} onChange={(e) => setSupportSettings(prev => ({ ...prev, telegram: e.target.value }))} className="bg-transparent border-none p-0 flex-1 text-sm font-bold text-white placeholder:text-[#737373] focus:ring-0" placeholder="Telegram Link" />
              </div>
              <div className="flex items-center gap-3 bg-[#101010] p-3 rounded-[20px] border border-[#3D3215]">
                <div className="w-8 h-8 rounded-xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-sky-400"><MessageCircle className="w-4 h-4" /></div>
                <input type="text" value={supportSettings.facebook} onChange={(e) => setSupportSettings(prev => ({ ...prev, facebook: e.target.value }))} className="bg-transparent border-none p-0 flex-1 text-sm font-bold text-white placeholder:text-[#737373] focus:ring-0" placeholder="Facebook Profile" />
              </div>
            </div>
            
            <button onClick={handleSaveSupportSettings} disabled={isSavingSettings} className="mt-6 w-full bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-xs cursor-pointer">Save Channels</button>
          </motion.div>
          </>)}

          {/* Spin Wheel Settings */}
          {settingsSubTab === 'rewards' && (
            <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-[#151515] p-6 rounded-[32px] shadow-sm border border-[#3D3215] flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15]">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-white uppercase tracking-tight italic">Fortune Wheel</h3>
                <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest leading-none">Reward Probability</p>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 flex-1">
              {spinRewards.map((reward, index) => (
                <div key={index} className="group">
                  <label className="text-[8px] font-black text-[#A3A3A3] uppercase tracking-tighter pl-1 mb-1 block">Slice {index + 1}</label>
                  <input
                    type="number"
                    value={reward}
                    onChange={(e) => {
                      const newRewards = [...spinRewards];
                      newRewards[index] = Number(e.target.value);
                      setSpinRewards(newRewards);
                    }}
                    className="w-full bg-[#101010] border border-[#3D3215] px-1 py-2 rounded-xl text-center font-black text-xs text-white focus:border-[#FACC15] focus:outline-none"
                  />
                </div>
              ))}
            </div>
            
            <button onClick={handleSaveSpinSettings} disabled={isSavingSettings} className="mt-6 w-full bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-xs cursor-pointer">Sync Rewards</button>
          </motion.div>

          {/* Referral Engine */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#151515] p-6 rounded-[32px] shadow-sm border border-[#3D3215]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15]">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-white uppercase tracking-tight italic">Referral Engine</h3>
                <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest leading-none">Yield Configuration</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(gen => (
                  <div key={gen} className="group">
                    <label className="text-[9px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">Gen {gen} (৳)</label>
                    <input 
                      type="number" 
                      value={gen === 1 ? referralSettings.fixedBonus : (gen === 2 ? referralSettings.gen2FixedBonus : referralSettings.gen3FixedBonus)} 
                      onChange={(e) => setReferralSettings(prev => ({ ...prev, [gen === 1 ? 'fixedBonus' : (gen === 2 ? 'gen2FixedBonus' : 'gen3FixedBonus')]: Number(e.target.value) }))} 
                      className="w-full bg-[#101010] border border-[#3D3215] px-2 py-2.5 rounded-xl text-center text-sm font-black text-white focus:border-[#FACC15] focus:outline-none" 
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[1, 2, 3].map(gen => (
                  <div key={gen} className="group">
                    <label className="text-[9px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">Yield {gen} (%)</label>
                    <input 
                      type="number" 
                      value={gen === 1 ? referralSettings.gen1Percent : (gen === 2 ? referralSettings.gen2Percent : referralSettings.gen3Percent)} 
                      onChange={(e) => setReferralSettings(prev => ({ ...prev, [gen === 1 ? 'gen1Percent' : (gen === 2 ? 'gen2Percent' : 'gen3Percent')]: Number(e.target.value) }))} 
                      className="w-full bg-[#1C1C1C] border border-[#3D3215] px-2 py-2.5 rounded-xl text-center text-sm font-black text-[#FACC15] focus:border-[#FACC15] focus:outline-none" 
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <button onClick={handleSaveReferralSettings} disabled={isSavingSettings} className="mt-6 w-full bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-xs cursor-pointer">Reload Engine</button>
          </motion.div>

          {/* Partner Engine */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-[#151515] p-6 rounded-[32px] shadow-sm border border-[#3D3215]">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-2xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-white uppercase tracking-tight italic">Partner Program</h3>
                <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest leading-none">Daily Yield Rules</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#101010] p-3 rounded-[20px] border border-[#3D3215]">
                <span className="text-xs font-bold text-white ml-2">Enable Partner System</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={partnerSettings.enabled} onChange={(e) => setPartnerSettings(prev => ({ ...prev, enabled: e.target.checked }))} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#262626] peer-focus:outline-none rounded-full peer border border-[#3D3215] peer-checked:after:translate-x-full peer-checked:after:border-[#090909] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#737373] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:bg-[#090909] peer-checked:bg-[#FACC15]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between bg-[#101010] p-3 rounded-[20px] border border-[#3D3215]">
                <span className="text-xs font-bold text-white ml-2">Enable Partner Withdrawals</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={partnerSettings.withdrawEnabled} onChange={(e) => setPartnerSettings(prev => ({ ...prev, withdrawEnabled: e.target.checked }))} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#262626] peer-focus:outline-none rounded-full peer border border-[#3D3215] peer-checked:after:translate-x-full peer-checked:after:border-[#090909] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#737373] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:bg-[#090909] peer-checked:bg-[#FACC15]"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">Required Referrals</label>
                  <input type="number" value={partnerSettings.requiredReferrals} onChange={(e) => setPartnerSettings(prev => ({ ...prev, requiredReferrals: Number(e.target.value) }))} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-black text-white focus:border-[#FACC15] focus:outline-none" />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">Daily Bonus (৳)</label>
                  <input type="number" value={partnerSettings.dailyBonus} onChange={(e) => setPartnerSettings(prev => ({ ...prev, dailyBonus: Number(e.target.value) }))} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-black text-[#FACC15] focus:border-[#FACC15] focus:outline-none" />
                </div>
              </div>
            </div>
            
            <button onClick={handleSavePartnerSettings} disabled={isSavingSettings} className="mt-6 w-full bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-xs cursor-pointer">Save Partner Rules</button>
          </motion.div>
          </>)}

          {/* Announcement Scroller */}
          {settingsSubTab === 'identity' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#151515] p-6 rounded-[32px] shadow-sm border border-[#3D3215]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15]">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-white uppercase tracking-tight italic">Global Banner</h3>
                <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest leading-none">Ticker Configuration</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <textarea value={bannerSettings.text} onChange={(e) => setBannerSettings(prev => ({ ...prev, text: e.target.value }))} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-bold text-white h-24 placeholder:text-[#737373] focus:border-[#FACC15] focus:outline-none" placeholder="Marquee News Text..." />
              <input type="text" value={bannerSettings.link} onChange={(e) => setBannerSettings(prev => ({ ...prev, link: e.target.value }))} className="w-full bg-[#1C1C1C] border border-[#3D3215] px-4 py-3 rounded-2xl text-xs font-bold text-[#FACC15] italic placeholder:text-[#737373] focus:border-[#FACC15] focus:outline-none" placeholder="Promo Link URL" />
            </div>
            
            <button onClick={handleSaveBannerSettings} disabled={isSavingSettings} className="mt-6 w-full bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-xs cursor-pointer">Update Marquee</button>
          </motion.div>
          )}

          {/* Game Gates */}
          {settingsSubTab === 'security' && (
            <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-[#151515] p-6 rounded-[32px] shadow-sm border border-[#3D3215]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15]">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-white uppercase tracking-tight italic">Game Unlock Logic</h3>
                <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest leading-none">Gatekeeping Rules</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#101010] p-4 rounded-2xl border border-[#3D3215]">
                <p className="text-[10px] font-black text-[#FACC15] uppercase tracking-widest mb-3">Spin Requirements</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-[#1C1C1C] border border-[#3D3215] px-3 py-2 rounded-xl shadow-sm">
                    <span className="text-[9px] font-bold text-[#A3A3A3]">Task Earnings</span>
                    <input type="number" value={gameSettings.spinTaskReq} onChange={(e) => setGameSettings(prev => ({ ...prev, spinTaskReq: Number(e.target.value) }))} className="w-10 bg-transparent border-none p-0 text-right text-xs font-black text-white focus:outline-none" />
                  </div>
                  <div className="flex justify-between items-center bg-[#1C1C1C] border border-[#3D3215] px-3 py-2 rounded-xl shadow-sm">
                    <span className="text-[9px] font-bold text-[#A3A3A3]">Refers</span>
                    <input type="number" value={gameSettings.spinReferReq} onChange={(e) => setGameSettings(prev => ({ ...prev, spinReferReq: Number(e.target.value) }))} className="w-10 bg-transparent border-none p-0 text-right text-xs font-black text-white focus:outline-none" />
                  </div>
                </div>
              </div>
              <div className="bg-[#101010] p-4 rounded-2xl border border-[#3D3215]">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">Math Requirements</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-[#1C1C1C] border border-[#3D3215] px-3 py-2 rounded-xl shadow-sm">
                    <span className="text-[9px] font-bold text-[#A3A3A3]">Task Earnings</span>
                    <input type="number" value={gameSettings.mathTaskReq} onChange={(e) => setGameSettings(prev => ({ ...prev, mathTaskReq: Number(e.target.value) }))} className="w-10 bg-transparent border-none p-0 text-right text-xs font-black text-white focus:outline-none" />
                  </div>
                  <div className="flex justify-between items-center bg-[#1C1C1C] border border-[#3D3215] px-3 py-2 rounded-xl shadow-sm">
                    <span className="text-[9px] font-bold text-[#A3A3A3]">Refers</span>
                    <input type="number" value={gameSettings.mathReferReq} onChange={(e) => setGameSettings(prev => ({ ...prev, mathReferReq: Number(e.target.value) }))} className="w-10 bg-transparent border-none p-0 text-right text-xs font-black text-white focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>
            
            <button onClick={handleSaveGameSettings} disabled={isSavingSettings} className="mt-6 w-full bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-xs cursor-pointer italic">Sync Logic</button>
          </motion.div>

          {/* Account Integrity */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-[#151515] p-6 rounded-[32px] shadow-sm border border-[#3D3215]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-white uppercase tracking-tight italic">Account Integrity</h3>
                <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest leading-none">Security Gates</p>
              </div>
            </div>
            
            <div className="bg-[#101010] p-5 rounded-3xl border border-[#3D3215]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-white">Activation Mode</span>
                <select value={activationSettings.mode} onChange={(e) => setActivationSettings(prev => ({ ...prev, mode: e.target.value as 'free'|'paid' }))} className="bg-[#1C1C1C] text-white border border-[#3D3215] rounded-xl text-[10px] font-black uppercase py-1.5 px-3 focus:outline-none">
                  <option value="free">Permissive (Free)</option>
                  <option value="paid">Restrictive (Paid)</option>
                </select>
              </div>
              {activationSettings.mode === 'paid' && (
                <div className="pt-2 border-t border-[#3D3215] flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-[#A3A3A3]">Mandatory Fee</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-[#FACC15]">৳</span>
                    <input type="number" value={activationSettings.fee} onChange={(e) => setActivationSettings(prev => ({ ...prev, fee: Number(e.target.value) }))} className="w-16 bg-[#1C1C1C] border border-[#3D3215] text-white rounded-xl text-center text-sm font-black p-2 focus:border-[#FACC15] focus:outline-none" />
                  </div>
                </div>
              )}
            </div>
            
            <button onClick={handleSaveActivationSettings} disabled={isSavingSettings} className="mt-6 w-full bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-xs cursor-pointer">Lock Configuration</button>
          </motion.div>
          </>)}

          {/* Withdrawal Protocol */}
          {settingsSubTab === 'gateways' && (
            <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-[#151515] p-6 rounded-[32px] shadow-sm border border-[#3D3215]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15]">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-white uppercase tracking-tight italic">Payout Protocol</h3>
                <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest leading-none">Financial Limits</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { key: 'Main', min: withdrawSettings.mainMin, fee: withdrawSettings.mainFee, minSetter: 'mainMin', feeSetter: 'mainFee', color: 'text-[#FACC15]' },
                { key: 'Bonus', min: withdrawSettings.bonusMin, fee: withdrawSettings.bonusFee, minSetter: 'bonusMin', feeSetter: 'bonusFee', color: 'text-[#FACC15]' },
                { key: 'Referral', min: withdrawSettings.referralMin, fee: withdrawSettings.referralFee, minSetter: 'referralMin', feeSetter: 'referralFee', color: 'text-[#FACC15]' },
                { key: 'Tasks', min: withdrawSettings.tasksMin, fee: withdrawSettings.tasksFee, minSetter: 'tasksMin', feeSetter: 'tasksFee', color: 'text-[#FACC15]' }
              ].map(wallet => (
                <div key={wallet.key} className="bg-[#101010] p-3 rounded-2xl flex items-center justify-between border border-[#3D3215]">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${wallet.color} w-16`}>{wallet.key}</span>
                  <div className="flex-1 flex gap-2 justify-end">
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-bold text-[#A3A3A3] uppercase tracking-tighter">Min ৳</span>
                      <input type="number" value={wallet.min} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, [wallet.minSetter]: Number(e.target.value) }))} className="w-14 bg-[#1C1C1C] border border-[#3D3215] text-white text-[11px] font-black p-1.5 rounded-lg text-center focus:border-[#FACC15] focus:outline-none" />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-bold text-[#A3A3A3] uppercase tracking-tighter">Fee %</span>
                      <input type="number" value={wallet.fee} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, [wallet.feeSetter]: Number(e.target.value) }))} className="w-12 bg-[#1C1C1C] border border-[#3D3215] text-rose-400 text-[11px] font-black p-1.5 rounded-lg text-center focus:border-[#FACC15] focus:outline-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-[#101010] p-4 rounded-3xl space-y-2 border border-[#3D3215]">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FACC15] block">Withdraw Option Amounts (৳)</span>
              <p className="text-[9px] text-[#A3A3A3] font-bold uppercase leading-tight">Comma-separated withdraw options for each wallet</p>
              
              <div className="space-y-3 mt-3">
                <div>
                  <span className="text-[10px] font-bold text-[#A3A3A3] uppercase">Main Wallet Amounts</span>
                  <input type="text" value={withdrawSettings.mainAmounts || ""} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, mainAmounts: e.target.value }))} className="w-full bg-[#1C1C1C] border border-[#3D3215] rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider text-white placeholder:text-[#737373] mt-1 focus:border-[#FACC15] focus:outline-none" placeholder="110, 210..." />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#A3A3A3] uppercase">Bonus Wallet Amounts</span>
                  <input type="text" value={withdrawSettings.bonusAmounts || ""} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, bonusAmounts: e.target.value }))} className="w-full bg-[#1C1C1C] border border-[#3D3215] rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider text-white placeholder:text-[#737373] mt-1 focus:border-[#FACC15] focus:outline-none" placeholder="110, 210..." />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#A3A3A3] uppercase">Referral Wallet Amounts</span>
                  <input type="text" value={withdrawSettings.referralAmounts || ""} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, referralAmounts: e.target.value }))} className="w-full bg-[#1C1C1C] border border-[#3D3215] rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider text-white placeholder:text-[#737373] mt-1 focus:border-[#FACC15] focus:outline-none" placeholder="110, 210..." />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#A3A3A3] uppercase">Partner Wallet Amounts</span>
                  <input type="text" value={withdrawSettings.partnerAmounts || ""} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, partnerAmounts: e.target.value }))} className="w-full bg-[#1C1C1C] border border-[#3D3215] rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider text-white placeholder:text-[#737373] mt-1 focus:border-[#FACC15] focus:outline-none" placeholder="110, 210..." />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#A3A3A3] uppercase">Gift Wallet Amounts</span>
                  <input type="text" value={withdrawSettings.giftAmounts || ""} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, giftAmounts: e.target.value }))} className="w-full bg-[#1C1C1C] border border-[#3D3215] rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider text-white placeholder:text-[#737373] mt-1 focus:border-[#FACC15] focus:outline-none" placeholder="110, 210..." />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#A3A3A3] uppercase">Tasks Wallet Amounts</span>
                  <input type="text" value={withdrawSettings.tasksAmounts || ""} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, tasksAmounts: e.target.value }))} className="w-full bg-[#1C1C1C] border border-[#3D3215] rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider text-white placeholder:text-[#737373] mt-1 focus:border-[#FACC15] focus:outline-none" placeholder="110, 210..." />
                </div>
              </div>
            </div>
            
            <button onClick={handleSaveWithdrawSettings} disabled={isSavingSettings} className="mt-6 w-full bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-xl active:scale-95 transition-all text-xs cursor-pointer">Execute Protocol</button>
          </motion.div>

          {/* Deposit Gateways */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-[#151515] p-6 rounded-[32px] shadow-sm border border-[#3D3215]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15]">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-white uppercase tracking-tight italic">Funding Gateways</h3>
                <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest leading-none">Inbound Channels</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-[#101010] p-4 rounded-3xl space-y-4 border border-[#3D3215]">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#e2136e] flex items-center justify-center text-white text-[10px] font-black">BKASH</div>
                      <input type="text" value={depositSettings.bkashNumber} onChange={(e) => setDepositSettings(prev => ({ ...prev, bkashNumber: e.target.value }))} className="flex-1 bg-[#1C1C1C] border border-[#3D3215] rounded-xl px-3 py-2.5 text-sm font-black tracking-widest text-[#e2136e] focus:border-[#FACC15] focus:outline-none" placeholder="01XXX-XXXXXX" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!depositSettings.bkashEnabled} onChange={(e) => setDepositSettings(prev => ({ ...prev, bkashEnabled: e.target.checked }))} className="w-4 h-4 text-[#FACC15] bg-[#1C1C1C] border-[#3D3215] rounded focus:ring-0" />
                      <span className="text-xs font-bold text-[#A3A3A3]">Enabled</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-[#3D3215] pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#ea232a] flex items-center justify-center text-white text-[10px] font-black">NAGAD</div>
                      <input type="text" value={depositSettings.nagadNumber} onChange={(e) => setDepositSettings(prev => ({ ...prev, nagadNumber: e.target.value }))} className="flex-1 bg-[#1C1C1C] border border-[#3D3215] rounded-xl px-3 py-2.5 text-sm font-black tracking-widest text-[#ea232a] focus:border-[#FACC15] focus:outline-none" placeholder="01XXX-XXXXXX" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!depositSettings.nagadEnabled} onChange={(e) => setDepositSettings(prev => ({ ...prev, nagadEnabled: e.target.checked }))} className="w-4 h-4 text-[#FACC15] bg-[#1C1C1C] border-[#3D3215] rounded focus:ring-0" />
                      <span className="text-xs font-bold text-[#A3A3A3]">Enabled</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">Min (৳)</label>
                  <input type="number" value={depositSettings.minDeposit} onChange={(e) => setDepositSettings(prev => ({ ...prev, minDeposit: Number(e.target.value) }))} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-black text-white focus:border-[#FACC15] focus:outline-none" />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-1 block">Max (৳)</label>
                  <input type="number" value={depositSettings.maxDeposit} onChange={(e) => setDepositSettings(prev => ({ ...prev, maxDeposit: Number(e.target.value) }))} className="w-full bg-[#101010] border border-[#3D3215] px-4 py-3 rounded-2xl text-sm font-black text-white opacity-50 focus:border-[#FACC15] focus:outline-none" />
                </div>
              </div>
            </div>
            
            <button onClick={handleSaveDepositSettings} disabled={isSavingSettings} className="mt-6 w-full bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-xs cursor-pointer">Update Gateways</button>
          </motion.div>
          </>)}

          {isFullAdmin && settingsSubTab === 'danger' && (
            <div className="space-y-6 md:col-span-2 mt-4">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-[#151515] p-6 rounded-[32px] shadow-sm border border-[#3D3215]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-[#FACC15]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base uppercase tracking-tight">মাস্টার ফ্যাক্টরি রিসেট ও ফুল ডাটা ওয়াইপ (All-in-One Master Reset)</h3>
                    <p className="text-[11px] font-bold text-[#FACC15] uppercase tracking-widest leading-none">Complete Wipe, Balance 0.00 & Official Settings Reset</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-[#A3A3A3] mb-4 leading-relaxed">
                  একটি সিঙ্গেল বাটনে সম্পূর্ণ সিস্টেমকে ফ্যাক্টরি ফ্রেশ ও ব্র্যান্ড-নিউ করুন। ব্যালেন্স ০ করা, পুরোনো ডাটা ওয়াইপ করা এবং সেটিংস ও কনফিগারেশন রিসেট করা — সবকিছু এই একটি বাটন দিয়েই সম্পন্ন হবে।
                </p>
                <div className="bg-[#101010] rounded-2xl p-4 mb-5 border border-[#3D3215] space-y-2 text-xs text-white">
                  <div className="flex items-center gap-2">✅ <b className="text-[#FACC15]">ব্যালেন্স নিশ্চিত ৳ 0.00:</b> সমস্ত একাউন্টের ব্যালেন্স ও ইনকাম ০ হবে এবং ট্রানজেকশন/টাস্ক হিস্ট্রি ক্লিয়ার হবে।</div>
                  <div className="flex items-center gap-2">✅ <b className="text-[#FACC15]">ডাটা ওয়াইপ:</b> সমস্ত টেস্ট ইউজার, ড্রাফট জবস, সাবমিশন ও পেমেন্ট রিকোয়েস্ট মুছে যাবে।</div>
                  <div className="flex items-center gap-2">✅ <b className="text-[#FACC15]">সেটিংস ও কনফিগ রিসেট:</b> সাইট সেটিংস, বিকাশ/নগদ/রকেট গেটওয়ে, স্পিন, গেম ও রেফারেল নিয়ম ডিফল্টে ফিরে যাবে।</div>
                  <div className="flex items-center gap-2">✅ <b className="text-[#FACC15]">৩টি ফ্রেশ মাইক্রোটাস্ক:</b> রিয়েল কাজের জন্য ৩টি স্টার্টার লাইভ মাইক্রোটাস্ক রেডি থাকবে।</div>
                </div>
                <button 
                  onClick={handleMasterFactoryReset} 
                  disabled={isSavingSettings} 
                  className="w-full bg-gradient-to-r from-[#D4A017] via-[#FACC15] to-[#D4A017] text-[#090909] font-black uppercase tracking-[0.2em] py-4 rounded-2xl shadow-xl active:scale-95 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
                >
                  <Sparkles className="w-5 h-5" /> মাস্টার ফ্যাক্টরি রিসেট করুন (Wipe All, Balance 0 & Reset Config)
                </button>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }} className="bg-[#151515] p-6 rounded-[32px] shadow-sm border border-[#3D3215]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#1C1C1C] border border-[#3D3215] flex items-center justify-center text-amber-400">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-white uppercase tracking-tight italic">Partner Program Reset</h3>
                    <p className="text-xs text-[#A3A3A3] font-medium">Reset partner referrals to 0 for all users.</p>
                  </div>
                </div>
                <button 
                  onClick={handleResetPartnerReferrals} 
                  disabled={isSavingSettings} 
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-xs cursor-pointer"
                >
                  Reset Partner Progress
                </button>
              </motion.div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Screenshot Preview Modal */}
      <AnimatePresence>
        {viewingScreenshot && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => setViewingScreenshot(null)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative bg-[#151515] rounded-[24px] p-5 max-w-md w-full shadow-2xl border border-[#3D3215] z-10 flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#3D3215] mb-3">
                <span className="text-xs font-black uppercase tracking-widest text-[#FACC15]">Proof Screenshot</span>
                <button
                  onClick={() => setViewingScreenshot(null)}
                  className="px-3 py-1 rounded-xl bg-[#1C1C1C] hover:bg-rose-950/40 hover:text-rose-400 text-[#A3A3A3] font-extrabold text-[10px] transition-all cursor-pointer border border-[#3D3215]"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto rounded-2xl bg-[#101010] border border-[#3D3215] flex items-center justify-center p-2.5">
                <img
                  src={viewingScreenshot}
                  alt="Proof screenshot"
                  className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-md cursor-zoom-in"
                  onClick={() => window.open(viewingScreenshot, '_blank')}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="pt-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#A3A3A3]">
                  Tap image to open in full tab
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirm Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#151515] rounded-[32px] p-6 shadow-2xl max-w-sm w-full border border-[#3D3215]"
          >
            <div className={`w-16 h-16 ${confirmDialog.isDanger !== false ? 'bg-rose-950/50 text-rose-400 border border-rose-900/50' : 'bg-[#1C1C1C] text-[#FACC15] border border-[#3D3215]'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {confirmDialog.isDanger !== false ? <ShieldAlert className="w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
            </div>
            <h3 className="text-center font-black text-xl mb-2 text-white uppercase tracking-tight">{confirmDialog.title}</h3>
            <p className="text-center font-medium text-[#A3A3A3] mb-6">{confirmDialog.message}</p>
            
            {confirmDialog.isPrompt && (
              <div className="mb-6 space-y-2">
                <input 
                  type="text" 
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder={`টাইপ করুন: ${confirmDialog.promptExpected}`}
                  className="w-full text-center bg-[#101010] border border-[#3D3215] rounded-2xl px-4 py-3 font-bold text-white focus:outline-none focus:border-[#FACC15] transition-all font-mono uppercase text-sm"
                />
                <div className="flex justify-between items-center px-1">
                  <span className="text-[11px] font-bold text-[#A3A3A3]">কনফার্ম করতে <span className="text-[#FACC15] font-mono font-black">{confirmDialog.promptExpected}</span> লিখুন</span>
                  <button 
                    type="button" 
                    onClick={() => setPromptInput(confirmDialog.promptExpected || '')}
                    className="text-[11px] font-black uppercase text-[#FACC15] hover:underline bg-[#1C1C1C] border border-[#3D3215] px-2 py-0.5 rounded-md"
                  >
                    অটো-টাইপ {confirmDialog.promptExpected}
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <button 
                onClick={() => { setConfirmDialog(null); setPromptInput(''); }}
                className="flex-1 bg-[#1C1C1C] hover:bg-[#252525] text-[#A3A3A3] border border-[#3D3215] py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all cursor-pointer"
              >
                বাতিল
              </button>
              <button 
                disabled={Boolean(confirmDialog.isPrompt && promptInput.trim().toUpperCase() !== (confirmDialog.promptExpected || '').toUpperCase())}
                onClick={async () => {
                  const onConfirmFn = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  setPromptInput('');
                  if (onConfirmFn) {
                    await onConfirmFn();
                  }
                }}
                className={`flex-1 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer ${
                  (confirmDialog.isPrompt && promptInput.trim().toUpperCase() !== (confirmDialog.promptExpected || '').toUpperCase())
                    ? 'bg-[#1C1C1C] text-[#A3A3A3]/50 cursor-not-allowed shadow-none border border-[#3D3215]'
                    : (confirmDialog.isDanger !== false 
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20' 
                        : 'bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909]')
                }`}
              >
                {confirmDialog.confirmText || 'Confirm'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Employee Admin Config Modal */}
      {employeeConfigUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEmployeeConfigUser(null)}></motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-[#151515] rounded-[32px] p-6 max-w-sm w-full shadow-2xl border border-[#3D3215]">
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1 text-center">Employee Admin Control</h3>
            <p className="text-[10px] text-[#A3A3A3] font-bold uppercase tracking-widest text-center mb-6">Manage roles for {employeeConfigUser.fullName}</p>
            
            <div className="space-y-2 mb-6">
              <p className="text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest pl-1 mb-2">Allowed Permissions:</p>
              {ALL_TABS.map(tab => (
                <label key={tab.id} className="flex items-center gap-3 p-3 rounded-2xl bg-[#101010] border border-[#3D3215] cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={employeePermissions.includes(tab.id)}
                    onChange={(e) => {
                      if (e.target.checked) setEmployeePermissions(prev => [...prev, tab.id]);
                      else setEmployeePermissions(prev => prev.filter(p => p !== tab.id));
                    }}
                    className="w-5 h-5 rounded-md border-[#3D3215] bg-[#1C1C1C] text-[#FACC15] focus:ring-[#FACC15] accent-[#FACC15]"
                  />
                  <div className="flex items-center gap-2">
                    <tab.icon className={`w-4 h-4 text-[#FACC15]`} />
                    <span className="font-bold text-white text-xs">{tab.label} Access</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleSaveEmployeeConfig}
                className="w-full bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] font-black uppercase tracking-[0.15em] py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-[11px] cursor-pointer"
              >
                Save Roles & Permissions
              </button>
              <button 
                onClick={() => setEmployeeConfigUser(null)}
                className="w-full bg-[#1C1C1C] hover:bg-[#252525] text-[#A3A3A3] font-black uppercase tracking-[0.15em] py-3.5 rounded-2xl active:scale-95 transition-all text-[11px] border border-[#3D3215] cursor-pointer"
              >
                Close
              </button>
            </div>
            {employeePermissions.length === 0 && (
              <p className="text-[10px] text-center text-rose-400 font-bold uppercase mt-4 opacity-80">Saving with no permissions will revoke employee access</p>
            )}
          </motion.div>
        </div>
      )}

      {/* Edit User Balance Modal */}
      {editingUserBalance && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#151515] rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200 border border-[#3D3215]">
            <h3 className="text-xl font-bold mb-4 text-white">Edit Balance: {editingUserBalance.fullName}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#A3A3A3] mb-1 uppercase">Main Balance</label>
                <input type="number" value={editingUserBalance.main} onChange={(e) => setEditingUserBalance({...editingUserBalance, main: Number(e.target.value)})} className="w-full bg-[#101010] border border-[#3D3215] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#FACC15]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#A3A3A3] mb-1 uppercase">Bonus Balance</label>
                <input type="number" value={editingUserBalance.bonus} onChange={(e) => setEditingUserBalance({...editingUserBalance, bonus: Number(e.target.value)})} className="w-full bg-[#101010] border border-[#3D3215] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#FACC15]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#A3A3A3] mb-1 uppercase">Referral Balance</label>
                <input type="number" value={editingUserBalance.referral} onChange={(e) => setEditingUserBalance({...editingUserBalance, referral: Number(e.target.value)})} className="w-full bg-[#101010] border border-[#3D3215] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#FACC15]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#A3A3A3] mb-1 uppercase">Tasks Balance</label>
                <input type="number" value={editingUserBalance.tasks} onChange={(e) => setEditingUserBalance({...editingUserBalance, tasks: Number(e.target.value)})} className="w-full bg-[#101010] border border-[#3D3215] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#FACC15]" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingUserBalance(null)} className="flex-1 py-3 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] text-[#A3A3A3] font-bold transition border border-[#3D3215] cursor-pointer">Cancel</button>
              <button onClick={saveUserBalance} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] font-black uppercase tracking-wider transition cursor-pointer">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {changingPasswordUser && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#151515] rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200 border border-[#3D3215]">
            <h3 className="text-xl font-bold mb-4 text-white">Change Password</h3>
            <p className="text-sm text-[#A3A3A3] mb-4">Set a new password for <strong className="text-white">{changingPasswordUser.fullName}</strong> ({changingPasswordUser.email}).</p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#A3A3A3] mb-1 uppercase">New Password</label>
                <input 
                  type="text" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Enter new password"
                  className="w-full bg-[#101010] border border-[#3D3215] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#FACC15]" 
                  autoFocus
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => { setChangingPasswordUser(null); setNewPassword(''); }} className="flex-1 py-3 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] text-[#A3A3A3] font-bold transition border border-[#3D3215] cursor-pointer">Cancel</button>
                <button type="submit" disabled={isChangingPassword} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] font-black uppercase tracking-wider transition disabled:opacity-50 cursor-pointer">
                  {isChangingPassword ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Notification Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#151515] rounded-3xl p-6 w-full max-w-md shadow-2xl border border-[#3D3215]"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-white uppercase tracking-tight flex items-center gap-2">
                <BellRing className="w-5 h-5 text-[#FACC15]" />
                {notifyTarget === 'all' ? 'Notify All Users' : 'Send Notification'}
              </h3>
              <button onClick={() => setShowNotifyModal(false)} className="text-[#A3A3A3] hover:text-white cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest block mb-1">Title</label>
                <input
                  type="text"
                  value={notifyTitle}
                  onChange={(e) => setNotifyTitle(e.target.value)}
                  className="w-full bg-[#101010] border border-[#3D3215] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#FACC15]"
                  placeholder="Notification Title"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest block mb-1">Message</label>
                <textarea
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  className="w-full bg-[#101010] border border-[#3D3215] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#FACC15] min-h-[100px]"
                  placeholder="Type your message here..."
                ></textarea>
              </div>
              
              <button
                onClick={async () => {
                  if (!notifyTitle.trim() || !notifyMessage.trim()) {
                    toast.error("Please enter a title and message.");
                    return;
                  }
                  setIsSendingNotification(true);
                  try {
                    if (notifyTarget === 'all') {
                      const allUsersSnap = await getDocs(collection(db, "users"));
                      const allUsers = allUsersSnap.docs;
                      let chunk = [];
                      for (let i = 0; i < allUsers.length; i++) {
                        chunk.push(allUsers[i]);
                        if (chunk.length === 450 || i === allUsers.length - 1) {
                          const batch = writeBatch(db);
                          chunk.forEach(u => {
                            const notifRef = doc(collection(db, "users", u.id, "notifications"));
                            batch.set(notifRef, {
                              title: notifyTitle,
                              message: notifyMessage,
                              read: false,
                              type: 'admin_broadcast',
                              createdAt: serverTimestamp()
                            });
                          });
                          await batch.commit();
                          chunk = [];
                        }
                      }
                      sendPushNotification('all', notifyTitle, notifyMessage);
                      toast.success(`Sent to ${allUsers.length} users!`);
                    } else {
                      const notifRef = doc(collection(db, "users", notifyTarget, "notifications"));
                      await setDoc(notifRef, {
                        title: notifyTitle,
                        message: notifyMessage,
                        read: false,
                        type: 'admin_direct',
                        createdAt: serverTimestamp()
                      });
                      sendPushNotification(notifyTarget, notifyTitle, notifyMessage);
                      toast.success("Notification sent!");
                    }
                    setShowNotifyModal(false);
                  } catch (e: any) {
                    toast.error(e.message || "Failed to send notification.");
                  } finally {
                    setIsSendingNotification(false);
                  }
                }}
                disabled={isSendingNotification}
                className="w-full bg-gradient-to-r from-[#D4A017] to-[#FACC15] text-[#090909] py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                {isSendingNotification ? 'Sending...' : 'Send Now'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
