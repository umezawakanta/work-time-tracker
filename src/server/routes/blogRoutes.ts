import express from 'express';
import { BlogPost, Comment } from '../models/BlogPost.js';
import mongoose from 'mongoose';

const router = express.Router();

// GET all blog posts
router.get('/', async (_req, res) => {
  try {
    const posts = await BlogPost.find().populate('comments').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog posts', error });
  }
});

// POST new blog post
router.post('/', async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const newPost = new BlogPost({ title, content, author });
    const savedPost = await newPost.save();
    res.status(201).json({ message: 'Blog post created successfully', post: savedPost });
  } catch (error) {
    res.status(500).json({ message: 'Error creating blog post', error });
  }
});

// PUT update blog post
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedPost = await BlogPost.findByIdAndUpdate(id, updates, { new: true }).populate('comments');
    if (!updatedPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json({ message: 'Blog post updated successfully', post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: 'Error updating blog post', error });
  }
});

// DELETE blog post
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await BlogPost.findByIdAndDelete(id);
    if (!deletedPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    // Delete associated comments
    await Comment.deleteMany({ _id: { $in: deletedPost.comments } });
    res.json({ message: 'Blog post and associated comments deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting blog post', error });
  }
});

// POST new comment
router.post('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, author } = req.body;
    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    const newComment = new Comment({ content, author });
    await newComment.save();
    post.comments.push(newComment._id as mongoose.Types.ObjectId);
    await post.save();
    res.status(201).json({ message: 'Comment added successfully', comment: newComment });
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error });
  }
});

// GET comments for a blog post
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id).populate('comments');
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error });
  }
});

export default router;