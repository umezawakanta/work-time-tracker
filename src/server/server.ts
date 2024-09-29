import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("combined"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB接続
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/workTimeTracker";

console.log("Attempting to connect to MongoDB with URI:", MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// WorkTimeEntryインターフェース
interface IWorkTimeEntry extends mongoose.Document {
  projectName: string;
  startTime: string;
  endTime: string;
  description?: string;
  duration: number;
  date: string;
  createdAt: Date;
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

// AssetEntryインターフェース
interface IAssetEntry extends mongoose.Document {
  date: string;
  value: number;
  createdAt: Date;
}

// AssetEntryモデルの定義
const AssetEntrySchema = new mongoose.Schema<IAssetEntry>({
  date: { type: String, required: true },
  value: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const AssetEntry = mongoose.model<IAssetEntry>("AssetEntry", AssetEntrySchema);

// エラーハンドリングミドルウェア
const errorHandler = (err: Error, _req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ message: "サーバーエラーが発生しました" });
};

// バリデーションミドルウェア
const validateWorkTimeEntry = [
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
];

const validateAssetEntry = [
  body("date")
    .isISO8601()
    .withMessage("日付は有効なISO8601形式である必要があります"),
  body("value").isNumeric().withMessage("資産価値は数値である必要があります"),
];

// 作業時間を記録するAPIエンドポイント
app.post(
  "/api/worktime",
  validateWorkTimeEntry,
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("Received request body:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res
        .status(400)
        .json({ message: "入力データが無効です", errors: errors.array() });
    }

    try {
      const workTimeData: IWorkTimeEntry = new WorkTime({
        projectName: req.body.projectName,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        description: req.body.description,
        duration: req.body.duration,
        date: req.body.date,
      });

      const savedWorkTime = await workTimeData.save();
      console.log("Work time saved successfully:", savedWorkTime);
      res.status(201).json({
        message: "作業時間が正常に記録されました",
        workTime: savedWorkTime,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 作業時間を取得するAPIエンドポイント
app.get(
  "/api/worktime",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const workTimes = await WorkTime.find().sort({ createdAt: -1 });
      res.json(workTimes);
    } catch (error) {
      next(error);
    }
  }
);

// 特定の作業時間を取得するAPIエンドポイント
app.get(
  "/api/worktime/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workTime = await WorkTime.findById(req.params.id);
      if (!workTime) {
        return res
          .status(404)
          .json({ message: "指定された作業時間が見つかりません" });
      }
      res.json(workTime);
    } catch (error) {
      next(error);
    }
  }
);

// 作業時間を更新するAPIエンドポイント
app.put(
  "/api/worktime/:id",
  validateWorkTimeEntry,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "入力データが無効です", errors: errors.array() });
    }

    try {
      const updatedWorkTime = await WorkTime.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedWorkTime) {
        return res
          .status(404)
          .json({ message: "指定された作業時間が見つかりません" });
      }
      res.json({
        message: "作業時間が正常に更新されました",
        workTime: updatedWorkTime,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 作業時間を削除するAPIエンドポイント
app.delete(
  "/api/worktime/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedWorkTime = await WorkTime.findByIdAndDelete(req.params.id);
      if (!deletedWorkTime) {
        return res
          .status(404)
          .json({ message: "指定された作業時間が見つかりません" });
      }
      res.json({
        message: "作業時間が正常に削除されました",
        workTime: deletedWorkTime,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 資産情報を記録するAPIエンドポイント
app.post(
  "/api/asset",
  validateAssetEntry,
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("Received asset request body:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res
        .status(400)
        .json({ message: "入力データが無効です", errors: errors.array() });
    }

    try {
      const assetData: IAssetEntry = new AssetEntry({
        date: req.body.date,
        value: req.body.value,
      });

      const savedAsset = await assetData.save();
      console.log("Asset entry saved successfully:", savedAsset);
      res.status(201).json({
        message: "資産情報が正常に記録されました",
        asset: savedAsset,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 資産情報を取得するAPIエンドポイント
app.get(
  "/api/asset",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const assets = await AssetEntry.find().sort({ date: -1 });
      res.json(assets);
    } catch (error) {
      next(error);
    }
  }
);

// エラーハンドリングミドルウェアを使用
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
