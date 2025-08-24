// ログレベル定義（更新版）
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// 環境に応じたログレベル設定
const getLogLevel = (): LogLevel => {
  if (process.env.NODE_ENV === 'production') return LogLevel.ERROR;
  return LogLevel.WARN; // DEBUGからWARNに変更（冗長ログを抑制）
};

const currentLogLevel = getLogLevel();

// ログフィルター（不要なログを除外）
const shouldLog = (category: string, message: string): boolean => {
  // WebSocketの頻繁なログを抑制
  if (
    category === 'WebSocket' &&
    (message.includes('Attempting connection') || message.includes('Connection closed'))
  ) {
    return false;
  }

  // API重複ログを抑制
  if (category === 'API' && message.includes('/auth/')) {
    return false;
  }

  return true;
};

// ログ出力関数
export const logger = {
  error: (category: string, message: string, data?: any) => {
    if (currentLogLevel >= LogLevel.ERROR && shouldLog(category, message)) {
      console.error(`❌ [${category}] ${message}`, data || '');
    }
  },

  warn: (category: string, message: string, data?: any) => {
    if (currentLogLevel >= LogLevel.WARN && shouldLog(category, message)) {
      console.warn(`⚠️ [${category}] ${message}`, data || '');
    }
  },

  info: (category: string, message: string, data?: any) => {
    if (currentLogLevel >= LogLevel.INFO && shouldLog(category, message)) {
      console.log(`ℹ️ [${category}] ${message}`, data || '');
    }
  },

  debug: (category: string, message: string, data?: any) => {
    if (currentLogLevel >= LogLevel.DEBUG && shouldLog(category, message)) {
      console.log(`🔍 [${category}] ${message}`, data || '');
    }
  },

  // ブログ投稿専用ログ（重要なもののみ）
  blogPost: {
    start: (data: any) => logger.info('BlogPost', '📝 投稿開始', data),
    success: (postId: string) => logger.info('BlogPost', `✅ 投稿成功: ${postId}`),
    error: (error: any) => logger.error('BlogPost', '❌ 投稿失敗', error),
    redirect: (path: string) => logger.info('BlogPost', `🔄 リダイレクト: ${path}`),
  },
};
