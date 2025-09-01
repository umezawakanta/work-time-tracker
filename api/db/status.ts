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

function ensureDbName(uriRaw: string | undefined): string | undefined {
  if (!uriRaw) return uriRaw;
  // If path is missing (e.g., ...mongodb.net/?...) insert default DB name
  const needsDb = /^(mongodb(\+srv)?):\/\/[^/]+\/(?=(\?|$))/.test(uriRaw);
  if (needsDb) return uriRaw.replace(/\/(?=(\?|$))/, '/workTimeTracker$1');
  return uriRaw;
}

function maskMongoUri(uriRaw: string | undefined): string {
  if (!uriRaw) return 'undefined';
  try {
    // Redact credentials if present: mongodb[+srv]://user:pass@host/...
    return uriRaw.replace(/(mongodb(\+srv)?:\/\/)([^:@]+)(:[^@]+)?@/i, '$1****:****@');
  } catch {
    return 'redacted';
  }
}

async function directConnect(): Promise<void> {
  const uri = ensureDbName(process.env.MONGODB_URI);
  if (!uri) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
  } as any);
}

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
    const envHasMongo = Boolean(process.env.MONGODB_URI);
    console.log('[db/status] Start', {
      envHasMongo,
      uri: maskMongoUri(process.env.MONGODB_URI),
      nodeEnv: process.env.NODE_ENV,
      vercel: Boolean(process.env.VERCEL),
    });
    const dbReady = await ensureDB();
    if (dbReady && connectDB) {
      console.log('[db/status] Using connectDB() from server module');
      await connectDB();
    } else {
      console.log('[db/status] Falling back to direct mongoose.connect');
      await directConnect();
    }
    const state = mongoose.connection.readyState; // 0=disconnected 1=connected 2=connecting 3=disconnecting
    const connected = state === 1;
    const mongoVersion = (await mongoose.connection.db?.admin().serverStatus())?.version;
    console.log('[db/status] Result', {
      connected,
      state,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    });
    res.status(200).json({
      success: true,
      connected,
      state,
      version: mongoVersion || null,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    } as any);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.warn('[db/status] Error', { message });
    res.status(200).json({ success: true, connected: false, state: 0 } as any);
  }
}
