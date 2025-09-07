#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import { connectToDatabase } from '../src/database/connection';
import { FinancialDataService } from '../src/database/services/FinancialDataService';

// データディレクトリのパス
const DATA_DIR = path.join(process.cwd(), 'data');

interface FileData {
  [userId: string]: any[];
}

async function migrateData() {
  try {
    console.log('🚀 データベース移行を開始します...');

    // データベースに接続
    await connectToDatabase();
    const financialService = FinancialDataService.getInstance();

    // 移行するファイル一覧
    const filesToMigrate = [
      { filename: 'assets.json', type: 'assets' as const },
      { filename: 'debts.json', type: 'debts' as const },
      { filename: 'bank-accounts.json', type: 'bank-accounts' as const },
      { filename: 'transactions.json', type: 'transactions' as const },
    ];

    for (const { filename, type } of filesToMigrate) {
      const filePath = path.join(DATA_DIR, filename);

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ ファイルが見つかりません: ${filename}`);
        continue;
      }

      console.log(`📁 ${filename} を処理中...`);

      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data: FileData = JSON.parse(fileContent);

        for (const [userId, records] of Object.entries(data)) {
          if (!Array.isArray(records) || records.length === 0) {
            console.log(`  - ユーザー ${userId}: データなし`);
            continue;
          }

          console.log(`  - ユーザー ${userId}: ${records.length}件のレコード`);

          switch (type) {
            case 'assets':
              await migrateAssets(financialService, userId, records);
              break;
            case 'debts':
              await migrateDebts(financialService, userId, records);
              break;
            case 'bank-accounts':
              await migrateBankAccounts(financialService, userId, records);
              break;
            case 'transactions':
              await migrateTransactions(financialService, userId, records);
              break;
          }
        }
      } catch (error) {
        console.error(`❌ ${filename} の処理中にエラーが発生しました:`, error);
      }
    }

    console.log('✅ データベース移行が完了しました！');
  } catch (error) {
    console.error('❌ 移行中にエラーが発生しました:', error);
    process.exit(1);
  }
}

async function migrateAssets(service: FinancialDataService, userId: string, records: any[]) {
  const assets = records.map((record) => ({
    _id: record._id,
    userId,
    date: new Date(record.date),
    value: record.value,
    description: record.description,
    account: record.account,
    category: record.category || 'cash',
  }));

  try {
    await service.createMultipleAssets(assets);
    console.log(`    ✅ 資産データ ${assets.length}件を移行しました`);
  } catch (error) {
    console.error(`    ❌ 資産データの移行に失敗しました:`, error);
  }
}

async function migrateDebts(service: FinancialDataService, userId: string, records: any[]) {
  const debts = records.map((record) => ({
    _id: record._id,
    userId,
    date: new Date(record.date),
    value: record.value,
    description: record.description,
    account: record.account,
    category: record.category || 'mortgage',
    interestRate: record.interestRate,
    monthlyPayment: record.monthlyPayment,
  }));

  try {
    await service.createMultipleDebts(debts);
    console.log(`    ✅ 負債データ ${debts.length}件を移行しました`);
  } catch (error) {
    console.error(`    ❌ 負債データの移行に失敗しました:`, error);
  }
}

async function migrateBankAccounts(service: FinancialDataService, userId: string, records: any[]) {
  for (const record of records) {
    try {
      await service.createBankAccount({
        _id: record._id,
        userId,
        bankName: record.bankName,
        accountName: record.accountName,
        accountType: record.accountType,
        accountNumber: record.accountNumber,
        branchName: record.branchName || '',
        lastBalance: record.lastBalance || 0,
        isMain: record.isMain || false,
        isActive: record.isActive !== false,
        lastUpdated: record.lastUpdated ? new Date(record.lastUpdated) : new Date(),
      });
    } catch (error) {
      console.error(`    ❌ 銀行口座 ${record._id} の移行に失敗しました:`, error);
    }
  }
  console.log(`    ✅ 銀行口座データ ${records.length}件を移行しました`);
}

async function migrateTransactions(service: FinancialDataService, userId: string, records: any[]) {
  const transactions = records.map((record) => ({
    _id: record._id,
    userId,
    accountId: record.accountId || 'unknown',
    date: new Date(record.date),
    description: record.description,
    amount: record.amount,
    category: record.category,
    type: record.type as 'income' | 'expense',
    balance: record.balance || 0,
  }));

  try {
    await service.createMultipleTransactions(transactions);
    console.log(`    ✅ 取引データ ${transactions.length}件を移行しました`);
  } catch (error) {
    console.error(`    ❌ 取引データの移行に失敗しました:`, error);
  }
}

// スクリプト実行
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('🎉 移行スクリプトが完了しました');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 移行スクリプトが失敗しました:', error);
      process.exit(1);
    });
}

export { migrateData };
