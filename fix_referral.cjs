const fs = require('fs');
let code = fs.readFileSync('src/lib/referral.ts', 'utf8');

// Replace the imports at the top
code = code.replace(
  "import { doc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';",
  "import { doc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp, setDoc, query, where, getDocs } from 'firebase/firestore';"
);

// Remove the dynamic imports
code = code.replace(/const { query, where, getDocs } = await import\('firebase\/firestore'\);/g, '');

fs.writeFileSync('src/lib/referral.ts', code);
