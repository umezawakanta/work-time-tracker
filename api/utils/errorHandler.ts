// 共通エラーハンドリング関数

// 型定義
interface ValidationError {
  success: false;
  error: 'VALIDATION_ERROR';
  message: string;
  field: string | null;
  value: any;
  timestamp: string;
}

interface AuthError {
  success: false;
  error: string;
  message: string;
  timestamp: string;
}

interface PermissionError {
  success: false;
  error: 'PERMISSION_ERROR';
  message: string;
  requiredRole: string | null;
  timestamp: string;
}

interface ResourceError {
  success: false;
  error: 'RESOURCE_ERROR';
  message: string;
  resourceType: string | null;
  resourceId: string | null;
  timestamp: string;
}

interface ServerError {
  success: false;
  error: 'SERVER_ERROR';
  message: string;
  originalError: any;
  timestamp: string;
}

// バリデーションエラー
const createValidationError = (message: string, field: string | null = null, value: any = null): ValidationError => ({
  success: false,
  error: 'VALIDATION_ERROR',
  message,
  field,
  value,
  timestamp: new Date().toISOString()
});

// 認証エラー
const createAuthError = (message: string, code: string = 'AUTH_ERROR'): AuthError => ({
  success: false,
  error: code,
  message,
  timestamp: new Date().toISOString()
});

// 権限エラー
const createPermissionError = (message: string, requiredRole: string | null = null): PermissionError => ({
  success: false,
  error: 'PERMISSION_ERROR',
  message,
  requiredRole,
  timestamp: new Date().toISOString()
});

// リソースエラー
const createResourceError = (message: string, resourceType: string | null = null, resourceId: string | null = null): ResourceError => ({
  success: false,
  error: 'RESOURCE_ERROR',
  message,
  resourceType,
  resourceId,
  timestamp: new Date().toISOString()
});

// サーバーエラー
const createServerError = (message: string, originalError: any = null): ServerError => ({
  success: false,
  error: 'SERVER_ERROR',
  message,
  originalError: process.env.NODE_ENV === 'development' ? originalError : null,
  timestamp: new Date().toISOString()
});

// リクエストボディのバリデーション
const validateRequestBody = (body: any, requiredFields: string[]): any[] | null => {
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
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// パスワードのバリデーション
const validatePassword = (password: string): string[] | null => {
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
const validateDisplayName = (displayName: string): string | null => {
  if (!displayName || displayName.trim().length < 2) {
    return 'Display name must be at least 2 characters long';
  }
  if (displayName.trim().length > 50) {
    return 'Display name must be less than 50 characters';
  }
  return null;
};

// 機密情報をサニタイズする関数
const sanitizeErrorData = (errorData: any): any => {
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
const safeDebugLog = (message: string, data: any = null): void => {
  if (process.env.NODE_ENV === 'development' && process.env.DEBUG_LOGGING === 'true') {
    if (data) {
      // Debug logging removed for production
    } else {
      // Debug logging removed for production
    }
  }
};

// エラーレスポンスを送信
const sendErrorResponse = (res: any, statusCode: number, errorData: any): any => {
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

export {
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
