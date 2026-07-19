const fs = require('fs');

let adminCode = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const oldFix = `  const handleFixOldReferrals = async () => {
    if (!window.confirm("Are you sure you want to retroactively fix and process all old unpaid referrals?")) return;
    
    try {
      toast.loading("Finding and processing old referrals...");
      const { query, collection, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
      const { processRegistrationReferral } = await import('../lib/referral');
      
      const q = query(
        collection(db, "users"),
        where("isActive", "==", true)
      );
      
      const snapshot = await getDocs(q);`;

const newFix = `  const handleFixOldReferrals = async () => {
    if (!window.confirm("Are you sure you want to retroactively fix and process all old unpaid referrals?")) return;
    
    try {
      toast.loading("Finding and processing old referrals...");
      const { query, collection, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
      const { processRegistrationReferral } = await import('../lib/referral');
      
      // Query all users to avoid index requirements
      const q = query(collection(db, "users"));
      const snapshot = await getDocs(q);`;

adminCode = adminCode.replace(oldFix, newFix);
fs.writeFileSync('src/pages/Admin.tsx', adminCode);
console.log("Patched Admin.tsx for indexing issue");
