const fs = require('fs');
let code = fs.readFileSync('src/pages/Payment.tsx', 'utf8');

const freeStart = `const handleFreeActivation = async () => {
    if (!auth.currentUser) return;
    if (settings.mode !== 'free') {
      toast.error("Free activation is currently disabled.");
      return;
    }
    setSubmitting(true);`;
const freeReplacement = `const handleFreeActivation = async () => {
    if (!auth.currentUser || submitting) return;
    if (settings.mode !== 'free') {
      toast.error("Free activation is currently disabled.");
      return;
    }
    setSubmitting(true);`;

code = code.replace(freeStart, freeReplacement);


const handlePaymentStart = `const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;`;
const handlePaymentReplacement = `const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || submitting) return;`;
    
code = code.replace(handlePaymentStart, handlePaymentReplacement);

fs.writeFileSync('src/pages/Payment.tsx', code);
console.log("Patched Payment anti-spam 2!");
