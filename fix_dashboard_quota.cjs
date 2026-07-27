const fs = require('fs');

function fix(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  const effectCodeRegex = /  const \[actualReferralsCount, setActualReferralsCount\] = useState<number>\(profile\?\.totalReferrals \|\| 0\);\n\s*useEffect\(\(\) => \{[\s\S]*?fetchCount\(\);\n  \}, \[user\?\.uid, profile\?\.totalReferrals\]\);/g;

  if (code.match(effectCodeRegex)) {
    code = code.replace(effectCodeRegex, 'const actualReferralsCount = profile?.totalReferrals || 0;');
    fs.writeFileSync(file, code);
  } else {
    console.log("Could not find the effect code in", file);
  }
}

fix('src/pages/Dashboard.tsx');
