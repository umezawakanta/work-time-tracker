import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { Project, IProject } from "../models/Project.js";

const router = express.Router();

// バリデーションルール
const validateProject = [
  body("name")
    .notEmpty()
    .withMessage("プロジェクト名は必須です")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("プロジェクト名は1〜50文字以内で入力してください"),
  body("color")
    .notEmpty()
    .withMessage("カラーは必須です")
    .isString()
    .withMessage("カラーは文字列で指定してください"),
  body("userId")
    .notEmpty()
    .withMessage("ユーザーIDは必須です")
    .isString()
    .withMessage("ユーザーIDは文字列で指定してください"),
];

// ユーザーIDのバリデーション
const validateUserId = [
  param("userId")
    .notEmpty()
    .withMessage("ユーザーIDは必須です")
    .isString()
    .withMessage("ユーザーIDは文字列で指定してください"),
];

// 特定ユーザーのプロジェクト一覧を取得
router.get(
    "/user/:userId",
    validateUserId,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const userId = req.params.userId;
        const projects = await Project.find({ userId }).sort({ lastUsed: -1, name: 1 });
        
        // データが存在しなくても404ではなく空の配列を返す
        res.json(projects); // 空配列になる可能性あり
      } catch (error) {
        next(error);
      }
    }
  );

// 新規プロジェクト作成
router.post(
  "/",
  validateProject,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      // 同じユーザーの同じ名前のプロジェクトが存在するか確認
      const existingProject = await Project.findOne({
        userId: req.body.userId,
        name: req.body.name,
      });

      if (existingProject) {
        res.status(400).json({
          message: "同じ名前のプロジェクトが既に存在します",
        });
        return;
      }

      const projectData: IProject = new Project({
        name: req.body.name,
        color: req.body.color,
        userId: req.body.userId,
        lastUsed: req.body.lastUsed || new Date(),
      });

      const savedProject = await projectData.save();
      res.status(201).json({
        message: "プロジェクトが正常に作成されました",
        project: savedProject,
      });
    } catch (error) {
      next(error);
    }
  }
);

// プロジェクト更新
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("有効なプロジェクトIDが必要です"),
    body("name").optional().trim().isLength({ min: 1, max: 50 }),
    body("color").optional().isString(),
    body("lastUsed").optional().isISO8601().toDate(),
  ],
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const projectId = req.params.id;
      const updateData = req.body;

      // プロジェクト名が変更される場合、同じユーザーの同じ名前のプロジェクトが存在するか確認
      if (updateData.name) {
        const project = await Project.findById(projectId);
        if (!project) {
          res.status(404).json({ message: "プロジェクトが見つかりません" });
          return;
        }

        if (updateData.name !== project.name) {
          const existingProject = await Project.findOne({
            userId: project.userId,
            name: updateData.name,
            _id: { $ne: projectId }, // 自分自身を除外
          });

          if (existingProject) {
            res.status(400).json({
              message: "同じ名前のプロジェクトが既に存在します",
            });
            return;
          }
        }
      }

      const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        updateData,
        { new: true }
      );

      if (!updatedProject) {
        res.status(404).json({ message: "プロジェクトが見つかりません" });
        return;
      }

      res.json({
        message: "プロジェクトが正常に更新されました",
        project: updatedProject,
      });
    } catch (error) {
      next(error);
    }
  }
);

// プロジェクト削除
router.delete(
  "/:id",
  param("id").isMongoId().withMessage("有効なプロジェクトIDが必要です"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const projectId = req.params.id;
      const deletedProject = await Project.findByIdAndDelete(projectId);

      if (!deletedProject) {
        res.status(404).json({ message: "プロジェクトが見つかりません" });
        return;
      }

      res.json({
        message: "プロジェクトが正常に削除されました",
        project: deletedProject,
      });
    } catch (error) {
      next(error);
    }
  }
);

// プロジェクト詳細取得
router.get(
  "/:id",
  param("id").isMongoId().withMessage("有効なプロジェクトIDが必要です"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const projectId = req.params.id;
      const project = await Project.findById(projectId);

      if (!project) {
        res.status(404).json({ message: "プロジェクトが見つかりません" });
        return;
      }

      res.json(project);
    } catch (error) {
      next(error);
    }
  }
);

// 最終使用日の更新（使用頻度を記録するため）
router.patch(
  "/:id/update-last-used",
  param("id").isMongoId().withMessage("有効なプロジェクトIDが必要です"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const projectId = req.params.id;
      const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        { lastUsed: new Date() },
        { new: true }
      );

      if (!updatedProject) {
        res.status(404).json({ message: "プロジェクトが見つかりません" });
        return;
      }

      res.json({
        message: "プロジェクトの最終使用日が更新されました",
        project: updatedProject,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;