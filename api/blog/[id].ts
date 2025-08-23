import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/database';
import { BlogPost } from '../../src/server/models/BlogPost';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { cors } from '../../lib/cors';

function getAuth(req: VercelRequest): {
  userId: string | null;
  role: string | null;
  isAdmin: boolean;
} {
  try {
    const auth = req.headers.authorization || '';
    if (auth.startsWith('Bearer ')) {
      const token = auth.slice(7);
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback-secret-for-development'
      ) as any;
      const role: string | null = decoded.role || null;
      const roles: string[] = Array.isArray((decoded as any).roles)
        ? ((decoded as any).roles as string[])
        : [];
      const isAdmin =
        role === 'admin' || roles.includes('admin') || (decoded as any).isAdmin === true;
      return { userId: decoded.userId || null, role, isAdmin };
    }
  } catch (err) {
    void err;
  }
  const uid = (req.headers['x-user-id'] as string) || null;
  const role = (req.headers['x-user-role'] as string) || null;
  return { userId: uid, role, isAdmin: role === 'admin' };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sendError = (
    r: VercelResponse,
    status: number,
    code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'POST_NOT_FOUND' | string,
    message: string,
    extra?: Record<string, unknown>
  ) => {
    const { userId } = getAuth(req);
    console.log('BLOG_OP_DENY', {
      postId: req.query.id,
      userId: userId || null,
      reason: code,
      ...(extra || {}),
    });
    return r.status(status).json({ success: false, status, code, message });
  };

  try {
    const postId = req.query.id as string;
    if (!postId) return res.status(400).json({ success: false, message: 'Missing post id' });
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return sendError(res, 404, 'POST_NOT_FOUND', '投稿が見つかりません');
    }

    await connectDB();

    if (req.method === 'GET') {
      const post = await BlogPost.findOne({ _id: postId, status: { $ne: 'deleted' } });
      if (!post) return sendError(res, 404, 'POST_NOT_FOUND', '投稿が見つかりません');
      // Return plain post for frontend compatibility
      return res.status(200).json(post);
    }

    const { userId, isAdmin } = getAuth(req);
    if (!userId && !isAdmin) return sendError(res, 401, 'UNAUTHORIZED', '認証が必要です');

    if (req.method === 'DELETE') {
      const post = await BlogPost.findById(postId);
      if (!post) return sendError(res, 404, 'POST_NOT_FOUND', '投稿が見つかりません');
      const isOwner = (post as any).authorId
        ? (post as any).authorId === userId
        : (post as any).author === userId;
      if (!isAdmin && !isOwner)
        return sendError(res, 403, 'FORBIDDEN', 'この投稿を削除する権限がありません');

      const qMode = (req.query.mode as string) || '';
      const hMode = (req.headers['x-delete-mode'] as string) || '';
      const eMode = process.env.BLOG_DELETE_MODE || '';
      const rawMode = (qMode || hMode || eMode || 'soft').toLowerCase();
      const mode = rawMode === 'hard' ? 'hard' : 'soft';

      if (mode === 'hard') {
        if (!isAdmin) return sendError(res, 403, 'FORBIDDEN', '管理者のみハード削除が可能です');
        await BlogPost.deleteOne({ _id: postId });
        console.log('BLOG_DELETE_OK', { postId, userId, mode: 'hard' });
        return res.status(200).json({ success: true, id: postId, mode: 'hard' });
      }

      if ((post as any).status === 'deleted') {
        console.log('BLOG_DELETE_OK', { postId, userId, mode: 'soft', reason: 'already_deleted' });
        return res.status(200).json({
          success: true,
          id: postId,
          mode: 'soft',
          deletedAt: (post as any).deletedAt || null,
        });
      }
      const deletedAt = new Date();
      await BlogPost.updateOne({ _id: postId }, { $set: { status: 'deleted', deletedAt } });
      console.log('BLOG_DELETE_OK', { postId, userId, mode: 'soft' });
      return res.status(200).json({ success: true, id: postId, mode: 'soft', deletedAt });
    }

    if (req.method === 'PUT') {
      const updates = req.body || {};
      const post = await BlogPost.findById(postId);
      if (!post) return sendError(res, 404, 'POST_NOT_FOUND', '投稿が見つかりません');
      const isOwner = (post as any).authorId
        ? (post as any).authorId === userId
        : (post as any).author === userId;
      if (!isAdmin && !isOwner)
        return sendError(res, 403, 'FORBIDDEN', 'この投稿を更新する権限がありません');

      const allowed = ['title', 'content', 'category', 'tags', 'status'];
      const safeUpdates: Record<string, unknown> = {};
      for (const key of allowed) {
        if (key in updates) safeUpdates[key] = (updates as any)[key];
      }
      await BlogPost.updateOne({ _id: postId }, { $set: safeUpdates });
      console.log('BLOG_UPDATE_OK', { postId, userId, updates: Object.keys(safeUpdates) });
      const refreshed = await BlogPost.findById(postId);
      return res.status(200).json({ success: true, post: refreshed });
    }

    return res.status(405).json({
      success: false,
      status: 405,
      code: 'METHOD_NOT_ALLOWED',
      message: '許可されていないメソッドです',
    });
  } catch (error) {
    console.error('❌ Blog id API error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
