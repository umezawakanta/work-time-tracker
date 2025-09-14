// 共通エラーハンドリング関数

// バリデーションエラー
const createValidationError = (message, field = null, value = null) => ({
  success: false,
  error: 'VALIDATION_ERROR',
  message,
  field,
  value,
  timestamp: new Date().toISOString()
});

// 認証エラー
const createAuthError = (message, code = 'AUTH_ERROR') => ({
  success: false,
  error: code,
  message,
  timestamp: new Date().toISOString()
});

// 権限エラー
const createPermissionError = (message, requiredRole = null) => ({
  success: false,
  error: 'PERMISSION_ERROR',
  message,
  requiredRole,
  timestamp: new Date().toISOString()
});

// リソースエラー
const createResourceError = (message, resourceType = null, resourceId = null) => ({
  success: false,
  error: 'RESOURCE_ERROR',
  message,
  resourceType,
  resourceId,
  timestamp: new Date().toISOString()
});

// サーバーエラー
const createServerError = (message, originalError = null) => ({
  success: false,
  error: 'SERVER_ERROR',
  message,
  originalError: process.env.NODE_ENV === 'development' ? originalError : null,
  timestamp: new Date().toISOString()
});

// リクエストボディのバリデーション
const validateRequestBody = (body, requiredFields) => {
  const errors = [];
  
  for (const field of requiredFields) {
    if (!body || body[field] === undefined || body[field] === null || body[field] === '') {
      errors.push({
        field,
        message: `${field} is required`,
        value: body ? body[field] : null
      });
    }
  }
  
  return errors.length > 0 ? errors : null;
};

// メールアドレスのバリデーション
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// パスワードのバリデーション
const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }
  
  return errors.length > 0 ? errors : null;
};

// 表示名のバリデーション
const validateDisplayName = (displayName) => {
  if (!displayName || displayName.trim().length < 2) {
    return 'Display name must be at least 2 characters long';
  }
  if (displayName.trim().length > 50) {
    return 'Display name must be less than 50 characters';
  }
  return null;
};

// エラーレスポンスを送信
const sendErrorResponse = (res, statusCode, errorData) => {
  console.error(`API Error [${statusCode}]:`, errorData);
  return res.status(statusCode).json(errorData);
};

module.exports = {
  createValidationError,
  createAuthError,
  createPermissionError,
  createResourceError,
  createServerError,
  validateRequestBody,
  validateEmail,
  validatePassword,
  validateDisplayName,
  sendErrorResponse
};
