import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../lib/cors';
import { connectDB } from '../../src/server/config/database';
import { Project as ProjectModel } from '../../src/server/models/Project';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let dbConnected = true;
    try {
      await connectDB();
    } catch (e) {
      dbConnected = false;
    }

    const method = req.method || 'GET';
    if (method === 'GET') {
      if (!dbConnected) return res.status(200).json([]);
      const docs = await ProjectModel.find({}).sort({ updatedAt: -1 }).limit(200);
      return res.status(200).json(docs);
    }

    if (method === 'POST') {
      if (!dbConnected) return res.status(503).json({ success: false, error: 'DB unavailable' });
      const { name, color, userId, lastUsed } = req.body || {};
      if (!name || !color || !userId) {
        return res.status(400).json({ success: false, error: 'Missing fields' });
      }
      const created = await ProjectModel.create({ name, color, userId, lastUsed });
      return res.status(201).json(created);
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/projects', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
