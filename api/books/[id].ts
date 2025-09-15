const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Database connection utility
const ensureDatabaseConnection = async () => {
  const isConnected = mongoose.connection.readyState === 1;
  
  if (isConnected) {
    return;
  }

  console.warn('[books/id] Database not connected, attempting to connect...');
  
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    if (MONGODB_URI === "memory://") {
      console.log("🧪 MongoDB connection skipped (memory mode for testing)");
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      dbName: 'workTimeTracker',
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[books/id] Failed to connect to database:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};

// Book Schema
const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true },
  publishedYear: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  readPages: { type: Number, default: 0 },
  category: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  notes: { type: String, default: '' },
  lentTo: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 更新時にupdatedAtを自動更新
BookSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);

// JWT verification utility
const verifyJWT = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[books/id] JWT_SECRET not configured');
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch (error) {
    console.error('[books/id] JWT verification failed:', error);
    return null;
  }
};

// CORS設定
const setCorsHeaders = (res, origin) => {
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-[a-z0-9-]+\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');
};

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  setCorsHeaders(res, origin);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('📚 Book detail API request started');
    
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
        message: '本のIDが必要です',
        error: 'Book ID is required',
      });
    }

    if (req.method === 'GET') {
      // 特定の本を取得
      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: '本が見つかりません',
          error: 'Book not found',
        });
      }

      console.log('✅ Book retrieved:', {
        bookId: book._id.toString(),
        title: book.title,
        userId: userInfo.userId,
      });

      res.status(200).json({
        success: true,
        message: '本の詳細を取得しました',
        book: {
          id: book._id.toString(),
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          publishedYear: book.publishedYear,
          totalPages: book.totalPages,
          readPages: book.readPages,
          category: book.category,
          rating: book.rating,
          notes: book.notes || '',
          lentTo: book.lentTo || '',
          createdAt: book.createdAt ? book.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: book.updatedAt ? book.updatedAt.toISOString() : new Date().toISOString(),
        },
      });
    } else if (req.method === 'PUT') {
      // 本を更新
      const updateData = req.body || {};
      
      const book = await Book.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!book) {
        return res.status(404).json({
          success: false,
          message: '本が見つかりません',
          error: 'Book not found',
        });
      }

      console.log('✅ Book updated successfully:', {
        bookId: book._id.toString(),
        title: book.title,
        userId: userInfo.userId,
      });

      res.status(200).json({
        success: true,
        message: '本を更新しました',
        book: {
          id: book._id.toString(),
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          publishedYear: book.publishedYear,
          totalPages: book.totalPages,
          readPages: book.readPages,
          category: book.category,
          rating: book.rating,
          notes: book.notes || '',
          lentTo: book.lentTo || '',
          createdAt: book.createdAt ? book.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: book.updatedAt ? book.updatedAt.toISOString() : new Date().toISOString(),
        },
      });
    } else if (req.method === 'DELETE') {
      // 本を削除
      const book = await Book.findByIdAndDelete(id);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: '本が見つかりません',
          error: 'Book not found',
        });
      }

      console.log('✅ Book deleted successfully:', {
        bookId: book._id.toString(),
        title: book.title,
        userId: userInfo.userId,
      });

      res.status(200).json({
        success: true,
        message: '本を削除しました',
      });
    } else {
      res.status(405).json({
        success: false,
        message: 'メソッドが許可されていません',
        error: 'Method not allowed',
      });
    }
  } catch (error) {
    console.error('❌ Book detail API error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: 'Internal server error',
    });
  }
};
