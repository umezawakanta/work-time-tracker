import { VercelRequest, VercelResponse } from '@vercel/node';
import { loadVercelData, saveVercelDataImmediately } from '../_lib/vercel-storage';
import { Transaction } from '../../src/types/transaction';

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

  if (req.method === 'GET') {
    try {
      const { userId, startDate, endDate, category } = req.query;

      if (!userId) {
        res.status(400).json({ success: false, message: 'userId is required' });
        return;
      }

      let transactions = transactionStore.get(userId as string) || [];

      // 日付フィルタリング
      if (startDate) {
        transactions = transactions.filter((tx) => (tx.date >= startDate) as string);
      }
      if (endDate) {
        transactions = transactions.filter((tx) => (tx.date <= endDate) as string);
      }

      // カテゴリフィルタリング
      if (category) {
        transactions = transactions.filter((tx) => tx.category === category);
      }

      // 日付順でソート（新しい順）
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      res.status(200).json({
        success: true,
        transactions,
        total: transactions.length,
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { userId, transaction }: { userId: string; transaction: Partial<Transaction> } =
        req.body;

      if (!userId) {
        res.status(400).json({ success: false, message: 'userId is required' });
        return;
      }

      if (!transaction) {
        res.status(400).json({ success: false, message: 'transaction data is required' });
        return;
      }

      const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newTransaction: Transaction = {
        _id: id,
        date: transaction.date || new Date().toISOString().split('T')[0],
        description: transaction.description || '',
        amount: transaction.amount || 0,
        category: transaction.category || 'その他',
        accountId: transaction.accountId || 'main_account',
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existingTransactions = transactionStore.get(userId) || [];
      existingTransactions.push(newTransaction);
      transactionStore.set(userId, existingTransactions);
      saveVercelDataImmediately(transactionStore, 'transactions');

      res.status(201).json({
        success: true,
        message: '取引明細を追加しました',
        transaction: newTransaction,
      });
    } catch (error) {
      console.error('Create transaction error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const {
        userId,
        transactionId,
        updates,
      }: {
        userId: string;
        transactionId: string;
        updates: Partial<Transaction>;
      } = req.body;

      if (!userId || !transactionId) {
        res.status(400).json({ success: false, message: 'userId and transactionId are required' });
        return;
      }

      const transactions = transactionStore.get(userId) || [];
      const transactionIndex = transactions.findIndex((tx) => tx._id === transactionId);

      if (transactionIndex === -1) {
        res.status(404).json({ success: false, message: 'Transaction not found' });
        return;
      }

      transactions[transactionIndex] = {
        ...transactions[transactionIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      transactionStore.set(userId, transactions);
      saveVercelDataImmediately(transactionStore, 'transactions');

      res.status(200).json({
        success: true,
        message: '取引明細を更新しました',
        transaction: transactions[transactionIndex],
      });
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { userId, transactionId } = req.body;

      if (!userId || !transactionId) {
        res.status(400).json({ success: false, message: 'userId and transactionId are required' });
        return;
      }

      const transactions = transactionStore.get(userId) || [];
      const filteredTransactions = transactions.filter((tx) => tx._id !== transactionId);

      if (transactions.length === filteredTransactions.length) {
        res.status(404).json({ success: false, message: 'Transaction not found' });
        return;
      }

      transactionStore.set(userId, filteredTransactions);
      saveVercelDataImmediately(transactionStore, 'transactions');

      res.status(200).json({
        success: true,
        message: '取引明細を削除しました',
      });
    } catch (error) {
      console.error('Delete transaction error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
