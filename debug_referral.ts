import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "hmf-income-app",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// To test this we would need a proper environment, but we can't from node without admin sdk.
// Wait, we can't test firestore easily without credentials.
