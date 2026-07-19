const fs = require('fs');

let adminCode = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const oldFix = `  const handleFixOldReferrals = async () => {
    if (!window.confirm("Are you sure you want to retroactively fix and process all old unpaid referrals?")) return;
    
    try {
      toast.loading("Finding and processing old referrals...");
      const { query, collection, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
      const { processRegistrationReferral } = await import('../lib/referral');
      
      // Query all users to avoid index requirements
      const q = query(collection(db, "users"));
      const snapshot = await getDocs(q);
      let processed = 0;
      let alreadyPaid = 0;
      
      for (const userDoc of snapshot.docs) {
        const data = userDoc.data();
        
        if (data.usedReferCode && data.usedReferCode !== 'none') {
          const sanitizedCode = data.usedReferCode.replace(/[\\u200B-\\u200D\\uFEFF\\s]/g, '').trim().toUpperCase();
          
          if (data.usedReferCode !== sanitizedCode) {
            await updateDoc(doc(db, "users", userDoc.id), { usedReferCode: sanitizedCode });
          }

          // Check if referrer actually received the referral
          const referrerQuery = query(collection(db, "users"), where("myReferCode", "==", sanitizedCode));
          const referrerSnapshot = await getDocs(referrerQuery);
          
          if (!referrerSnapshot.empty) {
            const referrerId = referrerSnapshot.docs[0].id;
            const refSubQuery = query(collection(db, \`users/\${referrerId}/referrals\`), where("referredEmail", "==", data.email));
            const refSubSnapshot = await getDocs(refSubQuery);
            
            if (refSubSnapshot.empty) {
               // Referral was missed! Reset referralBonusPaid to false to force processing
               await updateDoc(doc(db, "users", userDoc.id), { referralBonusPaid: false });
               await processRegistrationReferral(userDoc.id);
               processed++;
               continue;
            }
          }
        }
        
        if (data.referralBonusPaid) {
          alreadyPaid++;
        }
      }
      
      toast.dismiss();
      toast.success(\`Successfully processed \${processed} missed referrals (skipped \${alreadyPaid} valid).\`);
      loadData(true);
    } catch (e) {
      toast.dismiss();
      toast.error("Failed to process old referrals.");
      console.error(e);
    }
  };`;

const newFix = `  const handleFixOldReferrals = async () => {
    if (!window.confirm("Are you sure you want to retroactively fix and process all old unpaid referrals?")) return;
    
    try {
      toast.loading("Finding and processing old referrals...");
      const { query, collection, where, getDocs, updateDoc, doc, serverTimestamp, increment, setDoc, addDoc } = await import('firebase/firestore');
      
      // Get referral settings
      const settingsDoc = await getDocs(query(collection(db, "settings"), where("__name__", "==", "referral")));
      let gen1 = 10, gen2 = 0, gen3 = 0;
      if (!settingsDoc.empty) {
        const data = settingsDoc.docs[0].data();
        gen1 = data.fixedBonus || 0;
        gen2 = data.gen2FixedBonus || 0;
        gen3 = data.gen3FixedBonus || 0;
      }
      const bonuses = [gen1, gen2, gen3];

      // Query all users to avoid index requirements
      const q = query(collection(db, "users"));
      const snapshot = await getDocs(q);
      let processed = 0;
      let alreadyPaid = 0;
      let logMsg = "";
      
      for (const userDoc of snapshot.docs) {
        const data = userDoc.data();
        
        if (data.usedReferCode && data.usedReferCode !== 'none') {
          const sanitizedCode = data.usedReferCode.replace(/[\\u200B-\\u200D\\uFEFF\\s]/g, '').trim().toUpperCase();
          
          if (data.usedReferCode !== sanitizedCode) {
            await updateDoc(doc(db, "users", userDoc.id), { usedReferCode: sanitizedCode });
          }

          // Check if referrer actually received the referral
          const referrerQuery = query(collection(db, "users"), where("myReferCode", "==", sanitizedCode));
          const referrerSnapshot = await getDocs(referrerQuery);
          
          if (!referrerSnapshot.empty) {
            const referrerDoc = referrerSnapshot.docs[0];
            const referrerId = referrerDoc.id;
            
            // Allow matching by email or just checking if they've been paid
            let missed = false;
            
            if (data.email) {
              const refSubQuery = query(collection(db, \`users/\${referrerId}/referrals\`), where("referredEmail", "==", data.email));
              const refSubSnapshot = await getDocs(refSubQuery);
              if (refSubSnapshot.empty) missed = true;
            } else {
              missed = !data.referralBonusPaid;
            }
            
            if (missed) {
               console.log("Found missed referral for user:", data.email || userDoc.id, "referred by", sanitizedCode);
               
               // Manually process it directly here so it never fails
               let currentReferCode = sanitizedCode;
               for (let level = 0; level < 3; level++) {
                  if (!currentReferCode || currentReferCode === 'none') break;
                  const fixedBonus = bonuses[level];
                  
                  const refQ = query(collection(db, "users"), where("myReferCode", "==", currentReferCode));
                  const refSnap = await getDocs(refQ);
                  if (refSnap.empty) break;
                  
                  const rDoc = refSnap.docs[0];
                  const rId = rDoc.id;
                  const rData = rDoc.data();
                  
                  // Add to subcollection if level 1 (or all levels depending on logic)
                  await addDoc(collection(db, \`users/\${rId}/referrals\`), {
                    referredEmail: data.email || 'No Email',
                    referredName: data.fullName || 'Anonymous',
                    bonusEarned: fixedBonus,
                    level: level + 1,
                    createdAt: serverTimestamp()
                  });
                  
                  const userUpdates = {
                    totalReferrals: increment(level === 0 ? 1 : 0)
                  };
                  if (fixedBonus > 0) {
                    userUpdates["balances.referral"] = increment(fixedBonus);
                  }
                  await updateDoc(doc(db, "users", rId), userUpdates);
                  
                  const leaderboardRef = doc(db, 'leaderboard', rId);
                  await setDoc(leaderboardRef, {
                    fullName: rData.fullName || 'User',
                    referrals: increment(level === 0 ? 1 : 0),
                    bonus: increment(0),
                    totalIncome: increment(fixedBonus),
                    updatedAt: serverTimestamp()
                  }, { merge: true });
                  
                  currentReferCode = rData.usedReferCode ? rData.usedReferCode.replace(/[\\u200B-\\u200D\\uFEFF\\s]/g, '').trim().toUpperCase() : '';
               }
               
               await updateDoc(doc(db, "users", userDoc.id), { referralBonusPaid: true });
               processed++;
               continue;
            }
          }
        }
        
        if (data.referralBonusPaid) {
          alreadyPaid++;
        }
      }
      
      toast.dismiss();
      toast.success(\`Successfully processed \${processed} missed referrals (skipped \${alreadyPaid} valid).\`);
      loadData(true);
    } catch (e) {
      toast.dismiss();
      toast.error("Failed to process old referrals: " + e.message);
      console.error(e);
    }
  };`;

adminCode = adminCode.replace(oldFix, newFix);
fs.writeFileSync('src/pages/Admin.tsx', adminCode);
console.log("Patched Admin.tsx");
