const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

code = code.replace(
  '<button\n              onClick={handleDeleteDuplicateAdmins}',
  '<button\n              type="button"\n              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteDuplicateAdmins(); }}'
);

code = code.replace(
  '<button\n              onClick={handleFixOldReferrals}',
  '<button\n              type="button"\n              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleFixOldReferrals(); }}'
);

fs.writeFileSync('src/pages/Admin.tsx', code);
console.log("Patched button types");
