import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { Subscription, ISubscription } from "../models/Subscription.js";

const router = express.Router();

const validateSubscription = [
  body("name").notEmpty().withMessage("名称は必須です"),
  body("billingDate").notEmpty().withMessage("引き落とし日は必須です"),
  body("type").notEmpty().withMessage("種別は必須です"),
  body("amount").isNumeric().withMessage("金額は数値である必要があります"),
];

router.post(
  "/",
  validateSubscription,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const subscriptionData: ISubscription = new Subscription({
        name: req.body.name,
        billingDate: req.body.billingDate,
        type: req.body.type,
        amount: req.body.amount,
      });

      const savedSubscription = await subscriptionData.save();
      res.status(201).json({
        message: "サブスクリプションが正常に登録されました",
        subscription: savedSubscription,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const subscriptions = await Subscription.find().sort({ name: 1 });
    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
});

router.put(
  "/:id",
  validateSubscription,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedSubscription = await Subscription.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedSubscription) {
        return res
          .status(404)
          .json({ message: "指定されたサブスクリプションが見つかりません" });
      }
      res.json({
        message: "サブスクリプション情報が正常に更新されました",
        subscription: updatedSubscription,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedSubscription = await Subscription.findByIdAndDelete(
        req.params.id
      );
      if (!deletedSubscription) {
        return res
          .status(404)
          .json({ message: "指定されたサブスクリプションが見つかりません" });
      }
      res.json({
        message: "サブスクリプションが正常に削除されました",
        subscription: deletedSubscription,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
