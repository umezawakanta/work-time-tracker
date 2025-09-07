import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not set');
}

const client = new MongoClient(uri);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { userId, cleanupType = 'all' } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    await client.connect();
    const db = client.db();

    let results = {
      deletedAssets: 0,
      deletedDebts: 0,
      deletedBankAssets: 0,
      deletedDuplicates: 0,
      totalDeleted: 0,
    };

    console.log(`Starting force cleanup for user: ${userId}, type: ${cleanupType}`);

    if (cleanupType === 'all' || cleanupType === 'assets') {
      // 全資産データを削除
      const assetResult = await db.collection('assets').deleteMany({ userId });
      results.deletedAssets = assetResult.deletedCount;
      console.log(`Deleted ${assetResult.deletedCount} assets`);
    }

    if (cleanupType === 'all' || cleanupType === 'debts') {
      // 全負債データを削除
      const debtResult = await db.collection('debts').deleteMany({ userId });
      results.deletedDebts = debtResult.deletedCount;
      console.log(`Deleted ${debtResult.deletedCount} debts`);
    }

    if (cleanupType === 'all' || cleanupType === 'bank') {
      // 銀行口座関連データを削除
      const allAssets = await db.collection('assets').find({ userId }).toArray();
      const bankAssetIds = allAssets
        .filter(
          (asset) =>
            asset._id?.toString().startsWith('bank_') ||
            /銀行|残高別|普通|貯蓄|定期/.test(asset.account || '')
        )
        .map((asset) => asset._id);

      const bankResult = await db.collection('assets').deleteMany({
        _id: { $in: bankAssetIds },
      });
      results.deletedBankAssets = bankResult.deletedCount;
      console.log(`Deleted ${bankResult.deletedCount} bank-related assets`);
    }

    if (cleanupType === 'all' || cleanupType === 'duplicates') {
      // 重複データを削除
      const allAssets = await db.collection('assets').find({ userId }).toArray();
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

      if (duplicates.length > 0) {
        const duplicateIds = duplicates.map((dup) => dup._id);
        const duplicateResult = await db.collection('assets').deleteMany({
          _id: { $in: duplicateIds },
        });
        results.deletedDuplicates = duplicateResult.deletedCount;
        console.log(`Deleted ${duplicateResult.deletedCount} duplicate assets`);
      }
    }

    results.totalDeleted =
      results.deletedAssets +
      results.deletedDebts +
      results.deletedBankAssets +
      results.deletedDuplicates;

    console.log(`Force cleanup completed: ${results.totalDeleted} total items deleted`);

    return res.status(200).json({
      success: true,
      message: `強制クリーンアップ完了: 合計${results.totalDeleted}件を削除しました`,
      results,
    });
  } catch (error) {
    console.error('Error in force cleanup:', error);
    return res.status(500).json({
      success: false,
      message: '強制クリーンアップ中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
