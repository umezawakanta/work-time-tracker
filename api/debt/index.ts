import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/database';
import { DebtEntry } from '../../src/server/models/DebtEntry';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Connect DB (fail fast if unavailable)
  try {
    await connectDB();
  } catch (e) {
    console.warn('Debt API: DB not available');
    res.status(503).json({ success: false, error: 'Service unavailable (DB connection failed)' });
    return;
  }

  if (req.method === 'GET') {
    try {
      const debts = await DebtEntry.find().sort({ date: -1 });
      res.status(200).json(debts);
    } catch (error) {
      console.error('Debt GET error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const { date, value, description, account } = req.body || {};
      if (!date || value == null || !description || !account) {
        res.status(400).json({ success: false, error: 'Missing required fields' });
        return;
      }

      const created = await DebtEntry.create({ date, value, description, account });
      res.status(201).json({ message: '負債情報が正常に記録されました', debt: created });
    } catch (error) {
      console.error('Debt POST error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
    return;
  }

  res.status(405).json({ success: false, error: 'Method not allowed' });
}
