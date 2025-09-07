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
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    await client.connect();
    const db = client.db();

    // 銀行口座関連の資産データを取得
    const allAssets = await db.collection('assets').find({ userId }).toArray();
    const bankAssets = allAssets.filter(
      (asset) =>
        asset._id?.toString().startsWith('bank_') ||
        /銀行|残高別|普通|貯蓄|定期/.test(asset.account || '')
    );

    console.log(`Found ${bankAssets.length} bank-related assets`);

    // 重複をチェックして削除
    const seen = new Set();
    const duplicates = [];
    const unique = [];

    bankAssets.forEach((asset) => {
      const key = `${asset.account}_${asset.value}_${asset.date}`;
      if (seen.has(key)) {
        duplicates.push(asset);
      } else {
        seen.add(key);
        unique.push(asset);
      }
    });

    // 重複データを削除
    let deletedCount = 0;
    if (duplicates.length > 0) {
      const duplicateIds = duplicates.map((dup) => dup._id);
      const deleteResult = await db.collection('assets').deleteMany({
        _id: { $in: duplicateIds },
      });
      deletedCount = deleteResult.deletedCount;
    }

    // 銀行口座データをクリーンアップ（bank_プレフィックスを持つもの）
    const bankPrefixIds = allAssets
      .filter((asset) => asset._id?.toString().startsWith('bank_'))
      .map((asset) => asset._id);

    const bankPrefixResult = await db.collection('assets').deleteMany({
      _id: { $in: bankPrefixIds },
    });

    const totalDeleted = deletedCount + bankPrefixResult.deletedCount;

    console.log(`Cleaned up duplicate bank accounts: ${totalDeleted} items deleted`);

    return res.status(200).json({
      success: true,
      message: `重複する銀行口座データをクリーンアップしました。${totalDeleted}件を削除しました。`,
      deletedDuplicates: deletedCount,
      deletedBankPrefix: bankPrefixResult.deletedCount,
      totalDeleted,
    });
  } catch (error) {
    console.error('Error cleaning up duplicate bank accounts:', error);
    return res.status(500).json({
      success: false,
      message: '重複データのクリーンアップ中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
