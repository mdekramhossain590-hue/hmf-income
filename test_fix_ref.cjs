const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, updateDoc, doc, where, addDoc, increment, serverTimestamp, setDoc } = require('firebase/firestore');
const fs = require('fs');

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
  console.log("Checking users...");
  const usersSnap = await getDocs(collection(db, "users"));
  let missedCount = 0;
  
  for (const userDoc of usersSnap.docs) {
    const data = userDoc.data();
    if (data.isActive && !data.referralBonusPaid && data.usedReferCode && data.usedReferCode !== 'none') {
       console.log("Missed referral for active user:", data.email);
       missedCount++;
    } else if (!data.isActive && data.referralBonusPaid) {
       console.log("Inactive but paid:", data.email);
       // await updateDoc(doc(db, "users", userDoc.id), { referralBonusPaid: false });
    }
  }
  
  console.log("Total missed active users:", missedCount);
  process.exit(0);
}

run();
