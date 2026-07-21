const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const newFixBonusFunc = `  const handleFixBonusAmounts = async () => {
    try {
      toast.success("Fixing bonus amounts started...");
      const { collection, getDocs, updateDoc, doc, increment, setDoc } = await import('firebase/firestore');
      
      let fixedCount = 0;
      let permissionErrors = 0;
      
      for (const user of userList) {
        const userId = user.id;
        try {
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
               try {
                 await updateDoc(rDoc.ref, { bonusEarned: newBonus }).catch(e => console.warn(e));
                 
                 await updateDoc(doc(db, "users", userId), {
                   "balances.referral": increment(-diff)
                 }).catch(e => console.warn(e));
                 
                 await setDoc(doc(db, "leaderboard", userId), {
                   totalIncome: increment(-diff)
                 }, { merge: true }).catch(e => console.warn(e));
                 
                 fixedCount++;
               } catch(err) {
                 console.warn("Could not fix ref doc", err);
                 permissionErrors++;
               }
            }
          }
        } catch (e) {
           permissionErrors++;
           console.error("Failed for user", userId, e);
        }
      }
      
      if (fixedCount > 0) {
        toast.success(\`Fixed \${fixedCount} referrals!\`);
        loadData(true);
      } else if (permissionErrors > 0) {
        toast.error(\`Permission denied on \${permissionErrors} operations.\`);
      } else {
        toast.success("No referrals needed fixing.");
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };`;

code = code.replace(/const handleFixBonusAmounts = async \(\) => \{[\s\S]*?\} catch \(e: any\) \{[\s\S]*?toast\.error\(e\.message\);[\s\S]*?\}[\s\S]*?\};/, newFixBonusFunc);

fs.writeFileSync('src/pages/Admin.tsx', code);
