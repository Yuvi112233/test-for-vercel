import app, { initRoutes } from '../server/app';
import { connectDB } from '../server/db';

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

export default async function handler(req: any, res: any) {
  // Wait init on first request
  if (g.__smartq_inited && typeof g.__smartq_inited.then === 'function') {
    await g.__smartq_inited;
    g.__smartq_inited = true;
  }
  // Delegate to Express
  return app(req as any, res as any);
}
