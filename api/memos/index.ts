import { mongoose, jwt, ensureDatabaseConnection, verifyJWT } from '../utils/database.js';
import { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';

dotenv.config();

// Reply schema (独立したコレクション) - 重複を削除

// Database connection utility - 共通のdatabase.tsから使用

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
  userId: { type: String, required: false }, // 既存データとの互換性のためオプショナルに変更
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Reply = mongoose.models.Reply || mongoose.model('Reply', ReplySchema);

// JWT verification utility - 共通のdatabase.tsから使用

// CORS設定
const setCorsHeaders = (res, origin) => {
  const allowedOrigins = ['http://localhost:9000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-[a-z0-9-]+\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
          if (!res.headersSent) {
            res.status(400).json({
              success: false,
              message: 'リクエストデータの解析に失敗しました',
              error: 'Invalid JSON'
            });
          }
        }
      });
    } catch (error) {
      console.error('❌ Request body parsing error:', error);
      if (!res.headersSent) {
        res.status(400).json({
          success: false,
          message: 'リクエストの処理に失敗しました',
          error: 'Request parsing failed'
        });
      }
    }
  } else {
    await handleRequest(req, res);
  }
};

async function handleRequest(req, res) {
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
      const { category, search, adminOnly } = req.query;
      let query: any = {};
      
      // 管理者パネル用のリクエストの場合は、不具合報告と更新要望のみを取得
      if (userInfo.role === 'admin' && adminOnly === 'true') {
        query.postType = { $in: ['error_report', 'update_request'] };
      } else {
        // 一般ユーザーは自分のメモのみ
        query.userId = userInfo.userId;
      }
      
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


      // 各メモの返信を取得（エラーハンドリング付き）
      let memosWithReplies = [];
      
      try {
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
        memosWithReplies = memos.map(memo => {
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
            postType: memo.postType || 'general',
            status: memo.status || 'pending',
            adminResponse: memo.adminResponse,
            adminResponseDate: memo.adminResponseDate ? memo.adminResponseDate.toISOString() : null,
            createdAt: memo.createdAt ? memo.createdAt.toISOString() : new Date().toISOString(),
            updatedAt: memo.updatedAt ? memo.updatedAt.toISOString() : new Date().toISOString(),
            // いいね情報を追加
            isLiked: memo.likes?.includes(userInfo.userId) || false,
            likeCount: memo.likes?.length || 0,
            likes: memo.likes || [],
            replies: replies.map(reply => ({
              id: reply._id.toString(),
              content: reply.content,
              author: reply.authorName || '匿名', // 返信の作成者名を統一
              authorEmail: reply.authorEmail,
              createdAt: reply.createdAt ? reply.createdAt.toISOString() : new Date().toISOString()
            }))
          };
        });
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
          author: memo.authorName || '匿名', // メモの作成者名を追加
          authorEmail: memo.authorEmail, // メモの作成者メールを追加
          createdAt: memo.createdAt ? memo.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: memo.updatedAt ? memo.updatedAt.toISOString() : new Date().toISOString(),
          // いいね情報を追加
          isLiked: memo.likes?.includes(userInfo.userId) || false,
          likeCount: memo.likes?.length || 0,
          likes: memo.likes || [],
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
        const { title, content, category, tags, isPublic, isFamilyOnly, isAdminOnly, postType, status } = req.body;

        // 必須フィールドの検証
        if (!content || !category) {
          return res.status(400).json({
            success: false,
            message: '内容、カテゴリは必須です',
            error: 'Missing required fields',
          });
        }

        // タイトルがない場合は内容の一行目をタイトルとして使用
        const finalTitle = title && title.trim() 
          ? title.trim() 
          : content.split('\n')[0].trim() || '無題';

        const newMemo = new Memo({
          title: finalTitle,
          content: content.trim(),
          category: category.trim(),
          tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []),
          isPublic: Boolean(isPublic),
          isFamilyOnly: Boolean(isFamilyOnly),
          isAdminOnly: Boolean(isAdminOnly),
          userId: userInfo.userId,
          authorName: userInfo.displayName || userInfo.email || '匿名', // 作成者名を保存
          authorEmail: userInfo.email, // 作成者メールを保存
          postType: postType || 'general',
          status: status || 'pending',
        });

        const savedMemo = await newMemo.save();

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
    
    // レスポンスが既に送信されているかチェック
    if (res.headersSent) {
      console.error('Response already sent, cannot send error response');
      return;
    }
    
    try {
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } catch (jsonError) {
      console.error('Failed to send JSON error response:', jsonError);
      // 最後の手段としてプレーンテキストでエラーを送信
      if (!res.headersSent) {
        res.status(500).end('Internal Server Error');
      }
    }
  }
}

export default handler;
