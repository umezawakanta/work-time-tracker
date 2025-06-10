import type { VercelRequest, VercelResponse } from '@vercel/node';

// レスポンス型の定義
interface AuthUser {
  id: string;
  _id: string;
  name: string;
  username: string;
  email: string;
  isAdmin: boolean;
  avatar: string;
}

interface AuthSuccessResponse {
  isAuthenticated: true;
  message: string;
  timestamp: string;
  user: AuthUser;
  tokenType: 'demo' | 'auth';
}

interface AuthErrorResponse {
  isAuthenticated: false;
  error: string;
  message: string;
  details?: string;
}

// 環境変数から許可されたオリジンを取得
const getAllowedOrigins = (): string[] => {
  const baseOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

  const prodOrigin = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://work-time-tracker-5d9q.vercel.app';

  return [...baseOrigins, prodOrigin];
};

// CORS設定の関数化
const setCorsHeaders = (res: VercelResponse, origin: string | undefined): void => {
  const allowedOrigins = getAllowedOrigins();

  // Vercelプレビューデプロイメントの許可
  const isVercelPreview =
    origin && origin.match(/^https:\/\/work-time-tracker-5d9q-.*\.vercel\.app$/);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isVercelPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
};

// トークン検証の関数化
const validateToken = (token: string): { isValid: boolean; error?: string } => {
  // トークン形式の検証
  if (!token.startsWith('auth_token_') && !token.startsWith('demo_token_')) {
    return {
      isValid: false,
      error: 'Invalid token format',
    };
  }

  // 長さの検証
  if (token.length < 20) {
    return {
      isValid: false,
      error: 'Invalid token length',
    };
  }

  // 基本的な構造チェック
  const tokenParts = token.split('_');
  if (tokenParts.length < 3) {
    return {
      isValid: false,
      error: 'Invalid token structure',
    };
  }

  return { isValid: true };
};

// ユーザー情報生成の関数化
const generateUserInfo = (token: string): AuthUser => {
  const isOldToken = token.startsWith('demo_token_');

  return {
    id: isOldToken ? 'demo_user' : 'auth_user',
    _id: isOldToken ? 'demo_user' : 'auth_user',
    name: 'Authenticated User',
    username: 'user',
    email: 'user@example.com',
    isAdmin: false,
    avatar: '',
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const origin = req.headers.origin;

    // CORS設定
    setCorsHeaders(res, origin);

    // プリフライトリクエストの処理
    if (req.method === 'OPTIONS') {
      console.log('*** AUTH CHECK PREFLIGHT REQUEST ***');
      res.status(200).end();
      return;
    }

    // HTTPメソッドの検証
    if (req.method !== 'GET') {
      res.status(405).json({
        isAuthenticated: false,
        error: 'Method not allowed',
        message: 'このメソッドは許可されていません',
      });
      return;
    }

    console.log('*** AUTH CHECK ENDPOINT HIT ***');
    console.log('Origin:', origin);

    // Authorizationヘッダーの検証
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header');
      res.status(401).json({
        isAuthenticated: false,
        error: 'No valid authorization header',
        message: '認証ヘッダーが見つかりません',
      });
      return;
    }

    // トークンの抽出と検証
    const token = authHeader.replace('Bearer ', '').trim();
    console.log('Token received:', token.substring(0, 20) + '...');

    const validation = validateToken(token);
    if (!validation.isValid) {
      console.log('❌ Token validation failed:', validation.error);
      res.status(401).json({
        isAuthenticated: false,
        error: validation.error!,
        message: 'トークンが無効です',
      });
      return;
    }

    console.log('✅ Token validation successful');

    // ユーザー情報の生成（実際のアプリではDBから取得）
    const user = generateUserInfo(token);
    const tokenType = token.startsWith('demo_token_') ? 'demo' : 'auth';

    res.status(200).json({
      isAuthenticated: true,
      message: '認証確認が成功しました',
      timestamp: new Date().toISOString(),
      user,
      tokenType,
    });
  } catch (error) {
    console.error('❌ Auth check error:', error);
    res.status(500).json({
      isAuthenticated: false,
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
