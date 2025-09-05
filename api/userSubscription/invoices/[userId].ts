// Minimal invoices endpoint (CJS-friendly)
interface VercelRequest {
  method?: string;
  headers: Record<string, string | undefined> & { [k: string]: any };
  query: Record<string, string | string[]>;
}
interface VercelResponse {
  status: (n: number) => VercelResponse;
  json: (b: unknown) => void;
  setHeader: (k: string, v: string) => void;
  end: () => void;
}

module.exports = async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin as string | undefined;
  const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-.*\.vercel\.app$/.test(origin);
  res.setHeader(
    'Access-Control-Allow-Origin',
    origin && (allowedOrigins.includes(origin) || isPreview) ? origin : '*'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return void res.status(200).end();
  if (req.method !== 'GET')
    return void res.status(405).json({ success: false, message: 'Method Not Allowed' });

  try {
    // If we later store invoices in DB, fetch here. For now, return empty list.
    return void res.status(200).json({ success: true, data: [] });
  } catch (e) {
    return void res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
