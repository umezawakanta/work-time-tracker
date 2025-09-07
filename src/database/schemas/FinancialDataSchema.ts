import { Schema, model, Document } from 'mongoose';

// 資産レコードのスキーマ
export interface IAssetRecord extends Document {
  _id: string;
  userId: string;
  date: Date;
  value: number;
  description: string;
  account: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const AssetRecordSchema = new Schema<IAssetRecord>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    value: { type: Number, required: true },
    description: { type: String, required: true },
    account: { type: String, required: true },
    category: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'assets',
  }
);

// 負債レコードのスキーマ
export interface IDebtRecord extends Document {
  _id: string;
  userId: string;
  date: Date;
  value: number;
  description: string;
  account: string;
  category?: string;
  interestRate?: number;
  monthlyPayment?: number;
  createdAt: Date;
  updatedAt: Date;
}

export const DebtRecordSchema = new Schema<IDebtRecord>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    value: { type: Number, required: true },
    description: { type: String, required: true },
    account: { type: String, required: true },
    category: { type: String },
    interestRate: { type: Number },
    monthlyPayment: { type: Number },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'debts',
  }
);

// 銀行口座のスキーマ
export interface IBankAccount extends Document {
  _id: string;
  userId: string;
  bankName: string;
  accountName: string;
  accountType: string;
  accountNumber: string;
  branchName: string;
  lastBalance: number;
  isMain: boolean;
  isActive: boolean;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const BankAccountSchema = new Schema<IBankAccount>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    bankName: { type: String, required: true },
    accountName: { type: String, required: true },
    accountType: { type: String, required: true },
    accountNumber: { type: String, required: true },
    branchName: { type: String, required: true },
    lastBalance: { type: Number, default: 0 },
    isMain: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'bank_accounts',
  }
);

// 取引明細のスキーマ
export interface ITransaction extends Document {
  _id: string;
  userId: string;
  accountId: string;
  date: Date;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export const TransactionSchema = new Schema<ITransaction>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    accountId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    balance: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'transactions',
  }
);

// モデルの作成
export const AssetRecord = model<IAssetRecord>('AssetRecord', AssetRecordSchema);
export const DebtRecord = model<IDebtRecord>('DebtRecord', DebtRecordSchema);
export const BankAccount = model<IBankAccount>('BankAccount', BankAccountSchema);
export const Transaction = model<ITransaction>('Transaction', TransactionSchema);
