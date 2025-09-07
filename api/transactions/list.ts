import { VercelRequest, VercelResponse } from '@vercel/node';
import { FinancialDataService } from '../../src/database/services/FinancialDataService';

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

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const userId = (req.query.userId as string) || 'default-user';

    // 取引明細データを取得
    const transactions = await financialService.getTransactions(userId);

    // 口座名別にグループ化
    const groupedByAccount = transactions.reduce(
      (acc, transaction) => {
        const accountName = transaction.accountName || '不明な口座';
        if (!acc[accountName]) {
          acc[accountName] = [];
        }
        acc[accountName].push(transaction);
        return acc;
      },
      {} as Record<string, any[]>
    );

    return res.status(200).json({
      success: true,
      data: {
        totalTransactions: transactions.length,
        groupedByAccount,
        transactions: transactions.slice(0, 10), // 最初の10件のみ表示
      },
    });
  } catch (error) {
    console.error('List transactions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
