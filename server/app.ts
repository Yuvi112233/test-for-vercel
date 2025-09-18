import dotenv from 'dotenv';
// Load environment variables as early as possible
dotenv.config();

import express from 'express';
import { registerRoutes } from './routes';
import { errorHandler } from './errorHandler';

// Build an express app without starting a listener.
// This is used by both local dev server (server/index.ts) and Vercel serverless (api/index.ts).
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development', time: new Date().toISOString() });
});

// Register all API routes with websockets ENABLED by default; the server may override.
// In Vercel serverless, we will re-register with websockets disabled by calling registerRoutes again.
// To avoid duplicate handlers, we only register when explicitly called by consumers.

// Export a function to initialize routes, allowing consumers to choose websocket behavior
export const initRoutes = async (enableWebSockets: boolean) => {
  const server = await registerRoutes(app, { enableWebSockets });
  // Attach custom error handler after routes
  app.use(errorHandler);
  return server;
};

export default app;
