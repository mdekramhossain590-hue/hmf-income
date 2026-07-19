const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

code = code.replace(
  /\(\(profile\?\.balances\?\.main \|\| 0\) \+ \(profile\?\.balances\?\.bonus \|\| 0\) \+ \(profile\?\.balances\?\.referral \|\| 0\) \+ \(profile\?\.balances\?\.gift \|\| 0\) \+ Object\.values\(profile\?\.balances\?\.tasks \|\| \{\}\)\.reduce\(\(a, b\) => \(a as number\) \+ \(b as number\), 0\)\)/g,
  `((profile?.balances?.main || 0) + (profile?.balances?.bonus || 0) + (profile?.balances?.referral || 0) + (profile?.balances?.gift || 0) + (profile?.balances?.partner || 0) + Object.values(profile?.balances?.tasks || {}).reduce((a, b) => (a as number) + (b as number), 0))`
);

fs.writeFileSync('src/pages/Profile.tsx', code);
console.log("Patched Profile.tsx to include Partner balance");
