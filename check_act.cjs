const admin = require('firebase-admin');
const serviceAccount = require('./firebase-applet-config.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function run() {
  const doc = await db.collection('settings').doc('activation').get();
  console.log('Exists?', doc.exists);
  if (doc.exists) console.log(doc.data());
}
run();
