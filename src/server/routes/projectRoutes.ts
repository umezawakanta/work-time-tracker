import express, { Response } from 'express';
import { Project } from '../models/Project';
import { authenticateUser } from '../middleware/authMiddleware';
import { CustomRequest } from '../types/express';
import mongoose from 'mongoose';

export const projectRouter = express.Router();

// 認証ミドルウェアを全てのルートに適用
projectRouter.use(authenticateUser);

// 新しいプロジェクトを作成
projectRouter.post('/', async (req: CustomRequest, res: Response) => {
  try {
    // ユーザーIDの型安全性を確保
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'ユーザー認証エラー' });
    }
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const { name, color } = req.body;
    
    // 同名のプロジェクトがないか確認
    const existingProject = await Project.findOne({ 
      name: name,
      owner: userId,
      isArchived: false
    });
    
    if (existingProject) {
      return res.status(400).json({ 
        message: '同じ名前のプロジェクトが既に存在します' 
      });
    }
    
    const newProject = new Project({
      name,
      color,
      owner: userId
    });
    
    await newProject.save();
    
    res.status(201).json({
      message: 'プロジェクトが正常に作成されました',
      project: newProject
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    res.status(400).json({ 
      message: 'プロジェクトの作成に失敗しました', 
      error: errorMessage 
    });
  }
});

// ユーザーのプロジェクト一覧を取得
projectRouter.get('/', async (req: CustomRequest, res: Response) => {
  try {
    // ユーザーIDの型安全性を確保
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'ユーザー認証エラー' });
    }
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const projects = await Project.find({ 
      owner: userId,
      isArchived: false 
    }).sort({ lastUsed: -1 });
    
    res.json(projects);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    res.status(500).json({ 
      message: 'プロジェクトの取得に失敗しました', 
      error: errorMessage 
    });
  }
});

// 最近使用したプロジェクト一覧を取得
projectRouter.get('/recent', async (req: CustomRequest, res: Response) => {
  try {
    // ユーザーIDの型安全性を確保
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'ユーザー認証エラー' });
    }
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const recentProjects = await Project.findRecentProjects(userId);
    res.json(recentProjects);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    res.status(500).json({ 
      message: '最近のプロジェクトの取得に失敗しました', 
      error: errorMessage 
    });
  }
});

// プロジェクトを更新
projectRouter.put('/:id', async (req: CustomRequest, res: Response) => {
  try {
    // ユーザーIDの型安全性を確保
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'ユーザー認証エラー' });
    }
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const { name, color } = req.body;
    
    // プロジェクトの所有者確認
    const project = await Project.findOne({ 
      _id: req.params.id,
      owner: userId
    });
    
    if (!project) {
      return res.status(404).json({ message: 'プロジェクトが見つかりません' });
    }
    
    if (name && name !== project.name) {
      // 同名のプロジェクトがないか確認
      const existingProject = await Project.findOne({ 
        name: name,
        owner: userId,
        isArchived: false,
        _id: { $ne: req.params.id } // 自分自身は除外
      });
      
      if (existingProject) {
        return res.status(400).json({ 
          message: '同じ名前のプロジェクトが既に存在します' 
        });
      }
    }
    
    project.name = name || project.name;
    project.color = color || project.color;
    
    await project.save();
    
    res.json({
      message: 'プロジェクトが正常に更新されました',
      project
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    res.status(400).json({ 
      message: 'プロジェクトの更新に失敗しました', 
      error: errorMessage 
    });
  }
});

// プロジェクトを最近使用したとマーク
projectRouter.put('/:id/used', async (req: CustomRequest, res: Response) => {
  try {
    // ユーザーIDの型安全性を確保
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'ユーザー認証エラー' });
    }
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const project = await Project.findOne({ 
      _id: req.params.id,
      owner: userId
    });
    
    if (!project) {
      return res.status(404).json({ message: 'プロジェクトが見つかりません' });
    }
    
    project.lastUsed = new Date();
    await project.save();
    
    res.json({
      message: 'プロジェクトの最終使用日時が更新されました',
      project
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    res.status(500).json({ 
      message: '更新に失敗しました', 
      error: errorMessage 
    });
  }
});

// プロジェクトをアーカイブ（論理削除）
projectRouter.delete('/:id', async (req: CustomRequest, res: Response) => {
  try {
    // ユーザーIDの型安全性を確保
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'ユーザー認証エラー' });
    }
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const project = await Project.findOne({ 
      _id: req.params.id,
      owner: userId
    });
    
    if (!project) {
      return res.status(404).json({ message: 'プロジェクトが見つかりません' });
    }
    
    project.isArchived = true;
    await project.save();
    
    res.json({ message: 'プロジェクトがアーカイブされました' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    res.status(500).json({ 
      message: 'プロジェクトのアーカイブに失敗しました', 
      error: errorMessage 
    });
  }
});