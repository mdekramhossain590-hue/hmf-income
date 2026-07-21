const { initializeApp } = require('firebase/app');
const { getFirestore, collectionGroup, getDocs, query, updateDoc, doc, where, increment, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "hmf-income-app",
  appId: "1:1008180221188:web:428ac4e198cbb88794ec51",
  apiKey: "AIzaSyAxHUsTMyrfmd0gnaKS-LXXc_qnB7zqP5Q",
  authDomain: "hmf-income-app.firebaseapp.com",
  storageBucket: "hmf-income-app.firebasestorage.app",
  messagingSenderId: "1008180221188"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("Starting...");
  const snap = await getDocs(collectionGroup(db, 'referrals'));
  console.log("Success", snap.size);
  process.exit(0);
}

run().catch(e => {
  console.error("Failed:", e.message);
  process.exit(0);
});
