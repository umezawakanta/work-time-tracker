import express, { Response } from 'express';
import { WorkPreset } from '../models/WorkPreset';
import { Project } from '../models/Project';
import { authenticateUser } from '../middleware/authMiddleware';
import { CustomRequest } from '../types/express';
import mongoose from 'mongoose';

export const workPresetRouter = express.Router();

// 認証ミドルウェアを全てのルートに適用
workPresetRouter.use(authenticateUser);

// 新しいプリセットを作成
workPresetRouter.post('/', async (req: CustomRequest, res: Response) => {
  try {
    // ユーザーIDの型安全性を確保
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'ユーザー認証エラー' });
    }
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const { name, description, projectId, duration } = req.body;
    
    // プロジェクトの存在確認
    const project = await Project.findOne({ 
      _id: projectId,
      owner: userId,
      isArchived: false
    });
    
    if (!project) {
      return res.status(404).json({ message: 'プロジェクトが見つかりません' });
    }
    
    const newPreset = new WorkPreset({
      name,
      description,
      projectId,
      duration,
      owner: userId
    });
    
    await newPreset.save();
    
    // プロジェクトのlastUsedを更新
    project.lastUsed = new Date();
    await project.save();
    
    res.status(201).json({
      message: 'プリセットが正常に作成されました',
      preset: newPreset
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    res.status(400).json({ 
      message: 'プリセットの作成に失敗しました', 
      error: errorMessage 
    });
  }
});

// ユーザーのプリセット一覧を取得
workPresetRouter.get('/', async (req: CustomRequest, res: Response) => {
  try {
    // ユーザーIDの型安全性を確保
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'ユーザー認証エラー' });
    }
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const presets = await WorkPreset.find({ 
      owner: userId 
    })
    .sort({ usageCount: -1, lastUsed: -1 })
    .populate('projectId');
    
    res.json(presets);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    res.status(500).json({ 
      message: 'プリセットの取得に失敗しました', 
      error: errorMessage 
    });
  }
});

// 人気のプリセット一覧を取得
workPresetRouter.get('/popular', async (req: CustomRequest, res: Response) => {
  try {
    // ユーザーIDの型安全性を確保
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'ユーザー認証エラー' });
    }
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const popularPresets = await WorkPreset.findPopularPresets(userId);
    res.json(popularPresets);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    res.status(500).json({ 
      message: '人気のプリセットの取得に失敗しました', 
      error: errorMessage 
    });
  }
});

// プリセットを使用（カウントアップとlastUsed更新）
workPresetRouter.put('/:id/used', async (req: CustomRequest, res: Response) => {
  try {
    // ユーザーIDの型安全性を確保
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'ユーザー認証エラー' });
    }
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const preset = await WorkPreset.findOne({ 
      _id: req.params.id,
      owner: userId
    });
    
    if (!preset) {
      return res.status(404).json({ message: 'プリセットが見つかりません' });
    }
    
    preset.usageCount += 1;
    preset.lastUsed = new Date();
    await preset.save();
    
    // プロジェクトのlastUsedも更新
    await Project.findByIdAndUpdate(preset.projectId, {
      lastUsed: new Date()
    });
    
    res.json({
      message: 'プリセットの使用回数と最終使用日時が更新されました',
      preset
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    res.status(500).json({ 
      message: '更新に失敗しました', 
      error: errorMessage 
    });
  }
});

// プリセットを更新
workPresetRouter.put('/:id', async (req: CustomRequest, res: Response) => {
  try {
    // ユーザーIDの型安全性を確保
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'ユーザー認証エラー' });
    }
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const { name, description, projectId, duration } = req.body;
    
    // プリセットの所有者確認
    const preset = await WorkPreset.findOne({ 
      _id: req.params.id,
      owner: userId
    });
    
    if (!preset) {
      return res.status(404).json({ message: 'プリセットが見つかりません' });
    }
    
    // プロジェクトが変更された場合、存在確認
    if (projectId && projectId !== preset.projectId.toString()) {
      const project = await Project.findOne({ 
        _id: projectId,
        owner: userId,
        isArchived: false
      });
      
      if (!project) {
        return res.status(404).json({ message: '指定されたプロジェクトが見つかりません' });
      }
    }
    
    preset.name = name || preset.name;
    preset.description = description || preset.description;
    if (projectId) preset.projectId = projectId;
    preset.duration = duration || preset.duration;
    
    await preset.save();
    
    res.json({
      message: 'プリセットが正常に更新されました',
      preset
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    res.status(400).json({ 
      message: 'プリセットの更新に失敗しました', 
      error: errorMessage 
    });
  }
});

// プリセットを削除
workPresetRouter.delete('/:id', async (req: CustomRequest, res: Response) => {
  try {
    // ユーザーIDの型安全性を確保
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'ユーザー認証エラー' });
    }
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const result = await WorkPreset.findOneAndDelete({ 
      _id: req.params.id,
      owner: userId
    });
    
    if (!result) {
      return res.status(404).json({ message: 'プリセットが見つかりません' });
    }
    
    res.json({ message: 'プリセットが削除されました' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    res.status(500).json({ 
      message: 'プリセットの削除に失敗しました', 
      error: errorMessage 
    });
  }
});