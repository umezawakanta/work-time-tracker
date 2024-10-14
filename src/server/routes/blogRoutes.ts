import express from 'express';
import { BlogPost, Comment } from '../models/BlogPost.js';
import mongoose from 'mongoose';

const router = express.Router();

// 全てのブログ投稿を取得
router.get('/', async (_req, res) => {
  try {
    const posts = await BlogPost.find().populate('comments').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'ブログ投稿の取得中にエラーが発生しました', error });
  }
});

// 新しいブログ投稿を作成
router.post('/', async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const newPost = new BlogPost({ title, content, author });
    const savedPost = await newPost.save();
    res.status(201).json({ message: 'ブログ投稿が正常に作成されました', post: savedPost });
  } catch (error) {
    res.status(500).json({ message: 'ブログ投稿の作成中にエラーが発生しました', error });
  }
});

// ブログ投稿を更新
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedPost = await BlogPost.findByIdAndUpdate(id, updates, { new: true }).populate('comments');
    if (!updatedPost) {
      return res.status(404).json({ message: 'ブログ投稿が見つかりません' });
    }
    res.json({ message: 'ブログ投稿が正常に更新されました', post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: 'ブログ投稿の更新中にエラーが発生しました', error });
  }
});

// ブログ投稿を削除
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await BlogPost.findByIdAndDelete(id);
    if (!deletedPost) {
      return res.status(404).json({ message: 'ブログ投稿が見つかりません' });
    }
    // 関連するコメントを削除
    await Comment.deleteMany({ _id: { $in: deletedPost.comments } });
    res.json({ message: 'ブログ投稿と関連するコメントが正常に削除されました' });
  } catch (error) {
    res.status(500).json({ message: 'ブログ投稿の削除中にエラーが発生しました', error });
  }
});

// 新しいコメントを追加
router.post('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, author } = req.body;
    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'ブログ投稿が見つかりません' });
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
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id).populate('comments');
    if (!post) {
      return res.status(404).json({ message: 'ブログ投稿が見つかりません' });
    }
    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: 'コメントの取得中にエラーが発生しました', error });
  }
});

// 新しく追加: IDによる単一のブログ投稿を取得
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id).populate('comments');
    if (!post) {
      return res.status(404).json({ message: 'ブログ投稿が見つかりません' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'ブログ投稿の取得中にエラーが発生しました', error });
  }
});

export default router;