import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { connectDB } from '../../../src/server/config/database';
import { User } from '../../../src/server/models/User';
import { cors } from '../../../lib/cors';
import { requireAdmin } from '../../../lib/authAdmin';
import { toPublicUser } from '../../../lib/publicUser';

type AllowedRole = 'user' | 'admin' | 'manager' | 'guest';
const ALLOWED_ROLES: AllowedRole[] = ['user', 'admin', 'manager', 'guest'];

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
    return res.status(405).json({
      success: false,
      status: 405,
      code: 'METHOD_NOT_ALLOWED',
      message: '許可されていないメソッドです',
    });
  }

  try {
    const id = String(req.query.id || '');
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        status: 400,
        code: 'BAD_REQUEST',
        message: '無効なユーザーIDです',
      });
    }

    await connectDB();

    const body = await readJson(req);
    const updates: Record<string, unknown> = {};

    // role
    if (Object.prototype.hasOwnProperty.call(body, 'role')) {
      const roleVal = String(body.role).toLowerCase();
      if (!ALLOWED_ROLES.includes(roleVal as AllowedRole)) {
        return res
          .status(400)
          .json({ success: false, status: 400, code: 'BAD_ROLE', message: '無効な役割です' });
      }
      updates.role = roleVal;
    }

    // roles (store under metadata.roles for compatibility)
    if (Object.prototype.hasOwnProperty.call(body, 'roles')) {
      const rolesInput = body.roles;
      if (!Array.isArray(rolesInput)) {
        return res
          .status(400)
          .json({
            success: false,
            status: 400,
            code: 'BAD_ROLES',
            message: 'roles は配列で指定してください',
          });
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
        return res
          .status(400)
          .json({
            success: false,
            status: 400,
            code: 'BAD_IS_ACTIVE',
            message: 'isActive は boolean で指定してください',
          });
      }
    }
    if (hasBlocked) {
      if (typeof body.blocked !== 'boolean') {
        return res
          .status(400)
          .json({
            success: false,
            status: 400,
            code: 'BAD_BLOCKED',
            message: 'blocked は boolean で指定してください',
          });
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
      return res.status(400).json({
        success: false,
        status: 400,
        code: 'NO_UPDATABLE_FIELDS',
        message: '更新可能なフィールドが含まれていません',
      });
    }

    await User.updateOne({ _id: id }, { $set: updates }, { runValidators: true });
    const refreshed = await User.findById(id).lean();
    if (!refreshed) {
      return res
        .status(404)
        .json({
          success: false,
          status: 404,
          code: 'NOT_FOUND',
          message: 'ユーザーが見つかりません',
        });
    }

    console.log('ADMIN_USER_UPDATE', { id, actor: ctx.userId, updates: Object.keys(updates) });
    return res.status(200).json({ success: true, data: toPublicUser(refreshed) });
  } catch (error) {
    console.error('❌ ADMIN_USER_UPDATE error:', error);
    const isCastErr = error instanceof mongoose.Error.CastError;
    const status = (error as any)?.statusCode || (isCastErr ? 400 : 500);
    return res.status(status).json({
      success: false,
      status,
      code: status === 400 ? 'BAD_REQUEST' : 'INTERNAL_ERROR',
      message: status === 400 ? '無効なリクエストです' : 'サーバーエラーが発生しました',
    });
  }
}
