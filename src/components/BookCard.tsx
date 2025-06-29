import React from 'react';
import { Book } from '../store/bookSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, Edit2, Trash2, ExternalLink } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onEdit, onDelete }) => {
  const readProgress = (book.readPages / book.totalPages) * 100;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{book.title}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(book)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="編集"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(book._id)}
              className="text-gray-500 hover:text-red-500"
              aria-label="削除"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">著者: {book.author}</p>
          <p className="text-sm text-gray-600">
            ISBN: {book.isbn}
            {book.isbn && (
              <a
                href={`https://www.amazon.co.jp/s?k=${book.isbn}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center text-blue-500 hover:text-blue-700"
                title={`Amazonで「${book.title}」を検索`}
                aria-label={`Amazonで「${book.title}」を検索（新しいタブで開きます）`}
              >
                <ExternalLink className="h-3 w-3" />
                <span className="sr-only">Amazonで検索</span>
              </a>
            )}
          </p>
          <p className="text-sm text-gray-600">出版年: {book.publishedYear}</p>
          <p className="text-sm text-gray-600">カテゴリー: {book.category}</p>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600">評価:</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= book.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>読了進捗</span>
              <span>
                {book.readPages} / {book.totalPages} ページ
              </span>
            </div>
            <Progress value={readProgress} className="h-2" />
          </div>
          {book.notes && (
            <p className="text-sm mt-2 p-2 bg-gray-50 rounded-md">
              <span className="font-medium">メモ:</span> {book.notes}
            </p>
          )}
          {book.lentTo && (
            <p className="text-sm text-amber-600">
              <span className="font-medium">貸出中:</span> {book.lentTo}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookCard;
