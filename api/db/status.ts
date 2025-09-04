interface VercelRequest {
  method?: string;
  headers: Record<string, unknown>;
  query?: Record<string, unknown>;
}
interface VercelResponse {
  status: (n: number) => VercelResponse;
  json: (b: unknown) => void;
  setHeader: (k: string, v: string) => void;
  end: () => void;
}
let mongoose: any = null;
async function getMongoLib() {
  const mod: any = await import('../_lib/mongo.js');
  const lib = (mod as any).default || mod;
  if (!mongoose) {
    mongoose = lib.mongoose || (lib.getMongoose ? await lib.getMongoose() : null);
  }
  return {
    connectMongoDirect: lib.connectMongoDirect as () => Promise<void>,
  };
}

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
  // connectMongoDirect already ensures dbName when missing
  const hasUri = Boolean(process.env.MONGODB_URI);
  if (!hasUri) throw new Error('MONGODB_URI is not set');
  const { connectMongoDirect } = await getMongoLib();
  await connectMongoDirect();
}

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
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
      uri: process.env.MONGODB_URI ? 'mongodb+srv://****:****@...' : 'undefined',
      nodeEnv: process.env.NODE_ENV,
      vercel: Boolean(process.env.VERCEL),
    });
    await directConnect();
    const state = mongoose.connection.readyState; // 0=disconnected 1=connected 2=connecting 3=disconnecting
    const connected = state === 1;
    let mongoVersion: string | null = null;
    try {
      mongoVersion = (await mongoose.connection.db?.admin().serverStatus())?.version || null;
    } catch (verErr) {
      console.warn('[db/status] Failed to read serverStatus', {
        message: verErr instanceof Error ? verErr.message : String(verErr),
      });
    }
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

module.exports = handler as any;
