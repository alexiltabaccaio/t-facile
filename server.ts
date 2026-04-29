import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import admRoutes from "./server/routes/admRoutes.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Abilita la lettura dell'IP reale dietro i reverse proxy (es. Google Cloud Run) per il rate limiter
  app.set("trust proxy", 1);

  // JSON parsing middleware esteso per consentire parsing testuale lungo proveniente dal PDF
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
