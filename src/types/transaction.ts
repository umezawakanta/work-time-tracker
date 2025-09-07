export interface Transaction {
  _id: string;
  date: string; // YYYY-MM-DD形式
  description: string; // 取引内容
  amount: number; // 金額（正の値：収入、負の値：支出）
  category: string; // カテゴリ（食費、交通費、給与など）
  accountId: string; // 関連する口座ID
  userId: string;
  csvOrder?: number; // CSVの並び順（0が最新、数が大きくなるほど古い）
  createdAt: string;
  updatedAt: string;
}

export interface TransactionImportResult {
  success: boolean;
  message: string;
  importedCount: number;
  errors: string[];
  transactions: Transaction[];
}

export interface CSVTransactionData {
  date: string;
  description: string;
  amount: number;
  category: string;
  accountName: string;
  accountId?: string; // 口座ID（オプション）
  balance?: number; // 残高（オプション）
}
