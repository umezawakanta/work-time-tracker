import React, { useState } from 'react';
import './MemosComponent.css';
import type { Memo, Reply } from '../types';
import { EXCLUDED_MEMO_CATEGORIES } from '../utils/requestFormatters';

interface MemosComponentProps {
  memos: Memo[];
  publicMemos: Memo[];
  memosLoading: boolean;
  showMemos: boolean;
  setShowMemos: (show: boolean) => void;
  customCategories: string[];
  setCustomCategories: (categories: string[]) => void;
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
  memoTags: string;
  setMemoTags: (tags: string) => void;
  memoIsPublic: boolean;
  setMemoIsPublic: (isPublic: boolean) => void;
  memoIsFamilyOnly: boolean;
  setMemoIsFamilyOnly: (isFamilyOnly: boolean) => void;
  memoIsAdminOnly: boolean;
  setMemoIsAdminOnly: (isAdminOnly: boolean) => void;
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
  publicMemos,
  memosLoading,
  showMemos,
  setShowMemos,
  customCategories,
  user,
  setCustomCategories,
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
  memoTags,
  setMemoTags,
  memoIsPublic,
  setMemoIsPublic,
  memoIsFamilyOnly,
  setMemoIsFamilyOnly,
  memoIsAdminOnly,
  setMemoIsAdminOnly,
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
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  // ページネーションの状態
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // デフォルトカテゴリの削除状態管理
  const [deletedDefaultCategories, setDeletedDefaultCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem("deletedDefaultCategories");
    return saved ? JSON.parse(saved) : [];
  });

  // 機能選択肢の定義
  const featureOptions = [
    { value: "", label: "機能を選択してください", disabled: true },
    { value: "time-tracking", label: "時間管理" },
    { value: "cooking-timer", label: "料理タイマー" },
    { value: "projects", label: "プロジェクト" },
    { value: "reports", label: "レポート" },
    { value: "admin-panel", label: "管理者パネル" },
    { value: "bookshelf", label: "本棚" },
    { value: "memos", label: "メモ" },
    { value: "public-memos", label: "公開メモ" },
    { value: "work-records", label: "お仕事記録" },
    { value: "timers", label: "タイマー" },
    { value: "self-analysis", label: "じぶん図鑑" },
    { value: "general", label: "全般" },
    { value: "other", label: "その他" },
  ];



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

  // 返信セクションの開閉を切り替える関数
  const toggleReplies = (memoId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memoId)) {
        newSet.delete(memoId);
      } else {
        newSet.add(memoId);
      }
      return newSet;
    });
  };



  // 利用可能なカテゴリ一覧を取得（デフォルト + カスタム）
  const getAllCategories = () => {
    const defaultCategories = [
      "仕事", "学習", "趣味", "健康", "家族", "旅行", "読書", "映画", "音楽",
      "スポーツ", "料理", "その他",
    ];
    // 削除されたデフォルトカテゴリを除外
    const availableDefaultCategories = defaultCategories.filter(category => !deletedDefaultCategories.includes(category));
    return [...availableDefaultCategories, ...customCategories];
  };


  // 日時フォーマット関数
  const formatDateTime = (dateString: string) => {
    if (!dateString) {
      return '日付不明';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '無効な日付';
    }
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
    const allCategories = [...memoCategories, ...getAllCategories()];
    
    // 不具合報告・更新要望に関連するカテゴリを除外
    const excludedCategories = EXCLUDED_MEMO_CATEGORIES;
    
    const filteredCategories = allCategories.filter(category => 
      !excludedCategories.includes(category)
    );
    
    return Array.from(new Set(filteredCategories)).sort();
  };

  // メモの件数を計算する関数（個人メモ + 公開メモ）
  const getMemoCounts = () => {
    const allMemos = [...memos, ...publicMemos];
    const totalMemos = allMemos.length;
    const errorReports = allMemos.filter(memo => memo.postType === 'error_report').length;
    const updateRequests = allMemos.filter(memo => memo.postType === 'update_request').length;
    const generalMemos = allMemos.filter(memo => !memo.postType || memo.postType === 'general').length;
    
    return {
      total: totalMemos,
      errorReports,
      updateRequests,
      general: generalMemos
    };
  };





  return (
    <div className="memos-section">
      <div className="section-header">
        <div className="section-title">
          <h2>
            <i className="bi bi-journal-text section-icon"></i>
            メモ
            <span className="memo-count-badge">
              {getMemoCounts().total}件
            </span>
          </h2>
          <p className="section-description">
            個人的なメモや記録を保存・管理できます。
          </p>
          <div className="memo-stats">
            <span className="stat-item">
              <i className="bi bi-journal-text"></i>
              一般: {getMemoCounts().general}件
            </span>
            <span className="stat-item">
              <i className="bi bi-bug"></i>
              不具合報告: {getMemoCounts().errorReports}件
            </span>
            <span className="stat-item">
              <i className="bi bi-lightbulb"></i>
              更新要望: {getMemoCounts().updateRequests}件
            </span>
          </div>
        </div>
        <div className="section-controls">
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
            <div className="memos-header-left">
            </div>
            <div className="memos-header-right">
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
          </div>


          {/* カテゴリ管理ボタン */}
          <div className="memos-controls">
            <button
              onClick={() => setShowGenreManagement(!showGenreManagement)}
              className="category-management-button"
            >
              <i className="bi bi-tags"></i> カテゴリ管理
            </button>
          </div>

          {/* カテゴリ管理セクション */}
          {showGenreManagement && (
            <div className="category-management-section">
              <h3><i className="bi bi-tags"></i> カテゴリ管理</h3>
              
              {/* デフォルトカテゴリセクション */}
              <div className="default-categories-section">
                <h4><i className="bi bi-star"></i> デフォルトカテゴリ</h4>
                <div className="category-list">
                  {[
                    "仕事", "学習", "趣味", "健康", "家族", "旅行", "読書", "映画", "音楽",
                    "スポーツ", "料理", "要望、リクエスト", "その他",
                  ].map((category) => (
                    <div key={`default-${category}`} className="category-item default-category">
                      <div className="category-display">
                        <span className="category-name">{category}</span>
                        <span className="category-type">デフォルト</span>
                        <div className="category-actions">
                          {deletedDefaultCategories.includes(category) ? (
                            <button
                              onClick={() => {
                                const updated = deletedDefaultCategories.filter(cat => cat !== category);
                                setDeletedDefaultCategories(updated);
                                localStorage.setItem("deletedDefaultCategories", JSON.stringify(updated));
                              }}
                              className="restore-category-button"
                              title="復元"
                            >
                              <i className="bi bi-arrow-clockwise"></i>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const updated = [...deletedDefaultCategories, category];
                                setDeletedDefaultCategories(updated);
                                localStorage.setItem("deletedDefaultCategories", JSON.stringify(updated));
                              }}
                              className="delete-category-button"
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

              {/* カスタムカテゴリセクション */}
              <div className="custom-categories-section">
                <h4><i className="bi bi-plus-circle"></i> カスタムカテゴリ</h4>
                <div className="category-list">
                  {customCategories.map((category, index) => (
                  <div key={index} className="category-item">
                    {editingGenre === category ? (
                      <div className="category-edit-form">
                        <input
                          type="text"
                          value={editingGenreName}
                          onChange={(e) => setEditingGenreName(e.target.value)}
                          className="category-edit-input"
                          placeholder="カテゴリ名を入力"
                        />
                        <button
                          onClick={() => {
                            if (editingGenreName.trim() && editingGenreName.trim() !== category) {
                              const updatedCategories = customCategories.map(c => c === category ? editingGenreName.trim() : c);
                              setCustomCategories(updatedCategories);
                              setEditingGenre(null);
                              setEditingGenreName("");
                            }
                          }}
                          className="save-category-button"
                          disabled={!editingGenreName.trim() || editingGenreName.trim() === category}
                        >
                          保存
                        </button>
                        <button
                          onClick={() => {
                            setEditingGenre(null);
                            setEditingGenreName("");
                          }}
                          className="cancel-category-button"
                        >
                          キャンセル
                        </button>
                      </div>
                    ) : (
                      <div className="category-display">
                        <span className="category-name">{category}</span>
                        <div className="category-actions">
                          <button
                            onClick={() => {
                              setEditingGenre(category);
                              setEditingGenreName(category);
                            }}
                            className="edit-category-button"
                            title="編集"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            onClick={() => {
                              const updatedCategories = customCategories.filter(c => c !== category);
                              setCustomCategories(updatedCategories);
                            }}
                            className="delete-category-button"
                            title="削除"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  ))}
                  {customCategories.length === 0 && (
                    <p className="no-categories">カスタムカテゴリがありません</p>
                  )}
                </div>
              </div>

              {/* リセットボタン */}
              <div className="category-management-actions">
                <button
                  onClick={() => {
                    setDeletedDefaultCategories([]);
                    setCustomCategories([]);
                    localStorage.setItem("deletedDefaultCategories", JSON.stringify([]));
                    localStorage.setItem("customCategories", JSON.stringify([]));
                  }}
                  className="reset-all-categories-button"
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
              <div className="form-header">
                <h3>
                  {editingMemo ? "メモを編集" : "新しいメモを追加"}
                </h3>
                <p className="form-description">
                  個人的なメモや記録を作成します。
                </p>
              </div>
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
                      </div>
                    </div>
                    <div className="memo-content">
                      <p>{memo.content}</p>
                    </div>

                    {/* 返信セクション */}
                    <div className="replies-section">
                      <div 
                        className="replies-header"
                        onClick={() => toggleReplies(memo.id)}
                      >
                        <h4>
                          <i className="bi bi-chat-dots"></i>
                          返信 ({memo.replies?.length || 0})
                        </h4>
                        <button 
                          className="toggle-replies-button"
                          title={expandedReplies.has(memo.id) ? '返信を閉じる' : '返信を開く'}
                        >
                          <i className={`bi ${expandedReplies.has(memo.id) ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                        </button>
                      </div>
                      
                      {expandedReplies.has(memo.id) && (
                        <div className="replies-content">
                          {(memo.replies || []).length > 0 && (
                            <div className="replies-list">
                              {(memo.replies || []).map((reply: Reply) => (
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
                      )}
                    </div>

                    <div className="memo-actions">
                      <button
                        onClick={() => {
                          setMemoTitle(memo.title || '');
                          setMemoContent(memo.content || '');
                          setMemoCategory(memo.category || '');
                          setMemoIsPublic(memo.isPublic || false);
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

    </div>
  );
};

export default MemosComponent;
