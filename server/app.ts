import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import admRoutes from "./routes/admRoutes.js";

export async function createApp() {
  const app = express();

  // Enables reading real IP behind reverse proxies (e.g., Google Cloud Run) for the rate limiter
  app.set("trust proxy", 1);

  // Extended JSON parsing middleware to allow large text parsing from PDFs
  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.use("/api/adm", admRoutes);

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}
