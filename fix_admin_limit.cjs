const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

code = code.replace(/const jS = await getCachedQuery\(query\(collection\(db, "jobs"\), orderBy\("createdAt", "desc"\), limit\(50\)\), "admin_jobs", forceRef\);/g, 'const jS = await getCachedQuery(query(collection(db, "jobs"), orderBy("createdAt", "desc"), limit(500)), "admin_jobs", forceRef);');

code = code.replace(/const sS = await getCachedQuery\(query\(collection\(db, "submissions"\), orderBy\("submittedAt", "desc"\), limit\(50\)\), "admin_submissions", forceRef\);/g, 'const sS = await getCachedQuery(query(collection(db, "submissions"), orderBy("submittedAt", "desc"), limit(500)), "admin_submissions", forceRef);');

fs.writeFileSync('src/pages/Admin.tsx', code);
