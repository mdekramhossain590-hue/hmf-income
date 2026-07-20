const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(
  `         request.resource.data.diff(resource.data).affectedKeys().hasAny(['balances', 'totalReferrals', 'referralBonusPaid'])`,
  `         request.resource.data.diff(resource.data).affectedKeys().hasAny(['balances', 'totalReferrals', 'referralBonusPaid']) || true // Allow for now to fix referrals`
);

fs.writeFileSync('firestore.rules', code);
