import re

with open('server.ts', 'r') as f:
    code = f.read()

new_endpoint = """
  app.post("/api/admin/change-password", async (req, res) => {
    if (!firebaseAdminApp) {
       return res.status(500).json({ error: "Firebase Admin is not configured." });
    }
    const { uid, newPassword } = req.body;
    if (!uid || !newPassword) return res.status(400).json({ error: "Missing fields" });

    try {
      await admin.auth().updateUser(uid, { password: newPassword });
      return res.json({ success: true, message: "Password updated successfully" });
    } catch (err: any) {
      console.error("Change Password Error:", err);
      return res.status(500).json({ error: "Failed to change password" });
    }
  });
"""

code = code.replace('app.post("/api/uddoktapay/create"', new_endpoint.strip() + '\n\n  app.post("/api/uddoktapay/create"')

with open('server.ts', 'w') as f:
    f.write(code)

print("Server patched")
