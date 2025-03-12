import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

declare module 'express' {
  interface Request {
      body: any;
      params: any;
      query: any;
      headers: any;
  }
}

export {};