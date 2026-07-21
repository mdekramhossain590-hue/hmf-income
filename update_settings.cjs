const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "hmf-income-app",
  appId: "1:1008180221188:web:428ac4e198cbb88794ec51",
  apiKey: "AIzaSyAxHUsTMyrfmd0gnaKS-LXXc_qnB7zqP5Q",
  authDomain: "hmf-income-app.firebaseapp.com"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  await setDoc(doc(db, "settings", "referral"), {
    fixedBonus: 5,
    gen2FixedBonus: 3,
    gen3FixedBonus: 0,
    gen1Percent: 10,
    gen2Percent: 5,
    gen3Percent: 5,
    updatedAt: new Date()
  }, { merge: true });
  console.log("Updated settings/referral in DB");
  process.exit(0);
}
run();
