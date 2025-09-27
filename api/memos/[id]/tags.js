/**
 * メモのタグ更新API
 * PUT /api/memos/[id]/tags
 */

const { mongoose, verifyJWT } = require('../../utils/database');
const dotenv = require('dotenv');

dotenv.config();

// Memo Schema
const MemoSchema = new mongoose.Schema({
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

const Memo = mongoose.model('Memo', MemoSchema);

export default async function handler(req, res) {
  console.log('Tags API called:', { method: req.method, query: req.query, body: req.body });
  
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { tags } = req.body;
    
    console.log('Processing tags update:', { id, tags });

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

    // メモの存在確認と更新
    const existingMemo = await Memo.findById(id);
    console.log('Existing memo found:', existingMemo ? 'Yes' : 'No');
    if (!existingMemo) {
      return res.status(404).json({ success: false, message: 'Memo not found' });
    }

    // タグ更新
    console.log('Updating memo tags...');
    const updatedMemo = await Memo.findByIdAndUpdate(
      id,
      { 
        tags: tags,
        updatedAt: new Date()
      },
      { new: true }
    );
    console.log('Update result:', updatedMemo ? 'Success' : 'Failed');

    if (!updatedMemo) {
      console.log('No documents were modified');
      return res.status(400).json({ success: false, message: 'Failed to update tags' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Tags updated successfully',
      tags: tags
    });

  } catch (error) {
    console.error('Error updating memo tags:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
}
