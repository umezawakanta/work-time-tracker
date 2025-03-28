import { Request } from 'express';

// カスタムリクエスト型を定義
export interface CustomRequest extends Request {
  user?: { 
    id: string; 
    email?: string; 
    name?: string; 
    isAdmin?: boolean; 
  }; // 認証ミドルウェアと一致する型定義
}