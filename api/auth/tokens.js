// Pure CommonJS handler to avoid ESM export{} injection

function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function handler(req, res) {
    try {
        setCors(res);

        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        if (req.method === 'HEAD') {
            res.status(200).end();
            return;
        }

        if (req.method === 'DELETE') {
            res.status(200).json({ message: 'Token deleted' });
            return;
        }

        if (req.method === 'GET') {
            res.status(200).json({ message: 'Token info' });
            return;
        }

        if (req.method === 'POST') {
            res.status(201).json({ message: 'Token created' });
            return;
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = handler;


