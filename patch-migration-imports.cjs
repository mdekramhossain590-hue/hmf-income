const fs = require('fs');
let code = fs.readFileSync('src/pages/MigrationDashboard.tsx', 'utf8');

// Replace mock imports with real firebase imports
code = code.replace(
  `import { initializeApp, getApps } from '@/src/lib/mock-app';`,
  `import { initializeApp, getApps } from 'firebase/app';`
);
code = code.replace(
  `import { getFirestore, collection, getDocs, doc, query, limit, initializeFirestore } from '@/src/lib/mock-firestore';`,
  `import { getFirestore, collection, getDocs, doc, query, limit, initializeFirestore } from 'firebase/firestore';`
);
code = code.replace(
  `import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from '@/src/lib/mock-auth';`,
  `import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';`
);

// Remove the newFirebaseConfig since we are migrating to API/SQL now
code = code.replace(/const newFirebaseConfig = \{[\s\S]*?\};\n/, '');

// Adjust newApp and newDb
code = code.replace(/const newApp = [\s\S]*?;/, 'const newApp = {};');
code = code.replace(/const newDb = [\s\S]*?;/, 'const newDb = {};');
code = code.replace(/const newAuth = getAuth\(newApp\);/, 'const newAuth = { currentUser: { email: "admin@hmfincome.site" } };');

fs.writeFileSync('src/pages/MigrationDashboard.tsx', code);
