import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not set');
}

const client = new MongoClient(uri);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    await client.connect();
    const db = client.db();

    // 全資産データを取得（制限付き）
    const allAssets = await db.collection('assets').find({ userId }).limit(100).toArray();

    // 銀行口座関連の資産データを取得
    const allBankAssets = await db.collection('assets').find({ userId }).toArray();
    const bankAssets = allBankAssets
      .filter(
        (asset) =>
          asset._id?.toString().startsWith('bank_') ||
          /銀行|残高別|普通|貯蓄|定期/.test(asset.account || '')
      )
      .slice(0, 50);

    // 負債データを取得
    const allDebts = await db.collection('debts').find({ userId }).limit(50).toArray();

    // 統計情報を計算
    const totalAssetsCount = await db.collection('assets').countDocuments({ userId });
    const totalDebtsCount = await db.collection('debts').countDocuments({ userId });
    const bankAssetsCount = bankAssets.length;

    // 重複チェック（サンプル）
    const seen = new Set();
    const duplicates = [];
    allAssets.forEach((asset) => {
      const key = `${asset.account}_${asset.value}_${asset.date}`;
      if (seen.has(key)) {
        duplicates.push(asset);
      } else {
        seen.add(key);
      }
    });

    // データベース接続テスト
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);

    return res.status(200).json({
      success: true,
      database: {
        connected: true,
        collections: collectionNames,
      },
      counts: {
        totalAssets: totalAssetsCount,
        bankAssets: bankAssetsCount,
        totalDebts: totalDebtsCount,
        duplicates: duplicates.length,
      },
      samples: {
        allAssets: allAssets.slice(0, 10),
        bankAssets: bankAssets.slice(0, 10),
        allDebts: allDebts.slice(0, 10),
        duplicates: duplicates.slice(0, 5),
      },
      userId: userId,
      message: `詳細デバッグ: 総資産${totalAssetsCount}件、銀行関連${bankAssetsCount}件、重複${duplicates.length}件`,
    });
  } catch (error) {
    console.error('Error fetching detailed debug data:', error);
    return res.status(500).json({
      success: false,
      message: '詳細デバッグデータの取得中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}
