const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const fixOldRefsFunc = `  const handleFixOldReferrals = async () => {
    try {
      toast.success("Fix referrals started...");
      const loadingToast = toast.loading("Finding and processing old referrals...");
      const { query, collection, where, getDocs, updateDoc, doc, serverTimestamp, increment, setDoc, addDoc, getDoc } = await import('firebase/firestore');
      
      const settingsDoc = await getDoc(doc(db, "settings", "referral"));
      let gen1 = 10, gen2 = 0, gen3 = 0;
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        gen1 = data.fixedBonus || 0;
        gen2 = data.gen2FixedBonus || 0;
        gen3 = data.gen3FixedBonus || 0;
      }
      const bonuses = [gen1, gen2, gen3];

      let processed = 0;
      let alreadyPaid = 0;
      
      for (const user of userList) {
        const data = user;
        const userDoc = { id: user.id };
        
        if (data.usedReferCode && data.usedReferCode !== 'none') {
          const sanitizedCode = data.usedReferCode.replace(/[\\u200B-\\u200D\\uFEFF\\s]/g, '').trim().toUpperCase();
          
          if (data.usedReferCode !== sanitizedCode) {
            await updateDoc(doc(db, "users", userDoc.id), { usedReferCode: sanitizedCode }).catch(()=>{});
          }

          const referrerQuery = query(collection(db, "users"), where("myReferCode", "==", sanitizedCode));
          const referrerSnapshot = await getDocs(referrerQuery).catch(() => ({ empty: true, docs: [] }));
          
          if (!referrerSnapshot.empty) {
            const referrerDoc = referrerSnapshot.docs[0];
            const referrerId = referrerDoc.id;
            
            let missed = false;
            
            if (data.isActive) {
              if (data.email) {
                const refSubQuery = query(collection(db, \`users/\${referrerId}/referrals\`), where("referredEmail", "==", data.email));
                const refSubSnapshot = await getDocs(refSubQuery).catch(() => ({ empty: true }));
                if (refSubSnapshot.empty) missed = true;
              } else {
                missed = !data.referralBonusPaid;
              }
            } else {
              if (data.referralBonusPaid) {
                await updateDoc(doc(db, "users", userDoc.id), { referralBonusPaid: false }).catch(()=>{});
              }
            }
            
            if (missed) {
               let currentReferCode = sanitizedCode;
               for (let level = 0; level < 3; level++) {
                  if (!currentReferCode || currentReferCode === 'none') break;
                  const fixedBonus = bonuses[level];
                  
                  const refQ = query(collection(db, "users"), where("myReferCode", "==", currentReferCode));
                  const refSnap = await getDocs(refQ).catch(() => ({ empty: true, docs: [] }));
                  if (refSnap.empty) break;
                  
                  const rDoc = refSnap.docs[0];
                  const rId = rDoc.id;
                  const rData = rDoc.data();
                  
                  try {
                    await addDoc(collection(db, \`users/\${rId}/referrals\`), {
                      referredEmail: data.email || 'No Email',
                      referredName: data.fullName || 'Anonymous',
                      bonusEarned: fixedBonus,
                      level: level + 1,
                      createdAt: serverTimestamp()
                    });
                  } catch(e) { console.error(e); }
                  
                  const userUpdates: any = {
                    totalReferrals: increment(level === 0 ? 1 : 0)
                  };
                  if (fixedBonus > 0) {
                     userUpdates["balances.referral"] = increment(fixedBonus);
                  }
                  await updateDoc(doc(db, "users", rId), userUpdates).catch(()=>{});
                  
                  const leaderboardRef = doc(db, 'leaderboard', rId);
                  await setDoc(leaderboardRef, {
                    fullName: rData.fullName || 'User',
                    referrals: increment(level === 0 ? 1 : 0),
                    bonus: increment(0),
                    totalIncome: increment(fixedBonus),
                    updatedAt: serverTimestamp()
                  }, { merge: true }).catch(()=>{});
                  
                  currentReferCode = rData.usedReferCode ? rData.usedReferCode.replace(/[\\u200B-\\u200D\\uFEFF\\s]/g, '').trim().toUpperCase() : '';
               }
               
               await updateDoc(doc(db, "users", userDoc.id), { referralBonusPaid: true }).catch(()=>{});
               processed++;
               continue;
            } else if (data.referralBonusPaid) {
               alreadyPaid++;
            }
          }
        }
      }
      
      toast.dismiss(loadingToast);
      toast.success(\`Fixed \${processed} missed referrals. \${alreadyPaid} were already paid.\`, { duration: 5000 });
      loadData(true);
    } catch (e: any) {
      toast.error(e.message);
    }
  };`;

code = code.replace(/const handleFixOldReferrals = async \(\) => \{[\s\S]*?\} catch \(e: any\) \{[\s\S]*?toast\.error\(e\.message\);[\s\S]*?\}[\s\S]*?\};/, fixOldRefsFunc);

const delDupsFunc = `  const handleDeleteDuplicateAdmins = async () => {
    try {
      toast.success("Delete admins started...");
      toast.loading("Finding and deleting accounts...");
      const { query, collection, where, getDocs, deleteDoc, doc } = await import('firebase/firestore');
      
      let deleted = 0;
      let kept = 0;
      
      const adminUsers = userList.filter(u => u.email === "mdekramhossain590@gmail.com");
      
      for (const user of adminUsers) {
        const data = user;
        if (data.myReferCode === "NN743526") {
           kept++;
        } else {
           await deleteDoc(doc(db, "users", user.id)).catch(()=>{});
           await deleteDoc(doc(db, "leaderboard", user.id)).catch(()=>{});
           deleted++;
        }
      }
      
      toast.dismiss();
      toast.success(\`Deleted \${deleted} duplicates, kept \${kept} original.\`);
      loadData(true);
    } catch (e: any) {
      toast.error(e.message);
    }
  };`;

code = code.replace(/const handleDeleteDuplicateAdmins = async \(\) => \{[\s\S]*?\} catch \(e: any\) \{[\s\S]*?toast\.error\(e\.message\);[\s\S]*?\}[\s\S]*?\};/, delDupsFunc);

fs.writeFileSync('src/pages/Admin.tsx', code);
