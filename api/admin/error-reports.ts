const { mongoose, ensureDatabaseConnection, verifyJWT } = require('../utils/database');
const dotenv = require('dotenv');

dotenv.config();

// Memo Schema
const MemoSchema = new mongoose.Schema({
  title: { type: String, required: false },
  content: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: false },
  isFamilyOnly: { type: Boolean, default: false },
  isAdminOnly: { type: Boolean, default: false },
  userId: { type: String, required: true },
  authorName: { type: String, required: false },
  authorEmail: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Memo = mongoose.models.Memo || mongoose.model('Memo', MemoSchema);

// CORS設定
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
};

const handleRequest = async (req, res) => {
  try {
    // データベース接続を確実にする
    await ensureDatabaseConnection();

    // 認証チェック
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: '認証が必要です' });
    }

    const token = authHeader.substring(7);
    const userInfo = await verifyJWT(token);
    
    if (!userInfo) {
      return res.status(401).json({ success: false, message: '無効なトークンです' });
    }

    // 管理者権限チェック（必要に応じて）
    // ここでは全ユーザーがアクセス可能とします

    if (req.method === 'GET') {
      // 不具合報告メモを取得
      const errorReports = await Memo.find({
        category: 'エラー報告',
        isPublic: true
      })
      .sort({ createdAt: -1 }) // 新しい順
      .limit(100); // 最大100件

      // 返信も取得
      const ReplySchema = new mongoose.Schema({
        memoId: { type: String, required: true },
        content: { type: String, required: true },
        authorName: { type: String, required: false },
        authorEmail: { type: String, required: false },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      });

      const Reply = mongoose.models.Reply || mongoose.model('Reply', ReplySchema);

      const memosWithReplies = await Promise.all(
        errorReports.map(async (memo) => {
          const replies = await Reply.find({ memoId: memo._id.toString() })
            .sort({ createdAt: 1 });

          return {
            id: memo._id,
            title: memo.title,
            content: memo.content,
            category: memo.category,
            tags: memo.tags || [],
            isPublic: memo.isPublic,
            isFamilyOnly: memo.isFamilyOnly,
            isAdminOnly: memo.isAdminOnly,
            userId: memo.userId,
            author: memo.authorName || '匿名',
            authorEmail: memo.authorEmail,
            createdAt: memo.createdAt,
            updatedAt: memo.updatedAt,
            replies: replies.map(reply => ({
              id: reply._id,
              content: reply.content,
              author: reply.authorName || '匿名',
              authorEmail: reply.authorEmail,
              createdAt: reply.createdAt,
              updatedAt: reply.updatedAt,
            }))
          };
        })
      );

      return res.status(200).json({
        success: true,
        errorReports: memosWithReplies,
        total: memosWithReplies.length
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('Error in error-reports API:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました',
      error: error.message 
    });
  }
};

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await handleRequest(req, res);
};
