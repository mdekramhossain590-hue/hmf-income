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
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Password:</span>
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
;AACb,4BAAg19      0    l    0    l    ;AAAA,UAChB;AAAA,QACF,OAAO;AAEL,cAAI,YAA8      l    -o                  Y,KAAK,aAAa;AAC9B,yBACE;AACF,4BAAgB;AAAA8      l    -o                  BAAiB;AAClD,wBAAY,KAAK,aAAa;AAC9B,yBACE;A8      l    -o                  AAS,UACR,SAAS,OACN,SAAS,KAAK,YAAY,IAC1B,7      l    -o                  B,yBACE;AACF,4BAAgB;AAAA,UAClB;AAEA,cAAI7      l    -o                  AY;AACnD,0BACE;AAAA,UACJ,WAAW,SAAS,WAAW,Q7      l    -o                  ACE;AAAA,UACJ,WAAW,SAAS,WAAW,YAAY;AACzC,7      l    -o                  CJ,OAAO;AACL,0BACE,aAAa,YAAY,YAAY;AACvC,6      l    -o                  J,SAAS,gBAAgB,QAAQ,CAAC,MAAM,SAAS,KAAK,Qa6      l    -o                  YAAY,UAAU;AAAA,UACnC;AAAA,YACE,OAAO;AAAA6      l    -o                  ;AAAA,UACV;AAAA,QACF,IACA;AAEN,eACE;AAAA5      l    -o                  ,qCAAC,SAAI,WAAU,2BACb;AAAA;AAAA,kBAAC;Aq5      l    -o                  EpG,iCAAC,iBAAc,WAAU,aAAzB;AAAA;AAAA;AAA!5      l    -o                  ;AAAA;AAAA;AAAA;AAAA;AAAA;AAAA,gBAIA;AAA4      l    -o                  gFACX,mBADH;AAAA;AAAA;AAAA;AAAA,yBAEA;AA4      l    -o                  C,UAAK,WAAU,8DACb,2BADH;AAAA;AAAA;AAAA;A14      l    -o                  A;AAAA,wBACC,WAAW,4EAA4E,WAAW;AAAA,wBAEj3      l    -o                  AA;AAAA;AAAA;AAAA,oBAIA;AAAA,uBATJ;AAAA;3      l    -o                  A;AAAA;AAAA,uBAgBA;AAAA,mBAtBF;AAAA;AAAAA3      l    -o                  AAU,4BACb;AAAA,gBAAC;AAAA;AAAA,kBACC,WAA2      l    -o                  ;AAAA,kBAEC;AAAA;AAAA,gBAPH;AAAA;AAAA;AA2      l    -o                  AA;AAAA;AAAA;AAAA,qBAUA;AAAA;AAAA;AAAA,UQ2      l    -o                  ;AAAA;AAAA;AAAA,QAuCA;AAAA,MAEJ,CAAC,KAl2      l    -o                  AAAA;AAAA;AAAA;AAAA,WAiLA;AAAA,IAEA,uBAA1      l    -o                  ,KAAnF;AAAA;AAAA;AAAA;AAAA,WAAsF;AAAA,IAa1      l    -o                  KAAK,KAA5D;AAAA;AAAA;AAAA;AAAA,WAA+D;AAA1      l    -o                  ,QAAG,WAAU,uHACZ;AAAA,+BAAC,UAAO,WAAU,8B0      l    -o                  ;AAAA,WADjD;AAAA;AAAA;AAAA;AAAA,aAGA;AAAq0      l    -o                  SAAI,WAAU,2MACb;AAAA,iCAAC,UAAO,WAAU,kDA!0      l    -o                  E,uBAAC,QAAG,WAAU,sFAAqF,+BAAnG;AAAA;AAA/      l    -o                  AAU,iFAAgF,2DAA7F;AAAA;AAAA;AAAA;AAAA,iB/      l    -o                  AAA,QACA,uBAAC,SAAI,WAAU,+LACb;AAAA,iCAA1/      l    -o                  BAA6D;AAAA,UAC7D,uBAAC,QAAG,WAAU,sFAAqF,.      l    -o                  CA,uBAAC,OAAE,WAAU,iFAAgF,6DAA7F;AAAA;AA.      l    -o                  AAA;AAAA,eAQA;AAAA,QACA,uBAAC,SAAI,WAAU,A.      l    -o                  AAA;AAAA;AAAA,iBAAqE;AAAA,UACrE,uBAAC,QA-      l    -o                  A,iBAEA;AAAA,UACA,uBAAC,OAAE,WAAU,iFAAgF-      l    -o                  APF;AAAA;AAAA;AAAA;AAAA,eAQA;AAAA,QACA,uQ-      l    -o                  AU,+CAAzB;AAAA;AAAA;AAAA;AAAA,iBAAqE;AAA-      l    -o                  AA;AAAA;AAAA;AAAA,iBAEA;AAAA,UACA,uBAAC,,      l    -o                  AAA,iBAEA;AAAA,aAPF;AAAA;AAAA;AAAA;AAAA,a,      l    -o                  A;AAAA,MAEA,uBAAC,SAAI,WAAU,uLACb;AAAA;A,      l    -o                  AAQ;AAAA,YAChC,WAAU;AAAA,YACX;AAAA;AAAA,+      l    -o                  AAAA,QAKA;AAAA,QACA,uBAAC,UAAK,WAAU,cAAaq+      l    -o                  AC9B;AAAA,UAAC;AAAA;AAAA,YACC,SAAS,MAAM,!+      l    -o                  ;AAAA,UAHD;AAAA;AAAA;AAAA;AAAA;AAAA;AAAA*      l    -o                  U,cAAa,iBAA7B;AAAA;AAAA;AAAA;AAAA,eAA8B;*      l    -o                  ,MAAM,SAAS,MAAM;AAAA,YAC9B,WAAU;AAAA,YAC1*      l    -o                  A;AAAA;AAAA;AAAA,QAKA;AAAA,WApBF;AAAA;AA)      l    -o                  AAAA;AAAA,WAkEA;AAAA,IAGA,uBAAC,mBACE,oC)      l    -o                  ,OAAO;AAAA,QAAP;AAAA,UACC,SAAS,EAAE,SAASA)      l    -o                  A,UACtB,MAAM,EAAE,SAAS,EAAE;AAAA,UACnB,S(      l    -o                  A,UACV,IAAG;AAAA;AAAA,QANL;AAAA;AAAA;AAA(      l    -o                  A;AAAA,QAAC,OAAO;AAAA,QAAP;AAAA,UACC,SAAQ(      l    -o                  A,UAC1C,SAAS,EAAE,SAAS,GAAG,OAAO,GAAG,GA(      l    -o                  AAO,MAAM,GAAG,GAAG;AAAA,UACvC,YAAY,EAAE,'      l    -o                  ,WAAU;AAAA,UACV,IAAG;AAAA,UAGH;AAAA,mCAAa'      l    -o                  BACb;AAAA,uCAAC,SAAI,WAAU,6EACb,iCAAC,QA'      l    -o                  ,KAD5B;AAAA;AAAA;AAAA;AAAA,uBAEA;AAAA,gB&      l    -o                  D1B;AAAA;AAAA;AAAA;AAAA,uBAEA;AAAA,mBANFq&      l    -o                  A,gBAAC;AAAA;AAAA,kBACC,SAAS,MAAM,0BAA0B!&      l    -o                  AAA,kBAEH,iCAAC,KAAE,WAAU,aAAb;AAAA;AAAA%      l    -o                  AAAA;AAAA;AAAA;AAAA;AAAA;AAAA;AAAA,cAMA;%      l    -o                  AA,YAGC,gBAAgB,SAAS,KACxB,uBAAC,SAAI,WAA1%      l    -o                  kBAAE,sBAAsB;AAAA,gBAAE;AAAA,gBAAG;AAAA,$      l    -o                  AAS;AAAA,mBAFlD;AAAA;AAAA;AAAA;AAAA,qBAG$      l    -o                  BAAc,KACb;AAAA,kBAAC;AAAA;AAAA,oBACC,SAAA$      l    -o                  BAEF,YAAE,eAAe;AAAA;AAAA,kBALpB;AAAA;AAA#      l    -o                  AA,gBAEF;AAAA,kBAAC;AAAA;AAAA,oBACC,SAAS#      l    -o                  AEH;AAAA,6CAAC,UAAO,WAAU,iBAAlB;AAAA;AAAQ#      l    -o                  ;AAAA;AAAA;AAAA,kBANhB;AAAA;AAAA;AAAA;AA#      l    -o                  ;AAAA;AAAA;AAAA;AAAA,qBAkBA;AAAA,iBAvBF;"      l    -o                  AC,SAAI,WAAU,0EACZ,oBACC,uBAAC,SAAI,WAAUa"      l    -o                  AAA;AAAA,mBAAmG,KADrG;AAAA;AAAA;AAAA;AAA"      l    -o                  I,WAAU,+DACb;AAAA,qCAAC,SAAI,WAAU,yKACb,!      l    -o                  AA,qBAAqC,KADvC;AAAA;AAAA;AAAA;AAAA,qBAEq!      l    -o                  BAAsB,KAD3B;AAAA;AAAA;AAAA;AAAA,qBAEA;AA!!      l    -o                  uBAAC,mBACA,0BAAgB,IAAI,CAAC,UAAU;AAC9B,       l    -o                  M,UAAU,OAAO,IACvB,IAAI,KAAK,MAAM,SAAS,IA       l    -o                  ,aAAa,YAAY,UAAU;AAAA,gBACnC;AAAA,kBACE,O1       l    -o                  ,kBACN,QAAQ;AAAA,gBACV;AAAA,cACF,IACA;AA      l    -o                  ,kBACC,SAAS,EAAE,SAAS,GAAG,GAAG,KAAK,OAA      l    -o                  AAG,GAAG,OAAO,EAAE;AAAA,kBACtC,MAAM,EAAEA      l    -o                  ,UAAU,IAAI,EAAE;AAAA,kBACtE,QAAM;AAAA,kB      l    -o                  AACf,uCAAiB,MAAM,EAAE;AAAA,oBAC3B;AAAA,k      l    -o                  CA,qHACN;AAAA,kBACA,IAAI,0BAA0B,MAAM,EAAQ      l    -o                  ;AAAA;AAAA,wBAAC;AAAA;AAAA,0BACC,WAAW,oB      l    -o                  AC,QAAK,WAAU,iBAAhB;AAAA;AAAA;AAAA;AAAA,      l    -o                  AAA;AAAA;AAAA;AAAA;AAAA,sBAQA;AAAA,sBACCa      l    -o                  AAA;AAAA;AAAA;AAAA,6BAAkF;AAAA,yBAXtF;AA      l    -o                  ,SAAI,WAAU,kBACb;AAAA,6CAAC,SAAI,WAAU,0C      l    -o                  ,2CACT,MAAM,OACF,uCACA,gCACN;AAAA,4BAEC,q      l    -o                  AA;AAAA;AAAA;AAAA;AAAA;AAAA,wBAQA;AAAA,w!      l    -o                  AAC,UAAK,WAAU,gFACb,wBADH;AAAA;AAAA;AAAA      l    -o                  AAA,8BACC,SAAS,CAAC,MACR,yBAAyB,MAAM,IAA      l    -o                  AAAA,8BACN,IAAI,sCAAsC,MAAM,EAAE;AAAA,8B1      l    -o                  AA;AAAA,qCAAgC;AAAA;AAAA,4BARlC;AAAA;AAA      l    -o                  AA,6BAfF;AAAA;AAAA;AAAA;AAAA,+BAgBA;AAAA      l    -o                  sBACA,uBAAC,OAAE,WAAU,wFACV,gBAAM,WADT;AA      l    -o                  A;AAAA;AAAA;AAAA,2BAgCA;AAAA;AAAA;AAAA,g      l    -o                  A;AAAA;AAAA;AAAA,cAoEA;AAAA,YAEJ,CAAC,KA      l    -o                  A;AAAA;AAAA;AAAA,mBA4GA;AAAA;AAAA;AAAA,QQ      l    -o                  AAAA,MAsKA;AAAA,SAlLF;AAAA;AAAA;AAAA;AAA      l    -o                  AAAA,IAGA,uBAAC,mBACE,+BACC,mCAEE;AAAA;A      l    -o                  AAE,SAAS,EAAE;AAAA,UACtB,SAAS,EAAE,SAAS,a      l    -o                  ,UACnB,SAAS,MAAM,qBAAqB,IAAI;AAAA,UACxC,      l    -o                  AAAA;AAAA;AAAA;AAAA,MAMA;AAAA,MAGA;AAAA,      l    -o                  SAAS,GAAG,OAAO,MAAM,GAAG,GAAG;AAAA,UAC1Cq      l    -o                  ;AAAA,UACtC,MAAM,EAAE,SAAS,GAAG,OAAO,MAA!      l    -o                  AA,mCAAC,SAAI,WAAU,qGAAf;AAAA;AAAA;AAAA;      l    -o                  GAAf;AAAA;AAAA;AAAA;AAAA,mBAAoH;AAAA,YAG      l    -o                  ,kBAAkB,KAAK;AAAA;AAAA,cADvF;AAAA;AAAA;A1      l    -o                  AED,uBAAC,SAAI,WAAU,oBACb;AAAA;AAAA,gBAA      l    -o                  K;AAAA,kBAE/E,4BAAkB;AAAA;AAAA,gBAHrB;AA      l    -o                  IA;AAAA,cAEA,uBAAC,UAAK,WAAU,+JACd;AAAA,A      l    -o                  AA,uBAAoE;AAAA,gBAAO;AAAA,mBAD7E;AAAA;AA      l    -o                  WAAU,yGACX,4BAAkB,SADrB;AAAA;AAAA;AAAA;A      l    -o                  Z,4BAAkB,QADrB;AAAA;AAAA;AAAA;AAAA,qBAEAQ      l    -o                  A;AAAA;AAAA,qBAAqB;AAAA,cAErB,uBAAC,SAAI      l    -o                  ;AAAA,kBAAC;AAAA;AAAA,oBACC,MACE,kBAAkB,      l    -o                  CP,KAAI;AAAA,oBACJ,WAAU;AAAA,oBAEV;AAAA,a      l    -o                  A,6BAA0B;AAAA,sBAAG;AAAA,sBAC5B,kBAAkB,Y      l    -o                  ;AAAA;AAAA;AAAA;AAAA;AAAA,gBAaA;AAAA,gBA      l    -o                  oBACL,SAAS,MAAM,qBAAqB,IAAI;AAAA,oBACxC,q      l    -o                  A;AAAA;AAAA;AAAA;AAAA;AAAA;AAAA,gBAMA;AA!      l    -o                  A,iBA9CF;AAAA;AAAA;AAAA;AAAA,mBA+CA;AAAA      l    -o                  A;AAAA;AAAA;AAAA,MA+DA;AAAA,SA1EF;AAAA;A      l    -o                  ;AAAA,WA+EA;AAAA,IAGA,uBAAC,mBACE,4BACC,1      l    -o                  ,UACC,SAAS,EAAE,SAAS,EAAE;AAAA,UACtB,SAA      l    -o                  AS,EAAE;AAAA,UACnB,WAAU;AAAA,UACV,SAAS,M      l    -o                  AAwB,MAAM;AAAA,UACrD;AAAA;AAAA,QARF;AAAAA      l    -o                  ;AAAA,MACA;AAAA,QAAC,OAAO;AAAA,QAAP;AAAA      l    -o                  ,UAC9B,SAAS,EAAE,SAAS,GAAG,GAAG,EAAE;AAA      l    -o                  AA,UAC3B,WAAU;AAAA,UACV,OAAO,EAAE,OAAO,oQ      l    -o                  AA,mCAAC,SAAI,WAAU,yCACb;AAAA;AAAA,gBAAC      l    -o                  AAK;AACvB,iCAAa,QAAQ,wBAAwB,MAAM;AAAA,kB      l    -o                  AE,WAAU,aAAb;AAAA;AAAA;AAAA;AAAA,yBAAuB;a      l    -o                  A;AAAA;AAAA;AAAA,cAQA;AAAA,cACA,uBAAC,SA      l    -o                  ;AAAA,kBACC,KAAK,aAAa;AAAA,kBAClB,KAAI;A      l    -o                  ;AAAA;AAAA;AAAA;AAAA;AAAA;AAAA,cAIA,IAEAq      l    -o                  AAA,qBAAmE,KARvE;AAAA;AAAA;AAAA;AAAA,qBA!      l    -o                  WAAU,oDAAmD,2BAAjE;AAAA;AAAA;AAAA;AAAA,u      l    -o                  U,iEAAgE,qFAA7E;AAAA;AAAA;AAAA;AAAA,uBAG      l    -o                  7E;AAAA;AAAA;AAAA;AAAA,uBAGA,IAEA,uBAAC,1      l    -o                  O,4DAApB;AAAA;AAAA;AAAA;AAAA,yBAEA;AAAA,      l    -o                  AAG;AAAA;AAAA,sBACgB,uBAAC,OAAE,oBAAH;AA      l    -o                  sBAAI,uBAAC,OAAE,qBAAH;AAAA;AAAA;AAAA;AAA      l    -o                  pD;AAAA;AAAA;AAAA;AAAA,2BAGA;AAAA,oBACA,
      l    -o                  AAH;AAAA;AAAA;AAAA;AAAA,6BAAuB;AAAA,sBAA
      l    -o                  AAAA,uBAPF;AAAA;AAAA;AAAA;AAAA,yBAQA;AAAQ
      l    -o                  BA5BJ;AAAA;AAAA;AAAA;AAAA,qBA8BA;AAAA,iB
      l    -o                  A,uBAAC,SAAI,WAAU,cACb;AAAA;AAAA,gBAAC;A	      l    -o                  K;AACvB,iCAAa,QAAQ,wBAAwB,MAAM;AAAA,kBACa	      l    -o                  ,YACA,iBACE,YACA;AAAA;AAAA,gBAXR;AAAA;AA	      l    -o                  AA,cACC,cAAc,SACb;AAAA,gBAAC;AAAA;AAAA,k      l    -o                  ,QAAQ;AACzC,sCAAkB,KAAK;AAAA,kBACzB;AAAAq      l    -o                  AAU,aAApB;AAAA;AAAA;AAAA;AAAA,2BAA8B;AAA!      l    -o                  AAAA;AAAA;AAAA;AAAA;AAAA;AAAA,cAQA,IACE,      l    -o                  AY;AACnB,wBAAI,gBAAgB;AAClB,qCAAe,OAAO;A      l    -o                  C,0BAAI,YAAY,YAAY;AAC1B,uCAAe;AAAA,sBACj1      l    -o                  B;AAAA,kBACA,WAAU;AAAA,kBACX;AAAA;AAAA,g      l    -o                  AAAA,cAcA,IAEA;AAAA,gBAAC;AAAA;AAAA,kBAC      l    -o                  ;AAAA,kBACA,WAAU;AAAA,kBACX;AAAA;AAAA,gBA      l    -o                  AAA,cAOA;AAAA,iBAhDJ;AAAA;AAAA;AAAA;AAAA      l    -o                  BA0GA;AAAA;AAAA,QAjHF;AAAA;AAAA;AAAA;AAA      l    -o                  AAA;AAAA;AAAA;AAAA,WA8HA,KAhIJ;AAAA;AAAAQ      l    -o                  AU,2EACb;AAAA,6BAAC,UAAO,WAAU,4BAAlB;AAA      l    -o                  OAAE,WAAU,+EAA8E,4CAA3F;AAAA;AAAA;AAAA;A      l    -o                  D,oCAApE;AAAA;AAAA;AAAA;AAAA,aAEA;AAAA,Sa      l    -o                  ;AAAA;AAAA;AAAA;AAAA,SA+1DA;AAEJ;","name      l    -o                  tion","doc","updateDoc","t"]}                 l    -o                                                          q      l    -o                                                          !      l    -o                                                                l    -o                                                                l    -o                                                          1      l    -o                                                                l    -o                                                                l    -o                                                          A      l    -o                                                               l    -o          d                                               l    -o          0       y    0            P       Q       l    -o          a                                 0           Qx      \5v command
   on-resolve   ids         importera   /app/applet/node_modules/framer-motion/dist/es/utils/reduced-motion/use-reduced-motion-config.mjs   key      kind   import-statement	   namespace   file   path   react
   pluginData 
   resolveDirC   /app/applet/node_modules/framer-motion/dist/es/utils/reduced-motion   with               Q              r
    s
                   haw-US                         p            t
            
        P-+    t-+    䢮                                               !       haw_US  -o          A               0-+                                   P       Q                                              he                                          n
            
        -+    -+    䢮    x           z7         he             A               -+                                   `V             `                         
         +    $+    䢮                                              !       he_IL   -o          A               +                                   P       Q          o  b          _               he-IL                          x             n
            
        P+    t+    䢮               ? +        hi              A               0+                                   X      Q          o  $4                                hi     
            A               +                                   P       A              ց                    (o                 QE      yb    Н7    yb    Н7           0U4           U4           E      Н7    -o                         V4           W4           D      Н7    -o                         W4           8X4           aD      Н7    -o                                                   D      Н7    -o                  h /5/3%麏C      Н7    -o                  <!?/A C)qC      Н7    -o                  #/K`Mh    򝐾_    !C      Н7    -o                                               DB      Н7    -o                        h   ctedWallet, setSelectedWalleB      Н7    -o                  umber, setMobileNumber] = useState('');\1B      Н7    -o                  h                          ] = A      Н7    -o                      = uX    	Xh{  \n  con      A      Н7    -o                     H-ainMin: 20, mainFee: 0, bonusMiAA      Н7    -o                          X              asks d    @      Н7    -o                  chSettings = asy c () => d       $=>@      Н7    -o                  chedDoc( oc(db, d       KithdrawQ@      Н7    -o                   {\n    d       .:= docSnapshot.d@      Н7    -o                  Pd       Min: data.mainMin || 20?      Н7    -o                  0,\n            bonusMin: data.b nusMin a?      Н7    -o                  ee || 0d       iferralMd    ?      Н7    -o                  lFee: data.refer alFee || 0,\n          >      Н7    -o                     .7ksFee: 8d       cN0\n    q>      Н7    -o                   \n    };\n    fetchSett ngs();\n  }, []!>      Н7    -o                   React.FormEvent  => {\n    e.preventDef=      Н7    -o                     (1turn;\nd       )jrentBal=      Н7    -o                    currend    !   ~*alances?.main |1=      Н7    -o                   d       o)# = profile?.balances?.b<      Н7    -o                  #   Qrral') currentBal = pro ile?.ba<      Н7    -o                  al = pr`d       +tasks?. d    A<      Н7    -o                  0d       w_mount);d    
   \?;      Н7    -o                     ;?      thd       |:um rech;      Н7    -o                      }\n 	Xh{  	Xh{  ileNumb      Q;      Н7    -o                  	Xh{  ase ent      	Xh{  	Xh{  ;      Н7    -o                  8       d           Hd           :      Н7    -o                         `d           d           a:      Н7    -o                         d           d           :      Н7    -o                         d           d           9      Н7    -o                         d           d           q9      Н7    -o                             [         `d           !9      Н7    -o                         0d           hd           8      Н7    -o                         0d           t);\n      else 8      Н7    -o                  eData[\"balances.referral\"] = increment18      Н7    -o                  a[`balances.tasks.${selectedWallet}`] = 7      Н7    -o                     batch.update(userRef, updateData);\n 7      Н7    -o                  if (selectedWallet === 'main') feePercenA7      Н7    -o                  e if (selectedWallet === 'bonus') feePer6      Н7    -o                  	Xh{  (selectD      	Xh{  	Xh{  6      Н7    -o                  ee;\n   Xh{  Xh{  t = wit\      Q6      Н7    -o                  chargeAmount * feePercent) / 100;\n     6      Н7    -o                  \n\n      const newTransactionRef = doc(5      Н7    -o                  er.uid, \"transactions\"));\n      batcha5      Н7    -o                  t: rechargeAmount,\n        fee: fee,\n 5      Н7    -o                  pe: 'withdraw',\n        status: 'pendin4      Н7    -o                        method: 'Mobile Recharge',\n      q4      Н7    -o                  }`,\n        createdAt: serverTimestamp(!4      Н7    -o                  stRef = doc(collection(db, \"payment_req3      Н7    -o                  stRef, {\n        userId: auth.currentUs3      Н7    -o                  User.email,\n        transactionId: newT13      Н7    -o                  rgeAmount,\n        fee: fee,\n        n2      Н7    -o                  hdraw',\n        status: 'pending',\n   2      Н7    -o                  thod: 'Mobile Recharge',\n        accounA2      Н7    -o                       createdAt: serverTimestamp()\n     1      Н7    -o                  ;\n      await refreshProfile();\n      1      Н7    -o                   successfully!');\n      navigate('/wallQ1      Н7    -o                  \n      handleFirestoreError(error, Oper1      Н7    -o                  ser?.uid}`);\n      toast.error(\"Error 0      Н7    -o                  {\n      setLoading(false);\n    }\n  };a0      Н7    -o                  6 px-4 pb-20\">\n      <div className=\"0      Н7    -o                  >\n        <button onClick={() => naviga/      Н7    -o                  -slate-800 rounded-full shadow-sm\">\n  q/      Н7    -o                  ext-slate-800 dark:text-white\" />\n    !/      Н7    -o                  ext-xl font-display font-black tracking-.      Н7    -o                  x items-center gap-2\">\n          <Smar.      Н7    -o                  500\" />\n          Mobile Recharge\n   1.      Н7    -o                  \"></div>\n      </div>\n\n      <div cl-      Н7    -o                  nded-3xl p-6 shadow-xl border border-sla-      Н7    -o                   <div className=\"mb-6 flex flex-col iteA-      Н7    -o                  "w-16 h-16 rounded-2xl bg-emerald-100 da,      Н7    -o                  ustify-center text-emerald-500 mb-3 shad,      Н7    -o                  ssName=\"w-8 h-8\" />\n          </div>\Q,      Н7    -o                  t-slate-800 dark:text-white text-center\,      Н7    -o                  Name=\"text-xs text-slate-500 dark:text-+      Н7    -o                  rectly to your mobile using wallet balana+      Н7    -o                  onSubmit={handleRecharge} className=\"sp+      Н7    -o                   <label className=\"block text-[11px] fo*      Н7    -o                  00 uppercase tracking-widest pl-1 mb-1.5q*      Н7    -o                   className=\"w-full bg-slate-50 border b!*      Н7    -o                  k:border-slate-700 dark:text-white round)      Н7    -o                  ex justify-between items-center opacity-)      Н7    -o                  lex items-center gap-2\"><Wallet classNa1)      Н7    -o                  ey Wallet</span>\n              <span cl(      Н7    -o                  k:text-emerald-400\">৳{profile?.balanc(      Н7    -o                              </div>\n            <p classA(      Н7    -o                   pl-1 italic\">Only Add Money balance ca'      Н7    -o                        </div>\n\n          <div>\n       '      Н7    -o                  ] font-bold text-slate-500 dark:text-slaQ'      Н7    -o                  -1.5\">Mobile Operator</label>\n        '      Н7    -o                  p-2\">\n              {['Grameenphone', &      Н7    -o                  k'].map((op) => (\n                <div a&      Н7    -o                           onClick={() => setOperator(op)}&      Н7    -o                  ounded-xl p-3 flex flex-col items-center%      Н7    -o                  n-all ${\n                    operator =q%      Н7    -o                  ald-50 border-emerald-500 text-emerald-7!%      Н7    -o                  erald-500 dark:text-emerald-400 shadow-s$      Н7    -o                  order-slate-200 text-slate-600 dark:bg-s$      Н7    -o                  -slate-300 hover:border-emerald-300'\n  1$      Н7    -o                                    <span className=\"text#      Н7    -o                  span>\n                </div>\n         #      Н7    -o                  </div>\n\n          <div>\n            <A#      Н7    -o                  -bold text-slate-500 dark:text-slate-400"      Н7    -o                  >Mobile Number</label>\n            <inp"      Н7    -o                          placeholder=\"e.g. 017XXXXXXXX\"Q"      Н7    -o                    value={mobileNumber}\n              on"      Н7    -o                  value)}\n              className=\"w-ful!      Н7    -o                  rk:bg-slate-900/50 dark:border-slate-700a!      Н7    -o                  text-sm focus:outline-none focus:ring-2 !      Н7    -o                  nt-mono\"\n            />\n          </d       Н7    -o                  el className=\"block text-[11px] font-boq       Н7    -o                  percase tracking-widest pl-1 mb-1.5\">Am!       Н7    -o                  n              type=\"number\" \n             Н7    -o                               required \n              mi      Н7    -o                                onChange={(e) => setAmount1      Н7    -o                  me=\"w-full bg-slate-50 border border-sl      Н7    -o                  -slate-700 dark:text-white rounded-xl px      Н7    -o                  us:ring-2 focus:ring-emerald-500 transitA      Н7    -o                  \"\n            />\n          </div>\n\n      Н7    -o                  ubmit\" \n            disabled={loading}      Н7    -o                  ald-500 hover:bg-emerald-600 dark:bg-emeQ      Н7    -o                  white font-bold py-4 rounded-xl shadow-l      Н7    -o                  ] flex items-center justify-center gap-2      Н7    -o                  cursor-not-allowed disabled:active:scalea      Н7    -o                  g ? (\n              <div className=\"w-      Н7    -o                  white rounded-full animate-spin\"></div>      Н7    -o                                 <Send className=\"w-5 h-5q      Н7    -o                             </>\n            )}\n        !      Н7    -o                  v>\n    </div>\n  );\n}\n"],"mappings":"      Н7    -o                  B;AAC3C,SAAS,eAAe;AACxB,SAAS,mBAAmB;AAC5      Н7    -o                  AY,KAAK,YAAY,WAAW,uBAA+B;AAChF,SAAS,IAAI1      Н7    -o                  B,OAAO,WAAW;AAEX,gBAAS,WAAW;AACzB,QAAM,E      Н7    -o                  YAAY;AAC7B,QAAM,CAAC,gBAAgB,iBAAiB,IAAI,      Н7    -o                  ,SAAS,EAAE;AACnD,QAAM,CAAC,UAAU,WAAW,IAAA      Н7    -o                  AI,SAAS,EAAE;AACvC,QAAM,CAAC,SAAS,UAAU,I      Н7    -o                  AmB,IAAI,SAAS,EAAE,SAAS,IAAI,SAAS,GAAG,U      Н7    -o                  AAU,IAAI,UAAU,EAAE,CAAC;AAE3K,YAAU,MAAM;Q      Н7    -o                  AM,cAAc,MAAM,aAAa,IAAI,IAAI,YAAY,UAAU,CA      Н7    -o                  ,OAAO,YAAY,KAAK;AAC9B,8BAAoB;AAAA,YAClB,      Н7    -o                  ;AAAA,YACzB,UAAU,KAAK,YAAY;AAAA,YAC3B,UAa      Н7    -o                  AAA,YACjC,aAAa,KAAK,eAAe;AAAA,YACjC,UAAU      Н7    -o                  A,UAC7B,CAAC;AAAA,QACH;AAAA,MACF,SAAQ,GA      Н7    -o                  AChB,GAAG,CAAC,CAAC;AAEL,QAAM,iBAAiB,OAAq      Н7    -o                  KAAK,eAAe,QAAS;AAElC,QAAI,aAAa;AACjB,QAA!      Н7    -o                  AC9D,mBAAmB,QAAS,cAAa,SAAS,UAAU,SAAS;AAA      Н7    -o                  AAAA,QAC/E,cAAa,SAAS,UAAU,QAAQ,cAAc,KAAK      Н7    -o                  MAAM,cAAc,KAAK,iBAAiB,IAAI;AAChD,YAAM,MA1      Н7    -o                  ,gBAAgB,aAAa,SAAS,IAAI;AAC7C,YAAM,MAAM,6      Н7    -o                  U;AACb,YAAM,MAAM,2BAA2B;AACvC;AAAA,IACF;      Н7    -o                  AAsB;AAClC;AAAA,IACF;AAEA,eAAW,IAAI;AAEfA      Н7    -o                  M,UAAU,IAAI,IAAI,SAAS,KAAK,YAAY,GAAG;AAE      Н7    -o                  Q,YAAW,eAAe,IAAI,UAAU,CAAC,cAAc;AAAA,eAC      Н7    -o                  C,cAAc;AAAA,eACpF,mBAAmB,WAAY,YAAW,mBAAmQ      Н7    -o                  AAkB,cAAc,EAAE,IAAI,UAAU,CAAC,cAAc;AAE/E      Н7    -o                  jB,UAAI,mBAAmB,OAAQ,cAAa,iBAAiB;AAAA,eAC      Н7    -o                  AAmB,WAAY,cAAa,iBAAiB;AAAA,UACjE,cAAa,iBa      Н7    -o                  AAM,YAAY,iBAAiB;AAEnC,YAAM,oBAAoB,IAAI,W      Н7    -o                  AC3F,YAAM,IAAI,mBAAmB;AAAA,QAC3B,QAAQ;AA      Н7    -o                  CN,QAAQ;AAAA,QACR,QAAQ;AAAA,QACR,QAAQ;AAq      Н7    -o                  CtC,WAAW,gBAAgB;AAAA,MAC7B,CAAC;AAED,YAA!      Н7    -o                  E,YAAM,IAAI,mBAAmB;AAAA,QAC3B,QAAQ,KAAK,      Н7    -o                  B,eAAe,kBAAkB;AAAA,QACjC,QAAQ;AAAA,QACR;      Н7    -o                  AAAA,QACR,QAAQ;AAAA,QACR,QAAQ;AAAA,QACR,1      Н7    -o                  ,gBAAgB;AAAA,MAC7B,CAAC;AAED,YAAM,MAAM,O      Н7    -o                  yC;AACvD,eAAS,qBAAqB;AAAA,IAChC,SAAS,OAA      Н7    -o                  AAa,GAAG,EAAE;AAClF,YAAM,MAAM,4BAA4B;AAAA      Н7    -o                  AAAA,EACF;AAEA,SACE,uBAAC,SAAI,WAAU,mBAC      Н7    -o                  YAAO,SAAS,MAAM,SAAS,EAAE,GAAG,WAAU,yDAC7      Н7    -o                  AAAA,aAA8D,KADhE;AAAA;AAAA;AAAA;AAAA,aAEQ      Н7    -o                  BAAC,cAAW,WAAU,8BAAtB;AAAA;AAAA;AAAA;AAA      Н7    -o                  AAA;AAAA,aAGA;AAAA,MACA,uBAAC,SAAI,WAAU,      Н7    -o                  B;AAAA;AAAA;AAAA;AAAA,WASA;AAAA,IAEA,uBAa      Н7    -o                  mCACb;AAAA,+BAAC,SAAI,WAAU,mIACb,iCAAC,c      Н7    -o                  ,KADlC;AAAA;AAAA;AAAA;AAAA,eAEA;AAAA,QAC      Н7    -o                  A;AAAA;AAAA,eAAkF;AAAA,QAClF,uBAAC,OAAE,q      Н7    -o                  AAgI;AAAA,WALlI;AAAA;AAAA;AAAA;AAAA,aAMA!      Н7    -o                  ACxC;AAAA,+BAAC,SACC;AAAA,iCAAC,WAAM,WAA      Н7    -o                  mI;AAAA,UACnI,uBAAC,SAAI,WAAU,iMACb;AAAA      Н7    -o                  WAAU,4BAAlB;AAAA;AAAA;AAAA;AAAA,qBAA2C;A1      Н7    -o                  ,mBAAwG;AAAA,YACxG,uBAAC,UAAK,WAAU,oDAAm
      Н7    -o                  C,KAAK;AAAA,iBAA5G;AAAA;AAAA;AAAA;AAAA,m
      Н7    -o                  GA;AAAA,UACA,uBAAC,OAAE,WAAU,iDAAgD,uEAAA
      Н7    -o                  ;AAAA;AAAA;AAAA;AAAA,eAOA;AAAA,QAEA,uBAA	      Н7    -o                  H;AAAA;AAAA;AAAA;AAAA,iBAAuI;AAAA,UACvI,	      Н7    -o                  AAU,cAAc,UAAU,EAAE,IAAI,CAAC,OACjE;AAAA,Q	      Н7    -o                  AAAA,cAC7B,WAAW,iGACT,aAAa,KACT,qIACA,+H	      Н7    -o                  AvD;AAAA;AAAA;AAAA;AAAA,qBAA0D;AAAA;AAAA      Н7    -o                  A;AAAA;AAAA,UAUA,CACD,KAbH;AAAA;AAAA;AAAa      Н7    -o                  AAA,eAiBA;AAAA,QAEA,uBAAC,SACC;AAAA,iCAA      Н7    -o                  ;AAAA,iBAAqI;AAAA,UACrI;AAAA,YAAC;AAAA;A      Н7    -o                  AAQ;AAAA,cACR,OAAO;AAAA,cACP,UAAU,CAAC,Mq      Н7    -o                  U;AAAA;AAAA,YANZ;AAAA;AAAA;AAAA;AAAA;AAA!      Н7    -o                  A;AAAA;AAAA,eAUA;AAAA,QAEA,uBAAC,SACC;AA      Н7    -o                  AA;AAAA;AAAA,iBAAkI;AAAA,UAClI;AAAA,YAAC      Н7    -o                  ,cACZ,UAAQ;AAAA,cACR,KAAI;AAAA,cACJ,OAAO1      Н7    -o                  ,KAAK;AAAA,cACzC,WAAU;AAAA;AAAA,YAPZ;AAA      Н7    -o                  A;AAAA,aAVF;AAAA;AAAA;AAAA;AAAA,eAWA;AAA      Н7    -o                  A,YACL,UAAU;AAAA,YACV,WAAU;AAAA,YAET,oBAA      Н7    -o                  AAAA,mBAA2F,IAE3F,mCACE;AAAA,qCAAC,QAAK,      Н7    -o                  AA,cAAE;AAAA,iBAD9B;AAAA;AAAA;AAAA;AAAA,      Н7    -o                  ;AAAA;AAAA;AAAA;AAAA,QAaA;AAAA,WAnEF;AAAQ      Н7    -o                  AAA;AAAA;AAAA,WA8EA;AAAA      -o        Н7    -o                  NA             c     -o                Н7    -o        -o          0       5     Z    PZ    a      Н7    -o        И                                                  Н7    -o                                                                Н7    -o                             7                   q      Н7    -o        -o          0       5"    @[    [    !      Н7    -o                                                             Н7    -o          8       8                                         Н7    -o    -o  -o  #     \    p\    0]     D      1      Н7    -o               -o  -o                                 Н7    -o          0       Ux      \    ]    d    D             Н7    -o          [      <                           %    A       Ѓ    -o  `]    !       `k    -o  PE            e&    \5v command
   on-resolve   ids         importerZ   /app/applet/node_modules/framer-motion/dist/es/animation/animators/MainThreadAnimation.mjs   key      kind   import-statement	   namespace   file   path
   motion-dom
   pluginData 
   resolveDirB   /app/applet/node_modules/framer-motion/dist/es/animation/animators   with                  Q          o  _                    _           jgo                  Q               b    p_    `    _           jgo-CM                         `            `_            
    `     ?l    D?l    䢮                                               !       jgo_CM  -o          A                ?l                                   P       Q              _                     a           jmc                            a             n
            
    a    Vm    Vm    䢮                #                         !       jmc o  -o          A               Vm                                   0      Q                  _        Pb           jmc-TZ  @-o                 b            @a            
    c    Ym    Zm    䢮                                               !       jmc_TZ  -o          A               Ym                                   P       Q                                  c           jv     -o  y%n!         d             n
            
     d    0Zm    TZm    䢮    
           l.         jv              A               Zm                                    +              Jb            c            
    P    Pm    tm    䢮                                               1                                              1                                              1                                              1                                              1                                              1                                            1                                      6    1                                      h    1                                             1                                              1                                      F    1                                      h    1                                                    Ue            @            
    g    p        䢮    v            ?                         A               P                                         Q              @                    @h           en-HU                          `            @c            
    h            䢮                \  \                        A               `                                   p       q      Vx      \5v command
   on-resolve   ids         importerU   /app/applet/node_modules/framer-motion/dist/es/animation/hooks/animation-controls.mjs   key      kind   import-statement	   namespace   file   path   motion-utils
   pluginData 
   resolveDir>   /app/applet/node_modules/framer-motion/dist/es/animation/hooks   with               FW    \5vŐ    ;    pQ;    p^                        o$    E    HY    ^    P     j                                                                   Ե                                                                                                                        $cj    ~4    ʕcj        ʕcj        ʕcj     d                                                                            Ѕ     Ե    (`    `Xh{                                                                                 D                 @       l                                                                            Q                                  pm           kxv-Orya-IN                  n                         
    0n    Pq    tq    䢮                                               !       kxv_Orya_IN o          A               0q                                   P       Q                  PPe    y:    n           kxv-Telu s    ʕcj           @o             n
            
    `o    q    ĸq    䢮               77 6                        !       kxv_Telu -o          A               q                                         Q              p                    o           kxv-Telu-IN                  pp            n            
    p    0q    Tq    䢮                                               !       kxv_Telu_IN o        A               q                                   P       Q              }    o    r     q           ky                          q             n
            
    q    q    q    䢮               8         ky              A               `q                                   @             `r             q            
    r    r    r    䢮                                               !       ky_KG   -o          A               pr                                   P       Q          o  p                    r           ky-KG   A       >    1                                0             %    \5v command
   on-resolve   ids         importerZ   /app/applet/node_modules/framer-motion/dist/es/components/AnimatePresence/use-presence.mjs   key      kind   import-statement	   namespace   file   path   react
   pluginData 
   resolveDirI   /app/applet/node_modules/framer-motion/dist/es/components/AnimatePresence   with                A                )                                   P       Q              0P                    0u           sg                             u             n
            
    u    p)    )    䢮               q .        sg              A               P)                                   `      Q              z    0P    px    @v           sg-CF                          v            Pu            
     w    1    1    䢮                                               !       sg_CF   -o          A               1                                   P       Q               p_                    pw           shi                            x             n
            
    0x    3    3    䢮               w: 
                        !       shi o  -o          A               p3                                   p      Q              v     n_    y    x           shi-Latn                       @y             n
            
    `y     :    $:    䢮                8                         !       shi_Latn -o          A               9                                         Q              px                    y           shi-Latn-MA                    pz            x            
    z    A    A    䢮                                               !       shi_Latn_MA o          A               A                                   P       Q              M    v    ǅ     {           shi-MA                         {            w            
    {    B    B    䢮                                               !       shi_Tfng -o          A               `B                                   P       Q          o  P|                    0|           shi-Tfng                Q              ǅ     |    }    |           shi-Tfng-MA                     }             {            
    @}    B    B    䢮                                              !       shi_Tfng_MA o      A               B                                   P       Q              P|                    }           shn                     1                                 0       1                                      )      A               @                     x)o                 Q      Wx      \5v command
   on-resolve   ids         importerG   /app/applet/node_modules/framer-motion/dist/es/events/use-dom-event.mjs   key      kind   import-statement	   namespace   file   path   react
   pluginData 
   resolveDir5   /app/applet/node_modules/framer-motion/dist/es/events   with       Q              u`    `    0y`               es-PA                                    `c            
        p        䢮                K                         !       es_PA   -o         A               P                                         Q                                               es-PE   s    ʕcj                       `c            
             $    䢮                K                         !       es_PE   -o          A                                                        Q              0y`         x`    P           es-PH           P             H`    \5vŐ    ;    pQ;     k                        \    E    HY    Xk    P     p                                                                   Ե                                                                             -       f                                    $cj    
4    ʕcj        ʕcj        ʕcj    lN                                                                           Ѕ     Ե    l    `Xh{                                                                                 D                 @       Є                                                                    `                         |_            
        [$    [$    䢮                                               !       ff_Latn -o  c    A               p[$                                   P       Q          o                      0           ff-Latn ~             Q              `         i        
       ff-Latn-BF     ʕcj                                     
    @    [$    \$    䢮                                               !       ff_Latn_BF -o  `Xh{  A               [$                                   P       Q               i                        
       ff-Latn-CM            1                lucide.cjs     0              k                                                                                                                               `       l    \5v command
   on-resolve   ids         importer?   /app/applet/node_modules/framer-motion/dist/es/motion/index.mjs   key      kind   import-statement	   namespace   file   path   react/jsx-runtime
   pluginData 
   resolveDir5   /app/applet/node_modules/framer-motion/dist/es/motion   with                   q      6E    l$                    ́        var           i@ r$    6E                                    `Q                                                              3E    e     
    fo	       $e     t++) e[       ze     )) && (	       e     n += f)       ߱e      in e)        e     += " ")
       e     rn n;
}       ae     {
  for       e     , n = "       e     length;	       He      argume       _e     (e)) &&       |e     , n +=        e     
var cl       e     ;

expo       ɳe     sx_defa       ݳe     Mapping       e     E.js.ma
       e     R,8         e     R,8         e     R,8         Դe     R,8         e     R,8         e     R,8         $e     R,8         e     R,8         e     R,8         e     R,8         e     R,8         Ke     R,8         e     R,8                  R,8          e     R,8  9       6e     R,8  B       e     R,8         e     R,8  6       e     R,8         e     -o         e     R,8  J       ue     R,8  	       e     R,8  \       e     R,8  @       [e     R,8         pe     R,8  
       e     R,8         e     R,8         ųe     R,8         ٳe     R,8         e     R,8         e      R,8  o       e      R,8         e     !R,8         Ǵe     !R,8         e     !R,8         e     "R,8         e     "R,8         -e     #R,8  a       e     #R,8         ɵe     $R,8  #       e                  e     ,    5       Se            I       e         7                                        modules                 -group/                                                                       @              @}    `,    pe"]
}
 p      a          \5v command
   on-resolve   ids         importerR   /app/applet/node_modules/framer-motion/dist/es/projection/use-reset-projection.mjs   key      kind   import-statement	   namespace   file   path   react
   pluginData 
   resolveDir9   /app/applet/node_modules/framer-motion/dist/es/projection   with               @             n
            
    `         D    䢮                .                         !       twq o  -o          A                                                         Q                   .5    Д    Г           twq-NE                         p                        
        0    T    䢮                                               !       twq_NE  -o          A                                                  P       Q                                              tyv                                         n
            
                䢮               9                         !       tyv o  -o          A               `                                   p      Q                      `    0           tyv-RU                         Ж                         
                䢮                                               !       tyv_RU  -o          A                                                  P       Q              `                    `           tzm                                          n
            
         @    d    䢮                8                         !       tzm o  -o          A                                                         Q                   0                   tzm-MA                         0                        
    P            䢮                                               !       tzm_MA  -o          A                                                  P       Q              `                               ug                             H             n
            
    `    PD    tD    䢮               N "        ug              A               0D                                         Q              -5          !    К           ug-CN         b           p                        
         a    $a    䢮                                               !       ug_CN   -o      A               `                                   P       Q              !                                uk                                         n
            
        Pa    ta    䢮               @         uk              A               0a                                   `             @                         
    &            䢮                                               a      9    \5v command
   on-resolve   ids         importerL   /app/applet/node_modules/framer-motion/dist/es/utils/use-animation-frame.mjs   key      kind   import-statement	   namespace   file   path   react
   pluginData 
   resolveDir4   /app/applet/node_modules/framer-motion/dist/es/utils   with                          0            `c            
    @    P    t    䢮    "            K                         A               0                                          Q                                             es-BZ                          P            `c            
    p        4    䢮    "            K                         !       es_BZ   -o          A                                                         Q              `        p`    ࠅ           es-CL                  A                                                         1                                0       1                                                      j#            `c            
         ~        䢮    ;            z                        A               ~                                   0      Q          o  Pc    i#                   es-AR                   Q              `                    ࢅ           es-BO   Bq%    'cj                       `c            
             D    䢮    <            K                         !       es_BO   -o          A                                                   0      Q              0e    Pc    `               es-BR                   !       es_BR   -o          1                                      Pl                        `c            
         0    T    䢮    .           K                         !       es_GT   -o       A                                                                ॅ            `c            
         0    T    䢮    V                                     !       es_HN   -o  ʕcj    A                                                        Q              c                    p           es-IC                                     c            
    pc            䢮                                               !       es_IC                   1                                      0       Q      *    \5v command
   on-resolve   ids         importerB   /app/applet/node_modules/framer-motion/dist/es/utils/use-cycle.mjs   key      kind   import-statement	   namespace   file   path   react
   pluginData 
   resolveDir4   /app/applet/node_modules/framer-motion/dist/es/utils   with             Q              G`                    ਅ           luo-KE                       и             H`            
         ؤ    $ؤ    䢮                                               A               פ                                   P       Q               ,    pn    0#               luy     ~k4    ʕcj                        n
            
        Pؤ    tؤ    䢮    P           (                         !       luy o  -o          A               0ؤ                                         Q                                               luy-KE                                                 
    ૅ    ݤ    ޤ    䢮                                               !       luy_KE  -o          A               ݤ                                   P       Q              n"            P           lv                             ج             n
            
        0ޤ    Tޤ    䢮    1           l. @        lv              A               ޤ                                   @U                         p            
    Э    p3    3    䢮                                               !       lv_LV   -o         A               P3                                   P       Q          o                       @           lv-LV                          `#             n
            
    m"    |    |    䢮               >                         1                                0       1          \5vS,8  	S,8  AS,8  qS,8  S,8  ɫS,8  S,8  S,8  9S,8  iS,8  S,8  S,8  S,8  	S,8  )S,8  QS,8  qS,8  S,8  S,8  ٭S,8  S,8  AS,8  iS,8  S,8  ɮS,8  S,8  	S,8  )S,8  YS,8  S,8  S,8  ٯS,8  S,8  1S,8  QS,8  S,8  S,8  ɰS,8  S,8  	S,8  9S,8  aS,8  yS,8  S,8  S,8  S,8  S,8  1S,8  YS,8  S,8  S,8  ѲS,8  S,8  )S,8  YS,8  S,8  ɳS,8  S,8  S,8  9S,8  aS,8  S,8  S,8  ѴS,8  S,8  )S,8  YS,8  Q      ;߅    \5v command
   on-resolve   ids         importerD   /app/applet/node_modules/framer-motion/dist/es/utils/use-in-view.mjs   key      kind   import-statement	   namespace   file   path   react
   pluginData 
   resolveDir4   /app/applet/node_modules/framer-motion/dist/es/utils   with           Q                  {:                   ln-CG                        P_            y:            
    `            䢮                                               A               `                                   P       Q                                  г           lo j    fh4    ʕcj           X             n
            
    p            䢮    '           77         lo              A                                                   m             0                        
    P    e    e    䢮                                               !       lo_LA   -o  ?`    A               e                                   P       Q          o                         lo-LA   HY    (n"           `             n
            
         f    Df    䢮    >           &                         !       lrc o  -o          A                f                                   P      Q          o                                 lrc     wռ  wռ  Q              y:        PF`    @           lrc-IQ  o"    `Xh{         ළ            ൅            
         pk    k    䢮                                          !       lrc_IQ  -o  @1  A               Pk                                          Q              PC`                    p           lrc-IR                A               Ϥ                                   @      !       luo_KE  -o          1      [N    \5všS,8  S,8  S,8  S,8  9S,8  iS,8  S,8  S,8  S,8  	S,8  9S,8  iS,8  S,8  S,8  S,8  S,8  S,8  9S,8  YS,8  S,8  S,8  S,8  	S,8  1S,8  iS,8  S,8  S,8  S,8  	S,8  9S,8  aS,8  S,8  S,8  S,8  S,8  	S,8  1S,8  YS,8  yS,8  S,8  S,8  S,8  S,8  IS,8  iS,8  S,8  S,8  S,8  )S,8  QS,8  yS,8  S,8  S,8  S,8  )S,8  IS,8  qS,8  S,8  S,8  S,8  !S,8  IS,8  yS,8  S,8  S,8  	S,8  )S,8  a      ;    \5v command
   on-resolve   ids         importerO   /app/applet/node_modules/framer-motion/dist/es/utils/use-instant-transition.mjs   key      kind   import-statement	   namespace   file   path   react
   pluginData 
   resolveDir4   /app/applet/node_modules/framer-motion/dist/es/utils   with                                               
    :e    @o    do    䢮                                                         A                                      k    P14    @       A                                                                      c            m            
        0%    T%    䢮                Q  Q                        A               %                                   p       Q          o  
    
                   fr-CI                   Q              P                    о           fr-CM   d4    ʕcj           p            m            
        %    į%    䢮    8            8  8                        !       fr_CM   -o  rD  A               %                                         Q              @}    ,                    fr-DJ                                      m            
        %    ԰%    䢮    "                                     A               %                                          1                                               1                                                      Ne                        
    }#    0o    To    䢮                                                         A                                                      @       1                                      0       A                                      g               @       A               @c        `}    `8*o                 A                  ?         u+o   	             A                                   ~+o                !       am_ET                          P    P."     n    `    }    @'    ׁ    pX    !        `}    p4        0    <    0}    #     e    I`    @`     ~    p}    0ą    `ą           1                                      dist/es/1                                      0       A                                                               !       (A          0@    1                                       0                 \5v command
   on-resolve   ids         importerT   /app/applet/node_modules/framer-motion/dist/es/animation/generators/spring/index.mjs   key      kind   import-statement	   namespace   file   path
   motion-dom
   pluginData 
   resolveDirJ   /app/applet/node_modules/framer-motion/dist/es/animation/generators/spring   with                        ǅ             n
            
    @ǅ     C    DC    䢮    &                                     !       shn o  -o          A                C                                   К      Q              z    P|    Ʌ    ǅ           shn-MM  A                    Pȅ            ƅ            
    pȅ            䢮                                               !       shn_MM  -o          A                                                  P       Q              Ʌ                    ȅ           shn-TH          @              Ʌ            ƅ            
    Ʌ    @    d    䢮                .   .                         !       shn_TH  -o          A                                                   `       Q              ǅ    ȅ    ˅    ʅ           si                             ʅ             n
            
    ʅ            䢮               77 V        si              A                                                  p4             p˅            0ʅ            
    ˅        4    䢮                                               !       si_LK   -o          A                                                  P       Q          o  Ʌ                     ̅           si-LK                          ̅             n
            
    ̅    `        䢮               ;         sk              A               @                                   L      Q           o  `9    3    Ђ6    ͅ           sk       Ե                ͅ             ̅            
    ͅ     `    $`    䢮                                               !       sk_SK   -o  ʕcj    A               _                                   P       Q          o   υ                    @΅           sk-SK                          ΅             n
            
    ΅    P`    t`    䢮               z7         sl              A               0`                                    K      Q          o  #    ΅    #    Pυ           sl                             υ            `΅            
    `#    p        䢮                                               !       sl_SI                         }    \5v command
   on-resolve   ids         importerS   /app/applet/node_modules/framer-motion/dist/es/animation/generators/spring/find.mjs   key      kind   import-statement	   namespace   file   path   motion-utils
   pluginData 
   resolveDirJ   /app/applet/node_modules/framer-motion/dist/es/animation/generators/spring   with                     ]x      \5v command
   on-resolve   ids         importerH   /app/applet/node_modules/@radix-ui/react-use-effect-event/dist/index.mjs   key      kind   import-statement	   namespace   file   path!   @radix-ui/react-use-layout-effect
   pluginData 
   resolveDir>   /app/applet/node_modules/@radix-ui/react-use-effect-event/dist   with    8    
      command
   on-resolve   ids         importer>   /app/applet/node_modules/recharts/es6/util/ActiveShapeUtils.js   key      kind   import-statement	   namespace   file   path   lodash/isBoolean
   pluginData 
   resolveDir*   /app/applet/node_modules/recharts/es6/util   with                     Q       M    \5v                            Gh      n          q      `\    ֍    `\    ֍    pQ;    pׅ                        ^    E    HY    ׅ    P     ԅ           Nе        O                                Ե                                                                             X       (                                    $cj    4    ʕcj    ö    ʕcj    ö    ʕcj                                                                 *            Ѕ     Ե    (م    `Xh{                                                                        D                 @        ׅ                                    *                                 п@     }$            pQ;     څ                         v$    E    HY    Xڅ    P     Pׅ                                   *                       Ե                                                                             o       z                                    $cj    d4    ʕcj        ʕcj        ʕcj    n                   oT          ypT         qT                 Ѕ     Ե    ۅ    `Xh{         !sT          Xم                            tT                 D                 @       م     vT                       wT              Յ    `            п@     ~$            pQ;    ܅                       h$    E    HY    ݅    P      څ                                          ~T               Ե                                                                             .       n                                    $cj    O4    ʕcj    ^    ʕcj    ^    ʕcj    V
                   ɆT          ۅ                                    Ѕ     Ե    ޅ    `Xh{         T         T          0fe             T                 D                 @       `܅     T         9T         T         IT                     п@    @s$            pQ;    ߅                        b$    E    HY    ߅    P     ܅            T  `/e     T                              Ե                                                                             s                                           $cj    e4    ʕcj        ʕcj        ʕcj    %                   T          )T           
$                    Ѕ     Ե    8    `Xh{            ?                  ޅ                                          D                 @       ߅     T         T         T         !T         
            п@     |$            pQ;    P                        k$    E    HY    HP    P     `߅           qT         T         T               Ե                                                                                                                        $cj    4    ʕcj    >    ʕcj    >    ʕcj                                                                                Ѕ     Ե    Q    `Xh{                                                                                 D                 @                                                                           p            p    \5vŐ        pQ;    _                            E    HY    ؁_    P                                                                        Ե                                                                                                                        $cj    
24    ʕcj        ʕcj        ʕcj    Z                                                                            Ѕ     Ե    X_    `Xh{                                                                                 D                 @       p                                                                                                .    \5vŐ    ` i  Pl    A!                         i$    E    HY    A!    P                    -o  M FBQTtBQUFBO0FBQUE7QUFB              Ե                                                                             a       O                                    $cj    oF4    ʕcj        ʕcj        ʕcj                NUc7QUFBQTtBQUFB            -o    FBO0FB               Ѕ     Ե    xC!    `Xh{             -o  P       P            y Q Q Q Q QUE7               D                 @       0     ;     M M M d E7QUFBQSxTQTBCQTtBQUVK1       0    -o  F    F          Q      Ʌ    \5v command
   on-resolve   ids         importer>   /app/applet/node_modules/framer-motion/dist/es/utils/delay.mjs   key      kind   import-statement	   namespace   file   path   motion-utils
   pluginData 
   resolveDir4   /app/applet/node_modules/framer-motion/dist/es/utils   with          A                                                               Q      ^<    \5v@           weekday         X<    Z<    Z<                                     era \  &n!  p?b    H@b    H@b                       '3	3            year 000                                             `           month   w	  `    0    0    b    b    b           n!             day &  K$
       p    p                                	       dayPeriod %o                          P      1                                               1                                               Q          o                                   guz                     Q              .            P           guz-KE                                     /            
    /    0*    T*    䢮                                               !       guz_KE  -o          Q                                   @           gv                                          n
            
        *    *    䢮    ?           77         gv              A               `*                                   @      Q                  .    r
    P           gv-IM                                      `            
        *    *    䢮                                               !       gv_IM   -o          A               *                                   P       Q              0p
                               ha                                          n
            
         *    4*    䢮    "           3         ha              A               *                                   ,      1                |`    !d    0       A      _x      \5v command
   on-resolve   ids         importer:   /app/applet/node_modules/recharts/es6/numberAxis/Funnel.js   key      kind   import-statement	   namespace   file   path   clsx
   pluginData 
   resolveDir0   /app/applet/node_modules/recharts/es6/numberAxis   with          !            fe            0      g5    \5v command
   on-resolve   ids         importer-   /app/applet/node_modules/d3-time/src/ticks.js   key      kind   import-statement	   namespace   file   path   d3-array
   pluginData 
   resolveDir$   /app/applet/node_modules/d3-time/src   with               A       1KA'     o          @     i $
                        YKA'                @     i $
                        KA'                @     i $
                        KA'                @     i $
                        KA'    n          @     i $
    	                    KA'    

7          @     i $
                        !LA'                @     i $
    		                  ILA'                @     i $
                        qLA'                @     i $
                        A'                @     i $
                        A'                @     i $
                        )A'                @     i $
                        A'                @     i $
                        YA'                @     i $
                        	A'                @     i $
                        A'                @     i $
                        iA'                 @     i $
    !                    %A'    "            @     i $
    #                    0A'    $            @     i $
    %                    y<A'    &            @     i $
    '                    )HA'    (            @     i $
    )                    	_A'    *            @     i $
    +                    jA'    ,            @     i $
    -                    IvA'    .            @     i $
    /                    ɁA'    0            @     i $
    1                    YA'    2            @     i $
    3                    ٘A'    4            @     i $
    5                    ٯA'    6            @     i $
    7                    YA'    8            @     i $
    9                    YA'    :            @     i $
    ;                    	A'    <            @     i $
    =                    A'    >            @     i $
    ?                    )A'    @            @     i $
    A                    A'    B            @     i $
    C                    YA'    D            @     i $
    E                    IH    F            @     i $
    G                    H    H            @     i $
    I                    4H    J            @     i $
    K                    @H    L            @     i $
    M                    	LH    N            @     i $
    O                    WH    P            @     i $
    Q                    9cH    R            @     i $
    S                    nH    T            @     i $
    U                    izH    V            @     i $
    W                    酬H    X            @     i $
    Y                    iH    Z            @     i $
    [                    霬H    \            @     i $
    ]                    H    ^            @     i $
    _                    H    `            @     i $
    a                    H    b            @     i $
    c                    QʬH    d            @     i $
    e                    լH    f            @     i $
    g                    QH    h            @     i $
    i                    H    j            @     i $
    k                    H    l            @     i $
    m                    	H    n            @     i $
    o                    	H    p            @     i $
    q                    H    r            @     i $
    s                    %H    t            @     i $
    u                    SA'    v            @     i $
    w                    <H    x            @     i $
    y                    H    z            @     yH    {            @     1H    |            @     i $
    }                    SH    ~            @     i $
                        ƭH                @     i $
                        _H                @     i $
                        jH                @     i $
                        IvH                @     i $
                        ɁH                @     i $
                        IH                @     ɘH                @     IH                @           w$            i $
                        i $
    {                                     4p$             ݭH            @     i $
    h                yҭH    {           @     Qg                               `                  `m$            yH                @     i $
                                                             0                                                        p                G@                   `               :;               1                                  K`6                                                       u8@                   `                                  p(                                  AAS,               T԰ 	                    	                   @	               88`	               $@	               
t'T	               	               	                    
               D 
               r   @
                   `
                   
                   
                   
                   
                                                           @                   `                                                                                                               @m                k   @                   `                                                                        (                               <(                g@               

`                                  3               iKAC                                                      AAA;                    @                   `                                 /	                                   p(                                                           @                 `                               ;T               5               /                                               q}@               5/`                                  3                e                                  /                e                 @               ~p`               q"                                                                                                                @                 `                                ;AAA               {                 {                 {                  ;AAA                _$    P+    +    _$                          Q              }    '                   cv-RU                                  q            
    0          D     䢮                                               Q                                                    P       st/es/inP       a      AÅ    \5v command
   on-resolve   ids         importerM   /app/applet/node_modules/framer-motion/dist/es/context/LayoutGroupContext.mjs   key      kind   import-statement	   namespace   file   path   react
   pluginData 
   resolveDir6   /app/applet/node_modules/framer-motion/dist/es/context   with                1                                            !       chr_US                  A          o      &    pr    (o                        п#            p:            
            Ħ    䢮                                               A                                                  P       Q              }    :        `           mua                                          n
            
                 䢮    G           q                         !       mua o  -o          A               Ц                                   p	      Q                                             mua-CM                        0                        
    P    `        䢮                                               !       mua_CM  -o          A               @                                   P       Q                  `                   my                           H             n
            
    `        ԰    䢮               3         my              A                                                  7                                      
    @            䢮                                               !       my_MM   -o  `Xh{  A                                                  P       Q          o                                 my-MM           ѕcj           P             n
            
    p            䢮               & r                        !       mzn o  -o  `Xh{  A                                                  `      Q          o  0        0}               mzn                     a           o  `a    a    ol    0           zh-SG   let/src/pages/Refer.tsx `       A                                      pb     6    @       a      l    \5v command
   on-resolve   ids         importerN   /app/applet/node_modules/framer-motion/dist/es/context/MotionConfigContext.mjs   key      kind   import-statement	   namespace   file   path   react
   pluginData 
   resolveDir6   /app/applet/node_modules/framer-motion/dist/es/context   with                      `     Zl    c    c    pQ;    p
                         d$    E    HY    
    P                                                                         Ե                                                                                                                         $cj    94    ʕcj    E    ʕcj    E    ʕcj    g                                                                            Ѕ     Ե    (
    `Xh{                                                                                 D                 @       `!                                                                            a      `E!    
                                                                                                                                                                                                                                                                                                                                          P              `
                    @#           af-ZA                  !       en_GE                   q          \5v command
   on-resolve   ids         importerR   /app/applet/node_modules/framer-motion/dist/es/animation/animators/waapi/index.mjs   key      kind   import-statement	   namespace   file   path
   motion-dom
   pluginData 
   resolveDirH   /app/applet/node_modules/framer-motion/dist/es/animation/animators/waapi   with    !      2sc    \5vŹ9'n!  iN'n!  2'n!  A2'n!  A흣7  읣7  QU  U  i$U  )%U  i9'n!  :'n!  흣7  QU  U  1'n!  Y2'n!  7  i _~1  ) _~1  a _~1  Q _~1   _~1   _~1   _~1  Yn7  j7  Yj  Q{7L  D  ɽ  AVD  7L        7  QRJ
7  L9  !R.  9S.  R.  Yx?  !+*  ƜI  *  I  *  *  a}I  	U    U  a  㔼  7L  S.  x?  O*  )I  	Xj  Y7L  
  Ix?  9P3  Q              `    D    $    @'           ckb                       ^             n
            
    '    ~    ~    䢮                +                        Q               p~                                   @      &    P       q      B    \5v command
   on-resolve   ids         importerN   /app/applet/node_modules/framer-motion/dist/es/context/MotionContext/index.mjs   key      kind   import-statement	   namespace   file   path   react
   pluginData 
   resolveDirD   /app/applet/node_modules/framer-motion/dist/es/context/MotionContext   with                       E                    `:    p,               @            E    :    ,    P     )                                                                   Ե                 *    p7                                                       {                                    $cj    4    ʕcj    k    ʕcj    k    ʕcj    &                                                                            Ѕ     Ե    (.    :                                                                                   D                 @        ,                                                                                  E                    )     /               @             E    )    X/    P     P,                                                                   Ե                 0-    7                                                %       ^	                                    $cj    )֧4    ʕcj        ʕcj        ʕcj                                                                                Ѕ     Ե    0    x+                                                                                   D                 @       .                                                                                  E                     p,    1               @        @    E    ,    2    P      /                                                                   Ե                 /    7                                                "       
                                    $cj    L<4    ʕcj        ʕcj        ʕcj    (                                                                             Ѕ     Ե    3    (.                                                                                   D                 @       `1                                                                                E    `                 /    4               @            E    X/    4    P     1           Nе        <                                  Ե                 2    @%                                                       
                                    $cj    94    ʕcj    df    ʕcj    df    ʕcj    Xe                                                            *            Ѕ     Ե    86    0                            3                                              D                 @       4                                    *                                     E                    1    `7               @            E    2    7    P     `4                                   *                       Ե                 @5    7                                                       
                                    $cj    e%h4    ʕcj    2    ʕcj    2    ʕcj    R                                    Еcj    g'    Еcj    D%            Ѕ     Ե    9    3                           h6                                                   D                 @       6               o  0n                                2         1       /app/applet/patch_admin_bonus5.cjs            E                    4    @:               @             E    4    x:    P     @7           pQ;    :                        |$            Ե                  8    9                                                       &
                                    $cj    -Hl4    ʕcj    s    ʕcj    s    ʕcj                                        Еcj    a%    ʕcj    Л            Ѕ     Ե    ;    86                                04    ʕcj    P                           D                 @       9                                                          9            1       /app/applet/patch_admin_cleanup.cjs           E                     `7     =               @             E    7    X=    P      :           pQ;    =                        }$            Ե                  ;    <                                         