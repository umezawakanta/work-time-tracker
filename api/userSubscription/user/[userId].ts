/**
 * 👤 特定ユーザーのサブスクリプション取得 API
 * /api/userSubscription/user/[userId]
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../../src/server/config/database';
import { UserSubscription } from '../../../src/server/models/userSubscription';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query;

  try {
    // 入力検証
    if (req.method === 'GET') {
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({
          message: 'User ID is required and must be a string',
          error: 'INVALID_USER_ID',
        });
      }

      // DB接続
      try {
        await connectDB();
      } catch (_) {
        return res.status(503).json({ message: 'Service unavailable (DB connection failed)' });
      }

      const doc = await UserSubscription.findOne({ userId: String(userId) });
      if (!doc) {
        return res.status(404).json({
          message: 'User subscription not found',
          error: 'SUBSCRIPTION_NOT_FOUND',
          userId: userId,
        });
      }

      return res.status(200).json(doc);
    }

    if (req.method === 'PUT') {
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({
          message: 'User ID is required and must be a string',
          error: 'INVALID_USER_ID',
        });
      }

      try {
        await connectDB();
      } catch (_) {
        return res.status(503).json({ message: 'Service unavailable (DB connection failed)' });
      }

      const updates = { ...(req.body as object), updatedAt: new Date() } as Record<string, unknown>;
      const doc = await UserSubscription.findOneAndUpdate(
        { userId: String(userId) },
        { $set: updates },
        { new: true, runValidators: true }
      );
      if (!doc) {
        return res.status(404).json({ message: 'User subscription not found' });
      }
      return res.status(200).json(doc);
    }

    if (req.method === 'DELETE') {
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({
          message: 'User ID is required and must be a string',
          error: 'INVALID_USER_ID',
        });
      }

      try {
        await connectDB();
      } catch (_) {
        return res.status(503).json({ message: 'Service unavailable (DB connection failed)' });
      }

      const doc = await UserSubscription.findOneAndUpdate(
        { userId: String(userId) },
        { $set: { status: 'canceled', cancelAtPeriodEnd: true, canceledAt: new Date() } },
        { new: true, runValidators: true }
      );
      if (!doc) {
        return res.status(404).json({ message: 'User subscription not found' });
      }
      return res.status(200).json(doc);
    }

    return res.status(405).json({
      message: 'Method not allowed',
      allowedMethods: ['GET', 'PUT', 'DELETE'],
    });
  } catch (error) {
    console.error(`UserSubscription API error for user ${userId}:`, error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: userId,
    });
  }
}
