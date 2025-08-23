import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

type DecodedToken = {
  userId?: string;
  email?: string;
  role?: string;
  roles?: string[];
  isAdmin?: boolean;
  isVerified?: boolean;
  iss?: string;
  aud?: string;
  iat?: number;
  exp?: number;
};

export interface AuthContext {
  userId: string | null;
  email: string | null;
  role: string | null;
  roles: string[];
  isAdmin: boolean;
}

function parseAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function getTokenFromRequest(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  const cookieHeader = req.headers.cookie || '';
  if (cookieHeader) {
    const parts = cookieHeader.split(';').map((p) => p.trim());
    for (const p of parts) {
      if (p.startsWith('access_token=')) {
        return decodeURIComponent(p.substring('access_token='.length));
      }
    }
  }
  return null;
}

export function getAuthContext(req: VercelRequest): AuthContext {
  const adminEmails = parseAdminEmails();
  const token = getTokenFromRequest(req);

  if (token) {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';
      const decoded = jwt.verify(token, jwtSecret, {
        issuer: 'work-time-tracker',
        audience: 'work-time-tracker-users',
      }) as DecodedToken;

      const roles = Array.isArray(decoded.roles) ? decoded.roles : [];
      const emailLc = (decoded.email || '').toLowerCase();
      const isAdmin =
        decoded.isAdmin === true ||
        (decoded.role || '').toLowerCase() === 'admin' ||
        roles.includes('admin') ||
        adminEmails.includes(emailLc);

      return {
        userId: decoded.userId || null,
        email: decoded.email || null,
        role: decoded.role || null,
        roles,
        isAdmin,
      };
    } catch {
      // fall through to dev headers
    }
  }

  // Dev/test fallback via headers
  const devUserId = (req.headers['x-user-id'] as string) || null;
  const devRole = (req.headers['x-user-role'] as string) || null;
  const isAdmin = devRole === 'admin';
  return {
    userId: devUserId,
    email: null,
    role: devRole,
    roles: devRole ? [devRole] : [],
    isAdmin,
  };
}

export function requireAdmin(req: VercelRequest, res: VercelResponse): AuthContext | null {
  const ctx = getAuthContext(req);
  if (!ctx.isAdmin) {
    res.status(403).json({
      success: false,
      status: 403,
      code: 'FORBIDDEN',
      message: '管理者権限が必要です',
    });
    return null;
  }
  return ctx;
}
