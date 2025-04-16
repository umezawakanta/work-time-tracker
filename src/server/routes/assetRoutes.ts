import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { AssetEntry, IAssetEntry } from "../models/AssetEntry.js";

const router = express.Router();

const validateAssetEntry = [
  body("date")
    .isISO8601()
    .toDate()
    .withMessage("日付は有効なISO8601形式である必要があります"),
  body("value").isNumeric().withMessage("資産価値は数値である必要があります"),
  body("account").notEmpty().withMessage("口座は必須です"),
];

router.post(
  "/",
  validateAssetEntry,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const assetData: IAssetEntry = new AssetEntry({
        date: req.body.date,
        value: req.body.value,
        account: req.body.account,
      });

      const savedAsset = await assetData.save();
      res.status(201).json({
        message: "資産情報が正常に記録されました",
        asset: savedAsset,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const assets = await AssetEntry.find().sort({ date: -1 });
    res.json(assets);
  } catch (error) {
    next(error);
  }
});

router.put(
  "/:id",
  validateAssetEntry,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {  // 戻り値の型をPromise<void>に変更
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const updatedAsset = await AssetEntry.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedAsset) {
        res.status(404).json({ message: "指定された資産情報が見つかりません" });
        return;  // return文を追加して明示的に関数を終了
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

router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {  // 戻り値の型をPromise<void>に変更
    try {
      const deletedAsset = await AssetEntry.findByIdAndDelete(req.params.id);
      if (!deletedAsset) {
        res.status(404).json({ message: "指定された資産情報が見つかりません" });
        return;  // return文を追加して明示的に関数を終了
      }
      res.json({
        message: "資産情報が正常に削除されました",
        asset: deletedAsset,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
