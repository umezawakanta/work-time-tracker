// Minimal placeholder to avoid 404 noise; returns empty list
interface VercelRequest {
  method?: string;
  headers: any;
  body?: any;
}
interface VercelResponse {
  status: (n: number) => VercelResponse;
  json: (b: unknown) => void;
  setHeader: (k: string, v: string) => void;
  end: () => void;
}

module.exports = async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return void res.status(200).end();
  if (req.method !== 'GET')
    return void res.status(405).json({ success: false, message: 'Method Not Allowed' });
  res.status(200).json({ success: true, data: [] });
};
