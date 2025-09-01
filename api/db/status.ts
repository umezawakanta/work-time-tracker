import type { VercelRequest, VercelResponse } from '@vercel/node';
// Use dynamic import to align with other API routes
let connectDB: (() => Promise<void>) | null = null;
async function ensureDB() {
  if (connectDB) return true;
  try {
    const dbMod = await import('../../src/server/config/database.js');
    connectDB = (dbMod as any).connectDB as () => Promise<void>;
    return true;
  } catch {
    return false;
  }
}
import mongoose from 'mongoose';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' } as any);
    return;
  }
  try {
    const ok = await ensureDB();
    if (!ok || !connectDB) throw new Error('db module missing');
    await connectDB();
    const state = mongoose.connection.readyState; // 0=disconnected 1=connected 2=connecting 3=disconnecting
    const ok = state === 1;
    const mongoVersion = (await mongoose.connection.db?.admin().serverStatus())?.version;
    res.status(200).json({
      success: true,
      connected: ok,
      state,
      version: mongoVersion || null,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    } as any);
  } catch (e) {
    res.status(200).json({ success: true, connected: false, state: 0 } as any);
  }
}
