import re

with open('server.ts', 'r') as f:
    code = f.read()

# Removing ZiniPay
code = re.sub(r'  app\.post\("/api/zinipay/create", async \(req, res\) => \{.*?\}\);\n', '', code, flags=re.DOTALL)


uddoktapay_routes = """
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

      const apiKey = process.env.UDDOKTAPAY_API_KEY;
      const apiBaseUrl = process.env.UDDOKTAPAY_BASE_URL;
      
      if (!apiKey || !apiBaseUrl) {
         return res.status(500).json({ error: "UddoktaPay API credentials not configured in .env" });
      }

      const baseUrl = req.protocol + '://' + req.get('host');
      const response = await fetch(`${apiBaseUrl}/api/checkout-v2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "RT-UDDOKTAPAY-API-KEY": apiKey
        },
        body: JSON.stringify({
          full_name: name || "User",
          email: email || "user@example.com",
          amount: Number(amount).toString(),
          metadata: { depositId: docRef.id, uid },
          redirect_url: `${baseUrl}/payment/success?id=${docRef.id}`,
          cancel_url: `${baseUrl}/payment/cancel?id=${docRef.id}`,
          webhook_url: `${baseUrl}/api/uddoktapay/webhook`
        })
      });

      const data = await response.json();
      if (data && data.payment_url) {
         return res.json({ url: data.payment_url });
      } else {
         console.error("UddoktaPay Create Error:", data);
         return res.status(400).json({ error: "Failed to create UddoktaPay invoice." });
      }

    } catch(err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Error" });
    }
  });
"""

if "app.post(\"/api/uddoktapay/create\"" not in code:
    code = code.replace('  app.listen(PORT, "0.0.0.0", () => {', uddoktapay_routes + '\n  app.listen(PORT, "0.0.0.0", () => {')

with open('server.ts', 'w') as f:
    f.write(code)

print("Added UddoktaPay to server")
