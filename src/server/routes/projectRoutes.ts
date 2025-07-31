import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { Project, IProject } from '../models/Project.js';

const router = express.Router();

// 全プロジェクト一覧を取得（IntegratedDashboard用）
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // デモプロジェクトデータを返す（実際のDB統合時は実データに変更）
    const demoProjects = [
      {
        id: 'proj-mvp',
        name: 'MVP機能完成',
        description: '勤怠管理アプリとして必要最低限の機能を実装',
        type: 'improvement',
        status: 'active',
        priority: 'high',
        phase: 'phase0',
        startDate: '2024-02-01',
        endDate: '2024-02-21',
        estimatedDays: 20,
        actualDays: 5,
        progress: 85,
        milestones: [
          {
            id: 'ms-1',
            title: 'リアルタイム打刻機能完成',
            description: 'ワンクリック出勤・退勤機能の実装',
            dueDate: '2024-02-07',
            completed: true,
            dependencies: [],
            deliverables: ['打刻コンポーネント', 'API実装', 'テスト'],
          },
          {
            id: 'ms-2',
            title: '認証システム実装完成',
            description: 'JWT認証、ユーザー登録、データベース統合',
            dueDate: '2024-02-14',
            completed: true,
            dependencies: ['ms-1'],
            deliverables: ['認証API', 'データベース設計', 'セキュリティ実装'],
          },
          {
            id: 'ms-3',
            title: '課金システム統合完成',
            description: 'Stripe課金システムとサブスクリプション管理',
            dueDate: '2024-02-21',
            completed: true,
            dependencies: ['ms-2'],
            deliverables: ['Stripe統合', 'プラン管理', '決済処理'],
          },
        ],
        improvementItemId: 'production-system',
        wbsProjectId: 'wbs-proj-1',
        wbsNodes: ['wbs-node-1', 'wbs-node-2'],
        todoIds: ['todo-1', 'todo-2', 'todo-3'],
        category: 'feature',
        tags: ['production', 'authentication', 'payment'],
        assignees: ['system', 'ai-assistant'],
        dependencies: [],
        createdAt: '2024-02-01T09:00:00Z',
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
      },
    ];

    res.status(200).json({
      success: true,
      data: demoProjects,
      message: 'Projects loaded successfully',
    });
  } catch (error) {
    console.error('Error loading projects:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to load projects',
    });
  }
});

// バリデーションルール
const validateProject = [
  body('name')
    .notEmpty()
    .withMessage('プロジェクト名は必須です')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('プロジェクト名は1〜50文字以内で入力してください'),
  body('color')
    .notEmpty()
    .withMessage('カラーは必須です')
    .isString()
    .withMessage('カラーは文字列で指定してください'),
  body('userId')
    .notEmpty()
    .withMessage('ユーザーIDは必須です')
    .isString()
    .withMessage('ユーザーIDは文字列で指定してください'),
];

// ユーザーIDのバリデーション
const validateUserId = [
  param('userId')
    .notEmpty()
    .withMessage('ユーザーIDは必須です')
    .isString()
    .withMessage('ユーザーIDは文字列で指定してください'),
];

// 特定ユーザーのプロジェクト一覧を取得
router.get(
  '/user/:userId',
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
  '/',
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
          message: '同じ名前のプロジェクトが既に存在します',
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
        message: 'プロジェクトが正常に作成されました',
        project: savedProject,
      });
    } catch (error) {
      next(error);
    }
  }
);

// プロジェクト更新
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('有効なプロジェクトIDが必要です'),
    body('name').optional().trim().isLength({ min: 1, max: 50 }),
    body('color').optional().isString(),
    body('lastUsed').optional().isISO8601().toDate(),
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
          res.status(404).json({ message: 'プロジェクトが見つかりません' });
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
              message: '同じ名前のプロジェクトが既に存在します',
            });
            return;
          }
        }
      }

      const updatedProject = await Project.findByIdAndUpdate(projectId, updateData, { new: true });

      if (!updatedProject) {
        res.status(404).json({ message: 'プロジェクトが見つかりません' });
        return;
      }

      res.json({
        message: 'プロジェクトが正常に更新されました',
        project: updatedProject,
      });
    } catch (error) {
      next(error);
    }
  }
);

// プロジェクト削除
router.delete(
  '/:id',
  param('id').isMongoId().withMessage('有効なプロジェクトIDが必要です'),
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
        res.status(404).json({ message: 'プロジェクトが見つかりません' });
        return;
      }

      res.json({
        message: 'プロジェクトが正常に削除されました',
        project: deletedProject,
      });
    } catch (error) {
      next(error);
    }
  }
);

// プロジェクト詳細取得
router.get(
  '/:id',
  param('id').isMongoId().withMessage('有効なプロジェクトIDが必要です'),
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
        res.status(404).json({ message: 'プロジェクトが見つかりません' });
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
  '/:id/update-last-used',
  param('id').isMongoId().withMessage('有効なプロジェクトIDが必要です'),
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
        res.status(404).json({ message: 'プロジェクトが見つかりません' });
        return;
      }

      res.json({
        message: 'プロジェクトの最終使用日が更新されました',
        project: updatedProject,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
