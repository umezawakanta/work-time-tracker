const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Database connection utility
const ensureDatabaseConnection = async () => {
  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    return;
  }
  console.warn('[memos/reply] Database not connected, attempting to connect...');
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is required but not set.");
    }
    
    if (MONGODB_URI === "memory://") {
      console.log("🧪 MongoDB connection skipped (memory mode for testing)");
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      dbName: 'workTimeTracker',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 30000,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[memos/reply] Failed to connect to database:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};

// Reply schema (独立したコレクション)
const ReplySchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    memoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Memo', required: true },
    userId: { type: String, required: false } // 既存データとの互換性のためオプショナルに変更
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Reply = mongoose.models.Reply || mongoose.model("Reply", ReplySchema);

module.exports = async function handler(req, res) {
  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];

  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  
  const isAllowedOrigin = origin
    && origin !== "null"
    && origin !== null
    && origin !== undefined
    && origin.length > 0
    && (allowedOrigins.includes(origin) || isPreview);

  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
    return;
  }

  // リクエストボディの解析（POSTリクエストの場合）
  if (req.method === 'POST') {
    try {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          req.body = JSON.parse(body);
          await handleReplyRequest(req, res);
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
    await handleReplyRequest(req, res);
  }
};

async function handleReplyRequest(req, res) {
  try {
    console.log(`📝 Reply ${req.method} operation started`);
    
    // Ensure database connection is established
    await ensureDatabaseConnection();
    
    // データベース接続状態を確認
    console.log('📝 Database connection state:', mongoose.connection.readyState);
    console.log('📝 Database name:', mongoose.connection.db?.databaseName);
    
    // Replyコレクションの存在確認
    const collections = await mongoose.connection.db?.listCollections().toArray();
    console.log('📝 Available collections:', collections?.map(c => c.name));
    
    const replyCollectionExists = collections?.some(c => c.name === 'replies');
    console.log('📝 Reply collection exists:', replyCollectionExists);
    
    // Get authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required',
      });
    }

    const token = authHeader.substring(7);
    
    // Verify token (simplified - in production, use proper JWT verification)
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token',
      });
    }

    if (req.method === 'GET') {
      // Get replies for a specific memo
      const { memoId } = req.query;
      
      if (!memoId) {
        return res.status(400).json({
          success: false,
          message: 'Memo ID is required',
        });
      }

      const replies = await Reply.find({ memoId }).sort({ createdAt: 1 });
      
      console.log('✅ Replies retrieved successfully:', replies.length);

      res.status(200).json({
        success: true,
        replies: replies.map(reply => ({
          id: reply._id.toString(),
          content: reply.content,
          authorName: reply.authorName,
          authorEmail: reply.authorEmail,
          createdAt: reply.createdAt ? reply.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: reply.updatedAt ? reply.updatedAt.toISOString() : new Date().toISOString(),
        }))
      });

    } else if (req.method === 'POST') {
      // Create new reply
      console.log('📝 Creating new reply with data:', req.body);
      console.log('📝 Request body type:', typeof req.body);
      console.log('📝 Request body keys:', Object.keys(req.body || {}));
      
      const { memoId, content, authorName, authorEmail, userId } = req.body;
      
      if (!memoId || !content || !authorName || !authorEmail) {
        console.log('❌ Missing required fields:', { 
          memoId: !!memoId, 
          content: !!content, 
          authorName: !!authorName, 
          authorEmail: !!authorEmail 
        });
        return res.status(400).json({
          success: false,
          message: 'memoId, content, authorName, and authorEmail are required',
        });
      }

      const newReply = new Reply({
        content: content.trim(),
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim(),
        memoId: new mongoose.Types.ObjectId(memoId), // ObjectIdに変換
        userId: userId || null // userIdが提供されない場合はnullを設定
      });

      console.log('📝 Saving reply to database...');
      console.log('📝 Reply data before save:', {
        content: newReply.content,
        authorName: newReply.authorName,
        authorEmail: newReply.authorEmail,
        memoId: newReply.memoId,
        userId: newReply.userId
      });
      
      const savedReply = await newReply.save();
      console.log('📝 Reply saved to database:', {
        _id: savedReply._id,
        memoId: savedReply.memoId,
        content: savedReply.content,
        createdAt: savedReply.createdAt
      });

      // 保存後にデータベースから確認
      const verifyReply = await Reply.findById(savedReply._id);
      console.log('📝 Verification - Reply found in DB:', verifyReply ? 'YES' : 'NO');
      if (verifyReply) {
        console.log('📝 Verification - Reply data:', {
          _id: verifyReply._id,
          memoId: verifyReply.memoId,
          content: verifyReply.content
        });
      }

      console.log('✅ Reply created successfully:', {
        replyId: newReply._id,
        memoId: memoId,
      });

      res.status(201).json({
        success: true,
        message: 'Reply created successfully',
        reply: {
          id: newReply._id.toString(),
          content: newReply.content,
          authorName: newReply.authorName,
          authorEmail: newReply.authorEmail,
          createdAt: newReply.createdAt ? newReply.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: newReply.updatedAt ? newReply.updatedAt.toISOString() : new Date().toISOString(),
        }
      });
    }

  } catch (error) {
    console.error('❌ Reply operation error:', error);

    res.status(500).json({
      success: false,
      message: 'An error occurred while processing the reply',
      error: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : String(error))
        : 'Internal server error',
    });
  }
};