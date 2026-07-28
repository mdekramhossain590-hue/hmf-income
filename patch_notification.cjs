const fs = require('fs');

let code = fs.readFileSync('src/components/NotificationListener.tsx', 'utf8');

const importRegex = /import \{ db, auth, handleFirestoreError, OperationType \} from '\.\.\/lib\/firebase';/;
code = code.replace(importRegex, "import { db, auth, handleFirestoreError, OperationType, messaging } from '../lib/firebase';\nimport { getToken } from 'firebase/messaging';");


const insertTokenCode = `  useEffect(() => {
    if (!auth.currentUser || !messaging) return;
    const requestFCM = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
           const currentToken = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });
           if (currentToken) {
             await updateDoc(doc(db, 'users', auth.currentUser!.uid), {
               fcmToken: currentToken
             });
           }
        }
      } catch (err) {
        console.warn('Failed to get FCM token', err);
      }
    };
    
    // Only ask if they explicitly enabled notifications in settings, or if permission is already granted.
    if (Notification.permission === 'granted' || localStorage.getItem('app_notifications_enabled') !== 'false') {
       requestFCM();
    }
  }, []);`;

// insert it right after the first useEffect
code = code.replace(/export function NotificationListener\(\) \{/, `export function NotificationListener() {\n${insertTokenCode}`);

fs.writeFileSync('src/components/NotificationListener.tsx', code);
