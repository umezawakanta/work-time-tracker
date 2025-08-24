import type { VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { cors } from '../../../lib/cors';
import { withAuth, type AuthenticatedRequest } from '../../../src/middleware/auth';

const BodySchema = z.object({
  courseId: z.string().min(1).max(128),
  progress: z.number().min(0).max(100),
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
    console.log('LEARNING_PROGRESS_SAVE', { userId: req.user?.userId, ...parsed.data });
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('LEARNING_PROGRESS_SAVE_ERROR', e);
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
}

export default withAuth(handler, { requireAuth: true });
