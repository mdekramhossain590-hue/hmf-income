const fs = require('fs');

const fetchCode = `  const [actualReferralsCount, setActualReferralsCount] = useState<number>(profile?.totalReferrals || 0);

  useEffect(() => {
    const uid = user?.uid;
    if (!uid) return;
    const fetchCount = async () => {
      try {
        const { getCountFromServer, query, collection } = await import('firebase/firestore');
        const snap = await getCountFromServer(query(collection(db, "users", uid, "referrals")));
        const realCount = snap.data().count;
        setActualReferralsCount(Math.max(realCount, profile?.totalReferrals || 0));
        
        if (realCount > (profile?.totalReferrals || 0)) {
           const { doc, updateDoc } = await import('firebase/firestore');
           await updateDoc(doc(db, "users", uid), { totalReferrals: realCount });
        }
      } catch (error) {
        console.error("Failed to fetch referral count:", error);
      }
    };
    fetchCount();
  }, [user?.uid, profile?.totalReferrals]);
`;

let code1 = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
code1 = code1.replace(
  'const actualReferralsCount = profile?.totalReferrals || (profile as any)?.referralCount || 0;',
  fetchCode
);
fs.writeFileSync('src/pages/Dashboard.tsx', code1);

let code2 = fs.readFileSync('src/pages/Refer.tsx', 'utf8');
code2 = code2.replace(
  'const actualReferralsCount = profile?.totalReferrals || (profile as any)?.referralCount || 0;',
  fetchCode
);
fs.writeFileSync('src/pages/Refer.tsx', code2);

console.log("Patched fetch code back in");
