// src/server/middleware/auth.ts
import { AuthUser } from "@/types/express";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// 型拡張を避けてRequestオブジェクトを拡張
interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Authorizationヘッダーからトークンを取得
    const authHeader = req.headers.authorization;
    
    // authHeaderが文字列であることを確認
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "認証トークンがありません" });
    }

    const token = authHeader.split(" ")[1];
    
    // 環境変数からJWTシークレットを取得
    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    
    try {
      // トークンの検証
      const decoded = jwt.verify(token, jwtSecret) as AuthUser;
      
      // デコードされたユーザー情報をリクエストに追加
      (req as AuthenticatedRequest).user = decoded;
      
      next();
    } catch (jwtError) {
      console.error("JWT検証エラー:", jwtError);
      return res.status(401).json({ message: "無効な認証トークンです" });
    }
  } catch (error) {
    console.error("認証エラー:", error);
    return res.status(500).json({ message: "認証処理中にエラーが発生しました" });
  }
};