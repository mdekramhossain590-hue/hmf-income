const fs = require('fs');

let code = fs.readFileSync('src/components/ActivationPopup.tsx', 'utf8');

const regex = /const currentRef = doc\(db, 'users', auth.currentUser.uid\);\s*await updateDoc\(currentRef, \{/;

const newCode = `const currentRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(currentRef);
        if (userSnap.exists()) {
           const actualBal = userSnap.data().balances?.main || 0;
           if (actualBal < settings.fee) {
              toast.error('Insufficient balance to activate.');
              setActivating(false);
              return;
           }
        }
        await updateDoc(currentRef, {`;

code = code.replace(regex, newCode);
fs.writeFileSync('src/components/ActivationPopup.tsx', code);
