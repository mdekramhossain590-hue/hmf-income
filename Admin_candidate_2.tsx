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
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyTarget, setNotifyTarget] = useState<'all' | string>('all');
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [spinRewards, setSpinRewards] = useState<number[]>([1, 2, 5, 10, 0, 50, 100, 0]);
  const [referralSettings, setReferralSettings] = useState({ fixedBonus: 5, gen2FixedBonus: 3, gen3FixedBonus: 1, gen1Percent: 0, gen2Percent: 0, gen3Percent: 0 });
  const [bannerSettings, setBannerSettings] = useState({ text: 'Welcome to HMF Income! Complete tasks and earn money daily.', link: '#' });
  const [gameSettings, setGameSettings] = useState({ spinTaskReq: 0, spinReferReq: 0, mathTaskReq: 0, mathReferReq: 0 });
  const [partnerSettings, setPartnerSettings] = useState({ requiredReferrals: 10, dailyBonus: 100, enabled: true, withdrawEnabled: true });
  const [withdrawSettings, setWithdrawSettings] = useState({ mainMin: 50, mainFee: 0, bonusMin: 50, bonusFee: 0, referralMin: 50, referralFee: 0, tasksMin: 50, tasksFee: 0, mainAmounts: "110, 210, 310, 410, 510", bonusAmounts: "110, 210, 310, 410, 510", referralAmounts: "110, 210, 310, 410, 510", tasksAmounts: "110, 210, 310, 410, 510", partnerAmounts: "110, 210, 310, 410, 510", giftAmounts: "110, 210, 310, 410, 510" });
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
      toast.loading("Finding and deleting accounts...");
      const { query, collection, where, getDocs, deleteDoc, doc } = await import('firebase/firestore');
      
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
      loadData(true);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleFixBonusAmounts = async () => {
    try {
      toast.success("Fixing bonus amounts started...");
      const { collection, getDocs, updateDoc, doc, increment, setDoc } = await import('firebase/firestore');
      
      let fixedCount = 0;
      let permissionErrors = 0;
      
      for (const user of userList) {
        const userId = user.id;
        try {
          const refSnap = await getDocs(collection(db, `users/${userId}/referrals`));
          
          for (const rDoc of refSnap.docs) {
            const data = rDoc.data();
            let diff = 0;
            let newBonus = 0;
            
            if (data.level === 1 && data.bonusEarned > 5) {
              diff = data.bonusEarned - 5; newBonus = 5;
            } else if (data.level === 2 && data.bonusEarned > 3) {
              diff = data.bonusEarned - 3; newBonus = 3;
            } else if (data.level === 3 && data.bonusEarned > 1) {
              diff = data.bonusEarned - 1; newBonus = 1;
            }
            
            if (diff > 0) {
               let updated = false;
               try {
                 await updateDoc(rDoc.ref, { bonusEarned: newBonus });
                 updated = true;
               } catch(err) {
                 console.warn("Could not fix ref doc", err);
                 permissionErrors++;
               }
               
               try {
                 await updateDoc(doc(db, "users", userId), {
                   "balances.referral": increment(-diff)
                 });
                 await setDoc(doc(db, "leaderboard", userId), {
                   totalIncome: increment(-diff)
                 }, { merge: true });
                 if (!updated) updated = true; 
               } catch (err) {
                  console.warn("Could not fix user balance", err);
               }
               
               if (updated) fixedCount++;
            }
          }
        } catch (e) {
           permissionErrors++;
           console.error("Failed for user", userId, e);
        }
      }
      
      if (fixedCount > 0) {
        toast.success(`Fixed ${fixedCount} referrals!`);
        loadData(true);
      } else if (permissionErrors > 0) {
        toast.error(`Permission denied on ${permissionErrors} operations.`);
      } else {
        toast.success("No referrals needed fixing.");
      }
    } catch (e: any) {
      toast.error(e.message);
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
            
            // Only process if the user is ACTIVE!
            if (data.isActive) {
              if (data.email) {
                const refSubQuery = query(collection(db, `users/${referrerId}/referrals`), where("referredEmail", "==", data.email));
                const refSubSnapshot = await getDocs(refSubQuery);
                if (refSubSnapshot.empty) missed = true;
              } else {
                missed = !data.referralBonusPaid;
              }
            } else {
              // If user is INACTIVE but referralBonusPaid is true, fix it so they can be processed later when they activate!
              if (data.referralBonusPaid) {
                await updateDoc(doc(db, "users", userDoc.id), { referralBonusPaid: false });
              }
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
        </button>
      </div>
      <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-[20px] mb-8 flex-wrap gap-1.5 ring-1 ring-slate-200 dark:ring-slate-800">
        {allowedTabs.map(tab => (
          <button 
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
                      </button>
                    </div>
                  )}
                  {sub.proofs.password && (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
                    P$-o  P$-o  o    o                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Password:</span>
                        <p className="text-sm font-mono font-bold text-rose-500 break-all">{sub.proofs.password}</p>
                      </div>
                      <button
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
                      </button>
                    </div>
                  )}
                  {sub.proofs.screenshot && (
                    <div className="pt-2">
                      <button 
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                </button>
                <button 
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
                      </button>
                      <button 
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
                  </button>
                  <button onClick={() => handleDeleteJob(job.id)} className="p-3 text-rose-500 bg-rose-50 dark:bg-rose-900/30 rounded-2xl hover:scale-105 active:scale-90 transition-all">
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
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center font-sans">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Transaction ID</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-indigo-600 selection:bg-indigo-100 tracking-wider text-[11px]">{req.trxId}</span>
                        <button
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
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center font-sans">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Transaction ID</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-emerald-600 tracking-wider text-[11px]">{req.trxId}</span>
                        <button
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
                </button>
                <button 
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
                      </button>
                      <button onClick={() => handleDeleteFaq(index)} className="p-2 text-rose-500 bg-rose-50 dark:bg-rose-900/30 rounded-lg hover:scale-105 active:scale-90 transition-all">
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
                      </button>
                      <button 
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
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2.5">
                <button 
                </button>
                
                {editingCourseId && (
                  <button 
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
                    </button>
                    
                    <button 
                    </button>

                    <button 
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
            </button>
            <button
            </button>
            
            <button
            </button>
            <button
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
                    <div className="bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Referral</p>
                      <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">৳{(user.balances?.referral || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Tasks</p>
                      <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">৳{(
                        Object.values(user.balances?.tasks || {}).reduce((a: any, b: any) => Number(a || 0) + Number(b || 0), 0) as number
                      ).toFixed(2)}</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                      <p className="text-[8px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest leading-none mb-0.5">Total</p>
                      <p className="text-xs font-black text-indigo-700 dark:text-indigo-300 leading-tight">৳{(
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
                  </button>
                  {isFullAdmin && user.role !== 'admin' && (
                    <button 
                    </button>
                  )}
                  {isFullAdmin && user.role !== 'admin' && (
                    <button 
                    </button>
                  )}
                  {user.role !== 'admin' && (
                    <button 
                    </button>
                  )}
                  <button 
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
                  </button>
                </div>
              </div>
            </div>
            
            <button onClick={handleSaveSiteSettings} disabled={isSavingSettings} className="mt-6 w-full bg-emerald-600 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all text-xs">Update Identity</button>
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
              <p className="text-[9px] text-slate-400 font-bold uppercase leading-tight">Comma-separated withdraw options for each wallet</p>
              
              <div className="space-y-3 mt-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Main Wallet Amounts</span>
                  <input type="text" value={withdrawSettings.mainAmounts || ""} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, mainAmounts: e.target.value }))} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider text-slate-700 dark:text-white mt-1" placeholder="110, 210..." />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Bonus Wallet Amounts</span>
                  <input type="text" value={withdrawSettings.bonusAmounts || ""} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, bonusAmounts: e.target.value }))} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider text-slate-700 dark:text-white mt-1" placeholder="110, 210..." />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Referral Wallet Amounts</span>
                  <input type="text" value={withdrawSettings.referralAmounts || ""} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, referralAmounts: e.target.value }))} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider text-slate-700 dark:text-white mt-1" placeholder="110, 210..." />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Partner Wallet Amounts</span>
                  <input type="text" value={withdrawSettings.partnerAmounts || ""} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, partnerAmounts: e.target.value }))} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider text-slate-700 dark:text-white mt-1" placeholder="110, 210..." />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Gift Wallet Amounts</span>
                  <input type="text" value={withdrawSettings.giftAmounts || ""} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, giftAmounts: e.target.value }))} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider text-slate-700 dark:text-white mt-1" placeholder="110, 210..." />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Tasks Wallet Amounts</span>
                  <input type="text" value={withdrawSettings.tasksAmounts || ""} onChange={(e) => setWithdrawSettings(prev => ({ ...prev, tasksAmounts: e.target.value }))} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3.5 py-2 text-xs font-bold tracking-wider text-slate-700 dark:text-white mt-1" placeholder="110, 210..." />
                </div>
              </div>
            </div>
            
            <button onClick={handleSaveWithdrawSettings} disabled={isSavingSettings} className="mt-6 w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-[0.2em] py-3.5 rounded-2xl shadow-xl active:scale-95 transition-all text-xs">Execute Protocol</button>
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
              </button>
              <button 
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
              </button>
              <button 
              </button>
            </div>
            {employeePermissions.length === 0 && (
              <p className="text-[10px] text-center text-rose-500 font-bold uppercase mt-4 opacity-80">Saving with no permissions will revoke employee access</p>
            )}
          </motion.div>
        </div>
      )}

      {showNotifyModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <BellRing className="w-5 h-5 text-sky-500" />
                {notifyTarget === 'all' ? 'Notify All Users' : 'Send Notification'}
              </h3>
              <button onClick={() => setShowNotifyModal(false)} className="text-slate-400 hover:text-slate-600">
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Title</label>
                <input
                  type="text"
                  value={notifyTitle}
                  onChange={(e) => setNotifyTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold dark:text-white"
                  placeholder="Notification Title"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Message</label>
                <textarea
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold dark:text-white min-h-[100px]"
                  placeholder="Type your message here..."
                ></textarea>
              </div>
              
              <button
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
AAA      /        o                                        ~K ,aACnCc    jCc      AAc,                 A,OA	Ac    Ac      AC9C                g] W,GADc    Dc    K ,SAAvCc    rCc      ;AAAFc    Fc    A A+E;Cc    Cc    VW O,YA`Dc    \Dc      AAA,                  AAAA                  S,GA                  AC7B                  ,GAA                  AAU;                 C,SAAc    Ac      CAAC                % G,SAAc    Ac    7 Ae,oBc    Bc      AG,S                  AAe,                  xB;A                  BAAk                zK AAU,fCc    bCc      ;AAA                 AAAA@Ac    <Ac      A,oB                  6CAA                  AAG,                  KAAr                  A,6B                C AC,O2Cc    .Cc      ,WAA                  AAK,                Q ;AAADc    
Dc      ,uBA                  AAA,                 sE;AAc    Ac    Y} C,UAqFc    mFc    3 SAASGc    Gc    K A;AAAc    zCc      6BAD                  AA,+                  ,0BA                ; AAS,Bc    Bc    g ,UAAVEc    REc      E;AA                  AAAA                  AAU;                pu ,4BAEc    Ec    ! AAhBAc    ~Ac      ,mCA                  ;AAA                  A;AA                  AAA,                  ;AAA                5 AAAApBc    lBc    M BA;ACc    Cc    F ;AAAGc    Gc     BACA@c    @c      b;AA                 CACZd@c    `@c    A ,SAACc    Cc      ,IAC                  Ac,G                  AAA,                  G,QA                Cw AHxF!Ac    Ec      ,2BA                Q AAW,Dc    Dc     ,6IA8Ac    4Ac    / ;AAA<Bc    8Bc      BAC3                  AC,O                \ /J;ADc    Dc      BAAu                u] AAW,Ac    Dc      ,0IA                  ;AAA                 BAR7!Ac    Ac    ie A,yBEc    	Ec    + AtCKBc    Bc     ;AAAFc    Fc    E A;AABCc    >Cc    X ACH,~Bc    |Dc    0  ;AAAAFc    >Fc    } AAA;yFc    uFc      ;AAA                  A;AA                  BAAw                e AAoBEc    Ec      AAQ,                M AC3DCc    Cc    ( iBAAAc    Ac      ,WAA                & ,UACAc    Ac    7 1C,aBc    Bc    m uEAC}Ec    yEc      ACb;                ( ,0CABc    Bc      ;AAA                  CvE,                6 b;AA~Bc    zBc      CACX                w AR;AEc    Ec      BAAe                  ,WAA                +  C;AAHAc    DAc    u AAA;Ec    Ec    !( ,oBABc    Bc    u ,mCAEc    Ec      AAA,                  ,gBA                  mBAA                  AA,q                v ,eAA3Dc    JGc      AqB,                M iBADCc    Cc    U AA,m:Dc    6Dc      ,OAA                5" AAC,Ac    Ac    0& ;AAAAc    Ac    ;  AAS;<Bc    }Fc    ), IAAK%Bc    !Bc    M qB,KCc    Cc    u BADlEc    Ec      A,mB                  AAA;                  ,UAE                 6 ACX;Bc    Bc    !6 R;AABc    Bc    8 AAe;Bc    Bc    O AAAACc    Cc    $6 A;AABc    Bc    g BAACfEc    bEc      A,mC                  AAAA                { A,YAFc    Fc    Y D5B;l@c    h@c      iBAE                W AE,WhDc    dDc      ,YAA                  AA;A                g ;AAAmEc    iEc    q AA;AEc    Ec      AAAA                .8 A;AABc    Bc     BAACFc    Fc      ;AAA                  C,SA                  AAAA                q X;AAEc    Ec      AA;A                  AAA;                  AAAA                I, ,SAA-Bc    )Bc    e A,cAEc    Ec    { AA;AFc    Fc    { AAA;BCc    Fc      aAZF                  ,eAa                  AA;A                  ;AAA                  CA;A                e AhhB$Ec     Ec    5@ A,SACc    Cc      ["q"                                      ^     Dc    Dc    !P bmcuCc    Cc      b250                b& ZWFjAc    Ac    { dXNlt@c    p@c    { cmVh#Fc    Fc    e& bW90Ac    Ac    c( c2VuBc    Bc    U2 b24vCBc    ?Bc     IHsg@c    @c      ZnQs                  IFRh                  J2x1                  bXBv                 ZSB9Fc    Fc      dXRl                  dCBz                  ICAg                  bWUg                  Iixc                  bjog                  IHRv%Cc    "Cc      eSBi                 bXBs@c    @c      ZyBn                ={ cmluCc    Ec    =N ICAgCc    Cc      biAg                ?N bHVlCc    Cc      ZS01                  ICB7+Cc    (Cc      Q29t                 c1wi@c    @c      aW9u                  J0Vh                & b24sAc    Ac    k6 cGxlBc    Bc      YW5k                IN byBnCc    Cc      ICBp                  ZSxc                @V Zy1nBDc    >Dc    >X LWdypDc    lDc      IH0s                  ZTog                  bWVz                 cHRpFc    Fc    I IGx1RGc    NGc      biBX                5 YXRowBc    sBc    g| biBlIFc    EFc      dHMg                 ICAg@c    @c      ICAgICc    FCc      cGxl                  cGxl                  XG4g                  XCJJ                 XG4g@c    @c      IFwi                  cnJh                 aXhlFc    Fc    L\ aWZlDc    Dc      IGNv                fL aGVpCc    ~Cc      Llwi                  ZXJz                  ImJnOCc    LCc    x b3ctEc    Ec      biAg                  dGxl                  c3Rh                & c2NyAc    Ac      IHRo                  Y2Ug                  cmVj                  c2gs                Px ZXQgEc    Ec    # ICBpFc    Fc    H\ ICAgDc    Dc      bC01                 NTAw@c    @c      blxu                 IE9u@c    @c      IGNv                  dElz                |L ZShmCc    Cc    Sh IFtjuEc    qEc    6| Q3Vy:Fc    6Fc      U3Rh                L IG5hCc    Cc    	 aWdh>Gc    :Gc     ZmZl@c    @c      IGNv                  b2Nh                { bSgnFc    Fc      bmcn                 c1NlGc    Gc      IFNt                Jv dCB0Ec    Ec    \ c3RcDc    Dc      bWVy                  KSA9                 ZSksHAc    Fc    |X cmV0xDc    tDc    8 VGltBc    Bc      ICAg                  biAg                P c2UgCc    Cc    Qx bG9jEc    Ec    K ZW0oVCc    RCc    F aW5nFc    Fc      ICBz                 O1xuICc    Fc      IG5l                _V e1xuJDc    FDc      U3RlPAc    LAc    2 aCAtJBc    FBc      dEN1                  PT4g                  IH0g                @ YW5k Cc    Bc      IH1c                  dCBw                  IHtc                  dFN0                  ICBz                  cmV2                  biAg                  aWYg                L biBuCc    Cc    C IFN0Fc    Fc      Y3Vy                b XG5cEc    Dc      ICA8                  Plxu                  c05h                \ dC0wDc    Dc      dGVt                  eS1j                  YWNr                6 dXItAc    Bc    \ PG1vDc    Dc      ICAg                M cGFjFc    Fc      MC45                  ICAg                  IG9w                  OiAx                C ICAgFGc    BGc    Z aXR5Dc    Dc      NSwg                  ICAg                  Zy13                  YXRl                  bCB3                  MHB4                # ZW4gAc    Ac     dGl2Fc    Fc      biAg                  IFxu                  bGlj                | XG4gQFc    MFc     c05h&Gc    "Gc      b3At                  Z3Jh                  dC1n                | dmVyYFc    UFc    \ ei0xDc    Dc      ICAg                0  IDxYYDc    VDc      NSBo                  ICAg                L ICAgCc    Cc    \& IDxkAc    Ac      cC04                  LTEw                + ICA8U@c    Q@c    X IG1vDc    Dc    L ICAgCc    Cc      b24u                  ICAg                  U3Rl                  ICAg                  YWNp                  XG4g                  YW5p                o OiAx.Gc    *Gc     ICAg|@c    x@c    Z eyBvDc    Dc    J5 MjAgQBc    MBc      ICAg                  IGR1                | biAgaFc    ]Fc    X bGFzhDc    Dc      ZXgt                  clwi                w ID5cEc    Ec      ICA8                /! YHctWAc    SAc      LWZ1                
; ZW50Bc    Bc    8 YWRv)Ac    %Ac      LWNl                  bnRl                /% LTYgAc    Ac    e cnNg$Ec    'Ec    Z ICAgDc    Dc      bGFz                '- MTBc5Bc    1Bc      ICAg                  ICAg                  ICAg                  bGFz                = IGZvBc    Bc    9% eHQtAc    Ac    z! ZXh0oAc    kAc      ICAg                  cHNb                C! dGxl_Ac    [Ac      ICAg                $7 ICAgBc    Bc     YW1lGc    
Gc      LWdy                  dC1n                "; LXJlBc    Bc      cHhd                  ICAg                  cmVu                  aW9u                 ICAgxDc    Fc      ICAg                  Plxu                b bmlt~Bc    Ec      ICAg                 ICAg@c    @c    Z ICAgDc    Dc    { XCJw*Fc    &Fc      ICAg                { c3NO2Fc    .Fc    S aWZ5Dc    Dc    b Yi04@c    @c      ICAg                  IGkp                M ICAgCc    Cc     ICAgFc    Fc    v PXtpBCc    Ec      ICAg                  YGgt                  dHJh                  YXRp                  Y3Vy                  IGJn                  OmJn                  LTIg                m azpi1Ac    -Ac    G7 XG4gBc    Bc     g Lz5c/Ec    +Ec    "Q KSl9Dc    Dc    k! L2RpgAc    cAc    N5 IFxuYBc    UBc      diBj                Ò IGZsFc    Fc    ʒ XG4gFc    Fc      aXYg                  eCBn@c    @c      ICAg                r U3RlYDc    Ec      ICAg                r# dHRvAc    Ac      ICAg                  cHJl                  ICAg                  TmFt                \5 IHJv`Bc    \Bc      b2xk                 cms6@c    @c    g eHQt6Ec    2Ec      ZXh0                  OmJn                  aG92                  IHRy                y OnNjEc    Ec    w IlxuEc    Ec    | ICAgiFc    eFc    g ICAg>Ec    :Ec    h5 ICAghBc    dBc    QE dHRv:Cc    6Cc      ICAg                  ICAg                  ICAg                 bkNs]@c    Y@c      biAg                ]A IGNsCc    Cc      WzJd                &g bCBmFEc    BEc    ?W RDQ3RDc    NDc     c2hh@c    @c      bHVl                  YWRv                 b3Zl@c    @c    d YW5zFc    Fc      YWxl                ! ICAgvAc    rAc      biAg                 IHtjAc    @c    ! c3RlPAc    zAc    MU IFwi%Dc    !Dc      IFwi                  ICAg                  Plxu                  L2Rp                  ICAg                8g c3RlNEc    JEc      JiAo                  ICAg                  ICAg                  Y2s9                  ICAg                YU Y2xh,Dc    (Dc    ؚ ZXh06Gc    2Gc      bGQg                g b3Zl^Ec    ZEc    iM IGRhCc    Cc      cmF5                 LWNv@c    @c      ICAg                ' ICAgAc    Ac    Pa dXRvDc    Dc    cU ICAg3Dc    /Dc      ICAg                  ICAg                  XG4g                  XG4g                 LmRp@c    @c      Plxu                yK ZXNl^Cc    ZCc    ' Il0sAc    Ac     w Rlk7Ec    Ec    7       ؁    0     ؁    0    Yb  (  QyxTQUFTLGFBQWEsTUFBTSxPQUFPLFFBQVEsUUFBUSxTQUFTO0FBQzVELFNBQVMsbUJBQW1CO0FBRTVCLE1BQU0sUUFBUTtBQUFBLEVBQ1o7QUFBQSxJQUNFLE9BQU87QUFBQSxJQUNQLGFBQWE7QUFBQSxJQUNiLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxFQUNUO0FBQUEsRUFDQTtBQUFBLElBQ0UsT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBO0FBQUEsSUFDRSxPQUFPO0FBQUEsSUFDUCxhQUFhO0FBQUEsSUFDYixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0E7QUFBQSxJQUNFLE9BQU87QUFBQSxJQUNQLGFBQWE7QUFBQSxJQUNiLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxFQUNUO0FBQUEsRUFDQTtBQUFBLElBQ0UsT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLEVBQ1Q7QUFDRjtBQUVPLGdCQUFTLGFBQWE7QUFDM0IsUUFBTSxDQUFDLFFBQVEsU0FBUyxJQUFJLFNBQVMsS0FBSztBQUMxQyxRQUFNLENBQUMsYUFBYSxjQUFjLElBQUksU0FBUyxDQUFDO0FBQ2hELFFBQU0sV0FBVyxZQUFZO0FBRTdCLFlBQVUsTUFBTTtBQUNkLFVBQU0sVUFBVSxhQUFhLFFBQVEsbUJBQW1CO0FBQ3hELFFBQUksQ0FBQyxTQUFTO0FBRVosWUFBTSxRQUFRLFdBQVcsTUFBTSxVQUFVLElBQUksR0FBRyxJQUFJO0FBQ3BELGFBQU8sTUFBTSxhQUFhLEtBQUs7QUFBQSxJQUNqQztBQUFBLEVBQ0YsR0FBRyxDQUFDLENBQUM7QUFFTCxRQUFNLGNBQWMsTUFBTTtBQUN4QixpQkFBYSxRQUFRLHFCQUFxQixNQUFNO0FBQ2hELGNBQVUsS0FBSztBQUFBLEVBQ2pCO0FBRUEsUUFBTSxXQUFXLE1BQU07QUFDckIsUUFBSSxjQUFjLE1BQU0sU0FBUyxHQUFHO0FBQ2xDLHFCQUFlLFVBQVEsT0FBTyxDQUFDO0FBQUEsSUFDakMsT0FBTztBQUNMLGtCQUFZO0FBQUEsSUFDZDtBQUFBLEVBQ0Y7QUFFQSxRQUFNLFdBQVcsTUFBTTtBQUNyQixRQUFJLGNBQWMsR0FBRztBQUNuQixxQkFBZSxVQUFRLE9BQU8sQ0FBQztBQUFBLElBQ2pDO0FBQUEsRUFDRjtBQUVBLE1BQUksQ0FBQyxPQUFRLFFBQU87QUFFcEIsUUFBTSxXQUFXLE1BQU0sV0FBVyxFQUFFO0FBRXBDLFNBQ0UsdUJBQUMsbUJBQ0MsaUNBQUMsU0FBSSxXQUFVLDJGQUNiO0FBQUEsSUFBQyxPQUFPO0FBQUEsSUFBUDtBQUFBLE1BQ0MsU0FBUyxFQUFFLFNBQVMsR0FBRyxPQUFPLE1BQU0sR0FBRyxHQUFHO0FBQUEsTUFDMUMsU0FBUyxFQUFFLFNBQVMsR0FBRyxPQUFPLEdBQUcsR0FBRyxFQUFFO0FBQUEsTUFDdEMsTUFBTSxFQUFFLFNBQVMsR0FBRyxPQUFPLE1BQU0sR0FBRyxHQUFHO0FBQUEsTUFDdkMsV0FBVTtBQUFBLE1BRVY7QUFBQTtBQUFBLFVBQUM7QUFBQTtBQUFBLFlBQ0MsU0FBUztBQUFBLFlBQ1QsV0FBVTtBQUFBLFlBRVYsaUNBQUMsS0FBRSxXQUFVLGFBQWI7QUFBQTtBQUFBO0FBQUE7QUFBQSxtQkFBdUI7QUFBQTtBQUFBLFVBSnpCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQUtBO0FBQUEsUUFFQSx1QkFBQyxTQUFJLFdBQVUseUJBQ2IsaUNBQUMsbUJBQWdCLE1BQUssUUFDcEI7QUFBQSxVQUFDLE9BQU87QUFBQSxVQUFQO0FBQUEsWUFFQyxTQUFTLEVBQUUsU0FBUyxHQUFHLEdBQUcsR0FBRztBQUFBLFlBQzdCLFNBQVMsRUFBRSxTQUFTLEdBQUcsR0FBRyxFQUFFO0FBQUEsWUFDNUIsTUFBTSxFQUFFLFNBQVMsR0FBRyxHQUFHLElBQUk7QUFBQSxZQUMzQixZQUFZLEVBQUUsVUFBVSxJQUFJO0FBQUEsWUFDNUIsV0FBVTtBQUFBLFlBRVY7QUFBQSxxQ0FBQyxTQUFJLFdBQVcsMEJBQTBCLE1BQU0sV0FBVyxFQUFFLEtBQUssaUZBQ2hFLGlDQUFDLFlBQVMsV0FBVSxlQUFwQjtBQUFBO0FBQUE7QUFBQTtBQUFBLHFCQUFnQyxLQURsQztBQUFBO0FBQUE7QUFBQTtBQUFBLHFCQUVBO0FBQUEsY0FFQSx1QkFBQyxRQUFHLFdBQVUsd0RBQ1gsZ0JBQU0sV0FBVyxFQUFFLFNBRHRCO0FBQUE7QUFBQTtBQUFBO0FBQUEscUJBRUE7QUFBQSxjQUNBLHVCQUFDLE9BQUUsV0FBVSx5RUFDVixnQkFBTSxXQUFXLEVBQUUsZUFEdEI7QUFBQTtBQUFBO0FBQUE7QUFBQSxxQkFFQTtBQUFBO0FBQUE7QUFBQSxVQWhCSztBQUFBLFVBRFA7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQWtCQSxLQW5CRjtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBb0JBLEtBckJGO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFzQkE7QUFBQSxRQUVBLHVCQUFDLFNBQUksV0FBVSxhQUNiO0FBQUEsaUNBQUMsU0FBSSxXQUFVLGtDQUNaLGdCQUFNLElBQUksQ0FBQyxHQUFHLE1BQ2I7QUFBQSxZQUFDO0FBQUE7QUFBQSxjQUVDLFdBQVcsZ0RBQWdELE1BQU0sY0FBYyxzQ0FBc0MsbUNBQW1DO0FBQUE7QUFBQSxZQURuSjtBQUFBLFlBRFA7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQUdBLENBQ0QsS0FOSDtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQU9BO0FBQUEsVUFFQSx1QkFBQyxTQUFJLFdBQVUsdUJBQ2I7QUFBQSxtQ0FBQyxTQUFJLFdBQVUsY0FDWjtBQUFBLDRCQUFjLEtBQ2I7QUFBQSxnQkFBQztBQUFBO0FBQUEsa0JBQ0MsU0FBUztBQUFBLGtCQUNULFdBQVU7QUFBQSxrQkFDWDtBQUFBO0FBQUEsZ0JBSEQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGNBS0E7QUFBQSxjQUVGO0FBQUEsZ0JBQUM7QUFBQTtBQUFBLGtCQUNDLFNBQVM7QUFBQSxrQkFDVCxXQUFVO0FBQUEsa0JBRVQsMEJBQWdCLE1BQU0sU0FBUyxJQUFJLGdCQUFnQjtBQUFBO0FBQUEsZ0JBSnREO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxjQUtBO0FBQUEsaUJBZEY7QUFBQTtBQUFBO0FBQUE7QUFBQSxtQkFlQTtBQUFBLFlBQ0MsY0FBYyxNQUFNLFNBQVMsS0FDNUI7QUFBQSxjQUFDO0FBQUE7QUFBQSxnQkFDQyxTQUFTO0FBQUEsZ0JBQ1QsV0FBVTtBQUFBLGdCQUNYO0FBQUE7QUFBQSxjQUhEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQUtBO0FBQUEsZUF2Qko7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkF5QkE7QUFBQSxh&      ܅    -o                  ![p	  0   QTtBy[p	  0   O0FB[p	  0   QUFB\p	  0   QTtBq\p	  0   QUFB\p	  0   QTNF!]p	  0   QUE7i]p	  0   LFNB]p	  0   O0FB^p	  0   QUFBQ^p	  0   RUE7^p	  0   YW1l^p	  0       A_p	  0   o  _p	  0       _p	  0   / jsI`p	  0       `p	  0      {`p	  0    hreQap	  0   nloaap	  0       ap	  0   : "dIbp	  0       bp	  0   ame:bp	  0   overAcp	  0    texcp	  0   x-6 cp	  0   ed-2Adp	  0   k updp	  0   kingdp	  0   -xs 9ep	  0   enteep	  0   nterep	  0   w-lg1fp	  0   w-xlfp	  0   all fp	  0   -95 9gp	  0       gp	  0   ren:gp	  0       9hp	  0   _ */hp	  0   loadhp	  0   e: "Aip	  0   voidip	  0   
   ip	  0    filQjp	  0   /appjp	  0   s/Adkp	  0       Ykp	  0   neNukp	  0       lp	  0   coluQlp	  0   
   lp	  0   , thlp	  0       Qmp	  0   d Bump	  0       mp	  0       Inp	  0     vonp	  0       np	  0       Aop	  0     fiop	  0   p/apop	  0   es/AIpp	  0       pp	  0   umbepp	  0       Iqp	  0   umbeqp	  0       qp	  0    thiQrp	  0       rp	  0   0, trp	  0      fQsp	  0   pp/asp	  0   ges/sp	  0       Qtp	  0   er: tp	  0     coup	  0   11
 Yup	  0   ),
 up	  0   URE_	vp	  0   "divavp	  0   me: vp	  0   cent	  8   etweA  8   ildry  8   RE__  8   h3",  8   : "f!  8   rk:tY  8   perc  8   -tig  8    chi  8   ncia9  8   }, vq  8   , {
  8   Name  8   et/s  8   in.tQ  8    lin  8   6,
   8   nNum  8     },1  8   id 0i  8         8    "/a  8   c/pa  8   x",
I  8   Numb  8         8   er:   8   this)  8   @__Pa  8   DEV(  8   ssNa  8   id-c	  8   , chA  8       y  8   __ *  8   v",   8    "bg!  8   -br Y  8   -50   8   ark:  8   -900  8   teal9  8   rounq  8   er b  8   d-10  8   r-em  8   ", cQ  8   @__P  8   DEV(  8   ssNa  8   ex-c1  8   hildi  8         8   _ */  8   n",   8    "teI  8   old   8   -600  8   mera  8   case)  8   desta  8    "To  8    Dep  8   id 0	  8       A  8   ame:y  8   t/sr  8   n.ts  8       !  8   1302Y  8     co  8   17
   8   this  8    /* 9  8    jsxq  8   { cl  8   xt-3  8   k te  8    darQ  8   ", c  8         8   ,
    8   ymen1  8   lteri  8   pe =      &&   0    "ap1  8   uce(i  8   => a  0   curr  8   ), 0	  8   ringA  0    ] }q  8   ue,   8     fi  0   p/ap  8   es/AI  8         0   umbe  8         8   umbe!   0       Q   8          8   RE__   0   span   8   me: )!  8    fona!  0   slat!  8   ase"!  8   [
  "  0   ymen1"  8   lteri"  8   pe ="  0    && "  8    "ap	#  8   gth,A#  0    " Tq#  8   
   #  8   void#  0       $  8   NameI$  8   et/s$  0   in.t$  8       $  8    130!%  0      cQ%  8    17
%  8    thi%  0    }, %  8   , {
)&  8   leNaa&  0   plet&  8   dmin&  8       '  0    1301'  8    coli'  8   5
  '  0   s) }'  8   lse,	(  8    filA(  0   /appq(  8   s/Ad(  8       (  0   er: )  8       I)  8   : 13)  0   this)  8   * @_)  8   sxDE!*  0   lassQ*  8   adie*  8   m-ro*  0   k-50*  8   ose-)+  8   to-pa+  0   -5 r+  8   orde+  8   e-10,  0   r-ro1,  8   chili,  8   PURE,  0   ("di,  8   ame:	-  8   col A-  0   drenq-  8     /*-  8   / js-  0    { c.  8   ext-I.  8    tex.  0   ark:                 o  F    vp	          	wp	      ppro)wp	      als"Iwp	      falsiwp	          wp	      /appwp	      pagewp	      ,
  wp	      neNu	xp	          )xp	      mnNuixp	          xp	      
   xp	      _PURxp	      V("sxp	      sNam	yp	       fon)yp	      -slaIyp	      textiyp	      ldreyp	          yp	          yp	      equeyp	      r) =)zp	       "wiIzp	      .staizp	      rovezp	      acc,zp	      c + zp	      amouzp	      .toL	{p	      )
  ){p	       voiI{p	      
   i{p	      eNam{p	      let/{p	      min.{p	          {p	      : 13	|p	          )|p	      : 17I|p	      , thi|p	         /|p	      */ j|p	      , { |p	      text|p	      -bol	}p	      -500)}p	       chiI}p	          i}p	      Requ}p	      (r) }p	      = "w}p	      r.st}p	      prov	~p	      
   )~p	      ransi~p	          ~p	       0, ~p	          ~p	      : "/	p	      rc/p)p	      sx",Ip	       linip	      8,
 p	      olump	          p	      s)
 p	      void	p	          yp	      me: p	      /srcp	      .tsxp	       linp	      3,
 QVp	  p   umnNVp	  p       1Wp	  p   , voWp	  p    {
 Xp	  p   eNamXp	  p   let/Xp	  p   min.aYp	  p       Yp	  p   1312AZp	  p   colu	]  8   
   A]      ),
 a]  8   _PUR]      V("d]  8   Name]      nt-t^  8   ber-I^      -50 i^  8   ber-^      to-o^  8    p-5^       bor_  8   mberQ_      rderq_  8   0", _       @___  8   xDEV`      assN!`  8   lex-Y`      chily`  8       `      __ *`  8   an",	a      : "t)a  8   boldaa      600 a  8   ber-a      e tra  8   t", b      endi1b  8    }, ib      e, {b  8    filb      /appb  8   s/Adc          9c  8   mberqc          c  8   mberc         }c  8       !d      E__ Ad  8   pan"yd      e: "d  8   t-bld      te-9d  8   -whi)e      n: [Ie  8    "ুe          e  8   sts.e      > r.e  8   posi1f      us =Qf  8   ).ref      urr)f  8   mberf       || g  8   aleS9g          Yg  8   0, tg          g  8    "/ag      c/pa	h  8   x",
