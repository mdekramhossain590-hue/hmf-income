const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

code = code.replace(
  `const userUpdates = {
                    totalReferrals: increment(level === 0 ? 1 : 0)
                  };`,
  `const userUpdates: any = {
                    totalReferrals: increment(level === 0 ? 1 : 0)
                  };`
);

code = code.replace(/toast\.dismiss\(loadingToast\);/g, ''); // just remove them to be safe if they are still there

fs.writeFileSync('src/pages/Admin.tsx', code);
console.log("Fixed Admin.tsx userUpdates type");
