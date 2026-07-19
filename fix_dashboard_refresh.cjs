const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const target = `await batch.commit();
                setShowCelebration(true);
                toast.success(\`৳\${partnerSettings.dailyBonus} daily partner bonus claimed!\`);`;
const replacement = `await batch.commit();
                if (refreshProfile) await refreshProfile();
                setShowCelebration(true);
                toast.success(\`৳\${partnerSettings.dailyBonus} daily partner bonus claimed!\`);`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/Dashboard.tsx', code);
  console.log("Patched Dashboard partner refresh!");
} else {
  console.log("Target not found in Dashboard");
}
