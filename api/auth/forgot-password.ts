import type { VercelRequest, VercelResponse } from '@vercel/node';

// Request/Response型定義
interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
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
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-5d9q.vercel.app'];

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

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const origin = req.headers.origin;
    setCorsHeaders(res, origin);

    // プリフライトリクエストの処理
    if (req.method === 'OPTIONS') {
      console.log('[FORGOT-PASSWORD] Preflight request received');
      res.status(200).end();
      return;
    }

    // メソッドチェック
    if (req.method !== 'POST') {
      sendErrorResponse(res, 405, 'Method not allowed', 'POSTメソッドのみ許可されています');
      return;
    }

    console.log('[FORGOT-PASSWORD] Request received from origin:', origin);

    // リクエストボディの検証
    if (!req.body || typeof req.body !== 'object') {
      sendErrorResponse(res, 400, 'Invalid request body', 'リクエストボディが正しくありません');
      return;
    }

    const { email }: ForgotPasswordRequest = req.body;

    // メールアドレスの存在確認
    if (!email || typeof email !== 'string') {
      sendErrorResponse(res, 400, 'Email is required', 'メールアドレスは必須です');
      return;
    }

    // メールアドレスの形式検証
    if (!validateEmail(email)) {
      sendErrorResponse(res, 400, 'Invalid email format', 'メールアドレスの形式が正しくありません');
      return;
    }

    // 正規化
    const normalizedEmail = email.trim().toLowerCase();

    // デモ環境での処理
    console.log('[FORGOT-PASSWORD] Password reset requested for:', normalizedEmail);

    // 成功レスポンス
    const successResponse: ForgotPasswordResponse = {
      success: true,
      message: 'パスワードリセットのメールを送信しました（デモ環境のため実際には送信されません）',
      email: normalizedEmail,
    };

    res.status(200).json(successResponse);
  } catch (error) {
    console.error('[FORGOT-PASSWORD] Error:', error);

    sendErrorResponse(
      res,
      500,
      'Internal server error',
      'サーバーエラーが発生しました',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
