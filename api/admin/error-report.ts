interface VercelRequest {
  method?: string;
  headers: Record<string, string | undefined>;
  body?: unknown;
}
interface VercelResponse {
  status: (c: number) => VercelResponse;
  json: (b: unknown) => void;
  setHeader: (n: string, v: string) => void;
  end: () => void;
}
import { saveErrorReport } from '../_lib/errorStore';
import { cors } from '../../lib/cors';
import { rateLimit } from '../_utils/rateLimit';

const limiter = rateLimit({ windowMs: 60000, max: 30 });

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await cors(req as any, res as any);
  if (!(await limiter(req as any, res as any))) return;
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' } as any);
    return;
  }
  try {
    const { email, url, userAgent, message, stack, componentStack } = (req.body || {}) as Record<
      string,
      unknown
    >;
    await saveErrorReport({
      email: typeof email === 'string' ? email : undefined,
      url: typeof url === 'string' ? url : undefined,
      userAgent: typeof userAgent === 'string' ? userAgent : undefined,
      message: String(message || ''),
      stack: typeof stack === 'string' ? stack : undefined,
      componentStack: typeof componentStack === 'string' ? componentStack : undefined,
    });
    res.status(200).json({ success: true } as any);
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to save error report' } as any);
  }
}

module.exports = handler;
