import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { configureApiRoutes } from "./appConfig.js";

export async function createApp() {
  const app = express();

  // Configure shared API routes and middleware
  configureApiRoutes(app);

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
