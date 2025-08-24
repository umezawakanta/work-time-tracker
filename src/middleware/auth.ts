import jwt from 'jsonwebtoken';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// JWT Payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  isVerified: boolean;
}

// Extended request interface with user data
export interface AuthenticatedRequest extends VercelRequest {
  user?: JWTPayload;
}

// Authentication middleware
export const authMiddleware = (
  req: AuthenticatedRequest,
  res: VercelResponse,
  next?: () => void
): Promise<void> | void => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      res.status(401).json({
        success: false,
        status: 401,
        code: 'UNAUTHORIZED',
        message: '認証トークンが必要です',
        error: 'No token provided',
      });
      return;
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';

    try {
      const decoded = jwt.verify(token, jwtSecret, {
        issuer: 'work-time-tracker',
        audience: 'work-time-tracker-users',
      }) as JWTPayload;

      // Attach user data to request
      req.user = decoded;

      // Call next middleware if provided (for Express-style middleware)
      if (next) {
        next();
      }
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);

      res.status(401).json({
        success: false,
        status: 401,
        code: 'UNAUTHORIZED',
        message: '無効な認証トークンです',
        error: 'Invalid token',
      });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);

    res.status(500).json({
      success: false,
      message: '認証処理中にエラーが発生しました',
      error: 'Authentication error',
    });
    return;
  }
};

// Role-based access control middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: VercelResponse, next?: () => void): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        status: 401,
        code: 'UNAUTHORIZED',
        message: '認証が必要です',
        error: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'この操作を実行する権限がありません',
        error: 'Insufficient permissions',
      });
      return;
    }

    if (next) {
      next();
    }
  };
};

// Admin-only middleware
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: VercelResponse,
  next?: () => void
): void => {
  return requireRole(['admin'])(req, res, next);
};

// Verified user middleware
export const requireVerified = (
  req: AuthenticatedRequest,
  res: VercelResponse,
  next?: () => void
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      status: 401,
      code: 'UNAUTHORIZED',
      message: '認証が必要です',
      error: 'Authentication required',
    });
    return;
  }

  if (!req.user.isVerified) {
    res.status(403).json({
      success: false,
      message: 'メールアドレスの認証が必要です',
      error: 'Email verification required',
    });
    return;
  }

  if (next) {
    next();
  }
};

// Helper function to extract user from request
export const getUserFromRequest = (req: AuthenticatedRequest): JWTPayload | null => {
  return req.user || null;
};

// Helper function to check if user has permission
export const hasPermission = (user: JWTPayload | null, requiredRole: string): boolean => {
  if (!user) return false;

  const roleHierarchy: Record<string, number> = {
    guest: 0,
    user: 1,
    manager: 2,
    admin: 3,
  };

  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
};

// Wrapper function for API routes with authentication
export const withAuth = (
  handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void> | void,
  options: {
    requireAuth?: boolean;
    requiredRole?: string;
    requireVerified?: boolean;
  } = {}
) => {
  return async (req: AuthenticatedRequest, res: VercelResponse): Promise<void> => {
    try {
      // Apply authentication if required
      if (options.requireAuth !== false) {
        await new Promise<void>((resolve, reject) => {
          authMiddleware(req, res, () => {
            if (res.headersSent) {
              reject(new Error('Authentication failed'));
            } else {
              resolve();
            }
          });
        });

        // Check if response was already sent (auth failed)
        if (res.headersSent) {
          return;
        }
      }

      // Apply role check if specified
      if (options.requiredRole) {
        if (!hasPermission(req.user || null, options.requiredRole)) {
          res.status(403).json({
            success: false,
            message: 'この操作を実行する権限がありません',
            error: 'Insufficient permissions',
          });
          return;
        }
      }

      // Apply verification check if required
      if (options.requireVerified && req.user && !req.user.isVerified) {
        res.status(403).json({
          success: false,
          message: 'メールアドレスの認証が必要です',
          error: 'Email verification required',
        });
        return;
      }

      // Call the actual handler
      await handler(req, res);
    } catch (error) {
      console.error('withAuth wrapper error:', error);

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'サーバーエラーが発生しました',
          error:
            process.env.NODE_ENV === 'development'
              ? error instanceof Error
                ? error.message
                : 'Unknown error'
              : 'Internal server error',
        });
      }
    }
  };
};

export default {
  authMiddleware,
  requireRole,
  requireAdmin,
  requireVerified,
  getUserFromRequest,
  hasPermission,
  withAuth,
};
