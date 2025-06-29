import * as express from 'express';
import { WorkTimeEntry } from '../models/WorkTimeEntry';

export const workTimeRouter = express.Router();

workTimeRouter.post('/', async (req, res) => {
  try {
    const newEntry = new WorkTimeEntry(req.body);
    await newEntry.save();
    res.status(201).json({ message: '作業時間が正常に記録されました', workTime: newEntry });
  } catch (error) {
    res.status(400).json({ message: '作業時間の記録に失敗しました', error });
  }
});

workTimeRouter.get('/', async (_req, res) => {
  try {
    const entries = await WorkTimeEntry.find().sort({ startTime: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: '作業時間の取得に失敗しました', error });
  }
});
