// VercelRequest, VercelResponse types are not needed in CommonJS
const { mongoose } = require('../utils/database');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { ensureDatabaseConnection, verifyJWT, handleError } = require('../utils/database');
const { TimeEntrySchema } = require('../utils/schemas');

dotenv.config();

const TimeEntry = mongoose.models.TimeEntry || mongoose.model('TimeEntry', TimeEntrySchema);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // データベース接続確認
    await ensureDatabaseConnection();

    // JWTトークンを検証してユーザーIDを取得
    const userInfo = await verifyJWT(req);
    if (!userInfo) {
      return handleError(res, { statusCode: 401, message: '認証が必要です' });
    }
    const userId = userInfo.userId;

    const { description } = req.body;
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }

    // 既存のアクティブな記録をチェック
    const existingEntry = await TimeEntry.findOne({
      userId,
      endTime: { $exists: false }
    });

    if (existingEntry) {
      return handleError(res, { statusCode: 400, message: '既に時間記録が進行中です。先に現在の記録を停止してください。' });
    }

    // 新しい時間記録を作成
    const timeEntry = new TimeEntry({
      userId,
      description: description.trim(),
      startTime: new Date(),
    });

    await timeEntry.save();

    console.log('[time/start] Time entry created:', timeEntry._id);

    return res.status(200).json({
      success: true,
      message: '時間記録を開始しました',
      entry: {
        id: timeEntry._id,
        description: timeEntry.description,
        startTime: timeEntry.startTime,
      }
    });

  } catch (error) {
    console.error('[time/start] Error:', error);
    return handleError(res, error, '時間記録の開始に失敗しました');
  }
}