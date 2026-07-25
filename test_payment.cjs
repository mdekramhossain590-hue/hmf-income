const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, limit, orderBy } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "hmf-income-app",
  appId: "1:1008180221188:web:428ac4e198cbb88794ec51",
  apiKey: "AIzaSyAxHUsTMyrfmd0gnaKS-LXXc_qnB7zqP5Q",
  authDomain: "hmf-income-app.firebaseapp.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, "payment_requests"), orderBy('createdAt', 'desc'), limit(10));
  const snap = await getDocs(q);
  snap.forEach(d => console.log(d.id, d.data().type, d.data().status, d.data().amount, d.data().userId));
  process.exit(0);
}
run();
