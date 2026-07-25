const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx').concat(glob.sync('src/**/*.ts'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes("await import('firebase/")) {
    console.log("Fixing dynamic imports in " + file);
    // Find what is imported
    let importsToAdd = new Set();
    const regex = /const\s+\{([^}]+)\}\s*=\s*await\s+import\('firebase\/(firestore|auth)'\);/g;
    
    let match;
    while ((match = regex.exec(content)) !== null) {
      const parts = match[1].split(',').map(s => s.trim());
      parts.forEach(p => importsToAdd.add(p));
    }
    
    // Remove the dynamic imports
    content = content.replace(regex, '');
    
    // Add missing static imports at the top
    if (importsToAdd.size > 0) {
      // Find existing firestore import
      const existingFirestoreMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+'firebase\/firestore';/);
      if (existingFirestoreMatch) {
         let existing = existingFirestoreMatch[1].split(',').map(s => s.trim());
         importsToAdd.forEach(p => {
           if (!existing.includes(p)) existing.push(p);
         });
         content = content.replace(existingFirestoreMatch[0], `import { ${existing.join(', ')} } from 'firebase/firestore';`);
      } else {
         content = `import { ${Array.from(importsToAdd).join(', ')} } from 'firebase/firestore';\n` + content;
      }
    }
    
    fs.writeFileSync(file, content);
  }
});
