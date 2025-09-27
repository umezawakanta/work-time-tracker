/**
 * メモのステータス更新API
 * PUT /api/memos/[id]/status
 */

const { mongoose } = require('../../utils/database');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Database connection utility
const ensureDatabaseConnection = async () => {
  const isConnected = mongoose.connection.readyState === 1;
  
  if (isConnected) {
    return;
  }

  console.warn('[memos/status] Database not connected, attempting to connect...');
  
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    if (MONGODB_URI === "memory://") {
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      dbName: 'workTimeTracker',
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[memos/status] Failed to connect to database:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};

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
  console.log('Status API called:', { method: req.method, query: req.query, body: req.body });
  
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // データベース接続を確実にする
    await ensureDatabaseConnection();
    
    const { id } = req.query;
    const { status } = req.body;
    
    console.log('Processing status update:', { id, status });

    // ステータスの検証
    const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be one of: pending, in_progress, resolved, closed' 
      });
    }

    // メモの存在確認と更新
    const existingMemo = await Memo.findById(id);
    console.log('Existing memo found:', existingMemo ? 'Yes' : 'No');
    if (!existingMemo) {
      return res.status(404).json({ success: false, message: 'Memo not found' });
    }

    // ステータス更新
    console.log('Updating memo status...');
    const updatedMemo = await Memo.findByIdAndUpdate(
      id,
      { 
        status: status,
        updatedAt: new Date()
      },
      { new: true }
    );
    console.log('Update result:', updatedMemo ? 'Success' : 'Failed');

    if (!updatedMemo) {
      console.log('No documents were modified');
      return res.status(400).json({ success: false, message: 'Failed to update status' });
    }

    console.log('Status updated successfully');
    res.status(200).json({ 
      success: true, 
      message: 'Status updated successfully',
      status: status
    });

  } catch (error) {
    console.error('Error updating memo status:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
}
