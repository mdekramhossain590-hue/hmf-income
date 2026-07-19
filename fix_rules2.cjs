const fs = require('fs');

let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace(
  /match \/leaderboard\/\{userId\} \{\s+allow read: if isAuth\(\);\s+allow create, update: if isAuth\(\) && \(isOwner\(userId\) \|\| isAdmin\(\)\);\s+allow delete: if isAdmin\(\);\s+\}/,
  `match /leaderboard/{userId} {
      allow read: if isAuth();
      allow create, update: if isAuth();
      allow delete: if isAdmin();
    }`
);

fs.writeFileSync('firestore.rules', rules);
console.log("Patched rules 2");
