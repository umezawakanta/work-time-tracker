/**
 * バリデーション用ユーティリティ関数
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * メールアドレスのバリデーション
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, error: 'メールアドレスを入力してください' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: '正しいメールアドレスを入力してください' };
  }

  if (email.length > 254) {
    return { isValid: false, error: 'メールアドレスが長すぎます' };
  }

  return { isValid: true };
};

/**
 * パスワードのバリデーション
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'パスワードを入力してください' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'パスワードは8文字以上で入力してください' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'パスワードは128文字以内で入力してください' };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, error: '小文字を含める必要があります' };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, error: '大文字を含める必要があります' };
  }

  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, error: '数字を含める必要があります' };
  }

  return { isValid: true };
};

/**
 * 名前のバリデーション
 */
export const validateName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, error: '名前を入力してください' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: '名前は2文字以上で入力してください' };
  }

  if (name.trim().length > 50) {
    return { isValid: false, error: '名前は50文字以内で入力してください' };
  }

  return { isValid: true };
};

/**
 * パスワード強度の計算
 */
export interface PasswordStrength {
  score: number;
  message: string;
  color: string;
}

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (password.length === 0) {
    return { score: 0, message: '', color: 'bg-gray-200' };
  }

  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  score = Object.values(checks).filter(Boolean).length;

  if (score <= 2) {
    return { score: score * 20, message: '弱い', color: 'bg-red-500' };
  } else if (score <= 3) {
    return { score: score * 20, message: '普通', color: 'bg-yellow-500' };
  } else if (score <= 4) {
    return { score: score * 20, message: '強い', color: 'bg-blue-500' };
  } else {
    return { score: 100, message: '非常に強い', color: 'bg-green-500' };
  }
};

/**
 * 一般的な危険なパスワードのチェック
 */
export const isCommonPassword = (password: string): boolean => {
  const commonPasswords = [
    'password',
    '123456',
    '123456789',
    'qwerty',
    'abc123',
    'password123',
    'admin',
    'letmein',
    'welcome',
    'monkey',
  ];

  return commonPasswords.includes(password.toLowerCase());
};
