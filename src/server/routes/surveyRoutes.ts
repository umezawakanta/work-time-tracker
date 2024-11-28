import express, { Request, Response, NextFunction } from "express";
import { Survey } from "../models/survey.js";
import { SupportRate } from "../models/SupportRate.js";

const router = express.Router();

interface SupportRateData {
  partyId: string;
  supportRate: number;
  rateChange?: number;
}

interface SurveyRequestBody {
  survey: {
    mediaOutlet: string;
    surveyStartDate: string;
    surveyEndDate: string;
    sampleSize?: number;
  };
  supportRates: SupportRateData[];
}

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const surveys = await Survey.find().sort({ surveyEndDate: -1 });
    const supportRates = await SupportRate.find()
      .populate('partyId')
      .sort({ surveyId: -1 });
    
    res.json({ surveys, supportRates });
  } catch (error) {
    console.error('Error in GET /surveys:', error);
    next(error);
  }
});

router.post("/", async (
  req: Request<never, unknown, SurveyRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { survey, supportRates } = req.body;

    // 同じ日付とメディアの調査が既に存在するか確認
    let existingSurvey = await Survey.findOne({
      mediaOutlet: survey.mediaOutlet,
      surveyEndDate: survey.surveyEndDate
    });

    if (existingSurvey) {
      // 既存の調査を更新
      existingSurvey = await Survey.findByIdAndUpdate(existingSurvey._id, survey, { new: true });
      if (!existingSurvey) {
        throw new Error("調査の更新に失敗しました");
      }
      
      // 関連する既存の支持率を削除
      await SupportRate.deleteMany({ surveyId: existingSurvey._id });
    } else {
      // 新しい調査を作成
      existingSurvey = await Survey.create(survey);
    }

    // 新しい支持率を作成
    const newSupportRates = await SupportRate.insertMany(
      supportRates.map((rate: SupportRateData) => ({
        ...rate,
        surveyId: existingSurvey?._id
      }))
    );

    res.status(201).json({
      message: existingSurvey ? "調査結果を更新しました" : "調査結果を登録しました",
      survey: existingSurvey,
      supportRates: newSupportRates
    });
  } catch (error) {
    console.error('Error in POST /surveys:', error);
    next(error);
  }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: "調査が見つかりません" });
    }

    // Delete associated support rates first
    await SupportRate.deleteMany({ surveyId: req.params.id });
    
    // Then delete the survey
    await Survey.findByIdAndDelete(req.params.id);

    res.json({ message: "調査データが正常に削除されました" });
  } catch (error) {
    console.error('Error deleting survey:', error);
    next(error);
  }
});

export default router;

