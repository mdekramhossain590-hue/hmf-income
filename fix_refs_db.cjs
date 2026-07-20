const { initializeApp } = require('firebase/app');
const { getFirestore, collectionGroup, getDocs, query, updateDoc, doc, where, increment, setDoc } = require('firebase/firestore');

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
  const q = collectionGroup(db, 'referrals');
  const snap = await getDocs(q);
  console.log("Found referrals:", snap.size);
  
  // Date threshold for the ones we added via script. We added them recently.
  // Script ran at roughly Date.now() - a few minutes.
  // Let's just find anything with bonusEarned == 20, 10, 5 that should be 10, 5, 3.
  // Actually, wait, any referral with level 1 and bonusEarned == 20? 
  // Any referral with level 2 and bonusEarned == 10?
  // Any referral with level 3 and bonusEarned == 5?

  let fixedCount = 0;
  for (const rDoc of snap.docs) {
    const data = rDoc.data();
    // Path: users/{userId}/referrals/{refId}
    const pathParts = rDoc.ref.path.split('/');
    const userId = pathParts[1];
    
    // Determine the difference we need to subtract from the user's balance
    let diff = 0;
    let newBonus = 0;
    
    if (data.level === 1 && data.bonusEarned === 20) {
      diff = 10; // 20 - 10
      newBonus = 10;
    } else if (data.level === 2 && data.bonusEarned === 10) {
      diff = 5; // 10 - 5
      newBonus = 5;
    } else if (data.level === 3 && data.bonusEarned === 5) {
      diff = 2; // 5 - 3
      newBonus = 3;
    }
    
    // Only adjust if it was created in the last 10 minutes by the script!
    // The script used serverTimestamp()
    if (diff > 0 && data.createdAt) {
      const createdTime = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      const ageMs = Date.now() - createdTime.getTime();
      if (ageMs < 30 * 60 * 1000) { // Less than 30 mins ago
         console.log(`Fixing ref ${rDoc.id} for user ${userId}, diff: ${diff}, newBonus: ${newBonus}`);
         
         // 1. Update the referral document
         await updateDoc(rDoc.ref, { bonusEarned: newBonus });
         
         // 2. Decrement the user's balances.referral and totalIncome
         await updateDoc(doc(db, "users", userId), {
           "balances.referral": increment(-diff)
         });
         
         // 3. Decrement the leaderboard totalIncome
         await setDoc(doc(db, "leaderboard", userId), {
           totalIncome: increment(-diff)
         }, { merge: true });
         
         fixedCount++;
      }
    }
  }
  
  console.log("Fixed referrals:", fixedCount);
  process.exit(0);
}

run().catch(console.error);
