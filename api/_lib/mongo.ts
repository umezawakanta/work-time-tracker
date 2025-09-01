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
  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    } as any);
    console.log('[mongo] direct connect success', {
      readyStateAfter: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
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
