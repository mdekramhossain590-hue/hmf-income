const fs = require('fs');

let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const importReferral = `import { processRegistrationReferral } from '../lib/referral';\n`;

if (!code.includes('processRegistrationReferral')) {
    code = code.replace(`import { getDeviceId } from '../lib/device';`, `import { getDeviceId } from '../lib/device';\n${importReferral}`);
}

const retryLogic = `
  useEffect(() => {
    const checkMissedReferral = async () => {
      if (profile && profile.isActive && !profile.referralBonusPaid && profile.usedReferCode && profile.usedReferCode !== 'none') {
        console.log("Retrying missed referral processing...");
        try {
          await processRegistrationReferral(auth.currentUser!.uid);
          await refreshProfile();
        } catch(e) {
          console.error(e);
        }
      }
    };
    checkMissedReferral();
  }, [profile?.isActive, profile?.referralBonusPaid, profile?.usedReferCode]);
`;

code = code.replace(
  `  useEffect(() => {`,
  `${retryLogic}\n  useEffect(() => {`
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Added retry logic to Dashboard.tsx");
