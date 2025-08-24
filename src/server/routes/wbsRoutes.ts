import * as express from 'express';
import { Request, Response } from 'express';
import { WBSNode } from '../models/WBSNode.js';

const router = express.Router();

// プロジェクトのWBSノードを取得
router.get('/project/:projectId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const nodes = await WBSNode.find({ projectId }).sort({ level: 1, orderIndex: 1 });
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching WBS nodes', error });
  }
});

// WBSノードを作成
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const newNode = new WBSNode(req.body);
    const savedNode = await newNode.save();
    res.status(201).json(savedNode);
  } catch (error) {
    res.status(500).json({ message: 'Error creating WBS node', error });
  }
});

// WBSノードを更新
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedNode = await WBSNode.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedNode) {
      res.status(404).json({ message: 'WBS node not found' });
      return;
    }
    res.json(updatedNode);
  } catch (error) {
    res.status(500).json({ message: 'Error updating WBS node', error });
  }
});

// WBSノードを削除
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedNode = await WBSNode.findByIdAndDelete(id);
    if (!deletedNode) {
      res.status(404).json({ message: 'WBS node not found' });
      return;
    }
    res.json({ message: 'WBS node deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting WBS node', error });
  }
});

export default router;
