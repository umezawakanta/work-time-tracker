const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Database connection utility
const ensureDatabaseConnection = async () => {
  const isConnected = mongoose.connection.readyState === 1;
  
  if (isConnected) {
    return;
  }

  console.warn('[memos] Database not connected, attempting to connect...');
  
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    if (MONGODB_URI === "memory://") {
      console.log("🧪 MongoDB connection skipped (memory mode for testing)");
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      dbName: 'workTimeTracker',
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[memos] Failed to connect to database:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};

// Memo Schema
const MemoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: false },
  isFamilyOnly: { type: Boolean, default: false },
  isAdminOnly: { type: Boolean, default: false },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Reply Schema (独立したコレクション)
const ReplySchema = new mongoose.Schema({
  content: { type: String, required: true },
  authorName: { type: String, required: true },
  authorEmail: { type: String, required: true },
  memoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Memo', required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 更新時にupdatedAtを自動更新
MemoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Memo = mongoose.model('Memo', MemoSchema);

// 返信スキーマ (独立したコレクション)
const ReplySchema = new mongoose.Schema({
  content: { type: String, required: true },
  authorName: { type: String, required: true },
  authorEmail: { type: String, required: true },
  memoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Memo', required: true },
  userId: { type: String, required: false }, // 既存データとの互換性のためオプショナルに変更
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Reply = mongoose.model('Reply', ReplySchema);

// JWT verification utility
const verifyJWT = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[memos] JWT_SECRET not configured');
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch (error) {
    console.error('[memos] JWT verification failed:', error);
    return null;
  }
};

// CORS設定
const setCorsHeaders = (res, origin) => {
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-[a-z0-9-]+\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');
};

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  setCorsHeaders(res, origin);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('📝 Memos API request started');
    
    // Ensure database connection
    await ensureDatabaseConnection();

    // Verify JWT token
    const userInfo = await verifyJWT(req);
    if (!userInfo) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です',
        error: 'Authentication required',
      });
    }

    if (req.method === 'GET') {
      // メモの一覧を取得
      const { category, search } = req.query;
      let query = { userId: userInfo.userId };
      
      if (category && category !== 'all') {
        query.category = category;
      }
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const memos = await Memo.find(query).sort({ updatedAt: -1 });

      console.log('✅ Memos list retrieved:', {
        count: memos.length,
        userId: userInfo.userId,
        category,
        search,
      });

      // デバッグ用：全返信データを確認
      const allReplies = await Reply.find({});
      console.log('📝 All replies in database:', allReplies.length);

      // 各メモの返信を取得
      const memosWithReplies = await Promise.all(
        memos.map(async (memo) => {
          const replies = await Reply.find({ memoId: memo._id.toString() }).sort({ createdAt: 1 });
          console.log(`📝 Memo ${memo._id.toString()} replies:`, replies.length);
          return {
            id: memo._id.toString(),
            title: memo.title,
            content: memo.content,
            category: memo.category,
            tags: memo.tags || [],
            isPublic: memo.isPublic,
            isFamilyOnly: memo.isFamilyOnly || false,
            isAdminOnly: memo.isAdminOnly || false,
            createdAt: memo.createdAt ? memo.createdAt.toISOString() : new Date().toISOString(),
            updatedAt: memo.updatedAt ? memo.updatedAt.toISOString() : new Date().toISOString(),
            replies: replies.map(reply => ({
              id: reply._id.toString(),
              content: reply.content,
              authorName: reply.authorName,
              authorEmail: reply.authorEmail,
              createdAt: reply.createdAt.toISOString()
            }))
          };
        })
      );

      res.status(200).json({
        success: true,
        message: 'メモの一覧を取得しました',
        memos: memosWithReplies,
      });
    } else if (req.method === 'POST') {
      // 新しいメモを追加
      const { title, content, category, tags, isPublic, isFamilyOnly, isAdminOnly } = req.body;

      // 必須フィールドの検証
      if (!title || !content || !category) {
        return res.status(400).json({
          success: false,
          message: 'タイトル、内容、カテゴリは必須です',
          error: 'Missing required fields',
        });
      }

      const newMemo = new Memo({
        title,
        content,
        category,
        tags: tags || [],
        isPublic: isPublic || false,
        isFamilyOnly: isFamilyOnly || false,
        isAdminOnly: isAdminOnly || false,
        userId: userInfo.userId,
      });

      const savedMemo = await newMemo.save();

      console.log('✅ Memo created successfully:', {
        memoId: savedMemo._id.toString(),
        title: savedMemo.title,
        userId: userInfo.userId,
      });

      res.status(201).json({
        success: true,
        message: 'メモを追加しました',
        memo: {
          id: savedMemo._id.toString(),
          title: savedMemo.title,
          content: savedMemo.content,
          category: savedMemo.category,
          tags: savedMemo.tags || [],
          isPublic: savedMemo.isPublic,
          createdAt: savedMemo.createdAt ? savedMemo.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: savedMemo.updatedAt ? savedMemo.updatedAt.toISOString() : new Date().toISOString(),
        },
      });
    } else {
      res.status(405).json({
        success: false,
        message: 'メソッドが許可されていません',
        error: 'Method not allowed',
      });
    }
  } catch (error) {
    console.error('❌ Memos API error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: 'Internal server error',
    });
  }
};
