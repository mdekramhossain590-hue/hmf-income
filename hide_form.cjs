const fs = require('fs');
let code = fs.readFileSync('src/pages/TaskDetail.tsx', 'utf8');

const target = `{(!job.allowedCompletions ||
        submissionCount < job.allowedCompletions) &&
        (!job.userLimit || submissionCount < job.userLimit) ? (`;

const rep = `{(!job.allowedCompletions ||
        submissionCount < job.allowedCompletions) &&
        (!job.userLimit || submissionCount < job.userLimit) &&
        previousSubmission?.status !== "pending" ? (`;

code = code.replace(target, rep);

fs.writeFileSync('src/pages/TaskDetail.tsx', code);
console.log("Patched form visibility!");
