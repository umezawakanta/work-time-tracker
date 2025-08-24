// src/types/express.d.ts

// AuthUserインターフェースを明示的に定義
export interface AuthUser {
  id: string;
  email?: string;
  isAdmin: boolean;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

// グローバル名前空間でRequestを拡張
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// express モジュールのRequestを拡張
declare module 'express' {
  interface Request {
    body: Record<string, unknown>;
    params: Record<string, string>;
    query: Record<string, string | string[] | undefined>;
    headers: Record<string, string | string[] | undefined>;
  }
}
