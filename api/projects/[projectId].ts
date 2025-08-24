import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../lib/cors';
import { connectDB } from '../../src/server/config/database';
import { Project as ProjectModel } from '../../src/server/models/Project';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { projectId } = req.query as { projectId?: string };
  if (!projectId) return res.status(400).json({ success: false, error: 'Missing projectId' });

  try {
    let dbConnected = true;
    try {
      await connectDB();
    } catch {
      dbConnected = false;
    }
    if (!dbConnected) return res.status(503).json({ success: false, error: 'DB unavailable' });

    if (req.method === 'PUT') {
      const update = req.body || {};
      const doc = await ProjectModel.findByIdAndUpdate(projectId, update, { new: true });
      if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
      return res.status(200).json(doc);
    }

    if (req.method === 'DELETE') {
      await ProjectModel.findByIdAndDelete(projectId);
      return res.status(204).end();
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/projects/:projectId', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
