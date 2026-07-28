const fs = require('fs');

let code = fs.readFileSync('src/pages/Leaderboard.tsx', 'utf8');

code = code.replace(/getDocs\(query\(collection\(db, "users"\), limit\(100\)\)\);/g, 'getDocs(query(collection(db, "users")));');

fs.writeFileSync('src/pages/Leaderboard.tsx', code);
