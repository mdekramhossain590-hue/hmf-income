const fs = require('fs');
let code = fs.readFileSync('src/pages/TaskDetail.tsx', 'utf8');

code = code.replace(
  `where("userId", "==", auth.currentUser.uid)`,
  `where("userId", "==", auth.currentUser?.uid || "")`
);

code = code.replace(
  `userId: auth.currentUser.uid,`,
  `userId: auth.currentUser?.uid || "",`
);

fs.writeFileSync('src/pages/TaskDetail.tsx', code);
console.log("Patched TaskDetail.tsx auth.currentUser");
