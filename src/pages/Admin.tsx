import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/AuthProvider';
import { collection, query, onSnapshot, doc, writeBatch, serverTimestamp, setDoc, orderBy, deleteDoc, increment, updateDoc, getDocs, deleteField, getDoc, limit, FieldPath } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { getCachedDoc, getCachedQuery, clearCache } from '../lib/cache';
import { uploadImageOrFallback } from '../lib/imageUpload';
import { processReferralCommission, processRegistrationReferral } from '../lib/referral';
import { Trash2, CheckCircle, XCircle, Users, ShieldAlert, ShieldCheck, Wallet, ListChecks, Settings, User, Eye, Calculator, MessageSquare, Globe, Coins, Megaphone, Gamepad2, CreditCard, Lock, BellRing, RefreshCw, Smartphone, Mail, Camera, MessageCircle, Send, BookOpen, Layers, Copy, HelpCircle, Database, Search, Download, Gift } from 'lucide-react';
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
  const [newCourseCategory, setNewCourseCategory] = useState<'টাস্ক কমপ্লিট' | 'টাকা উইথড্র' | 'অন্যান্য'>('টাস্ক কমপ্লিট');
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseItems, setCourseItems] = useState<{ title: string; description: string; thumbnailUrl: string; videoLink: string; }[]>([]);
  const [optTitle, setOptTitle] = useState('');
  const [optDesc, setOptDesc] = useState('');
  const [optThumbnail, setOptThumbnail] = useState('');
  const [optLink, setOptLink] = useState('');
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [spinRewards, setSpinRewards] = useState<number[]>([1, 2, 5, 10, 0, 50, 100, 0]);
  const [referralSettings, setReferralSettings] = useState({ fixedBonus: 10, gen2FixedBonus: 0, gen3FixedBonus: 0, gen1Percent: 0, gen2Percent: 0, gen3Percent: 0 });
  const [bannerSettings, setBannerSettings] = useState({ text: 'Welcome to HMF Income! Complete tasks and earn money daily.', link: '#' });
  const [gameSettings, setGameSettings] = useState({ spinTaskReq: 0, spinReferReq: 0, mathTaskReq: 0, mathReferReq: 0 });
  const [partnerSettings, setPartnerSettings] = useState({ requiredReferrals: 10, dailyBonus: 100, enabled: true, withdrawEnabled: true });
  const [withdrawSettings, setWithdrawSettings] = useState({ mainMin: 50, mainFee: 0, bonusMin: 50, bonusFee: 0, referralMin: 50, referralFee: 0, tasksMin: 50, tasksFee: 0, customAmounts: "110, 210, 310, 410, 510" });
  const [depositSettings, setDepositSettings] = useState({ bkashNumber: '017XX-XXXXXX', nagadNumber: '017XX-XXXXXX', minDeposit: 100, maxDeposit: 25000, bkashEnabled: true, nagadEnabled: true, bkashQrUrl: '', nagadQrUrl: '' });
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
    onConfirm: () => void;
  } | null>(null);

  const [promptInput, setPromptInput] = useState('');
  
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

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
      title: '', description: '', reward: 10, link: '', type: 'Facebook', icon: 'MessageCircle', color: 'text-blue-500', bg: 'bg-blue-100', requiredProofs: ['text'], allowedCompletions: 1, userLimit: 1, deadline: '', isAccountSell: false, todaysPassword: '', reviewComments: []
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
    { id: 'dashboard', label: 'Dashboard', icon: Calculator, color: 'text-indigo-400' },
    { id: 'submissions', label: 'Review', icon: CheckCircle, color: 'text-orange-500' },
    { id: 'requests', label: 'Payments', icon: Wallet, color: 'text-emerald-500' },
    { id: 'drives', label: 'Drives', icon: Smartphone, color: 'text-sky-500' },
    { id: 'jobs', label: 'Jobs', icon: ListChecks, color: 'text-blue-500' },
    { id: 'courses', label: 'Courses', icon: BookOpen, color: 'text-purple-500' },
    { id: 'users', label: 'Users', icon: Users, color: 'text-indigo-500' },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle, color: 'text-yellow-500' },
    { id: 'gifts', label: 'Gifts', icon: Gift, color: 'text-fuchsia-500' },
    { id: 'settings', label: 'Configs', icon: Settings, color: 'text-rose-500' },
    { id: 'migrate', label: 'Migration', icon: Database, color: 'text-purple-600' }
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
           mainMin: d.mainMin !== undefined ? d.mainMin : 50, mainFee: d.mainFee !== undefined ? d.mainFee : 0, bonusMin: d.bonusMin !== undefined ? d.bonusMin : 50, bonusFee: d.bonusFee !== undefined ? d.bonusFee : 0, referralMin: d.referralMin !== undefined ? d.referralMin : 50, referralFee: d.referralFee !== undefined ? d.referralFee : 0, tasksMin: d.tasksMin !== undefined ? d.tasksMin : 50, tasksFee: d.tasksFee !== undefined ? d.tasksFee : 0, customAmounts: d.customAmounts || "110, 210, 310, 410, 510"
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
    } catch(err) { console.warn("Error loading settings:", err); }
  }, []);

  const loadData = useCallback(async (forceRef = false) => {
    if (!isAdmin) return;
    try {
      if (['jobs', 'submissions'].includes(activeTab)) {
        const jS = await getCachedQuery(query(collection(db, "jobs"), orderBy("createdAt", "desc"), limit(50)), "admin_jobs", forceRef);
        setJobs(jS.docs.map(d => ({id: d.id, ...d.data()} as any)));
        const sS = await getCachedQuery(query(collection(db, "submissions"), orderBy("submittedAt", "desc"), limit(50)), "admin_submissions", forceRef);
        setSubmissions(sS.docs.map(d => ({id: d.id, ...d.data()} as any)));
      }
      if (['requests', 'dashboard'].includes(activeTab)) {
        const pS = await getCachedQuery(query(collection(db, "payment_requests"), orderBy("createdAt", "desc"), limit(2000)), "admin_payment_requests", forceRef);
        setPaymentRequests(pS.docs.map(d => ({id: d.id, ...d.data()} as any)));
      }
      if (activeTab === 'users') {
        const uS = await getCachedQuery(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(200)), "admin_users", forceRef);
        setUserList(uS.docs.map(d => ({id: d.id, ...d.data()} as any)));
      }
      if (['drives', 'courses'].includes(activeTab)) {
        const dS = await getCachedQuery(query(collection(db, "drive_offers"), limit(50)), "admin_drive_offers", forceRef);
        setAdminOffers(dS.docs.map(d => ({id: d.id, ...d.data()} as any)));
        const cS = await getCachedQuery(query(collection(db, "courses"), limit(50)), "admin_courses", forceRef);
        setAdminCourses(cS.docs.map(d => ({id: d.id, ...d.data()} as any)));
      }
      if (activeTab === 'gifts') {
        const gS = await getCachedQuery(query(collection(db, "giftCodes"), orderBy("createdAt", "desc"), limit(100)), "admin_gifts", forceRef);
        setGiftCodes(gS.docs.map(d => ({id: d.id, ...d.data()} as any)));
      }
    } catch(e) { console.warn("Error loading data:", e); }
  }, [isAdmin, activeTab]);

  const handleDeleteDuplicateAdmins = async () => {
    try {
      toast.success("Delete admins started...");
      console.log("Delete admins started");
    
    
    toast.loading("Finding and deleting accounts...");
      const { query, collection, where, getDocs, deleteDoc, doc } = await import('firebase/firestore');
      
      const q = query(
        collection(db, "users"),
        where("email", "==", "mdekramhossain590@gmail.com")
      );
      
      const snapshot = await getDocs(q);
      let deleted = 0;
      let kept = 0;
      
      for (const userDoc of snapshot.docs) {
        const data = userDoc.data();
        if (data.myReferCode === "NN743526") {
          kept++;
        } else {
          await deleteDoc(doc(db, "users", userDoc.id));
          deleted++;
        }
      }
      
      // // // 
      toast.success(`Successfully deleted ${deleted} duplicate admin accounts. Kept ${kept} account.`);
      loadData(true);
    } catch (e) {
      // 
      toast.error("Failed to delete accounts.");
      console.error(e);
    }
  };

  const handleFixOldReferrals = async () => {
    try {
      toast.success("Fix referrals started...");
      console.log("Fix referrals started");
      const loadingToast = toast.loading("Finding and processing old referrals...");
      const { query, collection, where, getDocs, updateDoc, doc, serverTimestamp, increment, setDoc, addDoc } = await import('firebase/firestore');
      
      // Get referral settings
      const { getDoc } = await import('firebase/firestore');
      const settingsDoc = await getDoc(doc(db, "settings", "referral"));
      let gen1 = 10, gen2 = 0, gen3 = 0;
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        gen1 = data.fixedBonus || 0;
        gen2 = data.gen2FixedBonus || 0;
        gen3 = data.gen3FixedBonus || 0;
      }
      const bonuses = [gen1, gen2, gen3];

      // Query all users to avoid index requirements
      const q = query(collection(db, "users"));
      const snapshot = await getDocs(q);
      let processed = 0;
      let alreadyPaid = 0;
      let logMsg = "";
      
      for (const userDoc of snapshot.docs) {
        const data = userDoc.data();
        
        if (data.usedReferCode && data.usedReferCode !== 'none') {
          const sanitizedCode = data.usedReferCode.replace(/[\u200B-\u200D\uFEFF\s]/g, '').trim().toUpperCase();
          
          if (data.usedReferCode !== sanitizedCode) {
            await updateDoc(doc(db, "users", userDoc.id), { usedReferCode: sanitizedCode });
          }

          // Check if referrer actually received the referral
          const referrerQuery = query(collection(db, "users"), where("myReferCode", "==", sanitizedCode));
          const referrerSnapshot = await getDocs(referrerQuery);
          
          if (!referrerSnapshot.empty) {
            const referrerDoc = referrerSnapshot.docs[0];
            const referrerId = referrerDoc.id;
            
            // Allow matching by email or just checking if they've been paid
            let missed = false;
            
            if (data.email) {
              const refSubQuery = query(collection(db, `users/${referrerId}/referrals`), where("referredEmail", "==", data.email));
              const refSubSnapshot = await getDocs(refSubQuery);
              if (refSubSnapshot.empty) missed = true;
            } else {
              missed = !data.referralBonusPaid;
            }
            
            if (missed) {
               console.log("Found missed referral for user:", data.email || userDoc.id, "referred by", sanitizedCode);
               
               // Manually process it directly here so it never fails
               let currentReferCode = sanitizedCode;
               for (let level = 0; level < 3; level++) {
                  if (!currentReferCode || currentReferCode === 'none') break;
                  const fixedBonus = bonuses[level];
                  
                  const refQ = query(collection(db, "users"), where("myReferCode", "==", currentReferCode));
                  const refSnap = await getDocs(refQ);
                  if (refSnap.empty) break;
                  
                  const rDoc = refSnap.docs[0];
                  const rId = rDoc.id;
                  const rData = rDoc.data();
                  
                  // Add to subcollection if level 1 (or all levels depending on logic)
                  await addDoc(collection(db, `users/${rId}/referrals`), {
                    referredEmail: data.email || 'No Email',
                    referredName: data.fullName || 'Anonymous',
                    bonusEarned: fixedBonus,
                    level: level + 1,
                    createdAt: serverTimestamp()
                  });
                  
                  const userUpdates: any = {
                    totalReferrals: increment(level === 0 ? 1 : 0)
                  };
                  if (fixedBonus > 0) {
                    userUpdates["balances.referral"] = increment(fixedBonus);
                  }
                  await updateDoc(doc(db, "users", rId), userUpdates);
                  
                  const leaderboardRef = doc(db, 'leaderboard', rId);
                  await setDoc(leaderboardRef, {
                    fullName: rData.fullName || 'User',
                    referrals: increment(level === 0 ? 1 : 0),
                    bonus: increment(0),
                    totalIncome: increment(fixedBonus),
                    updatedAt: serverTimestamp()
                  }, { merge: true });
                  
                  currentReferCode = rData.usedReferCode ? rData.usedReferCode.replace(/[\u200B-\u200D\uFEFF\s]/g, '').trim().toUpperCase() : '';
               }
               
               await updateDoc(doc(db, "users", userDoc.id), { referralBonusPaid: true });
               processed++;
               continue;
            }
          }
        }
        
        if (data.referralBonusPaid) {
          alreadyPaid++;
        }
      }
      
      // 
      toast.success(`Successfully processed ${processed} missed referrals (skipped ${alreadyPaid} valid).`);
      loadData(true);
    } catch (e) {
      // 
      toast.error("Failed to process old referrals: " + (e as any).message);
      console.error(e);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    
    // Default to the first allowed tab if current activeTab is not allowed
    if (!isFullAdmin && !userPermissions.includes(activeTab) && allowedTabs.length > 0) {
      setActiveTab(allowedTabs[0].id as any);
    }
    
    if (activeTab === 'settings') {
       loadSettings();
    }
    loadData();
  }, [isAdmin, activeTab, loadSettings, loadData]);

  if (!isAdmin) return <div className="p-10 text-center">Access Denied</div>;

  const handleCreateGiftCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGiftCode || newGiftCode.length < 5) {
      toast.error('Code must be at least 5 characters');
      return;
    }
    
    setIsCreatingGift(true);
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (Number(giftExpiresInHours) || 24));
      
      await setDoc(doc(db, "giftCodes", newGiftCode.trim().toUpperCase()), {
        code: newGiftCode.trim().toUpperCase(),
        type: giftType,
        amount: giftType === 'fixed' ? (Number(giftAmount) || 0) : 0,
        minAmount: giftType === 'random' ? (Number(giftMinAmount) || 0) : 0,
        maxAmount: giftType === 'random' ? (Number(giftMaxAmount) || 0) : 0,
        maxUses: Number(giftMaxUses) || 0,
        usedBy: [],
        expiresAt: expiresAt,
        status: 'active',
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.email || 'admin'
      });
      
      toast.success('Gift Code Created!');
      setNewGiftCode('');
      loadData(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'giftCodes');
      toast.error('Failed to create code');
    } finally {
      setIsCreatingGift(false);
    }
  };

  const handleDeleteGiftCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gift code?')) return;
    try {
      await deleteDoc(doc(db, "giftCodes", id));
      toast.success('Gift code deleted');
      loadData(true);
    } catch (err) {
      toast.error('Failed to delete code');
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

  const handleCancelEditFaq = () => {
    setEditingFaqIndex(null);
    setNewFaq({ question_en: '', answer_en: '', question_bn: '', answer_bn: '' });
  };

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
      handleFirestoreError(e, OperationType.WRITE, 'settings/activation');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB.");
      return;
    }

    const toastId = toast.loading(`Uploading ${type}...`);
    try {
      const imageUrl = await uploadImageOrFallback(file, 400);

      setSiteSettings(prev => ({
        ...prev,
        logoUrl: imageUrl
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
      setNewJob({ title: '', description: '', reward: 10, link: '', type: 'Facebook', icon: 'MessageCircle', color: 'text-blue-500', bg: 'bg-blue-100', requiredProofs: ['text'], allowedCompletions: 1, userLimit: 1, deadline: '', isAccountSell: false, todaysPassword: '', reviewComments: [] });
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
      message: `Are you sure you want to reject this job? ৳${job.totalCost} will be refunded to the user's main balance.`,
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
              message: `Your submission for "${subTitle}" was ${status}. ${status === 'approved' ? `You earned ৳${safeReward}!` : ''}`,
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
          await loadData(true);
        } catch (err: any) {
          console.error("Failed to approve/reject task:", err);
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
              batch.set(userRef, { isActive: true }, { merge: true });
            }
            
            const notifRef = doc(collection(db, "users", reqUserId, "notifications"));
            batch.set(notifRef, {
              title: `${reqType === 'deposit' ? 'Deposit' : reqType === 'activation' ? 'Account Activation' : 'Withdrawal'} ${status}`,
              message: `Your ${reqType} request of ৳${reqAmount} has been ${status}.`,
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
          await loadData(true);
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `payment_requests/${reqId}`);
          toast.error('Failed to process request');
        }
      }
    });
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
          await loadData(true);
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
        }
      }
    });
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
          await loadData(true);
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
        }
      }
    });
  };

  const handleWipeData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Wipe Database',
      message: 'Are you absolutely sure you want to WIPE the entire database? This will delete all users (except admins), tasks, transactions, submissions, leaderboards, and requests. This cannot be undone.',
      isPrompt: true,
      promptExpected: 'WIPE',
      onConfirm: async () => {
        try {
          toast.loading("Wiping Database (This may take a while)...", { id: "wipe_db" });
          setIsSavingSettings(true);

        const adminEmail = profile?.email || 'mdekramhossain590@gmail.com';

        // Helper to cleanly delete collection
        const cleanCol = async (collPath: string) => {
          const qs = await getDocs(collection(db, collPath));
          for (const docSnap of qs.docs) {
            await deleteDoc(doc(db, collPath, docSnap.id)).catch(e => console.warn(e));
          }
        };

        await cleanCol("jobs");
        await cleanCol("submissions");
        await cleanCol("payment_requests");
        await cleanCol("drive_offers");
        await cleanCol("courses");

        // Delete users (except admin) and their subcollections
        const uQs = await getDocs(collection(db, "users"));
        for (const uDoc of uQs.docs) {
          const uData = uDoc.data();
          if (uData.role === 'admin' || uData.email === adminEmail) continue;

          // Delete subcollections manually (Firestore structure limits)
          const uid = uDoc.id;
          const userSubs = ["tasks", "mathHistory", "transactions", "referrals", "notifications"];
          for (const s of userSubs) {
            const subQs = await getDocs(collection(db, `users/${uid}/${s}`));
            for (const subDoc of subQs.docs) {
              await deleteDoc(doc(db, `users/${uid}/${s}`, subDoc.id)).catch(() => {});
            }
          }
          await deleteDoc(doc(db, "users", uid)).catch(e => console.warn(e));
          await deleteDoc(doc(db, "leaderboard", uid)).catch(() => {});
        }

        toast.success("Database successfully wiped!", { id: "wipe_db" });
      } catch (err: any) {
        console.error(err);
        toast.error("Error wiping database: " + err.message, { id: "wipe_db" });
      } finally {
        setIsSavingSettings(false);
      }
    }
  });
};

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
      console.error("Employee Config Error:", err);
      toast.error("Failed to update employee roles: " + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="pt-6 px-4 pb-20">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-[#0D47A1] dark:text-blue-400">Admin Panel</h2>
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
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-black text-[10px] uppercase tracking-widest transition-all border border-slate-200 dark:border-slate-700 active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Live Data
        </button>
      </div>
      <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-[20px] mb-8 flex-wrap gap-1.5 ring-1 ring-slate-200 dark:ring-slate-800">
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
                ? 'bg-white dark:bg-slate-800 shadow-md shadow-slate-200 dark:shadow-black/20 text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : 'text-slate-400'}`} />
            {tab.label}
          </button>
        ))}
      </div>
      
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-3xl shadow-xl shadow-blue-500/20 border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="font-black text-lg tracking-tight uppercase flex items-center justify-center md:justify-start gap-2">
                <Database className="w-5 h-5 text-indigo-200" /> cPanel Ready Build (.zip)
              </h4>
              <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
                আপনার cPanel হোস্টিং-এ আপলোড করার জন্য সম্পূর্ণ প্রস্তুত করা <b>dist.zip</b> বিল্ড ফাইলটি ডাউনলোড করুন। এটি সরাসরি cPanel-এর <code className="bg-blue-700/50 px-1.5 py-0.5 rounded text-[11px] font-mono">public_html</code> ফোল্ডারে আপলোড করে এক্সট্র্যাক্ট করতে পারবেন।
              </p>
            </div>
            <a 
              href="/api/download-zip" 
              download="dist.zip"
              className="bg-white hover:bg-slate-50 text-blue-600 px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 shrink-0"
            >
              <Download className="w-4 h-4" /> Download Build ZIP
            </a>
          </div>

          <div className="flex items-center justify-between px-1">
            <h3 className="font-black dark:text-white uppercase tracking-tight text-sm">Financial Overview</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/20 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-800/30">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Total Approved Deposits</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  ৳{paymentRequests.filter(r => r.type === 'deposit' && r.status === 'approved').reduce((acc, curr) => acc + Number(curr.amount || 0), 0).toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  {paymentRequests.filter(r => r.type === 'deposit' && r.status === 'approved').length} Transactions
                </span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/40 dark:to-pink-900/20 p-5 rounded-3xl border border-rose-100 dark:border-rose-800/30">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">Total Approved Withdrawals</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  ৳{paymentRequests.filter(r => r.type === 'withdraw' && r.status === 'approved').reduce((acc, curr) => acc + Number(curr.amount || 0), 0).toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  {paymentRequests.filter(r => r.type === 'withdraw' && r.status === 'approved').length} Transactions
                </span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/20 p-5 rounded-3xl border border-amber-100 dark:border-amber-800/30">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Pending Deposits</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  ৳{paymentRequests.filter(r => r.type === 'deposit' && r.status === 'pending').reduce((acc, curr) => acc + Number(curr.amount || 0), 0).toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  {paymentRequests.filter(r => r.type === 'deposit' && r.status === 'pending').length} Action Required
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/40 dark:to-sky-900/20 p-5 rounded-3xl border border-blue-100 dark:border-blue-800/30">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Pending Withdrawals</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  ৳{paymentRequests.filter(r => r.type === 'withdraw' && r.status === 'pending').reduce((acc, curr) => acc + Number(curr.amount || 0), 0).toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  {paymentRequests.filter(r => r.type === 'withdraw' && r.status === 'pending').length} Action Required
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Recent Transactions Flow</h4>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {paymentRequests.slice(0, 50).map(req => (
                <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      req.type === 'deposit' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      req.type === 'withdraw' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                      'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                    }`}>
                      {req.type === 'deposit' ? '+' : req.type === 'withdraw' ? '-' : <Calculator className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-slate-900 dark:text-white capitalize">{req.type}</p>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                          req.status === 'rejected' ? 'bg-rose-100 text-rose-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{req.method || 'System'} • {new Date(req.createdAt?.toDate()).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className={`font-black text-lg ${req.type === 'deposit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {req.type === 'deposit' ? '+' : '-'}৳{req.amount}
                  </div>
                </div>
              ))}
              {paymentRequests.length === 0 && (
                <p className="text-center text-slate-500 py-4 text-sm font-medium">No transactions found.</p>
              )}
            </div>
          </div>
        </div>
      )}

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
                  {sub.proofs.text && (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Comment:</span>
                        <p className="text-sm font-medium dark:text-slate-200 break-all">{sub.proofs.text}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(sub.proofs.text);
                          toast.success("Comment copied!");
                        }}
                        className="p-1 px-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 self-center"
                        title="Copy Comment"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {sub.proofs.username && (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Username:</span>
                        <p className="text-sm font-mono font-bold text-indigo-500 break-all">{sub.proofs.username}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(sub.proofs.username);
                          toast.success("Username copied!");
                        }}
                        className="p-1 px-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 self-center"
                        title="Copy Username"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {sub.proofs.password && (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Password:</span>
                        <p className="text-sm font-mono font-bold text-rose-500 break-all">{sub.proofs.password}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(sub.proofs.password);
                          toast.success("Password copied!");
                        }}
                        className="p-1 px-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 self-center"
                        title="Copy Password"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {sub.proofs.twoFactorCode && (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">2FA / Recovery:</span>
                        <p className="text-sm font-mono font-bold text-emerald-500 break-all">{sub.proofs.twoFactorCode}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(sub.proofs.twoFactorCode);
                          toast.success("2FA copied!");
                        }}
                        className="p-1 px-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 self-center"
                        title="Copy 2FA"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {sub.proofs.videoUrl && (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Video URL:</span>
                        <a href={sub.proofs.videoUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-500 underline truncate block">{sub.proofs.videoUrl}</a>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(sub.proofs.videoUrl);
                          toast.success("Video URL copied!");
                        }}
                        className="p-1 px-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 self-center"
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
                        className="flex items-center gap-2 text-xs font-black text-white bg-emerald-600 dark:bg-emerald-500 px-4 py-2 rounded-xl hover:scale-[1.02] active:scale-95 transition-all w-fit shadow-md cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Proof Image
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => reviewSubmission(sub.id, sub.userId, sub.reward, sub.title, sub.jobType || 'Other', sub.jobId, 'approved')} 
                  className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <CheckCircle className="w-4 h-4"/> Approve
                </button>
                <button 
                  onClick={() => reviewSubmission(sub.id, sub.userId, sub.reward, sub.title, sub.jobType || 'Other', sub.jobId, 'rejected')} 
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
            <div className="flex justify-between items-center">
              <h3 className="font-black text-lg dark:text-white uppercase tracking-tight italic">{editingJobId ? 'Edit Task' : 'Create New Task'}</h3>
              {editingJobId && (
                <button type="button" onClick={handleCancelEditJob} className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel Edit</button>
              )}
            </div>
            <div className="grid gap-3">
              <input type="text" placeholder="Task Title" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold placeholder:text-slate-400" />
              <textarea placeholder="Job Description / Instructions" required value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold h-24 placeholder:text-slate-400" />
              <input type="text" placeholder="Action Link (e.g. Telegram Group Link, URL)" value={newJob.link || ''} onChange={e => setNewJob({...newJob, link: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold placeholder:text-slate-400 text-blue-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1 block">Category</label>
                <select 
                  value={newJob.type} 
                  onChange={e => {
                    const newType = e.target.value;
                    let updatedJob = { ...newJob, type: newType };
                    if (newType === 'Review') {
                      updatedJob.title = "German Doner Kebab (GDK) ৫ স্টার রিভিউ";
                      updatedJob.description = "গুগল ম্যাপে গিয়ে অবশ্যই ৫ স্টার (5 Star) রেটিং দিয়ে আপনার জন্য নির্ধারিত কমেন্টটি পেস্ট করতে হবে। অবশ্যই স্ক্রিনশট এবং যে নাম দিয়ে রিভিউ দিয়েছেন তা প্রুফ হিসেবে সাবমিট করবেন।";
                      updatedJob.link = "https://www.google.com/search?shndl=30&shem=rimspwouoe&q=German+Doner+Kebab+(GDK)&kgmid=/g/11wpz8mg0y";
                      updatedJob.icon = 'Star';
                      updatedJob.color = 'text-amber-500';
                      updatedJob.requiredProofs = ['text', 'screenshot', 'username'];
                      
                      const defaultComments = [
                        "I’ve tried GDK in other locations, and Metrocenter branch is just as good. Consistent taste, clean, and fast.",
                        "Super convenient inside Metrocenter. Grabbed a Kebab Box between shopping trips. No long wait even during lunch rush.fas",
                        "What makes GDK different is the sauce selection. Tried Garlic + Chilli. Kebab was packed well and didn’t get soggy.",
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
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold"
                >
                  {['Facebook', 'Gmail', 'Instagram', 'Telegram', 'Review', 'Sell Accounts', 'Microjob', 'Typing', 'Watch Ads', 'Other'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1 block">Reward (৳)</label>
                <input type="number" placeholder="0.00" required value={newJob.reward} onChange={e => setNewJob({...newJob, reward: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-black text-blue-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1 block">Total Slots (All Users)</label>
                <input type="number" value={newJob.allowedCompletions} onChange={e => setNewJob({...newJob, allowedCompletions: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold" placeholder="0 for unlimited" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1 block">Max Per User</label>
                <input type="number" value={newJob.userLimit} onChange={e => setNewJob({...newJob, userLimit: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold text-orange-500" placeholder="0 for unlimited" />
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
                  <option value="Send">Telegram / Message</option>
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
                {['text', 'screenshot', 'username', 'password', 'videoUrl', '2facode'].map(p => (
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
                    {p === '2facode' ? '2FA Code' : p}
                  </button>
                ))}
              </div>
            </div>

            {newJob.type === "Review" && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-3xl space-y-3 border border-amber-100 dark:border-amber-900/30">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest pl-1">
                    Google Review Comments (১টি লাইনে ১টি কমেন্ট লিখুন)
                  </p>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                    {Array.isArray(newJob.reviewComments) ? newJob.reviewComments.length : 0}টি কমেন্ট
                  </span>
                </div>
                <textarea
                  placeholder="এখানে প্রতি লাইনে একটি করে কমেন্ট লিখুন। ২০-৩০টি বা তার বেশি কমেন্ট লিখতে পারেন। ব্যবহারকারী যখন কাজটি করবেন, তখন এখান থেকে একটি কমেন্ট এলোমেলোভাবে (randomly) তাকে দেওয়া হবে।"
                  value={Array.isArray(newJob.reviewComments) ? newJob.reviewComments.join('\n') : ''}
                  onChange={e => {
                    const commentsArray = e.target.value.split('\n');
                    setNewJob({ ...newJob, reviewComments: commentsArray });
                  }}
                  className="w-full bg-white dark:bg-slate-800 border-none px-4 py-3 rounded-2xl text-xs font-bold h-36 placeholder:text-slate-400 focus:ring-1 focus:ring-amber-500"
                />
                <p className="text-[9px] text-amber-600 dark:text-amber-500 font-bold pl-1 leading-relaxed">
                  * গুগল ম্যাপে ব্যবহারকারী যখন রিভিউর কাজটি করবেন, তখন আমাদের ওয়েবসাইট স্বয়ংক্রিয়ভাবে একটি করে কমেন্ট কপি করার জন্য স্ক্রিনে দেখাবে। এর মাধ্যমে ভিন্ন ভিন্ন ব্যবহারকারী ভিন্ন ভিন্ন কমেন্ট দিয়ে গুগল ম্যাপে ৫ স্টার রেটিং দিবে।
                </p>
              </div>
            )}

            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-3xl space-y-3 border border-red-100 dark:border-red-900/30">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Account Selling Config</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newJob.isAccountSell} onChange={e => setNewJob({...newJob, isAccountSell: e.target.checked})} className="w-4 h-4 text-red-500 rounded border-red-300 focus:ring-red-500 bg-white" />
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Enable Sell UI</span>
                </label>
              </div>
              
              {newJob.isAccountSell && (
                <div className="grid gap-3 mt-2">
                  <input type="text" placeholder="Today's Password (e.g. ayan@770)" value={newJob.todaysPassword} onChange={e => setNewJob({...newJob, todaysPassword: e.target.value})} className="w-full bg-white dark:bg-slate-800 border-none px-4 py-3 rounded-2xl text-sm font-bold placeholder:text-slate-400 text-red-600 focus:ring-1 focus:ring-red-500" />
                </div>
              )}
            </div>
            
            <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-[0.2em] py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-xs">{editingJobId ? 'Update Job Now' : 'Publish Job Now'}</button>
          </form>

          <div className="grid gap-3">
            {jobs.filter(job => job.status === 'pending').length > 0 && (
              <div className="space-y-3 mb-6">
                <h3 className="font-black dark:text-white text-rose-500 uppercase tracking-tight text-xs mb-1 px-1 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                  Pending User Job Requests ({jobs.filter(job => job.status === 'pending').length})
                </h3>
                {jobs.filter(job => job.status === 'pending').map(job => (
                  <div key={job.id} className="bg-amber-50/50 dark:bg-amber-950/10 p-4 rounded-3xl shadow-sm border border-amber-100 dark:border-amber-900/30 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-md">
                          {job.type}
                        </span>
                        <h4 className="font-bold dark:text-white text-sm leading-snug truncate mt-1">{job.title}</h4>
                        <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 line-clamp-2">{job.description}</p>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">
                          Link: <a href={job.link} target="_blank" rel="noopener noreferrer" className="underline">{job.link}</a>
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-xs font-black text-slate-700 dark:text-slate-300">Rate: ৳{job.reward}</p>
                        <p className="text-[10px] font-bold text-slate-400">Slots: {job.allowedCompletions}</p>
                        <p className="text-[10px] font-black text-emerald-600">Total: ৳{job.totalCost}</p>
                        <p className="text-[8px] font-black text-slate-450 uppercase mt-1">By: {job.postedBy}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 justify-end pt-2 border-t border-amber-100 dark:border-amber-900/10">
                      <button 
                        onClick={() => handleRejectJob(job)} 
                        className="px-4 py-2 text-rose-650 bg-rose-50 dark:bg-rose-950/30 rounded-xl text-xs font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all"
                      >
                        Reject & Refund
                      </button>
                      <button 
                        onClick={() => handleApproveJob(job.id)} 
                        className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all"
                      >
                        Approve Job
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 className="font-black dark:text-white uppercase tracking-tight text-xs mb-1 px-1 opacity-50">
              Active/All Tasks ({jobs.filter(job => job.status !== 'pending').length})
            </h3>
            {jobs.filter(job => job.status !== 'pending').map(job => (
              <div key={job.id} className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm flex justify-between items-center border border-slate-100 dark:border-slate-700 transition-all hover:border-blue-200">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold dark:text-white truncate uppercase tracking-tight text-sm">{job.title}</h4>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                      job.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-850 dark:bg-rose-950/20 dark:text-rose-400'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-blue-500/80 uppercase tracking-widest">৳{job.reward} &bull; {job.type} &bull; Slots: {job.remainingSlots}/{job.allowedCompletions}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => handleEditJobClick(job)} className="p-3 text-blue-500 bg-blue-50 dark:bg-blue-900/30 rounded-2xl hover:scale-105 active:scale-90 transition-all">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteJob(job.id)} className="p-3 text-rose-500 bg-rose-50 dark:bg-rose-900/30 rounded-2xl hover:scale-105 active:scale-90 transition-all">
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
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5 mb-1.5 font-sans">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Wallet</span>
                      <span className="font-bold uppercase tracking-widest text-[10px] text-blue-500">{req.wallet} Wallet</span>
                    </div>
                    <div className="flex justify-between font-sans">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Method</span>
                      <span className="font-bold">{req.method}</span>
                    </div>
                    <div className="flex justify-between items-center font-sans">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Account</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-200 tracking-wider text-[11px]">{req.account}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(req.account);
                            toast.success('Account copied!');
                          }}
                          className="hover:text-indigo-500 text-slate-400 transition p-0.5 rounded cursor-pointer active:scale-95"
                          title="Copy Account Number"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {req.type === 'deposit' && (
                  <div className="space-y-1">
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5 mb-1.5 font-sans">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Sender Number</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-200 tracking-wider text-[11px]">{req.account || 'Unknown'}</span>
                        {req.account && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(req.account);
                              toast.success('Sender number copied!');
                            }}
                            className="hover:text-indigo-500 text-slate-400 transition p-0.5 rounded cursor-pointer active:scale-95"
                            title="Copy Sender Number"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center font-sans">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Transaction ID</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-indigo-600 selection:bg-indigo-100 tracking-wider text-[11px]">{req.trxId}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(req.trxId);
                            toast.success('Transaction ID copied!');
                          }}
                          className="hover:text-indigo-500 text-slate-400 transition p-0.5 rounded cursor-pointer active:scale-95"
                          title="Copy Transaction ID"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 mt-1.5 pt-1.5 font-sans">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Method</span>
                      <span className="font-bold text-xs uppercase text-indigo-600 dark:text-indigo-400">{req.method || 'Bkash/Nagad merely indicated'}</span>
                    </div>
                  </div>
                )}
                {req.type === 'activation' && (
                  <div className="space-y-1">
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5 mb-1.5 font-sans">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Sender Number</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-200 tracking-wider text-[11px]">{req.account || 'Unknown'}</span>
                        {req.account && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(req.account);
                              toast.success('Sender number copied!');
                            }}
                            className="hover:text-emerald-500 text-slate-400 transition p-0.5 rounded cursor-pointer active:scale-95"
                            title="Copy Sender Number"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center font-sans">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Transaction ID</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-emerald-600 tracking-wider text-[11px]">{req.trxId}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(req.trxId);
                            toast.success('Transaction ID copied!');
                          }}
                          className="hover:text-emerald-500 text-slate-400 transition p-0.5 rounded cursor-pointer active:scale-95"
                          title="Copy Transaction ID"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 mt-1.5 pt-1.5 font-sans">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Method</span>
                      <span className="font-bold text-xs uppercase text-emerald-600 dark:text-emerald-400">{req.method || 'Bkash/Nagad'}</span>
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
                    <p className="font-black text-[13px] text-slate-800 dark:text-slate-200 italic uppercase flex items-center gap-1.5">
                      ৳{req.amount} &bull; {req.type}
                      {req.method && <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[9px] not-italic">{req.method}</span>}
                    </p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold truncate tracking-widest uppercase">{req.userEmail} {req.account ? `• ${req.account}` : ''}</p>
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

      {activeTab === 'gifts' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateGiftCode} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-sm">Create Gift Code</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Gift Code (5-8 Chars)</label>
                <input type="text" value={newGiftCode} onChange={(e) => setNewGiftCode(e.target.value.toUpperCase())} maxLength={8} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800 uppercase" placeholder="e.g. SUMMER50" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Reward Type</label>
                <select value={giftType} onChange={(e) => setGiftType(e.target.value as 'fixed'|'random')} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800">
                  <option value="fixed">Fixed Amount</option>
                  <option value="random">Random Amount</option>
                </select>
              </div>
              
              {giftType === 'fixed' ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Amount (৳)</label>
                  <input type="number" min="1" value={giftAmount} onChange={(e) => setGiftAmount(e.target.value === '' ? '' : isNaN(parseFloat(e.target.value)) ? "" : parseFloat(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800" required />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Min Amount (৳)</label>
                    <input type="number" min="1" value={giftMinAmount} onChange={(e) => setGiftMinAmount(e.target.value === '' ? '' : isNaN(parseFloat(e.target.value)) ? "" : parseFloat(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Max Amount (৳)</label>
                    <input type="number" min="1" value={giftMaxAmount} onChange={(e) => setGiftMaxAmount(e.target.value === '' ? '' : isNaN(parseFloat(e.target.value)) ? "" : parseFloat(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800" required />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Max Uses (0 = unlimited)</label>
                <input type="number" min="0" value={giftMaxUses} onChange={(e) => setGiftMaxUses(e.target.value === '' ? '' : isNaN(parseInt(e.target.value)) ? "" : parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Expires In (Hours)</label>
                <input type="number" min="1" value={giftExpiresInHours} onChange={(e) => setGiftExpiresInHours(e.target.value === '' ? '' : isNaN(parseInt(e.target.value)) ? "" : parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800" required />
              </div>
            </div>

            <button type="submit" disabled={isCreatingGift} className="w-full bg-[#0D47A1] hover:bg-blue-600 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg transition-all text-xs disabled:opacity-50">
              {isCreatingGift ? 'Creating...' : 'Create Code'}
            </button>
          </form>

          <div className="space-y-3">
            <h3 className="font-black dark:text-white uppercase tracking-tight text-xs pl-1">Active & Past Codes ({giftCodes.length})</h3>
            
            {giftCodes.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-slate-800/45 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">No gift codes found.</p>
              </div>
            )}

            <div className="grid gap-3">
              {giftCodes.map((code) => {
                const isExpired = code.expiresAt && code.expiresAt.toDate() < new Date();
                return (
                  <div key={code.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col gap-2 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black font-mono text-slate-900 dark:text-white text-lg tracking-widest">{code.code}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {code.type === 'fixed' ? `৳${code.amount} Fixed` : `৳${code.minAmount} - ৳${code.maxAmount} Random`}
                          <span className="mx-2 text-slate-300">•</span>
                          {code.usedBy?.length || 0} / {code.maxUses || '∞'} Uses
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border ${
                          code.status === 'active' && !isExpired ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-rose-100 text-rose-600 border-rose-200'
                        }`}>
                          {isExpired ? 'EXPIRED' : code.status}
                        </span>
                        <button onClick={() => handleDeleteGiftCode(code.id)} className="p-2 text-rose-500 bg-rose-50 dark:bg-rose-900/30 rounded-lg hover:scale-105 active:scale-90 transition-all">
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
          <form onSubmit={handleAddFaq} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-sm">{editingFaqIndex !== null ? 'Edit FAQ' : 'Add New FAQ'}</h3>
              {editingFaqIndex !== null && (
                <button type="button" onClick={handleCancelEditFaq} className="text-xs font-bold text-slate-500 hover:text-slate-700">Cancel</button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <input type="text" placeholder="Question (English)" value={newFaq.question_en} onChange={(e) => setNewFaq({...newFaq, question_en: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800" required />
                <textarea placeholder="Answer (English)" value={newFaq.answer_en} onChange={(e) => setNewFaq({...newFaq, answer_en: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800 h-24" required />
              </div>
              <div className="space-y-2">
                <input type="text" placeholder="Question (Bengali)" value={newFaq.question_bn} onChange={(e) => setNewFaq({...newFaq, question_bn: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800" required />
                <textarea placeholder="Answer (Bengali)" value={newFaq.answer_bn} onChange={(e) => setNewFaq({...newFaq, answer_bn: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800 h-24" required />
              </div>
            </div>

            <button type="submit" disabled={isSavingSettings} className="w-full bg-[#0D47A1] hover:bg-blue-600 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg transition-all text-xs disabled:opacity-50">
              {editingFaqIndex !== null ? 'Update FAQ' : 'Create FAQ'}
            </button>
          </form>

          <div className="space-y-3">
            <h3 className="font-black dark:text-white uppercase tracking-tight text-xs pl-1">Live FAQs ({faqsList.length})</h3>
            
            {faqsList.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-slate-800/45 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">No FAQs registered yet.</p>
              </div>
            )}

            <div className="grid gap-3">
              {faqsList.map((faq, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col gap-2 shadow-sm">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{faq.question_en}</h4>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingFaqIndex(index); setNewFaq(faq); }} className="p-2 text-blue-500 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:scale-105 active:scale-90 transition-all">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteFaq(index)} className="p-2 text-rose-500 bg-rose-50 dark:bg-rose-900/30 rounded-lg hover:scale-105 active:scale-90 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{faq.answer_en}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'drives' && (
        <div className="space-y-6">
          {/* Create Drive Offer Form */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-sm mb-4">Create New Drive Offer</h3>
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
                  await loadData(true);
                  setNewDriveTitle('');
                  setNewDriveOriginalPrice('');
                  setNewDriveSalePrice('');
                  setNewDriveValidity('30 Days');
                } catch (err) {
                  toast.error("Failed to create drive offer");
                  console.error(err);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Package Title (প্যাকের নাম)</label>
                  <input type="text" placeholder="e.g. GP 40GB + 800 Min Combo" required value={newDriveTitle} onChange={(e) => setNewDriveTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Mobile Operator</label>
                  <select value={newDriveOperator} onChange={(e) => setNewDriveOperator(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                    <option value="Grameenphone">Grameenphone</option>
                    <option value="Robi">Robi</option>
                    <option value="Banglalink">Banglalink</option>
                    <option value="Airtel">Airtel</option>
                    <option value="Teletalk">Teletalk</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Validity (মেয়াদ)</label>
                  <input type="text" placeholder="e.g. 30 Days" required value={newDriveValidity} onChange={(e) => setNewDriveValidity(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Original (৳)</label>
                  <input type="number" placeholder="e.g. 799" required value={newDriveOriginalPrice} onChange={(e) => setNewDriveOriginalPrice(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Sale (৳)</label>
                  <input type="number" placeholder="e.g. 580" required value={newDriveSalePrice} onChange={(e) => setNewDriveSalePrice(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800 text-slate-900 dark:text-white" />
                </div>
              </div>

              <button type="submit" className="w-full bg-[#0D47A1] hover:bg-blue-600 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg transition-all text-xs">
                Create Drive Pack
              </button>
            </form>
          </div>

          {/* Drive Packs List */}
          <div className="space-y-3">
            <h3 className="font-black dark:text-white uppercase tracking-tight text-xs pl-1">Live Drive Packs ({adminOffers.length})</h3>
            
            {adminOffers.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-slate-800/45 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">No active drive packs registered yet.</p>
              </div>
            )}

            <div className="grid gap-3">
              {adminOffers.map(of => {
                const operatorTags: Record<string, string> = {
                  Grameenphone: 'text-sky-600 bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800/30',
                  Robi: 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30',
                  Banglalink: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30',
                  Airtel: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/30',
                  Teletalk: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30',
                };
                return (
                  <div key={of.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4 shadow-sm">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] px-2 py-0.5 font-bold uppercase tracking-wide rounded-full border ${operatorTags[of.operator] || 'text-indigo-600 border-indigo-200 bg-indigo-50'}`}>
                          {of.operator}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{of.validity}</span>
                      </div>
                      <h4 className="font-black text-slate-900 dark:text-white text-sm truncate uppercase">{of.title}</h4>
                      <p className="text-xs font-bold text-slate-505 mt-1 dark:text-slate-400">Regular: <span className="line-through">৳{of.originalPrice}</span> &bull; Sale: <span className="text-emerald-550 dark:text-emerald-400">৳{of.salePrice}</span></p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={async () => {
                          try {
                            const newStatus = of.status === 'active' ? 'inactive' : 'active';
                            await updateDoc(doc(db, "drive_offers", of.id), { status: newStatus });
                            toast.success(`Package set ${newStatus}`);
                            await loadData(true);
                          } catch (e) {
                            toast.error("Failed to alter status");
                          }
                        }}
                        className={`text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl border ${of.status === 'active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-slate-50 text-slate-500 dark:bg-slate-900/20'}`}
                      >
                        {of.status === 'active' ? 'Active' : 'Paused'}
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm("Delete this Drive Pack?")) {
                            try {
                              await deleteDoc(doc(db, "drive_offers", of.id));
                              toast.success("Pack deleted");
                              await loadData(true);
                            } catch (e) {
                              toast.error("Failed to delete pack");
                            }
                          }
                        }}
                        className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-xl"
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
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-sm mb-4">
              {editingCourseId ? 'কোর্স বা টিউটোরিয়াল এডিট করুন' : 'নতুন কোর্স বা টিউটোরিয়াল তৈরি করুন'}
            </h3>
            
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newCourseTitle || !newCourseDesc || !newCourseThumbnail || !newCourseLink) {
                  toast.error("সবগুলো ঘর সঠিকভাবে পূরণ করুন");
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
                  
                  toast.success(editingCourseId ? "কোর্স বা টিউটোরিয়াল সফলভাবে আপডেট হয়েছে!" : "নতুন টিউটোরিয়াল সফলভাবে যুক্ত হয়েছে!");
                  await loadData(true);
                  
                  // Clear form
                  setNewCourseTitle('');
                  setNewCourseDesc('');
                  setNewCourseThumbnail('');
                  setNewCourseLink('');
                  setNewCourseCategory('টাস্ক কমপ্লিট');
                  setCourseItems([]);
                  setEditingCourseId(null);
                } catch (err) {
                  toast.error("সেভ করতে ব্যর্থ হয়েছে");
                  console.error(err);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">কোর্সের শিরোনাম (Title)</label>
                  <input 
                    type="text" 
                    placeholder="উদাঃ সঠিক উপায়ে ডেইলি স্পিন খেলুন" 
                    required 
                    value={newCourseTitle} 
                    onChange={(e) => setNewCourseTitle(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-purple-555 transition-all text-slate-900 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">টিউটোরিয়াল ক্যাটাগরি (Category)</label>
                  <select 
                    value={newCourseCategory} 
                    onChange={(e) => setNewCourseCategory(e.target.value as any)} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-555"
                  >
                    <option value="টাস্ক কমপ্লিট">টাস্ক কমপ্লিট</option>
                    <option value="টাকা উইথড্র">টাকা উইথড্র</option>
                    <option value="অন্যান্য">অন্যান্য হেল্প</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">থাম্বনেইল ইমেজ লিংক (Thumbnail URL)</label>
                  <input 
                    type="url" 
                    placeholder="https://images.unsplash.com/..." 
                    required 
                    value={newCourseThumbnail} 
                    onChange={(e) => setNewCourseThumbnail(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-purple-555 transition-all text-slate-900 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">ভিডিও বা রেফারেল লিংক (Video/Instruction Link)</label>
                  <input 
                    type="url" 
                    placeholder="https://youtube.com/watch?v=..." 
                    required 
                    value={newCourseLink} 
                    onChange={(e) => setNewCourseLink(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-purple-555 transition-all text-slate-900 dark:text-white" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">পূর্ণাঙ্গ ডেসক্রিপশন বা নির্দেশনা (Detailed Description)</label>
                <textarea 
                  placeholder="ধাপে ধাপে কিভাবে টাস্ক সম্পন্ন করবে বা কিভাবে উইথড্র করবে তার বিস্তারিত বিবরণ লিখুন..." 
                  required 
                  rows={4} 
                  value={newCourseDesc} 
                  onChange={(e) => setNewCourseDesc(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-bold ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-purple-555 transition-all text-slate-900 dark:text-white"
                />
              </div>

              {/* Option Creator UI Section */}
              <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">আলাদা আলাদা অপশন / বহুবিধ টিউটোরিয়াল যোগ করুন (Multiple Option Items)</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Add sub-tutorials for How to complete tasks, How to withdraw, etc.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">অপশন শিরোনাম (Option Title)</label>
                    <input 
                      type="text" 
                      placeholder="উদাঃ ১. কিভাবে সঠিক উপায়ে টাস্ক সম্পন্ন করবেন" 
                      value={optTitle} 
                      onChange={(e) => setOptTitle(e.target.value)} 
                      className="w-full bg-white dark:bg-slate-800 border-none px-4 py-2.5 rounded-xl text-xs font-bold ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-purple-555 transition-all text-slate-900 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">অপশন থাম্বনেইল লিংক (Option Thumbnail URL)</label>
                    <input 
                      type="url" 
                      placeholder="https://images.unsplash.com/..." 
                      value={optThumbnail} 
                      onChange={(e) => setOptThumbnail(e.target.value)} 
                      className="w-full bg-white dark:bg-slate-800 border-none px-4 py-2.5 rounded-xl text-xs font-bold ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-purple-555 transition-all text-slate-900 dark:text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">অপশন ভিডিও/টিউটোরিয়াল লিংক (Option Video/Instruction Link)</label>
                    <input 
                      type="url" 
                      placeholder="https://youtube.com/watch?v=..." 
                      value={optLink} 
                      onChange={(e) => setOptLink(e.target.value)} 
                      className="w-full bg-white dark:bg-slate-800 border-none px-4 py-2.5 rounded-xl text-xs font-bold ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-purple-555 transition-all text-slate-900 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">অপশন সংক্ষিপ্ত বিবরণ (Option Description)</label>
                    <input 
                      type="text" 
                      placeholder="উদাঃ নিয়মগুলো এবং স্টেপ-বাই-স্টেপ সিক্রেট ভিডিও মেথড দেখুন।" 
                      value={optDesc} 
                      onChange={(e) => setOptDesc(e.target.value)} 
                      className="w-full bg-white dark:bg-slate-800 border-none px-4 py-2.5 rounded-xl text-xs font-bold ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-purple-555 transition-all text-slate-900 dark:text-white" 
                    />
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => {
                    if (!optTitle || !optLink) {
                      toast.error("অপশন টাইটেল ও টিউটোরিয়াল লিংক আবশ্যক");
                      return;
                    }
                    const newItem = {
                      title: optTitle,
                      description: optDesc || 'ভিডিও টিউটোরিয়াল দেখুন।',
                      thumbnailUrl: optThumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
                      videoLink: optLink
                    };
                    setCourseItems(prev => [...prev, newItem]);
                    // Clear option fields
                    setOptTitle('');
                    setOptDesc('');
                    setOptThumbnail('');
                    setOptLink('');
                    toast.success("অপশনটি সফলভাবে নিচে লিস্টে যুক্ত হয়েছে!");
                  }}
                  className="bg-purple-600 hover:bg-purple-550 text-white font-black px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1 hover:scale-98 active:scale-95 transition-all"
                >
                  সবুজ লিস্টে অপশন যোগ করুন (+ Add Option)
                </button>

                {/* Render added list items */}
                {courseItems.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">যুক্তকৃত অপশনসমূহ ({courseItems.length})</p>
                    <div className="grid gap-2 max-h-[220px] overflow-y-auto pr-1">
                      {courseItems.map((item, index) => (
                        <div key={index} className="bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 text-[9px] font-black flex items-center justify-center shrink-0">
                              {index + 1}
                            </span>
                            <img src={item.thumbnailUrl} alt="" className="w-10 h-8 object-cover rounded bg-slate-105 shrink-0 border border-slate-200/40 dark:border-slate-800" />
                            <div className="min-w-0">
                              <h5 className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[200px] leading-tight">{item.title}</h5>
                              <p className="text-[9px] text-slate-400 truncate max-w-[200px] leading-tight">{item.videoLink}</p>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => {
                              setCourseItems(prev => prev.filter((_, idx) => idx !== index));
                              toast.success("টি বাদ দেওয়া হয়েছে!");
                            }}
                            className="text-[9px] font-black uppercase text-rose-500 hover:text-rose-600 hover:underline shrink-0"
                          >
                            বাদ দিন
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
                  className="flex-1 bg-purple-600 hover:bg-purple-550 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg shadow-purple-600/10 transition-all text-xs"
                >
                  {editingCourseId ? 'আপডেট সেভ করুন (Save Changes)' : 'কোর্স বা টিউটোরিয়াল তৈরি করুন (Create)'}
                </button>
                
                {editingCourseId && (
                  <button 
                    type="button"
                    onClick={() => {
                      setNewCourseTitle('');
                      setNewCourseDesc('');
                      setNewCourseThumbnail('');
                      setNewCourseLink('');
                      setNewCourseCategory('টাস্ক কমপ্লিট');
                      setCourseItems([]);
                      setEditingCourseId(null);
                    }}
                    className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold px-6 py-3.5 rounded-2xl text-xs"
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
              <h3 className="font-black dark:text-white uppercase tracking-tight text-xs">লাইভ কোর্স এবং টিউটোরিয়ালসমূহ ({adminCourses.length})</h3>
              
              <button 
                onClick={async () => {
                  try {
                    const batch = writeBatch(db);
                    const DEFAULT_ITEMS = [
                      {
                        title: "নিয়ম মেনে প্রতিদিনের কাজ সম্পন্ন করার গাইডলাইন",
                        description: "আমাদের অ্যাপে দেওয়া প্রতিদিনের টাস্ক বা কাজগুলো কিভাবে সঠিক নিয়মে সম্পন্ন করবেন, কোন কোন ভুলগুলো পরিহার করবেন এবং সঠিক উপায়ে আর্নিং ব্যালেন্স যোগ করবেন তা বিস্তারিত দেখুন। ভুল নিয়মে কাজ করলে আইডি ব্লক হতে পারে।",
                        thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
                        videoLink: "https://www.youtube.com",
                        category: "টাস্ক কমপ্লিট",
                        status: 'active'
                      },
                      {
                        title: "বিকাশ ও নগদে সফলভাবে উইথড্র বা টাকা তোলার নিয়ম",
                        description: "বিকাশ, নগদ বা রকেটের মাধ্যমে কিভাবে সফলভাবে আপনার কষ্টার্জিত টাকা মাত্র ১ মিনিটে উইথড্র নিবেন তা ধাপে ধাপে শিখুন। পেমেন্ট রিকুয়েস্ট দেওয়ার পর এডমিন লাইংথ অনুযায়ী কতক্ষণে টাকা পাবেন তা জানুন।",
                        thumbnailUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600&auto=format&fit=crop",
                        videoLink: "https://www.youtube.com",
                        category: "টাকা উইথড্র",
                        status: 'active'
                      },
                      {
                        title: "ডেইলি স্পিন ও কুইজ গেম খেলে আনলিমিটেড আয়ের উপায়",
                        description: "প্লাটফর্মে প্রতিদিন কোনো লিমিট ছাড়া কিভাবে আনলিমিটেড স্পিন এবং সহজ ম্যাথ কুইজ সমাধান করে অতিরিক্ত রিওয়ার্ড আর্ন করবেন তার পূর্ণাঙ্গ সিক্রেট নিয়মাবলি।",
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
                    toast.success("ডিফল্ট উদাহরণ কোর্স সফলভাবে ইম্পোর্ট করা হয়েছে!");
                  } catch (err) {
                    toast.error("ইম্পোর্ট ব্যর্থ হয়েছে");
                  }
                }}
                className="text-[10px] font-black uppercase text-purple-600 hover:text-purple-550 underline"
              >
                ডিফল্ট নমুনা বাটন লোড করুন
              </button>
            </div>

            {adminCourses.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-slate-800/40 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">এখনো কোনো কোর্স বা টিউটোরিয়াল তৈরি করা হয়নি।</p>
              </div>
            )}

            <div className="grid gap-4">
              {adminCourses.map(course => (
                <div key={course.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <img 
                      src={course.thumbnailUrl} 
                      alt="" 
                      className="w-16 h-12 object-cover rounded-xl bg-slate-50 border border-slate-100/50 shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] px-2 py-0.5 bg-purple-50 dark:bg-purple-950/20 border border-purple-100/20 text-purple-600 dark:text-purple-400 font-bold rounded-lg uppercase">
                          {course.category}
                        </span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${course.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                          {course.status}
                        </span>
                      </div>
                      <h4 className="font-black text-slate-900 dark:text-white text-xs mt-1 truncate uppercase">{course.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold max-w-sm truncate leading-none mt-1">{course.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 w-full sm:w-auto shrink-0 border-t sm:border-y-0 border-slate-50 dark:border-slate-750/30 pt-3 sm:pt-0">
                    <button 
                      onClick={() => {
                        setNewCourseTitle(course.title || '');
                        setNewCourseDesc(course.description || '');
                        setNewCourseThumbnail(course.thumbnailUrl || '');
                        setNewCourseLink(course.videoLink || '');
                        setNewCourseCategory(course.category || 'টাস্ক কমপ্লিট');
                        setCourseItems(course.items || []);
                        setEditingCourseId(course.id);
                        toast.success("সম্পাদনার জন্য ডাটা লোড হয়েছে!");
                      }}
                      className="text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:text-slate-350"
                    >
                      এডিট
                    </button>
                    
                    <button 
                      onClick={async () => {
                        try {
                          const toggledStatus = course.status === 'active' ? 'inactive' : 'active';
                          await updateDoc(doc(db, "courses", course.id), { status: toggledStatus });
                          toast.success(`কործ স্ট্যাটাস ${toggledStatus} সফল হয়েছে`);
                          await loadData(true);
                        } catch (err) {
                          toast.error("অবস্থা পরিবর্তনে ব্যর্থতা");
                        }
                      }}
                      className={`text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl border ${course.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                    >
                      {course.status === 'active' ? 'চলমান' : 'বন্ধ'}
                    </button>

                    <button 
                      onClick={async () => {
                        if (confirm("এই টিউটোরিয়ালটি কি চিরতরে মুছে ফেলতে চান?")) {
                          try {
                            await deleteDoc(doc(db, "courses", course.id));
                            toast.success("মুছে ফেলা হয়েছে!");
                            await loadData(true);
                          } catch (err) {
                            toast.error("ফেইল্ড!");
                          }
                        }
                      }}
                      className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/40 text-rose-500 rounded-xl transition-colors"
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
            <h3 className="font-black dark:text-white flex items-center gap-2 uppercase tracking-tight text-sm">
              <Users className="w-4 h-4 text-indigo-500" /> Database Entities ({userList.length})
            </h3>
            
                        <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteDuplicateAdmins(); }}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
            >
              Delete Duplicate Admins
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleFixOldReferrals(); }}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
            >
              Fix Old Referrals
            </button>
            
            <div className="relative w-full sm:w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search by name, email or ID..."
                value={userSearchTerm}
                onChange={e => setUserSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all"
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
                className="bg-white dark:bg-slate-800 p-5 rounded-[28px] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-slate-100 dark:bg-slate-700"></div>
                
                <div className="flex-1 pl-2">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-base italic">{user.fullName || 'Anonymous'}</h4>
                    <div className="flex gap-1 flex-wrap">
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest border ${user.isBlocked ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-emerald-100 text-emerald-600 border-emerald-200'}`}>
                        {user.isBlocked ? 'Blocked' : 'Normal Access'}
                      </span>
                      {user.role !== 'admin' && (
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest border ${user.isActive ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-amber-100 text-amber-600 border-amber-200'}`}>
                          {user.isActive ? 'Activated' : 'Inactive'}
                        </span>
                      )}
                      {user.role === 'employee' && (
                        <span className="text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest bg-teal-100 text-teal-700 border border-teal-200">Employee</span>
                      )}
                      {user.role === 'admin' && (
                        <span className="text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest bg-indigo-100 text-indigo-650 border border-indigo-200">System Admin</span>
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
                
                <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
                  {isFullAdmin && user.role !== 'admin' && (
                    <button 
                      onClick={() => {
                        setEmployeeConfigUser(user);
                        setEmployeePermissions(user.permissions || []);
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-[0.1em] text-[10px] transition-all active:scale-95 bg-purple-100 text-purple-600 shadow-lg shadow-purple-500/10 hover:bg-purple-200"
                    >
                      <ShieldCheck className="w-4 h-4" /> Config Employee
                    </button>
                  )}
                  {isFullAdmin && user.role !== 'admin' && (
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-[0.1em] text-[10px] transition-all active:scale-95 bg-rose-100 text-rose-600 hover:bg-rose-200 shadow-lg shadow-rose-500/10"
                    >
                      <Trash2 className="w-4 h-4" /> Delete User
                    </button>
                  )}
                  {user.role !== 'admin' && (
                    <button 
                      onClick={() => handleToggleActive(user.id, user.isActive || false)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-[0.1em] text-[10px] transition-all active:scale-95 disabled:opacity-30 ${
                        !user.isActive 
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                          : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                      }`}
                    >
                      {!user.isActive ? (
                        <>
                          <CheckCircle className="w-4 h-4" /> Activate
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" /> Deactivate
                        </>
                      )}
                    </button>
                  )}
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
        <div className="space-y-6">
          {/* Settings Sub Tabs Menu */}
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-[24px] overflow-x-auto gap-2 no-scrollbar ring-1 ring-slate-200 dark:ring-slate-800/60">
            {[
              { id: 'identity', label: 'আইডেন্টিটি ও সাধারণ', sub: 'Identity & Info', icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
              { id: 'gateways', label: 'গেটওয়ে ও উইথড্র', sub: 'Deposit & Cashout', icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
              { id: 'rewards', label: 'বোনাস ও রিওয়ার্ড', sub: 'Referrals & Spins', icon: Coins, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20' },
              { id: 'security', label: 'নিরাপত্তা ও সিস্টেম', sub: 'Gates & Popups', icon: Lock, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
              { id: 'danger', label: 'ফ্যাক্টরি রিসেট', sub: 'System Reset', icon: Trash2, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/20' }
            ].map(st => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSettingsSubTab(st.id as any)}
                className={`flex-1 min-w-[170px] md:min-w-0 py-3 px-4 rounded-[18px] text-[11px] font-black transition-all duration-200 flex items-center gap-2.5 whitespace-nowrap active:scale-95 ${
                  settingsSubTab === st.id
                    ? 'bg-white dark:bg-slate-800 shadow-md text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl ${st.bg} flex items-center justify-center ${st.color}`}>
                  <st.icon className="w-4 h-4" />
                </div>
                <div className="text-left flex flex-col">
                  <span className="font-extrabold text-[12px] tracking-tight">{st.label}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">{st.sub}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Popup Settings */}
            {settingsSubTab === 'security' && (
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
                
                <button type="button" onClick={handleSavePopupSettings} disabled={isSavingSettings} className="mt-6 w-full bg-indigo-600 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-xs flex items-center justify-center gap-2">
                  {isSavingSettings ? <><RefreshCw className="w-4 h-4 animate-spin" /> Updating...</> : 'Save Popup'}
                </button>
              </motion.div>
            )}

          {/* Site Identity */}
          {settingsSubTab === 'identity' && (
            <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight italic">Identity & Limits</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Branding & Task Controls</p>
              </div>
            </div>
            
            <div className="space-y-5 flex-1">
              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block group-focus-within:text-emerald-500">Site Name</label>
                <input type="text" value={siteSettings.siteName} onChange={(e) => setSiteSettings(prev => ({ ...prev, siteName: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-[11px] font-bold ring-1 ring-slate-100 dark:ring-slate-800" />
              </div>
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block group-focus-within:text-emerald-500">Floating Telegram URL</label>
                <input type="text" value={siteSettings.telegramUrl} onChange={(e) => setSiteSettings(prev => ({ ...prev, telegramUrl: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-[11px] font-bold ring-1 ring-slate-100 dark:ring-slate-800" placeholder="https://t.me/yourchannel" />
              </div>
              <div className="group mt-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block group-focus-within:text-emerald-500">Direct APK Download URL</label>
                <input type="text" value={siteSettings.apkUrl || ''} onChange={(e) => setSiteSettings(prev => ({ ...prev, apkUrl: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-[11px] font-bold ring-1 ring-slate-100 dark:ring-slate-800" placeholder="https://example.com/app.apk" />
                <p className="text-[9px] text-slate-500 pl-1 mt-1">If provided, this URL will be used for out-of-store direct APK installs instead of PWA installation.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block group-focus-within:text-emerald-500">Ads View Button Text</label>
                  <input type="text" value={siteSettings.adsViewText} onChange={(e) => setSiteSettings(prev => ({ ...prev, adsViewText: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-[11px] font-bold ring-1 ring-slate-100 dark:ring-slate-800" placeholder="Watch Ads" />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block group-focus-within:text-emerald-500">Ads View Link</label>
                  <input type="text" value={siteSettings.adsViewLink} onChange={(e) => setSiteSettings(prev => ({ ...prev, adsViewLink: e.target.value }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-[11px] font-bold ring-1 ring-slate-100 dark:ring-slate-800" placeholder="https://..." />
                </div>
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block group-focus-within:text-emerald-500">Daily Task Limit (Per User)</label>
                <input type="number" value={siteSettings.dailyTaskLimit} onChange={(e) => setSiteSettings(prev => ({ ...prev, dailyTaskLimit: Number(e.target.value) }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-[11px] font-bold ring-1 ring-slate-100 dark:ring-slate-800" placeholder="0 for unlimited" />
                <p className="text-[9px] text-slate-400 mt-1 px-1">Maximum tasks a user can submit in 24 hours.</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Drive Offer Option</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Enable/Disable Drive Offer page access</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${siteSettings.driveOffersEnabled ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {siteSettings.driveOffersEnabled ? 'ON' : 'OFF'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSiteSettings(prev => ({ ...prev, driveOffersEnabled: !prev.driveOffersEnabled }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${siteSettings.driveOffersEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-705'}`}
                  >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${siteSettings.driveOffersEnabled ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Course Feature Option</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Enable/Disable Course action access</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${siteSettings.coursesEnabled !== false ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {siteSettings.coursesEnabled !== false ? 'ON' : 'OFF'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSiteSettings(prev => ({ ...prev, coursesEnabled: !prev.coursesEnabled }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${siteSettings.coursesEnabled !== false ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-705'}`}
                  >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${siteSettings.coursesEnabled !== false ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Ads View Earnings</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Enable/Disable Ads View action access</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${siteSettings.adsViewEnabled ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {siteSettings.adsViewEnabled ? 'ON' : 'OFF'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSiteSettings(prev => ({ ...prev, adsViewEnabled: !prev.adsViewEnabled }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${siteSettings.adsViewEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-705'}`}
                  >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${siteSettings.adsViewEnabled ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-indigo-50/50 dark:bg-slate-900 rounded-2xl border border-indigo-100/40 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Review Jobs Option</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Enable/Disable Review Jobs action access</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${siteSettings.reviewsEnabled !== false ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {siteSettings.reviewsEnabled !== false ? 'ON' : 'OFF'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSiteSettings(prev => ({ ...prev, reviewsEnabled: prev.reviewsEnabled === false ? true : false }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${siteSettings.reviewsEnabled !== false ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-705'}`}
                  >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${siteSettings.reviewsEnabled !== false ? 'translate-x-6' : ''}`} />
                  </button>
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
          </>)}

          {/* Spin Wheel Settings */}
          {settingsSubTab === 'rewards' && (
            <>
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

          {/* Partner Engine */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight italic">Partner Program</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Daily Yield Rules</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-3 rounded-[20px] ring-1 ring-slate-100 dark:ring-slate-800">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-2">Enable Partner System</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={partnerSettings.enabled} onChange={(e) => setPartnerSettings(prev => ({ ...prev, enabled: e.target.checked }))} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-3 rounded-[20px] ring-1 ring-slate-100 dark:ring-slate-800">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-2">Enable Partner Withdrawals</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={partnerSettings.withdrawEnabled} onChange={(e) => setPartnerSettings(prev => ({ ...prev, withdrawEnabled: e.target.checked }))} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-500"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Required Referrals</label>
                  <input type="number" value={partnerSettings.requiredReferrals} onChange={(e) => setPartnerSettings(prev => ({ ...prev, requiredReferrals: Number(e.target.value) }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-black ring-1 ring-slate-100 dark:ring-slate-800" />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Daily Bonus (৳)</label>
                  <input type="number" value={partnerSettings.dailyBonus} onChange={(e) => setPartnerSettings(prev => ({ ...prev, dailyBonus: Number(e.target.value) }))} className="w-full bg-slate-50 dark:bg-slate-900 border-none px-4 py-3 rounded-2xl text-sm font-black text-indigo-500 ring-1 ring-slate-100 dark:ring-slate-800" />
                </div>
              </div>
            </div>
            
            <button onClick={handleSavePartnerSettings} disabled={isSavingSettings} className="mt-6 w-full bg-indigo-600 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-xs">Save Partner Rules</button>
          </motion.div>
          </>)}

          {/* Announcement Scroller */}
          {settingsSubTab === 'identity' && (
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
          )}

          {/* Game Gates */}
          {settingsSubTab === 'security' && (
            <>
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
          </>)}

          {/* Withdrawal Protocol */}
          {settingsSubTab === 'gateways' && (
            <>
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

            <div className="mt-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl space-y-2 ring-1 ring-slate-100 dark:ring-slate-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block">Withdraw Option Amounts (৳)</span>
              <p className="text-[9px] text-slate-400 font-bold uppercase leading-tight">Enter comma-separated withdraw amounts that users can select from</p>
              <input 
                type="text" 
                value={withdrawSettings.customAmounts || ""} 
                onChange={(e) => setWithdrawSettings(prev => ({ ...prev, customAmounts: e.target.value }))} 
                className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3.5 py-2.5 text-xs font-black tracking-widest text-slate-700 dark:text-white ring-1 ring-slate-100 dark:ring-slate-700" 
                placeholder="110, 210, 310, 410, 510" 
              />
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
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#e2136e] flex items-center justify-center text-white text-[10px] font-black">BKASH</div>
                      <input type="text" value={depositSettings.bkashNumber} onChange={(e) => setDepositSettings(prev => ({ ...prev, bkashNumber: e.target.value }))} className="flex-1 bg-white dark:bg-slate-800 border-none rounded-xl px-3 py-2.5 text-sm font-black tracking-widest text-[#e2136e] ring-1 ring-slate-100 dark:ring-slate-700" placeholder="01XXX-XXXXXX" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!depositSettings.bkashEnabled} onChange={(e) => setDepositSettings(prev => ({ ...prev, bkashEnabled: e.target.checked }))} className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500" />
                      <span className="text-xs font-bold text-slate-500">Enabled</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#ea232a] flex items-center justify-center text-white text-[10px] font-black">NAGAD</div>
                      <input type="text" value={depositSettings.nagadNumber} onChange={(e) => setDepositSettings(prev => ({ ...prev, nagadNumber: e.target.value }))} className="flex-1 bg-white dark:bg-slate-800 border-none rounded-xl px-3 py-2.5 text-sm font-black tracking-widest text-[#ea232a] ring-1 ring-slate-100 dark:ring-slate-700" placeholder="01XXX-XXXXXX" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!depositSettings.nagadEnabled} onChange={(e) => setDepositSettings(prev => ({ ...prev, nagadEnabled: e.target.checked }))} className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500" />
                      <span className="text-xs font-bold text-slate-500">Enabled</span>
                    </label>
                  </div>
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
          </>)}

          {/* DANGER ZONE: Wipe Data */}
          {settingsSubTab === 'danger' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-[32px] shadow-sm border border-rose-200 dark:border-rose-900/30 md:col-span-2 mt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-rose-700 dark:text-rose-400 uppercase tracking-tight">Danger Zone: Factory Reset</h3>
                  <p className="text-[10px] font-bold text-rose-500/80 uppercase tracking-widest leading-none">Irreversible Database Wipe</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-6">
                This action will completely wipe all user accounts (except admins), tasks, courses, requests, and transactions from Firestore. This cannot be undone. Ensure you have backed up the data if needed.
              </p>
              <button 
                onClick={handleWipeData} 
                disabled={isSavingSettings} 
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg shadow-rose-600/20 active:scale-95 transition-all text-xs"
              >
                Understand & Wipe Everything
              </button>
            </motion.div>
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
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
              onClick={() => setViewingScreenshot(null)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative bg-white dark:bg-slate-900 rounded-[24px] p-5 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 z-10 flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Proof Screenshot</span>
                <button
                  onClick={() => setViewingScreenshot(null)}
                  className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 text-slate-500 dark:text-slate-400 font-extrabold text-[10px] transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50 flex items-center justify-center p-2.5">
                <img
                  src={viewingScreenshot}
                  alt="Proof screenshot"
                  className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-md cursor-zoom-in"
                  onClick={() => window.open(viewingScreenshot, '_blank')}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="pt-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Tap image to open in full tab
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirm Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-2xl max-w-sm w-full border border-slate-100 dark:border-slate-700"
          >
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-center font-black text-xl mb-2 text-slate-800 dark:text-white uppercase tracking-tight">{confirmDialog.title}</h3>
            <p className="text-center font-medium text-slate-500 mb-6">{confirmDialog.message}</p>
            
            {confirmDialog.isPrompt && (
              <div className="mb-6">
                <input 
                  type="text" 
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder={`Type '${confirmDialog.promptExpected}' here...`}
                  className="w-full text-center bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 rounded-2xl px-4 py-3 font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-mono uppercase"
                />
              </div>
            )}
            
            <div className="flex gap-3">
              <button 
                onClick={() => { setConfirmDialog(null); setPromptInput(''); }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button 
                disabled={confirmDialog.isPrompt && promptInput !== confirmDialog.promptExpected}
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                  setPromptInput('');
                }}
                className={`flex-1 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all ${
                  (confirmDialog.isPrompt && promptInput !== confirmDialog.promptExpected)
                    ? 'bg-rose-300 text-white/50 cursor-not-allowed shadow-none'
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                }`}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Employee Admin Config Modal */}
      {employeeConfigUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEmployeeConfigUser(null)}></motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white dark:bg-slate-800 rounded-[32px] p-6 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight mb-1 text-center">Employee Admin Control</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-center mb-6">Manage roles for {employeeConfigUser.fullName}</p>
            
            <div className="space-y-2 mb-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2">Allowed Permissions:</p>
              {ALL_TABS.map(tab => (
                <label key={tab.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={employeePermissions.includes(tab.id)}
                    onChange={(e) => {
                      if (e.target.checked) setEmployeePermissions(prev => [...prev, tab.id]);
                      else setEmployeePermissions(prev => prev.filter(p => p !== tab.id));
                    }}
                    className="w-5 h-5 rounded-md border-slate-300 text-purple-600 focus:ring-purple-600"
                  />
                  <div className="flex items-center gap-2">
                    <tab.icon className={`w-4 h-4 ${tab.color}`} />
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">{tab.label} Access</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleSaveEmployeeConfig}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-[0.15em] py-3.5 rounded-2xl shadow-lg shadow-purple-600/20 active:scale-95 transition-all text-[11px]"
              >
                Save Roles & Permissions
              </button>
              <button 
                onClick={() => setEmployeeConfigUser(null)}
                className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-black uppercase tracking-[0.15em] py-3.5 rounded-2xl active:scale-95 transition-all text-[11px]"
              >
                Close
              </button>
            </div>
            {employeePermissions.length === 0 && (
              <p className="text-[10px] text-center text-rose-500 font-bold uppercase mt-4 opacity-80">Saving with no permissions will revoke employee access</p>
            )}
          </motion.div>
        </div>
      )}

    </div>
  );
}
