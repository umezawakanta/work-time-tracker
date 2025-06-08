import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('*** BLOG POST API ***');
  console.log('Method:', req.method);
  console.log('Post ID:', req.query.id);

  const { id } = req.query;

  if (req.method === 'GET') {
    // 特定のブログポストを返す（デモ用）
    if (id === '6843786fe621b6ae5128d517') {
      return res.status(200).json({
        _id: '6843786fe621b6ae5128d517',
        title: 'Welcome to Work Time Tracker',
        content: `# Welcome to Work Time Tracker

This is a demo blog post for the Work Time Tracker application. The application helps you track your work time efficiently and manage your productivity.

## Features

- Time tracking
- Task management  
- Productivity analytics
- Team collaboration

## Getting Started

To get started with the application, simply log in and begin tracking your time!`,
        category: '技術',
        tags: ['productivity', 'time-tracking', 'demo'],
        author: 'Demo User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // デフォルトのブログポスト
    return res.status(200).json({
      _id: id,
      title: 'Blog Post',
      content: 'This is a demo blog post content.',
      category: '技術',
      tags: ['demo'],
      author: 'Demo User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  if (req.method === 'PUT') {
    // ブログポストの更新（デモ用）
    const { title, content, category, tags } = req.body;

    return res.status(200).json({
      _id: id,
      title: title || 'Updated Post',
      content: content || 'Updated content',
      category: category || '技術',
      tags: tags || [],
      author: 'Demo User',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  if (req.method === 'DELETE') {
    // ブログポストの削除（デモ用）
    return res.status(200).json({
      message: 'Blog post deleted successfully',
      id: id,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
