const fs = require('fs');

// Fix Auth.tsx
let authCode = fs.readFileSync('src/pages/Auth.tsx', 'utf8');
authCode = authCode.replace(
  /usedReferCode: referCode \? referCode\.replace\(\/\[\\u200B-\\u200D\\uFEFF\\s\]\/g, ''\)\.trim\(\) : "none"/g,
  "usedReferCode: referCode ? referCode.replace(/[\\u200B-\\u200D\\uFEFF\\s]/g, '').trim().toUpperCase() : \"none\""
);
fs.writeFileSync('src/pages/Auth.tsx', authCode);

// Fix referral.ts
let refCode = fs.readFileSync('src/lib/referral.ts', 'utf8');
refCode = refCode.replace(
  /currentReferCode = currentReferCode\.replace\(\/\[\\u200B-\\u200D\\uFEFF\\s\]\/g, ''\)\.trim\(\);/g,
  "currentReferCode = currentReferCode.replace(/[\\u200B-\\u200D\\uFEFF\\s]/g, '').trim().toUpperCase();"
);
fs.writeFileSync('src/lib/referral.ts', refCode);

console.log("Patched Auth and referral");