Ah      lineah  8   ,
  h      lumnh  8       h      ),
 i  8   @__PIi      DEV(ii  8   assNi      10pxi  8   texti      pperj  8   ren:Qj         pqj  8   ts.fj       r.tj  8   ositk      s ==!k  8   .lenYk          yk  8   quirk        ] QR  8   rue,R  8      fR  0   pp/aR  8   ges/)S  8       aS  0   NumbS  8       S  8   NumbT  0       1T  8       iT  8   0, tT  0       T  8   /app	U  8   pageAU  0   ,
  qU  8   NumbU  8       U  0   mberV  8    }, IV  8   d 0,V  0       V  8   : "/V  8   rc/p!W  0   sx",QW  8   ineNW  8   
   W  0   nNumW  8       )X  8       aX  0   __ *X  8   v", X  8    "bgY  0   -br 1Y  8    to-iY  8   fromY  0    darY  8   /20 	Z  8   3xl AZ  0   r-blqZ  8   bordZ  8   30",Z  0   * @_[  8   sxDEI[  8   lass[  0   flex[  8    chi[  8       !\  0   E__ Q\  8   pan"\  8   e: "\  0   -bol\  8   600 )]  8   ue-4a]  0    tra]  8   ", c]  8       ^  0      1^  8   pathi^  8   plet^  0   s/mo^  8   t/es	_  8       A_  0       q_  8       _  8       _  0       `  8       I`  8       `  0       `  8       `  8       !a  0       Qa  8       a  8       a  0       a  8       )b  8       ab  0       b  8       b  8       c  0       1c  8       ic  8       c  0       c  8                     P!-o  P!-o  f    f                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    @     P       F                           ,WAA    AAAA,2BA B,SAAI,WAAU,8JA1          -o                       i    Pi    Pj    P       @       x      let/node_modules/motion-dom/dist/es/inde       P           5       5       5         AAoD    AAsB,KAA F;AAAA;AAAA;AAAQ          -o          0       v    i    0j    j    P       P                                  A,iB    A,UAC3B, @AE,SAAS;AAAA;A          -o          0       V    j    j    k           !            j    p       P       f                           WAAW    
  "name ": ["us?                -o          0           @k    k    pl           !           k    p       P       &                                   x       dt/node_modules1          -o          0            l    Pl    m    P       P           N       N       N                                 m           υ    @i            0       v    l    l    @m    P       @           а          k                   7      @              }    `}    0?    'o  $              ^      Em    #-o  Em    X    yHistory.tsx"],"sourcesContent":["importA^      yb    -o                  import { collection, query, orderBy, lim]      yb    -o                  store';\nimport { db, auth } from '../li]      yb    -o                  from '../lib/cache';\nimport { Activity,Q]      yb    -o                  ircle, ArrowUpCircle } from 'lucide-reac]      yb    -o                  ponents/LanguageProvider';\nimport { mot\      yb    -o                  ction ActivityHistory() {\n  const [actia\      yb    -o                  ([]);\n  const [loading, setLoading] = u\      yb    -o                  = useLanguage();\n\n  const getRefBonus [      yb    -o                  usEarned !== undefined ? Number(ref.bonuq[      yb    -o                    return raw;\n    }\n    if (ref.level ![      yb    -o                  2) return 3;\n    return 5;\n  };\n\n  uZ      yb    -o                  ser) return;\n    \n    import('firebaseZ      yb    -o                  n      let txList: any[] = [];\n      le1Z      yb    -o                  t: any[] = [];\n\n      const updateCombY      yb    -o                   [\n          ...txList.map((t) => {\n  Y      yb    -o                  ? t.createdAt.toDate() : t.createdAt ? nAY      yb    -o                           return { ...t, date: d, _originX      yb    -o                        }),\n          ...subList.map((t) X      yb    -o                  bmittedAt || t.completedAt;\n           QX      yb    -o                  .toDate() : timeField ? new Date(timeFieX      yb    -o                   ...t, date: d, _originalType: t.type ||W      yb    -o                  refList.map((t) => {\n            const aW      yb    -o                  Date() : t.createdAt ? new Date(t.createW      yb    -o                  { ...t, date: d, _originalType: 'referraV      yb    -o                      combined.sort((a, b) => b.date.getTiqV      yb    -o                  tivities(combined.slice(0, 100));\n     !V      yb    -o                   const unsubTx = onSnapshot(query(collecU      yb    -o                  d, \"transactions\"), orderBy(\"createdAU      yb    -o                  \n        txList = snap.docs.map(d => ({1U      yb    -o                  ata() }));\n        updateCombined();\n T      yb    -o                  pshot(query(collection(db, \"submissionsT      yb    -o                  entUser!.uid), limit(100)), (snap) => {\AT      yb    -o                   id: d.id, type: \"task\", ...d.data() }S      yb    -o                  ;\n\n      const unsubRef = onSnapshot(qS      yb    -o                  entUser!.uid, \"referrals\"), orderBy(\"QS      yb    -o                  ap) => {\n        refList = snap.docs.maS      yb    -o                  ...d.data() }));\n        updateCombinedR      yb    -o                          unsubTx();\n        unsubSub();\aR      yb    -o                  n  }, [auth.currentUser?.uid]);\n\n  retR      yb    -o                  -24 max-w-lg mx-auto\">\n      <div clasQ      yb    -o                  n        <div className=\"w-10 h-10 bg-iqQ      yb    -o                  igo-600 flex items-center justify-center!Q      yb    -o                  ssName=\"w-5 h-5\" />\n        </div>\n P      yb    -o                  text-xl font-display font-black text-slaP      yb    -o                  \n            Activity History\n        1P      yb    -o                  s text-slate-500 dark:text-slate-400 fonO      yb    -o                  ent tasks and transactions\n          </O      yb    -o                    <div className=\"space-y-3\">\n       AO      yb    -o                  \"text-center py-8\">\n            <div N      yb    -o                  go-200 border-t-indigo-600 rounded-full N      yb    -o                          <p className=\"text-sm text-slatQN      yb    -o                    </div>\n        ) : activities.length N      yb    -o                  xt-center py-12 bg-white dark:bg-slate-8M      yb    -o                  0 dark:border-slate-700/50 shadow-sm\">\aM      yb    -o                  h-12 mx-auto mb-3 opacity-20 text-slate-M      yb    -o                    <p className=\"text-sm font-medium texL      yb    -o                  ivity found.</p>\n          </div>\n    qL      yb    -o                  ivity, index) => {\n            const is!L      yb    -o                          const isReferral = activity.typeK      yb    -o                  Withdraw = !isTask && !isReferral && actK      yb    -o                             const isDeposit = !isTask && 1K      yb    -o                  = \"deposit\";\n\n            let title J      yb    -o                  ";\n            let badgeColor = \"\";\nJ      yb    -o                  cle;\n            let statusLabel = \"\"AJ      yb    -o                  \n            let displayAmount = parseFI      yb    -o                  || activity.bonusEarned || 0).toFixed(2)I      yb    -o                            displayAmount = getRefBonus(acQI      yb    -o                            if (isReferral) {\n           I      yb    -o                   \"রেফারেল: \" : \"ReferraH      yb    -o                  ity.referredEmail?.split(\"@\")[0] || \"aH      yb    -o                  ৳${displayAmount}`;\n                bH      yb    -o                  -600 dark:bg-emerald-950/20 dark:text-emG      yb    -o                  ent = CheckCircle;\n                statqG      yb    -o                  ম্পন্ন\" : \"Completed\";\!G      yb    -o                  erald-600 dark:text-emerald-400 bg-emeraF      yb    -o                       } else if (isTask) {\n             F      yb    -o                  _task_activity\") || \"Completed Task\";1F      yb    -o                  ayAmount}`;\n              \n           E      yb    -o                   'pending';\n              if (taskStatuE      yb    -o                  geColor = \"bg-emerald-50 text-emerald-6AE      yb    -o                  ald-400\";\n                IconComponenD      yb    -o                  Label = language === \"Bengali\" ? \"অD      yb    -o                  n                statusColor = \"text-emQD      yb    -o                  ld-50 dark:bg-emerald-950/30\";\n       D      yb    -o                  ed') {\n                badgeColor = \"bC      yb    -o                   dark:text-red-400\";\n                IaC      yb    -o                   statusLabel = language === \"Bengali\" C      yb    -o                                 statusColor = \"text-red-B      yb    -o                  red-950/30\";\n                rewardStrqB      yb    -o                               badgeColor = \"bg-amber-50 !B      yb    -o                  :text-amber-400\";\n                IconA      yb    -o                  usLabel = language === \"Bengali\" ? \"A      yb    -o                  \";\n                statusColor = \"tex1A      yb    -o                  -50 dark:bg-amber-950/30\";\n           @      yb    -o                    if (activity._originalType === 'partne@      yb    -o                  guage === \"Bengali\" ? \"পার্A@      yb    -o                   Bonus\";\n                rewardStr = `?      yb    -o                  badgeColor = \"bg-indigo-50 text-indigo-?      yb    -o                  go-400\";\n                IconComponentQ?      yb    -o                  abel = language === \"Bengali\" ? \"স?      yb    -o                                statusColor = \"text-indig>      yb    -o                  dark:bg-indigo-900/30\";\n              a>      yb    -o                  ctivation') {\n                title = l>      yb    -o                  কাউন্ট অ্যাক্ট=      yb    -o                  \";\n                rewardStr = `-৳${q=      yb    -o                  olor = \"bg-rose-50 text-rose-600 dark:b!=      yb    -o                               IconComponent = CheckCircle<      yb    -o                  ity.status || 'completed';\n            <      yb    -o                              statusLabel = language === \1<      yb    -o                  \" : \"Pending\";\n                  s;      yb    -o                  amber-400 bg-amber-50 dark:bg-amber-900/;      yb    -o                  s === 'rejected') {\n                  sA;      yb    -o                  \"বাতিল\" : \"Rejected\";\n   :      yb    -o                  -600 dark:text-rose-400 bg-rose-50 dark::      yb    -o                  e {\n                  statusLabel = lanQ:      yb    -o                  ্ন\" : \"Completed\";\n            :      yb    -o                  :text-rose-400 bg-rose-50 dark:bg-rose-99      yb    -o                     } else if (activity._originalType ===a9      yb    -o                  = language === \"Bengali\" ? \"গিফ9      yb    -o                  ift Code Claim\";\n                rewar8      yb    -o                          badgeColor = \"bg-purple-50 textq8      yb    -o                  ext-purple-400\";\n                IconC!8      yb    -o                   statusLabel = language === \"Bengali\" 7      yb    -o                  d\";\n                statusColor = \"te7      yb    -o                  rple-50 dark:bg-purple-900/30\";\n      17      yb    -o                            title = language === \"Bengali6      yb    -o                  \" : \"Withdrawal\";\n                r6      yb    -o                              \n                const wStaA6      yb    -o                               if (wStatus === 'approved')5      yb    -o                  emerald-50 text-emerald-600 dark:bg-emer5      yb    -o                                 IconComponent = ArrowUpCiQ5      yb    -o                  anguage === \"Bengali\" ? \"সম্প5      yb    -o                          statusColor = \"text-emerald-6004      yb    -o                  k:bg-emerald-950/30\";\n                a4      yb    -o                                  badgeColor = \"bg-red-504      yb    -o                  xt-red-400\";\n                  IconCom3      yb    -o                  tusLabel = language === \"Bengali\" ? \"q3      yb    -o                               statusColor = \"text-red-60!3      yb    -o                  d-950/30\";\n                } else {\n 2      yb    -o                  -50 text-amber-600 dark:bg-amber-950/20 2      yb    -o                    IconComponent = Clock;\n              12      yb    -o                  \" ? \"অপেক্ষমান\" : \1      yb    -o                  or = \"text-amber-600 dark:text-amber-401      yb    -o                                 }\n              } else iA1      yb    -o                   language === \"Bengali\" ? \"টাক0      yb    -o                         rewardStr = `+৳${displayAmount}0      yb    -o                  nst dStatus = activity.status || 'approvQ0      yb    -o                  pproved') {\n                  badgeColo0      yb    -o                  lue-950/20 dark:text-blue-400\";\n      /      yb    -o                  cle;\n                  statusLabel = laa/      yb    -o                  ্ন\" : \"Completed\";\n           /      yb    -o                  k:text-blue-400 bg-blue-50 dark:bg-blue-.      yb    -o                  tatus === 'rejected') {\n               q.      yb    -o                   dark:bg-red-950/20 dark:text-red-400\";!.      yb    -o                  cle;\n                  statusLabel = la-      yb    -o                  \" : \"Rejected\";\n                  -      yb    -o                  ed-400 bg-red-50 dark:bg-red-950/30\";\n1-      yb    -o                      badgeColor = \"bg-amber-50 text-ambe,      yb    -o                  er-400\";\n                  IconCompone,      yb    -o                  el = language === \"Bengali\" ? \"অপA,      yb    -o                                    statusColor = \"text-a+      yb    -o                   dark:bg-amber-950/30\";\n              +      yb    -o                       title = activity.description || \"TQ+      yb    -o                   = `৳${displayAmount}`;\n             +      yb    -o                  -600 dark:bg-slate-800 dark:text-slate-4*      yb    -o                  heckCircle;\n                statusLabela*      yb    -o                  পন্ন\" : \"Completed\";\n      *      yb    -o                   dark:text-slate-400 bg-slate-50 dark:bg)      yb    -o                      }\n\n            return (\n         q)      yb    -o                  l={{ opacity: 0, y: 10 }}\n             !)      yb    -o                             transition={{ duration: 0.2, (      yb    -o                  key={`${activity.id}-${index}`}\n       (      yb    -o                  ate-800 rounded-2xl shadow-sm border bor1(      yb    -o                  -4 flex items-center justify-between gap'      yb    -o                  ver:border-indigo-500/30 transition-colo'      yb    -o                  div className=\"flex items-center gap-3 A'      yb    -o                  Name={`w-10 h-10 rounded-[14px] flex ite&      yb    -o                  eColor}`}>\n                    <IconCom&      yb    -o                             </div>\n                  <diQ&      yb    -o                        <h4 className=\"text-[14px] font-b&      yb    -o                  ate\">\n                      {title}\n %      yb    -o                        <div className=\"flex items-centera%      yb    -o                  <span className=\"text-[11px] font-mediu%      yb    -o                  n                        {activity.date.$      yb    -o                                 month: \"short\",\n      q$      yb    -o                                           hour: \"numeric!$      yb    -o                  "2-digit\",\n                        })}#      yb    -o                               </div>\n                  <#      yb    -o                           <div className=\"flex flex-col 1#      yb    -o                   <span className={`text-[15px] font-blac"      yb    -o                  xt-slate-300' : 'text-emerald-600 dark:t"      yb    -o                    {rewardStr}\n                  </span>A"      yb    -o                  xt-[9px] mt-1 px-1.5 py-0.5 rounded font!      yb    -o                  sColor}`}>\n                    {statusL!      yb    -o                            </div>\n              </motionQ!      yb    -o                       )}\n      </div>\n    </div>\n  );\!      yb    -o                  ,iBAAiB;AACpC,SAAS,YAAY,OAAO,SAAS,OAAgB,       yb    -o                  U,aAAa,OAAO,SAAS,iBAAiB,qBAAqB;AACtF,SAAa       yb    -o                  AkB;AAChC,QAAM,CAAC,YAAY,aAAa,IAAI,SAAgB       yb    -o                  I,SAAS,IAAI;AAC3C,QAAM,EAAE,GAAG,SAAS,IA      yb    -o                  QAAI,MAAM,IAAI,gBAAgB,SAAY,OAAO,IAAI,WAAq      yb    -o                  AA,IACV;AACA,QAAI,IAAI,UAAU,EAAG,QAAO;AA!      yb    -o                  AAAA,EACT;AAEA,YAAU,MAAM;AACd,QAAI,CAAC,      yb    -o                  AC,EAAE,WAAW,MAAM;AACpD,UAAI,SAAgB,CAAC;      yb    -o                  AAC;AAEtB,YAAM,iBAAiB,MAAM;AAC3B,cAAM,WA1      yb    -o                  ACnB,kBAAM,IAAIA,GAAE,WAAW,SAASA,GAAE,UA      yb    -o                  SAAS,IAAI,oBAAI,KAAK,CAAC;AACvG,mBAAO,EA      yb    -o                  cAAc;AAAA,UACjE,CAAC;AAAA,UACD,GAAG,QAAQA      yb    -o                  eAAeA,GAAE;AACrC,kBAAM,IAAI,WAAW,SAAS,UA      yb    -o                  AAI,KAAK,CAAC;AAC/F,mBAAO,EAAE,GAAGA,IAA      yb    -o                  C1D,CAAC;AAAA,UACD,GAAG,QAAQ,IAAI,CAACA,Q      yb    -o                  AAE,UAAU,OAAO,IAAIA,GAAE,YAAY,IAAI,KAAKA      yb    -o                  AAO,EAAE,GAAGA,IAAG,MAAM,GAAG,eAAe,WAAW;      yb    -o                  K,CAAC,GAAG,MAAM,EAAE,KAAK,QAAQ,IAAI,EAAa      yb    -o                  AAG,GAAG,CAAC;AACpC,mBAAW,KAAK;AAAA,MACl      yb    -o                  S,KAAK,YAAa,KAAK,cAAc,GAAG,QAAQ,aAAa,MAA      yb    -o                  pJ,iBAAS,KAAK,KAAK,IAAI,QAAM,EAAE,IAAI,Eq      yb    -o                  AAE;AAC5E,uBAAe;AAAA,MACjB,CAAC;AAED,YAA!      yb    -o                  M,UAAU,MAAM,KAAK,YAAa,GAAG,GAAG,MAAM,GAA      yb    -o                  AAK,IAAI,QAAM,EAAE,IAAI,EAAE,IAAI,MAAM,Q      yb    -o                  ;AAAA,MACjB,CAAC;AAED,YAAM,WAAW,WAAW,MAA1      yb    -o                  G,QAAQ,aAAa,MAAM,GAAG,MAAM,GAAG,CAAC,GAA      yb    -o                  AAM,EAAE,IAAI,EAAE,IAAI,MAAM,YAAY,GAAG,E      yb    -o                  B,CAAC;AAED,aAAO,MAAM;AACX,gBAAQ;AACR,iBA      yb    -o                  AAAA,EACH,GAAG,CAAC,KAAK,aAAa,GAAG,CAAC;      yb    -o                  AAC,SAAI,WAAU,gCACb;AAAA,6BAAC,SAAI,WAAU      yb    -o                  AAA;AAAA,aAA8B,KADhC;AAAA;AAAA;AAAA;AAAAQ      yb    -o                  AG,WAAU,iFAAgF,gCAA9F;AAAA;AAAA;AAAA;AAA      yb    -o                  kDAA7E;AAAA;AAAA;AAAA;AAAA,eAEA;AAAA,WAN      yb    -o                  A;AAAA;AAAA;AAAA,WAYA;AAAA,IAEA,uBAAC,SAa      yb    -o                  ;AAAA,6BAAC,SAAI,WAAU,mGAAf;AAAA;AAAA;AA      yb    -o                  ,0BAAyB,kCAAtC;AAAA;AAAA;AAAA;AAAA,aAAwD      yb    -o                  E,WAAW,WAAW,IACxB,uBAAC,SAAI,WAAU,0HACb;q      yb    -o                  AA;AAAA,aAA2F;AAAA,MAC3F,uBAAC,OAAE,WAAU!      yb    -o                  ;AAAA,SAF1F;AAAA;AAAA;AAAA;AAAA,WAGA,IAE      yb    -o                  AS,SAAS,SAAS;AACjC,YAAM,aAAa,SAAS,SAAS;A      yb    -o                  kBAAkB;AACxE,YAAM,YAAY,CAAC,UAAU,CAAC,cA1      yb    -o                  ,YAAY;AAChB,UAAI,aAAa;AACjB,UAAI,gBAAgB;      yb    -o                  AI,gBAAgB,WAAW,SAAS,UAAU,SAAS,UAAU,SAAS,      yb    -o                  ;AACZ,wBAAgB,YAAY,QAAQ,EAAE,QAAQ,CAAC;AAA      yb    -o                  YAAY,cAAc,iBAAiB,SAAS,gBAAgB,SAAS,eAAe,M      yb    -o                  ,aAAa;AAC9B,qBAAa;AACb,wBAAgB;AAChB,sBAA      yb    -o                  WAAW,QAAQ;AACjB,gBAAQ,SAAS,SAAS,EAAE,yBAQ      yb    -o                  M,aAAa,SAAS,UAAU;AACtC,YAAI,eAAe,YAAY;AA      yb    -o                  AAY,aAAa;AACpD,wBAAc;AAAA,QAChB,WAAW,eAA      yb    -o                  Ac,aAAa,YAAY,UAAU;AACjD,wBAAc;AACd,sBAAYa      yb    -o                  AChB,wBAAc,aAAa,YAAY,cAAc;AACrD,wBAAc;AA      yb    -o                  BAAkB,iBAAiB;AAC9C,kBAAQ,aAAa,YAAY,mBAAm      yb    -o                  ,0BAAgB;AAChB,wBAAc,aAAa,YAAY,YAAY;AACnDq      yb    -o                  AAClD,kBAAQ,aAAa,YAAY,4BAA4B;AAC7D,sBAAY!      yb    -o                  ,gBAAM,UAAU,SAAS,UAAU;AACnC,cAAI,YAAY,WA      yb    -o                  c;AAAA,UAChB,WAAW,YAAY,YAAY;AACjC,0BAAc,      yb    -o                  AO;AACL,0BAAc,aAAa,YAAY,YAAY;AACnD,0BAAc1      yb    -o                  AAc;AAClD,kBAAQ,aAAa,YAAY,oBAAoB;AACrD,s      yb    -o                  AChB,wBAAc,aAAa,YAAY,YAAY;AACnD,wBAAc;AA      yb    -o                  ,iBAAiB;AAClD,sBAAY,KAAK,aAAa;AAE9B,gBAAA      yb    -o                  C1B,yBAAa;AACb,4BAAgB;AAChB,0BAAc,aAAa,Y      yb    -o                  Y,YAAY;AACjC,yBAAa;AACb,4BAAgB;AAChB,0BA      yb    -o                  ,OAAO;AACL,yBAAa;AACb,4BAAgB;AAChB,0BAAcQ      yb    -o                  AAA,QACF,WAAW,WAAW;AACpB,kBAAQ,aAAa,YAAY      yb    -o                  UAAU,SAAS,UAAU;AACnC,cAAI,YAAY,YAAY;AAC1      yb    -o                  Y,YAAY;AACnD,0BAAc;AAAA,UAChB,WAAW,YAAY,a      yb    -o                  ,aAAa,YAAY,UAAU;AACjD,0BAAc;AAAA,UAChB,O      yb    -o                  AAa,YAAY,cAAc;AACrD,0BAAc;AAAA,UAChB;AAA      yb    -o                  BAAY,IAAI,aAAa;AAC7B,uBAAa;AACb,0BAAgB;Aq      yb    -o                  AA,QAChB;AAAA,MACF;AAEA,aACE;AAAA,QAAC,O!      yb    -o                  AAG,GAAG,GAAG;AAAA,UAC7B,SAAS,EAAE,SAAS,
      yb    -o                  ,KAAK,OAAO,QAAQ,KAAK;AAAA,UAEjD,WAAU;AAA
      yb    -o                  CAAC,SAAI,WAAW,sEAAsE,UAAU,IAC9F,iCAAC,i1
      yb    -o                  mC,KADrC;AAAA;AAAA;AAAA;AAAA,qBAEA;AAAA,	      yb    -o                  G,WAAU,iEACX,mBADH;AAAA;AAAA;AAAA;AAAA,u	      yb    -o                  AAC,UAAK,WAAU,8DACb,mBAAS,KAAK,eAAe,QAAWA	      yb    -o                  BACL,MAAM;AAAA,kBACN,QAAQ;AAAA,gBACV,CAA      yb    -o                  AA;AAAA;AAAA;AAAA,uBASA;AAAA,mBAbF;AAAA;      yb    -o                  AA;AAAA;AAAA,mBAmBA;AAAA,YAEA,uBAAC,SAAIQ      yb    -o                  aAAa,uCAAuC,wCAAwC,IACpI,uBADH;AAAA;AAAA      yb    -o                  AW,8EAA8E,WAAW,IACvG,yBADH;AAAA;AAAA;AAA      yb    -o                  AAA,mBAOA;AAAA;AAAA;AAAA,QA/BK,GAAG,SAASa      yb    -o                  A;AAAA;AAAA;AAAA;AAAA,MAoCA;AAAA,IAEJ,CA      yb    -o                  OAtMF;AAAA;AAAA;AAAA;AAAA,SAuMA;AAEJ;","      yb    -o                  `B`    !!                            q      yb    -o                                           3      !      yb    -o                  Ɂ    -o          0       켁          yb    -o                  \                                          yb    -o                  8       8       4          
    1      yb    -o                          0       |    Ɓ    0ǁ          yb    -o                  PK    L           P                 yb    -o                           rq  (	    !       o~    A      yb    -o                  g      g      6          	          yb    -o        ā     ȁ     Ɂ    0      `       L          yb    -o    tion/dist/es/render/dom/create-visual-element.mjs     Q      yb    -o                  |    ǁ     Ɂ     ʁ    P             yb    -o    odules/framer-motion/dist/es/utils/use-motion-value-ev      yb    -o        -o  O       O       8                  a      yb    -o        ȁ            0           Ɂ     ʁ          yb    -o        let/node_modules/framer-motion/dist/es/value/use      yb    -o                    `    I       I       9      q      yb    -o              A    -o          0           !      yb    -o  P       P           let/node_modules/framer-]             yb    -o                              h            ^             yb    -o                  sm    9               !       }    1       _    -o  }            ^      @           o   f n                  IA  @             a           IA  ́    @                '                    )   u   !       7   ~   pdh*j,.D 1       IA  @             7   ~       A              1c                     )o                a      6E     n$                    Nb        8             @k$    6E                                    `Q                                                              3E    e     (R,8         0e     )R,8         e     )R,8  	       e     *R,8         e     *R,8         e     *R,8  
       e     +R,8         me     ,R,8         e     ,R,8         e     -R,8  	       Te     -R,8         ke     -R,8         e     .R,8         e     .R,8         e                ճe                   e     /R,8         e     0R,8  
       e     0R,8         e     0R,8         ôe     1R,8         e     1R,8         e     2R,8         e     2R,8         0e     2R,8         e     3R,8         e     3R,8         ϵe     3R,8         e     4R,8         oe     4R,8         e     5R,8  	                5R,8           e     6R,8         Be     6R,8  B       e     6R,8         e     7R,8  6       e                  e     ρ           !e     8R,8  J       e     8R,8  	       e     9R,8  \       e     9R,8  @       ge     :R,8         |e     :R,8  
       e     :R,8         e     ;R,8         ѳe     ;R,8         e     ;R,8         e     <R,8         e     <R,8  o       e     =R,8         e     =R,8         Ӵe     =R,8         e     >R,8         e     >R,8         (e     ?R,8         9e     ?R,8  [       e     @R,8         ʵe     @R,8         e           4       $e     o~    I       |e            7       e            9                            @}           +                ҁ                                                                          @              @}    `,    1                                      0       A          o   ց    0'    PՁ     (o                 A          o  Ձ                    (o                 A               Po                                   `       Q              k    Ё         ց           ar-ER           P       A              &    Ձ    ց    `(o                 A              ց                    `(o                 A          o   ց    `ց    `    `(o                        p             n
            
    `ׁ     q    $q    䢮                                         A               q                                   @      1                                        der.!                                 ,o                0      #-o  `6    `D    `6                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            Q       e    d    O    -o                        <h1 classN`                                 A(      #-o                 Pl           </d                    E    HY        P            order borderq*      O    -o                     ded- Ե                                                                             |                                           $cj    bf4    ʕcj    0D    ʕcj    0D    ʕcj    `D            -o                  <div>\n          <h3 className=\        Ѕ     Ե    H    `Xh{          e leading-tight\">24/7 Verified Support<(      O                   D                 @             mt-1 f(      O    -o                  assist you with       0           let/storage.rules               a%      P!    -o                  Pl    p                            E    HY        P     p           O    -o                  enter mb-6 trans   n-co Ե                                                                                    +                                    $cj     4    ʕcj    k    ʕcj    k    ʕcj                        /30 p-4         full mb-5 ring-4 ring-wha&              Ѕ     Ե    (    `Xh{  ">\n          <HelpCircle classN&      O    -o                         D                 @            O    -o                  slate-800 dark:text-white mb-2 r      0       .    let/test_admin.ts        classNa"      P!    -o                  Pl    P                        @     E    HY        P     P       o                  lease reach out to our team.\n       </ Ե                                                                                    s                                    $cj    z4    ʕcj    e=H    ʕcj    e=H    ʕcj    G            -center justify-        p-4 bg-s#      O    -o          Ѕ     Ե        `Xh{  -slate-700/50 roA#      O    -o                  over:bor               D                 @                           n              <div className=\"flex ite"            0           let/test_anon_auth.cjs  0 h-10 r      P!    -o                  Pl    0       y-c              @    E    HY    h    P     0           e-700 group-hover:scale-110 transition-t!              Ե                                                                             ^                                           $cj    +4    ʕcj    L:    ʕcj    L:    ʕcj    2            an className=\"t        O    -o                          Ѕ     Ե        `Xh{  q       O    -o                       </button>\n                       D                 @            (\n            <button onClick={() => h      O    -o        0           let/test_client_auth.cjs nter ju      P!    -o                  Pl           der                   E    HY    H    P            -200 dark:hover:border-emera      O    -o          Ե                                                                                    6                                    $cj    ҽ4    ʕcj    4Rb    ʕcj    4Rb    ʕcj    a                  O                            late-100 dark:bo        Ѕ     Ե        `Xh{  -o                                  <MessageCircle className               D                 @       p     <span className=\"font-      O    -o                        0       Γ    let/test_firestore.cjs  O          P!    -o                  Pl           xt-                   E    HY    (    P            utton>\n          O    -o                     ram  Ե                                                                             n                                           $cj    Byd4    ʕcj        ʕcj        ʕcj    S            -o                  l hover:border-sky-200 dark:hove        Ѕ     Ե        `Xh{          sm active:scale-[0.98]\">\n                   O                   D                 @       P     ame=\"w1      O    -o                  te-800 flex item      0           let/test_firestore2.cjs               P!    -o                  Pl                                E    HY        P                O    -o                        <span clas   e=\" Ե                                                                             &       0                                    $cj    f4    ʕcj    l0    ʕcj    l0    ʕcj    ^                    pan>\n            </button>\n          )              Ѕ     Ե        `Xh{             <button onClick={() =      O    -o                         D                 @       0     O    -o                  -slate-900/50 border border-slat      0           let/test_fix_ref.cjs    :border-!      P!    -o                  Pl                             l$    E    HY        P            o                  n                <div className=   10 h Ե                                                                                                                         $cj    \N~4    ʕcj    Q    ʕcj    Q    ʕcj    Ӗ              <Globe classNa         h-5\" /1      O    -o          Ѕ     Ե    h    `Xh{  t-bold text-slat      O    -o                  an>\n                  D                 @                            text-slate-400 dark:text-slate-500 trunA            0       o    let/test_framer.cjs     button>\A      P!    -o                  Pl           \n}                   E    HY        P                    "-o           O,cAAc;AQ              Ե                                                                                    (                                    $cj    C{4    ʕcj    xh    ʕcj    xh    ʕcj    h            ;AACF,cAAM,UAAU,        O    -o                          Ѕ     Ե    H    `Xh{        O    -o                  K,SAAS;AAAA,YACrB,UAAU,K               D                 @            AAY;AAAA,UAC7B,CAAC;AAAA,QACH;AAAA,MACFq      O    -o        0       O    let/test_logs.cjs       ACf,GAAGa      P!    -o                  Pl    p       ACV              @    E    HY        P     p       ACvC,WAAW,IAAI,WAAW,MAAM,KAA      O    -o          Ե                                                                                                                        $cj    (^g4    ʕcj    u    ʕcj    u    ʕcj    Lt                  O                            I,WAAU,gCACb;AAA        Ѕ     Ե    (    `Xh{  -o                  AAA,UAEV,iCAAC,aAAU,WAAU,aAArB;AAAA;AAAA               D                 @            A;AAAA;AAAA;AAAA,MAKA;A      O    -o                        0       /    let/test_referral.cjs   O          P!    -o                  Pl    P        Cb,                  E    HY         P     P       ;AAAA,aAEA;A      O    -o                     AiE, Ե                                                                                    *                                    $cj    '4    ʕcj        ʕcj        ʕcj    /            -o                  AA;AAAA;AAAA;AAAA,aAA4G;AAAA,MAC        Ѕ     Ե        `Xh{          AAAA;AAAA;AAAA;AAAA,aAAqE,KADvE;AAAA;AAA!      O                   D                 @            AAA,aAA      O    -o                  ArG;AAAA;AAAA;AA      0       0    let/test_referral_history.py          P!    -o                  Pl    0                             E    HY    h    P     0            O    -o                  B;AAAA;AAAA;AAAA   A,mB Ե                                                                                                                        $cj    F4    ʕcj    `    ʕcj    `    ʕcj    =`                    ;AAAA,QA        B,YACf,uBAAC,YAAO,SAAS,M	              Ѕ     Ե        `Xh{  ,SAAI,WAAU,2BACb;AAAA,mCAAC,SAAIQ	      O    -o                         D                 @            O    -o                  gDAA+C,wBAA/D;AAAA;AAAA;AAAA;AAA      0       Ї    let/test_refs.cjs       AA,UACA,      P!    -o                  Pl                            @    E    HY    H    P            o                  ,GAAG,WAAU,mPACzE;AAAA,iCAAC,SAA   AU,2 Ե                                                                                                                        $cj    }i4    ʕcj        ʕcj        ʕcj                AA,iBAKA;AAAA,UA        ,UAAK,WA      O    -o          Ѕ     Ե        `Xh{  ;AAAA;AAAA,eAQA;      O    -o                  AM,eAAe,               D                 @       p                    WAAU,qMACb,iCAAC,SAAM,WAAU,aAAjB;AAAA;AA            0       z    let/tsconfig.json       ,YACA,uB      P!    -o      p    Pl           AJz                  E    HY    (	    P                ;AAAA;AAAA;AAAA,iBAA8G;AAAA,aAPhH;AAAA;A              Ե                                                                             L                                            $cj    4    ʕcj        ʕcj        ʕcj    	j            
X-Forwarded-Hos        O    -o                          Ѕ     Ե    
    `Xh{        O    -o    rded-For: 2404:1c40:5f:68b4:d445:7062:               D                 @       P     ade: websocket
Connection: upgrade
pr      O    -o        0       }    let/tsconfig.node.json ;0                \5vŐ    p    Pl    P       .0                   E    HY    HP    P            -58490078092.asia-southeast1!      O    -o     ion: Ե                                                                                    e             	                       $cj    4    ʕcj        ʕcj        ʕcj    (V            1      O              5:7062:a696:6d74]";proto=https        Ѕ     Ե    Q    `Xh{  -o    -6501f52e6163943e-00
x-cloud-trace-context: 258f9cfe0               D                 @       0     CURE-aistudio_auth_tokeA            -o  1dSo91ZnbYjlzotm7HcMw=

Xh{        A                  }        *o                        (<U    f    B B h   PD                                                f    b h   B                                                        p    T<           <U                                                                        Bh                            Bh                         T<    Q       f    b B h m                                         A      T<           (<U    f    b B h m                                 
      T<         f     h : m m   B                                   
      T<                       <U                                                                      Bhm                          Bhm                 -o          Q       f     B h m s                       	      T<    -o                 (<U    f     B h m s               a	      T<    -o              f    "h : m m : s s   B             	      T<    -o                                <U                                                                    Bhms                        Bhms                              Q       f    " E o                  T<    -o                          Q       f    b E B h                 T<    -o                                 (<U    f    b E B h         T<    -o                              f     E   h   B     1      T<    -o                                            <U                                                                E   Bh                       E   Bh                                 Q       f     E B h m                                                              (<U    f     E B h m                                               P    f    E   h : m m   B -o                                         @                   <U                                                              E   Bhm                     E   Bhm                              Q       f     E B h m s                                                            (<U    f     E B h m s                                                 f    bE   h : m m : s s   B                                            "c           <U                                                            E   Bhms                   E   Bhms                    "c    Q       f    b E H m                                               "c           (<U    f    b E H m                                       "c        f     E   H H : m m                                 1      "c                       <U                                                                  E    Hm                      E    Hm                 -o          Q       f     E H m s                       A      "c    -o                 (<U    f     E H m s                      "c    -o          `D    f    BE   H H : m m : s s   0             "c    -o         PE    Q    !                        !                        1                               0       A              &    ?    '    ``(o  @              Q       u
    p    !       !       A&               }    P       0                                      0       A              ?                     Z(o  @              Q              @                               bez-TZ  -o          Q                  @                    bg           command!       en_IN                   A              '                    a(o  @                     @                        
    
     o    $o    䢮                                          1                                               !       -o          1                                               1                                              1                                              1          @   z)o  0l
                1                                              1                                              1                                              1                                              1                                              1       	                                       1       
                                       1                                              1                                              1                                              1                                              1             )o  |     7            1            !+o          k            1                                              1           	  a)o  @6    i            1                                              1                                              1                                              1                                              1                                                     p             p}_            
          V$    $V$    䢮                q  q                        !       ff_Adlm_GH -o  A΄e  A               U$                                          Q          o  P~_    @}    }     !    
       ff-Adlm-GH             Q              }    }        P!           ff-GH   Y!    ʕcj           !            p}_            
    "    V$    V$    䢮                q  q                        !       ff_Adlm_GM -o         A               V$                                          Q                                  "           ff-GW                   !       ff_Adlm_LR -o          q      9m    \5vq
/           a l o j)o  (     e                          Xh{  HXh{  "o                 Xh{          d     d     d         Xh{          +!           a    a    a    +!    a    a    a    +!                    efal                        p6  o  6  o  6  o          A              PXl                    IA  #        Q              $                    $           dje-NE                         De                        
    @%            䢮                                               A               p                                   P       1       nb_SJ   $                 0       A              '                     (o                       	            3            
    p&    q    Ԁq    䢮                                               A               q                                   P       A              0         ց    (o  @              A                                                               A              Ձ                     (o                 A              1c    @c    05     @*o                 A                  `    %    g(o  @>                     #-o  #-o  '    T             X X X   e                                                    f      e                    o                    e  f               e                                        f                                                         f                            e                    e         f      o                    e                    e                        f                           d      e                  f                                             &          f      &                    o                    &  f               e                                                                                  @-T                   @-T                      {                 e              MWh           e  7                                                                    d    H,                   |j    en       US  en_US                                                          MT    f      o                                              f                                                       f    " -                                                 f                                                  o          PNT    MT    f                                                       f                                                       f                                                      f             o                                             MT    f                                                      f                                                       f                                           o          f                                                             MT    f                                                       f     W     d    @d                                f             o                      d    `d    f                                                              MT    f                                                       f                                           o          f                                                      f                                                            MT    f                                                      f             o                                        f                                                       f                                                             MT    f                                           o          f                            o                        f           %bj    Сd     d                          f                                           js                 MT    f           P       #N    B a m   3    3            f           Q
      @      P       SL     -o         f                           
            P       Ã    f     i n g 1                               	      3    !     MT    f                                       a	      P       f         m i d n i g h t                               f     3           @8               
            f                 P       P       3    m o r n i n g 1                                   T            X X X   o                                              f                                         3    A      f                                                       f                           n                               f                               4           Ȯ    J    f                           P       L    B p m                  pb`       o  f                           #x               0    P0    f                         ?          ?                 f     "                    i a t e d       3    -o  f                                                            -        0 , -     q      #x      \5v       h           8d           H           (           d           Q           T           (m           8m           5<       By.j3           8           d           a           a           a           a           x<           d           f    " :     0:    3    -o                         ȝd           Hm           X           S<           H7           X7                                                                                   |j    en       US  en_US            f        &      @T       ?     `          T"                                    8    
       h7    
       7    
       (a"    
       8    
       ^"    
       |j                                   |j                                          p-o  d                                                                                                                           0       S`        0n               @       #x      \5v       Qur.  D    pg`    @       1                       p4<    p3            !       H                  Q              r                    =    	       hms:en_US o w   c    1                                              1                                              A              0?                    'o                1                                            !       ccp                     1              m    F    V     )4    A               m    p>    A    `'o                A                                                               A                  p@    `    W(o                A              `l            "n   0(o  }            A              `}                    <*o                A              ?                     0(o  '              A               A                    'o                       @                                                                                                                               0                                               A              0?            @    'o                1     o~    `    o~    `    ect, useCallback } from 'react';
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
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyTarget, setNotifyTarget] = useState<'all' | string>('all');
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [spinRewards, setSpinRewards] = useState<number[]>([1, 2, 5, 10, 0, 50, 100, 0]);
  const [referralSettings, setReferralSettings] = useState({ fixedBonus: 5, gen2FixedBonus: 3, gen3FixedBonus: 1, gen1Percent: 0, gen2Percent: 0, gen3Percent: 0 });
  const [bannerSettings, setBannerSettings] = useState({ text: 'Welcome to HMF Income! Complete tasks and earn money daily.', link: '#' });
  const [gameSettings, setGameSettings] = useState({ spinTaskReq: 0, spinReferReq: 0, mathTaskReq: 0, mathReferReq: 0 });
  const [partnerSettings, setPartnerSettings] = useState({ requiredReferrals: 10, dailyBonus: 100, enabled: true, withdrawEnabled: true });
  const [withdrawSettings, setWithdrawSettings] = useState({ mainMin: 50, mainFee: 0, bonusMin: 50, bonusFee: 0, referralMin: 50, referralFee: 0, tasksMin: 50, tasksFee: 0, mainAmounts: "110, 210, 310, 410, 510", bonusAmounts: "110, 210, 310, 410, 510", referralAmounts: "110, 210, 310, 410, 510", tasksAmounts: "110, 210, 310, 410, 510", partnerAmounts: "110, 210, 310, 410, 510", giftAmounts: "110, 210, 310, 410, 510" });
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

  const isFullAdmin = profile?.role === 'admin' || auth.currentUser?.email === '