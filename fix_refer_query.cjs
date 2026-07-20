const fs = require('fs');
let code = fs.readFileSync('src/pages/Refer.tsx', 'utf8');

code = code.replace(
  `        const q = query(
          collection(db, "users", auth.currentUser!.uid, "referrals"),
          orderBy("createdAt", "desc"),
          limit(20)
        );`,
  `        const q = query(
          collection(db, "users", auth.currentUser!.uid, "referrals")
        );`
);

code = code.replace(
  `setReferrals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));`,
  `const refs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        refs.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return timeB - timeA;
        });
        setReferrals(refs);`
);

code = code.replace(
  `{ref.createdAt?.toDate ? ref.createdAt.toDate().toLocaleDateString() : 'Just now'}`,
  `{ref.createdAt?.toDate ? ref.createdAt.toDate().toLocaleString() : (ref.createdAt ? new Date(ref.createdAt).toLocaleString() : 'Just now')}`
);

fs.writeFileSync('src/pages/Refer.tsx', code);
console.log("Patched Refer.tsx query and date");
