const fs = require('fs');
let code = fs.readFileSync('src/pages/Refer.tsx', 'utf8');

code = code.replace(
  `const totalReferralEarnings = referrals.reduce((sum, r) => sum + (Number(r.bonusEarned) || 10), 0);`,
  `const totalReferralEarnings = referrals.reduce((sum, r) => sum + (r.bonusEarned !== undefined ? Number(r.bonusEarned) : 0), 0);`
);

code = code.replace(
  `+৳{ref.bonusEarned || 10}`,
  `+৳{ref.bonusEarned !== undefined ? ref.bonusEarned : 0}`
);

code = code.replace(
  `const bonus = Number(ref.bonusEarned) || 10;`,
  `const bonus = ref.bonusEarned !== undefined ? Number(ref.bonusEarned) : 0;`
);

fs.writeFileSync('src/pages/Refer.tsx', code);
