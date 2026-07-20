const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const fixBonusFunc = `  const handleFixBonusAmounts = async () => {
    try {
      toast.success("Fixing bonus amounts started...");
      const { collectionGroup, getDocs, updateDoc, doc, increment, setDoc } = await import('firebase/firestore');
      const q = collectionGroup(db, 'referrals');
      const snap = await getDocs(q);
      let fixedCount = 0;
      
      for (const rDoc of snap.docs) {
        const data = rDoc.data();
        const pathParts = rDoc.ref.path.split('/');
        const userId = pathParts[1];
        
        let diff = 0;
        let newBonus = 0;
        
        if (data.level === 1 && data.bonusEarned === 20) {
          diff = 10; newBonus = 10;
        } else if (data.level === 2 && data.bonusEarned === 10) {
          diff = 5; newBonus = 5;
        } else if (data.level === 3 && data.bonusEarned === 5) {
          diff = 2; newBonus = 3;
        }
        
        if (diff > 0) {
           await updateDoc(rDoc.ref, { bonusEarned: newBonus });
           await updateDoc(doc(db, "users", userId), {
             "balances.referral": increment(-diff)
           });
           await setDoc(doc(db, "leaderboard", userId), {
             totalIncome: increment(-diff)
           }, { merge: true });
           fixedCount++;
        }
      }
      toast.success(\`Fixed \${fixedCount} referrals!\`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleFixOldReferrals`;

code = code.replace(`  const handleFixOldReferrals`, fixBonusFunc);

const fixBonusButton = `            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleFixBonusAmounts(); }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold ml-2"
            >
              Fix Bonus Amounts
            </button>
            <div className="relative w-full sm:w-72">`;

code = code.replace(`            <div className="relative w-full sm:w-72">`, fixBonusButton);

fs.writeFileSync('src/pages/Admin.tsx', code);
