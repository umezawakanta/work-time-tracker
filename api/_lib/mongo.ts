import mongoose from 'mongoose';

function hasDbPath(uriRaw: string): boolean {
  // path exists if there is a slash followed by non-? characters before query or end
  return /^(mongodb(\+srv)?):\/\/[^/]+\/[^(\?)]/.test(uriRaw);
}

function getDbNameFromUri(uriRaw: string): string | undefined {
  const m = uriRaw.match(/^(mongodb(\+srv)?):\/\/[^/]+\/([^?]*)/);
  return m && m[3] ? decodeURIComponent(m[3]) : undefined;
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
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  const isSrv = /^mongodb\+srv:\/\//i.test(uri);
  const hasCred = /:\/\//.test(uri) && /@/.test(uri);
  const beforeState = mongoose.connection.readyState;
  console.log('[mongo] direct connect begin', {
    nodeEnv: process.env.NODE_ENV,
    vercel: Boolean(process.env.VERCEL),
    hasUri: Boolean(process.env.MONGODB_URI),
    uri: maskMongoUri(process.env.MONGODB_URI),
    isSrv,
    hasCred,
    readyStateBefore: beforeState,
  });
  const uriHasDb = hasDbPath(uri);
  const dbNameFromUri = getDbNameFromUri(uri);
  const dbNameToUse = uriHasDb ? undefined : 'workTimeTracker';
  try {
    const opts: any = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    };
    if (dbNameToUse) opts.dbName = dbNameToUse;
    await mongoose.connect(uri, opts);
    console.log('[mongo] direct connect success', {
      readyStateAfter: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      dbFromUri: dbNameFromUri || null,
      dbApplied: dbNameToUse || 'fromUri',
    });
  } catch (error) {
    const err: any = error;
    console.warn('[mongo] direct connect failed', {
      name: err?.name,
      message: err?.message,
      code: err?.code,
      reasonCode: err?.reason?.code,
      reasonMessage: err?.reason?.message,
      labels: err?.errorLabels,
      readyStateAfter: mongoose.connection.readyState,
    });
    throw error;
  }
}

export function mongoReadyState(): number {
  return mongoose.connection.readyState;
}

export { mongoose };
