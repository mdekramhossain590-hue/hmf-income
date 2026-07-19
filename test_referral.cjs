const fs = require('fs');

let code = fs.readFileSync('src/lib/referral.ts', 'utf8');

const debugLog = `
    const userDoc = await getDoc(doc(db, "users", userId));
    console.log("processRegistrationReferral started for userId:", userId, " exists:", userDoc.exists());
    if (!userDoc.exists()) return;
    const userData = userDoc.data();
    console.log("userData.referralBonusPaid:", userData.referralBonusPaid, " usedReferCode:", userData.usedReferCode);
`;
code = code.replace(
  /const userDoc = await getDoc\(doc\(db, "users", userId\)\);\s+if \(!userDoc\.exists\(\)\) return;\s+const userData = userDoc\.data\(\);/,
  debugLog
);

const debugLog2 = `
    const q = query(collection(db, "users"), where("myReferCode", "==", currentReferCode));
    const querySnapshot = await getDocs(q);
    console.log("Query for refer code:", currentReferCode, " empty:", querySnapshot.empty);
`;
code = code.replace(
  /const q = query\(collection\(db, "users"\), where\("myReferCode", "==", currentReferCode\)\);\s+const querySnapshot = await getDocs\(q\);/,
  debugLog2
);

fs.writeFileSync('src/lib/referral.ts', code);
console.log("Added debug logs to referral.ts");
