import type { MongoClient, Db, Collection } from 'mongodb';

export interface AnalyticsEventDoc {
  event: string;
  data?: Record<string, unknown>;
  clientId?: string;
  sessionId?: string;
  path?: string;
  ip?: string | string[] | undefined;
  userAgent?: string | undefined;
  timestamp: string; // ISO string
  createdAt?: Date;
}

let memoryStore: AnalyticsEventDoc[] = [];
let mongo: { client: MongoClient; db: Db; col: Collection<AnalyticsEventDoc> } | null = null;

async function getMongo(): Promise<typeof mongo> {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
    if (!uri) return null;
    const { MongoClient: MC } = await import('mongodb');
    if (mongo) return mongo;
    const client = new MC(uri, { maxPoolSize: 2 });
    await client.connect();
    const dbName = process.env.MONGODB_DB || process.env.MONGO_INITDB_DATABASE || 'app';
    const db = client.db(dbName);
    const col = db.collection<AnalyticsEventDoc>('analytics_events');
    try {
      // Best-effort indexes
      await col.createIndex({ event: 1, timestamp: -1 }, { background: true });
      await col.createIndex({ clientId: 1, sessionId: 1, timestamp: -1 }, { background: true });
      await col.createIndex({ path: 1, timestamp: -1 }, { background: true });
    } catch {}
    mongo = { client, db, col };
    return mongo;
  } catch {
    return null;
  }
}

export async function saveAnalyticsEvent(doc: AnalyticsEventDoc): Promise<void> {
  const item: AnalyticsEventDoc = { ...doc, createdAt: new Date() };
  const m = await getMongo();
  if (m) {
    try {
      await m.col.insertOne(item);
      return;
    } catch (e) {
      // fall through to memory store if Mongo fails
      console.warn(
        '[AnalyticsStore] Mongo insert failed, using memory store:',
        (e as Error)?.message
      );
    }
  }
  // Memory fallback (cap to 5k)
  memoryStore.push(item);
  if (memoryStore.length > 5000) memoryStore = memoryStore.slice(-2500);
}

export function getMemorySample(limit = 50): AnalyticsEventDoc[] {
  return memoryStore.slice(-limit);
}

export async function countActiveUsersSince(sinceIso: string): Promise<number> {
  const since = new Date(sinceIso);
  if (Number.isNaN(since.getTime())) return 0;
  const m = await getMongo();
  if (m) {
    try {
      const values = await m.col.distinct('sessionId', {
        timestamp: { $gte: sinceIso },
        sessionId: { $exists: true, $ne: null },
      } as any);
      return Array.isArray(values) ? values.length : 0;
    } catch {
      // fall through to memory
    }
  }
  const uniq = new Set<string>();
  for (const e of memoryStore) {
    try {
      if (!e || !e.timestamp) continue;
      const t = new Date(e.timestamp);
      if (t >= since) {
        const key = (e.sessionId || e.clientId || String(e.ip || '')).toString();
        if (key) uniq.add(key);
      }
    } catch {}
  }
  return uniq.size;
}
