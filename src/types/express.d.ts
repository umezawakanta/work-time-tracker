import 'express';

declare module 'express' {
  interface Request {
    user?: any;
  }

  interface Response {
    // Express 5の型に合わせて明示的にメソッドを定義
    json(body?: any): this;
    status(code: number): this;
  }
}