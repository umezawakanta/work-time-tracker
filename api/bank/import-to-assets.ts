import { VercelRequest, VercelResponse } from '@vercel/node';

// 銀行データの型定義
interface BankTransaction {
  date: string;
  description: string;
  amount: number;
  balance: number;
  category?: string;
  bankName?: string;
  accountType?: string;
}

interface ParsedBankData {
  transactions: BankTransaction[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    netAmount: number;
    transactionCount: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
  bankInfo: {
    name: string;
    accountType: string;
  };
}

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

// メモリ内ストア
const bankDataStore = new Map<string, ParsedBankData>();
const assetStore = new Map<string, AssetRecord[]>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const { dataId, userId, accountName } = req.body;

    if (!dataId || !userId || !accountName) {
      return res.status(400).json({
        success: false,
        message: 'データID、ユーザーID、口座名が必要です',
      });
    }

    const bankData = bankDataStore.get(dataId);
    if (!bankData) {
      return res.status(404).json({
        success: false,
        message: '銀行データが見つかりません',
      });
    }

    // ユーザーIDの確認
    if (!dataId.startsWith(`bank_${userId}_`)) {
      return res.status(403).json({
        success: false,
        message: 'アクセス権限がありません',
      });
    }

    // 最新の残高を取得
    const latestTransaction = bankData.transactions.reduce((latest, current) =>
      current.date > latest.date ? current : latest
    );

    // 資産エントリとして追加
    const assetEntry: AssetRecord = {
      _id: `asset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      account: accountName,
      value: latestTransaction.balance,
      date: latestTransaction.date,
      description: `${bankData.bankInfo.name} - 最新残高`,
      category: 'bank',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 資産ストアに保存
    if (!assetStore.has(userId)) {
      assetStore.set(userId, []);
    }
    const userAssets = assetStore.get(userId) || [];
    userAssets.push(assetEntry);
    assetStore.set(userId, userAssets);

    return res.status(200).json({
      success: true,
      data: {
        assetId: assetEntry._id,
        importedBalance: latestTransaction.balance,
        transactionCount: bankData.transactions.length,
        message: '銀行データが資産管理システムに正常に取り込まれました',
      },
    });
  } catch (error) {
    console.error('Error importing bank data:', error);
    return res.status(500).json({
      success: false,
      message: 'データの取り込み中にエラーが発生しました',
    });
  }
}
