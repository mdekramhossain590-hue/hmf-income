const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf-8');
code = code.replace("allow create: if isAuth() && request.resource.data.postedByUid == request.auth.uid && request.resource.data.status == 'pending';", "allow create: if isAdmin() || (isAuth() && request.resource.data.postedByUid == request.auth.uid && request.resource.data.status == 'pending');");
fs.writeFileSync('firestore.rules', code);
