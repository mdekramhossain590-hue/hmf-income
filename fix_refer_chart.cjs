const fs = require('fs');
let code = fs.readFileSync('src/pages/Refer.tsx', 'utf8');

code = code.replace(
  `const bonus = Number(ref.bonusEarned) || 0;`,
  `const bonus = Number(ref.bonusEarned) || 10;`
);

fs.writeFileSync('src/pages/Refer.tsx', code);
