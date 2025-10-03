import bcryptjs from 'bcryptjs';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { mongoose as mongooseLib, jwt as jwtLib, ensureDatabaseConnection, User as UserDB } from '../utils/database.js';
import dotenv from 'dotenv';
import { 
  createValidationError, 
  createResourceError, 
  createServerError,
  validateEmail,
  validatePassword,
  validateDisplayName,
  sendErrorResponse 
} from '../utils/errorHandler.js';

dotenv.config();

// Database connection utility is now imported from database.ts


// User model is now imported from database utility

/**
 * Register request interface
 * @typedef {Object} RegisterRequest
 * @property {string} email - User email address
 * @property {string} password - User password
 * @property {string} displayName - User display name
 */

/**
 * Register response interface
 * @typedef {Object} RegisterResponse
 * @property {boolean} success - Whether the operation was successful
 * @property {string} message - Response message
 * @property {Object} [user] - User object if successful
 * @property {string} user.id - User ID
 * @property {string} user.email - User email
 * @property {string} user.displayName - User display name
 * @property {string} user.role - User role
 * @property {boolean} user.isVerified - Whether user is verified
 * @property {string} [error] - Error message if failed
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  const { origin } = req.headers;
  const allowedOrigins = ['http://localhost:9000', 'https://work-time-tracker-five.vercel.app'];

  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
    await ensureDatabaseConnection();
    
    const { email, password, displayName } = req.body;

    // 必須フィールドの検証
    if (!email || !password || !displayName) {
      return sendErrorResponse(res, 400, createValidationError(
        'メールアドレス、パスワード、表示名が必要です',
        'email/password/displayName',
        { email: !!email, password: !!password, displayName: !!displayName }
      ));
    }

    // メールアドレスの形式検証
    if (!validateEmail(email)) {
      return sendErrorResponse(res, 400, createValidationError(
        '有効なメールアドレスを入力してください',
        'email',
        email
      ));
    }

    // 表示名の検証
    const displayNameError = validateDisplayName(displayName);
    if (displayNameError) {
      return sendErrorResponse(res, 400, createValidationError(
        displayNameError,
        'displayName',
        displayName
      ));
    }

    // パスワードの検証
    const passwordErrors = validatePassword(password);
    if (passwordErrors) {
      return sendErrorResponse(res, 400, createValidationError(
        'パスワードの条件を満たしていません',
        'password',
        null
      ));
    }


    // 既存ユーザーのチェック
    const existingUser = await UserDB.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendErrorResponse(res, 409, createResourceError(
        'このメールアドレスは既に登録されています',
        'user',
        email
      ));
    }

    // パスワードのハッシュ化
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    // 新しいユーザーを作成
    const newUser = new UserDB({
      email: email.toLowerCase(),
      displayName: displayName.trim(),
      password: hashedPassword,
      role: 'user',
      isVerified: false,
      preferences: {},
      status: 'active',
    });

    await newUser.save();


    // レスポンスの構築（パスワードは除外）
    const response = {
      success: true,
      message: 'アカウントが正常に作成されました',
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
        isVerified: newUser.isVerified,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('❌ Registration error:', error);

    res.status(500).json({
      success: false,
      message: 'アカウント作成中にエラーが発生しました',
      error: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : String(error))
        : 'Internal server error',
    });
  }
}

