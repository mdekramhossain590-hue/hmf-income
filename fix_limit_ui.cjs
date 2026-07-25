const fs = require('fs');
let code = fs.readFileSync('src/pages/TaskDetail.tsx', 'utf8');

// For the Account Sell view
code = code.replace(
  '{job.allowedCompletions || "Unl."}',
  '{!job.userLimit ? "Unl." : job.userLimit}'
);

fs.writeFileSync('src/pages/TaskDetail.tsx', code);
console.log("Fixed Limit UI text in TaskDetail.tsx");
