const { mongoose: mongooseDB, ensureDatabaseConnection: ensureDBConn, verifyJWT: verifyAuth, handleAPIError: handleAPIError } = require('../utils/database');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Book Schema を直接定義
const BookSchema = new mongooseDB.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: false },
  publishedYear: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  readPages: { type: Number, default: 0 },
  category: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  notes: { type: String, default: '' },
  lentTo: { type: String, default: '' },
  isPublic: { type: Boolean, default: false },
  isFamilyOnly: { type: Boolean, default: false },
  isAdminOnly: { type: Boolean, default: false },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 更新時にupdatedAtを自動更新
BookSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Book = mongooseDB.models.Book || mongooseDB.model('Book', BookSchema);

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
  const { origin } = req.headers;
  setCorsHeaders(res, origin);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    
    // Ensure database connection
    await ensureDBConn();

    // Verify JWT token
    const userInfo = await verifyAuth(req);
    if (!userInfo) {
      return handleAPIError(res, { statusCode: 401, message: '認証が必要です' });
    }

    const { id } = req.query;
    if (!id) {
      return handleAPIError(res, { statusCode: 400, message: '本のIDが必要です' });
    }

    if (req.method === 'GET') {
      // 特定の本を取得
      const book = await Book.findById(id);
      if (!book) {
        return handleAPIError(res, { statusCode: 404, message: '本が見つかりません' });
      }


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
          isPublic: book.isPublic || false,
          isFamilyOnly: book.isFamilyOnly || false,
          isAdminOnly: book.isAdminOnly || false,
          userId: book.userId || '',
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
        return handleAPIError(res, { statusCode: 404, message: '本が見つかりません' });
      }


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
          isPublic: book.isPublic || false,
          isFamilyOnly: book.isFamilyOnly || false,
          isAdminOnly: book.isAdminOnly || false,
          userId: book.userId || '',
          createdAt: book.createdAt ? book.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: book.updatedAt ? book.updatedAt.toISOString() : new Date().toISOString(),
        },
      });
    } else if (req.method === 'DELETE') {
      // 本を削除
      const book = await Book.findByIdAndDelete(id);
      if (!book) {
        return handleAPIError(res, { statusCode: 404, message: '本が見つかりません' });
      }


      res.status(200).json({
        success: true,
        message: '本を削除しました',
      });
    } else {
      return handleAPIError(res, { statusCode: 405, message: 'メソッドが許可されていません' });
    }
  } catch (error) {
    console.error('❌ Book detail API error:', error);
    return handleAPIError(res, error, 'サーバーエラーが発生しました');
  }
};
