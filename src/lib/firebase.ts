import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeAuth, 
  getAuth, 
  browserLocalPersistence, 
  browserSessionPersistence, 
  indexedDBLocalPersistence, 
  inMemoryPersistence 
} from 'firebase/auth';
import { getFirestore, initializeFirestore, setLogLevel } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';
import toast from "react-hot-toast";

// Suppress internal Firestore WebChannel transient error logs
try {
  setLogLevel('silent');
} catch (_) {}

const firebaseConfig = {
  projectId: "hmf-income-app",
  appId: "1:1008180221188:web:428ac4e198cbb88794ec51",
  apiKey: "AIzaSyAxHUsTMyrfmd0gnaKS-LXXc_qnB7zqP5Q",
  authDomain: "hmf-income-app.firebaseapp.com",
  storageBucket: "hmf-income-app.firebasestorage.app",
  messagingSenderId: "1008180221188",
  measurementId: "G-WJX5EBBL41"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: [
        indexedDBLocalPersistence,
        browserLocalPersistence,
        browserSessionPersistence,
        inMemoryPersistence
      ]
    });
  } catch (e) {
    return getAuth(app);
  }
})();

export const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch (e) {
    return getFirestore(app);
  }
})();

let messaging: any = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
}).catch(() => {});
export { messaging };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  let userFriendlyMessage = "An unexpected error occurred. Please try again.";
  if (error instanceof Error) {
    userFriendlyMessage = error.message;
  }
  if (
    userFriendlyMessage.includes('unavailable') ||
    userFriendlyMessage.includes('offline') ||
    userFriendlyMessage.includes('Could not reach Cloud Firestore')
  ) {
    return;
  }
  console.warn(`Firestore Error [${operationType}] on ${path}:`, userFriendlyMessage);
  if ([OperationType.CREATE, OperationType.UPDATE, OperationType.DELETE, OperationType.WRITE].includes(operationType)) {
    toast.error(userFriendlyMessage);
  }
}
