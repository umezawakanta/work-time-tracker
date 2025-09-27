/**
 * メモのタグ更新API
 * PUT /api/memos/[id]/tags
 */

import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { tags } = req.body;

    // タグの検証
    if (!Array.isArray(tags)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tags must be an array' 
      });
    }

    // タグの長さ制限
    if (tags.length > 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Maximum 10 tags allowed' 
      });
    }

    // 各タグの長さ制限
    for (const tag of tags) {
      if (typeof tag !== 'string' || tag.length > 50) {
        return res.status(400).json({ 
          success: false, 
          message: 'Each tag must be a string with maximum 50 characters' 
        });
      }
    }

    // ObjectIdの検証
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid memo ID format' 
      });
    }

    const { db } = await connectToDatabase();
    const memosCollection = db.collection('memos');
    const objectId = new ObjectId(id);

    // メモの存在確認
    const existingMemo = await memosCollection.findOne({ _id: objectId });
    if (!existingMemo) {
      return res.status(404).json({ success: false, message: 'Memo not found' });
    }

    // タグ更新
    const result = await memosCollection.updateOne(
      { _id: objectId },
      { 
        $set: { 
          tags: tags,
          updatedAt: new Date().toISOString()
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ success: false, message: 'Failed to update tags' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Tags updated successfully',
      tags: tags
    });

  } catch (error) {
    console.error('Error updating memo tags:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
