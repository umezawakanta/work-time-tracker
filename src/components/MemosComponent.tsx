import React, { useState } from 'react';
import './MemosComponent.css';
import type { Memo, Reply } from '../types';
import QuickReportModal from './QuickReportModal';

interface MemosComponentProps {
  memos: Memo[];
  memosLoading: boolean;
  showMemos: boolean;
  setShowMemos: (show: boolean) => void;
  customGenres: string[];
  setCustomGenres: (genres: string[]) => void;
  loadMemos: () => void;
  closeOtherFeatures: (activeFeature: string) => void;
  handleDeleteMemo: (memoId: string, memoTitle: string) => void;
  user: any;
  handleCreateMemo: (e: React.FormEvent) => void;
  handleUpdateMemo: (e: React.FormEvent) => void;
  editingMemo: Memo | null;
  setEditingMemo: (memo: Memo | null) => void;
  memoTitle: string;
  setMemoTitle: (title: string) => void;
  memoContent: string;
  setMemoContent: (content: string) => void;
  memoCategory: string;
  setMemoCategory: (category: string) => void;
  memoIsPublic: boolean;
  setMemoIsPublic: (isPublic: boolean) => void;
  memoPostType: string;
  setMemoPostType: (postType: string) => void;
  handleReplySubmit: (memoId: string) => void;
  handleReplyCancel: () => void;
  handleEditReply: (replyId: string, content: string) => void;
  handleSaveEditReply: (replyId: string) => void;
  handleCancelEditReply: () => void;
  handleDeleteReply: (replyId: string) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  replyingToMemo: string | null;
  setReplyingToMemo: (memoId: string | null) => void;
}

