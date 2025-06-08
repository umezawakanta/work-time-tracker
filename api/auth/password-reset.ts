import { VercelRequest, VercelResponse } from '@vercel/node';

interface PasswordResetRequest {
  email: string;
}

interface PasswordResetResponse {
  message: string;
  success: boolean;
}

interface VerifyTokenRequest {
  token: string;
}

interface ConfirmResetRequest {
  token: string;
  password: string;
}

// 簡易的なリセットトークンストレージ（デモ用）
const resetTokens = new Map<string, { email: string; expires: number }>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const url = new URL(req.url || '', 'https://example.com');
      const pathSegments = url.pathname.split('/');
      const action = pathSegments[pathSegments.length - 1];

      if (action === 'password-reset') {
        // パスワードリセットリクエスト
        const { email }: PasswordResetRequest = req.body;

        if (!email || !email.trim()) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'メールアドレスは必須です',
          });
        }

        // メールアドレスの形式チェック
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            error: 'Bad Request',
            message: '有効なメールアドレスを入力してください',
          });
        }

        // デモ環境での有効なメールアドレスチェック
        const validEmails = ['admin@example.com', 'demo@example.com', 'test@example.com'];

        const isValidEmail =
          validEmails.includes(email) || email.includes('demo') || email.includes('test');

        if (!isValidEmail) {
          return res.status(404).json({
            error: 'Not Found',
            message: 'このメールアドレスは登録されていません',
          });
        }

        // リセットトークンを生成
        const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const expires = Date.now() + 60 * 60 * 1000; // 1時間後に期限切れ

        resetTokens.set(resetToken, { email, expires });

        console.log('✅ パスワードリセットリクエスト:', {
          email,
          token: resetToken,
          expires: new Date(expires).toISOString(),
        });

        const response: PasswordResetResponse = {
          success: true,
          message: 'パスワードリセットのメールを送信しました',
        };

        return res.status(200).json(response);
      } else if (action === 'verify') {
        // リセットトークンの検証
        const { token }: VerifyTokenRequest = req.body;

        if (!token) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'トークンは必須です',
          });
        }

        const tokenData = resetTokens.get(token);

        if (!tokenData) {
          return res.status(404).json({
            error: 'Invalid Token',
            message: '無効なトークンです',
          });
        }

        if (Date.now() > tokenData.expires) {
          resetTokens.delete(token);
          return res.status(400).json({
            error: 'Token Expired',
            message: 'トークンの有効期限が切れています',
          });
        }

        return res.status(200).json({
          valid: true,
          message: 'トークンは有効です',
        });
      } else if (action === 'confirm') {
        // パスワードリセット確定
        const { token, password }: ConfirmResetRequest = req.body;

        if (!token || !password) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'トークンとパスワードは必須です',
          });
        }

        if (password.length < 6) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'パスワードは6文字以上である必要があります',
          });
        }

        const tokenData = resetTokens.get(token);

        if (!tokenData) {
          return res.status(404).json({
            error: 'Invalid Token',
            message: '無効なトークンです',
          });
        }

        if (Date.now() > tokenData.expires) {
          resetTokens.delete(token);
          return res.status(400).json({
            error: 'Token Expired',
            message: 'トークンの有効期限が切れています',
          });
        }

        // パスワード更新（デモ環境では実際の更新はスキップ）
        resetTokens.delete(token);

        console.log('✅ パスワードリセット完了:', {
          email: tokenData.email,
          timestamp: new Date().toISOString(),
        });

        return res.status(200).json({
          success: true,
          message: 'パスワードが正常に更新されました',
        });
      } else {
        return res.status(404).json({
          error: 'Not Found',
          message: '指定されたエンドポイントが見つかりません',
        });
      }
    } else {
      return res.status(405).json({
        error: 'Method Not Allowed',
        message: 'サポートされていないHTTPメソッドです',
      });
    }
  } catch (error) {
    console.error('❌ Password reset API error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'サーバーエラーが発生しました',
    });
  }
}
