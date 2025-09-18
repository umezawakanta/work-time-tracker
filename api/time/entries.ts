import { NextApiRequest, NextApiResponse } from 'next';
import { ensureDatabaseConnection, mongoose } from '../utils/database';

// TimeEntry スキーマを定義
const TimeEntrySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  projectId: {
    type: String,
    required: false
  },
  projectName: {
    type: String,
    required: false
  },
  category: {
    type: String,
    required: true,
    default: 'work'
  },
  description: {
    type: String,
    required: false
  },
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    required: false
  },
  duration: {
    type: Number,
    required: false
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

const TimeEntry = mongoose.models.TimeEntry || mongoose.model('TimeEntry', TimeEntrySchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await ensureDatabaseConnection();
    
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // ユーザーの時間記録を取得
    const timeEntries = await TimeEntry.find({ userId })
      .sort({ startTime: -1 })
      .limit(100); // 最新100件に制限

    res.status(200).json({
      success: true,
      data: timeEntries,
      count: timeEntries.length
    });

  } catch (error) {
    console.error('Error fetching time entries:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}
