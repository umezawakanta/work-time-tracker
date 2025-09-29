// メモのいいね機能API

const { verifyJWT } = require('../../utils/validation');
const { ensureDatabaseConnection: connectDB } = require('../../utils/database');
const { Memo } = require('../../../src/server/models/Memo');

module.exports = async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
    ? /^https:\/\/.*\.vercel\.app$/.test(req.headers.origin || '') ? req.headers.origin : 'https://work-time-tracker-five.vercel.app'
    : '*'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await connectDB();

  try {
    // JWTトークンからユーザーIDを取得
    const userInfo = await verifyJWT(req);
    if (!userInfo) {
      return res.status(401).json({ message: '認証が必要です' });
    }
    const { userId } = userInfo;

    const { id: memoId } = req.query;

    if (!memoId || typeof memoId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'メモIDが必要です'
      });
    }

    if (req.method === 'GET') {
      // メモのいいね情報を取得
      const memo = await Memo.findById(memoId);
      if (!memo) {
        return res.status(404).json({
          success: false,
          message: 'メモが見つかりません'
        });
      }

      const isLiked = memo.likes?.includes(userId) || false;
      const likeCount = memo.likes?.length || 0;

      return res.status(200).json({
        success: true,
        isLiked,
        likeCount,
        likes: memo.likes || []
      });

    } else if (req.method === 'POST') {
      // いいねを追加
      const memo = await Memo.findById(memoId);
      if (!memo) {
        return res.status(404).json({
          success: false,
          message: 'メモが見つかりません'
        });
      }

      // 既にいいねしている場合は何もしない
      if (memo.likes?.includes(userId)) {
        return res.status(200).json({
          success: true,
          message: '既にいいねしています',
          isLiked: true,
          likeCount: memo.likes.length
        });
      }

      // いいねを追加
      if (!memo.likes) {
        memo.likes = [];
      }
      memo.likes.push(userId);
      await memo.save();

      return res.status(200).json({
        success: true,
        message: 'いいねしました',
        isLiked: true,
        likeCount: memo.likes.length,
        authorId: memo.userId
      });

    } else if (req.method === 'DELETE') {
      // いいねを削除
      const memo = await Memo.findById(memoId);
      if (!memo) {
        return res.status(404).json({
          success: false,
          message: 'メモが見つかりません'
        });
      }

      // いいねしていない場合は何もしない
      if (!memo.likes?.includes(userId)) {
        return res.status(200).json({
          success: true,
          message: 'いいねしていません',
          isLiked: false,
          likeCount: memo.likes?.length || 0
        });
      }

      // いいねを削除
      memo.likes = memo.likes.filter((likeUserId) => likeUserId !== userId);
      await memo.save();

      return res.status(200).json({
        success: true,
        message: 'いいねを取り消しました',
        isLiked: false,
        likeCount: memo.likes.length,
        authorId: memo.userId
      });

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error('Like API error:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
