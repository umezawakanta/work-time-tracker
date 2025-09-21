const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { verifyJWT } = require('../utils/validation');

dotenv.config();

// データベース接続
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'workTimeTracker'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// 収支記録のスキーマ
const IncomeExpenseRecordSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true }, // salaryからamountに変更
  type: { type: String, enum: ['income', 'expense'], required: true }, // 収入/支出のタイプを追加
  transportation: { type: Number, default: 0 },
  overtime: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const IncomeExpenseRecord = mongoose.models.SalaryRecord || mongoose.model('SalaryRecord', IncomeExpenseRecordSchema);

/**
 * Handles HTTP requests for salary records.
 * @param {import('http').IncomingMessage} req - The HTTP request object.
 * @param {import('http').ServerResponse} res - The HTTP response object.
 */
module.exports = async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
    ? /^https:\/\/.*\.vercel\.app$/.test(req.headers.origin) ? req.headers.origin : 'https://work-time-tracker-five.vercel.app'
    : '*'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await connectDB();

  try {
    // JWTトークンからユーザーIDを取得
    console.log('Verifying JWT token...');
    if (req.headers.authorization) {
      console.log('Authorization header present.');
    } else {
      console.log('Authorization header not present.');
    }
    const userInfo = await verifyJWT(req);
    console.log('JWT verification result:', userInfo);
    if (!userInfo) {
      console.log('JWT verification failed');
      return res.status(401).json({ message: '認証が必要です' });
    }
    const userId = userInfo.userId;
    console.log('User ID:', userId);

    if (req.method === 'GET') {
      // 給料記録一覧を取得

      const records = await IncomeExpenseRecord.find({ userId })
        .sort({ date: -1 })
        .limit(50);


      // データベースのsalaryフィールドをamountフィールドに変換
      const recordsWithType = records.map(record => {
        const recordObj = record.toObject();
        // salaryフィールドをamountフィールドに変換
        if (recordObj.salary !== undefined) {
          recordObj.amount = recordObj.salary;
          delete recordObj.salary;
        }
        // typeフィールドが存在しない場合は、デフォルトでincomeとする
        // 既存のデータの整合性を保つため、amountの正負で判定しない
        if (!recordObj.type) {
          // 構造化されたログ出力（本番環境でも重要な診断情報として保持）
          const logData = {
            level: 'warn',
            component: 'salary.js',
            message: 'Record missing type field',
            recordId: recordObj._id,
            action: 'Setting default type to income',
            reason: 'Possible client bug or legacy data'
          };
          console.warn(JSON.stringify(logData));
          recordObj.type = "income";
        }
        return recordObj;
      });

      res.status(200).json({
        success: true,
        records: recordsWithType
      });

    } else if (req.method === 'POST') {
      // 新しい収支記録を作成
      console.log('POST request received:', req.body);
      const { date, amount, type, transportation, overtime, bonus, notes } = req.body;

      console.log('Parsed fields:', { date, amount, type, transportation, overtime, bonus, notes });

      if (!date || amount === undefined || !type) {
        console.log('Validation failed:', { date: !!date, amount: amount !== undefined, type: !!type });
        
        const missingFields = [];
        if (!date) missingFields.push('日付');
        if (amount === undefined) missingFields.push('金額');
        if (!type) missingFields.push('タイプ');
        
        return res.status(400).json({
          success: false,
          message: `必須フィールドが不足しています: ${missingFields.join(', ')}`,
          details: {
            date: !!date,
            amount: amount !== undefined,
            type: !!type,
            missingFields: missingFields
          }
        });
      }

      // 日本時間で保存するため、UTC時間に変換
      const jstDate = new Date(date);
      const utcDate = new Date(jstDate.getTime() - (9 * 60 * 60 * 1000));
      
      const record = new IncomeExpenseRecord({
        userId,
        date: utcDate,
        amount: Number(amount),
        type: type,
        transportation: Number(transportation) || 0,
        overtime: Number(overtime) || 0,
        bonus: Number(bonus) || 0,
        notes: notes || ''
      });

      await record.save();

      res.status(201).json({
        success: true,
        message: '収支記録が作成されました',
        record: record.toObject()
      });

    } else if (req.method === 'PUT') {
      // 収支記録を更新
      const { id, date, amount, type, transportation, overtime, bonus, notes } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: '記録IDが必要です'
        });
      }

      const updateData = {
        updatedAt: new Date()
      };

      if (date) {
        const jstDate = new Date(date);
        const utcDate = new Date(jstDate.getTime() - (9 * 60 * 60 * 1000));
        updateData.date = utcDate;
      }
      if (amount !== undefined) updateData.amount = Number(amount);
      if (type !== undefined) updateData.type = type;
      if (transportation !== undefined) updateData.transportation = Number(transportation);
      if (overtime !== undefined) updateData.overtime = Number(overtime);
      if (bonus !== undefined) updateData.bonus = Number(bonus);
      if (notes !== undefined) updateData.notes = notes;

      const record = await IncomeExpenseRecord.findByIdAndUpdate(
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
        message: '収支記録が更新されました',
        record: record.toObject()
      });

    } else if (req.method === 'DELETE') {
      // 給料記録を削除
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: '記録IDが必要です'
        });
      }

      const record = await IncomeExpenseRecord.findByIdAndDelete(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: '記録が見つかりません'
        });
      }

      res.status(200).json({
        success: true,
        message: '収支記録が削除されました'
      });

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error('Salary record API error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
}
