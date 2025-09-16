const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Database connection utility
const ensureDatabaseConnection = async () => {
  const isConnected = mongoose.connection.readyState === 1;
  
  if (isConnected) {
    return;
  }

  console.warn('[memos/public] Database not connected, attempting to connect...');
  
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
    console.error('[memos/public] Failed to connect to database:', message);
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
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 更新時にupdatedAtを自動更新
MemoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Reply Schema
const ReplySchema = new mongoose.Schema({
  memoId: { type: String, required: true },
  content: { type: String, required: true },
  authorName: { type: String, required: true },
  authorEmail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Memo = mongoose.model('Memo', MemoSchema);
const Reply = mongoose.model('Reply', ReplySchema);

// CORS設定
const setCorsHeaders = (res, origin) => {
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-[a-z0-9-]+\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
    console.log('📝 Public memos API request started');
    
    // Ensure database connection
    await ensureDatabaseConnection();

    if (req.method === 'GET') {
      // 公開メモの一覧を取得（認証不要）
      const { category, search } = req.query;
      let query = { isPublic: true };
      
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

      // 各メモの返信を取得
      const memosWithReplies = await Promise.all(
        memos.map(async (memo) => {
          const replies = await Reply.find({ memoId: memo._id.toString() }).sort({ createdAt: 1 });
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

      console.log('✅ Public memos list retrieved:', {
        count: memosWithReplies.length,
        category,
        search,
      });

      res.status(200).json({
        success: true,
        message: '公開メモの一覧を取得しました',
        memos: memosWithReplies,
      });
    } else {
      res.status(405).json({
        success: false,
        message: 'メソッドが許可されていません',
        error: 'Method not allowed',
      });
    }
  } catch (error) {
    console.error('❌ Public memos API error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: 'Internal server error',
    });
  }
};
