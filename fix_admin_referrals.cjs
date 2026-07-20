const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

code = code.replace(
  `            let missed = false;
            
            if (data.email) {
              const refSubQuery = query(collection(db, \`users/\${referrerId}/referrals\`), where("referredEmail", "==", data.email));
              const refSubSnapshot = await getDocs(refSubQuery);
              if (refSubSnapshot.empty) missed = true;
            } else {
              missed = !data.referralBonusPaid;
            }
            
            if (missed) {`,
  `            let missed = false;
            
            // Only process if the user is ACTIVE!
            if (data.isActive) {
              if (data.email) {
                const refSubQuery = query(collection(db, \`users/\${referrerId}/referrals\`), where("referredEmail", "==", data.email));
                const refSubSnapshot = await getDocs(refSubQuery);
                if (refSubSnapshot.empty) missed = true;
              } else {
                missed = !data.referralBonusPaid;
              }
            }
            
            if (missed) {`
);

fs.writeFileSync('src/pages/Admin.tsx', code);
