import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/workTimeTracker";

// 🐛 エラーエリミネーター: MongoDB接続の安定化
export const connectDB = async () => {
  try {
    // テスト環境などでMongoDBを無効化する場合
    if (MONGODB_URI === "memory://") {
      console.log("🧪 MongoDB connection skipped (memory mode for testing)");
      return;
    }

    // 接続オプションを追加してタイムアウトと再接続を最適化
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10, // 接続プールサイズ
      serverSelectionTimeoutMS: 15000, // サーバー選択タイムアウト (15秒)
      socketTimeoutMS: 45000, // ソケットタイムアウト
      bufferCommands: false, // コマンドバッファリング無効化
      connectTimeoutMS: 10000, // 接続タイムアウト
      maxIdleTimeMS: 30000, // 最大アイドル時間
    });

    console.log("✅ MongoDB connected successfully");

    // 接続状態の監視
    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    // サーバーレス環境（Vercel）や本番環境ではプロセスを終了せず、呼び出し元に委ねる
    // 呼び出し元（API Routesなど）でフォールバック処理や適切なHTTPレスポンスへ切り替えるため
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      throw error;
    }
    // 開発環境では続行（モック / ローカル機能を使用）
    console.warn("⚠️ Development mode: Continuing without MongoDB");
  }
};
