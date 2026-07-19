const fs = require('fs');
let code = fs.readFileSync('src/pages/GiftCode.tsx', 'utf8');

const claimStart = `const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (code.trim().length < 5) {
      toast.error('Invalid Gift Code');
      return;
    }

    setLoading(true);`;
    
const claimReplacement = `const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || loading) return;
    if (code.trim().length < 5) {
      toast.error('Invalid Gift Code');
      return;
    }

    setLoading(true);`;

code = code.replace(claimStart, claimReplacement);

fs.writeFileSync('src/pages/GiftCode.tsx', code);
console.log("Patched GiftCode anti-spam!");
