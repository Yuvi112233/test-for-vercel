import dotenv from "dotenv";
// Load environment variables first
dotenv.config();

import express from "express";
import app, { initRoutes } from "./app";
import { setupVite } from "./vite";
import { connectDB } from "./db";
import { errorHandler } from "./errorHandler";
import path from "path";
import { fileURLToPath } from "url";

// Needed for serving static in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables already loaded at the top

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  const pathName = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (pathName.startsWith("/api")) {
      let logLine = `${req.method} ${pathName} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      console.log(logLine);
    }
  });

  next();
});


(async () => {
  // Ensure DB is connected for long-running server
  await connectDB().catch((e) => {
    console.error("DB connect failed:", e);
  });

  const server = await initRoutes(true);

  // Custom error handler
  app.use(errorHandler);

  const env = app.get("env") || "development";

  if (env === "development") {
    // Vite dev server for local dev
    await setupVite(app, server);
  } else {
  // ✅ Serve frontend build in production
// NOTE: server runs from dist/server.js, so frontend dist is at ../client/dist
const clientDistPath = path.resolve(__dirname, "../client/dist");

    app.use(express.static(clientDistPath));

    // Fallback for React Router
    app.get("*", (req, res) => {
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  }

  // Listen on Render’s port
  const port = parseInt(process.env.PORT || "5001", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
     console.log(`🚀 Serving on port ${port}`);
    }
  );
})();
