// src/server/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// 既存のユーザー型を拡張（ユニオン型で追加）
declare module 'express' {
  interface Request {
    user?: { id: string; } | undefined;
  }
}

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Authorization ヘッダーからトークンを取得
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "認証トークンがありません" });
    }

    const token = authHeader.split(" ")[1];
    
    // トークンの検証（環境変数からシークレットキーを取得）
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    
    // デコードされたユーザー情報をリクエストに追加
    req.user = decoded as {
      id: string;
      email: string;
      isAdmin: boolean;
    };
    
    next();
  } catch (error) {
    console.error("認証エラー:", error);
    return res.status(401).json({ message: "無効な認証トークンです" });
  }
};