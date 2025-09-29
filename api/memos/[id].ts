const { Memo } = require('../utils/schemas');
const { setCorsHeaders, ensureDatabaseConnection, verifyJWT } = require('../utils/database');

module.exports = async (req, res) => {
  const { origin } = req.headers;
  setCorsHeaders(res, origin);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    
    // Ensure database connection
    await ensureDatabaseConnection();

    // Verify JWT token
    const userInfo = await verifyJWT(req);
    if (!userInfo) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です',
        error: 'Authentication required',
      });
    }

    const { id } = req.query;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'メモのIDが必要です',
        error: 'Memo ID is required',
      });
    }

    if (req.method === 'GET') {
      // 特定のメモを取得
      const memo = await Memo.findOne({ _id: id, userId: userInfo.userId });
      if (!memo) {
        return res.status(404).json({
          success: false,
          message: 'メモが見つかりません',
          error: 'Memo not found',
        });
      }


      res.status(200).json({
        success: true,
        message: 'メモの詳細を取得しました',
        memo: {
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
        },
      });
    } else if (req.method === 'PUT') {
      // メモを更新
      const updateData = req.body || {};
      
      // タイトルがない場合は内容の一行目をタイトルとして使用
      if (updateData.title !== undefined && (!updateData.title || !updateData.title.trim())) {
        if (updateData.content) {
          updateData.title = updateData.content.split('\n')[0].trim() || '無題';
        }
      }
      
      const memo = await Memo.findOneAndUpdate(
        { _id: id, userId: userInfo.userId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!memo) {
        return res.status(404).json({
          success: false,
          message: 'メモが見つかりません',
          error: 'Memo not found',
        });
      }


      res.status(200).json({
        success: true,
        message: 'メモを更新しました',
        memo: {
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
        },
      });
    } else if (req.method === 'DELETE') {
      // メモを削除
      const memo = await Memo.findOneAndDelete({ _id: id, userId: userInfo.userId });
      if (!memo) {
        return res.status(404).json({
          success: false,
          message: 'メモが見つかりません',
          error: 'Memo not found',
        });
      }


      res.status(200).json({
        success: true,
        message: 'メモを削除しました',
      });
    } else {
      res.status(405).json({
        success: false,
        message: 'メソッドが許可されていません',
        error: 'Method not allowed',
      });
    }
  } catch (error) {
    console.error('❌ Memo detail API error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: 'Internal server error',
    });
  }
};
