const fs = require('fs');
let code = fs.readFileSync('src/pages/Refer.tsx', 'utf8');

code = code.replace(
  `const totalReferralEarnings = profile?.balances?.referral || 0;`,
  `const totalReferralEarnings = referrals.reduce((sum, r) => sum + (Number(r.bonusEarned) || 10), 0);`
);

code = code.replace(
  `+৳{ref.bonusEarned || 0}`,
  `+৳{ref.bonusEarned || 10}`
);

fs.writeFileSync('src/pages/Refer.tsx', code);
