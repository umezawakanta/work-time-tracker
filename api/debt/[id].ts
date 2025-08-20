import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/database';
import { DebtEntry } from '../../src/server/models/DebtEntry';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // DB connect (required for update/delete)
  try {
    await connectDB();
  } catch (e) {
    res.status(503).json({ success: false, error: 'Database not available' });
    return;
  }

  const id = (req.query.id as string) || '';
  if (!id) {
    res.status(400).json({ success: false, error: 'ID is required' });
    return;
  }

  if (req.method === 'PUT') {
    try {
      const updated = await DebtEntry.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) {
        res.status(404).json({ success: false, error: 'Not found' });
        return;
      }
      res.status(200).json({ message: '負債情報が正常に更新されました', debt: updated });
    } catch (error) {
      console.error('Debt PUT error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
    return;
  }

  if (req.method === 'DELETE') {
    try {
      const removed = await DebtEntry.findByIdAndDelete(id);
      if (!removed) {
        res.status(404).json({ success: false, error: 'Not found' });
        return;
      }
      res.status(200).json({ message: '負債情報が正常に削除されました', debt: removed });
    } catch (error) {
      console.error('Debt DELETE error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
    return;
  }

  res.status(405).json({ success: false, error: 'Method not allowed' });
}
