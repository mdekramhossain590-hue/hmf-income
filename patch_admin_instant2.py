import re

with open('src/pages/Admin.tsx', 'r') as f:
    code = f.read()

target = """  useEffect(() => {
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

new_code = """  useEffect(() => {
    if (!isAdmin) return;
    
    const unsubs: any[] = [];
    const logErr = (err: any) => console.warn("Admin listener error:", err);
    
    // Real-time listeners for instant loading
    unsubs.push(onSnapshot(query(collection(db, "jobs"), orderBy("createdAt", "desc"), limit(500)), (snap) => {
      setJobs(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
    }, logErr));
    
    unsubs.push(onSnapshot(query(collection(db, "submissions"), orderBy("submittedAt", "desc"), limit(500)), (snap) => {
      setSubmissions(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
    }, logErr));
    
    unsubs.push(onSnapshot(query(collection(db, "payment_requests"), orderBy("createdAt", "desc"), limit(2000)), (snap) => {
      setPaymentRequests(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
    }, logErr));
    
    // Limit users to 2000 to prevent massive read spikes and slow loading
    unsubs.push(onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(2000)), (snap) => {
      setUserList(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
    }, logErr));
    
    unsubs.push(onSnapshot(query(collection(db, "drive_offers"), limit(50)), (snap) => {
      setAdminOffers(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
    }, logErr));
    
    unsubs.push(onSnapshot(query(collection(db, "courses"), limit(50)), (snap) => {
      setAdminCourses(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
    }, logErr));
    
    unsubs.push(onSnapshot(query(collection(db, "giftCodes"), orderBy("createdAt", "desc"), limit(100)), (snap) => {
      setGiftCodes(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
    }, logErr));
    
    return () => unsubs.forEach(u => u());
  }, [isAdmin]);"""

if target in code:
    code = code.replace(target, new_code)
    with open('src/pages/Admin.tsx', 'w') as f:
        f.write(code)
    print("Patched successfully")
else:
    print("Target not found")

