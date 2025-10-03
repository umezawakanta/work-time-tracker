import mongoose from 'mongoose';
import { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';

dotenv.config();

// データベース接続
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '', {
      dbName: 'workTimeTracker'
    });
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

// 給料記録のスキーマ
const SalaryRecordSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  salary: { type: Number, required: true },
  transportation: { type: Number, default: 0 },
  overtime: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SalaryRecord = mongoose.models.SalaryRecord as any || mongoose.model('SalaryRecord', SalaryRecordSchema);

export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
    ? /^https:\/\/.*\.vercel\.app$/.test(req.headers.origin) ? req.headers.origin : 'https://work-time-tracker-five.vercel.app'
    : '*'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await connectDB();

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: '記録IDが必要です'
    });
  }

  try {
    if (req.method === 'GET') {
      // 特定の給料記録を取得
      const record = await SalaryRecord.findById(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: '記録が見つかりません'
        });
      }

      res.status(200).json({
        success: true,
        record
      });

    } else if (req.method === 'PUT') {
      // 給料記録を更新
      const { date, salary, transportation, overtime, bonus, notes } = req.body;

      const updateData: any = {
        updatedAt: new Date()
      };

      if (date) {
        const jstDate = new Date(date);
        const utcDate = new Date(jstDate.getTime() - (9 * 60 * 60 * 1000));
        updateData.date = utcDate;
      }
      if (salary !== undefined) { updateData.salary = Number(salary); }
      if (transportation !== undefined) { updateData.transportation = Number(transportation); }
      if (overtime !== undefined) { updateData.overtime = Number(overtime); }
      if (bonus !== undefined) { updateData.bonus = Number(bonus); }
      if (notes !== undefined) { updateData.notes = notes; }

      const record = await SalaryRecord.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!record) {
        return res.status(404).json({
          success: false,
          message: '記録が見つかりません'
        });
      }

      res.status(200).json({
        success: true,
        message: '給料記録が更新されました',
        record
      });

    } else if (req.method === 'DELETE') {
      // 給料記録を削除
      const record = await SalaryRecord.findByIdAndDelete(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: '記録が見つかりません'
        });
      }

      res.status(200).json({
        success: true,
        message: '給料記録が削除されました'
      });

    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error('Salary record API error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
