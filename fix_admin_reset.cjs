const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

code = code.replace(
  `            if (data.isActive) {
              if (data.email) {
                const refSubQuery = query(collection(db, \`users/\${referrerId}/referrals\`), where("referredEmail", "==", data.email));
                const refSubSnapshot = await getDocs(refSubQuery);
                if (refSubSnapshot.empty) missed = true;
              } else {
                missed = !data.referralBonusPaid;
              }
            }
            
            if (missed) {`,
  `            if (data.isActive) {
              if (data.email) {
                const refSubQuery = query(collection(db, \`users/\${referrerId}/referrals\`), where("referredEmail", "==", data.email));
                const refSubSnapshot = await getDocs(refSubQuery);
                if (refSubSnapshot.empty) missed = true;
              } else {
                missed = !data.referralBonusPaid;
              }
            } else {
              // If user is INACTIVE but referralBonusPaid is true, fix it so they can be processed later when they activate!
              if (data.referralBonusPaid) {
                await updateDoc(doc(db, "users", userDoc.id), { referralBonusPaid: false });
              }
            }
            
            if (missed) {`
);

fs.writeFileSync('src/pages/Admin.tsx', code);
