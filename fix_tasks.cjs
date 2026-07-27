const fs = require('fs');
let code = fs.readFileSync('src/pages/Tasks.tsx', 'utf8');

code = code.replace(/limit\(100\)/g, 'limit(500)');
fs.writeFileSync('src/pages/Tasks.tsx', code);
