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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { id } = req.query;
    const { userId } = req.query;

    if (!id || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Account ID and User ID are required',
      });
    }

    const userAccounts = bankAccountsStore.get(userId as string) || [];
    const accountIndex = userAccounts.findIndex(account => account._id === id);

    if (accountIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found',
      });
    }

    if (req.method === 'GET') {
      // 銀行口座の詳細を取得
      return res.status(200).json({
        success: true,
        data: userAccounts[accountIndex],
      });
    }

    if (req.method === 'PUT') {
      // 銀行口座を更新
      const { 
        bankName, 
        accountType, 
        accountNumber, 
        branchName, 
        accountName, 
        isMain,
        isActive,
        lastBalance,
        lastUpdated
      } = req.body;

      const updatedAccount: BankAccount = {
        ...userAccounts[accountIndex],
        bankName: bankName || userAccounts[accountIndex].bankName,
        accountType: accountType || userAccounts[accountIndex].accountType,
        accountNumber: accountNumber || userAccounts[accountIndex].accountNumber,
        branchName: branchName !== undefined ? branchName : userAccounts[accountIndex].branchName,
        accountName: accountName || userAccounts[accountIndex].accountName,
        isMain: isMain !== undefined ? isMain : userAccounts[accountIndex].isMain,
        isActive: isActive !== undefined ? isActive : userAccounts[accountIndex].isActive,
        lastBalance: lastBalance !== undefined ? lastBalance : userAccounts[accountIndex].lastBalance,
        lastUpdated: lastUpdated || userAccounts[accountIndex].lastUpdated,
        updatedAt: new Date().toISOString(),
      };

      // メイン口座の重複チェック
      if (isMain && isMain !== userAccounts[accountIndex].isMain) {
        const hasOtherMainAccount = userAccounts.some((account, index) => 
          index !== accountIndex && account.isMain && account.isActive
        );
        
        if (hasOtherMainAccount) {
          return res.status(400).json({
            success: false,
            message: 'メイン口座は既に登録されています。既存のメイン口座を無効にしてから設定してください。',
          });
        }
      }

      userAccounts[accountIndex] = updatedAccount;
      bankAccountsStore.set(userId as string, userAccounts);

      return res.status(200).json({
        success: true,
        data: updatedAccount,
      });
    }

    if (req.method === 'DELETE') {
      // 銀行口座を削除（論理削除）
      userAccounts[accountIndex].isActive = false;
      userAccounts[accountIndex].updatedAt = new Date().toISOString();
      bankAccountsStore.set(userId as string, userAccounts);

      return res.status(200).json({
        success: true,
        message: 'Bank account deleted successfully',
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('Bank account API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
