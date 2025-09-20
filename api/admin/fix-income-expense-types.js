const mongooseDB = require('mongoose');
const jwtLib = require('jsonwebtoken');
const dotenvLib = require('dotenv');

dotenvLib.config();

// 支出を示すキーワード
const EXPENSE_KEYWORDS = [
  '支出', '支払', '費用', '交通費', '食費', '光熱費',
  '家賃', '保険', '税金', '医療費', '教育費', '娯楽費',
  '通信費', '水道光熱費', 'ガソリン代', '駐車場代'
];

// Database connection utility
const ensureDatabaseConnectionAdmin = async () => {
  const isConnected = mongooseDB.connection.readyState === 1;
  if (isConnected) {
    return;
  }
  console.warn('[admin/fix-income-expense-types] Database not connected, attempting to connect...');
  try {
    const { MONGODB_URI } = process.env;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is required but not set.");
    }
    await mongooseDB.connect(MONGODB_URI, {
      dbName: 'workTimeTracker'
    });
    console.log('[admin/fix-income-expense-types] Database connected successfully');
  } catch (error) {
    console.error('[admin/fix-income-expense-types] Database connection failed:', error);
    throw error;
  }
};

// JWT verification utility
const verifyJWTToken = async (req) => {
  if (!req || !req.headers) {
    console.log('Request or headers object is undefined');
    return null;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    return jwtLib.verify(token, jwtSecret);
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

// 収入/支出判定関数
const determineIncomeExpenseType = (record: any) => {
  const { notes, amount } = record;
  let newType = 'income'; // デフォルトは収入
  
  // メモの内容から支出を判定
  if (notes && EXPENSE_KEYWORDS.some(keyword => notes.includes(keyword))) {
    newType = 'expense';
  }
  
  // 金額が負の場合は支出
  if (amount < 0) {
    newType = 'expense';
  }
  
  return newType;
};

// 収支記録のスキーマ
const IncomeExpenseRecordSchema = new mongooseDB.Schema({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const IncomeExpenseRecord = mongooseDB.models.SalaryRecord || mongooseDB.model('SalaryRecord', IncomeExpenseRecordSchema);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 管理者権限を確認
    const user = await verifyJWTToken(req);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // データベース接続
    await ensureDatabaseConnectionAdmin();

    // typeフィールドが欠損している記録を取得
    const recordsWithoutType = await IncomeExpenseRecord.find({
      $or: [
        { type: { $exists: false } },
        { type: null },
        { type: '' }
      ]
    });

    console.log(`typeフィールドが欠損している記録数: ${recordsWithoutType.length}`);

    if (recordsWithoutType.length === 0) {
      return res.status(200).json({
        success: true,
        message: '修正が必要な記録はありません',
        fixedCount: 0
      });
    }

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

    res.status(200).json({
      success: true,
      message: `${fixedCount}件の記録を修正しました`,
      fixedCount,
      totalRecords: recordsWithoutType.length
    });

  } catch (error) {
    console.error('修正中にエラーが発生しました:', error);
    res.status(500).json({
      success: false,
      message: '修正中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
