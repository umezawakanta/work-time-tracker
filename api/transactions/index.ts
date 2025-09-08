import { VercelRequest, VercelResponse } from '@vercel/node';
import { FinancialDataService } from '../../src/database/services/FinancialDataService';
import { Transaction } from '../../src/types/transaction';

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

  if (req.method === 'GET') {
    try {
      const { userId, startDate, endDate, category } = req.query;

      if (!userId) {
        res.status(400).json({ success: false, message: 'userId is required' });
        return;
      }

      // データベースから取引明細を取得
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      let transactions = await financialService.getTransactions(
        userId as string,
        undefined, // accountId
        start,
        end
      );

      // カテゴリフィルタリング
      if (category) {
        transactions = transactions.filter((tx) => tx.category === category);
      }

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
      const newTransaction = await financialService.createTransaction({
        _id: id,
        userId: userId,
        accountId: transaction.accountId || 'main_account',
        date: new Date(transaction.date || new Date().toISOString().split('T')[0]),
        description: transaction.description || '',
        amount: transaction.amount || 0,
        category: transaction.category || 'その他',
        type: (transaction.type as 'income' | 'expense') || 'expense',
        balance: 0, // 残高は計算で求める
      });

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

      const updatedTransaction = await financialService.updateTransaction(transactionId, updates);
      if (!updatedTransaction) {
        res.status(404).json({ success: false, message: 'Transaction not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: '取引明細を更新しました',
        transaction: updatedTransaction,
      });
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { userId, transactionId, accountName } = req.body;

      if (!userId) {
        res.status(400).json({ success: false, message: 'userId is required' });
        return;
      }

      // 特定の口座名の取引明細を一括削除
      if (accountName) {
        const result = await financialService.deleteTransactionsByAccountName(userId, accountName);
        res.status(200).json({
          success: true,
          message: `${accountName}の取引明細を削除しました`,
          deletedCount: result.deletedCount,
        });
        return;
      }

      // 個別の取引明細を削除
      if (!transactionId) {
        res
          .status(400)
          .json({ success: false, message: 'transactionId or accountName is required' });
        return;
      }

      const success = await financialService.deleteTransaction(transactionId);
      if (!success) {
        res.status(404).json({ success: false, message: 'Transaction not found' });
        return;
      }

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
