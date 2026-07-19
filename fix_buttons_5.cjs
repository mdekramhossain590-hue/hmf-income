const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

code = code.replace(
  'const handleDeleteDuplicateAdmins = async () => {\n    toast.success("Delete admins started...");\n    console.log("Delete admins started");',
  'const handleDeleteDuplicateAdmins = async () => {\n    try {\n      toast.success("Delete admins started...");\n      console.log("Delete admins started");'
);

code = code.replace(
  'try {\n      toast.loading("Finding and deleting accounts...");',
  'toast.loading("Finding and deleting accounts...");'
);

code = code.replace(
  'const handleFixOldReferrals = async () => {\n    toast.success("Fix referrals started...");\n    console.log("Fix referrals started");\n    \n    \n    try {\n      const loadingToast = toast.loading("Finding and processing old referrals...");',
  'const handleFixOldReferrals = async () => {\n    try {\n      toast.success("Fix referrals started...");\n      console.log("Fix referrals started");\n      const loadingToast = toast.loading("Finding and processing old referrals...");'
);

fs.writeFileSync('src/pages/Admin.tsx', code);
console.log("Patched syntax");
