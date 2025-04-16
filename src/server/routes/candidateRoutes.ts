import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { Candidate, ICandidate } from "../models/Candidate.js";

const router = express.Router();

const validateCandidate = [
  body("name").notEmpty().withMessage("名前は必須です"),
  body("party").notEmpty().withMessage("政党は必須です"),
  body("prefecture")
    .optional({ nullable: true })
    .isString()
    .withMessage("都道府県は文字列である必要があります"),
  body("district")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("選挙区は1以上の整数である必要があります"),
  body("proportionalBlock")
    .optional({ nullable: true })
    .isString()
    .withMessage("比例代表ブロックは文字列である必要があります"),
  body().custom((value) => {
    if ((value.prefecture && value.district) || value.proportionalBlock) {
      return true;
    }
    throw new Error("選挙区情報または比例代表ブロックのいずれかが必要です");
  }),
];

router.post(
  "/",
  validateCandidate,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const candidateData: ICandidate = new Candidate({
        name: req.body.name,
        party: req.body.party,
        prefecture: req.body.prefecture || null,
        district: req.body.district || null,
        proportionalBlock: req.body.proportionalBlock || null,
      });

      const savedCandidate = await candidateData.save();
      res.status(201).json({
        message: "候補者が正常に登録されました",
        candidate: savedCandidate,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const candidates = await Candidate.find().sort({ name: 1 });
    res.json(candidates);
  } catch (error) {
    next(error);
  }
});

router.put(
  "/:id",
  validateCandidate,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedCandidate = await Candidate.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedCandidate) {
        return res
          .status(404)
          .json({ message: "指定された候補者が見つかりません" });
      }
      res.json({
        message: "候補者情報が正常に更新されました",
        candidate: updatedCandidate,
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
      const deletedCandidate = await Candidate.findByIdAndDelete(req.params.id);
      if (!deletedCandidate) {
        return res
          .status(404)
          .json({ message: "指定された候補者が見つかりません" });
      }
      res.json({
        message: "候補者が正常に削除されました",
        candidate: deletedCandidate,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
