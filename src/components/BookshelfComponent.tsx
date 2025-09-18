import React from 'react';
import './BookshelfComponent.css';
import type { Book } from '../types';

interface BookshelfComponentProps {
  showBookshelf: boolean;
  setShowBookshelf: (show: boolean) => void;
  closeOtherFeatures: (activeFeature: string) => void;
  books: Book[];
  booksLoading: boolean;
  showBookForm: boolean;
  setShowBookForm: (show: boolean) => void;
  editingBook: Book | null;
  setEditingBook: (book: Book | null) => void;
  bookTitle: string;
  setBookTitle: (title: string) => void;
  bookAuthor: string;
  setBookAuthor: (author: string) => void;
  bookIsbn: string;
  setBookIsbn: (isbn: string) => void;
  bookPublishedYear: number;
  setBookPublishedYear: (year: number) => void;
  bookTotalPages: number;
  setBookTotalPages: (pages: number) => void;
  bookCategory: string;
  setBookCategory: (category: string) => void;
  bookNotes: string;
  setBookNotes: (notes: string) => void;
  selectedBookCategory: string;
  setSelectedBookCategory: (category: string) => void;
  loading: boolean;
  loadBooks: () => void;
  handleCreateBook: (e: React.FormEvent) => void;
  handleUpdateBook: (e: React.FormEvent) => void;
  handleEditBook: (book: Book) => void;
  handleDeleteBook: (bookId: string, bookTitle: string) => void;
  handleBookCategoryChange: (category: string) => void;
  getBookCategories: () => string[];
  getReadingProgress: (book: Book) => number;
}

