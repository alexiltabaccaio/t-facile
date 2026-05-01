import express from 'express';
import admRoutes from '../server/routes/admRoutes.js';

const app = express();

// Enable reading the real IP behind reverse proxies for the rate limiter
app.set("trust proxy", 1);

// Extended JSON parsing middleware to allow parsing of long text from PDFs
app.use(express.json({ limit: "10mb" }));

// API Routes
app.use("/api/adm", admRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", environment: "vercel-serverless" });
});

// On Vercel, this file exports the app as a serverless handler function
export default app;
