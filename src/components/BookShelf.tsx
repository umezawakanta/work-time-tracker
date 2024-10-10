import React, { useState } from 'react';
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
import { Trash2, Edit, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const BookShelf: React.FC = () => {
  const dispatch = useDispatch();
  const books = useSelector((state: RootState) => state.book.books);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newBook, setNewBook] = useState<Omit<Book, 'id'>>({
    title: '',
    author: '',
    isbn: '',
    publishedYear: new Date().getFullYear(),
    totalPages: 0,
    readPages: 0,
    category: '',
    rating: 0,
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewBook(prev => ({
      ...prev,
      [name]: ['publishedYear', 'totalPages', 'readPages', 'rating'].includes(name) 
        ? Math.max(0, parseInt(value, 10) || 0)
        : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBook) {
      dispatch(updateBook({ ...newBook, id: editingBook.id }));
    } else {
      dispatch(addBook({ ...newBook, id: nanoid() }));
    }
    setIsDialogOpen(false);
    setEditingBook(null);
    setNewBook({
      title: '',
      author: '',
      isbn: '',
      publishedYear: new Date().getFullYear(),
      totalPages: 0,
      readPages: 0,
      category: '',
      rating: 0,
      notes: '',
    });
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setNewBook(book);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    dispatch(removeBook(id));
  };

  const filteredBooks = books.filter(book => 
    (book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     book.author.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategory === 'all' || book.category === selectedCategory)
  );

  const categories = ['小説', 'ノンフィクション', '技術書', 'その他'];

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
          <div key={book.id} className="border p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold">{book.title}</h2>
            <p>著者: {book.author}</p>
            <p>ISBN: {book.isbn}</p>
            <p>出版年: {book.publishedYear}</p>
            <p>カテゴリー: {book.category}</p>
            <p>総ページ数: {book.totalPages}</p>
            <p>読了ページ: {book.readPages}</p>
            <div className="mt-2">
              <Progress value={book.totalPages > 0 ? (book.readPages / book.totalPages) * 100 : 0} />
            </div>
            <div className="mt-2">
              評価: {Array(5).fill(0).map((_, i) => (
                <Star key={i} className={`inline-block w-4 h-4 ${i < book.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            {book.notes && <p className="mt-2 text-sm text-gray-600">メモ: {book.notes}</p>}
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" size="icon" onClick={() => handleEdit(book)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleDelete(book.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  value={newBook.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="author">著者</Label>
                <Input
                  id="author"
                  name="author"
                  value={newBook.author}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  name="isbn"
                  value={newBook.isbn}
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
                  value={newBook.publishedYear.toString()}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="category">カテゴリー</Label>
                <Select name="category" value={newBook.category} onValueChange={(value) => setNewBook(prev => ({ ...prev, category: value }))}>
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
                  value={newBook.totalPages.toString()}
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
                  value={newBook.readPages.toString()}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max={newBook.totalPages.toString()}
                />
              </div>
              <div>
                <Label htmlFor="rating">評価</Label>
                <Select name="rating" value={newBook.rating.toString()} onValueChange={(value) => setNewBook(prev => ({ ...prev, rating: parseInt(value, 10) }))}>
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
              <div>
                <Label htmlFor="notes">メモ</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={newBook.notes}
                  onChange={handleInputChange}
                  placeholder="読書メモや感想を入力してください"
                />
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