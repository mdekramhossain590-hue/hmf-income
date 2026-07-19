const fs = require('fs');
let code = fs.readFileSync('src/pages/Recharge.tsx', 'utf8');

const target = `const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;`;
const replacement = `const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || loading) return;`;

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/Recharge.tsx', code);
console.log("Patched Recharge anti-spam!");
