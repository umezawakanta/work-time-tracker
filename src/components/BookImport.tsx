import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDispatch } from 'react-redux';
import { addBook } from '../store/bookSlice';
import { AppDispatch } from '../store';

const BookImport: React.FC = () => {
  const [isbn, setIsbn] = useState('');
  const dispatch = useDispatch<AppDispatch>();

  const handleImport = async () => {
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const bookInfo = data.items[0].volumeInfo;
        const newBook = {
          title: bookInfo.title || 'Unknown Title',
          author: bookInfo.authors ? bookInfo.authors.join(', ') : 'Unknown Author',
          isbn: isbn,
          publishedYear: bookInfo.publishedDate
            ? parseInt(bookInfo.publishedDate.substring(0, 4))
            : new Date().getFullYear(),
          totalPages: bookInfo.pageCount || 0,
          readPages: 0,
          category: bookInfo.categories ? bookInfo.categories[0] : '未分類',
          rating: 0,
          notes: '',
          lentTo: '',
        };

        await dispatch(addBook(newBook));
        setIsbn('');
        alert('本が正常にインポートされました。');
      } else {
        alert('指定されたISBNの本が見つかりませんでした。');
      }
    } catch (error) {
      console.error('本のインポート中にエラーが発生しました:', error);
      alert('本のインポート中にエラーが発生しました。');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ISBNで本をインポート</CardTitle>
      </CardHeader>
      <CardContent className="flex space-x-2">
        <Input
          type="text"
          placeholder="ISBN"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
        />
        <Button onClick={handleImport}>インポート</Button>
      </CardContent>
    </Card>
  );
};

export default BookImport;
