const fs = require('fs');
let code = fs.readFileSync('src/pages/MathQuiz.tsx', 'utf8');

const submitStart = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasMetRequirements()) {`;
const submitReplacement = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!hasMetRequirements()) {`;

code = code.replace(submitStart, submitReplacement);

fs.writeFileSync('src/pages/MathQuiz.tsx', code);
console.log("Patched MathQuiz anti-spam!");
