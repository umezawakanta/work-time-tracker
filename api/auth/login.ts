import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { jwt, ensureDatabaseConnection as initDB, User as UserModel } from '../utils/database.js';
import { 
  createValidationError, 
  createAuthError, 
  createServerError,
  validateEmail,
  sendErrorResponse 
} from '../utils/errorHandler.js';

import dotenv from 'dotenv';
dotenv.config();



// Robust JSON reader for Vercel Node (handles object, string, or raw stream)
async function readJson(req: VercelRequest) {
  try {
    const existingBody = req.body;
    if (existingBody !== undefined) {
      return typeof existingBody === 'string' ? JSON.parse(existingBody) : existingBody;
    }
    const raw = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', (chunk) => {
        data += chunk.toString('utf8');
      });
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
    return raw && (raw as string).trim() ? JSON.parse(raw as string) : null;
  } catch {
    throw Object.assign(new Error('Invalid JSON'), { statusCode: 400 } as any);
  }
}

async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  const { origin } = req.headers;
  const allowedOrigins = ['http://localhost:9000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-[a-z0-9-]+\.vercel\.app$/.test(origin);
  
  // 明示的に"null"オリジンをブロックし、認証情報の漏洩を防ぐ
  const isAllowedOrigin = origin
    && origin !== "null"
    && origin !== null
    && origin !== undefined
    && origin.length > 0
    && (allowedOrigins.includes(origin) || isPreview);

  // 認証情報を含むリクエストの場合は厳格なオリジンチェック
  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    // 認証情報は送信しない（セキュリティのため）
  } else {
    // 許可されていないオリジンの場合はCORSヘッダーを設定しない
    // これにより、ブラウザはCORSエラーを返す
    // 認証情報の漏洩を完全に防止
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
    return;
  }

  try {

    // Ensure database connection is established
    await initDB();

    // Read JSON body safely across environments
    const body = await readJson(req);
    const {
      email,
      password,
      rememberMe = false,
    } = {
      email: body && body.email,
      password: body && body.password,
      rememberMe: Boolean(body && body.rememberMe),
    };

    // 必須フィールドの検証
    if (!email || !password) {
      return sendErrorResponse(res, 400, createValidationError(
        'メールアドレスとパスワードが必要です',
        null,
        null
      ));
    }

    // メールアドレスの形式検証
    if (!validateEmail(email)) {
      return sendErrorResponse(res, 400, createValidationError(
        '有効なメールアドレスを入力してください',
        null,
        null
      ));
    }

    // ユーザーの検索
    const emailLc = (email || '').toLowerCase();
    
    const user = await (UserModel as any).findOne({ email: emailLc });

    if (!user) {
      return sendErrorResponse(res, 401, createAuthError(
        'メールアドレスまたはパスワードが正しくありません',
        'INVALID_CREDENTIALS'
      ));
    }

    // パスワードの確認
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendErrorResponse(res, 401, createAuthError(
        'メールアドレスまたはパスワードが正しくありません',
        'INVALID_CREDENTIALS'
      ));
    }

    // アカウント状態の確認
    if (user.status === 'suspended') {
      return sendErrorResponse(res, 403, createAuthError(
        'アカウントが停止されています。管理者にお問い合わせください',
        'ACCOUNT_SUSPENDED'
      ));
    }

    if (user.status === 'inactive') {
      return sendErrorResponse(res, 403, createAuthError(
        'アカウントが無効です。アカウントを有効化してください',
        'ACCOUNT_INACTIVE'
      ));
    }

    // JWTトークンの生成（管理者クレームを付与）
    const jwtSecret = process.env['JWT_SECRET'] || 'fallback-secret-for-development';
    const tokenExpiry = rememberMe ? '30d' : '7d';
    const adminEmails = (process.env['ADMIN_EMAILS'] || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const userEmailLc = String(user.email || '').toLowerCase();
    const existingRoles = Array.isArray(user.roles)
      ? user.roles
      : [];
    const computedIsAdmin =
      user.isAdmin === true ||
      String(user.role || '').toLowerCase() === 'admin' ||
      existingRoles.includes('admin') ||
      adminEmails.includes(userEmailLc);
    const roleClaim = computedIsAdmin ? 'admin' : user.role || 'user';
    const rolesClaim = computedIsAdmin
      ? Array.from(new Set([...existingRoles, 'admin']))
      : existingRoles;

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        role: roleClaim,
        roles: rolesClaim,
        isAdmin: computedIsAdmin,
      },
      jwtSecret,
      {
        expiresIn: tokenExpiry,
        issuer: 'work-time-tracker',
        audience: 'work-time-tracker-users',
      }
    );

    // レスポンスの構築
    const response = {
      success: true,
      message: 'ログインに成功しました',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: roleClaim,
        isVerified: user.isVerified,
        avatar: user.avatar,
        preferences: user.preferences,
      },
      token: token,
    };

    // Issue httpOnly cookie for cookie-based auth (in addition to returning token)
    try {
      res.setHeader(
        'Set-Cookie',
        serialize('access_token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
      );
    } catch (e) {
      console.warn('⚠️ Failed to set auth cookie:', e);
    }


    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Login error:', error);
    return sendErrorResponse(res, 500, createServerError(
      'ログイン処理中にエラーが発生しました',
      null
    ));
  }
}

export default handler;