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

  if (req.method !== 'DELETE') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const userId = (req.query.userId as string) || 'default-user';

    // じぶん銀行関連の取引明細を削除
    const result = await financialService.deleteTransactionsByAccountName(userId, 'じぶん銀行');

    return res.status(200).json({
      success: true,
      message: 'じぶん銀行の取引明細を削除しました',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Delete Jibun Bank transactions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
