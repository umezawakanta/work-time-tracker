/**
 * テスト用のステータス更新API
 * PUT /api/memos/test-status
 */

const { mongoose } = require('../utils/database');
const dotenv = require('dotenv');

dotenv.config();

export default async function handler(req, res) {
  console.log('Test Status API called:', { method: req.method, body: req.body });
  
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { status } = req.body;
    
    console.log('Processing test status update:', { status });

    // ステータスの検証
    const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be one of: pending, in_progress, resolved, closed' 
      });
    }

    console.log('Test status update successful');
    res.status(200).json({ 
      success: true, 
      message: 'Test status update successful',
      status: status
    });

  } catch (error) {
    console.error('Error in test status update:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
}
