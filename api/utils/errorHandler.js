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
  const sensitiveFields = [
    'password', 'token', 'apiKey', 'secret', 'creditCard', 'email', 
    'hashedPassword', 'passwordHash', 'accessToken', 'refreshToken',
    'authorization', 'auth', 'credential', 'key', 'private', 'sensitive'
  ];
  
  if (typeof errorData !== 'object' || errorData === null) {
    return errorData;
  }
  
  const sanitized = { ...errorData };
  
  // 機密フィールドをマスク
  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
    
    // 値が文字列で機密情報を含む可能性がある場合もマスク
    if (typeof sanitized[key] === 'string' && sanitized[key].length > 0) {
      const value = sanitized[key].toLowerCase();
      if (sensitiveFields.some(field => value.includes(field))) {
        sanitized[key] = '[REDACTED]';
      }
    }
  });
  
  return sanitized;
};

// 安全なデバッグログ関数（開発環境でのみ使用）
const safeDebugLog = (message, data = null) => {
  if (process.env.NODE_ENV === 'development' && process.env.DEBUG_LOGGING === 'true') {
    if (data) {
      const sanitizedData = sanitizeErrorData(data);
      console.log(`[DEBUG] ${message}:`, sanitizedData);
    } else {
      console.log(`[DEBUG] ${message}`);
    }
  }
};

// エラーレスポンスを送信
const sendErrorResponse = (res, statusCode, errorData) => {
  // バリデーションエラーの場合は機密情報をログに出力しない
  if (errorData?.error === 'VALIDATION_ERROR') {
    console.error(`API Error [${statusCode}]: VALIDATION_ERROR (${errorData.field || 'unknown field'})`);
    safeDebugLog('Validation error details', errorData);
  } else if (errorData?.error === 'AUTH_ERROR' || errorData?.error === 'PERMISSION_ERROR') {
    // 認証・権限エラーも機密情報を含む可能性があるため詳細を制限
    console.error(`API Error [${statusCode}]: ${errorData.error}`);
    safeDebugLog('Auth/Permission error details', errorData);
  } else {
    // その他のエラーも機密情報を含む可能性があるため、エラータイプのみログ出力
    console.error(`API Error [${statusCode}]: ${errorData?.error || 'UNKNOWN_ERROR'}`);
    safeDebugLog('Server error details', errorData);
  }
  
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
  sendErrorResponse,
  safeDebugLog
};