const MemosComponent: React.FC<MemosComponentProps> = ({
  memos,
  memosLoading,
  showMemos,
  setShowMemos,
  customGenres,
  user,
  setCustomGenres,
  loadMemos,
  closeOtherFeatures,
  handleDeleteMemo,
  handleCreateMemo,
  handleUpdateMemo,
  editingMemo,
  setEditingMemo,
  memoTitle,
  setMemoTitle,
  memoContent,
  setMemoContent,
  memoCategory,
  setMemoCategory,
  memoIsPublic,
  setMemoIsPublic,
  memoPostType,
  setMemoPostType,
  handleReplySubmit,
  handleReplyCancel,
  handleEditReply,
  handleSaveEditReply,
  handleCancelEditReply,
  handleDeleteReply,
  replyContent,
  setReplyContent,
  replyingToMemo,
  setReplyingToMemo,
}) => {
  // 内部状態
  const [showMemoForm, setShowMemoForm] = useState(false);
  const [selectedMemoCategory, setSelectedMemoCategory] = useState("all");
  const [showGenreManagement, setShowGenreManagement] = useState(false);
  const [editingGenre, setEditingGenre] = useState<string | null>(null);
  const [editingGenreName, setEditingGenreName] = useState("");
  // 返信関連の状態
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editingReplyContent, setEditingReplyContent] = useState("");
  // ページネーションの状態
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // デフォルトカテゴリの削除状態管理
  const [deletedDefaultCategories, setDeletedDefaultCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem("deletedDefaultCategories");
    return saved ? JSON.parse(saved) : [];
  });

  // 簡易報告機能の状態
  const [showQuickReport, setShowQuickReport] = useState(false);

  // 簡易報告のハンドラー
  const handleQuickReport = async (report: { title: string; content: string; type: 'bug' | 'feature' }) => {
    try {
      const response = await fetch('/api/memos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: report.title,
          content: report.content,
          category: report.type === 'bug' ? '不具合報告' : '機能要望',
          isPublic: true,
          postType: 'update-request'
        })
      });

      if (response.ok) {
        alert('報告を投稿しました！');
        loadMemos();
      } else {
        alert('報告の投稿に失敗しました。');
      }
    } catch (error) {
      console.error('報告の投稿エラー:', error);
      alert('報告の投稿に失敗しました。');
    }
  };

  // ページネーション用の関数
  const getPaginatedMemos = () => {
    // カテゴリでフィルタリング
    let filteredMemos = memos;
    if (selectedMemoCategory !== "all") {
      filteredMemos = memos.filter(memo => memo.category === selectedMemoCategory);
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredMemos.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    // カテゴリでフィルタリング
    let filteredMemos = memos;
    if (selectedMemoCategory !== "all") {
      filteredMemos = memos.filter(memo => memo.category === selectedMemoCategory);
    }
    return Math.ceil(filteredMemos.length / itemsPerPage);
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
    // 削除されたデフォルトカテゴリを除外
    const availableDefaultGenres = defaultGenres.filter(genre => !deletedDefaultCategories.includes(genre));
    return [...availableDefaultGenres, ...customGenres];
  };


  // 日時フォーマット関数
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '日付不明';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '無効な日付';
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
          <i className="bi bi-journal-text section-icon"></i>
          メモ
        </h2>
        <div className="section-controls">
          {showMemos && (
            <button
              onClick={() => setShowQuickReport(true)}
              className="quick-report-button"
              title="不具合報告・機能要望を投稿"
            >
              <i className="bi bi-bug"></i>
              報告
            </button>
          )}
          {showMemos ? (
            <button
              onClick={() => setShowMemos(false)}
              className="close-section-button"
              title="セクションを閉じる"
            >
              ✕
            </button>
          ) : (
            <button
              onClick={() => {
                closeOtherFeatures("memos");
                setShowMemos(true);
              }}
              className="show-section-button"
              title="セクションを表示"
            >
              <i className="bi bi-play-fill"></i>
            </button>
          )}
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
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>

          {/* ジャンル管理ボタン */}
          <div className="memos-controls">
            <button
              onClick={() => setShowGenreManagement(!showGenreManagement)}
              className="genre-management-button"
            >
              <i className="bi bi-tags"></i> ジャンル管理
            </button>
          </div>

          {/* ジャンル管理セクション */}
          {showGenreManagement && (
            <div className="genre-management-section">
              <h3><i className="bi bi-tags"></i> ジャンル管理</h3>
              
              {/* デフォルトカテゴリセクション */}
              <div className="default-categories-section">
                <h4><i className="bi bi-star"></i> デフォルトカテゴリ</h4>
                <div className="genre-list">
                  {[
                    "仕事", "学習", "趣味", "健康", "家族", "旅行", "読書", "映画", "音楽",
                    "スポーツ", "料理", "要望、リクエスト", "その他",
                  ].map((genre) => (
                    <div key={`default-${genre}`} className="genre-item default-genre">
                      <div className="genre-display">
                        <span className="genre-name">{genre}</span>
                        <span className="genre-type">デフォルト</span>
                        <div className="genre-actions">
                          {deletedDefaultCategories.includes(genre) ? (
                            <button
                              onClick={() => {
                                const updated = deletedDefaultCategories.filter(cat => cat !== genre);
                                setDeletedDefaultCategories(updated);
                                localStorage.setItem("deletedDefaultCategories", JSON.stringify(updated));
                              }}
                              className="restore-genre-button"
                              title="復元"
                            >
                              <i className="bi bi-arrow-clockwise"></i>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const updated = [...deletedDefaultCategories, genre];
                                setDeletedDefaultCategories(updated);
                                localStorage.setItem("deletedDefaultCategories", JSON.stringify(updated));
                              }}
                              className="delete-genre-button"
                              title="削除"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* カスタムジャンルセクション */}
              <div className="custom-categories-section">
                <h4><i className="bi bi-plus-circle"></i> カスタムジャンル</h4>
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
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            onClick={() => {
                              const updatedGenres = customGenres.filter(g => g !== genre);
                              setCustomGenres(updatedGenres);
                            }}
                            className="delete-genre-button"
                            title="削除"
                          >
                            <i className="bi bi-trash"></i>
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

              {/* リセットボタン */}
              <div className="genre-management-actions">
                <button
                  onClick={() => {
                    setDeletedDefaultCategories([]);
                    setCustomGenres([]);
                    localStorage.setItem("deletedDefaultCategories", JSON.stringify([]));
                    localStorage.setItem("customGenres", JSON.stringify([]));
                  }}
                  className="reset-all-genres-button"
                  title="すべてのカテゴリをリセット"
                >
                  <i className="bi bi-arrow-clockwise"></i> すべてリセット
                </button>
              </div>
            </div>
          )}

          {/* メモフォーム */}
          {showMemoForm && (
            <form
              onSubmit={editingMemo ? handleUpdateMemo : handleCreateMemo}
              className="memo-form"
            >
              <div className="form-group">
                <label htmlFor="memoTitle">タイトル（任意）</label>
                <input
                  type="text"
                  id="memoTitle"
                  value={memoTitle}
                  onChange={(e) => setMemoTitle(e.target.value)}
                  placeholder="空欄の場合は本文の一行目がタイトルになります"
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
                <label htmlFor="memoPostType">投稿タイプ</label>
                <select
                  id="memoPostType"
                  value={memoPostType}
                  onChange={(e) => setMemoPostType(e.target.value)}
                  required
                >
                  <option value="normal">通常のメモ</option>
                  <option value="update_request">更新要望</option>
                  <option value="admin_only">管理者限定</option>
                  <option value="family_only">家族限定</option>
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
            <div className="memos-actions">
              <button
                onClick={() => {
                  setMemoTitle("");
                  setMemoContent("");
                  setMemoCategory("");
                  setMemoIsPublic(false);
                  setMemoPostType("normal");
                  setShowMemoForm(true);
                }}
                className="create-memo-button"
              >
                <i className="bi bi-plus-circle"></i> 新しいメモを作成
              </button>
            </div>
            
            <div className="memos-filters">
              <select
                value={selectedMemoCategory}
                onChange={(e) => {
                  setSelectedMemoCategory(e.target.value);
                  setCurrentPage(1);
                }}
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

            {/* ページネーション（上部） */}
            {getTotalPages() > 1 && (
              <div className="pagination pagination-top">
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

            {/* ページ情報（上部） */}
            <div className="pagination-info pagination-info-top">
              {memos.length > 0 && (
                <p>
                  {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, memos.length)} / {memos.length} 件
                </p>
              )}
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
                        <span 
                          className="memo-category clickable-category"
                          onClick={() => {
                            setSelectedMemoCategory(memo.category);
                            setCurrentPage(1);
                          }}
                          title={`${memo.category}でフィルター`}
                        >
                          {memo.category}
                        </span>
                        <span className="memo-date">
                          作成: {formatDateTime(memo.createdAt)}
                        </span>
                        {memo.updatedAt !== memo.createdAt && (
                          <span className="memo-updated">
                            更新: {formatDateTime(memo.updatedAt)}
                          </span>
                        )}
                        <span className="memo-author">
                          by {memo.author || user?.displayName || 'あなた'}
                        </span>
                        {!memo.isPublic && (
                          <span className="private-badge"><i className="bi bi-lock"></i> プライベート</span>
                        )}
                        {memo.postType === 'update_request' && (
                          <span className="update-request-badge"><i className="bi bi-lightbulb"></i> 更新要望</span>
                        )}
                        {memo.postType === 'admin_only' && (
                          <span className="admin-only-badge"><i className="bi bi-shield-lock"></i> 管理者限定</span>
                        )}
                        {memo.postType === 'family_only' && (
                          <span className="family-only-badge"><i className="bi bi-people"></i> 家族限定</span>
                        )}
                      </div>
                    </div>
                    <div className="memo-content">
                      <p>{memo.content}</p>
                    </div>

                    {/* 返信セクション */}
                    <div className="replies-section">
                      <h4>返信 ({memo.replies?.length || 0})</h4>
                      
                      {memo.replies && memo.replies.length > 0 && (
                        <div className="replies-list">
                          {memo.replies.map((reply: Reply) => (
                            <div key={reply.id} className="reply-item">
                              <div className="reply-content">
                                {editingReply === reply.id ? (
                                  <div className="reply-edit-form">
                                    <textarea
                                      value={editingReplyContent}
                                      onChange={(e) => setEditingReplyContent(e.target.value)}
                                      className="reply-edit-textarea"
                                      rows={3}
                                      aria-label="返信を編集"
                                    />
                                    <div className="reply-edit-actions">
                                      <button
                                        onClick={() => handleSaveEditReply(reply.id)}
                                        className="save-reply-button"
                                      >
                                        保存
                                      </button>
                                      <button
                                        onClick={handleCancelEditReply}
                                        className="cancel-reply-button"
                                      >
                                        キャンセル
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p>{reply.content}</p>
                                )}
                              </div>
                              <div className="reply-meta">
                                <span className="reply-date">
                                  {formatDateTime(reply.createdAt)}
                                </span>
                                <span className="reply-author">
                                  by {reply.author || user?.displayName || 'あなた'}
                                </span>
                                <div className="reply-actions">
                                  <button
                                    onClick={() => {
                                      setEditingReply(reply.id);
                                      setEditingReplyContent(reply.content);
                                    }}
                                    className="edit-reply-button"
                                    title="編集"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReply(reply.id)}
                                    className="delete-reply-button"
                                    title="削除"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 返信フォーム */}
                      {replyingToMemo === memo.id ? (
                        <div className="reply-form">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="reply-textarea"
                            rows={3}
                            placeholder="返信を入力..."
                            aria-label="返信を入力"
                          />
                          <div className="reply-form-actions">
                            <button
                              onClick={() => handleReplySubmit(memo.id)}
                              className="submit-reply-button"
                              disabled={!replyContent.trim()}
                            >
                              返信
                            </button>
                            <button
                              onClick={handleReplyCancel}
                              className="cancel-reply-button"
                            >
                              キャンセル
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setReplyingToMemo(memo.id);
                            setReplyContent("");
                          }}
                          className="reply-button"
                        >
                          💬 返信
                        </button>
                      )}
                    </div>

                    <div className="memo-actions">
                      <button
                        onClick={() => {
                          setMemoTitle(memo.title || '');
                          setMemoContent(memo.content || '');
                          setMemoCategory(memo.category || '');
                          setMemoIsPublic(memo.isPublic || false);
                          setMemoPostType(memo.postType || 'normal');
                          setShowMemoForm(true);
                        }}
                        className="edit-button"
                        title="編集"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteMemo(memo.id, getMemoTitle(memo));
                        }}
                        className="delete-button"
                        title="削除"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}

              </>
            )}
          </div>
        </div>
      )}

      {/* 簡易報告モーダル */}
      <QuickReportModal
        isOpen={showQuickReport}
        onClose={() => setShowQuickReport(false)}
        onSubmit={handleQuickReport}
      />
    </div>
  );
};

export default MemosComponent;
