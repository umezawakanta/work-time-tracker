import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/database';
import { BlogPost } from '../../src/server/models/BlogPost';
import jwt from 'jsonwebtoken';

// Minimal auth util (expects bearer token decoded upstream or user id via header in dev)
function getAuth(req: VercelRequest): { userId: string | null; role: string | null } {
  try {
    const auth = req.headers.authorization || '';
    if (auth.startsWith('Bearer ')) {
      const token = auth.slice(7);
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback-secret-for-development'
      ) as any;
      return { userId: decoded.userId || null, role: decoded.role || null };
    }
  } catch {}
  // Dev fallback via headers
  const uid = (req.headers['x-user-id'] as string) || null;
  const role = (req.headers['x-user-role'] as string) || null;
  return { userId: uid, role };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-5d9q.vercel.app'];
  const isPreview = origin && origin.match(/^https:\/\/work-time-tracker-5d9q-.*\.vercel\.app$/);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);
  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin! : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const postId = req.query.id as string;
    if (!postId) return res.status(400).json({ success: false, message: 'Missing post id' });

    await connectDB();

    const post = await BlogPost.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // AuthN/AuthZ: allow owner or admin (admin check placeholder via header)
    const { userId, role } = getAuth(req);
    const isAdmin = role === 'admin';
    if (!userId && !isAdmin) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!isAdmin && post.author !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await BlogPost.deleteOne({ _id: postId });

    return res.status(200).json({ success: true, id: postId });
  } catch (error) {
    console.error('❌ Delete blog error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
