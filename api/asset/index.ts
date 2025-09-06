import { VercelRequest, VercelResponse } from '@vercel/node';

// 資産データの型定義
interface AssetRecord {
  _id: string;
  date: string;
  value: number;
  description: string;
  account: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// メモリ内ストア（実際の実装ではデータベースを使用）
const assetStore = new Map<string, AssetRecord[]>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID is required',
      });
    }

    if (req.method === 'GET') {
      // 資産データを取得
      const assets = assetStore.get(userId as string) || [];
      
      return res.status(200).json({
        success: true,
        data: assets,
      });
    }

    if (req.method === 'POST') {
      // 新しい資産データを追加
      const { account, value, date, description, category } = req.body;

      if (!account || value === undefined || !date || !description) {
        return res.status(400).json({
          success: false,
          message: '日付、金額、説明、口座名は必須です',
        });
      }

      const newAsset: AssetRecord = {
        _id: `asset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        account,
        value: parseFloat(value),
        date,
        description,
        category: category || 'cash',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const userAssets = assetStore.get(userId as string) || [];
      userAssets.push(newAsset);
      assetStore.set(userId as string, userAssets);

      return res.status(201).json({
        success: true,
        data: newAsset,
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('Asset API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
