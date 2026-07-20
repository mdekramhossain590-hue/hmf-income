const fs = require('fs');
let code = fs.readFileSync('src/pages/Refer.tsx', 'utf8');

code = code.replace(
  `const totalReferralEarnings = referrals.reduce((sum, r) => sum + getRefBonus(r), 0);`,
  `const totalReferralEarnings = profile?.balances?.referral || 0;`
);

fs.writeFileSync('src/pages/Refer.tsx', code);
