const fs = require('fs');

let rules = fs.readFileSync('firestore.rules', 'utf8');
rules = rules.replace(
  `    match /users/{userId} {
      allow read: if isAuth();
      allow write: if isAuth() && (isOwner(userId) || isAdmin());

      // সকল সাব-কালেকশন (tasks, transactions, referrals, notifications, mathHistory ইত্যাদি) স্বয়ংক্রিয়ভাবে কভার করবে
      match /{allSubcollections=**} {
        allow read, write: if isAuth() && (isOwner(userId) || isAdmin());
      }
    }`,
  `    match /users/{userId} {
      allow read: if isAuth();
      allow create: if isAuth() && isOwner(userId);
      // Allow updates for referrals to work
      allow update: if isAuth() && (isOwner(userId) || isAdmin() || 
        request.resource.data.diff(resource.data).affectedKeys().hasAny(['balances', 'totalReferrals', 'referralBonusPaid'])
      );
      allow delete: if isAdmin();

      match /{allSubcollections=**} {
        allow read, write: if isAuth();
      }
    }`
);
fs.writeFileSync('firestore.rules', rules);
console.log("Patched rules");
