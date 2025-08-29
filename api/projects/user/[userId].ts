import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { cors } from '../../../lib/cors';
import { connectDB } from '../../../src/server/config/database';
import { Project as ProjectModel } from '../../../src/server/models/Project';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'Only GET method is supported',
    });
  }

  const { userId: userIdParam } = req.query as { userId?: string };

  try {
    // Resolve userId from param or token/header
    let resolvedUserId = userIdParam || '';

    if (!resolvedUserId) {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
      if (token) {
        try {
          const decoded: any = jwt.verify(
            token,
            process.env.JWT_SECRET || 'fallback-secret-for-development',
            { issuer: 'work-time-tracker', audience: 'work-time-tracker-users' }
          );
          resolvedUserId = decoded.userId || decoded.sub || '';
        } catch {}
      }
      if (!resolvedUserId) {
        const h = req.headers['x-user-id'];
        if (typeof h === 'string') resolvedUserId = h;
      }
    }

    if (!resolvedUserId) {
      return res.status(400).json({ success: false, error: 'Missing userId' });
    }

    const hasDb = Boolean(process.env.MONGODB_URI);
    if (!hasDb) {
      return res.status(503).json({
        success: false,
        error: 'DB_NOT_CONFIGURED',
        message: '環境変数 MONGODB_URI が未設定です',
      });
    }

    try {
      await connectDB();
    } catch (e) {
      return res
        .status(503)
        .json({ success: false, error: 'DB_CONNECTION_FAILED', message: 'DB接続に失敗しました' });
    }

    const docs = await ProjectModel.find({ userId: resolvedUserId })
      .sort({ updatedAt: -1 })
      .limit(200);
    return res.status(200).json(docs);
  } catch (error) {
    console.error('Error in GET /api/projects/user/:userId', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
