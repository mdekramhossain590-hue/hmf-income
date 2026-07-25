const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Replace all occurrences of `await loadData(true);` with `clearCache(); await loadData(true);`
// But avoid doing it if it already has clearCache() right before it.
code = code.replace(/toast\.success\(([^;]+)\);\s+await loadData\(true\);/g, 'toast.success($1);\n          clearCache();\n          await loadData(true);');

// Handle cases where loadData is called without await or toast
code = code.replace(/toast\.success\(([^;]+)\);\s+loadData\(true\);/g, 'toast.success($1);\n          clearCache();\n          loadData(true);');

fs.writeFileSync('src/pages/Admin.tsx', code);
console.log("Patched clearCache");
