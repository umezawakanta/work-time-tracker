// CommonJS & Node16-safe: local interfaces and CJS export
interface VercelRequest {
  method?: string;
  headers: Record<string, string | undefined> & { [key: string]: any };
}
interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string | string[]) => void;
  end: () => void;
}

async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  const allow = origin && (allowedOrigins.includes(origin) || isPreview) ? origin : '*';

  // CORS（資格情報は返さない: ワイルドカード時の互換性を優先）
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  res.setHeader('Access-Control-Allow-Origin', allow || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // 現時点ではサーバーサイドのセッションは保持していないため、
    // クッキー破棄はクライアント側に委ねる（Set-Cookie は送らない）
    // 監査ログ（簡易）
    console.log('[auth/logout] user logged out');

    res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (e) {
    console.warn('[auth/logout] error but treating as success', e);
    res.status(200).json({ success: true, message: 'Logout completed with warnings' });
  }
}

module.exports = handler;
