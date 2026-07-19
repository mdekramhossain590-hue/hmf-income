const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const oldFunc = `  const handleFixOldReferrals = async () => {
    if (!window.confirm("Are you sure you want to retroactively fix and process all old unpaid referrals?")) return;
    
    try {
      toast.loading("Finding and processing old referrals...");
      const { query, collection, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
      const { processRegistrationReferral } = await import('../lib/referral');
      
      const q = query(
        collection(db, "users"),
        where("isActive", "==", true),
        where("referralBonusPaid", "==", false)
      );
      
      const snapshot = await getDocs(q);
      let processed = 0;
      
      for (const userDoc of snapshot.docs) {
        const data = userDoc.data();
        if (data.usedReferCode && data.usedReferCode !== 'none') {
          // Temporarily fix the usedReferCode if it's not uppercase
          const sanitizedCode = data.usedReferCode.replace(/[\\u200B-\\u200D\\uFEFF\\s]/g, '').trim().toUpperCase();
          if (data.usedReferCode !== sanitizedCode) {
            await updateDoc(doc(db, "users", userDoc.id), { usedReferCode: sanitizedCode });
          }
          await processRegistrationReferral(userDoc.id);
          processed++;
        }
      }
      
      toast.dismiss();
      toast.success(\`Successfully processed \${processed} missed referrals.\`);
      loadData(true);
    } catch (e) {
      toast.dismiss();
      toast.error("Failed to process old referrals.");
      console.error(e);
    }
  };`;

const newFunc = `  const handleFixOldReferrals = async () => {
    if (!window.confirm("Are you sure you want to retroactively fix and process all old unpaid referrals?")) return;
    
    try {
      toast.loading("Finding and processing old referrals...");
      const { query, collection, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
      const { processRegistrationReferral } = await import('../lib/referral');
      
      const q = query(
        collection(db, "users"),
        where("isActive", "==", true)
      );
      
      const snapshot = await getDocs(q);
      let processed = 0;
      let alreadyPaid = 0;
      
      for (const userDoc of snapshot.docs) {
        const data = userDoc.data();
        
        if (data.referralBonusPaid === true) {
          alreadyPaid++;
          continue;
        }
        
        if (data.usedReferCode && data.usedReferCode !== 'none') {
          // Temporarily fix the usedReferCode if it's not uppercase
          const sanitizedCode = data.usedReferCode.replace(/[\\u200B-\\u200D\\uFEFF\\s]/g, '').trim().toUpperCase();
          if (data.usedReferCode !== sanitizedCode) {
            await updateDoc(doc(db, "users", userDoc.id), { usedReferCode: sanitizedCode });
          }
          await processRegistrationReferral(userDoc.id);
          processed++;
        }
      }
      
      toast.dismiss();
      toast.success(\`Successfully processed \${processed} missed referrals (skipped \${alreadyPaid} paid).\`);
      loadData(true);
    } catch (e) {
      toast.dismiss();
      toast.error("Failed to process old referrals.");
      console.error(e);
    }
  };`;

code = code.replace(oldFunc, newFunc);
fs.writeFileSync('src/pages/Admin.tsx', code);
console.log("Patched Admin.tsx");
