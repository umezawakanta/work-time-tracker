import { api } from './apiConfig';
import { Book } from '@/store/bookSlice';

export const bookApi = {
  getAll: () => api.get<Book[]>('/books'),
  getById: (id: string) => api.get<Book>(`/books/${id}`),
  create: (book: Omit<Book, '_id' | 'createdAt'>) => api.post<{ book: Book }>('/books', book),
  update: (id: string, book: Partial<Book>) => {
    console.log('Updating book in API:', { id, book });
    return api.put<{ book: Book }>(`/books/${id}`, book);
  },
  delete: (id: string) => api.delete(`/books/${id}`),
};