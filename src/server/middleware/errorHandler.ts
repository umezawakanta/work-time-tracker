import { Request, Response } from "express";

export const errorHandler = (err: Error, _req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({
    message: "サーバーエラーが発生しました",
    error: process.env.NODE_ENV === "production" ? {} : err.message,
  });
};
