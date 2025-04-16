import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { Survey } from "../models/survey.js";
import { SupportRate } from "../models/SupportRate.js";

const router = express.Router();

interface SupportRateData {
  partyId: string;
  supportRate: number;
  rateChange?: number;
}

interface SurveyData {
  mediaOutlet: string;
  surveyStartDate: string;
  surveyEndDate: string;
  sampleSize?: number;
}

// 最新の調査を取得するルートを追加
// 注意: この特定のルートはパラメータ付きルート (/:id) より前に定義する必要があります
router.get("/latest", async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const latestSurvey = await Survey.findOne().sort({ surveyEndDate: -1 });
    if (!latestSurvey) {
      res.status(404).json({ message: "最新の調査が見つかりません" });
      return;
    }

    const supportRates = await SupportRate.find({ surveyId: latestSurvey._id })
      .populate('partyId')
      .sort({ partyId: 1 });

    res.json({
      message: "取得成功",
      survey: latestSurvey,
      supportRates: supportRates
    });
  } catch (error) {
    console.error('Error fetching latest survey:', error);
    next(error);
  }
});

router.get("/", async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
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
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Type safety check
    if (!req.body || typeof req.body !== 'object' || !('survey' in req.body) || !('supportRates' in req.body)) {
      res.status(400).json({
        message: "無効なリクエスト形式です。'survey'と'supportRates'が必要です。"
      });
      return;
    }

    const { survey, supportRates } = req.body as { 
      survey: SurveyData; 
      supportRates: SupportRateData[] 
    };

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

router.delete("/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      res.status(404).json({ message: "調査が見つかりません" });
      return;
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

router.get("/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Received survey ID:', req.params.id);
    console.log('Request URL:', req.url);
    console.log('Full request details:', {
      method: req.method,
      path: req.path,
      params: req.params,
      query: req.query
    });

    // データベース内の全IDを出力
    const allSurveyIds = await Survey.find({}, '_id');
    console.log('All survey IDs in database:', allSurveyIds.map(s => s._id.toString()));

    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      console.warn(`Survey with ID ${req.params.id} not found`);
      res.status(404).json({ 
        message: "調査が見つかりません",
        searchedId: req.params.id,
        availableIds: allSurveyIds.map(s => s._id.toString())
      });
      return;
    }

    // 対応する支持率データを取得
    const supportRates = await SupportRate.find({ surveyId: req.params.id })
      .populate('partyId')
      .sort({ partyId: 1 });

    res.json({
      message: "取得成功",
      survey: survey,
      supportRates: supportRates
    });
  } catch (error) {
    console.error(`Detailed error fetching survey with ID ${req.params.id}:`, error);
    next(error);
  }
});

router.put("/:id", async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const surveyId = req.params.id;
    
    // Type safety check
    if (!req.body || typeof req.body !== 'object' || !('survey' in req.body) || !('supportRates' in req.body)) {
      res.status(400).json({
        message: "無効なリクエスト形式です。'survey'と'supportRates'が必要です。"
      });
      return;
    }

    const { survey, supportRates } = req.body as { 
      survey: SurveyData; 
      supportRates: SupportRateData[] 
    };

    // 指定されたIDの調査が存在するか確認
    const existingSurvey = await Survey.findById(surveyId);
    if (!existingSurvey) {
      res.status(404).json({ message: "更新対象の調査が見つかりません" });
      return;
    }

    // 調査情報を更新
    const updatedSurvey = await Survey.findByIdAndUpdate(
      surveyId, 
      survey, 
      { new: true }
    );

    if (!updatedSurvey) {
      throw new Error("調査の更新に失敗しました");
    }

    // 既存の支持率データを削除
    await SupportRate.deleteMany({ surveyId: surveyId });

    // 新しい支持率データを作成
    const newSupportRates = await SupportRate.insertMany(
      supportRates.map((rate: SupportRateData) => ({
        ...rate,
        surveyId: surveyId
      }))
    );

    res.json({
      message: "調査結果を更新しました",
      survey: updatedSurvey,
      supportRates: newSupportRates
    });
  } catch (error) {
    console.error(`Error updating survey with ID ${req.params.id}:`, error);
    next(error);
  }
});

export default router;