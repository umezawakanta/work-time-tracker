const { ensureDatabaseConnection: initDB, mongoose: mongooseDB } = require('../utils/database');
const { verifyJWT } = require('../utils/validation');

// TimeEntry スキーマを定義
const TimeEntrySchema = new mongooseDB.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  projectId: {
    type: String,
    required: false
  },
  projectName: {
    type: String,
    required: false
  },
  category: {
    type: String,
    required: true,
    default: 'work'
  },
  description: {
    type: String,
    required: false
  },
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    required: false
  },
  duration: {
    type: Number,
    required: false
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

const TimeEntry = mongooseDB.models.TimeEntry || mongooseDB.model('TimeEntry', TimeEntrySchema);

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set'
    });
    
    console.log('Attempting to connect to database...');
    await initDB();
    console.log('Database connected successfully');
    
    // JWTトークンからユーザーIDを取得
    const userInfo = await verifyJWT(req);
    if (!userInfo) {
      return res.status(401).json({ message: '認証が必要です' });
    }
    const userId = userInfo.userId;
    
    console.log('Fetching time entries for userId:', userId);

    // ユーザーの時間記録を取得
    const timeEntries = await TimeEntry.find({ userId })
      .sort({ startTime: -1 })
      .limit(100); // 最新100件に制限

    res.status(200).json({
      success: true,
      data: timeEntries,
      count: timeEntries.length
    });

  } catch (error) {
    console.error('Error fetching time entries:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // データベース接続エラーの場合は空の配列を返す
    if (error.message && (error.message.includes('connect') || error.message.includes('database'))) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        message: 'Database connection failed, returning empty data'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}
