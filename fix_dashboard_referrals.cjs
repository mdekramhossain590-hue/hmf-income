const fs = require('fs');

let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const regex = /const actualReferralsCount = profile\?.totalReferrals \|\| 0;/;

const newCode = `  const [actualReferralsCount, setActualReferralsCount] = useState(profile?.totalReferrals || 0);

  useEffect(() => {
    if (!auth.currentUser) return;
    const fixReferrals = async () => {
      try {
        const snap = await getDocs(collection(db, "users", auth.currentUser.uid, "referrals"));
        const gen1 = snap.docs.filter(d => !d.data().level || d.data().level === 1).length;
        setActualReferralsCount(gen1);
        if (profile && gen1 !== profile.totalReferrals) {
           updateDoc(doc(db, "users", auth.currentUser.uid), { totalReferrals: gen1 }).catch(e => {});
        }
      } catch (e) {}
    };
    fixReferrals();
  }, [profile?.totalReferrals]);`;

code = code.replace(regex, newCode);
fs.writeFileSync('src/pages/Dashboard.tsx', code);
