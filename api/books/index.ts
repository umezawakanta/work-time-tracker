import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../../lib/cors';
import { connectDB } from '../../src/server/config/database';
import { Book } from '../../src/server/models/Book';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  let dbConnected = true;
  try {
    await connectDB();
  } catch {
    dbConnected = false;
  }

  try {
    if (req.method === 'GET') {
      if (!dbConnected) return res.status(200).json([]);
      const books = await Book.find().sort({ createdAt: -1 });
      return res.status(200).json(books);
    }

    if (req.method === 'POST') {
      if (!dbConnected) return res.status(503).json({ success: false, error: 'DB unavailable' });
      const newBook = new Book(req.body);
      const saved = await newBook.save();
      return res.status(201).json({ message: 'Book created successfully', book: saved });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/books', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
