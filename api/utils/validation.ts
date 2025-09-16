// 共通バリデーション関数

// パスワード検証
export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return {
    isValid: passwordRegex.test(password),
    message: 'パスワードは8文字以上で、大文字、小文字、数字を含む必要があります'
  };
};

// メールアドレス検証
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    message: '有効なメールアドレスを入力してください'
  };
};

// 表示名検証
export const validateDisplayName = (displayName) => {
  const trimmed = displayName && displayName.trim();
  return {
    isValid: trimmed && trimmed.length >= 2 && trimmed.length <= 50,
    message: '表示名は2文字以上50文字以下で入力してください'
  };
};

// CORS設定の共通関数
export const setupCORS = (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'https://work-time-tracker-five.vercel.app'
  ];
  
  // セキュアな正規表現パターン（サブドメイン部分のみマッチ）
  const isPreview = origin && 
    /^https:\/\/work-time-tracker-five-[a-z0-9-]+\.vercel\.app$/.test(origin);
  
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);
  
  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');
  
  return { origin, isAllowedOrigin };
};
