import mongoose from 'mongoose';
import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// データベース接続
const ensureDatabaseConnection = async () => {
  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    return;
  }
  try {
    const MONGODB_URI = process.env['MONGODB_URI'];
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is required but not set.");
    }
    
    if (MONGODB_URI === "memory://") {
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
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[receipts] Failed to connect to database:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
};

// JWT認証
const verifyJWT = async (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const jwtSecret = process.env['JWT_SECRET'] || 'fallback-secret-for-development';
    return jwt.verify(token, jwtSecret) as any;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

// エラーハンドリング
const handleError = (res: VercelResponse, error: any, message: string = 'エラーが発生しました') => {
  console.error('Receipt API error:', error);
  res.status(500).json({
    success: false,
    message,
    error: process.env['NODE_ENV'] === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
  });
};

// レシートスキーマ
const ReceiptSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  storeName: { type: String, required: true },
  purchaseDate: { type: Date, required: true },
  totalAmount: { type: Number, required: true },
  items: [{ type: String }],
  paymentMethod: { type: String, enum: ['cash', 'card', 'mobile', 'other'], required: true },
  notes: { type: String, default: '' },
  isWasteful: { type: Boolean, default: false },
  categoryId: { type: String, default: 'convenience' },
  description: { type: String, required: true },
  type: { type: String, enum: ['money', 'time', 'effort'], default: 'money' },
  amount: { type: Number, required: true },
  date: { type: Date, required: true }
}, { timestamps: true });

const Receipt = (mongoose.models['Receipt'] as any) || mongoose.model('Receipt', ReceiptSchema);

// レスポンス型定義
interface ReceiptResponse {
  success: boolean;
  message: string;
  receipts?: Array<{
    id: string;
    storeName: string;
    purchaseDate: string;
    totalAmount: number;
    items: string[];
    paymentMethod: string;
    notes: string;
    isWasteful: boolean;
    categoryId: string;
    description: string;
    type: string;
    amount: number;
    date: string;
    createdAt: string;
    updatedAt: string;
  }>;
  error?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  const { origin } = req.headers;
  const allowedOrigins = ['http://localhost:9000', 'https://work-time-tracker-five.vercel.app'];

  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await ensureDatabaseConnection();
    
    const userInfo = await verifyJWT(req);
    if (!userInfo) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です',
        error: 'Authentication required'
      });
    }

    const userId = userInfo.userId || userInfo.id;

    if (req.method === 'GET') {
      // レシート一覧を取得
      const receipts = await Receipt.find({ userId }).sort({ purchaseDate: -1 });

      const response: ReceiptResponse = {
        success: true,
        message: 'レシート一覧を取得しました',
        receipts: receipts.map((receipt: any) => ({
          id: receipt._id.toString(),
          storeName: receipt.storeName,
          purchaseDate: receipt.purchaseDate.toISOString(),
          totalAmount: receipt.totalAmount,
          items: receipt.items,
          paymentMethod: receipt.paymentMethod,
          notes: receipt.notes,
          isWasteful: receipt.isWasteful,
          categoryId: receipt.categoryId,
          description: receipt.description,
          type: receipt.type,
          amount: receipt.amount,
          date: receipt.date.toISOString(),
          createdAt: receipt.createdAt.toISOString(),
          updatedAt: receipt.updatedAt.toISOString()
        }))
      };

      res.status(200).json(response);

    } else if (req.method === 'POST') {
      // レシートを作成
      const {
        storeName,
        purchaseDate,
        totalAmount,
        items,
        paymentMethod,
        notes
      } = req.body;

      // バリデーション
      if (!storeName || !purchaseDate || !totalAmount || !items || !paymentMethod) {
        return res.status(400).json({
          success: false,
          message: '必須フィールドが不足しています'
        });
      }

      const receipt = new Receipt({
        userId,
        storeName,
        purchaseDate: new Date(purchaseDate),
        totalAmount: Number(totalAmount),
        items: Array.isArray(items) ? items : items.split('\n').filter((item: string) => item.trim()),
        paymentMethod,
        notes: notes || '',
        isWasteful: Number(totalAmount) > 1000,
        categoryId: 'convenience',
        description: `ファミリーマート ${storeName}`,
        type: 'money',
        amount: Number(totalAmount),
        date: new Date(purchaseDate)
      });

      await receipt.save();

      const response: ReceiptResponse = {
        success: true,
        message: 'レシートを作成しました',
        receipts: [{
          id: receipt._id.toString(),
          storeName: receipt.storeName,
          purchaseDate: receipt.purchaseDate.toISOString(),
          totalAmount: receipt.totalAmount,
          items: receipt.items,
          paymentMethod: receipt.paymentMethod,
          notes: receipt.notes,
          isWasteful: receipt.isWasteful,
          categoryId: receipt.categoryId,
          description: receipt.description,
          type: receipt.type,
          amount: receipt.amount,
          date: receipt.date.toISOString(),
          createdAt: receipt.createdAt.toISOString(),
          updatedAt: receipt.updatedAt.toISOString()
        }]
      };

      res.status(201).json(response);

    } else if (req.method === 'PUT') {
      // レシートを更新
      const { id, ...updateData } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'レシートIDが必要です'
        });
      }

      const receipt = await Receipt.findOneAndUpdate(
        { _id: id, userId },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );

      if (!receipt) {
        return res.status(404).json({
          success: false,
          message: 'レシートが見つかりません'
        });
      }

      const response: ReceiptResponse = {
        success: true,
        message: 'レシートを更新しました',
        receipts: [{
          id: receipt._id.toString(),
          storeName: receipt.storeName,
          purchaseDate: receipt.purchaseDate.toISOString(),
          totalAmount: receipt.totalAmount,
          items: receipt.items,
          paymentMethod: receipt.paymentMethod,
          notes: receipt.notes,
          isWasteful: receipt.isWasteful,
          categoryId: receipt.categoryId,
          description: receipt.description,
          type: receipt.type,
          amount: receipt.amount,
          date: receipt.date.toISOString(),
          createdAt: receipt.createdAt.toISOString(),
          updatedAt: receipt.updatedAt.toISOString()
        }]
      };

      res.status(200).json(response);

    } else if (req.method === 'DELETE') {
      // レシートを削除
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'レシートIDが必要です'
        });
      }

      const receipt = await Receipt.findOneAndDelete({ _id: id, userId });

      if (!receipt) {
        return res.status(404).json({
          success: false,
          message: 'レシートが見つかりません'
        });
      }

      res.status(200).json({
        success: true,
        message: 'レシートを削除しました'
      });

    } else {
      return res.status(405).json({
        success: false,
        message: 'メソッドが許可されていません'
      });
    }

  } catch (error) {
    return handleError(res, error, 'レシート処理中にエラーが発生しました');
  }
}
