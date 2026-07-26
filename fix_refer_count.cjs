const fs = require('fs');
let code = fs.readFileSync('src/pages/Refer.tsx', 'utf8');

// We want to remove the fetchCount useEffect completely.
code = code.replace(/  useEffect\(\(\) => \{\n    const uid = user\?\.uid;[\s\S]*?fetchCount\(\);\n  \}, \[user\?\.uid, profile\?\.totalReferrals\]\);/g, '');

// We will add history tab state
code = code.replace(
  "const [referrals, setReferrals] = useState<any[]>([]);",
  "const [referrals, setReferrals] = useState<any[]>([]);\n  const [historyTab, setHistoryTab] = useState<number>(1);"
);

// We need to set actualReferralsCount after referrals load
const loadReferralsOld = `        setReferrals(refs);`;
const loadReferralsNew = `        setReferrals(refs);
        const gen1Count = refs.filter(r => !r.level || r.level === 1).length;
        if (gen1Count > (profile?.totalReferrals || 0)) {
          updateDoc(doc(db, "users", auth.currentUser!.uid), { totalReferrals: gen1Count }).catch(console.error);
        }
        setActualReferralsCount(Math.max(gen1Count, profile?.totalReferrals || 0));`;
code = code.replace(loadReferralsOld, loadReferralsNew);

fs.writeFileSync('src/pages/Refer.tsx', code);
