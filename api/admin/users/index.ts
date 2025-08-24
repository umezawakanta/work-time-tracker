import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { connectDB } from '../../../src/server/config/database';
import { User } from '../../../src/server/models/User';
import { cors } from '../../../lib/cors';
import { requireAdmin } from '../../../lib/authAdmin';
import { sendError } from '../../../lib/apiError';
import { toPublicUsers, assertNoSensitiveFields } from '../../../lib/publicUser';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ctx = requireAdmin(req, res);
  if (!ctx) return; // 403 already sent

  if (req.method !== 'GET') {
    return sendError(res, 405, 'METHOD_NOT_ALLOWED', '許可されていないメソッドです');
  }

  try {
    await connectDB();

    const {
      q = '',
      page = '1',
      limit = '20',
      sort = '-createdAt',
    } = (req.query || {}) as Record<string, string>;

    const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(String(limit), 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};
    if (q) {
      const regex = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ email: regex }, { displayName: regex }, { username: regex }];
    }

    // 強制: 役割フィルタが存在する場合はホワイトリスト ['user','admin'] のみ許容
    const roleQuery = (req.query as any)?.role;
    if (roleQuery) {
      const wanted = String(roleQuery).toLowerCase();
      if (wanted === 'user' || wanted === 'admin') {
        (filter as any).role = wanted;
      }
    }

    // Parse sort string like "-createdAt,email"
    const sortObj: Record<string, 1 | -1> = {};
    String(sort)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((key) => {
        if (key.startsWith('-')) sortObj[key.substring(1)] = -1 as -1;
        else sortObj[key] = 1 as 1;
      });
    if (Object.keys(sortObj).length === 0) sortObj.createdAt = -1;

    const [items, total] = await Promise.all([
      User.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
      User.countDocuments(filter),
    ]);

    // Map to public shape
    const data = toPublicUsers(items as any[]);

    // Audit log for admin listing
    console.log('ADMIN_USER_LIST', {
      actor: ctx.userId,
      q: String(q || ''),
      page: pageNum,
      limit: limitNum,
      sort: String(sort),
      returned: data.length,
      total,
    });

    const responsePayload = {
      success: true,
      data,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    } as const;
    assertNoSensitiveFields(responsePayload);
    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error('❌ ADMIN_USER_LIST error:', error);
    const isCastErr = error instanceof mongoose.Error.CastError;
    return sendError(
      res,
      isCastErr ? 400 : 500,
      isCastErr ? 'BAD_REQUEST' : 'INTERNAL_ERROR',
      isCastErr ? '無効なリクエストです' : 'サーバーエラーが発生しました'
    );
  }
}
