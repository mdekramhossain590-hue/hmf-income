const fs = require('fs');
let code = fs.readFileSync('src/pages/TaskDetail.tsx', 'utf8');

code = code.replace(/\{\(!job\.allowedCompletions \|\|\s*submissionCount < job\.allowedCompletions\) &&\s*\(!job\.userLimit \|\| submissionCount < job\.userLimit\) \? \(/g, 
'{(!job.allowedCompletions || (job.completedCount || 0) < job.allowedCompletions) && (!job.userLimit || submissionCount < job.userLimit) ? (');

fs.writeFileSync('src/pages/TaskDetail.tsx', code);
