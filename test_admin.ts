import admin from 'firebase-admin';
admin.initializeApp({
  projectId: "hmf-income-app",
});
async function run() {
  try {
    const users = await admin.auth().listUsers(10);
    console.log("Success! Users found:", users.users.length);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
