/**
 * 👤 特定ユーザーのサブスクリプション取得 API
 * /api/userSubscription/user/[userId]
 */

// CJS-friendly: avoid importing server TS modules at edge
interface VercelRequest {
  method?: string;
  headers: Record<string, string | undefined> & { [k: string]: any };
  query: Record<string, string | string[]>;
  body?: any;
}
interface VercelResponse {
  status: (n: number) => VercelResponse;
  json: (b: unknown) => void;
  setHeader: (k: string, v: string) => void;
  end: () => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query as { userId?: string };

  try {
    // 入力検証
    if (req.method === 'GET') {
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({
          message: 'User ID is required and must be a string',
          error: 'INVALID_USER_ID',
        });
      }

      // DB接続（direct）とモデル解決
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mongoLib = require('../../_lib/mongo');
      await mongoLib.connectMongoDirect();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { ensureUserSubscriptionModel } = require('../../_schemas/userSubscription.js');
      const UserSubscription = await ensureUserSubscriptionModel();
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

      // DB接続（direct）
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mongoLib2 = require('../../_lib/mongo');
      await mongoLib2.connectMongoDirect();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const {
        ensureUserSubscriptionModel: ensure2,
      } = require('../../_schemas/userSubscription.js');
      const UserSubscription2 = await ensure2();
      const updates = { ...(req.body as object), updatedAt: new Date() } as Record<string, unknown>;
      const doc = await UserSubscription2.findOneAndUpdate(
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

      // DB接続（direct）
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mongoLib3 = require('../../_lib/mongo');
      await mongoLib3.connectMongoDirect();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const {
        ensureUserSubscriptionModel: ensure3,
      } = require('../../_schemas/userSubscription.js');
      const UserSubscription3 = await ensure3();
      const doc = await UserSubscription3.findOneAndUpdate(
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
