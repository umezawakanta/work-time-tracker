import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../_lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const { db } = await connectToDatabase();

    // 全資産データを取得
    const allAssets = await db.collection('assets').find({ userId }).toArray();

    // 銀行口座関連の資産データを取得
    const bankAssets = await db
      .collection('assets')
      .find({
        userId,
        $or: [{ _id: { $regex: /^bank_/ } }, { account: { $regex: /銀行|残高別|普通|貯蓄|定期/ } }],
      })
      .toArray();

    // 負債データを取得
    const allDebts = await db.collection('debts').find({ userId }).toArray();

    // 統計情報を計算
    const totalAssets = allAssets.length;
    const bankAssetsCount = bankAssets.length;
    const totalDebts = allDebts.length;
    const totalValue = allAssets.reduce((sum, asset) => sum + (asset.value || 0), 0);
    const bankValue = bankAssets.reduce((sum, asset) => sum + (asset.value || 0), 0);

    // 重複チェック
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

    return res.status(200).json({
      success: true,
      totalAssets,
      bankAssets: bankAssetsCount,
      totalDebts,
      totalValue,
      bankValue,
      duplicates: duplicates.length,
      duplicateItems: duplicates.slice(0, 10), // 最初の10件の重複を返す
      recentAssets: allAssets
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
        )
        .slice(0, 5), // 最新の5件
      message: `デバッグ情報: 総資産${totalAssets}件、銀行関連${bankAssetsCount}件、重複${duplicates.length}件`,
    });
  } catch (error) {
    console.error('Error fetching debug data:', error);
    return res.status(500).json({
      success: false,
      message: 'デバッグデータの取得中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
