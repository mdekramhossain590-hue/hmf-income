import re

with open('src/pages/Admin.tsx', 'r') as f:
    code = f.read()

target1 = """    if (activeTab === 'users') {
      unsubs.push(onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(100)), (snap) => {
        setUserList(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
      }, logErr));
    }"""

new1 = """    if (activeTab === 'users') {
      if (userSearchTerm.trim().length > 2) {
        const searchTerm = userSearchTerm.trim().toLowerCase();
        unsubs.push(onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(100)), (snap) => {
          const allDocs = snap.docs.map(d => ({id: d.id, ...d.data()} as any));
          // For a real production app we need Algolia or server-side search.
          // Since Firebase doesn't support full-text search easily, we'll fetch more or rely on exact matches if needed.
          // For now, we still just fetch 100 but we can fetch by email if it looks like an email.
        }, logErr));
      } else {
        unsubs.push(onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(100)), (snap) => {
          setUserList(snap.docs.map(d => ({id: d.id, ...d.data()} as any)));
        }, logErr));
      }
    }"""
# Wait, let's just make a "Search Database" function instead of real-time search for everything, but let's keep it simple. If we limit to 500, it's fast enough and better than 2000. 100 might be too small for the admin to find users.