const BookshelfComponent: React.FC<BookshelfComponentProps> = ({
  showBookshelf,
  setShowBookshelf,
  closeOtherFeatures,
  books,
  booksLoading,
  showBookForm,
  setShowBookForm,
  editingBook,
  setEditingBook,
  bookTitle,
  setBookTitle,
  bookAuthor,
  setBookAuthor,
  bookIsbn,
  setBookIsbn,
  bookPublishedYear,
  setBookPublishedYear,
  bookTotalPages,
  setBookTotalPages,
  bookCategory,
  setBookCategory,
  bookNotes,
  setBookNotes,
  selectedBookCategory,
  setSelectedBookCategory,
  loading,
  loadBooks,
  handleCreateBook,
  handleUpdateBook,
  handleEditBook,
  handleDeleteBook,
  handleBookCategoryChange,
  getBookCategories,
  getReadingProgress,
}) => {
  return (
    <div className="bookshelf-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">
            <div className="mini-character">
              <div className="mini-character-halo"></div>
              <div className="mini-character-wings">
                <div className="mini-wing left-mini-wing"></div>
                <div className="mini-wing right-mini-wing"></div>
              </div>
              <div className="mini-character-face">
                <div className="mini-character-eyes">
                  <div className="mini-eye left-mini-eye"></div>
                  <div className="mini-eye right-mini-eye"></div>
                </div>
                <div className="mini-character-mouth"></div>
              </div>
              <div className="mini-character-body"></div>
              <div className="mini-sparkles">
                <div className="mini-sparkle mini-sparkle-1"></div>
                <div className="mini-sparkle mini-sparkle-2"></div>
              </div>
            </div>
          </span>
          本棚
        </h2>
        <div className="section-controls">
          {showBookshelf ? (
            <button
              onClick={() => {
                setShowBookshelf(false);
              }}
              className="close-section-button"
              title="セクションを閉じる"
            >
              ✕
            </button>
          ) : (
            <button
              onClick={() => {
                closeOtherFeatures("bookshelf");
                setShowBookshelf(true);
                if (books.length === 0) {
                  loadBooks();
                }
              }}
              className="show-section-button"
              title="セクションを表示"
            >
              ▶️
            </button>
          )}
        </div>
      </div>

      {showBookshelf && (
        <div className="bookshelf-content">
          <div className="bookshelf-header">
            <div className="bookshelf-controls">
              <div className="category-controls">
                <label htmlFor="bookCategoryFilter">
                  カテゴリ:
                </label>
                <select
                  id="bookCategoryFilter"
                  value={selectedBookCategory}
                  onChange={(e) =>
                    handleBookCategoryChange(e.target.value)
                  }
                >
                  <option value="all">すべて</option>
                  {getBookCategories().map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={loadBooks}
                className="refresh-button"
                title="本棚を更新"
              >
                🔄
              </button>
              {selectedBookCategory !== "all" && (
                <button
                  onClick={() => {
                    setSelectedBookCategory("all");
                    loadBooks();
                  }}
                  className="reset-button"
                  title="フィルターをリセット"
                >
                  🔄 リセット
                </button>
              )}
            </div>
          </div>
          <div className="bookshelf-stats">
            <div className="stat-card">
              <h3>総冊数</h3>
              <p className="stat-value">{books.length}</p>
            </div>
            <div className="stat-card">
              <h3>読了済み</h3>
              <p className="stat-value">
                {
                  books.filter(
                    (book) =>
                      book.readPages >= book.totalPages &&
                      book.totalPages > 0
                  ).length
                }
              </p>
            </div>
            <div className="stat-card">
              <h3>読書中</h3>
              <p className="stat-value">
                {
                  books.filter(
                    (book) =>
                      book.readPages > 0 &&
                      book.readPages < book.totalPages
                  ).length
                }
              </p>
            </div>
          </div>

          <div className="bookshelf-actions">
            <button
              onClick={() => {
                setEditingBook(null);
                setShowBookForm(!showBookForm);
                if (!showBookForm) {
                  setBookTitle("");
                  setBookAuthor("");
                  setBookIsbn("");
                  setBookPublishedYear(new Date().getFullYear());
                  setBookTotalPages(0);
                  setBookCategory("");
                  setBookNotes("");
                }
              }}
              className="add-book-button"
            >
              {showBookForm ? "キャンセル" : "本を追加"}
            </button>
          </div>

          {showBookForm && (
            <form
              onSubmit={
                editingBook ? handleUpdateBook : handleCreateBook
              }
              className="book-form"
            >
              <h3>{editingBook ? "本を編集" : "本を追加"}</h3>
              <div className="form-group">
                <label htmlFor="bookTitle">タイトル *</label>
                <input
                  type="text"
                  id="bookTitle"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="本のタイトルを入力してください"
                />
              </div>
              <div className="form-group">
                <label htmlFor="bookAuthor">著者 *</label>
                <input
                  type="text"
                  id="bookAuthor"
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="著者名を入力してください"
                />
              </div>
              <div className="form-group">
                <label htmlFor="bookIsbn">ISBN *</label>
                <input
                  type="text"
                  id="bookIsbn"
                  value={bookIsbn}
                  onChange={(e) => setBookIsbn(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="ISBNを入力してください"
                />
              </div>
              <div className="form-group">
                <label htmlFor="bookPublishedYear">
                  出版年 *
                </label>
                <input
                  type="number"
                  id="bookPublishedYear"
                  value={bookPublishedYear}
                  onChange={(e) =>
                    setBookPublishedYear(
                      parseInt(e.target.value) ||
                        new Date().getFullYear()
                    )
                  }
                  required
                  disabled={loading}
                  placeholder="出版年を入力してください"
                />
              </div>
              <div className="form-group">
                <label htmlFor="bookTotalPages">
                  総ページ数 *
                </label>
                <input
                  type="number"
                  id="bookTotalPages"
                  value={bookTotalPages}
                  onChange={(e) =>
                    setBookTotalPages(
                      parseInt(e.target.value) || 0
                    )
                  }
                  required
                  disabled={loading}
                  placeholder="総ページ数を入力してください"
                />
              </div>
              <div className="form-group">
                <label htmlFor="bookCategory">カテゴリ *</label>
                <select
                  id="bookCategory"
                  value={bookCategory}
                  onChange={(e) =>
                    setBookCategory(e.target.value)
                  }
                  required
                  disabled={loading}
                >
                  <option value="">選択してください</option>
                  <option value="小説">小説</option>
                  <option value="ノンフィクション">
                    ノンフィクション
                  </option>
                  <option value="技術書">技術書</option>
                  <option value="ビジネス">ビジネス</option>
                  <option value="自己啓発">自己啓発</option>
                  <option value="その他">その他</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="bookNotes">メモ</label>
                <textarea
                  id="bookNotes"
                  value={bookNotes}
                  onChange={(e) => setBookNotes(e.target.value)}
                  disabled={loading}
                  rows={3}
                  placeholder="メモを入力してください（任意）"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading
                  ? "処理中..."
                  : editingBook
                  ? "更新"
                  : "追加"}
              </button>
            </form>
          )}

          <div className="books-list">
            {booksLoading ? (
              <div className="data-loading">
                <div className="spinner"></div>
                <p>本を読み込み中...</p>
              </div>
            ) : books.length === 0 ? (
              <p className="no-books">本が登録されていません</p>
            ) : (
              books.map((book) => (
                <div key={book.id} className="book-item">
                  <div className="book-info">
                    <h3>{book.title}</h3>
                    <p className="book-author">{book.author}</p>
                    <p className="book-meta">
                      {book.publishedYear}年 |{" "}
                      <span
                        className="book-category clickable"
                        onClick={() =>
                          handleBookCategoryChange(book.category)
                        }
                        title={`${book.category}でフィルター`}
                      >
                        {book.category}
                      </span>{" "}
                      | {book.totalPages}ページ
                    </p>
                    {book.notes && (
                      <p className="book-notes">{book.notes}</p>
                    )}
                    <div className="reading-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${getReadingProgress(book)}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {book.readPages} / {book.totalPages}{" "}
                        ページ ({getReadingProgress(book)}%)
                      </span>
                    </div>
                  </div>
                  <div className="book-actions">
                    <button
                      onClick={() => handleEditBook(book)}
                      className="edit-button"
                    >
                      編集
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteBook(book.id, book.title)
                      }
                      className="delete-button"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookshelfComponent;
