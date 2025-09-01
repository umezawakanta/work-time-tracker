// Plain JS to avoid TS duplication during Vercel build
const { connectDB } = require('../../src/server/config/database');
const { User } = require('../../src/server/models/User');
const jwt = require('jsonwebtoken');

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
        await connectDB();
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

        const user = await User.findOne({ $or: [{ _id: decodedToken.userId }, { id: decodedToken.userId }] });
        if (!user) {
            res.status(200).json({ isAuthenticated: false, message: 'User not found' });
            return;
        }
        if (user.status !== 'active') {
            res.status(200).json({ isAuthenticated: false, message: 'Account inactive' });
            return;
        }
        user.lastActivityAt = new Date();
        await user.save();

        res.status(200).json({
            isAuthenticated: true,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                role: user.role,
                isVerified: user.isVerified,
                avatar: user.avatar,
                provider: user.provider,
            },
            message: 'OK',
        });
    } catch (error) {
        res.status(200).json({ isAuthenticated: false, message: 'Internal error' });
    }
};


