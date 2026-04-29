import express from 'express';
import admRoutes from '../server/routes/admRoutes.js';

const app = express();

// Abilita la lettura dell'IP reale dietro i reverse proxy per il rate limiter
app.set("trust proxy", 1);

// JSON parsing middleware esteso per consentire parsing testuale lungo proveniente dal PDF
app.use(express.json({ limit: "10mb" }));

// API Routes
app.use("/api/adm", admRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", environment: "vercel-serverless" });
});

// Su Vercel, questo file esporta l'app come funzione serverless handler
export default app;
