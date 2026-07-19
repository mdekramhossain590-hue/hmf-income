const fs = require('fs');
let code = fs.readFileSync('src/pages/PostJob.tsx', 'utf8');

const target = `const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !profile) return;`;
const replacement = `const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !profile || isSubmitting) return;`;
    
code = code.replace(target, replacement);

fs.writeFileSync('src/pages/PostJob.tsx', code);
console.log("Patched PostJob anti-spam!");
