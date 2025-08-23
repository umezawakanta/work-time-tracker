import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { connectDB } from '../../../src/server/config/database';
import { User } from '../../../src/server/models/User';
import { cors } from '../../../lib/cors';
import { requireAdmin } from '../../../lib/authAdmin';
import { toPublicUser, assertNoSensitiveFields } from '../../../lib/publicUser';
import { sendError } from '../../../lib/apiError';

type AllowedRole = 'user' | 'admin';
const ALLOWED_ROLES: AllowedRole[] = ['user', 'admin'];

async function readJson(req: VercelRequest): Promise<any> {
  try {
    const existing: unknown = (req as any).body;
    if (existing !== undefined) {
      return typeof existing === 'string' ? JSON.parse(existing) : existing;
    }
    const raw: string = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', (chunk: Buffer) => (data += chunk.toString('utf8')));
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw Object.assign(new Error('Invalid JSON'), { statusCode: 400 });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ctx = requireAdmin(req, res);
  if (!ctx) return; // 403 already sent

  if (req.method !== 'PATCH') {
    return sendError(res, 405, 'METHOD_NOT_ALLOWED', '許可されていないメソッドです');
  }

  try {
    const id = String(req.query.id || '');
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'BAD_REQUEST', '無効なユーザーIDです');
    }

    await connectDB();

    const body = await readJson(req);
    const updates: Record<string, unknown> = {};

    // role
    if (Object.prototype.hasOwnProperty.call(body, 'role')) {
      const roleVal = String(body.role).toLowerCase();
      if (!ALLOWED_ROLES.includes(roleVal as AllowedRole)) {
        return sendError(res, 400, 'BAD_ROLE', '無効な役割です');
      }
      updates.role = roleVal;
    }

    // roles (store under metadata.roles for compatibility)
    if (Object.prototype.hasOwnProperty.call(body, 'roles')) {
      const rolesInput = body.roles;
      if (!Array.isArray(rolesInput)) {
        return sendError(res, 400, 'BAD_ROLES', 'roles は配列で指定してください');
      }
      const filtered = Array.from(
        new Set(
          rolesInput
            .map((r: unknown) => String(r).toLowerCase())
            .filter((r: string) => ALLOWED_ROLES.includes(r as AllowedRole))
        )
      );
      updates['metadata.roles'] = filtered;
      // If role not explicitly provided and roles includes admin, keep primary role in sync
      if (!Object.prototype.hasOwnProperty.call(body, 'role') && filtered.includes('admin')) {
        updates.role = 'admin';
      }
    }

    // isActive / blocked → status mapping
    const hasIsActive = Object.prototype.hasOwnProperty.call(body, 'isActive');
    const hasBlocked = Object.prototype.hasOwnProperty.call(body, 'blocked');
    if (hasIsActive) {
      if (typeof body.isActive !== 'boolean') {
        return sendError(res, 400, 'BAD_IS_ACTIVE', 'isActive は boolean で指定してください');
      }
    }
    if (hasBlocked) {
      if (typeof body.blocked !== 'boolean') {
        return sendError(res, 400, 'BAD_BLOCKED', 'blocked は boolean で指定してください');
      }
    }
    if (hasIsActive || hasBlocked) {
      let statusToSet: 'active' | 'inactive' | 'suspended' | undefined;
      if (body.blocked === true) statusToSet = 'suspended';
      else if (body.isActive === true) statusToSet = 'active';
      else if (body.isActive === false) statusToSet = 'inactive';
      if (statusToSet) updates.status = statusToSet;
    }

    if (Object.keys(updates).length === 0) {
      return sendError(res, 400, 'NO_UPDATABLE_FIELDS', '更新可能なフィールドが含まれていません');
    }

    await User.updateOne({ _id: id }, { $set: updates }, { runValidators: true });
    const refreshed = await User.findById(id).lean();
    if (!refreshed) {
      return sendError(res, 404, 'NOT_FOUND', 'ユーザーが見つかりません');
    }

    console.log('ADMIN_USER_UPDATE', { id, actor: ctx.userId, updates: Object.keys(updates) });
    const payload = { success: true, data: toPublicUser(refreshed) } as const;
    assertNoSensitiveFields(payload);
    return res.status(200).json(payload);
  } catch (error) {
    console.error('❌ ADMIN_USER_UPDATE error:', error);
    const isCastErr = error instanceof mongoose.Error.CastError;
    const status = (error as any)?.statusCode || (isCastErr ? 400 : 500);
    return sendError(
      res,
      status,
      status === 400 ? 'BAD_REQUEST' : 'INTERNAL_ERROR',
      status === 400 ? '無効なリクエストです' : 'サーバーエラーが発生しました'
    );
  }
}
