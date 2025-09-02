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
  const months = Number(req.query?.months ?? 6);
  const now = new Date();
  const series = Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    return {
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      amount: Math.max(0, Math.round(600000 + Math.sin(i / 2) * 50000)),
    };
  });
  res.status(200).json({ series });
}

// duplicate removed

module.exports = handler;
