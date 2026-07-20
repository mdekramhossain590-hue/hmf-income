const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, updateDoc, doc, where, addDoc, increment, serverTimestamp, setDoc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "hmf-income-app",
  appId: "1:1008180221188:web:428ac4e198cbb88794ec51",
  apiKey: "AIzaSyAxHUsTMyrfmd0gnaKS-LXXc_qnB7zqP5Q",
  authDomain: "hmf-income-app.firebaseapp.com",
  storageBucket: "hmf-income-app.firebasestorage.app",
  messagingSenderId: "1008180221188"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("Fix referrals started");
  const settingsDoc = await getDoc(doc(db, "settings", "referral"));
  let gen1 = 10, gen2 = 0, gen3 = 0;
  if (settingsDoc.exists()) {
    const data = settingsDoc.data();
    gen1 = data.fixedBonus || 0;
    gen2 = data.gen2FixedBonus || 0;
    gen3 = data.gen3FixedBonus || 0;
  }
  const bonuses = [gen1, gen2, gen3];
  
  const q = query(collection(db, "users"));
  const snapshot = await getDocs(q);
  let processed = 0;
  
  for (const userDoc of snapshot.docs) {
    const data = userDoc.data();
    
    if (data.usedReferCode && data.usedReferCode !== 'none') {
      const sanitizedCode = data.usedReferCode.replace(/[\u200B-\u200D\uFEFF\s]/g, '').trim().toUpperCase();
      
      const referrerQuery = query(collection(db, "users"), where("myReferCode", "==", sanitizedCode));
      const referrerSnapshot = await getDocs(referrerQuery);
      
      if (!referrerSnapshot.empty) {
        const referrerDoc = referrerSnapshot.docs[0];
        const referrerId = referrerDoc.id;
        
        let missed = false;
        
        if (data.isActive) {
          if (data.email) {
            const refSubQuery = query(collection(db, `users/${referrerId}/referrals`), where("referredEmail", "==", data.email));
            const refSubSnapshot = await getDocs(refSubQuery);
            if (refSubSnapshot.empty) missed = true;
          } else {
            missed = !data.referralBonusPaid;
          }
        }
        
        if (missed) {
           console.log("Found missed referral for user:", data.email || userDoc.id, "referred by", sanitizedCode);
           
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
              
              await addDoc(collection(db, `users/${rId}/referrals`), {
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
              
              currentReferCode = rData.usedReferCode ? rData.usedReferCode.replace(/[\u200B-\u200D\uFEFF\s]/g, '').trim().toUpperCase() : '';
           }
           
           await updateDoc(doc(db, "users", userDoc.id), { referralBonusPaid: true });
           processed++;
        }
      }
    }
  }
  
  console.log("Finished fixing referrals! Processed:", processed);
  process.exit(0);
}

run().catch(console.error);
