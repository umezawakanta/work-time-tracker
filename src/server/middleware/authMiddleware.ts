import { Request, Response, NextFunction } from 'express';
import { CustomRequest } from '../types/express'; // パスを修正
import jwt from 'jsonwebtoken';
import 'express';

// グローバルモジュール拡張
declare module 'express' {
  interface Request {
    user?: { id: string };
  }
}

export const authenticateUser = (
  req: CustomRequest, 
  res: Response, 
  next: NextFunction
) => {
  // 実際の認証ロジックは別途実装
  if (!req.user) {
    return res.status(401).json({ message: '認証が必要です' });
  }
  next();
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: '認証トークンがありません' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: '無効な認証トークンです' });
  }

  try {
    // JWT_SECRETが未定義の場合のエラーハンドリングを追加
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRETが設定されていません');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    // エラーの種類に応じた詳細なエラーメッセージ
    const errorMessage = error instanceof Error 
      ? error.message 
      : '認証中に予期せぬエラーが発生しました';

    return res.status(401).json({ 
      message: '認証に失敗しました',
      error: errorMessage 
    });
  }
};