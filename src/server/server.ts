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
  windowMs: 15 * 60 * 1000,
  max: 100,
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
  startTime: Date;
  endTime: Date;
  description?: string;
  duration: number;
  date: Date;
  createdAt: Date;
}

// WorkTimeモデルの定義
const WorkTimeSchema = new mongoose.Schema<IWorkTimeEntry>({
  projectName: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  description: String,
  duration: { type: Number, required: true },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const WorkTime = mongoose.model<IWorkTimeEntry>("WorkTime", WorkTimeSchema);

// AssetEntryインターフェース
interface IAssetEntry extends mongoose.Document {
  date: Date;
  value: number;
  account: string;
  createdAt: Date;
}

// AssetEntryモデルの定義
const AssetEntrySchema = new mongoose.Schema<IAssetEntry>({
  date: { type: Date, required: true },
  value: { type: Number, required: true },
  account: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const AssetEntry = mongoose.model<IAssetEntry>("AssetEntry", AssetEntrySchema);

// DebtEntryインターフェース
interface IDebtEntry extends mongoose.Document {
  date: Date;
  value: number;
  description: string;
  account: string;
  createdAt: Date;
}

// DebtEntryモデルの定義
const DebtEntrySchema = new mongoose.Schema<IDebtEntry>({
  date: { type: Date, required: true },
  value: { type: Number, required: true },
  description: { type: String, required: true },
  account: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const DebtEntry = mongoose.model<IDebtEntry>("DebtEntry", DebtEntrySchema);

// TodoItemインターフェース
interface ITodoItem extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  task: string;
  completed: boolean;
  createdAt: Date;
}

// TodoItemモデルの定義
const TodoItemSchema = new mongoose.Schema<ITodoItem>({
  task: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const TodoItem = mongoose.model<ITodoItem>("TodoItem", TodoItemSchema);

// エラーハンドリングミドルウェアの修正
const errorHandler = (err: Error, _req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({
    message: "サーバーエラーが発生しました",
    error: process.env.NODE_ENV === "production" ? {} : err.message,
  });
};

// バリデーションミドルウェア
const validateWorkTimeEntry = [
  body("projectName").notEmpty().withMessage("プロジェクト名は必須です"),
  body("startTime")
    .isISO8601()
    .toDate()
    .withMessage("開始時間は有効なISO8601形式である必要があります"),
  body("endTime")
    .isISO8601()
    .toDate()
    .withMessage("終了時間は有効なISO8601形式である必要があります"),
  body("description").optional().isString(),
  body("duration").isInt().withMessage("期間は整数である必要があります"),
  body("date")
    .isISO8601()
    .toDate()
    .withMessage("日付は有効なISO8601形式である必要があります"),
];

const validateAssetEntry = [
  body("date")
    .isISO8601()
    .toDate()
    .withMessage("日付は有効なISO8601形式である必要があります"),
  body("value").isNumeric().withMessage("資産価値は数値である必要があります"),
  body("account").notEmpty().withMessage("口座は必須です"),
];

const validateDebtEntry = [
  body("date")
    .isISO8601()
    .toDate()
    .withMessage("日付は有効なISO8601形式である必要があります"),
  body("value").isNumeric().withMessage("負債額は数値である必要があります"),
  body("description").notEmpty().withMessage("説明は必須です"),
  body("account").notEmpty().withMessage("口座は必須です"),
];

// バリデーションミドルウェアの修正
const validateTodoItem = [
  body("task").optional().notEmpty().withMessage("タスクは空にできません"),
  body("completed")
    .optional()
    .isBoolean()
    .withMessage("completedはブール値である必要があります"),
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
        account: req.body.account,
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

// 資産情報を更新するAPIエンドポイント
app.put(
  "/api/asset/:id",
  validateAssetEntry,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "入力データが無効です", errors: errors.array() });
    }

    try {
      const updatedAsset = await AssetEntry.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedAsset) {
        return res
          .status(404)
          .json({ message: "指定された資産情報が見つかりません" });
      }
      res.json({
        message: "資産情報が正常に更新されました",
        asset: updatedAsset,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 資産情報を削除するAPIエンドポイント
app.delete(
  "/api/asset/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      console.log(`Attempting to delete asset with id: ${id}`);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }

      const deletedAsset = await AssetEntry.findByIdAndDelete(id);
      if (!deletedAsset) {
        return res.status(404).json({ message: "資産が見つかりません" });
      }
      console.log(`Successfully deleted asset with id: ${id}`);
      res.json({ message: "資産が正常に削除されました", deletedAsset });
    } catch (error) {
      console.error("Error deleting asset:", error);
      next(error);
    }
  }
);

// 負債情報を記録するAPIエンドポイント
app.post(
  "/api/debt",
  validateDebtEntry,
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("Received debt request body:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res
        .status(400)
        .json({ message: "入力データが無効です", errors: errors.array() });
    }

    try {
      const debtData: IDebtEntry = new DebtEntry({
        date: req.body.date,
        value: req.body.value,
        description: req.body.description,
        account: req.body.account,
      });

      const savedDebt = await debtData.save();
      console.log("Debt entry saved successfully:", savedDebt);
      res.status(201).json({
        message: "負債情報が正常に記録されました",
        debt: savedDebt,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 負債情報を取得するAPIエンドポイント
app.get(
  "/api/debt",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const debts = await DebtEntry.aggregate([
        {
          $sort: { date: -1, createdAt: -1 },
        },
        {
          $group: {
            _id: { date: "$date", account: "$account" },
            latestEntry: { $first: "$$ROOT" },
          },
        },
        {
          $replaceRoot: { newRoot: "$latestEntry" },
        },
        {
          $sort: { date: -1, account: 1 },
        },
      ]);
      res.json(debts);
    } catch (error) {
      next(error);
    }
  }
);

// 負債情報を削除するAPIエンドポイント
app.delete(
  "/api/debt/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      console.log(`Attempting to delete debt with id: ${id}`);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "無効なIDです" });
      }

      const deletedDebt = await DebtEntry.findByIdAndDelete(id);
      if (!deletedDebt) {
        return res.status(404).json({ message: "負債が見つかりません" });
      }
      console.log(`Successfully deleted debt with id: ${id}`);
      res.json({
        message: "負債が正常に削除されました",
        deletedDebt,
      });
    } catch (error) {
      console.error("Error deleting debt:", error);
      next(error);
    }
  }
);

// ToDoアイテムを取得するAPIエンドポイント
app.get(
  "/api/todos",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const todos = await TodoItem.find().sort({ createdAt: -1 });
      res.json(todos);
    } catch (error) {
      console.error("Error fetching todos:", error);
      next(error);
    }
  }
);

// ToDoアイテムを作成するAPIエンドポイント
app.post(
  "/api/todos",
  validateTodoItem,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "入力データが無効です", errors: errors.array() });
    }

    try {
      const todoData: ITodoItem = new TodoItem({
        task: req.body.task,
      });

      const savedTodo = await todoData.save();
      console.log("Todo item created:", savedTodo);
      res.status(201).json({
        message: "ToDoアイテムが正常に作成されました",
        todo: savedTodo,
      });
    } catch (error) {
      console.error("Error creating todo item:", error);
      next(error);
    }
  }
);

