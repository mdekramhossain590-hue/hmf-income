import nodemailer from 'nodemailer';
import admin from 'firebase-admin';
import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'test',
  port: Number(process.env.MYSQL_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
});

async function initMySQL() {
  try {
    const connection = await pool.getConnection();
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS app_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_name VARCHAR(255) NOT NULL,
        user_photo VARCHAR(255),
        rating INT NOT NULL DEFAULT 5,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("MySQL Database Initialized & Tables Created.");
    connection.release();
  } catch (error: any) {
    if (error.code === 'ETIMEDOUT') {
      console.error("MySQL Initialization Error: Connection Timed Out.");
      console.error("IMPORTANT: Your database server (server.procloudify.com) is blocking the connection.");
      console.error("If you are using cPanel, you must go to 'Remote MySQL' and whitelist our IP address (or use '%' to allow all IPs) to allow external connections on port 3306.");
    } else {
      console.error("MySQL Initialization Error:", error);
    }
  }
}
initMySQL();


const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;


let firebaseAdminApp: any;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      firebaseAdminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("Firebase Admin Initialized successfully.");
    } catch (parseError) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT. Make sure it is a valid JSON object, not a code snippet.");
    }
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT env variable is missing. Push notifications won't work.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
}

async function startServer() {

  const app = express();
  const PORT = process.env.PORT || 3000;
  app.use(express.json());

  
  app.get("/api/mysql-reviews", async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM app_reviews ORDER BY created_at DESC');
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/mysql-reviews", async (req, res) => {
    try {
      const { user_name, user_photo, rating, comment } = req.body;
      if (!user_name || !comment) return res.status(400).json({ error: "Missing fields" });
      
      const [result] = await pool.execute(
        'INSERT INTO app_reviews (user_name, user_photo, rating, comment) VALUES (?, ?, ?, ?)',
        [user_name, user_photo || '', Number(rating) || 5, comment]
      );
      res.json({ success: true, id: (result as any).insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to post review" });
    }
  });

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
       const db: any = admin.firestore();
       let tokens = [];
       
       if (userId === 'all') {
          const usersSnap = await db.collection('users').where('fcmToken', '!=', null).get();
          usersSnap.forEach((doc: any) => {
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
      
      const db: any = admin.firestore();
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
      const db: any = admin.firestore();
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

  app.post("/api/uddoktapay/create", async (req, res) => {
    try {
      const { amount, uid, name, email, type = "deposit" } = req.body;
      if (!amount || !uid) return res.status(400).json({ error: "Amount and uid required" });
      
      const db: any = admin.firestore();
      
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


  
  app.post("/api/ads/claim", async (req, res) => {
    if (!firebaseAdminApp) {
       return res.status(500).json({ error: "Firebase Admin is not configured." });
    }
    const { uid, adId } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown";

    if (!uid || !adId) return res.status(400).json({ error: "Missing fields" });

    try {
      const db: any = admin.firestore();
      
      // Get settings
      const settingsSnap = await db.collection("settings").doc("adsIncome").get();
      const settings = settingsSnap.data() || {};
      const rewardAmount = Number(settings.rewardPerAdView) || 0.50;
      const dailyLimit = Number(settings.dailyAdLimit) || 20;

      // Start of day
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Check daily limit and if ad already claimed
      const viewsSnap = await db.collection("ad_views")
        .where("userId", "==", uid)
        .where("viewedAt", ">=", startOfDay)
        .get();
      
      if (viewsSnap.size >= dailyLimit) {
        return res.status(400).json({ error: "Daily ad limit reached." });
      }

      const alreadyClaimed = viewsSnap.docs.some((doc: any) => doc.data().adId === adId);
      if (alreadyClaimed) {
        return res.status(400).json({ error: "You have already claimed this ad." });
      }

      // Process reward
      await db.runTransaction(async (t: any) => {
        // Create ad view record
        const viewRef = db.collection("ad_views").doc();
        t.set(viewRef, {
          userId: uid,
          adId: adId,
          rewardAmount: rewardAmount,
          ipAddress: ipAddress,
          viewedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Update user wallet (Watch Ads)
        const userRef = db.collection("users").doc(uid);
        t.update(userRef, {
          "balances.tasks.Watch Ads": admin.firestore.FieldValue.increment(rewardAmount)
        });

        // Update leaderboard if needed
        const leaderboardRef = db.collection("leaderboard").doc(uid);
        t.set(leaderboardRef, { 
          totalIncome: admin.firestore.FieldValue.increment(rewardAmount)
        }, { merge: true });
      });

      return res.json({ success: true, rewardAmount, message: `Congratulations! ${rewardAmount} BDT added to your Ads Income Wallet.` });
    } catch (err: any) {
      console.error("Ad Claim Error:", err);
      return res.status(500).json({ error: "Failed to claim ad reward" });
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
        const db: any = admin.firestore();
        const docRef = db.collection("payment_requests").doc(metadata.depositId);
        
        await db.runTransaction(async (t: any) => {
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

  app.listen(PORT as number, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
// build fixed
