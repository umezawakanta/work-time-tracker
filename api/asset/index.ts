import { VercelRequest, VercelResponse } from '@vercel/node';
import { FinancialDataService } from '../../src/database/services/FinancialDataService';

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

// データベースサービス
const financialService = FinancialDataService.getInstance();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // デフォルトユーザーIDを使用（開発環境用）
    const userId = (req.query.userId as string) || 'default-user';

    if (req.method === 'GET') {
      // データベースから資産データを取得
      const assets = await financialService.getAssets(userId as string);

      // MongoDBのドキュメントをAPIレスポンス形式に変換
      const formattedAssets = assets.map((asset) => ({
        _id: asset._id,
        date: asset.date.toISOString(),
        value: asset.value,
        description: asset.description,
        account: asset.account,
        category: asset.category || 'cash',
        createdAt: asset.createdAt.toISOString(),
        updatedAt: asset.updatedAt.toISOString(),
      }));

      return res.status(200).json({
        success: true,
        data: formattedAssets,
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

      const newAsset = await financialService.createAsset({
        _id: `asset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId: userId as string,
        account,
        value: parseFloat(value),
        date: new Date(date),
        description,
        category: category || 'cash',
      });

      // レスポンス用にフォーマット
      const formattedAsset = {
        _id: newAsset._id,
        date: newAsset.date.toISOString(),
        value: newAsset.value,
        description: newAsset.description,
        account: newAsset.account,
        category: newAsset.category || 'cash',
        createdAt: newAsset.createdAt.toISOString(),
        updatedAt: newAsset.updatedAt.toISOString(),
      };

      return res.status(201).json({
        success: true,
        data: formattedAsset,
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
