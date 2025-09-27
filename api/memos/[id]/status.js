/**
 * メモのステータス更新API
 * PUT /api/memos/[id]/status
 */

import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { status } = req.body;

    // ステータスの検証
    const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be one of: pending, in_progress, resolved, closed' 
      });
    }

    const { db } = await connectToDatabase();
    const memosCollection = db.collection('memos');

    // メモの存在確認
    const existingMemo = await memosCollection.findOne({ _id: id });
    if (!existingMemo) {
      return res.status(404).json({ success: false, message: 'Memo not found' });
    }

    // ステータス更新
    const result = await memosCollection.updateOne(
      { _id: id },
      { 
        $set: { 
          status: status,
          updatedAt: new Date().toISOString()
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ success: false, message: 'Failed to update status' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Status updated successfully',
      status: status
    });

  } catch (error) {
    console.error('Error updating memo status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
