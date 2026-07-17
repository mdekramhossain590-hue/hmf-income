const fs = require('fs');
let code = fs.readFileSync('src/lib/referral.ts', 'utf8');

const target = `      const referrerData = referrerDoc.data();
      
      if (fixedBonus > 0) {
        await addDoc(collection(db, \`users/\${referrerId}/referrals\`), {
          referredEmail: userData.email,
          referredName: userData.fullName || 'Anonymous',
          bonusEarned: fixedBonus,
          level: level + 1,
          createdAt: serverTimestamp()
        });

        await updateDoc(doc(db, "users", referrerId), {
          "balances.referral": increment(fixedBonus),
          totalReferrals: increment(level === 0 ? 1 : 0)
        });
        
        const leaderboardRef = doc(db, 'leaderboard', referrerId);
        await setDoc(leaderboardRef, {
          fullName: referrerData.fullName || 'User',
          referrals: increment(level === 0 ? 1 : 0),
          bonus: increment(0),
          totalIncome: increment(fixedBonus),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      
      currentReferCode = referrerData.usedReferCode;`;

const replacement = `      const referrerData = referrerDoc.data();
      
      // Always record the referral
      await addDoc(collection(db, \`users/\${referrerId}/referrals\`), {
        referredEmail: userData.email,
        referredName: userData.fullName || 'Anonymous',
        bonusEarned: fixedBonus,
        level: level + 1,
        createdAt: serverTimestamp()
      });

      const userUpdates: any = {
        totalReferrals: increment(level === 0 ? 1 : 0)
      };

      if (fixedBonus > 0) {
        userUpdates["balances.referral"] = increment(fixedBonus);
      }
      
      await updateDoc(doc(db, "users", referrerId), userUpdates);
      
      const leaderboardRef = doc(db, 'leaderboard', referrerId);
      await setDoc(leaderboardRef, {
        fullName: referrerData.fullName || 'User',
        referrals: increment(level === 0 ? 1 : 0),
        bonus: increment(0),
        totalIncome: increment(fixedBonus),
        updatedAt: serverTimestamp()
      }, { merge: true });

      currentReferCode = referrerData.usedReferCode;`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/lib/referral.ts', code);
    console.log("Patched successfully.");
} else {
    console.log("Target not found.");
}
