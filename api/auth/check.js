// Plain JS to avoid TS duplication during Vercel build
let jwt;

function setCorsHeaders(res, origin) {
    const allowedOrigins = ['http://localhost:3000', 'https://work-time-tracker-five.vercel.app'];
    const isVercelPreview = origin && /^https:\/\/work-time-tracker-5d9q-.*\.vercel\.app$/.test(origin);
    const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isVercelPreview);
    res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
}

module.exports = async function handler(req, res) {
    try {
        const origin = req.headers.origin;
        setCorsHeaders(res, origin);
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }
        if (req.method !== 'GET') {
            res.status(405).json({ isAuthenticated: false, error: 'Method not allowed' });
            return;
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Relaxed behavior: return 200 with isAuthenticated=false for health checks
            res.status(200).json({ isAuthenticated: false, message: 'No auth header' });
            return;
        }

        const token = authHeader.replace('Bearer ', '').trim();
        // DB 依存を排除。トークンの整合性のみ軽量確認（本番のヘルス用途）
        if (!jwt) jwt = require('jsonwebtoken');
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-development';

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, jwtSecret, {
                issuer: 'work-time-tracker',
                audience: 'work-time-tracker-users',
            });
        } catch (e) {
            res.status(200).json({ isAuthenticated: false, message: 'Invalid token' });
            return;
        }

        // DB照会は行わない（軽量化/依存排除）。ペイロードから最小情報を返す。
        res.status(200).json({ isAuthenticated: true, userId: decodedToken.userId, message: 'OK' });
    } catch (error) {
        res.status(200).json({ isAuthenticated: false, message: 'Internal error' });
    }
};


