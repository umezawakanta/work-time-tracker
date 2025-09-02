// CommonJS-only helper to avoid TS ESM emission issues
let mongoose = null;

async function getMongoose() {
    if (mongoose) return mongoose;
    const mod = await import('mongoose');
    mongoose = mod.default || mod;
    return mongoose;
}

function maskMongoUri(uriRaw) {
    if (!uriRaw) return 'undefined';
    try {
        return uriRaw.replace(/(mongodb(\+srv)?:\/\/)([^:@]+)(:[^@]+)?@/i, '$1****:****@');
    } catch {
        return 'redacted';
    }
}

function hasDbPath(uriRaw) {
    return /^(mongodb(\+srv)?):\/\/[^/]+\/[^?]+/.test(uriRaw);
}

function getDbNameFromUri(uriRaw) {
    const m = uriRaw.match(/^(mongodb(\+srv)?):\/\/[^/]+\/([^?]*)/);
    return m && m[3] ? decodeURIComponent(m[3]) : undefined;
}

async function connectMongoDirect() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not set');
    const m = await getMongoose();
    const isSrv = /^mongodb\+srv:\/\//i.test(uri);
    const hasCred = /:\/\//.test(uri) && /@/.test(uri);
    const beforeState = m.connection.readyState;
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
        const opts = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false,
        };
        if (dbNameToUse) opts.dbName = dbNameToUse;
        await m.connect(uri, opts);
        console.log('[mongo] direct connect success', {
            readyStateAfter: m.connection.readyState,
            host: m.connection.host,
            name: m.connection.name,
            dbFromUri: dbNameFromUri || null,
            dbApplied: dbNameToUse || 'fromUri',
        });
    } catch (error) {
        const err = error || {};
        console.warn('[mongo] direct connect failed', {
            name: err.name,
            message: err.message,
            code: err.code,
            reasonCode: err.reason && err.reason.code,
            reasonMessage: err.reason && err.reason.message,
            labels: err.errorLabels,
            readyStateAfter: (mongoose && mongoose.connection && mongoose.connection.readyState) || 0,
        });
        throw error;
    }
}

function mongoReadyState() {
    return (mongoose && mongoose.connection && mongoose.connection.readyState) || 0;
}

module.exports = { connectMongoDirect, maskMongoUri, mongoReadyState, getMongoose, mongoose };


