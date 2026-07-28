const fs = require('fs');

function fix(file) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('getDoc,')) {
    code = code.replace(/getDocs, /g, 'getDocs, getDoc, ');
  }
  fs.writeFileSync(file, code);
}
fix('src/pages/PostJob.tsx');
fix('src/pages/Drive.tsx');
