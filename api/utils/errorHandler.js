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

// 機密情報をサニタイズする関数
const sanitizeErrorData = (errorData) => {
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'creditCard', 'email', 'hashedPassword', 'passwordHash'];
  
  if (typeof errorData !== 'object' || errorData === null) {
    return errorData;
  }
  
  const sanitized = { ...errorData };
  
  // 機密フィールドをマスク
  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

// エラーレスポンスを送信
const sendErrorResponse = (res, statusCode, errorData) => {
  // ログ用のデータをサニタイズ
  const logData = {
    statusCode,
    error: errorData?.error || 'UNKNOWN_ERROR',
    field: errorData?.field,
    timestamp: new Date().toISOString(),
    // 詳細は開発環境でのみ、かつサニタイズ済み
    ...(process.env.NODE_ENV === 'development' && {
      details: sanitizeErrorData(errorData)
    })
  };
  
  // 機密情報を除外してログ出力
  console.error('API Error:', JSON.stringify(logData));
  
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
