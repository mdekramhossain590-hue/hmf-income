const fs = require('fs');
let code = fs.readFileSync('src/pages/Refer.tsx', 'utf8');

// Fix caching for the query
code = code.replace(
  `const snapshot = await getCachedQuery(q, \`referrals_\${auth.currentUser!.uid}\`);`,
  `const { getDocs } = await import('firebase/firestore');\n        const snapshot = await getDocs(q);`
);

// Fix total earnings
code = code.replace(
  `const totalReferralEarnings = referrals.reduce((sum, r) => sum + (Number(r.bonusEarned) || 0), 0);`,
  `const totalReferralEarnings = profile?.balances?.referral || 0;`
);

// Fix Date time display in history list
code = code.replace(
  `{ref.createdAt?.toDate ? ref.createdAt.toDate().toLocaleString() : (ref.createdAt ? new Date(ref.createdAt).toLocaleString() : 'Just now')}`,
  `{ref.createdAt?.toDate ? new Intl.DateTimeFormat(language === 'Bengali' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }).format(ref.createdAt.toDate()) : (ref.createdAt ? new Intl.DateTimeFormat(language === 'Bengali' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(ref.createdAt)) : 'Just now')}`
);

// Fix bonusEarned display logic
code = code.replace(
  `+৳{ref.bonusEarned || 0}`,
  `+৳{ref.bonusEarned !== undefined ? ref.bonusEarned : referralBonus}`
);

fs.writeFileSync('src/pages/Refer.tsx', code);
