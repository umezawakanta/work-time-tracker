// src/server/routes/partyRoutes.ts
import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { PoliticalParty } from '../models/PoliticalParty.js';

const router = express.Router();

const validateParty = [
  body('name').notEmpty().withMessage('政党名は必須です'),
  body('shortName').notEmpty().withMessage('略称は必須です'),
  body('colorCode')
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('有効なカラーコードを入力してください'),
];

router.post(
  '/',
  validateParty,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const party = await PoliticalParty.create(req.body);
      res.status(201).json({
        message: '政党情報が正常に登録されました',
        party,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parties = await PoliticalParty.find().sort({ name: 1 });
    res.json(parties);
  } catch (error) {
    next(error);
  }
});

router.put(
  '/:id',
  validateParty,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const updatedParty = await PoliticalParty.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updatedParty) {
        res.status(404).json({ message: '指定された政党が見つかりません' });
        return;
      }
      res.json({
        message: '政党情報が正常に更新されました',
        party: updatedParty,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deletedParty = await PoliticalParty.findByIdAndDelete(req.params.id);
    if (!deletedParty) {
      res.status(404).json({ message: '指定された政党が見つかりません' });
      return;
    }
    res.json({
      message: '政党情報が正常に削除されました',
      party: deletedParty,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
