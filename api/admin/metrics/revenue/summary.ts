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
  res.status(200).json({
    mrr: 845000,
    arr: 845000 * 12,
    churnRate: 2.3,
    conversionRate: 3.4,
    activePaid: 118,
    newPaidThisMonth: 12,
    prevMrr: 800000,
  });
}

// duplicate removed

module.exports = handler;
