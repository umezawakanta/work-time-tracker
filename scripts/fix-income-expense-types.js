// 既存の収支記録のtypeフィールドを修正するスクリプト
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');
// 共通ユーティリティ関数をインポート
const { determineIncomeExpenseType } = require(path.join(__dirname, '../api/utils/incomeExpenseUtils'));

// データベース接続
const MONGODB_URI = process.env.MONGODB_URI;

// 環境変数が設定されていない場合の警告
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI環境変数が設定されていません');
  console.log('以下のいずれかの方法で設定してください:');
  console.log('1. .envファイルを作成してMONGODB_URIを設定');
  console.log('2. 環境変数として直接設定: set MONGODB_URI=your_mongodb_uri');
  console.log('3. Vercelの環境変数を使用');
  process.exit(1);
}

async function connectDB() {
  try {
    
    await mongoose.connect(MONGODB_URI, {
      dbName: 'workTimeTracker'
    });
    console.log('データベースに接続しました');
  } catch (error) {
    console.error('データベース接続エラー:', error);
    throw error;
  }
}

// 収支記録のスキーマ
const IncomeExpenseRecordSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  transportation: { type: Number, default: 0 },
  overtime: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const IncomeExpenseRecord = mongoose.models.SalaryRecord || mongoose.model('SalaryRecord', IncomeExpenseRecordSchema);

async function fixIncomeExpenseTypes() {
  try {
    await connectDB();
    
    // typeフィールドが存在しないまたは空の記録を取得
    const recordsWithoutType = await IncomeExpenseRecord.find({
      $or: [
        { type: { $exists: false } },
        { type: null },
        { type: '' }
      ]
    });
    
    console.log(`typeフィールドが不正な記録数: ${recordsWithoutType.length}`);
    
    if (recordsWithoutType.length === 0) {
      console.log('修正が必要な記録はありません');
      return;
    }
    
    // 各記録を確認して修正
    // bulkWrite用の操作配列を作成
    const bulkOps = recordsWithoutType.map(record => {
      // 共通ユーティリティ関数を使用してタイプを判定
      const newType = determineIncomeExpenseType(record);

      return {
        updateOne: {
          filter: { _id: record._id },
          update: {
            $set: {
              type: newType,
              updatedAt: new Date()
            }
          }
        }
      };
    });

    // bulkWriteで一括更新
    const bulkResult = await IncomeExpenseRecord.bulkWrite(bulkOps);
    const fixedCount = bulkResult.modifiedCount;
    console.log(`修正完了: ${fixedCount}件の記録を修正しました`);
    
  } catch (error) {
    console.error('修正中にエラーが発生しました:', error);
  } finally {
    await mongoose.disconnect();
    console.log('データベース接続を閉じました');
  }
}

// スクリプト実行
if (require.main === module) {
  fixIncomeExpenseTypes();
}

module.exports = { fixIncomeExpenseTypes };
