const fs = require('fs');
let code = fs.readFileSync('src/components/AuthProvider.tsx', 'utf8');

const importTarget = `import { auth, db, getCachedDoc } from '../lib/firebase';`;
const importReplacement = `import { auth, db, getCachedDoc } from '../lib/firebase';
import { onSnapshot } from 'firebase/firestore';`;

if (code.includes(importTarget)) {
  code = code.replace(importTarget, importReplacement);
}

const useEffectTarget = `useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await refreshProfile(user.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }`;

const useEffectReplacement = `useEffect(() => {
    let unsubscribeProfile: any = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await refreshProfile(user.uid);
        
        // Setup real-time listener
        try {
          unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              
              setProfile(prev => {
                if (!prev) return data;
                // Preserve deviceId if it was just added locally and not yet synced back
                return { ...data, deviceId: data.deviceId || prev.deviceId };
              });
              
              try {
                localStorage.setItem(\`profile_\${user.uid}\`, JSON.stringify(data));
              } catch(e) {}
            }
          }, (err) => {
             console.warn("Profile snapshot error", err);
          });
        } catch (e) {
          console.warn("Could not set up onSnapshot", e);
        }

      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        setProfile(null);
      }
      setLoading(false);
    }`;

code = code.replace(useEffectTarget, useEffectReplacement);

const unmountTarget = `return () => {
      unsubscribeAuth();
      clearTimeout(loadingFallback);
    };`;

const unmountReplacement = `return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      clearTimeout(loadingFallback);
    };`;

code = code.replace(unmountTarget, unmountReplacement);

fs.writeFileSync('src/components/AuthProvider.tsx', code);
console.log("Patched AuthProvider.tsx to use onSnapshot");
