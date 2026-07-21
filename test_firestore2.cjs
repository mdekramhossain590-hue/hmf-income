const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, updateDoc, doc, where, increment, setDoc } = require('firebase/firestore');

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
  const snap = await getDocs(collection(db, 'users'));
  console.log("Success", snap.size);
  let referrals = 0;
  for (const d of snap.docs) {
     const sub = await getDocs(collection(db, `users/${d.id}/referrals`));
     referrals += sub.size;
  }
  console.log("Total referrals:", referrals);
  process.exit(0);
}

run().catch(e => {
  console.error("Failed:", e.message);
  process.exit(0);
});
