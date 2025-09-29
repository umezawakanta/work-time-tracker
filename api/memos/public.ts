const { mongoose, ensureDatabaseConnection } = require('../utils/database');
const dotenv = require('dotenv');

dotenv.config();

// Memo Schema
const MemoSchema = new mongoose.Schema({
  title: { type: String, required: false }, // タイトルを必須でなくする
  content: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: false },
  isFamilyOnly: { type: Boolean, default: false },
  isAdminOnly: { type: Boolean, default: false },
  userId: { type: String, required: true },
  authorName: { type: String, required: false }, // 作成者名を追加
  authorEmail: { type: String, required: false }, // 作成者メールを追加
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
  userId: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Reply = mongoose.models.Reply || mongoose.model('Reply', ReplySchema);

// CORS設定
const setCorsHeaders = (res, origin) => {
  const allowedOrigins = ['http://localhost:9000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-[a-z0-9-]+\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
};

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  setCorsHeaders(res, origin);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Ensure database connection
    try {
      await ensureDatabaseConnection();
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return res.status(500).json({
        success: false,
        message: 'データベース接続に失敗しました',
        error: 'Database connection failed',
      });
    }

    if (req.method === 'GET') {
      // 公開メモの一覧を取得（認証不要）
      const { category, search } = req.query;
      let query: any = { isPublic: true };
      
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

      // 全メモのIDを取得
      const memoIds = memos.map(memo => memo._id);
      
      // 一度のクエリで全返信を取得（パフォーマンス向上）
      const allReplies = await Reply.find({ 
        memoId: { $in: memoIds } 
      }).sort({ createdAt: 1 });
      
      // 返信をメモIDごとにグループ化
      const repliesByMemoId = allReplies.reduce((acc, reply) => {
        const memoIdStr = reply.memoId.toString();
        if (!acc[memoIdStr]) {
          acc[memoIdStr] = [];
        }
        acc[memoIdStr].push(reply);
        return acc;
      }, {} as Record<string, any[]>);

      // 各メモに返信を関連付け
      const memosWithReplies = memos.map(memo => {
        const memoIdStr = memo._id.toString();
        const replies = repliesByMemoId[memoIdStr] || [];
        
        return {
          id: memo._id.toString(),
          title: memo.title,
          content: memo.content,
          category: memo.category,
          tags: memo.tags || [],
          isPublic: memo.isPublic,
          isFamilyOnly: memo.isFamilyOnly || false,
          isAdminOnly: memo.isAdminOnly || false,
          author: memo.authorName || '匿名', // メモの作成者名を追加
          authorEmail: memo.authorEmail, // メモの作成者メールを追加
          postType: memo.postType || 'general', // 投稿タイプを追加
          status: memo.status || 'pending', // ステータスを追加
          adminResponse: memo.adminResponse, // 管理者返信を追加
          adminResponseDate: memo.adminResponseDate ? memo.adminResponseDate.toISOString() : null, // 管理者返信日時を追加
          createdAt: memo.createdAt ? memo.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: memo.updatedAt ? memo.updatedAt.toISOString() : new Date().toISOString(),
          replies: replies.map(reply => ({
            id: reply._id.toString(),
            content: reply.content,
            author: reply.authorName || '匿名', // 返信の作成者名を統一
            authorEmail: reply.authorEmail,
            createdAt: reply.createdAt ? reply.createdAt.toISOString() : new Date().toISOString()
          }))
        };
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
    
    // レスポンスが既に送信されているかチェック
    if (res.headersSent) {
      console.error('Response already sent, cannot send error response');
      return;
    }
    
    try {
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました',
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    } catch (jsonError) {
      console.error('Failed to send JSON error response:', jsonError);
      // 最後の手段としてプレーンテキストでエラーを送信
      if (!res.headersSent) {
        res.status(500).end('Internal Server Error');
      }
    }
  }
};
