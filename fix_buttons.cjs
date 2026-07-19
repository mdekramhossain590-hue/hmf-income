const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

code = code.replace(
  'const handleDeleteDuplicateAdmins = async () => {',
  'const handleDeleteDuplicateAdmins = async () => {\n    toast.success("Delete admins started...");\n    console.log("Delete admins started");'
);

code = code.replace(
  'const handleFixOldReferrals = async () => {',
  'const handleFixOldReferrals = async () => {\n    toast.success("Fix referrals started...");\n    console.log("Fix referrals started");'
);

fs.writeFileSync('src/pages/Admin.tsx', code);
console.log("Patched with toast debug");
