import express from "express";
import admRoutes from "./routes/admRoutes.js";

/**
 * Configures shared middleware and routes for the Express application.
 * This ensures consistency between local development and Vercel serverless environments.
 */
export function configureApiRoutes(app: express.Express) {
  // Enable reading the real IP behind reverse proxies (e.g., Vercel, Cloud Run)
  app.set("trust proxy", 1);

  // Extended JSON parsing middleware to allow large payloads (e.g., PDF text)
  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.use("/api/adm", admRoutes);

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || "development"
    });
  });
}
