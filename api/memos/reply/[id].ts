const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Database connection utility
const ensureDatabaseConnection = async () => {
  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    return;
  }
  console.warn('[memos/reply/[id]] Database not connected, attempting to connect...');
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is required but not set.");
    }
    
    if (MONGODB_URI === "memory://") {
      console.log("🧪 MongoDB connection skipped (memory mode for testing)");
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      dbName: 'workTimeTracker',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 30000,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[memos/reply/[id]] Failed to connect to database:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};

// Reply schema (独立したコレクション)
const ReplySchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    memoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Memo', required: true },
    userId: { type: String, required: true }
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Reply = mongoose.models.Reply || mongoose.model("Reply", ReplySchema);

/**
 * Update reply request interface
 * @typedef {Object} UpdateReplyRequest
 * @property {string} content - Reply content
 */

/**
 * Reply response interface
 * @typedef {Object} ReplyResponse
 * @property {boolean} success - Whether the operation was successful
 * @property {string} message - Response message
 * @property {string} [error] - Error message if failed
 */

module.exports = async function handler(req, res) {
  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];

  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  
  const isAllowedOrigin = origin
    && origin !== "null"
    && origin !== null
    && origin !== undefined
    && origin.length > 0
    && (allowedOrigins.includes(origin) || isPreview);

  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'PUT' && req.method !== 'DELETE') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
    return;
  }

  try {
    console.log(`📝 Reply ${req.method} operation started`);
    
    // Ensure database connection is established
    await ensureDatabaseConnection();
    
    const { id: replyId } = req.query;
    
    if (!replyId) {
      return res.status(400).json({
        success: false,
        message: 'Reply ID is required',
      });
    }

    // Get authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required',
      });
    }

    const token = authHeader.substring(7);
    
    // Verify token (simplified - in production, use proper JWT verification)
    // For now, we'll just check if it exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token',
      });
    }

    // Find the reply directly by ID
    console.log('🔍 Searching for reply with ID:', replyId);
    const reply = await Reply.findById(replyId);
    console.log('💬 Found reply:', reply ? 'yes' : 'no');
    
    if (!reply) {
      console.log('❌ No reply found with replyId:', replyId);
      return res.status(404).json({
        success: false,
        message: 'Reply not found',
      });
    }

    if (req.method === 'PUT') {
      // Update reply
      const { content } = req.body;
      
      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Reply content is required',
        });
      }

      // Update the reply content
      reply.content = content.trim();
      await reply.save();

      console.log('✅ Reply updated successfully:', {
        replyId,
        memoId: reply.memoId,
      });

      res.status(200).json({
        success: true,
        message: 'Reply updated successfully',
      });

    } else if (req.method === 'DELETE') {
      // Delete reply
      await Reply.findByIdAndDelete(replyId);

      console.log('✅ Reply deleted successfully:', {
        replyId,
        memoId: reply.memoId,
      });

      res.status(200).json({
        success: true,
        message: 'Reply deleted successfully',
      });
    }

  } catch (error) {
    console.error('❌ Reply operation error:', error);

    res.status(500).json({
      success: false,
      message: 'An error occurred while processing the reply',
      error: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : String(error))
        : 'Internal server error',
    });
  }
};
