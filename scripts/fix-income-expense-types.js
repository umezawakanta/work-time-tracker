// 既存の収支記録のtypeフィールドを修正するスクリプト
const mongoose = require('mongoose');

// データベース接続
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/work-time-tracker';

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
    let fixedCount = 0;
    for (const record of recordsWithoutType) {
      console.log(`記録ID: ${record._id}, 金額: ${record.amount}, メモ: ${record.notes}`);
      
      // メモの内容から収入/支出を判定
      let newType = 'income'; // デフォルトは収入
      
      if (record.notes) {
        const notes = record.notes.toLowerCase();
        // 支出を示すキーワードをチェック
        if (notes.includes('支出') || notes.includes('支払') || notes.includes('費用') || 
            notes.includes('交通費') || notes.includes('食費') || notes.includes('光熱費') ||
            notes.includes('家賃') || notes.includes('保険') || notes.includes('税金')) {
          newType = 'expense';
        }
      }
      
      // 金額が負の場合は支出
      if (record.amount < 0) {
        newType = 'expense';
      }
      
      // 記録を更新
      await IncomeExpenseRecord.updateOne(
        { _id: record._id },
        { 
          $set: { 
            type: newType,
            updatedAt: new Date()
          }
        }
      );
      
      console.log(`  → ${newType} として修正`);
      fixedCount++;
    }
    
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
