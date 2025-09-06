import { VercelRequest, VercelResponse } from '@vercel/node';

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

// メモリ内ストア（実際の実装ではデータベースを使用）
const bankAccountsStore = new Map<string, BankAccount[]>();

// デモデータの初期化
const initializeDemoData = (userId: string) => {
  if (!bankAccountsStore.has(userId)) {
    const demoAccounts: BankAccount[] = [
      {
        _id: 'demo_main_account',
        userId,
        bankName: '三井住友銀行',
        accountType: 'checking',
        accountNumber: '1234567',
        branchName: '梅田支店',
        accountName: '梅澤寛太',
        isMain: true,
        isActive: true,
        lastBalance: 1500000,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'demo_savings_account',
        userId,
        bankName: '三井住友銀行',
        accountType: 'savings',
        accountNumber: '7654321',
        branchName: '梅田支店',
        accountName: '梅澤寛太',
        isMain: false,
        isActive: true,
        lastBalance: 3000000,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'demo_investment_account',
        userId,
        bankName: 'SBI証券',
        accountType: 'checking',
        accountNumber: '9876543',
        branchName: '本店',
        accountName: '梅澤寛太',
        isMain: false,
        isActive: true,
        lastBalance: 2500000,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    bankAccountsStore.set(userId, demoAccounts);
  }
};

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
      // デモデータを初期化
      initializeDemoData(userId as string);

      // 銀行口座一覧を取得
      const accounts = bankAccountsStore.get(userId as string) || [];

      // デバッグログを追加
      console.log('Bank accounts API - User ID:', userId);
      console.log('Bank accounts API - Accounts:', accounts);

      return res.status(200).json({
        success: true,
        data: accounts,
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
        const existingAccounts = bankAccountsStore.get(userId as string) || [];
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

      const newAccount: BankAccount = {
        _id: `bank_account_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId: userId as string,
        bankName,
        accountType,
        accountNumber,
        branchName,
        accountName,
        isMain,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const userAccounts = bankAccountsStore.get(userId as string) || [];
      userAccounts.push(newAccount);
      bankAccountsStore.set(userId as string, userAccounts);

      return res.status(201).json({
        success: true,
        data: newAccount,
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
