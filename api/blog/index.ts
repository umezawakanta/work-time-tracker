import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/database';
import { BlogPost } from '../../src/server/models/BlogPost';
import { cors } from '../../lib/cors';
import { withAuth, AuthenticatedRequest, authMiddleware } from '../../src/middleware/auth';

const handler = async (req: AuthenticatedRequest, res: VercelResponse): Promise<void> => {
  await cors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      const posts = await BlogPost.find({ status: { $ne: 'deleted' } }).sort({ createdAt: -1 });
      console.log('BLOG_LIST_OK', { total: posts.length });
      // Return plain array for frontend compatibility
      res.status(200).json(posts);
      return;
    }

    if (req.method === 'POST') {
      // Require auth for creating posts
      const hasAuth = typeof req.headers.authorization === 'string';
      if (!hasAuth) {
        res
          .status(401)
          .json({ success: false, status: 401, code: 'UNAUTHORIZED', message: '認証が必要です' });
        return;
      }
      await new Promise<void>((resolve) => authMiddleware(req as any, res, resolve));
      if (res.headersSent) return;
      if (!req.user?.userId) {
        res
          .status(401)
          .json({ success: false, status: 401, code: 'UNAUTHORIZED', message: '認証が必要です' });
        return;
      }

      const { title, content, author, category, tags = [] } = req.body || {};
      if (!title || !content || !author || !category) {
        res.status(400).json({ success: false, message: '必須項目が不足しています' });
        return;
      }

      const newPost = await BlogPost.create({
        title,
        content,
        author,
        authorId: req.user.userId,
        category,
        tags: Array.isArray(tags) ? tags : [],
      });

      console.log('BLOG_CREATE_OK', { postId: (newPost as any)._id, userId: req.user.userId });
      res.status(201).json({ success: true, post: newPost });
      return;
    }

    res.status(405).json({ success: false, status: 405, code: 'METHOD_NOT_ALLOWED', message: '許可されていないメソッドです' });
  } catch (error) {
    console.error('❌ Blog index API error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default withAuth(handler, { requireAuth: false });
