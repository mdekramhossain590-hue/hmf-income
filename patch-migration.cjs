const fs = require('fs');
let code = fs.readFileSync('src/pages/MigrationDashboard.tsx', 'utf8');

// Replace mock imports with real firebase imports
code = code.replace(
  `import { initializeApp, getApps } from '@/lib/mock-app';`,
  `import { initializeApp, getApps } from 'firebase/app';`
);
code = code.replace(
  `import { getFirestore, collection, getDocs, doc, query, limit, initializeFirestore } from '@/lib/mock-firestore';`,
  `import { getFirestore, collection, getDocs, doc, query, limit, initializeFirestore } from 'firebase/firestore';`
);
code = code.replace(
  `import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from '@/lib/mock-auth';`,
  `import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';`
);

// We still want to import newCollection, newDoc, writeBatch from mock-firestore
// They are currently: import { collection as newCollection, doc as newDoc, writeBatch } from '../lib/mock-firestore';
// Which is correct!

fs.writeFileSync('src/pages/MigrationDashboard.tsx', code);
