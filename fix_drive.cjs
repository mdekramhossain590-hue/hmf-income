const fs = require('fs');

let code = fs.readFileSync('src/pages/Drive.tsx', 'utf8');

const regex = /const userRef = doc\(db, 'users', auth.currentUser.uid\);/;

const newCode = `const userRef = doc(db, 'users', auth.currentUser.uid);
      
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
         const actualBal = userSnap.data().balances?.main || 0;
         if (actualBal < selectedOffer.salePrice) {
            toast.error('Insufficient balance!');
            setPurchasing(false);
            return;
         }
      }`;

code = code.replace(regex, newCode);
fs.writeFileSync('src/pages/Drive.tsx', code);
