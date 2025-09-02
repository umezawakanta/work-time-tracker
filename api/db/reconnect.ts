import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' } as any);
    return;
  }
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    const mod: any = await import('../_lib/mongo.js');
    const lib = (mod as any).default || mod;
    await (lib.connectMongoDirect as () => Promise<void>)();
    const ok = mongoose.connection.readyState === 1;
    res.status(200).json({ success: ok } as any);
  } catch (e) {
    res.status(500).json({ success: false, message: 'Reconnect failed' } as any);
  }
}
