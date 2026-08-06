import re

with open('src/pages/Admin.tsx', 'r') as f:
    code = f.read()

target1 = """    if (activeTab === 'users') {
      unsubs.push(onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(100)), (snap) => {
        setUserList(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
      }, logErr));
    }"""

new1 = """    if (activeTab === 'users') {
      unsubs.push(onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(100)), (snap) => {
        if (!userSearchTerm) {
          setUserList(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
        }
      }, logErr));
    }"""

code = code.replace(target1, new1)

target2 = """              <input
                type="text"
                placeholder="Search by name, email or ID..."
                value={userSearchTerm}
                onChange={e => setUserSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all"
              />"""

new2 = """              <input
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
                     } catch(err) { console.error(err); }
                  } else if (e.key === 'Enter' && userSearchTerm.trim().length === 0) {
                     const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(100)));
                     setUserList(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
                  }
                }}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all"
              />"""

code = code.replace(target2, new2)

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(code)

print("Patched admin search")
