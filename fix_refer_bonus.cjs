const fs = require('fs');
let code = fs.readFileSync('src/pages/Refer.tsx', 'utf8');

code = code.replace(
  `+৳{ref.bonusEarned}`,
  `+৳{ref.bonusEarned || 0}`
);

fs.writeFileSync('src/pages/Refer.tsx', code);
