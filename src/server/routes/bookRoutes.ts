import * as express from "express";
import { Request, Response } from 'express';
import { Book } from '../models/Book.js';

const router = express.Router();

// GET all books
router.get('/', async (_req: Request, res: Response): Promise<void> => {
    try {
      const books = await Book.find();
      res.json(books);
    } catch (error: unknown) {
      console.error('Error fetching books:', error);
      res.status(500).json({ 
        message: 'Error fetching books', 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    }
});
  
// POST new book
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
      const newBook = new Book(req.body);
      const savedBook = await newBook.save();
      res.status(201).json({ message: 'Book created successfully', book: savedBook });
    } catch (error: unknown) {
      console.error('Error creating book:', error);
      res.status(500).json({ 
        message: 'Error creating book', 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    }
});

// PUT update book
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates = req.body;
      console.log('Updating book on server. ID:', id);
      console.log('Update data:', updates);
      if (!id) {
        res.status(400).json({ message: 'Book ID is required' });
        return;
      }
      const updatedBook = await Book.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      if (!updatedBook) {
        console.log('Book not found. ID:', id);
        res.status(404).json({ message: 'Book not found' });
        return;
      }
      console.log('Book updated successfully:', updatedBook);
      res.json({ message: 'Book updated successfully', book: updatedBook });
    } catch (error) {
      console.error('Error updating book:', error);
      res.status(500).json({ message: 'Error updating book', error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});

// DELETE book
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deletedBook = await Book.findByIdAndDelete(id);
      if (!deletedBook) {
        res.status(404).json({ message: 'Book not found' });
        return;
      }
      res.json({ message: 'Book deleted successfully' });
    } catch (error: unknown) {
      console.error('Error deleting book:', error);
      res.status(500).json({ 
        message: 'Error deleting book', 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    }
});

export default router;