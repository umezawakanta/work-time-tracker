import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import 'express';

declare module 'express' {
  interface Request {
    user?: { id: string };
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: '認証トークンがありません' });
    return;
  }

  // authHeaderが文字列であることを確認
  if (Array.isArray(authHeader)) {
    res.status(401).json({ message: '不正な認証ヘッダー形式です' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: '無効な認証トークンです' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: '無効な認証トークンです' });
  }
};
