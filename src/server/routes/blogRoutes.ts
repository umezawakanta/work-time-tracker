import * as express from 'express';
import { Request, Response } from 'express';
import { BlogPost, Comment } from '../models/BlogPost.js';
import mongoose from 'mongoose';
import { authMiddleware } from '../middleware/authMiddleware.js';

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

// 新しいブログ投稿を作成（認証必須、authorIdをJWTから設定）
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, author, category, tags } = req.body;

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '認証が必要です' });
      return;
    }

    const newPost = new BlogPost({
      title,
      content,
      author,
      authorId: userId,
      category,
      tags,
    });
    const savedPost = await newPost.save();
    res.status(201).json({ message: 'ブログ投稿が正常に作成されました', post: savedPost });
  } catch (error) {
    res.status(500).json({ message: 'ブログ投稿の作成中にエラーが発生しました', error });
  }
});

// ブログ投稿を更新（本人または管理者のみ）
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    if (!userId && !isAdmin) {
      res.status(401).json({ message: '認証が必要です' });
      return;
    }

    const existing = await BlogPost.findById(id);
    if (!existing) {
      res.status(404).json({ message: 'ブログ投稿が見つかりません' });
      return;
    }

    const isOwner = (existing as any).authorId
      ? (existing as any).authorId === userId
      : existing.author === userId;
    if (!isAdmin && !isOwner) {
      res.status(403).json({ message: 'この投稿を更新する権限がありません' });
      return;
    }

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

// ブログ投稿を削除（本人または管理者のみ）
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    if (!userId && !isAdmin) {
      res.status(401).json({ success: false, message: '認証が必要です' });
      return;
    }

    const existing = await BlogPost.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'ブログ投稿が見つかりません' });
      return;
    }

    const isOwner = (existing as any).authorId
      ? (existing as any).authorId === userId
      : existing.author === userId;
    if (!isAdmin && !isOwner) {
      res.status(403).json({ success: false, message: 'この投稿を削除する権限がありません' });
      return;
    }

    // decide deletion mode: query -> header -> env -> default 'soft'
    const qMode = (req.query.mode as string) || '';
    const hMode = (req.headers['x-delete-mode'] as string) || '';
    const eMode = process.env.BLOG_DELETE_MODE || '';
    const rawMode = (qMode || hMode || eMode || 'soft').toLowerCase();
    const mode = rawMode === 'hard' ? 'hard' : 'soft';

    if (mode === 'hard') {
      if (!isAdmin) {
        res.status(403).json({ success: false, message: '管理者のみハード削除が可能です' });
        return;
      }
      await BlogPost.deleteOne({ _id: id });
      res.status(200).json({ success: true, id, mode: 'hard' });
      return;
    }

    // soft delete (idempotent)
    if ((existing as any).status === 'deleted') {
      res.status(200).json({
        success: true,
        id,
        mode: 'soft',
        deletedAt: (existing as any).deletedAt || null,
      });
      return;
    }

    const deletedAt = new Date();
    await BlogPost.updateOne({ _id: id }, { $set: { status: 'deleted', deletedAt } });
    res.status(200).json({ success: true, id, mode: 'soft', deletedAt });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'ブログ投稿の削除中にエラーが発生しました', error });
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
