import re

with open('server.ts', 'r') as f:
    code = f.read()

zinipay_routes = """
  app.post("/api/zinipay/create", async (req, res) => {
    try {
      const { amount, uid } = req.body;
      if (!amount || !uid) return res.status(400).json({ error: "Amount and uid required" });
      
      const db = admin.firestore();
      
      // Store pending deposit
      const docRef = await db.collection("payment_requests").add({
        userId: uid,
        amount: Number(amount),
        method: "ZiniPay",
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const apiKey = process.env.ZINIPAY_API_KEY;
      if (!apiKey) {
         return res.status(500).json({ error: "ZiniPay API Key not configured in .env" });
      }

      // Ensure domain is correctly set in ZiniPay dashboard.
      const baseUrl = req.protocol + '://' + req.get('host');
      const response = await fetch("https://api.zinipay.com/v1/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "zini-api-key": apiKey
        },
        body: JSON.stringify({
          amount: Number(amount),
          redirect_url: `${baseUrl}/payment/success?id=${docRef.id}`,
          cancel_url: `${baseUrl}/payment/cancel`,
          metadata: { depositId: docRef.id, uid }
        })
      });

      const data = await response.json();
      if (data && data.url) {
         return res.json({ url: data.url });
      } else {
         console.error("ZiniPay Create Error:", data);
         return res.status(400).json({ error: "Failed to create ZiniPay invoice." });
      }

    } catch(err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Error" });
    }
  });
"""

code = code.replace('  app.listen(PORT, "0.0.0.0", () => {', zinipay_routes + '  app.listen(PORT, "0.0.0.0", () => {')

with open('server.ts', 'w') as f:
    f.write(code)

print("Added ZiniPay to server")
