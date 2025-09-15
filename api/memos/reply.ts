const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// データベース接続
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'workTimeTracker'
    });
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

// JWTトークンからユーザー情報を取得
const getUserFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
};

// 返信スキーマ
const ReplySchema = new mongoose.Schema({
  memoId: { type: String, required: true },
  content: { type: String, required: true },
  authorName: { type: String, required: true },
  authorEmail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Reply = mongoose.models.Reply || mongoose.model('Reply', ReplySchema);

// メモスキーマ（返信を取得するため）
const MemoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  tags: [String],
  isPublic: { type: Boolean, default: false },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Memo = mongoose.models.Memo || mongoose.model('Memo', MemoSchema);

module.exports = async function handler(req, res) {
  // CORS設定
  const allowedOrigins = [
    'http://localhost:3000',
    'https://work-time-tracker-five.vercel.app',
    /^https:\/\/work-time-tracker-five-[a-z0-9-]+\.vercel\.app$/
  ];
  
  const origin = req.headers.origin;
  const isAllowedOrigin = allowedOrigins.some(allowedOrigin => {
    if (typeof allowedOrigin === 'string') {
      return allowedOrigin === origin;
    } else {
      return allowedOrigin.test(origin);
    }
  });

  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // JWTトークンからユーザー情報を取得
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    const { memoId, content } = req.body;

    // バリデーション
    if (!memoId || !content) {
      return res.status(400).json({
        success: false,
        message: 'メモIDと返信内容が必要です'
      });
    }

    // メモが存在するかチェック
    const memo = await Memo.findById(memoId);
    if (!memo) {
      return res.status(404).json({
        success: false,
        message: 'メモが見つかりません'
      });
    }

    // メモが公開されているかチェック
    if (!memo.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'このメモは公開されていません'
      });
    }

    // 返信を作成
    const reply = new Reply({
      memoId,
      content: content.trim(),
      authorName: user.displayName || user.email,
      authorEmail: user.email
    });

    await reply.save();

    // 元のメモの所有者の普通のメモにも返信をコピー
    try {
      // 元のメモの所有者の普通のメモを検索
      const privateMemo = await Memo.findOne({
        userId: memo.userId,
        isPublic: false,
        title: memo.title,
        content: memo.content
      });

      if (privateMemo) {
        // 普通のメモにも返信を作成
        const privateReply = new Reply({
          memoId: privateMemo._id.toString(),
          content: content.trim(),
          authorName: user.displayName || user.email,
          authorEmail: user.email
        });

        await privateReply.save();
        console.log('✅ Reply copied to private memo:', privateMemo._id.toString());
      }
    } catch (copyError) {
      console.warn('⚠️ Failed to copy reply to private memo:', copyError);
      // コピーに失敗してもメインの返信は成功とする
    }

    res.status(201).json({
      success: true,
      message: '返信を投稿しました',
      reply: {
        id: reply._id.toString(),
        memoId: reply.memoId,
        content: reply.content,
        authorName: reply.authorName,
        createdAt: reply.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Reply creation error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
}
