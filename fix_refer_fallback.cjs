const fs = require('fs');
let code = fs.readFileSync('src/pages/Refer.tsx', 'utf8');

const helper = `  const getRefBonus = (ref: any) => {
    if (ref.bonusEarned !== undefined && Number(ref.bonusEarned) > 0) return Number(ref.bonusEarned);
    if (ref.level === 3) return 3;
    if (ref.level === 2) return 5;
    return 10;
  };

  const totalReferralEarnings`;

code = code.replace(
  `  const totalReferralEarnings = referrals.reduce((sum, r) => sum + (r.bonusEarned !== undefined ? Number(r.bonusEarned) : 0), 0);`,
  `  const getRefBonus = (ref: any) => {
    if (ref.bonusEarned !== undefined && Number(ref.bonusEarned) > 0) return Number(ref.bonusEarned);
    if (ref.level === 3) return 3;
    if (ref.level === 2) return 5;
    return 10;
  };

  const totalReferralEarnings = referrals.reduce((sum, r) => sum + getRefBonus(r), 0);`
);

code = code.replace(
  `const bonus = ref.bonusEarned !== undefined ? Number(ref.bonusEarned) : 0;`,
  `const bonus = getRefBonus(ref);`
);

code = code.replace(
  `+৳{ref.bonusEarned !== undefined ? ref.bonusEarned : 0}`,
  `+৳{getRefBonus(ref)}`
);

fs.writeFileSync('src/pages/Refer.tsx', code);
