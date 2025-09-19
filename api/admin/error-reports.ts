const { ensureDatabaseConnection, mongoose } = require('../utils/database');
const dotenv = require('dotenv');

dotenv.config();

// 既存のMemoモデルを使用
const Memo = mongoose.models.Memo || mongoose.model('Memo', new mongoose.Schema({
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
}));

// 既存のReplyモデルを使用
const Reply = mongoose.models.Reply || mongoose.model('Reply', new mongoose.Schema({
  content: { type: String, required: true },
  authorName: { type: String, required: true },
  authorEmail: { type: String, required: true },
  memoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Memo', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}));

// CORS設定
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
};

const handleRequest = async (req, res) => {
  try {
    // リクエストオブジェクトの存在チェック
    if (!req) {
      console.error('Request object is undefined');
      return res.status(400).json({
        success: false,
        message: 'Invalid request'
      });
    }

    // データベース接続を確実にする
    await ensureDatabaseConnection();
    
    console.log('Database connected successfully for error-reports API');

    // 認証チェック（オプション - エラーレポートは公開可能）
    let userInfo = null;
    if (req.headers && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        try {
          userInfo = await verifyJWT(req);
        } catch (authError) {
          console.log('Authentication failed, proceeding without auth:', authError.message);
        }
      }
    }

    if (req.method === 'GET') {
      // 不具合報告メモを取得
      console.log('Fetching error reports...');
      
      try {
        const errorReports = await Memo.find({
          category: 'エラー報告',
          isPublic: true
        })
        .sort({ createdAt: -1 }) // 新しい順
        .limit(100) // 最大100件
        .lean(); // パフォーマンス向上のためlean()を使用
        
        console.log(`Found ${errorReports.length} error reports`);

        // 返信も取得（既存のReplyモデルを使用）
        const memosWithReplies = await Promise.all(
          errorReports.map(async (memo) => {
            try {
              const replies = await Reply.find({ memoId: memo._id.toString() })
                .sort({ createdAt: 1 })
                .lean();

              return {
                id: memo._id.toString(),
                title: memo.title || '無題',
                content: memo.content,
                category: memo.category,
                tags: memo.tags || [],
                isPublic: memo.isPublic,
                isFamilyOnly: memo.isFamilyOnly || false,
                isAdminOnly: memo.isAdminOnly || false,
                userId: memo.userId,
                author: memo.authorName || '匿名',
                authorEmail: memo.authorEmail || '',
                createdAt: memo.createdAt,
                updatedAt: memo.updatedAt,
                replies: replies.map(reply => ({
                  id: reply._id.toString(),
                  content: reply.content,
                  author: reply.authorName || '匿名',
                  authorEmail: reply.authorEmail || '',
                  createdAt: reply.createdAt,
                  updatedAt: reply.updatedAt,
                }))
              };
            } catch (replyError) {
              console.error('Error fetching replies for memo:', memo._id, replyError);
              return {
                id: memo._id.toString(),
                title: memo.title || '無題',
                content: memo.content,
                category: memo.category,
                tags: memo.tags || [],
                isPublic: memo.isPublic,
                isFamilyOnly: memo.isFamilyOnly || false,
                isAdminOnly: memo.isAdminOnly || false,
                userId: memo.userId,
                author: memo.authorName || '匿名',
                authorEmail: memo.authorEmail || '',
                createdAt: memo.createdAt,
                updatedAt: memo.updatedAt,
                replies: []
              };
            }
          })
        );

        return res.status(200).json({
          success: true,
          errorReports: memosWithReplies,
          total: memosWithReplies.length
        });
      } catch (queryError) {
        console.error('Error querying error reports:', queryError);
        return res.status(500).json({
          success: false,
          message: 'エラーレポートの取得に失敗しました',
          error: queryError.message
        });
      }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('Error in error-reports API:', error);
    
    // レスポンスが既に送信されている場合は何もしない
    if (res.headersSent) {
      return;
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました',
      error: error.message 
    });
  }
};

module.exports = async (req, res) => {
  try {
    // リクエストとレスポンスオブジェクトの存在チェック
    if (!req || !res) {
      console.error('Request or response object is undefined');
      return;
    }

    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    await handleRequest(req, res);
  } catch (error) {
    console.error('Error in error-reports module:', error);
    
    // レスポンスが既に送信されている場合は何もしない
    if (res && res.headersSent) {
      return;
    }
    
    if (res) {
      return res.status(500).json({ 
        success: false, 
        message: 'サーバーエラーが発生しました',
        error: error.message 
      });
    }
  }
};
