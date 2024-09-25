import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { body, validationResult } from "express-validator";
import { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB接続
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/workTimeTracker";

console.log("Attempting to connect to MongoDB with URI:", MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// WorkTimeEntryインターフェース
interface IWorkTimeEntry {
  projectName: string;
  startTime: string;
  endTime: string;
  description?: string;
  duration: number;
  date: string;
  createdAt?: Date;
}

// WorkTimeモデルの定義
const WorkTimeSchema = new mongoose.Schema<IWorkTimeEntry>({
  projectName: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  description: String,
  duration: { type: Number, required: true },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const WorkTime = mongoose.model<IWorkTimeEntry>("WorkTime", WorkTimeSchema);

// 作業時間を記録するAPIエンドポイント
app.post(
  "/api/worktime",
  [
    body("projectName").notEmpty().withMessage("プロジェクト名は必須です"),
    body("startTime")
      .isISO8601()
      .withMessage("開始時間は有効なISO8601形式である必要があります"),
    body("endTime")
      .isISO8601()
      .withMessage("終了時間は有効なISO8601形式である必要があります"),
    body("description").optional().isString(),
    body("duration").isInt().withMessage("期間は整数である必要があります"),
    body("date")
      .isISO8601()
      .withMessage("日付は有効なISO8601形式である必要があります"),
  ],
  async (req: Request, res: Response) => {
    console.log("Received request body:", req.body); // リクエストボディをログに出力

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res
        .status(400)
        .json({ message: "入力データが無効です", errors: errors.array() });
    }

    try {
      const workTimeData: IWorkTimeEntry = {
        projectName: req.body.projectName,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        description: req.body.description,
        duration: req.body.duration,
        date: req.body.date,
      };

      const workTime = new WorkTime(workTimeData);
      await workTime.save();
      console.log("Work time saved successfully:", workTime); // 保存されたデータをログに出力
      res
        .status(201)
        .json({ message: "作業時間が正常に記録されました", workTime });
    } catch (error) {
      console.error("Error saving work time:", error);
      res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  }
);

// 作業時間を取得するAPIエンドポイント
app.get("/api/worktime", async (_, res: Response) => {
  try {
    const workTimes = await WorkTime.find().sort({ createdAt: -1 });
    res.json(workTimes);
  } catch (error) {
    console.error("Error fetching work times:", error);
    res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
