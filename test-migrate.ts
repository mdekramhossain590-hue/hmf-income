import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  projectId: "gen-lang-client-0327381597",
  appId: "1:562270246942:web:9c57dd38ad9cce3372760f",
  apiKey: "AIzaSyD6PCWSfOC1UoSnplNxzS3-eKC6k59nKq8",
  authDomain: "gen-lang-client-0327381597.firebaseapp.com",
  storageBucket: "gen-lang-client-0327381597.firebasestorage.app",
  messagingSenderId: "562270246942"
});
const db = getFirestore(app, "ai-studio-061b739b-1578-427e-8b07-b4943bc71d87");

async function check() {
  const users = await getDocs(collection(db, 'users'));
  console.log("Users count:", users.size);
}
check();
