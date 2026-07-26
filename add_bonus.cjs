const fs = require('fs');

// Admin.tsx
let adminCode = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
adminCode = adminCode.replace(
  "} else if (reqType === 'activation' && status === 'approved') {\n              batch.set(userRef, { isActive: true }, { merge: true });\n            }",
  `} else if (reqType === 'activation' && status === 'approved') {
              batch.set(userRef, { isActive: true, 'balances.bonus': increment(10) }, { merge: true });
              const leaderboardRef = doc(db, "leaderboard", reqUserId);
              batch.set(leaderboardRef, { bonus: increment(10), totalIncome: increment(10) }, { merge: true });
            }`
);
fs.writeFileSync('src/pages/Admin.tsx', adminCode);

// ActivationPopup.tsx
let popupCode = fs.readFileSync('src/components/ActivationPopup.tsx', 'utf8');
popupCode = popupCode.replace(
  "'balances.main': increment(-settings.fee),\n          isActive: true\n        });",
  "'balances.main': increment(-settings.fee),\n          'balances.bonus': increment(10),\n          isActive: true\n        });\n        const leaderboardRef = doc(db, 'leaderboard', auth.currentUser.uid);\n        await updateDoc(leaderboardRef, { bonus: increment(10), totalIncome: increment(10) });"
);
popupCode = popupCode.replace(
  "isActive: true\n        });\n        await processRegistrationReferral",
  "isActive: true,\n          'balances.bonus': increment(10)\n        });\n        const leaderboardRef = doc(db, 'leaderboard', auth.currentUser.uid);\n        await updateDoc(leaderboardRef, { bonus: increment(10), totalIncome: increment(10) });\n        await processRegistrationReferral"
);
fs.writeFileSync('src/components/ActivationPopup.tsx', popupCode);
