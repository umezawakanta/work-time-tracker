interface VercelRequest {
  method?: string;
  headers: Record<string, string | undefined> & { [key: string]: any };
  body?: any;
}
interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (body: any) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  refreshExpiresAt: number;
}

// インメモリストレージ（実際の本番環境ではデータベースを使用）
const tokenStorage = new Map<string, TokenPair>();

async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'HEAD') {
    // HEAD should succeed for health probing
    res.status(200).end();
    return;
  }

  if (req.method === 'DELETE') {
    res.status(200).json({ message: 'Token deleted' });
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({ message: 'Token info' });
    return;
  }

  if (req.method === 'POST') {
    res.status(201).json({ message: 'Token created' });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

module.exports = handler;
