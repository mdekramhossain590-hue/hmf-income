const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all 'firebase/firestore' with '@/src/lib/mock-firestore'
    content = content.replace(/['"]firebase\/firestore['"]/g, "'@/src/lib/mock-firestore'");
    content = content.replace(/['"]firebase\/app['"]/g, "'@/src/lib/mock-app'");
    content = content.replace(/['"]firebase\/auth['"]/g, "'@/src/lib/mock-auth'");
    
    // Also fix the previous bad replace I did from '@/lib/...'
    content = content.replace(/['"]@\/lib\/mock-firestore['"]/g, "'@/src/lib/mock-firestore'");
    content = content.replace(/['"]@\/lib\/mock-auth['"]/g, "'@/src/lib/mock-auth'");
    content = content.replace(/['"]@\/lib\/mock-app['"]/g, "'@/src/lib/mock-app'");

    fs.writeFileSync(filePath, content);
  }
});
