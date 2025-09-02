interface VercelRequest {
  method?: string;
  headers: Record<string, string | undefined>;
  query: Record<string, unknown>;
  on: any;
}
interface VercelResponse {
  status: (c: number) => VercelResponse;
  json: (b: unknown) => void;
  setHeader: (n: string, v: string) => void;
  end: () => void;
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoLib = require('../../_lib/mongo');
const connectMongoDirect = mongoLib.connectMongoDirect as () => Promise<void>;

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

async function handler(req: VercelRequest, res: VercelResponse) {
  // Basic CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'PATCH' && req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' } as any);
  }

  let m: any = null;
  try {
    const id = String(req.query.id || '');
    // connect first to ensure mongoose is available
    await connectMongoDirect();
    const mod: any = await import('../../_lib/mongo.js');
    const ml = (mod as any).default || mod;
    m = ml.mongoose || (ml.getMongoose ? await ml.getMongoose() : null);

    if (!id || !m?.Types?.ObjectId?.isValid?.(id)) {
      return res.status(400).json({ success: false, message: '無効なユーザーIDです' } as any);
    }
    const userMod: any = await import('../../_schemas/user.js');
    const lib = (userMod as any).default || userMod;
    const ensureUserModel = (lib as any).ensureUserModel as () => Promise<any>;
    const User = await ensureUserModel();

    if (req.method === 'DELETE') {
      await User.updateOne(
        { _id: id },
        { $set: { status: 'suspended' } },
        { runValidators: false }
      );
      return res.status(200).json({ success: true } as any);
    }

    const body = await readJson(req);
    const updates: Record<string, unknown> = {};

    // role
    if (Object.prototype.hasOwnProperty.call(body, 'role')) {
      const roleVal = String(body.role).toLowerCase();
      if (!ALLOWED_ROLES.includes(roleVal as AllowedRole)) {
        return res.status(400).json({ success: false, message: '無効な役割です' } as any);
      }
      updates.role = roleVal;
    }

    // roles (store under metadata.roles for compatibility)
    if (Object.prototype.hasOwnProperty.call(body, 'roles')) {
      const rolesInput = body.roles;
      if (!Array.isArray(rolesInput)) {
        return res
          .status(400)
          .json({ success: false, message: 'roles は配列で指定してください' } as any);
      }
      const filtered = Array.from(
        new Set(
          rolesInput
            .map((r: unknown) => String(r).toLowerCase())
            .filter((r: string) => ALLOWED_ROLES.includes(r as AllowedRole))
        )
      );
      (updates as any)['metadata.roles'] = filtered;
      if (!Object.prototype.hasOwnProperty.call(body, 'role') && filtered.includes('admin')) {
        updates.role = 'admin';
      }
    }

    // isActive / blocked → status mapping
    const hasIsActive = Object.prototype.hasOwnProperty.call(body, 'isActive');
    const hasBlocked = Object.prototype.hasOwnProperty.call(body, 'blocked');
    if (hasIsActive && typeof body.isActive !== 'boolean') {
      return res
        .status(400)
        .json({ success: false, message: 'isActive は boolean で指定してください' } as any);
    }
    if (hasBlocked && typeof body.blocked !== 'boolean') {
      return res
        .status(400)
        .json({ success: false, message: 'blocked は boolean で指定してください' } as any);
    }
    if (hasIsActive || hasBlocked) {
      let statusToSet: 'active' | 'inactive' | 'suspended' | undefined;
      if (body.blocked === true) statusToSet = 'suspended';
      else if (body.isActive === true) statusToSet = 'active';
      else if (body.isActive === false) statusToSet = 'inactive';
      if (statusToSet) (updates as any).status = statusToSet;
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: '更新可能なフィールドが含まれていません' } as any);
    }

    await User.updateOne({ _id: id }, { $set: updates }, { runValidators: true });
    const refreshed = await User.findById(id).lean();
    if (!refreshed) {
      return res.status(404).json({ success: false, message: 'ユーザーが見つかりません' } as any);
    }

    const toPublic = (u: any) => ({
      _id: String(u._id),
      email: String(u.email || ''),
      name: String(u.displayName || u.username || u.name || ''),
      role: String(u.role || 'user'),
      blocked: Boolean(u.blocked) || String(u.status || '') === 'suspended',
      isActive: Boolean(u.isActive) || String(u.status || '') === 'active',
      lastLoginAt: u.lastLoginAt || u.metadata?.lastLoginAt || null,
    });

    return res.status(200).json({ success: true, data: toPublic(refreshed) } as const);
  } catch (error) {
    console.error('❌ ADMIN_USER_UPDATE error:', error);
    const isCastErr = m?.Error ? error instanceof m.Error.CastError : false;
    const status = (error as any)?.statusCode || (isCastErr ? 400 : 500);
    return res.status(status).json({
      success: false,
      message: status === 400 ? '無効なリクエストです' : 'サーバーエラーが発生しました',
    } as any);
  }
}

module.exports = handler;
