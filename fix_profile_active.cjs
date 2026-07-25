const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

code = code.replace(
  '<span className="text-[20px] font-black text-slate-800 dark:text-white leading-none mb-1">Active</span>',
  '<span className="text-[20px] font-black text-slate-800 dark:text-white leading-none mb-1">{profile?.isActive ? "Active" : "Inactive"}</span>'
);

fs.writeFileSync('src/pages/Profile.tsx', code);
console.log("Fixed hardcoded active status in Profile");
