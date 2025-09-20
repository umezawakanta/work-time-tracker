import { ensureDatabaseConnection as ensureDBConnection, mongoose as mongooseDB } from '../utils/database';

// Memo schema
const MemoSchema = new mongooseDB.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: false },
  isFamilyOnly: { type: Boolean, default: false },
  isAdminOnly: { type: Boolean, default: false },
  userId: { type: String, required: true },
  postType: { 
    type: String, 
    enum: ['update_request', 'error_report', 'general'], 
    default: 'general' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'resolved', 'closed'], 
    default: 'pending' 
  },
  adminResponse: { type: String },
  adminResponseDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const MemoModel = mongooseDB.models.Memo || mongooseDB.model('Memo', MemoSchema);

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
    const jwt = require('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

export default async function handler(req: any, res: any) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production'
    ? /^https:\/\/.*\.vercel\.app$/.test(req.headers.origin) ? req.headers.origin : 'https://work-time-tracker-five.vercel.app'
    : '*'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // データベース接続
    await ensureDBConnection();

    // ユーザー認証
    const user = await verifyJWTToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Fetching memo counts for user:', user.userId);

    // ユーザーのメモ件数を取得
    const totalMemos = await MemoModel.countDocuments({ userId: user.userId });
    const errorReports = await MemoModel.countDocuments({ 
      userId: user.userId, 
      postType: 'error_report' 
    });
    const updateRequests = await MemoModel.countDocuments({ 
      userId: user.userId, 
      postType: 'update_request' 
    });
    const generalMemos = await MemoModel.countDocuments({ 
      userId: user.userId, 
      postType: 'general' 
    });

    // 公開メモの件数も取得
    const publicMemos = await MemoModel.countDocuments({ 
      isPublic: true,
      postType: 'general'
    });
    const publicErrorReports = await MemoModel.countDocuments({ 
      isPublic: true,
      postType: 'error_report' 
    });
    const publicUpdateRequests = await MemoModel.countDocuments({ 
      isPublic: true,
      postType: 'update_request' 
    });

    console.log('Memo counts:', {
      totalMemos,
      errorReports,
      updateRequests,
      generalMemos,
      publicMemos,
      publicErrorReports,
      publicUpdateRequests
    });

    res.status(200).json({
      success: true,
      counts: {
        personal: {
          total: totalMemos,
          general: generalMemos,
          errorReports: errorReports,
          updateRequests: updateRequests
        },
        public: {
          total: publicMemos + publicErrorReports + publicUpdateRequests,
          general: publicMemos,
          errorReports: publicErrorReports,
          updateRequests: publicUpdateRequests
        }
      }
    });

  } catch (error) {
    console.error('Error in memo count API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
