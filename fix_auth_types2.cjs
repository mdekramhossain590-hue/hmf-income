const fs = require('fs');
let code = fs.readFileSync('src/components/AuthProvider.tsx', 'utf8');

code = code.replace(
  `export interface UserProfile {`,
  `export interface UserProfile {
  uid?: string;`
);

fs.writeFileSync('src/components/AuthProvider.tsx', code);
console.log("Patched AuthProvider.tsx uid");
