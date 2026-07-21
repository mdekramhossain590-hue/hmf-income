const fs = require('fs');
let code = fs.readFileSync('src/pages/Refer.tsx', 'utf8');

code = code.replace(
  `  const getRefBonus = (ref: any) => {
    if (ref.bonusEarned !== undefined && Number(ref.bonusEarned) > 0) return Number(ref.bonusEarned);
    if (ref.level === 3) return 3;
    if (ref.level === 2) return 5;
    return 10;
  };`,
  `  const getRefBonus = (ref: any) => {
    let raw = ref.bonusEarned !== undefined ? Number(ref.bonusEarned) : 0;
    if (raw > 0) {
       // Cap historical bugs where old referrals got 20/10/5 instead of 10/5/3
       if (ref.level === 1 && raw === 20) return 10;
       if (ref.level === 2 && raw === 10) return 5;
       if (ref.level === 3 && raw === 5) return 3;
       return raw;
    }
    if (ref.level === 3) return 3;
    if (ref.level === 2) return 5;
    return 10;
  };`
);

fs.writeFileSync('src/pages/Refer.tsx', code);
