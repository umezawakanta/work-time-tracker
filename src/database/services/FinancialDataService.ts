import { connectToDatabase } from '../connection.js';
import {
  AssetRecord,
  DebtRecord,
  BankAccount,
  Transaction,
  IAssetRecord,
  IDebtRecord,
  IBankAccount,
  ITransaction,
} from '../schemas/FinancialDataSchema';

export class FinancialDataService {
  private static instance: FinancialDataService;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): FinancialDataService {
    if (!FinancialDataService.instance) {
      FinancialDataService.instance = new FinancialDataService();
    }
    return FinancialDataService.instance;
  }

  private async ensureConnection(): Promise<void> {
    if (!this.isConnected) {
      await connectToDatabase();
      this.isConnected = true;
    }
  }

  // 資産データの操作
  async getAssets(userId: string): Promise<IAssetRecord[]> {
    await this.ensureConnection();
    return await AssetRecord.find({ userId }).sort({ date: -1 });
  }

  async createAsset(
    assetData: Omit<IAssetRecord, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<IAssetRecord> {
    await this.ensureConnection();
    const asset = new AssetRecord(assetData);
    return await asset.save();
  }

  async updateAsset(
    assetId: string,
    updateData: Partial<IAssetRecord>
  ): Promise<IAssetRecord | null> {
    await this.ensureConnection();
    return await AssetRecord.findByIdAndUpdate(assetId, updateData, { new: true });
  }

  async deleteAsset(assetId: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await AssetRecord.findByIdAndDelete(assetId);
    return !!result;
  }

  // 負債データの操作
  async getDebts(userId: string): Promise<IDebtRecord[]> {
    await this.ensureConnection();
    return await DebtRecord.find({ userId }).sort({ date: -1 });
  }

  async createDebt(
    debtData: Omit<IDebtRecord, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<IDebtRecord> {
    await this.ensureConnection();
    const debt = new DebtRecord(debtData);
    return await debt.save();
  }

  async updateDebt(debtId: string, updateData: Partial<IDebtRecord>): Promise<IDebtRecord | null> {
    await this.ensureConnection();
    return await DebtRecord.findByIdAndUpdate(debtId, updateData, { new: true });
  }

  async deleteDebt(debtId: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await DebtRecord.findByIdAndDelete(debtId);
    return !!result;
  }

  // 銀行口座データの操作
  async getBankAccounts(userId: string): Promise<IBankAccount[]> {
    await this.ensureConnection();
    return await BankAccount.find({ userId }).sort({ createdAt: -1 });
  }

  async createBankAccount(
    accountData: Omit<IBankAccount, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<IBankAccount> {
    await this.ensureConnection();
    const account = new BankAccount(accountData);
    return await account.save();
  }

  async updateBankAccount(
    accountId: string,
    updateData: Partial<IBankAccount>
  ): Promise<IBankAccount | null> {
    await this.ensureConnection();
    return await BankAccount.findByIdAndUpdate(accountId, updateData, { new: true });
  }

  async deleteBankAccount(accountId: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await BankAccount.findByIdAndDelete(accountId);
    return !!result;
  }

  // 取引明細データの操作
  async getTransactions(
    userId: string,
    accountId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ITransaction[]> {
    await this.ensureConnection();
    const query: any = { userId };

    if (accountId) {
      query.accountId = accountId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    return await Transaction.find(query).sort({ date: -1 });
  }

  async createTransaction(
    transactionData: Omit<ITransaction, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<ITransaction> {
    await this.ensureConnection();
    const transaction = new Transaction(transactionData);
    return await transaction.save();
  }

  async updateTransaction(
    transactionId: string,
    updateData: Partial<ITransaction>
  ): Promise<ITransaction | null> {
    await this.ensureConnection();
    return await Transaction.findByIdAndUpdate(transactionId, updateData, { new: true });
  }

  async deleteTransaction(transactionId: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await Transaction.findByIdAndDelete(transactionId);
    return !!result;
  }

  // バッチ操作
  async createMultipleAssets(
    assets: Omit<IAssetRecord, '_id' | 'createdAt' | 'updatedAt'>[]
  ): Promise<IAssetRecord[]> {
    await this.ensureConnection();
    return await AssetRecord.insertMany(assets);
  }

  async createMultipleDebts(
    debts: Omit<IDebtRecord, '_id' | 'createdAt' | 'updatedAt'>[]
  ): Promise<IDebtRecord[]> {
    await this.ensureConnection();
    return await DebtRecord.insertMany(debts);
  }

  async createMultipleTransactions(
    transactions: Omit<ITransaction, '_id' | 'createdAt' | 'updatedAt'>[]
  ): Promise<ITransaction[]> {
    await this.ensureConnection();
    return await Transaction.insertMany(transactions);
  }

  // 統計データの取得
  async getAssetSummary(
    userId: string
  ): Promise<{ total: number; count: number; latestDate: Date | null }> {
    await this.ensureConnection();
    const assets = await AssetRecord.find({ userId });
    const total = assets.reduce((sum, asset) => sum + asset.value, 0);
    const latestDate =
      assets.length > 0 ? new Date(Math.max(...assets.map((a) => a.date.getTime()))) : null;

    return {
      total,
      count: assets.length,
      latestDate,
    };
  }

  async getDebtSummary(
    userId: string
  ): Promise<{ total: number; count: number; latestDate: Date | null }> {
    await this.ensureConnection();
    const debts = await DebtRecord.find({ userId });
    const total = debts.reduce((sum, debt) => sum + debt.value, 0);
    const latestDate =
      debts.length > 0 ? new Date(Math.max(...debts.map((d) => d.date.getTime()))) : null;

    return {
      total,
      count: debts.length,
      latestDate,
    };
  }

  async getTransactionSummary(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalIncome: number;
    totalExpense: number;
    netAmount: number;
    transactionCount: number;
  }> {
    await this.ensureConnection();
    const query: any = { userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const transactions = await Transaction.find(query);
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      netAmount: totalIncome - totalExpense,
      transactionCount: transactions.length,
    };
  }

  // ユーザーのすべての取引明細を削除
  async deleteAllTransactions(userId: string): Promise<{ deletedCount: number }> {
    await this.ensureConnection();
    const result = await Transaction.deleteMany({ userId });
    return { deletedCount: result.deletedCount || 0 };
  }

  // 取引明細から最新の残高を取得して口座情報を更新
  async updateAccountBalancesFromTransactions(userId: string): Promise<void> {
    await this.ensureConnection();

    // ユーザーのすべての口座を取得
    const accounts = await BankAccount.find({ userId, isActive: true });

    for (const account of accounts) {
      // 各口座の最新の取引明細を取得（csvOrder順、最新が上）
      const latestTransaction = await Transaction.findOne({
        userId,
        accountId: account._id,
      }).sort({ csvOrder: 1 }); // csvOrder: 1 = 最新（一番上）

      if (latestTransaction) {
        // 最新の残高で口座情報を更新
        await BankAccount.findByIdAndUpdate(account._id, {
          lastBalance: latestTransaction.amount,
          lastUpdated: new Date().toISOString(),
        });
      }
    }
  }

  // 特定の口座の最新残高を取得
  async getLatestBalanceForAccount(userId: string, accountId: string): Promise<number | null> {
    await this.ensureConnection();

    const latestTransaction = await Transaction.findOne({
      userId,
      accountId,
    }).sort({ csvOrder: 1 }); // csvOrder: 1 = 最新（一番上）

    return latestTransaction ? latestTransaction.amount : null;
  }
}
