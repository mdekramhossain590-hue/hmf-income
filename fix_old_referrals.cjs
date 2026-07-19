const fs = require('fs');

let adminCode = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const fixFunction = `  const handleFixOldReferrals = async () => {
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
  };

  useEffect(() => {`;

adminCode = adminCode.replace(
  `  useEffect(() => {`,
  fixFunction
);

const fixButton = `            <button
              onClick={handleDeleteDuplicateAdmins}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
            >
              Delete Duplicate Admins
            </button>
            <button
              onClick={handleFixOldReferrals}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
            >
              Fix Old Referrals
            </button>`;

adminCode = adminCode.replace(
  `<button
              onClick={handleDeleteDuplicateAdmins}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
            >
              Delete Duplicate Admins
            </button>`,
  fixButton
);

fs.writeFileSync('src/pages/Admin.tsx', adminCode);
console.log("Patched Admin.tsx for old referrals");
