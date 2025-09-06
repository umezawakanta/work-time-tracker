const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Request/Response型定義

// バリデーション関数
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// CORS設定関数
const setCorsHeaders = (res, origin) => {
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
const sendErrorResponse = (res, status, error, message, details) => {
  const errorResponse = { error, message, details };
  res.status(status).json(errorResponse);
};

// パスワード忘れ処理
const handleForgotPassword = async (req, res) => {
  const { email } = req.body;

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

  try {
    // MongoDB接続とユーザー検索
    const mongoLib = await import('../_lib/mongo.js');
    await mongoLib.connectMongoDirect();
    const mongoose = await mongoLib.getMongoose();

    if (!mongoose) {
      throw new Error('MongoDB connection failed');
    }

    const User = mongoose.model(
      'User',
      new mongoose.Schema({
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        name: { type: String, required: true },
        role: { type: String, default: 'user' },
        isEmailVerified: { type: Boolean, default: false },
        passwordResetToken: String,
        passwordResetExpires: Date,
      })
    );

    // ユーザーが存在するかチェック
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // セキュリティのため、ユーザーが存在しない場合も成功レスポンスを返す
      const successResponse = {
        success: true,
        message: 'パスワードリセットメールの送信を受け付けました',
        email: normalizedEmail,
      };
      res.status(200).json(successResponse);
      return;
    }

    // パスワードリセットトークンを生成
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間後

    // ユーザーにトークンを保存
    await User.findByIdAndUpdate(user._id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // メール送信（Vercel環境では環境変数が設定されていない場合はスキップ）
    try {
      const emailService = await import('../../src/server/services/emailService.js');
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://work-time-tracker-five.vercel.app'}/reset-password?token=${resetToken}`;

      const emailSent = await emailService.emailService.sendPasswordResetEmail(
        normalizedEmail,
        resetUrl
      );
      if (!emailSent) {
        console.warn('[PASSWORD-RESET] Failed to send email, but continuing with success response');
      }
    } catch (emailError) {
      console.warn('[PASSWORD-RESET] Email service not available:', emailError);
      // メール送信に失敗しても処理は続行
    }

    const successResponse = {
      success: true,
      message: 'パスワードリセットメールを送信しました',
      email: normalizedEmail,
    };

    res.status(200).json(successResponse);
  } catch (error) {
    console.error('[PASSWORD-RESET] Forgot password error:', error);
    console.error(
      '[PASSWORD-RESET] Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    );
    sendErrorResponse(res, 500, 'Internal server error', 'サーバーエラーが発生しました');
  }
};

// パスワードリセット処理
const handleResetPassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (!token || !password || !confirmPassword) {
    sendErrorResponse(res, 400, 'All fields are required', 'すべてのフィールドは必須です');
    return;
  }

  if (password !== confirmPassword) {
    sendErrorResponse(res, 400, 'Passwords do not match', 'パスワードが一致しません');
    return;
  }

  if (password.length < 8) {
    sendErrorResponse(res, 400, 'Password too short', 'パスワードは8文字以上である必要があります');
    return;
  }

  console.log('[PASSWORD-RESET] Password reset requested for token:', token);

  try {
    // MongoDB接続
    const mongoLib = await import('../_lib/mongo.js');
    await mongoLib.connectMongoDirect();
    const mongoose = await mongoLib.getMongoose();

    if (!mongoose) {
      throw new Error('MongoDB connection failed');
    }

    const User = mongoose.model(
      'User',
      new mongoose.Schema({
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        name: { type: String, required: true },
        role: { type: String, default: 'user' },
        isEmailVerified: { type: Boolean, default: false },
        passwordResetToken: String,
        passwordResetExpires: Date,
      })
    );

    // トークンでユーザーを検索
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      sendErrorResponse(res, 400, 'Invalid or expired token', '無効または期限切れのトークンです');
      return;
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);

    // ユーザーのパスワードを更新し、リセットトークンをクリア
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    const successResponse = {
      success: true,
      message: 'パスワードが正常にリセットされました',
    };

    res.status(200).json(successResponse);
  } catch (error) {
    console.error('[PASSWORD-RESET] Reset password error:', error);
    console.error(
      '[PASSWORD-RESET] Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    );
    sendErrorResponse(res, 500, 'Internal server error', 'サーバーエラーが発生しました');
  }
};

async function handler(req, res) {
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
    console.error('[PASSWORD-RESET] Handler error:', error);
    console.error(
      '[PASSWORD-RESET] Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    );

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
