const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const target = `onClick={async () => {
              if (!auth.currentUser) return;
              if ((actualReferralsCount) < partnerSettings.requiredReferrals) {`;
              
const replacement = `disabled={claimingPartner}
            onClick={async () => {
              if (!auth.currentUser) return;
              if (claimingPartner) return;
              if ((actualReferralsCount) < partnerSettings.requiredReferrals) {`;

code = code.replace(target, replacement);

const stateTarget = `const [showCelebration, setShowCelebration] = useState(false);`;
const stateReplacement = `const [showCelebration, setShowCelebration] = useState(false);
  const [claimingPartner, setClaimingPartner] = useState(false);`;

code = code.replace(stateTarget, stateReplacement);

const tryTarget = `try {
                const batch = writeBatch(db);`;
const tryReplacement = `try {
                setClaimingPartner(true);
                const batch = writeBatch(db);`;

code = code.replace(tryTarget, tryReplacement);

const finallyTarget = `toast.error("Failed to claim bonus.");
              }`;
const finallyReplacement = `toast.error("Failed to claim bonus.");
              } finally {
                setClaimingPartner(false);
              }`;

code = code.replace(finallyTarget, finallyReplacement);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Patched Dashboard anti-spam!");
