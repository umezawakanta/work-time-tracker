import { Request, Response } from 'express';
import { Tweet, ITweet } from '../models/Tweet.js';
import mongoose from 'mongoose';
import path from 'path';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
  user?: { id: string };
}

export const createTweet = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'ユーザーが認証されていません' });
      return;
    }

    if (!content && !req.file) {
      res.status(400).json({ message: 'ツイートの内容または画像は必須です' });
      return;
    }

    // content が文字列であることを確実にする
    const contentStr = typeof content === 'string' ? content : '';

    if (contentStr.length > 10000) {
      res.status(400).json({ message: 'ツイートは10000文字以内で入力してください' });
      return;
    }

    const tweetData: Partial<ITweet> = {
      user: new mongoose.Types.ObjectId(userId || '507f1f77bcf86cd799439011'), // Default ObjectId for development
    };

    if (contentStr) {
      tweetData.content = contentStr.trim();
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
      res
        .status(500)
        .json({ message: 'ツイートの作成に失敗しました', error: '不明なエラーが発生しました' });
    }
  }
};

export const getTweets = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { search } = req.query;

    // Development: Skip user authentication
    // if (!userId) {
    //   res.status(401).json({ message: 'ユーザーが認証されていません' });
    //   return;
    // }

    // 基本的なクエリ条件（ユーザーIDでフィルタリング） - Return all tweets in development
    const baseQuery = userId ? { user: userId } : {};

    // 検索条件の追加
    const query =
      search && typeof search === 'string' && search.trim() !== ''
        ? {
            ...baseQuery,
            content: {
              $regex: search.trim(),
              $options: 'i', // 大文字小文字を区別しない
            },
          }
        : baseQuery;

    const tweets = await Tweet.find(query).sort({ createdAt: -1 }).exec();

    res.json(tweets);
  } catch (error: unknown) {
    console.error('Error fetching tweets:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: 'ツイートの取得に失敗しました', error: error.message });
    } else {
      res
        .status(500)
        .json({ message: 'ツイートの取得に失敗しました', error: '不明なエラーが発生しました' });
    }
  }
};

export const updateTweet = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'ユーザーが認証されていません' });
      return;
    }

    // content が文字列であることを確実にする
    const contentStr = typeof content === 'string' ? content : '';

    if (!contentStr) {
      res.status(400).json({ message: 'ツイートの内容は必須です' });
      return;
    }

    if (contentStr.length > 10000) {
      res.status(400).json({ message: 'ツイートは10000文字以内で入力してください' });
      return;
    }

    const tweet = await Tweet.findOne({ _id: id, user: userId });

    if (!tweet) {
      res.status(404).json({ message: 'ツイートが見つかりません' });
      return;
    }

    tweet.content = contentStr.trim();
    await tweet.save();

    res.json(tweet);
  } catch (error: unknown) {
    console.error('Error updating tweet:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: 'ツイートの更新に失敗しました', error: error.message });
    } else {
      res
        .status(500)
        .json({ message: 'ツイートの更新に失敗しました', error: '不明なエラーが発生しました' });
    }
  }
};
