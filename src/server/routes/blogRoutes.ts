import * as express from 'express';
import { Request, Response } from 'express';
import { BlogPost, Comment } from '../models/BlogPost.js';
import mongoose from 'mongoose';

const router = express.Router();

// 全てのブログ投稿を取得
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const posts = await BlogPost.find().populate('comments').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'ブログ投稿の取得中にエラーが発生しました', error });
  }
});

// 新しいブログ投稿を作成
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, author, category, tags } = req.body;
    const newPost = new BlogPost({ title, content, author, category, tags });
    const savedPost = await newPost.save();
    res.status(201).json({ message: 'ブログ投稿が正常に作成されました', post: savedPost });
  } catch (error) {
    res.status(500).json({ message: 'ブログ投稿の作成中にエラーが発生しました', error });
  }
});

// ブログ投稿を更新
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedPost = await BlogPost.findByIdAndUpdate(id, updates, { new: true }).populate(
      'comments'
    );
    if (!updatedPost) {
      res.status(404).json({ message: 'ブログ投稿が見つかりません' });
      return;
    }
    res.json({ message: 'ブログ投稿が正常に更新されました', post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: 'ブログ投稿の更新中にエラーが発生しました', error });
  }
});

// ブログ投稿を削除
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedPost = await BlogPost.findByIdAndDelete(id);
    if (!deletedPost) {
      res.status(404).json({ message: 'ブログ投稿が見つかりません' });
      return;
    }
    // 関連するコメントを削除
    await Comment.deleteMany({ _id: { $in: deletedPost.comments } });
    res.json({ message: 'ブログ投稿と関連するコメントが正常に削除されました' });
  } catch (error) {
    res.status(500).json({ message: 'ブログ投稿の削除中にエラーが発生しました', error });
  }
});

// 新しいコメントを追加
router.post('/:id/comments', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content, author } = req.body;
    const post = await BlogPost.findById(id);
    if (!post) {
      res.status(404).json({ message: 'ブログ投稿が見つかりません' });
      return;
    }
    const newComment = new Comment({ content, author });
    await newComment.save();
    post.comments.push(newComment._id as mongoose.Types.ObjectId);
    await post.save();
    res.status(201).json({ message: 'コメントが正常に追加されました', comment: newComment });
  } catch (error) {
    res.status(500).json({ message: 'コメントの追加中にエラーが発生しました', error });
  }
});

// ブログ投稿のコメントを取得
router.get('/:id/comments', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id).populate('comments');
    if (!post) {
      res.status(404).json({ message: 'ブログ投稿が見つかりません' });
      return;
    }
    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: 'コメントの取得中にエラーが発生しました', error });
  }
});

// IDによる単一のブログ投稿を取得
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id).populate('comments');
    if (!post) {
      res.status(404).json({ message: 'ブログ投稿が見つかりません' });
      return;
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'ブログ投稿の取得中にエラーが発生しました', error });
  }
});

// いいねを追加/削除
router.post('/:id/like', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // userIdが文字列であることを確認
    if (typeof userId !== 'string') {
      res.status(400).json({ message: 'ユーザーIDは文字列である必要があります' });
      return;
    }

    const post = await BlogPost.findById(id);
    if (!post) {
      res.status(404).json({ message: 'ブログ投稿が見つかりません' });
      return;
    }

    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex > -1) {
      // いいねを削除
      post.likes = post.likes.filter((like) => like !== userId);
    } else {
      // いいねを追加
      post.likes.push(userId);
    }

    await post.save();
    res.json({ message: 'いいねを更新しました', likes: post.likes });
  } catch (error: unknown) {
    console.error('Error in like route:', error);
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: 'いいねの更新中にエラーが発生しました', error: error.message });
    } else {
      res.status(500).json({ message: 'いいねの更新中に不明なエラーが発生しました' });
    }
  }
});

export default router;
