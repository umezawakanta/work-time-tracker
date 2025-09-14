const mongoose = require('mongoose');

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

    const { memoId, content, authorName, authorEmail } = req.body;

    // バリデーション
    if (!memoId || !content || !authorName || !authorEmail) {
      return res.status(400).json({
        success: false,
        message: 'すべてのフィールドが必要です'
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
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim()
    });

    await reply.save();

    res.status(201).json({
      success: true,
      message: '返信を投稿しました',
      reply: {
        id: reply._id.toString(),
        memoId: reply.memoId,
        content: reply.content,
        authorName: reply.authorName,
        authorEmail: reply.authorEmail,
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
