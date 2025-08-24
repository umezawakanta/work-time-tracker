import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { Book, fetchBooks, addBook, updateBook, removeBook } from '../store/bookSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatisticsDashboard from './dashboard/StatisticsDashboard';
import ReadingChallenge from './ReadingChallenge';
import BookRecommendations from './BookRecommendations';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import '../styles/BookShelf.css';

const initialBookState: Omit<Book, '_id' | 'createdAt'> = {
  title: '',
  author: '',
  isbn: '',
  publishedYear: new Date().getFullYear(),
  totalPages: 0,
  readPages: 0,
  category: '',
  rating: 0,
  notes: '',
  lentTo: '',
};

const categories = ['小説', 'ノンフィクション', '技術書', 'その他'];

export default function BookShelf() {
  const dispatch = useDispatch<AppDispatch>();
  const { books, status, error } = useSelector((state: RootState) => state.book);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [newBook, setNewBook] = useState<Omit<Book, '_id' | 'createdAt'>>(initialBookState);
  const tags = useState<string[]>([])[0];
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [readingStatus, setReadingStatus] = useState<'all' | 'reading' | 'completed'>('all');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBooks());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (editingBook) {
      setNewBook({
        ...editingBook,
        notes: editingBook.notes || '',
        lentTo: editingBook.lentTo || '',
      });
    } else {
      setNewBook(initialBookState);
    }
  }, [editingBook]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'エラー',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setNewBook((prev) => ({
        ...prev,
        [name]: ['publishedYear', 'totalPages', 'readPages', 'rating'].includes(name)
          ? Math.max(0, parseInt(value, 10) || 0)
          : value,
      }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBook) {
        await dispatch(updateBook({ ...editingBook, ...newBook })).unwrap();
        toast({
          title: '成功',
          description: '本が正常に更新されました。',
        });
      } else {
        await dispatch(addBook(newBook)).unwrap();
        toast({
          title: '成功',
          description: '新しい本が正常に追加されました。',
        });
      }
      setIsDialogOpen(false);
      setEditingBook(null);
      setNewBook(initialBookState);
    } catch (error) {
      console.error('本の保存中にエラーが発生しました:', error);
      toast({
        title: 'エラー',
        description: '本の保存中にエラーが発生しました。',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = useCallback((book: Book) => {
    setEditingBook(book);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await dispatch(removeBook(id)).unwrap();
        toast({
          title: '成功',
          description: '本が正常に削除されました。',
        });
      } catch (error) {
        console.error('本の削除中にエラーが発生しました:', error);
        toast({
          title: 'エラー',
          description: '本の削除中にエラーが発生しました。',
          variant: 'destructive',
        });
      }
    },
    [dispatch]
  );

  const handleTagChange = (tag: string) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag) ? prevTags.filter((t) => t !== tag) : [...prevTags, tag]
    );
  };

  const filteredAndSortedBooks = useMemo(() => {
    return books
      .filter(
        (book) =>
          (book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (selectedCategory === 'all' || book.category === selectedCategory) &&
          (selectedTags.length === 0 || selectedTags.every((tag) => book.tags?.includes(tag))) &&
          (readingStatus === 'all' ||
            (readingStatus === 'reading' && book.readPages < book.totalPages) ||
            (readingStatus === 'completed' && book.readPages === book.totalPages))
      )
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'author') return a.author.localeCompare(b.author);
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'progress') return b.readPages / b.totalPages - a.readPages / a.totalPages;
        return 0;
      });
  }, [books, searchTerm, selectedCategory, selectedTags, sortBy, readingStatus]);

  if (status === 'loading') {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="books" className="w-full">
        <TabsList>
          <TabsTrigger value="books">本棚</TabsTrigger>
          <TabsTrigger value="stats">統計</TabsTrigger>
          <TabsTrigger value="challenge">読書チャレンジ</TabsTrigger>
          <TabsTrigger value="recommendations">おすすめ</TabsTrigger>
        </TabsList>
        <TabsContent value="books">
          <div className="flex space-x-2 mb-4">
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
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={readingStatus}
              onValueChange={(value: 'all' | 'reading' | 'completed') => setReadingStatus(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="読書状況" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全て</SelectItem>
                <SelectItem value="reading">読書中</SelectItem>
                <SelectItem value="completed">読了</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="並び替え" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">タイトル</SelectItem>
                <SelectItem value="author">著者</SelectItem>
                <SelectItem value="rating">評価</SelectItem>
                <SelectItem value="progress">進捗</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setView(view === 'grid' ? 'list' : 'grid')}>
              {view === 'grid' ? 'リスト表示' : 'グリッド表示'}
            </Button>
            <Button onClick={() => setIsDialogOpen(true)}>本を追加</Button>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                onClick={() => handleTagChange(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
          {view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedBooks.map((book) => (
                <Card key={book._id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{book.title}</CardTitle>
                    <CardDescription>{book.author}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex justify-between items-center mb-4">
                      <div className="circular-progress-container">
                        <CircularProgressbar
                          value={(book.readPages / book.totalPages) * 100}
                          text={`${Math.round((book.readPages / book.totalPages) * 100)}%`}
                        />
                      </div>
                      <div>
                        <p>
                          ページ: {book.readPages} / {book.totalPages}
                        </p>
                        <p>評価: {book.rating} / 5</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      カテゴリー: {book.category}
                    </p>
                    {book.notes && (
                      <div className="mt-2">
                        <h4 className="font-semibold dark:text-white">メモ:</h4>
                        <p className="text-sm dark:text-gray-300">{book.notes}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(book)}>
                      編集
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(book._id)}>
                      削除
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAndSortedBooks.map((book) => (
                <div
                  key={book._id}
                  className="flex items-center justify-between p-2 border rounded dark:border-gray-700"
                >
                  <div>
                    <h3 className="font-semibold dark:text-white">{book.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{book.author}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge>{book.category}</Badge>
                    <Progress value={(book.readPages / book.totalPages) * 100} className="w-24" />
                    <Button variant="outline" size="sm" onClick={() => handleEdit(book)}>
                      編集
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(book._id)}>
                      削除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="stats">
          <StatisticsDashboard books={books} />
        </TabsContent>
        <TabsContent value="challenge">
          <ReadingChallenge books={books} />
        </TabsContent>
        <TabsContent value="recommendations">
          <BookRecommendations books={books} />
        </TabsContent>
      </Tabs>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg z-50">
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
                  value={newBook.publishedYear}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">カテゴリー</Label>
                <Select
                  name="category"
                  value={newBook.category}
                  onValueChange={(value) => setNewBook((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリーを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
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
                  value={newBook.totalPages}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="readPages">読了ページ</Label>
                <Input
                  id="readPages"
                  name="readPages"
                  type="number"
                  value={newBook.readPages}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rating">評価</Label>
                <Select
                  name="rating"
                  value={newBook.rating.toString()}
                  onValueChange={(value) =>
                    setNewBook((prev) => ({
                      ...prev,
                      rating: parseInt(value, 10),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="評価を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} {rating === 1 ? '星' : '星'}
                      </SelectItem>
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
                />
              </div>
              <div>
                <Label htmlFor="lentTo">貸出先</Label>
                <Input
                  id="lentTo"
                  name="lentTo"
                  value={newBook.lentTo}
                  onChange={handleInputChange}
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
}
