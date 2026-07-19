const fs = require('fs');
let code = fs.readFileSync('src/pages/TaskDetail.tsx', 'utf8');

const confirmSubmitStart = `const confirmSubmit = async () => {
    setSubmitting(true);`;
const confirmSubmitReplacement = `const confirmSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);`;

code = code.replace(confirmSubmitStart, confirmSubmitReplacement);

fs.writeFileSync('src/pages/TaskDetail.tsx', code);
console.log("Patched TaskDetail anti-spam!");
