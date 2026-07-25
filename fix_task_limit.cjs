const fs = require('fs');
let code = fs.readFileSync('src/pages/TaskDetail.tsx', 'utf8');

// The issue is comparing submissionCount (user's count) with allowedCompletions (global limit)
// We will change it to only check userLimit for the user, and check completedCount for global limit.

// 1. Fix the top limit text showing allowedCompletions instead of userLimit
// We already fixed Limit text to show userLimit. Wait, Total Slots is also there.
code = code.replace(
  '{!job.allowedCompletions ? "Unlimited" : `${job.allowedCompletions} Total`}',
  '{!job.allowedCompletions ? "Unlimited" : `${job.allowedCompletions} Total`}'
);

// 2. Fix the condition for showing the submission form
code = code.replace(
  '{(!job.allowedCompletions ||\n        submissionCount < job.allowedCompletions) &&\n        (!job.userLimit || submissionCount < job.userLimit) ? (',
  '{(!job.allowedCompletions || (job.completedCount || 0) < job.allowedCompletions) &&\n        (!job.userLimit || submissionCount < job.userLimit) ? ('
);

code = code.replace(
  '{(!job.allowedCompletions ||\n            submissionCount < job.allowedCompletions) &&\n          (!job.userLimit || submissionCount < job.userLimit)  ? (',
  '{(!job.allowedCompletions || (job.completedCount || 0) < job.allowedCompletions) && (!job.userLimit || submissionCount < job.userLimit) ? ('
);

// 3. Fix the top grid where we show remaining limit, just to be sure
// Actually, earlier we did:
// <p className="text-base font-bold text-slate-800 dark:text-white tracking-tight">
//   {!job.userLimit ? "Unl." : job.userLimit}
// </p>

fs.writeFileSync('src/pages/TaskDetail.tsx', code);
console.log("Fix applied");
