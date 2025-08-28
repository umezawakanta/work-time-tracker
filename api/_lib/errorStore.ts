import type { MongoClient, Db, Collection, ObjectId } from 'mongodb';

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

// DB schema uses MongoDB ObjectId for _id
interface ErrorReportDbDoc {
  _id?: ObjectId;
  email?: string;
  url?: string;
  userAgent?: string;
  message: string;
  stack?: string;
  componentStack?: string;
  createdAt: string; // ISO
}

let mongo: { client: MongoClient; db: Db; col: Collection<ErrorReportDbDoc> } | null = null;
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
    const col = db.collection<ErrorReportDbDoc>('error_reports');
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
      // Omit any incoming _id to let MongoDB assign ObjectId
      const { _id: _omit, ...rest } = item;
      await m.col.insertOne(rest as Omit<ErrorReportDbDoc, '_id'>);
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
      return docs.map((d) => ({
        _id: d._id ? d._id.toString() : undefined,
        email: d.email,
        url: d.url,
        userAgent: d.userAgent,
        message: d.message,
        stack: d.stack,
        componentStack: d.componentStack,
        createdAt: d.createdAt,
      })) as ErrorReportDoc[];
    } catch {
      // fall through
    }
  }
  return memoryStore.slice(-limit).reverse();
}
