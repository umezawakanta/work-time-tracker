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

  console.warn('[books] Database not connected, attempting to connect...');
  
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
    console.error('[books] Failed to connect to database:', message);
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

const Book = mongoose.model('Book', BookSchema);

// JWT verification utility
const verifyJWT = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[books] JWT_SECRET not configured');
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch (error) {
    console.error('[books] JWT verification failed:', error);
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
    console.log('📚 Books API request started');
    
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

    if (req.method === 'GET') {
      // 本の一覧を取得
      const books = await Book.find({}).sort({ createdAt: -1 });

      console.log('✅ Books list retrieved:', {
        count: books.length,
        userId: userInfo.userId,
      });

      res.status(200).json({
        success: true,
        message: '本の一覧を取得しました',
        books: books.map(book => ({
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
        })),
      });
    } else if (req.method === 'POST') {
      // 新しい本を追加
      const { title, author, isbn, publishedYear, totalPages, category, notes } = req.body;

      // 必須フィールドの検証
      if (!title || !author || !isbn || !publishedYear || !totalPages || !category) {
        return res.status(400).json({
          success: false,
          message: '必須フィールドが不足しています',
          error: 'Missing required fields',
        });
      }

      const newBook = new Book({
        title,
        author,
        isbn,
        publishedYear,
        totalPages,
        readPages: 0,
        category,
        rating: 0,
        notes: notes || '',
        lentTo: '',
      });

      const savedBook = await newBook.save();

      console.log('✅ Book created successfully:', {
        bookId: savedBook._id.toString(),
        title: savedBook.title,
        userId: userInfo.userId,
      });

      res.status(201).json({
        success: true,
        message: '本を追加しました',
        book: {
          id: savedBook._id.toString(),
          title: savedBook.title,
          author: savedBook.author,
          isbn: savedBook.isbn,
          publishedYear: savedBook.publishedYear,
          totalPages: savedBook.totalPages,
          readPages: savedBook.readPages,
          category: savedBook.category,
          rating: savedBook.rating,
          notes: savedBook.notes || '',
          lentTo: savedBook.lentTo || '',
          createdAt: savedBook.createdAt ? savedBook.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: savedBook.updatedAt ? savedBook.updatedAt.toISOString() : new Date().toISOString(),
        },
      });
    } else {
      res.status(405).json({
        success: false,
        message: 'メソッドが許可されていません',
        error: 'Method not allowed',
      });
    }
  } catch (error) {
    console.error('❌ Books API error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: 'Internal server error',
    });
  }
};
