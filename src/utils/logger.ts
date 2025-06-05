// ログレベル定義
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// 環境に応じたログレベル設定
const getLogLevel = (): LogLevel => {
  if (process.env.NODE_ENV === 'production') return LogLevel.ERROR;
  if (process.env.NODE_ENV === 'test') return LogLevel.WARN;
  return LogLevel.DEBUG;
};

const currentLogLevel = getLogLevel();

// ログ出力関数
export const logger = {
  error: (category: string, message: string, data?: any) => {
    if (currentLogLevel >= LogLevel.ERROR) {
      console.error(`❌ [${category}] ${message}`, data || '');
    }
  },

  warn: (category: string, message: string, data?: any) => {
    if (currentLogLevel >= LogLevel.WARN) {
      console.warn(`⚠️ [${category}] ${message}`, data || '');
    }
  },

  info: (category: string, message: string, data?: any) => {
    if (currentLogLevel >= LogLevel.INFO) {
      console.log(`ℹ️ [${category}] ${message}`, data || '');
    }
  },

  debug: (category: string, message: string, data?: any) => {
    if (currentLogLevel >= LogLevel.DEBUG) {
      console.log(`🔍 [${category}] ${message}`, data || '');
    }
  },

  // ブログ投稿専用ログ
  blogPost: {
    start: (data: any) => logger.info('BlogPost', '投稿開始', data),
    success: (postId: string) => logger.info('BlogPost', `投稿成功: ${postId}`),
    error: (error: any) => logger.error('BlogPost', '投稿失敗', error),
    redirect: (path: string) => logger.info('BlogPost', `リダイレクト: ${path}`),
  },
};
