import { VercelRequest, VercelResponse } from '@vercel/node';
import { loadVercelData, saveVercelDataImmediately } from '../../_lib/vercel-storage';
import { Transaction, CSVTransactionData } from '../../../src/types/transaction';

// 取引明細データのストア（メモリ）
let transactionStore: Map<string, Transaction[]> = new Map();

// データを読み込み
try {
  transactionStore = loadVercelData<Transaction>('transactions');
} catch (error) {
  console.error('Error loading transactions data:', error);
  transactionStore = new Map();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const { userId, transactions }: { userId: string; transactions: CSVTransactionData[] } =
      req.body;

    if (!userId) {
      res.status(400).json({ success: false, message: 'userId is required' });
      return;
    }

    if (!transactions || !Array.isArray(transactions)) {
      res.status(400).json({ success: false, message: 'transactions array is required' });
      return;
    }

    // 既存の取引明細を取得
    const existingTransactions = transactionStore.get(userId) || [];

    // 新しい取引明細を作成
    const newTransactions: Transaction[] = transactions.map((tx) => {
      const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return {
        _id: id,
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        category: tx.category,
        accountId: 'main_account', // デフォルトでメイン口座に紐付け
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    // 既存の取引明細とマージ
    const allTransactions = [...existingTransactions, ...newTransactions];

    // 重複を除去（同じ日付、同じ金額、同じ説明の取引）
    const uniqueTransactions = allTransactions.filter((tx, index, arr) => {
      return (
        arr.findIndex(
          (t) => t.date === tx.date && t.amount === tx.amount && t.description === tx.description
        ) === index
      );
    });

    // データを保存
    transactionStore.set(userId, uniqueTransactions);
    saveVercelDataImmediately(transactionStore, 'transactions');

    res.status(200).json({
      success: true,
      message: `${newTransactions.length}件の取引明細をインポートしました`,
      importedCount: newTransactions.length,
      errors: [],
      transactions: newTransactions,
    });
  } catch (error) {
    console.error('Transaction import error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      importedCount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      transactions: [],
    });
  }
}
