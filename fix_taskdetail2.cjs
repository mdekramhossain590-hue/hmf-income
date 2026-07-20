const fs = require('fs');
let code = fs.readFileSync('src/pages/TaskDetail.tsx', 'utf8');

code = code.replace(
  `userEmail: (auth.currentUser.email || "Unknown").slice(0, 150),`,
  `userEmail: (auth.currentUser?.email || "Unknown").slice(0, 150),`
);

fs.writeFileSync('src/pages/TaskDetail.tsx', code);
