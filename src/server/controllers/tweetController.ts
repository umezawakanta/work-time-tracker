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
    const { search } = req.query;

    if (!userId) {
      return res.status(401).json({ message: 'ユーザーが認証されていません' });
    }

    // 基本的なクエリ条件（ユーザーIDでフィルタリング）
    const baseQuery = { user: userId };

    // 検索条件の追加
    const query = search && typeof search === 'string' && search.trim() !== ''
      ? {
          ...baseQuery,
          content: {
            $regex: search.trim(),
            $options: 'i'  // 大文字小文字を区別しない
          }
        }
      : baseQuery;

    const tweets = await Tweet.find(query)
      .sort({ createdAt: -1 })
      .exec();

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

export const updateTweet = async (req: MulterRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'ユーザーが認証されていません' });
    }

    if (!content) {
      return res.status(400).json({ message: 'ツイートの内容は必須です' });
    }

    if (content.length > 10000) {
      return res.status(400).json({ message: 'ツイートは10000文字以内で入力してください' });
    }

    const tweet = await Tweet.findOne({ _id: id, user: userId });

    if (!tweet) {
      return res.status(404).json({ message: 'ツイートが見つかりません' });
    }

    tweet.content = content.trim();
    await tweet.save();

    res.json(tweet);
  } catch (error: unknown) {
    console.error('Error updating tweet:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: 'ツイートの更新に失敗しました', error: error.message });
    } else {
      res.status(500).json({ message: 'ツイートの更新に失敗しました', error: '不明なエラーが発生しました' });
    }
  }
};