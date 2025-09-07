import { VercelRequest, VercelResponse } from '@vercel/node';
import { FinancialDataService } from '../../src/database/services/FinancialDataService';

// 負債データの型定義
interface DebtRecord {
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
      // データベースから負債データを取得
      const debts = await financialService.getDebts(userId as string);

      // MongoDBのドキュメントをAPIレスポンス形式に変換
      const formattedDebts = debts.map((debt) => ({
        _id: debt._id,
        date: debt.date.toISOString(),
        value: debt.value,
        description: debt.description,
        account: debt.account,
        category: debt.category || 'mortgage',
        createdAt: debt.createdAt.toISOString(),
        updatedAt: debt.updatedAt.toISOString(),
      }));

      return res.status(200).json({
        success: true,
        data: formattedDebts,
      });
    }

    if (req.method === 'POST') {
      // 新しい負債データを追加
      const { account, value, date, description, category } = req.body;

      if (!account || value === undefined || !date) {
        return res.status(400).json({
          success: false,
          message: '日付、金額、口座名は必須です',
        });
      }

      const newDebt = await financialService.createDebt({
        _id: `debt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId: userId as string,
        account,
        value: parseFloat(value),
        date: new Date(date),
        description: description || '',
        category: category || 'mortgage',
      });

      // レスポンス用にフォーマット
      const formattedDebt = {
        _id: newDebt._id,
        date: newDebt.date.toISOString(),
        value: newDebt.value,
        description: newDebt.description,
        account: newDebt.account,
        category: newDebt.category || 'mortgage',
        createdAt: newDebt.createdAt.toISOString(),
        updatedAt: newDebt.updatedAt.toISOString(),
      };

      return res.status(201).json({
        success: true,
        data: formattedDebt,
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('Debt API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
