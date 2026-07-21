const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const { getFirestore, collection, getDocs, doc, setDoc, updateDoc, increment } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "hmf-income-app",
  appId: "1:1008180221188:web:428ac4e198cbb88794ec51",
  apiKey: "AIzaSyAxHUsTMyrfmd0gnaKS-LXXc_qnB7zqP5Q",
  authDomain: "hmf-income-app.firebaseapp.com"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  try {
    const cred = await signInAnonymously(auth);
    console.log("Logged in anonymously:", cred.user.uid);
    const snap = await getDocs(collection(db, 'users'));
    console.log("Success reading users:", snap.size);
  } catch (e) {
    console.error("Failed:", e.message);
  }
  process.exit(0);
}

run();
