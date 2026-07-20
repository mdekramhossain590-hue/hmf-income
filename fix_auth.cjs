const fs = require('fs');
let code = fs.readFileSync('src/components/AuthProvider.tsx', 'utf8');

code = code.replace(
  `unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {`,
  `unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap: any) => {`
);

code = code.replace(
  `}, (err) => {`,
  `}, (err: any) => {`
);

fs.writeFileSync('src/components/AuthProvider.tsx', code);
console.log("Patched AuthProvider.tsx");
