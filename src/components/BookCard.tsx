import React, { memo } from 'react';
import { Book } from '../store/bookSlice';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2, Edit, Star } from "lucide-react";

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
}

const BookCard: React.FC<BookCardProps> = memo(({ book, onEdit, onDelete }) => {
  return (
    <div className="border p-4 rounded-lg shadow">
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
      <div className="mt-4 flex justify-end space-x-2">
        <Button variant="outline" size="icon" onClick={() => onEdit(book)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onDelete(book._id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

export default BookCard;