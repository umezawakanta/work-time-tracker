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

// 更新時にupdatedAtを自動更新
MemoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Memo = mongoose.model('Memo', MemoSchema);

// Reply Schema (独立したコレクション)
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

  // リクエストボディの解析（POST/PUTリクエストの場合）
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          req.body = JSON.parse(body);
          await handleRequest(req, res);
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError);
          res.status(400).json({
            success: false,
            message: 'リクエストデータの解析に失敗しました',
            error: 'Invalid JSON'
          });
        }
      });
    } catch (error) {
      console.error('❌ Request body parsing error:', error);
      res.status(400).json({
        success: false,
        message: 'リクエストの処理に失敗しました',
        error: 'Request parsing failed'
      });
    }
  } else {
    await handleRequest(req, res);
  }
};

async function handleRequest(req, res) {
  try {
    console.log('📝 Memos API request started');
    console.log('📝 Request method:', req.method);
    console.log('📝 Request headers:', req.headers);
    
    // Ensure database connection
    await ensureDatabaseConnection();

    // Verify JWT token
    const userInfo = await verifyJWT(req);
    if (!userInfo) {
      console.log('❌ Authentication failed');
      return res.status(401).json({
        success: false,
        message: '認証が必要です',
        error: 'Authentication required',
      });
    }

    console.log('✅ User authenticated:', { userId: userInfo.userId });

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

      // 各メモの返信を取得（エラーハンドリング付き）
      let memosWithReplies = [];
      
      try {
        // デバッグ用：全返信データを確認
        const allReplies = await Reply.find({});
        console.log('📝 All replies in database:', allReplies.length);
        console.log('📝 Sample reply data:', allReplies.slice(0, 2));
        
        // 各返信のmemoIdを確認
        allReplies.forEach((reply, index) => {
          console.log(`📝 Reply ${index + 1}:`, {
            _id: reply._id.toString(),
            memoId: reply.memoId.toString(),
            content: reply.content.substring(0, 30) + '...'
          });
        });

        memosWithReplies = await Promise.all(
          memos.map(async (memo) => {
            try {
              // ObjectIdで検索（型を統一）
              const replies = await Reply.find({ 
                memoId: memo._id
              }).sort({ createdAt: 1 });
              
              console.log(`📝 Memo ${memo._id.toString()} replies:`, replies.length);
              
              if (replies.length > 0) {
                console.log(`📝 Sample reply for memo ${memo._id.toString()}:`, {
                  id: replies[0]._id.toString(),
                  memoId: replies[0].memoId.toString(),
                  content: replies[0].content.substring(0, 50) + '...'
                });
              }
              
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
                  createdAt: reply.createdAt ? reply.createdAt.toISOString() : new Date().toISOString()
                }))
              };
            } catch (replyError) {
              console.error(`❌ Error loading replies for memo ${memo._id.toString()}:`, replyError);
              // 返信の取得に失敗した場合は空の配列を返す
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
                replies: []
              };
            }
          })
        );
      } catch (replyCollectionError) {
        console.error('❌ Error accessing Reply collection:', replyCollectionError);
        // Replyコレクションにアクセスできない場合は、返信なしでメモのみを返す
        memosWithReplies = memos.map(memo => ({
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
          replies: []
        }));
      }

      res.status(200).json({
        success: true,
        message: 'メモの一覧を取得しました',
        memos: memosWithReplies,
      });
    } else if (req.method === 'POST') {
      // 新しいメモを追加
      try {
        console.log('📝 Creating new memo with data:', req.body);
        console.log('📝 Request body type:', typeof req.body);
        console.log('📝 Request body keys:', Object.keys(req.body || {}));
        
        const { title, content, category, tags, isPublic, isFamilyOnly, isAdminOnly } = req.body;

        // 必須フィールドの検証
        if (!title || !content || !category) {
          console.log('❌ Missing required fields:', { title: !!title, content: !!content, category: !!category });
          return res.status(400).json({
            success: false,
            message: 'タイトル、内容、カテゴリは必須です',
            error: 'Missing required fields',
          });
        }

        const newMemo = new Memo({
          title: title.trim(),
          content: content.trim(),
          category: category.trim(),
          tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []),
          isPublic: Boolean(isPublic),
          isFamilyOnly: Boolean(isFamilyOnly),
          isAdminOnly: Boolean(isAdminOnly),
          userId: userInfo.userId,
        });

        console.log('📝 Saving memo to database...');
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
            isFamilyOnly: savedMemo.isFamilyOnly || false,
            isAdminOnly: savedMemo.isAdminOnly || false,
            createdAt: savedMemo.createdAt ? savedMemo.createdAt.toISOString() : new Date().toISOString(),
            updatedAt: savedMemo.updatedAt ? savedMemo.updatedAt.toISOString() : new Date().toISOString(),
          },
        });
      } catch (memoCreateError) {
        console.error('❌ Error creating memo:', memoCreateError);
        
        if (memoCreateError instanceof Error) {
          console.error('Error message:', memoCreateError.message);
          console.error('Error stack:', memoCreateError.stack);
        }
        
        res.status(500).json({
          success: false,
          message: 'メモの作成に失敗しました',
          error: memoCreateError instanceof Error ? memoCreateError.message : 'Unknown error',
        });
      }
    } else {
      res.status(405).json({
        success: false,
        message: 'メソッドが許可されていません',
        error: 'Method not allowed',
      });
    }
  } catch (error) {
    console.error('❌ Memos API error:', error);
    
    // エラーの詳細をログに記録
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
