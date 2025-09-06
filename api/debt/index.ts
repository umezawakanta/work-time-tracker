import { VercelRequest, VercelResponse } from '@vercel/node';

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

// メモリ内ストア（実際の実装ではデータベースを使用）
const debtStore = new Map<string, DebtRecord[]>();

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
      // 負債データを取得
      const debts = debtStore.get(userId as string) || [];
      
      return res.status(200).json({
        success: true,
        data: debts,
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

      const newDebt: DebtRecord = {
        _id: `debt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        account,
        value: parseFloat(value),
        date,
        description: description || '',
        category: category || 'mortgage',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const userDebts = debtStore.get(userId as string) || [];
      userDebts.push(newDebt);
      debtStore.set(userId as string, userDebts);

      return res.status(201).json({
        success: true,
        data: newDebt,
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