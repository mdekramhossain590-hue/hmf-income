const fs = require('fs');

// Fix Admin.tsx
let adminCode = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
adminCode = adminCode.replace(/toast\.dismiss\(loadingToast\);/g, '// toast.dismiss(loadingToast);');
adminCode = adminCode.replace(/balancesReferral/g, '"balances.referral"');
adminCode = adminCode.replace(/e\.message/g, '(e as any).message');
fs.writeFileSync('src/pages/Admin.tsx', adminCode);

// Fix Dashboard.tsx
let dashCode = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
dashCode = dashCode.replace(
  `import { getCachedQuery } from "../lib/cache";\nimport { processRegistrationReferral } from "../lib/referral";`,
  `import { getCachedQuery } from "../lib/cache";`
);
dashCode = dashCode.replace(
  `import { getCachedQuery } from "../lib/cache";`,
  `import { getCachedQuery } from "../lib/cache";\nimport { processRegistrationReferral } from "../lib/referral";`
);
fs.writeFileSync('src/pages/Dashboard.tsx', dashCode);

// Fix TaskDetail.tsx
let taskCode = fs.readFileSync('src/pages/TaskDetail.tsx', 'utf8');
taskCode = taskCode.replace(
  `userId: auth.currentUser.uid`,
  `userId: auth.currentUser?.uid || ""`
);
fs.writeFileSync('src/pages/TaskDetail.tsx', taskCode);

console.log("Patched other issues");
