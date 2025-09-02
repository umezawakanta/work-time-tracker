import type { VercelRequest, VercelResponse } from '@vercel/node';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoLib = require('../../_lib/mongo');
const connectMongoDirect = mongoLib.connectMongoDirect as () => Promise<void>;
const mongoose = mongoLib.mongoose as typeof import('mongoose');
import { ensureUserModel } from '../../_schemas/user';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Basic CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' } as any);
  }

  try {
    await connectMongoDirect();
    const User = ensureUserModel() as any;

    const {
      q = '',
      search = '',
      page = '1',
      limit = '20',
      sort = '-createdAt',
    } = (req.query || {}) as Record<string, string>;

    const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(String(limit), 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};
    const qInput = q || search;
    if (qInput) {
      const regex = new RegExp(String(qInput).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      (filter as any).$or = [{ email: regex }, { displayName: regex }, { username: regex }];
    }

    const roleQuery = (req.query as any)?.role;
    if (roleQuery) {
      const wanted = String(roleQuery).toLowerCase();
      if (wanted === 'user' || wanted === 'admin') (filter as any).role = wanted;
    }

    const sortObj: Record<string, 1 | -1> = {};
    String(sort)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((key) => {
        if (key.startsWith('-')) sortObj[key.substring(1)] = -1 as -1;
        else sortObj[key] = 1 as const;
      });
    if (Object.keys(sortObj).length === 0) sortObj.createdAt = -1;

    const [items, total] = await Promise.all([
      User.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
      User.countDocuments(filter),
    ]);

    const toPublic = (u: any) => ({
      _id: String(u._id),
      email: String(u.email || ''),
      name: String(u.displayName || u.username || u.name || ''),
      role: String(u.role || 'user'),
      blocked: Boolean(u.blocked) || String(u.status || '') === 'suspended',
      isActive: Boolean(u.isActive) || String(u.status || '') === 'active',
      lastLoginAt: u.lastLoginAt || u.metadata?.lastLoginAt || null,
    });

    const data = (items as any[]).map(toPublic);

    return res.status(200).json({
      success: true,
      data,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    } as const);
  } catch (error) {
    console.error('❌ ADMIN_USER_LIST error:', error);
    const isCastErr = error instanceof mongoose.Error.CastError;
    return res.status(isCastErr ? 400 : 500).json({
      success: false,
      message: isCastErr ? '無効なリクエストです' : 'サーバーエラー',
    } as any);
  }
}
