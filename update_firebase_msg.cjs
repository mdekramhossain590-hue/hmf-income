const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const importRegex = /import \{ getFirestore \} from 'firebase\/firestore';/;
code = code.replace(importRegex, "import { getFirestore } from 'firebase/firestore';\nimport { getMessaging, isSupported } from 'firebase/messaging';");

const dbRegex = /export const db = getFirestore\(app\);/;
code = code.replace(dbRegex, `export const db = getFirestore(app);

let messaging: any = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
});
export { messaging };`);

fs.writeFileSync('src/lib/firebase.ts', code);
