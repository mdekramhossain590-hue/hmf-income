const fs = require('fs');
let code = fs.readFileSync('src/pages/TaskDetail.tsx', 'utf8');

// 1. Remove the pending check in handleSubmit
const pendingCheck = `    if (previousSubmission && previousSubmission.status === 'pending') {
      toast.error("You already have a pending submission for this task.");
      return;
    }`;
code = code.replace(pendingCheck, '');

// 2. Increment submission count
code = code.replace(
  'setPreviousSubmission(subData);',
  'setPreviousSubmission(subData);\n      setSubmissionCount(prev => prev + 1);'
);

// 3. Remove the UI checks
code = code.replace(/&&\s*previousSubmission\?\.status !== "pending"/g, '');

fs.writeFileSync('src/pages/TaskDetail.tsx', code);
console.log("Fixes applied");
