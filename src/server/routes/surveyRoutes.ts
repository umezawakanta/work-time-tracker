import express, { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { Survey } from "../models/survey.js";
import { SupportRate } from "../models/SupportRate.js";
import { PoliticalParty } from "../models/PoliticalParty.js";

interface SurveyRequest extends Request {
  body: {
    survey: {
      mediaOutlet: string;
      surveyStartDate: string;
      surveyEndDate: string;
      sampleSize?: number;
    };
    supportRates: Array<{
      partyId: string;
      supportRate: number;
      rateChange?: number;
    }>;
  }
}

const router = express.Router();

const validateSurvey = [
  body("survey.mediaOutlet").notEmpty(),
  body("survey.surveyStartDate").isISO8601(),
  body("survey.surveyEndDate").isISO8601(),
  body("supportRates.*.supportRate").isNumeric(),
  body("supportRates.*.partyId").notEmpty()
];

router.post("/", validateSurvey, async (req: SurveyRequest, res: Response, next: NextFunction) => {
  try {
    const survey = await Survey.create(req.body.survey);
    const supportRates = await SupportRate.insertMany(
      req.body.supportRates.map(rate => ({
        ...rate,
        surveyId: survey._id
      }))
    );
    res.status(201).json({ message: "調査結果を登録しました", survey, supportRates });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const surveys = await Survey.find().sort({ surveyEndDate: -1 });
    const supportRates = await SupportRate.find()
      .populate("party")
      .sort({ surveyId: -1 });
    res.json({ surveys, supportRates });
  } catch (error) {
    next(error);
  }
});

router.get("/parties", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const parties = await PoliticalParty.find();
    res.json(parties);
  } catch (error) {
    next(error);
  }
});

export default router;