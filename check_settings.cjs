const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "hmf-income-app",
  appId: "1:1008180221188:web:428ac4e198cbb88794ec51",
  apiKey: "AIzaSyAxHUsTMyrfmd0gnaKS-LXXc_qnB7zqP5Q",
  authDomain: "hmf-income-app.firebaseapp.com"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const s = await getDoc(doc(db, "settings", "referral"));
  if (s.exists()) console.log("Settings:", s.data());
  else console.log("No settings found");
  process.exit(0);
}
run();
