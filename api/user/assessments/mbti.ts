import type { VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { cors } from '../../../lib/cors';
import { withAuth, type AuthenticatedRequest } from '../../../src/middleware/auth';

const BodySchema = z.object({
  type: z.string().regex(/^[EI][SN][TF][JP]$/i),
  scores: z.object({
    EI: z.number().int().min(-1000).max(1000),
    SN: z.number().int().min(-1000).max(1000),
    TF: z.number().int().min(-1000).max(1000),
    JP: z.number().int().min(-1000).max(1000),
  }),
});

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid body', issues: parsed.error.flatten() });
    }
    console.log('MBTI_RESULT_SAVE', { userId: req.user?.userId, ...parsed.data });
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('MBTI_SAVE_ERROR', e);
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
}

export default withAuth(handler, { requireAuth: true });
