const fs = require('fs');

let code = fs.readFileSync('src/pages/Refer.tsx', 'utf8');

const oldCodeRegex = /if \(gen1Count > \(profile\?\.totalReferrals \|\| 0\)\) \{[\s\S]*?\}\s*setActualReferralsCount\(Math\.max\(gen1Count, profile\?\.totalReferrals \|\| 0\)\);/;

const newCode = `if (gen1Count !== (profile?.totalReferrals || 0)) {
          updateDoc(doc(db, "users", auth.currentUser!.uid), { totalReferrals: gen1Count }).catch(console.error);
        }
        setActualReferralsCount(gen1Count);`;

code = code.replace(oldCodeRegex, newCode);
fs.writeFileSync('src/pages/Refer.tsx', code);
