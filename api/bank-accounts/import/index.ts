import { VercelRequest, VercelResponse } from '@vercel/node';
import { FinancialDataService } from '../../../src/database/services/FinancialDataService';

// データベースサービス
const financialService = FinancialDataService.getInstance();

interface BankAccount {
  _id: string;
  userId: string;
  bankName: string;
  accountType: 'checking' | 'savings' | 'time_deposit' | 'credit_card';
  accountNumber: string;
  branchName?: string;
  accountName: string;
  isMain: boolean;
  isActive: boolean;
  lastBalance?: number;
  lastUpdated?: string;
  createdAt: string;
  updatedAt: string;
}

// ID生成関数
const createBankAccountId = () =>
  'bank_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  const origin = req.headers.origin as string | undefined;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const allow = origin && (allowedOrigins.includes(origin) || isPreview) ? origin : '*';

  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      const { userId, accounts } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Accounts data is required',
        });
      }

      // データベースに口座データを作成
      const newAccounts: BankAccount[] = [];

      for (const account of accounts) {
        const now = new Date();
        const newAccount = await financialService.createBankAccount({
          userId,
          bankName: account.bankName,
          accountType: account.accountType,
          accountNumber: account.accountNumber,
          branchName: account.branchName || '',
          accountName: account.accountName,
          isMain: account.isMain || false,
          isActive: true,
          lastBalance: account.lastBalance || 0,
          lastUpdated: now,
        });

        newAccounts.push({
          _id: newAccount._id,
          userId: newAccount.userId,
          bankName: newAccount.bankName,
          accountType: newAccount.accountType,
          accountNumber: newAccount.accountNumber,
          branchName: newAccount.branchName,
          accountName: newAccount.accountName,
          isMain: newAccount.isMain,
          isActive: newAccount.isActive,
          lastBalance: newAccount.lastBalance,
          lastUpdated: newAccount.lastUpdated?.toISOString(),
          createdAt: newAccount.createdAt.toISOString(),
          updatedAt: newAccount.updatedAt.toISOString(),
        });
      }

      // 総口座数を取得
      const allAccounts = await financialService.getBankAccounts(userId);

      res.status(200).json({
        success: true,
        message: `${newAccounts.length}件の口座データをインポートしました`,
        data: {
          importedCount: newAccounts.length,
          totalCount: allAccounts.length,
          accounts: newAccounts,
        },
      });
      return;
    }

    res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('Bank accounts import API error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
    });
  }
}

export default handler;
