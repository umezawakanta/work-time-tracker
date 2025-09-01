import mongoose from 'mongoose';

function ensureDbName(uriRaw: string | undefined): string | undefined {
  if (!uriRaw) return uriRaw;
  const needsDb = /^(mongodb(\+srv)?):\/\/[^/]+\/(?=(\?|$))/.test(uriRaw);
  if (needsDb) return uriRaw.replace(/\/(?=(\?|$))/, '/workTimeTracker$1');
  return uriRaw;
}

export function maskMongoUri(uriRaw: string | undefined): string {
  if (!uriRaw) return 'undefined';
  try {
    return uriRaw.replace(/(mongodb(\+srv)?:\/\/)([^:@]+)(:[^@]+)?@/i, '$1****:****@');
  } catch {
    return 'redacted';
  }
}

export async function connectMongoDirect(): Promise<void> {
  const uri = ensureDbName(process.env.MONGODB_URI);
  if (!uri) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
  } as any);
}

export function mongoReadyState(): number {
  return mongoose.connection.readyState;
}

export { mongoose };
