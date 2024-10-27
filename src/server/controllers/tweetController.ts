import { Request, Response } from 'express';
import { Tweet, ITweet } from '../models/Tweet.js';
import mongoose from 'mongoose';
import path from 'path';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
  user?: { id: string };
}

export const createTweet = async (req: MulterRequest, res: Response) => {
  try {
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'ユーザーが認証されていません' });
    }

    if (!content && !req.file) {
      return res.status(400).json({ message: 'ツイートの内容または画像は必須です' });
    }

    if (content && content.length > 10000) {
      return res.status(400).json({ message: 'ツイートは10000文字以内で入力してください' });
    }

    const tweetData: Partial<ITweet> = {
      user: new mongoose.Types.ObjectId(userId),
    };

    if (content) {
      tweetData.content = content.trim();
    }

    if (req.file) {
      tweetData.image = path.basename(req.file.path);
    }

    const tweet = new Tweet(tweetData);
    await tweet.save();

    res.status(201).json(tweet);
  } catch (error: unknown) {
    console.error('Error creating tweet:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: 'ツイートの作成に失敗しました', error: error.message });
    } else {
      res.status(500).json({ message: 'ツイートの作成に失敗しました', error: '不明なエラーが発生しました' });
    }
  }
};

export const getTweets = async (req: MulterRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'ユーザーが認証されていません' });
      }
  
      const tweets = await Tweet.find({ user: userId }).sort({ createdAt: -1 });
      res.json(tweets);
    } catch (error: unknown) {
      console.error('Error fetching tweets:', error);
      if (error instanceof Error) {
        res.status(500).json({ message: 'ツイートの取得に失敗しました', error: error.message });
      } else {
        res.status(500).json({ message: 'ツイートの取得に失敗しました', error: '不明なエラーが発生しました' });
      }
    }
  };