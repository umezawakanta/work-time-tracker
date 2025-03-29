import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import 'express';

declare module 'express' {
  interface Request {
    user?: { id: string };
  }
}

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: '無効な認証トークンです' });
  }
};