// src/controllers/habitController.js

import { Request, Response } from 'express';
import { Habit } from '../models/Habit.js';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: { id: string };
}

interface HabitDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  data: Map<string, boolean[]>;
  createdAt: Date;
  updatedAt: Date;

  // Mongoose Document メソッドを追加
  markModified(path: string): void;
  save(): Promise<this>;
}

export const getHabits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'ユーザーが認証されていません' });
      return;
    }

    const habits = await Habit.find({ userId });
    res.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({
      message: '習慣データの取得に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createHabit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'ユーザーが認証されていません' });
      return;
    }

    const habit = new Habit({
      userId: new mongoose.Types.ObjectId(userId),
      name,
      data: new Map(),
    });

    await habit.save();
    res.status(201).json(habit);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({
      message: '習慣の作成に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const initializeHabits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'ユーザーが認証されていません' });
      return;
    }

    const { habits } = req.body;
    if (!Array.isArray(habits)) {
      res.status(400).json({ message: '習慣リストが無効です' });
      return;
    }

    // 既存の習慣を削除
    await Habit.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });

    // 新しい習慣を作成
    const habitDocs = habits.map((habit) => ({
      userId: new mongoose.Types.ObjectId(userId),
      name: habit,
      data: new Map(),
    }));

    const createdHabits = await Habit.insertMany(habitDocs);
    res.status(201).json(createdHabits);
  } catch (error) {
    console.error('Error initializing habits:', error);
    res.status(500).json({
      message: '習慣の初期化に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateHabit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { habitId } = req.params;
    const { monthKey, data } = req.body;

    // dataがundefinedか空オブジェクトの場合に対応
    const dataArray = Array.isArray(data) ? data : [];

    console.log('Update request:', {
      userId,
      habitId,
      monthKey,
      dataLength: dataArray.length, // 安全にlengthにアクセス
    });

    if (!userId) {
      res.status(401).json({ message: 'ユーザーが認証されていません' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(habitId)) {
      res.status(400).json({ message: '無効なhabitIdです' });
      return;
    }

    if (!monthKey || typeof monthKey !== 'string') {
      res.status(400).json({ message: '無効なmonthKeyです' });
      return;
    }

    if (!Array.isArray(data)) {
      res.status(400).json({ message: 'データは配列である必要があります' });
      return;
    }

    const habit = (await Habit.findOne({
      _id: habitId,
      userId: new mongoose.Types.ObjectId(userId),
    })) as HabitDocument | null;

    console.log('Found habit:', habit);

    if (!habit) {
      res.status(404).json({ message: '習慣が見つかりません' });
      return;
    }

    // データの型チェック
    if (!data.every((item) => typeof item === 'boolean')) {
      res.status(400).json({ message: 'データには真偽値のみを含める必要があります' });
      return;
    }

    try {
      // データプロパティが未定義の場合は新しいMapを作成
      if (!habit.data) {
        habit.data = new Map<string, boolean[]>();
      }

      // Mapでない場合は新しいMapに変換
      if (!(habit.data instanceof Map)) {
        habit.data = new Map(Object.entries(habit.data));
      }

      // データを設定
      habit.data.set(monthKey, data);
      habit.markModified('data'); // Mongooseに変更を通知

      const savedHabit = await habit.save();
      console.log('Successfully saved habit:', savedHabit);
      res.json(savedHabit);
    } catch (saveError) {
      console.error('Error saving habit:', saveError);
      throw saveError;
    }
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({
      message: '習慣の更新に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack:
        process.env.NODE_ENV === 'development'
          ? error instanceof Error
            ? error.stack
            : undefined
          : undefined,
    });
  }
};
