const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const target = `const handleSaveName = async () => {
    if (!newName.trim() || !auth.currentUser) return;`;
const replacement = `const handleSaveName = async () => {
    if (!newName.trim() || !auth.currentUser || savingName) return;`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/Profile.tsx', code);
console.log("Patched Profile anti-spam!");
