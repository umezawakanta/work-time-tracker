import type { VercelRequest, VercelResponse } from '@vercel/node';

// Request/Response型定義
interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

interface PasswordResetResponse {
  success: boolean;
  message: string;
  email?: string;
}

interface ErrorResponse {
  error: string;
  message: string;
  details?: string;
}

// バリデーション関数
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// CORS設定関数
const setCorsHeaders = (res: VercelResponse, origin: string | undefined): void => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://work-time-tracker-five.vercel.app',
  ];

  const isVercelPreview = origin?.match(/^https:\/\/work-time-tracker-5d9q-.*\.vercel\.app$/);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isVercelPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // セキュリティヘッダー追加
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
};

// エラーレスポンス関数
const sendErrorResponse = (
  res: VercelResponse,
  status: number,
  error: string,
  message: string,
  details?: string
): void => {
  const errorResponse: ErrorResponse = { error, message, details };
  res.status(status).json(errorResponse);
};

// パスワード忘れ処理
const handleForgotPassword = async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  const { email }: ForgotPasswordRequest = req.body;

  if (!email || typeof email !== 'string') {
    sendErrorResponse(res, 400, 'Email is required', 'メールアドレスは必須です');
    return;
  }

  if (!validateEmail(email)) {
    sendErrorResponse(res, 400, 'Invalid email format', 'メールアドレスの形式が正しくありません');
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  console.log('[PASSWORD-RESET] Forgot password requested for:', normalizedEmail);

  const successResponse: PasswordResetResponse = {
    success: true,
    message: 'パスワードリセットメールの送信を受け付けました',
    email: normalizedEmail,
  };

  // 実際の送信処理はバックエンド/キューに委譲する前提で 202 を返す
  res.status(202).json(successResponse);
};

// パスワードリセット処理
const handleResetPassword = async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  const { token, password, confirmPassword }: ResetPasswordRequest = req.body;

  if (!token || !password || !confirmPassword) {
    sendErrorResponse(res, 400, 'All fields are required', 'すべてのフィールドは必須です');
    return;
  }

  if (password !== confirmPassword) {
    sendErrorResponse(res, 400, 'Passwords do not match', 'パスワードが一致しません');
    return;
  }

  if (password.length < 3) {
    sendErrorResponse(res, 400, 'Password too short', 'パスワードは3文字以上である必要があります');
    return;
  }

  console.log('[PASSWORD-RESET] Password reset requested for token:', token);

  // 実装未完了のため明示的に未実装を返す（モック返却を廃止）
  sendErrorResponse(res, 501, 'Not implemented', 'パスワードリセットは現在未実装です');
  return;
};

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const origin = req.headers.origin;
    setCorsHeaders(res, origin);

    // プリフライトリクエストの処理
    if (req.method === 'OPTIONS') {
      console.log('[PASSWORD-RESET] Preflight request received');
      res.status(200).end();
      return;
    }

    // メソッドチェック
    if (req.method !== 'POST') {
      sendErrorResponse(res, 405, 'Method not allowed', 'POSTメソッドのみ許可されています');
      return;
    }

    console.log('[PASSWORD-RESET] Request received from origin:', origin);

    // リクエストボディの検証
    if (!req.body || typeof req.body !== 'object') {
      sendErrorResponse(res, 400, 'Invalid request body', 'リクエストボディが正しくありません');
      return;
    }

    // actionパラメータで処理を分岐
    const { action } = req.body;

    switch (action) {
      case 'forgot':
        await handleForgotPassword(req, res);
        break;
      case 'reset':
        await handleResetPassword(req, res);
        break;
      default:
        sendErrorResponse(
          res,
          400,
          'Invalid action',
          'actionパラメータが必要です (forgot または reset)'
        );
        break;
    }
  } catch (error) {
    console.error('[PASSWORD-RESET] Error:', error);

    sendErrorResponse(
      res,
      500,
      'Internal server error',
      'サーバーエラーが発生しました',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

module.exports = handler;
