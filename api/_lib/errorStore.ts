import type { MongoClient, Db, Collection } from 'mongodb';

export interface ErrorReportDoc {
  _id?: string | unknown;
  email?: string;
  url?: string;
  userAgent?: string;
  message: string;
  stack?: string;
  componentStack?: string;
  createdAt: string; // ISO
}

let mongo: { client: MongoClient; db: Db; col: Collection<ErrorReportDoc> } | null = null;
let memoryStore: ErrorReportDoc[] = [];

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
    const col = db.collection<ErrorReportDoc>('error_reports');
    try {
      await col.createIndex({ createdAt: -1 }, { background: true });
      await col.createIndex({ email: 1, createdAt: -1 }, { background: true });
    } catch {}
    mongo = { client, db, col };
    return mongo;
  } catch {
    return null;
  }
}

export async function saveErrorReport(doc: Omit<ErrorReportDoc, 'createdAt'>): Promise<void> {
  const item: ErrorReportDoc = { ...doc, createdAt: new Date().toISOString() };
  const m = await getMongo();
  if (m) {
    try {
      await m.col.insertOne(item);
      return;
    } catch (e) {
      // fall back to memory
      console.warn('[ErrorStore] Mongo insert failed, using memory store:', (e as Error)?.message);
    }
  }
  memoryStore.push(item);
  if (memoryStore.length > 1000) memoryStore = memoryStore.slice(-500);
}

export async function listErrorReports(limit = 50): Promise<ErrorReportDoc[]> {
  const m = await getMongo();
  if (m) {
    try {
      const cursor = m.col.find({}).sort({ createdAt: -1 }).limit(limit);
      const docs = await cursor.toArray();
      return docs.map((d) => ({ ...d, _id: (d as any)._id?.toString?.() })) as ErrorReportDoc[];
    } catch {
      // fall through
    }
  }
  return memoryStore.slice(-limit).reverse();
}


