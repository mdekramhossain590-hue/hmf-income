const admin = require('firebase-admin');
const serviceAccount = require('./firebase-applet-config.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function run() {
  const reqs = await db.collection('payment_requests').orderBy('createdAt', 'desc').limit(5).get();
  reqs.forEach(d => console.log(d.id, d.data().type, d.data().status));
}
run();
