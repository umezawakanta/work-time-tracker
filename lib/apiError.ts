import type { VercelResponse } from '@vercel/node';

export type ErrorCode =
  | 'METHOD_NOT_ALLOWED'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | string;

export function sendError(res: VercelResponse, status: number, code: ErrorCode, message: string) {
  return res.status(status).json({ success: false, code, message });
}
