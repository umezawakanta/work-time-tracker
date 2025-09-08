const { VercelRequest, VercelResponse } = require('@vercel/node');
const { FinancialDataService } = require('../../src/database/services/FinancialDataService');

// 銀行口座の型定義
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
    const { userId } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID is required',
      });
    }

    if (req.method === 'GET') {
      // データベースから銀行口座データを取得
      const accounts = await financialService.getBankAccounts(userId as string);

      // MongoDBのドキュメントをAPIレスポンス形式に変換
      const formattedAccounts = accounts.map((account) => ({
        _id: account._id,
        userId: account.userId,
        bankName: account.bankName,
        accountType: account.accountType,
        accountNumber: account.accountNumber,
        branchName: account.branchName,
        accountName: account.accountName,
        isMain: account.isMain,
        isActive: account.isActive,
        lastBalance: account.lastBalance,
        lastUpdated: account.lastUpdated?.toISOString(),
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString(),
      }));

      // デバッグログを追加
      console.log('Bank accounts API - User ID:', userId);
      console.log('Bank accounts API - Accounts:', formattedAccounts);

      return res.status(200).json({
        success: true,
        data: formattedAccounts,
      });
    }

    if (req.method === 'POST') {
      // 新しい銀行口座を追加
      const {
        bankName,
        accountType,
        accountNumber,
        branchName,
        accountName,
        isMain = false,
      } = req.body;

      if (!bankName || !accountType || !accountNumber || !accountName) {
        return res.status(400).json({
          success: false,
          message: '銀行名、口座種別、口座番号、口座名は必須です',
        });
      }

      // メイン口座の重複チェック
      if (isMain) {
        const existingAccounts = await financialService.getBankAccounts(userId as string);
        const hasMainAccount = existingAccounts.some(
          (account) => account.isMain && account.isActive
        );

        if (hasMainAccount) {
          return res.status(400).json({
            success: false,
            message:
              'メイン口座は既に登録されています。既存のメイン口座を無効にしてから登録してください。',
          });
        }
      }

      const newAccount = await financialService.createBankAccount({
        _id: `bank_account_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId: userId as string,
        bankName,
        accountName,
        accountType,
        accountNumber,
        branchName: branchName || '',
        lastBalance: 0,
        isMain,
        isActive: true,
        lastUpdated: new Date(),
      });

      // レスポンス用にフォーマット
      const formattedAccount = {
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
      };

      return res.status(201).json({
        success: true,
        data: formattedAccount,
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('Bank accounts API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

module.exports = handler;
