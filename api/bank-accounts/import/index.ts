import { VercelRequest, VercelResponse } from '@vercel/node';

// データストア（実際の実装ではデータベースを使用）
const bankAccountsStore = new Map<string, any[]>();

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

      // 既存の口座データを取得
      const existingAccounts = bankAccountsStore.get(userId) || [];

      // メイン口座の重複チェック（フロントエンドで制御するため無効化）
      // const hasMainAccount = existingAccounts.some((account) => account.isMain);
      // const newMainAccount = accounts.find((account) => account.isMain);

      // if (hasMainAccount && newMainAccount) {
      //   return res.status(400).json({
      //     success: false,
      //     message:
      //       'メイン口座は既に設定されています。既存のメイン口座を削除してから再度お試しください。',
      //   });
      // }

      // 新しい口座データを作成
      const newAccounts: BankAccount[] = accounts.map((account: any) => {
        const now = new Date().toISOString();
        return {
          _id: createBankAccountId(),
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
          createdAt: now,
          updatedAt: now,
        };
      });

      // 既存の口座データとマージ
      const updatedAccounts = [...existingAccounts, ...newAccounts];
      bankAccountsStore.set(userId, updatedAccounts);

      res.status(200).json({
        success: true,
        message: `${newAccounts.length}件の口座データをインポートしました`,
        data: {
          importedCount: newAccounts.length,
          totalCount: updatedAccounts.length,
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
