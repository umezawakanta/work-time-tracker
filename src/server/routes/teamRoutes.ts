import express, { Request, Response, NextFunction } from 'express';
import { TeamMember } from '../models/TeamMember.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/team/members/:projectId - プロジェクトのチームメンバー一覧取得
router.get(
  '/members/:projectId',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const members = await TeamMember.find({ projectId }).sort({ createdAt: -1 });
      res.json(members);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/team/members - 新しいチームメンバーを追加
router.post(
  '/members',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const memberData = {
        ...req.body,
        userId: req.user?.id,
      };

      const newMember = new TeamMember(memberData);
      const savedMember = await newMember.save();

      res.status(201).json(savedMember);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/team/members/:memberId - チームメンバー情報を更新
router.put(
  '/members/:memberId',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { memberId } = req.params;
      const updates = req.body;

      const updatedMember = await TeamMember.findByIdAndUpdate(
        memberId,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!updatedMember) {
        res.status(404).json({ message: 'Team member not found' });
        return;
      }

      res.json(updatedMember);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/team/members/:memberId - チームメンバーを削除
router.delete(
  '/members/:memberId',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { memberId } = req.params;

      const deletedMember = await TeamMember.findByIdAndDelete(memberId);

      if (!deletedMember) {
        res.status(404).json({ message: 'Team member not found' });
        return;
      }

      res.json({ message: 'Team member deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
