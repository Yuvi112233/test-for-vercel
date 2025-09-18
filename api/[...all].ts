import { VercelRequest, VercelResponse } from '@vercel/node';
import app, { initRoutes } from '../server/app';
import { connectDB } from '../server/db';

// Catch-all API function to handle all routes under /api/*
// This preserves the original path (e.g., /api/auth/login) for Express
// Ensure we only initialize once per cold start
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g: any = globalThis as any;

if (!g.__smartq_inited) {
  g.__smartq_inited = (async () => {
    await connectDB().catch((e) => {
      console.error('Vercel serverless DB connect error:', e);
    });
    await initRoutes(false); // Disable WebSockets on serverless
  })();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (g.__smartq_inited && typeof g.__smartq_inited.then === 'function') {
    await g.__smartq_inited;
    g.__smartq_inited = true;
  }
  // Delegate to Express
  return app(req as any, res as any);
}
