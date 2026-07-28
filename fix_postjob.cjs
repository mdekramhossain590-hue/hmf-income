const fs = require('fs');

let code = fs.readFileSync('src/pages/PostJob.tsx', 'utf8');

const regex = /const userRef = doc\(db, 'users', auth\.currentUser\.uid\);\s*batch\.update\(userRef, \{\s*'balances\.main': increment\(-totalCost\)\s*\}\);/;

const newCode = `const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
         const actualBal = userSnap.data().balances?.main || 0;
         if (actualBal < totalCost) {
            toast.error('Insufficient balance!');
            setIsSubmitting(false);
            return;
         }
      }
      
      batch.update(userRef, {
        'balances.main': increment(-totalCost)
      });`;

code = code.replace(regex, newCode);
fs.writeFileSync('src/pages/PostJob.tsx', code);
