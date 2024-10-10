import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import { Book, addBook, removeBook, updateBook } from '../store/bookSlice';
import { RootState } from '../store';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BookCard from './BookCard';

const initialBookState: Omit<Book, 'id'> = {
  title: '',
  author: '',
  isbn: '',
  publishedYear: new Date().getFullYear(),
  totalPages: 0,
  readPages: 0,
  category: '',
  rating: 0,
};

const BookShelf: React.FC = () => {
  const dispatch = useDispatch();
  const books = useSelector((state: RootState) => state.book.books);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newBook, setNewBook] = useState<Omit<Book, 'id'>>(initialBookState);

  useEffect(() => {
    if (editingBook) {
      setNewBook(editingBook);
    } else {
      setNewBook(initialBookState);
    }
  }, [editingBook]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBook(prev => ({
      ...prev,
      [name]: ['publishedYear', 'totalPages', 'readPages', 'rating'].includes(name) 
        ? Math.max(0, parseInt(value, 10) || 0)
        : value,
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBook) {
      dispatch(updateBook({ ...newBook, id: editingBook.id }));
    } else {
      dispatch(addBook({ ...newBook, id: nanoid() }));
    }
    setIsDialogOpen(false);
    setEditingBook(null);
    setNewBook(initialBookState);
  };

  const handleEdit = useCallback((book: Book) => {
    setEditingBook(book);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    dispatch(removeBook(id));
  }, [dispatch]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => 
      (book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       book.author.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === 'all' || book.category === selectedCategory)
    );
  }, [books, searchTerm, selectedCategory]);

  const categories = ['小説', 'ノンフィクション', '技術書', 'その他'];

  const safeToString = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null) {
      return '';
    }
    return value.toString();
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          placeholder="本を検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="カテゴリー" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全て</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setIsDialogOpen(true)}>本を追加</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBooks.map(book => (
          <BookCard
            key={book.id}
            book={book}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingBook(null);
          setNewBook(initialBookState);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBook ? '本を編集' : '新しい本を追加'}</DialogTitle>
            <DialogDescription>
              {editingBook ? '本の情報を更新してください。' : '新しい本の情報を入力してください。'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">タイトル</Label>
                <Input
                  id="title"
                  name="title"
                  value={safeToString(newBook.title)}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="author">著者</Label>
                <Input
                  id="author"
                  name="author"
                  value={safeToString(newBook.author)}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  name="isbn"
                  value={safeToString(newBook.isbn)}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="publishedYear">出版年</Label>
                <Input
                  id="publishedYear"
                  name="publishedYear"
                  type="number"
                  value={safeToString(newBook.publishedYear)}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="category">カテゴリー</Label>
                <Select name="category" value={safeToString(newBook.category)} onValueChange={(value) => setNewBook(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリーを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="totalPages">総ページ数</Label>
                <Input
                  id="totalPages"
                  name="totalPages"
                  type="number"
                  value={safeToString(newBook.totalPages)}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="readPages">読了ページ</Label>
                <Input
                  id="readPages"
                  name="readPages"
                  type="number"
                  value={safeToString(newBook.readPages)}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max={safeToString(newBook.totalPages)}
                />
              </div>
              <div>
                <Label htmlFor="rating">評価</Label>
                <Select name="rating" value={safeToString(newBook.rating)} onValueChange={(value) => setNewBook(prev => ({ ...prev, rating: parseInt(value, 10) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="評価を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5].map(rating => (
                      <SelectItem key={rating} value={rating.toString()}>{rating} {rating === 1 ? '星' : '星'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">{editingBook ? '更新' : '追加'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookShelf;