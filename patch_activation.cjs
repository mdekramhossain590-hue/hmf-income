const fs = require('fs');

// Fix Payment.tsx
let codePayment = fs.readFileSync('src/pages/Payment.tsx', 'utf8');
codePayment = codePayment.replace(
  "import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';",
  "import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';\nimport { processRegistrationReferral } from '../lib/referral';"
);
codePayment = codePayment.replace(
  "batch.update(doc(db, 'users', auth.currentUser.uid), { isActive: true });\n      await batch.commit();",
  "batch.update(doc(db, 'users', auth.currentUser.uid), { isActive: true });\n      await batch.commit();\n      await processRegistrationReferral(auth.currentUser.uid);"
);
fs.writeFileSync('src/pages/Payment.tsx', codePayment);

// Fix ActivationPopup.tsx
let codePopup = fs.readFileSync('src/components/ActivationPopup.tsx', 'utf8');
codePopup = codePopup.replace(
  `onClick={() => {
                    navigate('/payment');
                    onClose();
                  }}`,
  `onClick={() => {
                    if (settings.mode === 'paid') {
                      navigate('/payment');
                      onClose();
                    } else {
                      handleActivate();
                    }
                  }}`
);
codePopup = codePopup.replace(
  '{settings.mode === \'paid\' ? \'Paid Activation (ফি)\' : \'Instant Trial (ফ্রি)\'}',
  '{settings.mode === \'paid\' ? \'Paid Activation (ফি)\' : \'Free Activation (ফ্রি)\'}'
);
codePopup = codePopup.replace(
  '<ShieldCheck className="w-4 h-4" /> Act Now / পেমেন্ট করুন',
  '{settings.mode === \'paid\' ? <><ShieldCheck className="w-4 h-4" /> Act Now / পেমেন্ট করুন</> : <><ShieldCheck className="w-4 h-4" /> Activate for Free</>}'
);

fs.writeFileSync('src/components/ActivationPopup.tsx', codePopup);
console.log("Patched Activation");