// ToDoアイテムを更新するAPIエンドポイント
app.put(
  "/api/todos/:id",
  validateTodoItem,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "入力データが無効です", errors: errors.array() });
    }

    try {
      console.log("Updating todo item with id:", req.params.id);
      console.log("Update data:", req.body);

      const updatedTodo = await TodoItem.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!updatedTodo) {
        console.log("Todo item not found for id:", req.params.id);
        return res
          .status(404)
          .json({ message: "指定されたToDoアイテムが見つかりません" });
      }

      console.log("Todo item updated successfully:", updatedTodo);
      res.json({
        message: "ToDoアイテムが正常に更新されました",
        todo: updatedTodo,
      });
    } catch (error) {
      console.error("Error updating todo item:", error);
      next(error);
    }
  }
);

// ToDoアイテムを削除するAPIエンドポイント
app.delete(
  "/api/todos/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Deleting todo item with id:", req.params.id);

      const deletedTodo = await TodoItem.findByIdAndDelete(req.params.id);
      if (!deletedTodo) {
        console.log("Todo item not found for id:", req.params.id);
        return res
          .status(404)
          .json({ message: "指定されたToDoアイテムが見つかりません" });
      }

      console.log("Todo item deleted successfully:", deletedTodo);
      res.json({
        message: "ToDoアイテムが正常に削除されました",
        todo: deletedTodo,
      });
    } catch (error) {
      console.error("Error deleting todo item:", error);
      next(error);
    }
  }
);

// ToDoリストをリセットするAPIエンドポイント
app.post(
  "/api/todos/reset",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      await TodoItem.deleteMany({});
      const defaultTodos = [
        { task: "洗い物", completed: false },
        { task: "掃除", completed: false },
        { task: "ゴミ捨て", completed: false },
        { task: "片づけ", completed: false },
      ];
      await TodoItem.insertMany(defaultTodos);
      console.log("Todo list reset successfully");
      res.json({ message: "ToDoリストが正常にリセットされました" });
    } catch (error) {
      console.error("Error resetting todo list:", error);
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
