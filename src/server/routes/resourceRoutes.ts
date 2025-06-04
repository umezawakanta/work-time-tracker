import express, { Request, Response, NextFunction } from 'express';
import { Resource } from '../models/Resource.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/resources/:category - カテゴリ別リソース一覧取得
router.get(
  '/:category',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category } = req.params;
      const { projectId } = req.query;

      const query: any = { category };

      if (projectId) {
        // プロジェクト固有のリソースとグローバルリソースを取得
        query.$or = [{ projectId, isGlobal: false }, { isGlobal: true }];
      } else {
        // グローバルリソースのみ取得
        query.isGlobal = true;
      }

      const resources = await Resource.find(query).sort({ createdAt: -1 });
      res.json(resources);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/resources - 新しいリソースを追加
router.post(
  '/',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resourceData = {
        ...req.body,
        createdBy: req.user?.id,
      };

      const newResource = new Resource(resourceData);
      const savedResource = await newResource.save();

      res.status(201).json(savedResource);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/resources/:resourceId - リソースを更新
router.put(
  '/:resourceId',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { resourceId } = req.params;
      const updates = req.body;

      const updatedResource = await Resource.findByIdAndUpdate(
        resourceId,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!updatedResource) {
        res.status(404).json({ message: 'Resource not found' });
        return;
      }

      res.json(updatedResource);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/resources/:resourceId - リソースを削除
router.delete(
  '/:resourceId',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { resourceId } = req.params;

      const deletedResource = await Resource.findByIdAndDelete(resourceId);

      if (!deletedResource) {
        res.status(404).json({ message: 'Resource not found' });
        return;
      }

      res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
