const fs = require('fs');

let code = fs.readFileSync('src/pages/Refer.tsx', 'utf8');

const fixActualReferrals = `  const [actualReferralsCount, setActualReferralsCount] = useState<number>(profile?.totalReferrals || 0);

  useEffect(() => {
    setActualReferralsCount(profile?.totalReferrals || 0);
  }, [profile?.totalReferrals]);
`;

code = code.replace(
  `  const [actualReferralsCount, setActualReferralsCount] = useState<number>(profile?.totalReferrals || 0);`,
  fixActualReferrals
);

fs.writeFileSync('src/pages/Refer.tsx', code);
console.log("Patched actual referrals state");
