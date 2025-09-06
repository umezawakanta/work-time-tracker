import { Request, Response, NextFunction } from 'express';

interface ErrorLog {
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  stack?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  userAgent?: string;
  ip?: string;
  sessionId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

class ServerErrorLogger {
  private static instance: ServerErrorLogger | null = null;
  private errorQueue: ErrorLog[] = [];
  private isProcessing = false;
  private batchSize = 10;
  private flushInterval = 5000; // 5秒

  private constructor() {
    this.startBatchProcessing();
  }

  public static getInstance(): ServerErrorLogger {
    if (!ServerErrorLogger.instance) {
      ServerErrorLogger.instance = new ServerErrorLogger();
    }
    return ServerErrorLogger.instance;
  }

  private startBatchProcessing() {
    setInterval(() => {
      this.flushErrors();
    }, this.flushInterval);
  }

  public logError(error: ErrorLog) {
    this.errorQueue.push(error);

    // バッチサイズに達したら即座にフラッシュ
    if (this.errorQueue.length >= this.batchSize) {
      this.flushErrors();
    }
  }

  private async flushErrors() {
    if (this.isProcessing || this.errorQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const errorsToFlush = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // MongoDBに保存
      await this.saveErrorsToDatabase(errorsToFlush);
    } catch (error) {
      console.error('Failed to save error logs:', error);
      // 失敗した場合はキューに戻す
      this.errorQueue.unshift(...errorsToFlush);
    } finally {
      this.isProcessing = false;
    }
  }

  private async saveErrorsToDatabase(errors: ErrorLog[]) {
    try {
      // MongoDB接続
      const mongoLib = require('../../api/_lib/mongo');
      await mongoLib.connectMongoDirect();
      const mongoose = await mongoLib.getMongoose();

      // 共通スキーマを使用
      const { getErrorLogModel } = require('../../api/_schemas/errorLog');
      const ErrorLogModel = getErrorLogModel();

      // バッチ挿入
      await ErrorLogModel.insertMany(errors);
    } catch (error) {
      console.error('Database save error:', error);
      throw error;
    }
  }
}

// Expressミドルウェア
export const serverErrorLogger = (req: Request, res: Response, next: NextFunction) => {
  const logger = ServerErrorLogger.getInstance();

  // レスポンス終了時のエラーログ
  const originalSend = res.send;
  res.send = function (data) {
    // エラーレスポンスの場合
    if (res.statusCode >= 400) {
      const errorLog: ErrorLog = {
        timestamp: new Date(),
        level: res.statusCode >= 500 ? 'error' : 'warn',
        message: `HTTP ${res.statusCode} ${req.method} ${req.path}`,
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        sessionId: req.sessionID,
        tags: ['http', 'api'],
        metadata: {
          query: req.query,
          body: req.body,
          headers: req.headers,
        },
      };

      logger.logError(errorLog);
    }

    return originalSend.call(this, data);
  };

  next();
};

// エラーハンドリングミドルウェア
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const logger = ServerErrorLogger.getInstance();

  const errorLog: ErrorLog = {
    timestamp: new Date(),
    level: 'error',
    message: error.message,
    stack: error.stack,
    endpoint: req.path,
    method: req.method,
    statusCode: 500,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    sessionId: req.sessionID,
    tags: ['exception', 'unhandled'],
    metadata: {
      query: req.query,
      body: req.body,
      headers: req.headers,
    },
  };

  logger.logError(errorLog);

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
};

export default ServerErrorLogger;
