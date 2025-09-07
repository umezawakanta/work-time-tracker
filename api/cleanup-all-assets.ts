import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../_lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const { db } = await connectToDatabase();

    // 全資産データを削除
    const assetResult = await db.collection('assets').deleteMany({ userId });

    // 全負債データを削除
    const debtResult = await db.collection('debts').deleteMany({ userId });

    console.log(
      `Cleaned up assets: ${assetResult.deletedCount}, debts: ${debtResult.deletedCount} for user: ${userId}`
    );

    return res.status(200).json({
      success: true,
      message: `全データをクリーンアップしました。資産: ${assetResult.deletedCount}件、負債: ${debtResult.deletedCount}件を削除しました。`,
      deletedAssets: assetResult.deletedCount,
      deletedDebts: debtResult.deletedCount,
    });
  } catch (error) {
    console.error('Error cleaning up all assets:', error);
    return res.status(500).json({
      success: false,
      message: 'データのクリーンアップ中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
