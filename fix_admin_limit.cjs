const fs = require('fs');

let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

code = code.replace(/limit\(200\)\), "admin_users"/g, '), "admin_users"');
// replace any other limits on users that might restrict view
fs.writeFileSync('src/pages/Admin.tsx', code);
