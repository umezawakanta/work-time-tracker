// src/server/routes/surveyRoutes.ts
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
    const survey = await Survey.create(req.body.survey);
    const supportRates = await SupportRate.insertMany(
      req.body.supportRates.map((rate: SupportRateData) => ({
        ...rate,
        surveyId: survey._id
      }))
    );

    res.status(201).json({
      message: "調査結果を登録しました",
      survey,
      supportRates
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