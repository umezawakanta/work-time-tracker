interface VercelRequest {
  method?: string;
  headers: Record<string, string | undefined>;
  query?: Record<string, unknown>;
}
interface VercelResponse {
  status: (c: number) => VercelResponse;
  json: (b: unknown) => void;
  setHeader: (n: string, v: string) => void;
  end: () => void;
}

function handler(req: VercelRequest, res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  const windowArg = String((req.query?.window as string) || '7d');
  const days = windowArg === '90d' ? 90 : windowArg === '30d' ? 30 : 7;
  const series = Array.from({ length: days }, (_, i) => ({
    day: new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().slice(0, 10),
    newUsers: Math.max(0, Math.round(20 + Math.sin(i / 2) * 10)),
    activeUsers: Math.max(0, Math.round(200 + Math.cos(i / 3) * 50)),
  }));
  res.status(200).json({ series });
}

// duplicate removed

module.exports = handler;
