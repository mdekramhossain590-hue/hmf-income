import nodemailer from 'nodemailer';
import admin from 'firebase-admin';
import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;


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

async function startServer() {

  const app = express();
  const PORT = 3000;
  app.use(express.json());

  app.get("/api/download-zip", (req, res) => {
    const filePath = path.join(process.cwd(), "dist.zip");
    res.download(filePath, "dist.zip", (err) => {
      if (err) {
        console.error("Download error:", err);
        if (!res.headersSent) {
          res.status(500).send("File not found. Please regenerate the zip archive.");
        }
      }
    });
  });

  app.get("/api/download-tar", (req, res) => {
    const filePath = path.join(process.cwd(), "dist.tar.gz");
    res.download(filePath, "dist.tar.gz", (err) => {
      if (err) {
        console.error("Download error:", err);
        if (!res.headersSent) {
          res.status(500).send("File not found.");
        }
      }
    });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: "Gemini API key is not configured." });
      }
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages format" });
      }

      const prompt = messages[messages.length - 1].text || "";
      if (!prompt) { 
        return res.status(400).json({ error: "Prompt is required" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a helpful AI support agent for Digital Root. Provide concise, friendly answers in Bengali language (or English if prompted).",
        }
      });
      return res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Error:", error);
      return res.status(500).json({ error: "Failed to generate AI response" });
    }
  });


  
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

      const apiKey = process.env.UDDOKTAPAY_API_KEY;
      let apiBaseUrl = process.env.UDDOKTAPAY_BASE_URL || process.env.UDDOKTAPAY_BASE_URI;
      
      if (!apiKey || !apiBaseUrl) {
         return res.status(500).json({ error: "UddoktaPay API credentials not configured in .env" });
      }

      apiBaseUrl = apiBaseUrl.replace(/\/+$/, '').replace(/\/api$/, '');

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


  app.post("/api/uddoktapay/webhook", async (req, res) => {
    try {
      const apiKey = process.env.UDDOKTAPAY_API_KEY;
      const signature = req.headers['rt-uddoktapay-api-key'];
      if (!apiKey || signature !== apiKey) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { status, amount, metadata, transaction_id, payment_method, sender_number } = req.body;
      if (status === 'COMPLETED' && metadata && metadata.depositId && metadata.uid) {
        const db = admin.firestore();
        const docRef = db.collection("payment_requests").doc(metadata.depositId);
        
        await db.runTransaction(async (t) => {
          const docSnap = await t.get(docRef);
          if (!docSnap.exists) return;
          
          const data = docSnap.data();
          if (data.status === 'completed') return; // Already processed
          
          t.update(docRef, {
            status: 'completed',
            trxId: transaction_id || '',
            method: payment_method || 'UddoktaPay',
            account: sender_number || ''
          });
          
          // Also create a transaction record
          const transRef = db.collection("users").doc(metadata.uid).collection("transactions").doc(metadata.depositId);
          t.set(transRef, {
            amount: Number(amount),
            type: data.type || 'deposit',
            status: 'completed',
            method: payment_method || 'UddoktaPay',
            trxId: transaction_id || '',
            account: sender_number || '',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });

          const profileRef = db.collection("users").doc(metadata.uid);
          if (data.type === 'activation') {
             t.update(profileRef, {
               "balances.bonus": admin.firestore.FieldValue.increment(10),
               isActive: true
             });
             const leaderboardRef = db.collection("leaderboard").doc(metadata.uid);
             t.set(leaderboardRef, { bonus: admin.firestore.FieldValue.increment(10), totalIncome: admin.firestore.FieldValue.increment(10) }, { merge: true });
          } else {
             t.update(profileRef, {
               "balances.main": admin.firestore.FieldValue.increment(Number(amount))
             });
          }
        });
      }
      return res.status(200).send("OK");
    } catch (err) {
      console.error("Webhook Error:", err);
      return res.status(500).json({ error: "Internal Error" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api') || req.originalUrl.includes('.')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const templatePath = path.resolve(process.cwd(), 'index.html');
        if (fs.existsSync(templatePath)) {
          let template = fs.readFileSync(templatePath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } else {
          next();
        }
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
