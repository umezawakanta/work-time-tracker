import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/workTimeTracker';

// 🐛 エラーエリミネーター: MongoDB接続の安定化
export const connectDB = async () => {
  try {
    // 接続オプションを追加してタイムアウトと再接続を最適化
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10, // 接続プールサイズ
      serverSelectionTimeoutMS: 5000, // サーバー選択タイムアウト
      socketTimeoutMS: 45000, // ソケットタイムアウト
      bufferCommands: false, // コマンドバッファリング無効化
    });

    console.log('✅ MongoDB connected successfully');

    // 接続状態の監視
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    // 開発環境では終了せず、エラーログのみ出力
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️ Development mode: Continuing without MongoDB');
    }
  }
};
