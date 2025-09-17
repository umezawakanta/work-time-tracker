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

    const { entryId } = req.body;
    if (!entryId || typeof entryId !== 'string') {
      return res.status(400).json({ success: false, message: 'Entry ID is required' });
    }

    // 時間記録を検索
    const timeEntry = await TimeEntry.findOne({
      _id: entryId,
      userId,
      endTime: { $exists: false }
    });

    if (!timeEntry) {
      return handleError(res, { statusCode: 404, message: 'アクティブな時間記録が見つかりません' });
    }

    // 終了時間と経過時間を計算
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - timeEntry.startTime.getTime()) / 1000);

    // 時間記録を更新
    timeEntry.endTime = endTime;
    timeEntry.duration = duration;
    timeEntry.updatedAt = new Date();
    
    await timeEntry.save();


    return res.status(200).json({
      success: true,
      message: '時間記録を停止しました',
      entry: {
        id: timeEntry._id,
        description: timeEntry.description,
        startTime: timeEntry.startTime,
        endTime: timeEntry.endTime,
        duration: timeEntry.duration,
      }
    });

  } catch (error) {
    console.error('[time/stop] Error:', error);
    return handleError(res, error, '時間記録の停止に失敗しました');
  }
}