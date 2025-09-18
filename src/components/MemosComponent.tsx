import React, { useState } from 'react';
import './MemosComponent.css';
import type { Memo } from '../types';

interface MemosComponentProps {
  memos: Memo[];
  memosLoading: boolean;
  showMemos: boolean;
  setShowMemos: (show: boolean) => void;
  customGenres: string[];
  setCustomGenres: (genres: string[]) => void;
  loadMemos: () => void;
  closeOtherFeatures: (activeFeature: string) => void;
}

const MemosComponent: React.FC<MemosComponentProps> = ({
  memos,
  memosLoading,
  showMemos,
  setShowMemos,
  customGenres,
  setCustomGenres,
  loadMemos,
  closeOtherFeatures,
}) => {
  // 内部状態
  const [showMemoForm, setShowMemoForm] = useState(false);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [memoTitle, setMemoTitle] = useState("");
  const [memoContent, setMemoContent] = useState("");
  const [memoCategory, setMemoCategory] = useState("");
  const [memoIsPublic, setMemoIsPublic] = useState(false);
  const [selectedMemoCategory, setSelectedMemoCategory] = useState("all");
  const [showGenreManagement, setShowGenreManagement] = useState(false);
  const [editingGenre, setEditingGenre] = useState<string | null>(null);
  const [editingGenreName, setEditingGenreName] = useState("");
  // ページネーションの状態
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ページネーション用の関数
  const getPaginatedMemos = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return memos.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(memos.length / itemsPerPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const resetForm = () => {
    setMemoTitle("");
    setMemoContent("");
    setMemoCategory("");
    setMemoIsPublic(false);
    setEditingMemo(null);
    setShowMemoForm(false);
  };



  // 利用可能なジャンル一覧を取得（デフォルト + カスタム）
  const getAllGenres = () => {
    const defaultGenres = [
      "仕事", "学習", "趣味", "健康", "家族", "旅行", "読書", "映画", "音楽",
      "スポーツ", "料理", "要望、リクエスト", "その他",
    ];
    return [...defaultGenres, ...customGenres];
  };


  // 日時フォーマット関数
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // メモのタイトルを取得するヘルパー関数
  const getMemoTitle = (memo: Memo): string => {
    if (memo.title && memo.title.trim()) {
      return memo.title;
    }
    // タイトルが空の場合は内容の一行目を返す
    const firstLine = memo.content.split("\n")[0].trim();
    return firstLine || "無題のメモ";
  };

  // メモカテゴリを取得する関数
  const getMemoCategories = () => {
    const memoCategories = new Set(memos.map((memo) => memo.category));
    const allCategories = [...memoCategories, ...getAllGenres()];
    return Array.from(new Set(allCategories)).sort();
  };





  return (
    <div className="memos-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">📝</span>
          メモ
        </h2>
        <div className="section-controls">
          <button
            onClick={() => {
              closeOtherFeatures("memos");
              setShowMemos(true);
            }}
            className="show-section-button"
            title="セクションを表示"
          >
            ▶️
          </button>
        </div>
      </div>

      {showMemos && (
        <div className="memos-content">
          <div className="memos-header">
            <button
              onClick={() => {
                loadMemos();
              }}
              className="refresh-button"
              title="メモを更新"
            >
              🔄
            </button>
          </div>

          {/* ジャンル管理ボタン */}
          <div className="memos-controls">
            <button
              onClick={() => setShowGenreManagement(!showGenreManagement)}
              className="genre-management-button"
            >
              🏷️ ジャンル管理
            </button>
          </div>

          {/* ジャンル管理セクション */}
          {showGenreManagement && (
            <div className="genre-management-section">
              <h3>🏷️ ジャンル管理</h3>
              <div className="genre-list">
                {customGenres.map((genre, index) => (
                  <div key={index} className="genre-item">
                    {editingGenre === genre ? (
                      <div className="genre-edit-form">
                        <input
                          type="text"
                          value={editingGenreName}
                          onChange={(e) => setEditingGenreName(e.target.value)}
                          className="genre-edit-input"
                          placeholder="ジャンル名を入力"
                        />
                        <button
                          onClick={() => {
                            if (editingGenreName.trim() && editingGenreName.trim() !== genre) {
                              const updatedGenres = customGenres.map(g => g === genre ? editingGenreName.trim() : g);
                              setCustomGenres(updatedGenres);
                              setEditingGenre(null);
                              setEditingGenreName("");
                            }
                          }}
                          className="save-genre-button"
                          disabled={!editingGenreName.trim() || editingGenreName.trim() === genre}
                        >
                          保存
                        </button>
                        <button
                          onClick={() => {
                            setEditingGenre(null);
                            setEditingGenreName("");
                          }}
                          className="cancel-genre-button"
                        >
                          キャンセル
                        </button>
                      </div>
                    ) : (
                      <div className="genre-display">
                        <span className="genre-name">{genre}</span>
                        <div className="genre-actions">
                          <button
                            onClick={() => {
                              setEditingGenre(genre);
                              setEditingGenreName(genre);
                            }}
                            className="edit-genre-button"
                            title="編集"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              const updatedGenres = customGenres.filter(g => g !== genre);
                              setCustomGenres(updatedGenres);
                            }}
                            className="delete-genre-button"
                            title="削除"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {customGenres.length === 0 && (
                  <p className="no-genres">カスタムジャンルがありません</p>
                )}
              </div>
            </div>
          )}

          {/* メモフォーム */}
          {showMemoForm && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // メモの作成・更新機能（実装予定）
                console.log('メモ送信:', editingMemo ? '更新' : '作成');
                resetForm();
              }}
              className="memo-form"
            >
              <div className="form-group">
                <label htmlFor="memoTitle">タイトル</label>
                <input
                  type="text"
                  id="memoTitle"
                  value={memoTitle}
                  onChange={(e) => setMemoTitle(e.target.value)}
                  placeholder="メモのタイトルを入力"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="memoContent">内容</label>
                <textarea
                  id="memoContent"
                  value={memoContent}
                  onChange={(e) => setMemoContent(e.target.value)}
                  placeholder="メモの内容を入力"
                  rows={6}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="memoCategory">カテゴリ</label>
                <select
                  id="memoCategory"
                  value={memoCategory}
                  onChange={(e) => setMemoCategory(e.target.value)}
                  required
                >
                  <option value="">カテゴリを選択</option>
                  {getMemoCategories().map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={memoIsPublic}
                    onChange={(e) => setMemoIsPublic(e.target.checked)}
                  />
                  公開メモ
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  {editingMemo ? "更新" : "作成"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="cancel-button"
                >
                  キャンセル
                </button>
              </div>
            </form>
          )}

          {/* メモ一覧 */}
          <div className="memos-list">
            <div className="memos-filters">
              <select
                value={selectedMemoCategory}
                onChange={(e) => setSelectedMemoCategory(e.target.value)}
                className="category-filter"
                aria-label="カテゴリでフィルター"
              >
                <option value="all">すべてのカテゴリ</option>
                {getMemoCategories().map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {memosLoading ? (
              <div className="data-loading">
                <div className="spinner"></div>
                <p>メモを読み込み中...</p>
              </div>
            ) : memos.length === 0 ? (
              <p className="no-memos">メモが登録されていません</p>
            ) : (
              <>
                {getPaginatedMemos().map((memo) => (
                  <div key={memo.id} className="memo-item">
                    <div className="memo-header">
                      <h3>{getMemoTitle(memo)}</h3>
                      <div className="memo-meta">
                        <span className="memo-category">{memo.category}</span>
                        <span className="memo-date">
                          {formatDateTime(memo.updatedAt)}
                        </span>
                        {!memo.isPublic && (
                          <span className="private-badge">🔒 プライベート</span>
                        )}
                      </div>
                    </div>
                    <div className="memo-content">
                      <p>{memo.content}</p>
                    </div>
                    <div className="memo-actions">
                      <button
                        onClick={() => {
                          setEditingMemo(memo);
                          setMemoTitle(memo.title || '');
                          setMemoContent(memo.content || '');
                          setMemoCategory(memo.category || '');
                          setMemoIsPublic(memo.isPublic || false);
                          setShowMemoForm(true);
                        }}
                        className="edit-button"
                        title="編集"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => {
                          // メモ削除機能（実装予定）
                          console.log('メモ削除:', memo.id, getMemoTitle(memo));
                        }}
                        className="delete-button"
                        title="削除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}

                {/* ページネーション */}
                {getTotalPages() > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-button prev"
                    >
                      ← 前へ
                    </button>
                    
                    <div className="pagination-numbers">
                      {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`pagination-button number ${
                            currentPage === page ? 'active' : ''
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === getTotalPages()}
                      className="pagination-button next"
                    >
                      次へ →
                    </button>
                  </div>
                )}

                {/* ページ情報 */}
                <div className="pagination-info">
                  {memos.length > 0 && (
                    <p>
                      {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, memos.length)} / {memos.length} 件
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemosComponent;
