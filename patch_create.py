import re

with open('server.ts', 'r') as f:
    code = f.read()

old = """
  app.post("/api/uddoktapay/create", async (req, res) => {
    try {
      const { amount, uid, name, email } = req.body;
      if (!amount || !uid) return res.status(400).json({ error: "Amount and uid required" });
      
      const db = admin.firestore();
      
      // Store pending deposit
      const docRef = await db.collection("payment_requests").add({
        userId: uid,
        amount: Number(amount),
        method: "UddoktaPay",
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
"""
new = """
  app.post("/api/uddoktapay/create", async (req, res) => {
    try {
      const { amount, uid, name, email, type = "deposit" } = req.body;
      if (!amount || !uid) return res.status(400).json({ error: "Amount and uid required" });
      
      const db = admin.firestore();
      
      // Store pending request
      const docRef = await db.collection("payment_requests").add({
        userId: uid,
        amount: Number(amount),
        method: "UddoktaPay",
        type: type,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
"""

code = code.replace(old.strip(), new.strip())

with open('server.ts', 'w') as f:
    f.write(code)

print("patched create")
