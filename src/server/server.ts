
import * as express from "express";
import { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import http from "http"; // HTTPサーバーを使用
import { connectDB } from "./config/database.js";
import workTimeRoutes from "./routes/workTimeRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import debtRoutes from "./routes/debtRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import userSubscriptionRoutes from "./routes/userSubscriptionRoutes.js";
import withdrawalRoutes from "./routes/withdrawalRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import sleepTrackerRoutes from "./routes/sleepTrackerRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import tweetRoutes from "./routes/tweetRoutes.js";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import surveyRoutes from "./routes/surveyRoutes.js";
import partyRoutes from "./routes/partyRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js"; // 通知ルートをインポート
import { setupWebSocketServer } from "./services/webSocketService.js"; // WebSocketサービスをインポート

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// HTTPサーバーを作成（WebSocketと共用するため）
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("combined"));

// Connect to MongoDB
connectDB();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 静的ファイルの提供
app.use('/uploads', express.static(uploadsDir));

// WebSocketサーバーのセットアップ
const wsService = setupWebSocketServer(server);
// グローバルに利用できるようにする（通知サービスなどから利用可能に）
app.set('wsService', wsService);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/worktime", workTimeRoutes);
app.use("/api/asset", assetRoutes);
app.use("/api/debt", debtRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/userSubscription", userSubscriptionRoutes);
app.use("/api/withdrawal", withdrawalRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/sleep-records", sleepTrackerRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/tweets", tweetRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/parties", partyRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notifications", notificationRoutes); // 通知APIルートを追加

// Not Found middleware
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Resource not found" });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

const PORT = process.env.PORT || 3001;
// app.listen()ではなくserver.listen()を使用
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server is also running on port ${PORT}`);
  console.log(`Uploads directory: ${uploadsDir}`);
});

export default app;