import re

with open('server.ts', 'r') as f:
    code = f.read()

import_statement = "import nodemailer from 'nodemailer';\n"
if "import nodemailer" not in code:
    code = import_statement + code

# Insert before app.listen
routes = """
  app.post("/api/auth/send-otp", async (req, res) => {
    if (!firebaseAdminApp) {
       return res.status(500).json({ error: "Firebase Admin is not configured." });
    }
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      const db = admin.firestore();
      await db.collection("password_resets").doc(email).set({
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        uid: userRecord.uid
      });

      // Send email via Nodemailer
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"Support" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "Your Password Reset OTP",
          text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
          html: `<p>Your OTP for password reset is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>`,
        });
      } else {
        console.warn(`[OTP Generated] Email: ${email}, OTP: ${otp} (SMTP not configured)`);
        // For testing purposes in absence of SMTP, we might return it in development
        // return res.json({ success: true, message: "OTP logged to console. Configure SMTP." });
      }

      return res.json({ success: true, message: "OTP sent successfully" });
    } catch (err: any) {
      console.error("OTP Error:", err);
      if (err.code === 'auth/user-not-found') {
         return res.status(404).json({ error: "No account found with this email" });
      }
      return res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    if (!firebaseAdminApp) {
       return res.status(500).json({ error: "Firebase Admin is not configured." });
    }
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: "Missing fields" });

    try {
      const db = admin.firestore();
      const docRef = db.collection("password_resets").doc(email);
      const docSnap = await docRef.get();
      
      if (!docSnap.exists) {
        return res.status(400).json({ error: "No OTP found or expired" });
      }
      
      const data = docSnap.data();
      if (data?.otp !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
      }
      
      if (Date.now() > data?.expiresAt) {
        return res.status(400).json({ error: "OTP expired" });
      }

      // Update user password
      await admin.auth().updateUser(data.uid, { password: newPassword });
      
      // Delete OTP
      await docRef.delete();

      return res.json({ success: true, message: "Password updated successfully" });
    } catch (err: any) {
      console.error("Reset Error:", err);
      return res.status(500).json({ error: "Failed to reset password" });
    }
  });

"""
code = code.replace('  app.listen(PORT, "0.0.0.0", () => {', routes + '  app.listen(PORT, "0.0.0.0", () => {')

with open('server.ts', 'w') as f:
    f.write(code)

print("Server patched for OTP")
