const { mongoose } = require('../utils/database');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { ensureDatabaseConnection, verifyJWT, handleError } = require('../utils/database');
const { BookSchema } = require('../utils/schemas');
// Type definitions are now in comments for reference

dotenv.config();

const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);

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
    
    // Ensure database connection
    await ensureDatabaseConnection();

    // Verify JWT token
    const userInfo = await verifyJWT(req);
    if (!userInfo) {
      return handleError(res, { statusCode: 401, message: '認証が必要です' });
    }

    if (req.method === 'GET') {
      // 本の一覧を取得
      const books = await Book.find({}).sort({ createdAt: -1 });


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
        return handleError(res, { statusCode: 400, message: '必須フィールドが不足しています' });
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
      return handleError(res, { statusCode: 405, message: 'メソッドが許可されていません' });
    }
  } catch (error) {
    console.error('❌ Books API error:', error);
    return handleError(res, error, 'サーバーエラーが発生しました');
  }
};
