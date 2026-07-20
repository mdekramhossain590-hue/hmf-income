const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

code = code.replace(
  `toast.dismiss(loadingToast);`,
  `// toast.dismiss(loadingToast);`
);
code = code.replace(
  `toast.dismiss(loadingToast);`,
  `// toast.dismiss(loadingToast);`
);

code = code.replace(
  `"balances.referral"`,
  `balancesReferral`
);

// We need to fix the exact errors instead of blind replaces.
fs.writeFileSync('src/pages/Admin.tsx', code);
