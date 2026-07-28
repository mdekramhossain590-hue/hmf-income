const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const adminImport = `import admin from 'firebase-admin';\n`;

// Initialize admin
const adminInit = `
let firebaseAdminApp;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin Initialized successfully.");
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT env variable is missing. Push notifications won't work.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
}
`;

const pushEndpoint = `
  app.post("/api/send-notification", async (req, res) => {
    if (!firebaseAdminApp) {
       return res.status(500).json({ error: "Firebase Admin is not configured. Add FIREBASE_SERVICE_ACCOUNT secret." });
    }
    const { userId, title, message } = req.body;
    
    try {
       const db = admin.firestore();
       let tokens = [];
       
       if (userId === 'all') {
          const usersSnap = await db.collection('users').where('fcmToken', '!=', null).get();
          usersSnap.forEach(doc => {
            const tk = doc.data().fcmToken;
            if (tk) tokens.push(tk);
          });
       } else {
          const userDoc = await db.collection('users').doc(userId).get();
          if (userDoc.exists) {
             const tk = userDoc.data().fcmToken;
             if (tk) tokens.push(tk);
          }
       }
       
       if (tokens.length === 0) {
          return res.status(200).json({ success: true, message: "No tokens found" });
       }
       
       const payload = {
          notification: { title, body: message }
       };
       
       const response = await admin.messaging().sendEachForMulticast({
          tokens,
          notification: payload.notification
       });
       
       return res.json({ success: true, sent: response.successCount, failed: response.failureCount });
    } catch (err) {
       console.error("Push Error:", err);
       return res.status(500).json({ error: "Failed to send push notification" });
    }
  });
`;

code = adminImport + code.replace(/async function startServer\(\) \{/, adminInit + "\nasync function startServer() {\n");
code = code.replace(/app\.listen\(PORT,/, pushEndpoint + "\n  app.listen(PORT,");

fs.writeFileSync('server.ts', code);
