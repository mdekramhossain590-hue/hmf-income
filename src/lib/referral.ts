import { doc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function processReferralCommission(userId: string, amountEarned: number, type: string) {
  if (!amountEarned || amountEarned <= 0) return;
  
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return;
    
    let currentReferCode = userDoc.data().usedReferCode;
    
    if (!currentReferCode || currentReferCode === 'none') {
      return;
    }
    
    // Get the referral settings for percentage
    const refDoc = await getDoc(doc(db, "settings", "referral"));
    let gen1 = 0, gen2 = 0, gen3 = 0;
    if (refDoc.exists()) {
      const data = refDoc.data();
      gen1 = data.gen1Percent || data.percentageCommission || 0;
      gen2 = data.gen2Percent || 0;
      gen3 = data.gen3Percent || 0;
    }
    
    const percents = [gen1, gen2, gen3];
    
    if (percents.every(p => p <= 0)) return;
    
    const { query, where, getDocs } = await import('firebase/firestore');
    
    const sourceUserEmail = userDoc.data().email;

    for (let level = 0; level < 3; level++) {
      if (!currentReferCode || currentReferCode === 'none') break;
      const percentage = percents[level];
      
      const q = query(collection(db, "users"), where("myReferCode", "==", currentReferCode));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) break;
      
      const referrerDoc = querySnapshot.docs[0];
      const referrerId = referrerDoc.id;
      const referrerData = referrerDoc.data();
      
      if (percentage > 0) {
        const commissionAmount = parseFloat(((amountEarned * percentage) / 100).toFixed(4));
        if (commissionAmount > 0) {
          // Add referral commission to referrer
          await updateDoc(doc(db, "users", referrerId), {
            "balances.referral": increment(commissionAmount)
          });
          
          await addDoc(collection(db, `users/${referrerId}/transactions`), {
            amount: commissionAmount,
            type: `referral`,
            status: `approved`,
            createdAt: serverTimestamp(),
            account: sourceUserEmail
          });
          
          const leaderboardRef = doc(db, 'leaderboard', referrerId);
          await setDoc(leaderboardRef, {
            fullName: referrerData.fullName || 'User',
            bonus: increment(0),
            referrals: increment(0),
            totalIncome: increment(commissionAmount),
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      }
      
      // Move to next generation
      currentReferCode = referrerData.usedReferCode;
    }
  } catch (error) {
    console.error("Error processing referral commission:", error);
  }
}
