import React, { useState, useEffect } from 'react';
import './PublicMemosComponent.css';
import type { Memo, Reply, User } from '../types';

interface PublicMemosComponentProps {
  publicMemos: Memo[];
  publicMemosLoading: boolean;
  showPublicMemos: boolean;
  setShowPublicMemos: (show: boolean) => void;
  user: User | null;
  loadPublicMemos: () => void;
  closeOtherFeatures: (activeFeature: string) => void;
  handleReplySubmit: (memoId: string) => void;
  handleReplyCancel: () => void;
  handleEditReply: (replyId: string, content: string) => void;
  handleSaveEditReply: (replyId: string) => void;
  handleCancelEditReply: () => void;
  handleDeleteReply: (replyId: string) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
}

const PublicMemosComponent: React.FC<PublicMemosComponentProps> = ({
  publicMemos,
  publicMemosLoading,
  showPublicMemos,
  setShowPublicMemos,
  user,
  loadPublicMemos,
  closeOtherFeatures,
  handleReplySubmit,
  handleReplyCancel,
  handleEditReply,
  handleSaveEditReply,
  handleCancelEditReply,
  handleDeleteReply,
  replyContent,
  setReplyContent,
}) => {
  // 内部状態
  const [publicMemoSelectedDate, setPublicMemoSelectedDate] = useState<Date | null>(null);
  const [publicMemoCurrentMonth, setPublicMemoCurrentMonth] = useState(new Date());
  const [selectedPublicMemoCategory, setSelectedPublicMemoCategory] = useState("all");
  const [publicMemoSearchTerm, setPublicMemoSearchTerm] = useState("");
  const [replyingToMemo, setReplyingToMemo] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editingReplyContent, setEditingReplyContent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ページネーション用の関数
  const getPaginatedMemos = () => {
    let filteredMemos = publicMemos || [];
    
    // カテゴリでフィルタリング
    if (selectedPublicMemoCategory !== "all") {
      filteredMemos = filteredMemos.filter(memo => memo.category === selectedPublicMemoCategory);
    }
    
    // 検索語でフィルタリング
    if (publicMemoSearchTerm.trim()) {
      const searchTerm = publicMemoSearchTerm.toLowerCase();
      filteredMemos = filteredMemos.filter(memo => 
        memo.title.toLowerCase().includes(searchTerm) ||
        memo.content.toLowerCase().includes(searchTerm) ||
        memo.category.toLowerCase().includes(searchTerm)
      );
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredMemos.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    let filteredMemos = publicMemos || [];
    
    // カテゴリでフィルタリング
    if (selectedPublicMemoCategory !== "all") {
      filteredMemos = filteredMemos.filter(memo => memo.category === selectedPublicMemoCategory);
    }
    
    // 検索語でフィルタリング
    if (publicMemoSearchTerm.trim()) {
      const searchTerm = publicMemoSearchTerm.toLowerCase();
      filteredMemos = filteredMemos.filter(memo => 
        memo.title.toLowerCase().includes(searchTerm) ||
        memo.content.toLowerCase().includes(searchTerm) ||
        memo.category.toLowerCase().includes(searchTerm)
      );
    }
    
    return Math.ceil(filteredMemos.length / itemsPerPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 返信関連の関数はpropsから受け取る

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

  // 利用可能なジャンル一覧を取得（デフォルト + カスタム）
  const getAllGenres = () => {
    const defaultGenres = [
      "仕事", "学習", "趣味", "健康", "家族", "旅行", "読書", "映画", "音楽",
      "スポーツ", "料理", "要望、リクエスト", "その他",
    ];
    return defaultGenres;
  };

  // 公開メモカテゴリを取得する関数
  const getPublicMemoCategories = () => {
    const memoCategories = new Set((publicMemos || []).map((memo) => memo.category));
    const allCategories = [...memoCategories, ...getAllGenres()];
    return Array.from(new Set(allCategories)).sort();
  };

  // 選択された日付の公開メモを取得
  const getPublicMemosForDate = (date: Date) => {
    const dateString = date.toDateString();
    return (publicMemos || []).filter(memo => {
      const memoDate = new Date(memo.createdAt).toDateString();
      return memoDate === dateString;
    });
  };

  // カレンダーの日付を生成
  const getCalendarDays = () => {
    const year = publicMemoCurrentMonth.getFullYear();
    const month = publicMemoCurrentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // 月の統計を計算
  const getMonthlyStats = () => {
    const year = publicMemoCurrentMonth.getFullYear();
    const month = publicMemoCurrentMonth.getMonth();
    
    const monthlyMemos = publicMemos.filter(memo => {
      const memoDate = new Date(memo.createdAt);
      return memoDate.getFullYear() === year && memoDate.getMonth() === month;
    });
    
    return {
      totalMemos: monthlyMemos.length,
      categories: [...new Set(monthlyMemos.map(memo => memo.category))].length,
      mostActiveDay: getMostActiveDay(monthlyMemos),
    };
  };

  // 最もアクティブな日を取得
  const getMostActiveDay = (memos: Memo[]) => {
    const dayCounts: { [key: string]: number } = {};
    
    memos.forEach(memo => {
      const day = new Date(memo.createdAt).getDate();
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    
    const mostActiveDay = Object.entries(dayCounts).length > 0 
      ? Object.entries(dayCounts).reduce((a, b) => 
          dayCounts[a[0]] > dayCounts[b[0]] ? a : b
        )
      : ['', 0];
    
    return mostActiveDay ? parseInt(String(mostActiveDay[0])) : null;
  };

  const monthlyStats = getMonthlyStats();

  return (
    <div className="public-memos-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">🌍</span>
          公開メモ
        </h2>
        <div className="section-controls">
          {showPublicMemos ? (
            <button
              onClick={() => setShowPublicMemos(false)}
              className="close-section-button"
              title="セクションを閉じる"
            >
              ✕
            </button>
          ) : (
            <button
              onClick={() => {
                closeOtherFeatures("public-memos");
                setShowPublicMemos(true);
                if (publicMemos.length === 0) {
                  loadPublicMemos();
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

      {showPublicMemos && (
        <div className="public-memos-content">
          <div className="public-memos-header">
            <button
              onClick={loadPublicMemos}
              className="refresh-button"
              title="公開メモを更新"
            >
              🔄
            </button>
          </div>

          {/* 月別統計 */}
          <div className="monthly-stats">
            <h3>📊 {publicMemoCurrentMonth.getFullYear()}年{publicMemoCurrentMonth.getMonth() + 1}月の統計</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">総メモ数</span>
                <span className="stat-value">{monthlyStats.totalMemos}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">カテゴリ数</span>
                <span className="stat-value">{monthlyStats.categories}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">最もアクティブな日</span>
                <span className="stat-value">
                  {monthlyStats.mostActiveDay ? `${monthlyStats.mostActiveDay}日` : 'なし'}
                </span>
              </div>
            </div>
          </div>

          {/* カレンダー表示 */}
          <div className="public-memo-calendar">
            <div className="calendar-header">
              <button
                onClick={() => {
                  const newMonth = new Date(publicMemoCurrentMonth);
                  newMonth.setMonth(newMonth.getMonth() - 1);
                  setPublicMemoCurrentMonth(newMonth);
                }}
                className="calendar-nav-button"
              >
                ← 前月
              </button>
              <h3>
                {publicMemoCurrentMonth.getFullYear()}年{publicMemoCurrentMonth.getMonth() + 1}月
              </h3>
              <button
                onClick={() => {
                  const newMonth = new Date(publicMemoCurrentMonth);
                  newMonth.setMonth(newMonth.getMonth() + 1);
                  setPublicMemoCurrentMonth(newMonth);
                }}
                className="calendar-nav-button"
              >
                次月 →
              </button>
            </div>
            
            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                  <div key={day} className="weekday">{day}</div>
                ))}
              </div>
              
              <div className="calendar-days">
                {getCalendarDays().map((date, index) => {
                  const isCurrentMonth = date.getMonth() === publicMemoCurrentMonth.getMonth();
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isSelected = publicMemoSelectedDate?.toDateString() === date.toDateString();
                  const memosForDate = getPublicMemosForDate(date);
                  
                  return (
                    <div
                      key={index}
                      className={`calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${memosForDate.length > 0 ? 'has-memos' : ''}`}
                      onClick={() => setPublicMemoSelectedDate(date)}
                    >
                      <span className="day-number">{date.getDate()}</span>
                      {memosForDate.length > 0 && (
                        <div className="memo-indicator">
                          <span className="memo-count">{memosForDate.length}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 検索・フィルター */}
          <div className="public-memo-controls">
            <div className="search-controls">
              <input
                type="text"
                placeholder="公開メモを検索..."
                value={publicMemoSearchTerm}
                onChange={(e) => {
                  setPublicMemoSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
              />
              <button
                onClick={() => {
                  // 検索機能（実装予定）
                  console.log('検索:', publicMemoSearchTerm);
                }}
                className="search-button"
              >
                検索
              </button>
            </div>
            
            <div className="category-controls">
              <select
                value={selectedPublicMemoCategory}
                onChange={(e) => {
                  setSelectedPublicMemoCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="category-select"
                aria-label="カテゴリでフィルター"
              >
                <option value="all">すべてのカテゴリ</option>
                {getPublicMemoCategories().map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {(selectedPublicMemoCategory !== "all" || publicMemoSearchTerm) && (
              <button
                onClick={() => {
                  setSelectedPublicMemoCategory("all");
                  setPublicMemoSearchTerm("");
                  setCurrentPage(1);
                  loadPublicMemos();
                }}
                className="reset-button"
                title="フィルターをリセット"
              >
                🔄 リセット
              </button>
            )}
          </div>

          {/* 公開メモ一覧 */}
          <div className="public-memos-list">
            {publicMemosLoading ? (
              <div className="data-loading">
                <div className="spinner"></div>
                <p>公開メモを読み込み中...</p>
              </div>
            ) : getPaginatedMemos().length === 0 ? (
              <p className="no-memos">公開メモがありません</p>
            ) : (
              <>
                {getPaginatedMemos().map((memo) => (
                  <div key={memo.id} className="public-memo-item">
                    <div className="memo-header">
                      <h3>{getMemoTitle(memo)}</h3>
                      <div className="memo-meta">
                        <span 
                          className="memo-category clickable-category"
                          onClick={() => {
                            setSelectedPublicMemoCategory(memo.category);
                            setCurrentPage(1);
                          }}
                          title={`${memo.category}でフィルター`}
                        >
                          {memo.category}
                        </span>
                        <span className="memo-date">
                          {formatDateTime(memo.createdAt)}
                        </span>
                        <span className="author-info">
                          by {memo.author || '匿名'}
                        </span>
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
                    
                    {memo.tags && memo.tags.length > 0 && (
                      <div className="memo-tags">
                        {memo.tags.map((tag, index) => (
                          <span key={index} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
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
                                {user && (user.email === reply.authorEmail || user.role === 'admin') && (
                                  <div className="reply-actions">
                                    <button
                                      onClick={() => handleEditReply(reply.id, reply.content)}
                                      className="edit-reply-button"
                                    >
                                      編集
                                    </button>
                                    <button
                                      onClick={() => handleDeleteReply(reply.id)}
                                      className="delete-reply-button"
                                    >
                                      削除
                                    </button>
                                  </div>
                                )}
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
                            placeholder="返信を入力..."
                            className="reply-textarea"
                            rows={3}
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
                          onClick={() => setReplyingToMemo(memo.id)}
                          className="reply-button"
                        >
                          返信する
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* ページネーション */}
                <div className="pagination-controls">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    前へ
                  </button>
                  {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={currentPage === page ? "active" : ""}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === getTotalPages()}
                  >
                    次へ
                  </button>
                  <span className="page-info">
                    ページ {currentPage} / {getTotalPages()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicMemosComponent;
