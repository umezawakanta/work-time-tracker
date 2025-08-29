import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../lib/cors';
import { connectDB } from '../../src/server/config/database';
import type { DailyOutcomeRecord, DailyWinCondition } from '../../src/types/dailyVictory';

// Minimal in-function model to avoid ESM path pitfalls in serverless
import mongoose, { Schema, Document, Model } from 'mongoose';

interface DailyVictoryDoc extends Document {
  userId: string;
  date: string; // YYYY-MM-DD
  winCondition: string;
  criteria: string[];
  result: 'win' | 'lose' | 'pending';
  score?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailyVictorySchema = new Schema<DailyVictoryDoc>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    winCondition: { type: String, required: true },
    criteria: [{ type: String, required: true }],
    result: { type: String, enum: ['win', 'lose', 'pending'], default: 'pending', required: true },
    score: { type: Number },
    notes: { type: String },
  },
  { timestamps: true, versionKey: false }
);

let DailyVictoryModel: Model<DailyVictoryDoc>;
try {
  DailyVictoryModel = mongoose.model<DailyVictoryDoc>('DailyVictory');
} catch {
  DailyVictoryModel = mongoose.model<DailyVictoryDoc>('DailyVictory', DailyVictorySchema);
}

function getUserId(req: VercelRequest): string | null {
  const h = req.headers;
  const byHeader = (h['x-user-id'] as string) || (h['x-user'] as string);
  if (byHeader && byHeader.trim()) return byHeader.trim();
  return null;
}

const todayKey = () => new Date().toISOString().slice(0, 10);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: '認証が必要です' });
      return;
    }

    const hasDb = Boolean(process.env.MONGODB_URI);
    if (hasDb) {
      await connectDB();
    }

    if (req.method === 'GET') {
      const limit = Math.max(1, Math.min(90, Number(req.query.limit || 1)));
      // limit=1 => today; otherwise history (latest first)
      if (limit === 1) {
        const doc = hasDb
          ? await DailyVictoryModel.findOne({ userId, date: todayKey() }).lean<DailyVictoryDoc>()
          : null;
        const data: DailyOutcomeRecord | null = doc
          ? {
              date: doc.date,
              winCondition: doc.winCondition,
              criteria: doc.criteria,
              result: doc.result,
              score: doc.score,
              notes: doc.notes,
              createdAt: doc.createdAt?.toISOString(),
              updatedAt: doc.updatedAt?.toISOString(),
            }
          : null;
        res.status(200).json({ success: true, data });
        return;
      }

      const docs = hasDb
        ? await DailyVictoryModel.find({ userId })
            .sort({ date: -1 })
            .limit(limit)
            .lean<DailyVictoryDoc[]>()
        : [];
      const data: DailyOutcomeRecord[] = (docs || []).map((d) => ({
        date: d.date,
        winCondition: d.winCondition,
        criteria: d.criteria,
        result: d.result,
        score: d.score,
        notes: d.notes,
        createdAt: d.createdAt?.toISOString(),
        updatedAt: d.updatedAt?.toISOString(),
      }));
      res.status(200).json({ success: true, data });
      return;
    }

    if (req.method === 'POST') {
      if (!hasDb) {
        res.status(503).json({ success: false, message: 'DB未設定（MONGODB_URI）' });
        return;
      }
      const body = (req.body || {}) as DailyWinCondition;
      if (!body?.winCondition || !Array.isArray(body?.criteria) || body.criteria.length === 0) {
        res.status(400).json({ success: false, message: 'winCondition と criteria は必須です' });
        return;
      }
      const date = body.date || todayKey();
      const updated = await DailyVictoryModel.findOneAndUpdate(
        { userId, date },
        {
          userId,
          date,
          winCondition: String(body.winCondition),
          criteria: body.criteria.map(String),
          result: 'pending',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      res.status(200).json({
        success: true,
        data: {
          date: updated.date,
          winCondition: updated.winCondition,
          criteria: updated.criteria,
          result: updated.result,
          score: updated.score,
          notes: updated.notes,
          createdAt: updated.createdAt?.toISOString(),
          updatedAt: updated.updatedAt?.toISOString(),
        },
      });
      return;
    }

    if (req.method === 'PATCH') {
      if (!hasDb) {
        res.status(503).json({ success: false, message: 'DB未設定（MONGODB_URI）' });
        return;
      }
      const { result, notes, score } = (req.body || {}) as {
        result?: 'win' | 'lose';
        notes?: string;
        score?: number;
      };
      if (!result || (result !== 'win' && result !== 'lose')) {
        res.status(400).json({ success: false, message: 'result は win か lose が必要です' });
        return;
      }
      const date = todayKey();
      const updated = await DailyVictoryModel.findOneAndUpdate(
        { userId, date },
        { result, notes, score },
        { new: true }
      );
      if (!updated) {
        res.status(404).json({ success: false, message: '本日の勝利条件が未設定です' });
        return;
      }
      res.status(200).json({
        success: true,
        data: {
          date: updated.date,
          winCondition: updated.winCondition,
          criteria: updated.criteria,
          result: updated.result,
          score: updated.score,
          notes: updated.notes,
          createdAt: updated.createdAt?.toISOString(),
          updatedAt: updated.updatedAt?.toISOString(),
        },
      });
      return;
    }

    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (e) {
    console.error('❌ Daily Victory API error:', e);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
