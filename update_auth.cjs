const fs = require('fs');
let code = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

code = code.replace(/balances: \{ main: 0, bonus: 10, referral: 0, partner: 0 \}/g, 'balances: { main: 0, bonus: 0, referral: 0, partner: 0 }');
code = code.replace(/bonus: 10,/g, 'bonus: 0,');
code = code.replace(/totalIncome: 10,/g, 'totalIncome: 0,');

fs.writeFileSync('src/pages/Auth.tsx', code);
