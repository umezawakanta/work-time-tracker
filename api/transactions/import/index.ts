import { VercelRequest, VercelResponse } from '@vercel/node';
import { FinancialDataService } from '../../../src/database/services/FinancialDataService';
import { Transaction, CSVTransactionData } from '../../../src/types/transaction';

// データベースサービス
const financialService = FinancialDataService.getInstance();

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

    // データベースから既存の取引明細を取得（重複チェック用）
    const existingTransactions = await financialService.getTransactions(userId);

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

    // 重複を除去（同じ日付、同じ金額、同じ説明の取引）
    const uniqueTransactions = newTransactions.filter((tx) => {
      return !existingTransactions.some(
        (existing) =>
          existing.date.toISOString().split('T')[0] === tx.date &&
          existing.amount === tx.amount &&
          existing.description === tx.description
      );
    });

    // データベースに取引明細を保存
    const createdTransactions = [];
    for (const transaction of uniqueTransactions) {
      try {
        const created = await financialService.createTransaction({
          _id: transaction._id,
          userId: transaction.userId,
          accountId: transaction.accountId,
          date: new Date(transaction.date),
          description: transaction.description,
          amount: transaction.amount,
          category: transaction.category,
          type: transaction.type as 'income' | 'expense',
          balance: 0, // 残高は計算で求める
        });
        createdTransactions.push(created);
      } catch (error) {
        console.error('Error creating transaction:', error);
      }
    }

    res.status(200).json({
      success: true,
      message: `${createdTransactions.length}件の取引明細をインポートしました`,
      importedCount: createdTransactions.length,
      errors: [],
      transactions: createdTransactions,
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
