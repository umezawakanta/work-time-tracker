const { ensureDatabaseConnection: ensureDBConnection, mongoose: mongooseDB } = require('../utils/database');

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

// Notification schema
const NotificationSchema = new mongooseDB.Schema({
  userId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['memo_response', 'status_update', 'admin_message', 'memo_reply'], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedMemoId: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const NotificationModel = mongooseDB.models.Notification || mongooseDB.model('Notification', NotificationSchema);

// Reply schema (独立したコレクション)
const ReplySchemaDef = new mongooseDB.Schema(
  {
    content: { type: String, required: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    memoId: { type: mongooseDB.Schema.Types.ObjectId, ref: 'Memo', required: true },
    userId: { type: String, required: false } // 既存データとの互換性のためオプショナルに変更
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const ReplyModel = mongooseDB.models.Reply || mongooseDB.model("Reply", ReplySchemaDef);

module.exports = async function handler(req, res) {
  // CORS設定
  const { origin } = req.headers;
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
    // Ensure database connection is established
    await ensureDBConnection();
    
    
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

      const replies = await ReplyModel.find({ memoId }).sort({ createdAt: 1 });

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
      const { memoId, content, authorName, authorEmail, userId } = req.body;
      
      if (!memoId || !content || !authorName || !authorEmail) {
        return res.status(400).json({
          success: false,
          message: 'memoId, content, authorName, and authorEmail are required',
        });
      }

      const newReply = new ReplyModel({
        content: content.trim(),
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim(),
        memoId: new mongooseDB.Types.ObjectId(memoId), // ObjectIdに変換
        userId: userId || null // userIdが提供されない場合はnullを設定
      });

      const savedReply = await newReply.save();

      // メモの作成者に通知を送信
      try {
        const memo = await MemoModel.findById(memoId);
        if (memo && memo.userId !== userId) { // 自分自身のメモには通知しない
          const notification = new NotificationModel({
            userId: memo.userId,
            type: 'memo_reply',
            title: 'メモに返信がつきました',
            message: `${authorName}さんが「${memo.title}」に返信しました。クリックして返信を確認してください。`,
            relatedMemoId: memoId,
          });

          await notification.save();
          console.log('Reply notification created for user:', memo.userId);
        }
      } catch (notificationError) {
        console.error('Failed to create reply notification:', notificationError);
        // 通知の作成に失敗しても返信は成功とする
      }

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