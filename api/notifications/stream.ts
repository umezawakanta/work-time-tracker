import { VercelRequest, VercelResponse } from '@vercel/node';

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
  write: (data: string) => void;
}

module.exports = async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
    return;
  }

  try {
    // 管理者認証
    const ctx = require('../_lib/user-context.js');
    const auth = await ctx.verifyJwtAndExtract(req as any);

    // 管理者権限チェック
    const User = await ctx.ensureDbAndUserModel();
    const user = await ctx.findUserByIdLoose(User, auth.userId);
    if (!user || user.role !== 'admin') {
      return void res.status(403).json({ success: false, message: 'Admin access required' });
    }

    // SSE接続開始
    res.write('data: {"type": "connected", "timestamp": "' + new Date().toISOString() + '"}\n\n');

    // 定期的なハートビート送信
    const heartbeatInterval = setInterval(() => {
      try {
        res.write(
          'data: {"type": "heartbeat", "timestamp": "' + new Date().toISOString() + '"}\n\n'
        );
      } catch (error) {
        clearInterval(heartbeatInterval);
      }
    }, 30000); // 30秒ごと

    // 接続終了時のクリーンアップ
    req.on('close', () => {
      clearInterval(heartbeatInterval);
    });

    // 5分後に自動切断（Vercelの制限）
    setTimeout(() => {
      try {
        res.write('data: {"type": "timeout", "timestamp": "' + new Date().toISOString() + '"}\n\n');
        res.end();
      } catch (error) {
        // 接続が既に閉じられている場合は無視
      }
    }, 300000);
  } catch (error) {
    console.error('SSE stream error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
