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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
