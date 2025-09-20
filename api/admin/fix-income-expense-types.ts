import { NextApiRequest, NextApiResponse } from 'next';
import { ensureDatabaseConnection, verifyJWT } from '../utils/database';
import mongoose from 'mongoose';

// 支出を示すキーワード
const EXPENSE_KEYWORDS = [
  '支出', '支払', '費用', '交通費', '食費', '光熱費',
  '家賃', '保険', '税金', '医療費', '教育費', '娯楽費',
  '通信費', '水道光熱費', 'ガソリン代', '駐車場代'
];

// 収支記録のスキーマ
const IncomeExpenseRecordSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const IncomeExpenseRecord = mongoose.models.SalaryRecord || mongoose.model('SalaryRecord', IncomeExpenseRecordSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 管理者権限を確認
    const user = await verifyJWT(req);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // データベース接続
    await ensureDatabaseConnection();

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
      // メモの内容から収入/支出を判定
      let newType = 'income'; // デフォルトは収入
      
      if (record.notes) {
        const notes = record.notes.toLowerCase();
        // 支出を示すキーワードをチェック
        if (EXPENSE_KEYWORDS.some(keyword => notes.includes(keyword.toLowerCase()))) {
          newType = 'expense';
        }
      }
      
      // 金額が負の場合は支出
      if (record.amount < 0) {
        newType = 'expense';
      }

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
