import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('*** BLOG API ***');
  console.log('Method:', req.method);
  console.log('Authorization header:', req.headers.authorization);

  if (req.method === 'GET') {
    // ブログポストのリストを返す（デモ用）
    return res.status(200).json([
      {
        _id: '6843786fe621b6ae5128d517',
        title: 'Welcome to Work Time Tracker',
        content:
          'This is a demo blog post for the Work Time Tracker application. The application helps you track your work time efficiently and manage your productivity.',
        category: '技術',
        tags: ['productivity', 'time-tracking', 'demo'],
        author: 'Demo User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: '6843786fe621b6ae5128d518',
        title: 'Getting Started Guide',
        content:
          'Learn how to use the Work Time Tracker application effectively. This guide covers all the basic features and advanced functionalities.',
        category: 'ビジネス',
        tags: ['guide', 'tutorial', 'getting-started'],
        author: 'Demo User',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ]);
  }

  if (req.method === 'POST') {
    // 新しいブログポストの作成（デモ用）
    const { title, content, category, tags } = req.body;

    return res.status(201).json({
      _id: 'new-post-' + Date.now(),
      title: title || 'New Post',
      content: content || 'Default content',
      category: category || '技術',
      tags: tags || [],
      author: 'Demo User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
