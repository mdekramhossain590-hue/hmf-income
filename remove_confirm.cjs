const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

code = code.replace(
  'if (!window.confirm("Are you sure you want to delete all accounts with email mdekramhossain590@gmail.com EXCEPT the one with referral code NN743526?")) return;',
  ''
);

code = code.replace(
  'if (!window.confirm("Are you sure you want to retroactively fix and process all old unpaid referrals?")) return;',
  ''
);

fs.writeFileSync('src/pages/Admin.tsx', code);
console.log("Patched window.confirm!");
