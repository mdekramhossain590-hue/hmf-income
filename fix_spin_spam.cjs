const fs = require('fs');
let code = fs.readFileSync('src/pages/Spin.tsx', 'utf8');

const spinStart = `const spinWheel = async () => {
    if (!hasMetRequirements()) {`;
const spinReplacement = `const spinWheel = async () => {
    if (isSpinning) return;
    if (!hasMetRequirements()) {`;

code = code.replace(spinStart, spinReplacement);

fs.writeFileSync('src/pages/Spin.tsx', code);
console.log("Patched Spin anti-spam!");
