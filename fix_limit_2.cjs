const fs = require('fs');
let code = fs.readFileSync('src/pages/TaskDetail.tsx', 'utf8');

code = code.replace(
  '{(!job.allowedCompletions ||\n        submissionCount < job.allowedCompletions) &&\n        (!job.userLimit || submissionCount < job.userLimit) ? (',
  '{(!job.allowedCompletions || (job.completedCount || 0) < job.allowedCompletions) && (!job.userLimit || submissionCount < job.userLimit) ? ('
);

fs.writeFileSync('src/pages/TaskDetail.tsx', code);
