const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const s1 = `      const settingsDoc = await getDocs(query(collection(db, "settings"), where("__name__", "==", "referral")));
      let gen1 = 10, gen2 = 0, gen3 = 0;
      if (!settingsDoc.empty) {
        const data = settingsDoc.docs[0].data();`;

const r1 = `      const { getDoc } = await import('firebase/firestore');
      const settingsDoc = await getDoc(doc(db, "settings", "referral"));
      let gen1 = 10, gen2 = 0, gen3 = 0;
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();`;

code = code.replace(s1, r1);

code = code.replace(
  'toast.loading("Finding and processing old referrals...");',
  'const loadingToast = toast.loading("Finding and processing old referrals...");'
);
code = code.replace(
  /toast\.dismiss\(\);/g,
  'toast.dismiss(loadingToast);'
);

fs.writeFileSync('src/pages/Admin.tsx', code);
console.log("Patched!");
