interface VercelRequest {
  method?: string;
  headers: Record<string, string | undefined>;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
}

async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && origin.match(/^https:\/\/work-time-tracker-5d9q-.*\.vercel\.app$/);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);
  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin && origin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-Id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      status: 405,
      code: 'METHOD_NOT_ALLOWED',
      message: '許可されていないメソッドです',
    });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, status: 401, code: 'UNAUTHORIZED', message: '認証が必要です' });
  }

  try {
    type JwtLike = {
      verify: (
        token: string,
        secret: string,
        options?: { issuer?: string; audience?: string }
      ) => unknown;
    };
    const jwtMod = (await import('jsonwebtoken')) as unknown as { default?: JwtLike } & JwtLike;
    const jwt: JwtLike = jwtMod.default ?? (jwtMod as JwtLike);
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    const decoded = jwt.verify(token, jwtSecret, {
      issuer: 'work-time-tracker',
      audience: 'work-time-tracker-users',
    }) as unknown;
    const decodedObj = decoded as Record<string, unknown>;
    const roles = Array.isArray(decodedObj.roles) ? (decodedObj.roles as string[]) : undefined;
    const roleStr = String(decodedObj.role ?? '');
    const isAdmin =
      decodedObj.isAdmin === true ||
      roleStr === 'admin' ||
      (roles ? roles.includes('admin') : false);

    return res.status(200).json({
      success: true,
      user: {
        userId: String(decodedObj.userId ?? ''),
        email: String(decodedObj.email ?? ''),
        role: roleStr,
        roles,
        isAdmin,
        isVerified: decodedObj.isVerified === true,
      },
    });
  } catch (e) {
    return res.status(401).json({
      success: false,
      status: 401,
      code: 'UNAUTHORIZED',
      message: '無効な認証トークンです',
    });
  }
}

module.exports = handler;
