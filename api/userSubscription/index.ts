/**
 * 💰 ユーザーサブスクリプション API エンドポイント
 * ADHD/ASD生活支援サイトのサブスクリプション管理
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/database';
import { UserSubscription } from '../../src/server/models/userSubscription';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // DB接続必須
    try {
      await connectDB();
    } catch (e) {
      console.warn('UserSubscription API: DB not available');
      return res.status(503).json({ message: 'Service unavailable (DB connection failed)' });
    }

    if (req.method === 'GET') {
      // すべて、または userId 指定時は該当ユーザーのみ取得
      const userId = (req.query?.userId as string | undefined)?.trim();
      const docs = userId
        ? await UserSubscription.findOne({ userId })
        : await UserSubscription.find().sort({ updatedAt: -1 });
      return res.status(200).json(docs);
    }

    if (req.method === 'POST') {
      // 新しいサブスクリプションを作成
      const {
        userId,
        planId,
        status,
        currentPeriodEnd,
        cancelAtPeriodEnd = false,
        canceledAt,
        cancelReason,
        paymentMethod,
        scheduledChanges,
      } = (req.body || {}) as Record<string, unknown>;

      if (
        typeof userId !== 'string' ||
        typeof planId !== 'string' ||
        typeof status !== 'string' ||
        !['active', 'canceled', 'expired'].includes(status) ||
        !currentPeriodEnd
      ) {
        return res.status(400).json({
          message:
            'Invalid payload: require userId, planId, status(active|canceled|expired), currentPeriodEnd',
        });
      }

      // 既存レコードの重複チェック（userId はユニーク）
      const exists = await UserSubscription.findOne({ userId });
      if (exists) {
        return res.status(409).json({ message: 'Subscription already exists for this user' });
      }

      try {
        const doc = await UserSubscription.create({
          userId,
          planId,
          status,
          currentPeriodEnd: new Date(String(currentPeriodEnd)),
          cancelAtPeriodEnd: Boolean(cancelAtPeriodEnd),
          canceledAt: canceledAt ? new Date(String(canceledAt)) : undefined,
          cancelReason: typeof cancelReason === 'string' ? cancelReason : undefined,
          paymentMethod: paymentMethod as any,
          scheduledChanges: scheduledChanges as any,
        });
        return res.status(201).json(doc);
      } catch (err: any) {
        if (err?.code === 11000) {
          return res.status(409).json({ message: 'Duplicate subscription' });
        }
        throw err;
      }
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('UserSubscription API error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
