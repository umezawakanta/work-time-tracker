interface VercelRequest {
  method?: string;
  headers: Record<string, unknown>;
  on: (event: 'close', cb: () => void) => void;
}
interface VercelResponse {
  status: (n: number) => VercelResponse;
  json: (b: unknown) => void;
  setHeader: (k: string, v: string) => void;
  end: () => void;
  writeHead: (code: number, headers: Record<string, string>) => void;
  write: (chunk: string) => void;
}

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  send('heartbeat', { t: Date.now() });

  const interval = setInterval(() => send('heartbeat', { t: Date.now() }), 10000);
  req.on('close', () => {
    clearInterval(interval);
  });
}

module.exports = handler as any;
