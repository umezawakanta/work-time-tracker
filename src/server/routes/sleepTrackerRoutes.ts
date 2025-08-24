import * as express from 'express';
import { Request, Response } from 'express';
import { SleepRecord } from '../models/SleepRecord.js';

const router = express.Router();

// GET all sleep records
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const records = await SleepRecord.find().sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sleep records', error });
  }
});

// POST new sleep record
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, wakeUp, bedtime } = req.body;
    const newRecord = new SleepRecord({ date, wakeUp, bedtime });
    const savedRecord = await newRecord.save();
    res
      .status(201)
      .json({ message: 'Sleep record created successfully', sleepRecord: savedRecord });
  } catch (error) {
    res.status(500).json({ message: 'Error creating sleep record', error });
  }
});

// PUT update sleep record
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedRecord = await SleepRecord.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedRecord) {
      res.status(404).json({ message: 'Sleep record not found' });
      return;
    }
    res.json({ message: 'Sleep record updated successfully', sleepRecord: updatedRecord });
  } catch (error) {
    res.status(500).json({ message: 'Error updating sleep record', error });
  }
});

// DELETE sleep record
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedRecord = await SleepRecord.findByIdAndDelete(id);
    if (!deletedRecord) {
      res.status(404).json({ message: 'Sleep record not found' });
      return;
    }
    res.json({ message: 'Sleep record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting sleep record', error });
  }
});

export default router;
