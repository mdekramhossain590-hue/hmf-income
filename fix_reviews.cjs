const fs = require('fs');
let code = fs.readFileSync('src/pages/Reviews.tsx', 'utf8');

const oldJobsQuery = `const jobsQuery = query(collection(db, "jobs"), orderBy("createdAt", "desc"), limit(50));`;
const newJobsQuery = `const jobsQuery = query(collection(db, "jobs"), orderBy("createdAt", "desc"), limit(500));`;

if (code.includes(oldJobsQuery)) {
  code = code.replace(oldJobsQuery, newJobsQuery);
  fs.writeFileSync('src/pages/Reviews.tsx', code);
}
