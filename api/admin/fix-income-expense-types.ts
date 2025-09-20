import { NextApiRequest, NextApiResponse } from 'next';

// 既存のAPIパターンに合わせてrequireを使用
const { ensureDatabaseConnection, verifyJWT } = require('../utils/database');
const { determineIncomeExpenseType } = require('../utils/incomeExpenseUtils');
const mongoose = require('mongoose');

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
