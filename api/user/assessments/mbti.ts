import type { VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { cors } from '../../../lib/cors';
import { withAuth, type AuthenticatedRequest } from '../../../src/middleware/auth';
import { allowRequest, getResetMs } from '../../../lib/limiter';

const BodySchema = z.object({
  type: z.string().regex(/^[EI][SN][TF][JP]$/i),
  scores: z.object({
    EI: z.number().int().min(-1000).max(1000),
    SN: z.number().int().min(-1000).max(1000),
    TF: z.number().int().min(-1000).max(1000),
    JP: z.number().int().min(-1000).max(1000),
  }),
});

async function handler(req: AuthenticatedRequest, res: VercelResponse): Promise<void> {
  await cors(req, res);
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ success: false, message: 'Method not allowed' }); return; }
  try {
    const key = `mbti:${req.user?.userId}`;
    if (!allowRequest(key, 5, 60_000)) {
      res.setHeader('Retry-After', Math.ceil(getResetMs(key) / 1000).toString());
      res.status(429).json({ success: false, message: 'Rate limit exceeded' });
      return;
    }
    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid body', issues: parsed.error.flatten() });
      return;
    }
    console.log('MBTI_RESULT_SAVE', { userId: req.user?.userId, ...parsed.data });
    res.status(200).json({ success: true });
    return;
  } catch (e) {
    console.error('MBTI_SAVE_ERROR', e);
    res.status(500).json({ success: false, message: 'Internal error' });
    return;
  }
}

export default withAuth(handler, { requireAuth: true });
