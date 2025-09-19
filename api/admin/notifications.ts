import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../src/server/models/database';
import { Notification } from '../../src/server/models/Notification';
import { Memo } from '../../src/server/models/Memo';
import { verifyJWTToken } from '../../api/utils/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // データベース接続
    await connectToDatabase();

    // 管理者認証
    const user = await verifyJWTToken(req);
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { memoId, response, status } = req.body;

    if (!memoId || !response) {
      return res.status(400).json({ error: 'Memo ID and response are required' });
    }

    // メモを取得
    const memo = await Memo.findById(memoId);
    if (!memo) {
      return res.status(404).json({ error: 'Memo not found' });
    }

    // メモを更新
    const updateData: any = {
      adminResponse: response,
      adminResponseDate: new Date(),
    };

    if (status) {
      updateData.status = status;
    }

    await Memo.findByIdAndUpdate(memoId, updateData);

    // 通知を作成
    const notification = new Notification({
      userId: memo.userId,
      type: 'memo_response',
      title: memo.postType === 'error_report' ? '不具合報告への対応完了' : '更新要望への対応完了',
      message: response,
      relatedMemoId: memoId,
    });

    await notification.save();

    res.status(200).json({ 
      success: true, 
      message: 'Response sent and notification created',
      notification: {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt
      }
    });

  } catch (error) {
    console.error('Error in notifications API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
