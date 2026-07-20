const { initializeApp } = require('firebase/app');
const { getFirestore, collectionGroup, getDocs, query, limit } = require('firebase/firestore');

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
  const adminId = "CGsRdm6gLNZwnAzjkWtPQH0Z3IQ2"; // one of the admins from rules
  const q = query(collectionGroup(db, 'referrals'), limit(20));
  try {
     const snap = await getDocs(q);
     console.log("Refs:");
     snap.docs.forEach(d => console.log(d.id, d.data()));
  } catch (e) {
     console.log("Permissions Error");
  }
  process.exit(0);
}
run();
