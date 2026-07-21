const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const newFixBonusFunc = `  const handleFixBonusAmounts = async () => {
    try {
      toast.success("Fixing bonus amounts started...");
      const { collection, getDocs, updateDoc, doc, increment, setDoc } = await import('firebase/firestore');
      
      const q = collection(db, 'users');
      const snap = await getDocs(q);
      let fixedCount = 0;
      
      for (const userDoc of snap.docs) {
        const userId = userDoc.id;
        const refSnap = await getDocs(collection(db, \`users/\${userId}/referrals\`));
        
        for (const rDoc of refSnap.docs) {
          const data = rDoc.data();
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
      }
      toast.success(\`Fixed \${fixedCount} referrals!\`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };`;

// Replace the old handleFixBonusAmounts function entirely
code = code.replace(/const handleFixBonusAmounts = async \(\) => \{[\s\S]*?\} catch \(e: any\) \{[\s\S]*?toast\.error\(e\.message\);[\s\S]*?\}[\s\S]*?\};/, newFixBonusFunc);

fs.writeFileSync('src/pages/Admin.tsx', code);
