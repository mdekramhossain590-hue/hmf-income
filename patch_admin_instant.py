import re

with open('src/pages/Admin.tsx', 'r') as f:
    code = f.read()

target = """  const loadData = useCallback(async (forceRef = false) => {
    if (!isAdmin) return;
    try {
      if (['jobs', 'submissions'].includes(activeTab)) {
        const jS = await getCachedQuery(query(collection(db, "jobs"), orderBy("createdAt", "desc"), limit(500)), "admin_jobs", forceRef);
        setJobs(jS.docs.map(d => ({id: d.id, ...d.data()} as any)));
        const sS = await getCachedQuery(query(collection(db, "submissions"), orderBy("submittedAt", "desc"), limit(500)), "admin_submissions", forceRef);
        setSubmissions(sS.docs.map(d => ({id: d.id, ...d.data()} as any)));
      }
      if (['requests', 'dashboard'].includes(activeTab)) {
        const pS = await getCachedQuery(query(collection(db, "payment_requests"), orderBy("createdAt", "desc"), limit(2000)), "admin_payment_requests", forceRef);
        setPaymentRequests(pS.docs.map(d => ({id: d.id, ...d.data()} as any)));
      }
      if (activeTab === 'users') {
        const uS = await getCachedQuery(query(collection(db, "users"), orderBy("createdAt", "desc")), "admin_users", forceRef);
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
  }, [isAdmin, activeTab]);"""

new_code = """  const loadData = useCallback(async (forceRef = false) => {
    // Left empty since we will use onSnapshot
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    
    const unsubs: any[] = [];
    
    // Real-time listeners for instant loading
    unsubs.push(onSnapshot(query(collection(db, "jobs"), orderBy("createdAt", "desc"), limit(500)), (snap) => {
      setJobs(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
    }));
    
    unsubs.push(onSnapshot(query(collection(db, "submissions"), orderBy("submittedAt", "desc"), limit(500)), (snap) => {
      setSubmissions(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
    }));
    
    unsubs.push(onSnapshot(query(collection(db, "payment_requests"), orderBy("createdAt", "desc"), limit(2000)), (snap) => {
      setPaymentRequests(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
    }));
    
    // Limit users to 2000 to prevent massive read spikes and slow loading
    unsubs.push(onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(2000)), (snap) => {
      setUserList(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
    }));
    
    unsubs.push(onSnapshot(query(collection(db, "drive_offers"), limit(50)), (snap) => {
      setAdminOffers(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
    }));
    
    unsubs.push(onSnapshot(query(collection(db, "courses"), limit(50)), (snap) => {
      setAdminCourses(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
    }));
    
    unsubs.push(onSnapshot(query(collection(db, "giftCodes"), orderBy("createdAt", "desc"), limit(100)), (snap) => {
      setGiftCodes(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
    }));
    
    return () => unsubs.forEach(u => u());
  }, [isAdmin]);"""

if target in code:
    code = code.replace(target, new_code)
    with open('src/pages/Admin.tsx', 'w') as f:
        f.write(code)
    print("Patched successfully")
else:
    print("Target not found")

