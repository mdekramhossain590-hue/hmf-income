const fs = require('fs');
let code = fs.readFileSync('src/pages/MigrationDashboard.tsx', 'utf8');

code = code.replace(
  `import { getFirestore, collection, getDocs, writeBatch, doc, query, limit, initializeFirestore } from 'firebase/firestore';`,
  `import { getFirestore, collection, getDocs, doc, query, limit, initializeFirestore } from 'firebase/firestore';\nimport { collection as newCollection, doc as newDoc, writeBatch } from '../lib/mock-firestore';`
);

code = code.replace(
  `const newDb = getFirestore(newApp);`,
  `const newDb = {}; // Mock db object`
);

// We need to replace collection(newDb, ...) with newCollection(newDb, ...)
// and doc(newDb, ...) or doc(newSubCollRef, ...) with newDoc(...)
code = code.replace(/collection\(newDb/g, 'newCollection(newDb');
code = code.replace(/doc\(newDb/g, 'newDoc(newDb');
code = code.replace(/doc\(newSubCollRef/g, 'newDoc(newSubCollRef');
code = code.replace(/doc\(newCollRef/g, 'newDoc(newCollRef');
// Also doc(newDb, 'settings', testDocId)
code = code.replace(/doc\(newDb,\s*'settings'/g, "newDoc(newDb, 'settings'");

fs.writeFileSync('src/pages/MigrationDashboard.tsx', code);
