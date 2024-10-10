import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import {
  Book,
  fetchBooks,
  addBook,
  updateBook,
  removeBook,
} from "../store/bookSlice";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BookCard from "./BookCard";
import { toast } from "@/components/ui/use-toast";

const initialBookState: Omit<Book, "_id" | "createdAt"> = {
  title: "",
  author: "",
  isbn: "",
  publishedYear: new Date().getFullYear(),
  totalPages: 0,
  readPages: 0,
  category: "",
  rating: 0,
};

const categories = ["小説", "ノンフィクション", "技術書", "その他"];

export default function BookShelf() {
  const dispatch = useDispatch<AppDispatch>();
  const { books, status, error } = useSelector((state: RootState) => state.book);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newBook, setNewBook] = useState<Omit<Book, "_id" | "createdAt">>(initialBookState);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchBooks());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (editingBook) {
      setNewBook({
        title: editingBook.title,
        author: editingBook.author,
        isbn: editingBook.isbn,
        publishedYear: editingBook.publishedYear,
        totalPages: editingBook.totalPages,
        readPages: editingBook.readPages,
        category: editingBook.category,
        rating: editingBook.rating,
      });
    } else {
      setNewBook(initialBookState);
    }
  }, [editingBook]);

  useEffect(() => {
    if (error) {
      toast({
        title: "エラー",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setNewBook((prev) => ({
        ...prev,
        [name]: ["publishedYear", "totalPages", "readPages", "rating"].includes(name)
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
          title: "成功",
          description: "本が正常に更新されました。",
        });
      } else {
        await dispatch(addBook(newBook)).unwrap();
        toast({
          title: "成功",
          description: "新しい本が正常に追加されました。",
        });
      }
      setIsDialogOpen(false);
      setEditingBook(null);
      setNewBook(initialBookState);
    } catch (error) {
      console.error("本の保存中にエラーが発生しました:", error);
      toast({
        title: "エラー",
        description: "本の保存中にエラーが発生しました。",
        variant: "destructive",
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
          title: "成功",
          description: "本が正常に削除されました。",
        });
      } catch (error) {
        console.error("本の削除中にエラーが発生しました:", error);
        toast({
          title: "エラー",
          description: "本の削除中にエラーが発生しました。",
          variant: "destructive",
        });
      }
    },
    [dispatch]
  );

  const filteredBooks = useMemo(() => {
    return books.filter(
      (book) =>
        (book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedCategory === "all" || book.category === selectedCategory)
    );
  }, [books, searchTerm, selectedCategory]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

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
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setIsDialogOpen(true)}>本を追加</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBooks.map((book) => (
          <BookCard
            key={book._id}
            book={book}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBook ? "本を編集" : "新しい本を追加"}
            </DialogTitle>
            <DialogDescription>
              {editingBook
                ? "本の情報を更新してください。"
                : "新しい本の情報を入力してください。"}
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
                  onValueChange={(value) =>
                    setNewBook((prev) => ({ ...prev, category: value }))
                  }
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
                        {rating} {rating === 1 ? "星" : "星"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">{editingBook ? "更新" : "追加"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}