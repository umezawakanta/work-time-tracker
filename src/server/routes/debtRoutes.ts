import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { DebtEntry, IDebtEntry } from "../models/DebtEntry.js";

const router = express.Router();

const validateDebtEntry = [
  body("date")
    .isISO8601()
    .toDate()
    .withMessage("日付は有効なISO8601形式である必要があります"),
  body("value").isNumeric().withMessage("負債額は数値である必要があります"),
  body("description").notEmpty().withMessage("説明は必須です"),
  body("account").notEmpty().withMessage("口座は必須です"),
];

router.post(
  "/",
  validateDebtEntry,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const debtData: IDebtEntry = new DebtEntry({
        date: req.body.date,
        value: req.body.value,
        description: req.body.description,
        account: req.body.account,
      });

      const savedDebt = await debtData.save();
      res.status(201).json({
        message: "負債情報が正常に記録されました",
        debt: savedDebt,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/", async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const debts = await DebtEntry.find().sort({ date: -1 });
    res.json(debts);
  } catch (error) {
    next(error);
  }
});

router.put(
  "/:id",
  validateDebtEntry,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const updatedDebt = await DebtEntry.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedDebt) {
        res.status(404).json({ message: "指定された負債情報が見つかりません" });
        return;
      }
      res.json({
        message: "負債情報が正常に更新されました",
        debt: updatedDebt,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const deletedDebt = await DebtEntry.findByIdAndDelete(req.params.id);
      if (!deletedDebt) {
        res.status(404).json({ message: "指定された負債情報が見つかりません" });
        return;
      }
      res.json({
        message: "負債情報が正常に削除されました",
        debt: deletedDebt,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;