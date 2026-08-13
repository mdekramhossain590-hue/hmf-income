import re
with open("src/pages/Admin.tsx", "r") as f:
    code = f.read()

replacement = """  const fixExploit = async () => {
    toast.info("Fixing exploit in progress... Please wait.");
    console.log("Starting fixExploit");
    try {
      const { db } = await import('../lib/firebase');
      const { collection, getDocs, doc, updateDoc, query, where, getDoc, deleteDoc } = await import('firebase/firestore');
      
      const usersSnap = await getDocs(collection(db, 'users'));
      console.log("Total users fetched:", usersSnap.docs.length);
      toast.success(`Fetched ${usersSnap.docs.length} users. Processing...`);

      let fixedCount = 0;

      for (const userDoc of usersSnap.docs) {
        const data = userDoc.data();
        let spins = data.totalSpinsPlayed || 0;
        let maths = data.totalMathsPlayed || 0;
        
        // Get transactions for everyone to check real counts
        const txSnap = await getDocs(collection(db, `users/${userDoc.id}/transactions`));
        
        let spinTxs = [];
        let mathTxs = [];
        
        txSnap.forEach(tx => {
          const d = tx.data();
          if (d.status === 'approved (spin)') spinTxs.push({ id: tx.id, ...d });
          if (d.status === 'approved (math)') mathTxs.push({ id: tx.id, ...d });
        });
        
        if (spins > 5 || maths > 5 || spinTxs.length > 5 || mathTxs.length > 5) {
          let deduction = 0;
          
          spinTxs.sort((a, b) => ((a.createdAt?.toMillis ? a.createdAt.toMillis() : 0)) - ((b.createdAt?.toMillis ? b.createdAt.toMillis() : 0)));
          mathTxs.sort((a, b) => ((a.createdAt?.toMillis ? a.createdAt.toMillis() : 0)) - ((b.createdAt?.toMillis ? b.createdAt.toMillis() : 0)));
          
          const extraSpins = spinTxs.slice(5);
          const extraMaths = mathTxs.slice(5);
          
          for (const tx of extraSpins) {
            deduction += Number(tx.amount || 0);
            await deleteDoc(doc(db, `users/${userDoc.id}/transactions`, tx.id));
          }
          
          for (const tx of extraMaths) {
            deduction += Number(tx.amount || 0);
            await deleteDoc(doc(db, `users/${userDoc.id}/transactions`, tx.id));
          }
          
          if (deduction > 0 || spins > 5 || maths > 5) {
             let currentBonus = Number(data.balances?.bonus || 0);
             let currentMain = Number(data.balances?.main || 0);
             
             if (currentBonus >= deduction) {
                 currentBonus -= deduction;
             } else {
                 let remainder = deduction - currentBonus;
                 currentBonus = 0;
                 currentMain = Math.max(0, currentMain - remainder);
             }
             
             await updateDoc(doc(db, 'users', userDoc.id), {
               'balances.bonus': currentBonus,
               'balances.main': currentMain,
               'totalSpinsPlayed': Math.min(5, spins, spinTxs.length),
               'totalMathsPlayed': Math.min(5, maths, mathTxs.length)
             });
             
             // Update leaderboard
             const lbDoc = await getDoc(doc(db, 'leaderboard', userDoc.id));
             if (lbDoc.exists()) {
                const currentIncome = Number(lbDoc.data().totalIncome || 0);
                await updateDoc(doc(db, 'leaderboard', userDoc.id), {
                   totalIncome: Math.max(0, currentIncome - deduction),
                   bonus: currentBonus
                });
             }
          }
          fixedCount++;
        }
      }
      toast.success(`Fixed exploit for ${fixedCount} users!`);
      loadData(true);
    } catch(err: any) {
      toast.error(err.message);
    }
  };"""

# Replace the whole fixExploit function
code = re.sub(r'  const fixExploit = async \(\) => \{[\s\S]*?catch\(err: any\) \{[\s\S]*?\}\s*\};', replacement, code)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(code)
