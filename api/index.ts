// Vercel serverless entrypoint: wraps the Express app from server/src/app.ts.
// Env vars are injected natively by Vercel (no dotenv needed here).
import app from '../server/src/app';

export default function handler(req: any, res: any) {
  return app(req, res);
}
