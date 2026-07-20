const fs = require('fs');
let code = fs.readFileSync('src/components/AuthProvider.tsx', 'utf8');

code = code.replace(
  `isActive?: boolean;`,
  `isActive?: boolean;
  referralBonusPaid?: boolean;`
);

code = code.replace(
  `telegramUrl?: string;`,
  `telegramUrl?: string;
  adsViewLink?: string;
  adsViewText?: string;`
);

fs.writeFileSync('src/components/AuthProvider.tsx', code);
console.log("Patched AuthProvider.tsx types");
