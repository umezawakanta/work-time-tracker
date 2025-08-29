import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../lib/cors';
import { connectDB } from '../../src/server/config/database';
import { DailyOutcome } from '../../src/server/models/DailyOutcome';
import { getLocalYyyyMmDd } from '../../src/utils/dateUtils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();
  } catch (e) {
    return res
      .status(200)
      .json({ success: true, message: 'DB未接続（プレビュー環境）', data: null });
  }

  const userId = (req.headers['x-user-id'] as string) || '';
  if (!userId) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

  if (req.method === 'GET') {
    const date = (req.query.date as string) || getLocalYyyyMmDd();
    const doc = await DailyOutcome.findOne({ userId, date }).lean();
    return res.status(200).json({ success: true, data: doc || null });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const date = (body.date as string) || getLocalYyyyMmDd();
    const payload = {
      userId,
      date,
      winCondition: String(body.winCondition || ''),
      criteria: Array.isArray(body.criteria) ? body.criteria.map(String) : [],
      createdBy: (body.createdBy as any) || 'ai',
      result: (body.result as any) || 'pending',
      score: typeof body.score === 'number' ? body.score : undefined,
      notes: typeof body.notes === 'string' ? body.notes : undefined,
    };
    if (!payload.winCondition)
      return res.status(400).json({ success: false, error: 'winCondition required' });
    const doc = await DailyOutcome.findOneAndUpdate(
      { userId, date },
      { $set: payload },
      { upsert: true, new: true }
    ).lean();
    return res.status(200).json({ success: true, data: doc });
  }

  if (req.method === 'PATCH') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const date = (body.date as string) || getLocalYyyyMmDd();
    const update: any = {};
    if (body.result) update.result = body.result;
    if (typeof body.score === 'number') update.score = body.score;
    if (typeof body.notes === 'string') update.notes = body.notes;
    const doc = await DailyOutcome.findOneAndUpdate(
      { userId, date },
      { $set: update },
      { new: true }
    ).lean();
    return res.status(200).json({ success: true, data: doc });
  }

  return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });
}
