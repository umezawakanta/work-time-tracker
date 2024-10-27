import { Request, Response } from 'express';
import { Tweet } from '../models/Tweet.js';

export const createTweet = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const userId = req.user?.id;

    const tweet = new Tweet({
      content,
      user: userId,
    });

    await tweet.save();

    res.status(201).json(tweet);
  } catch (error) {
    console.error('Error creating tweet:', error);
    res.status(500).json({ message: 'ツイートの作成に失敗しました' });
  }
};

export const getTweets = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const tweets = await Tweet.find({ user: userId }).sort({ createdAt: -1 });
    res.json(tweets);
  } catch (error) {
    console.error('Error fetching tweets:', error);
    res.status(500).json({ message: 'ツイートの取得に失敗しました' });
  }
};