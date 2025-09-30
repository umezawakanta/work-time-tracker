import React, { useState, useEffect, useRef } from 'react';
import './PublicMemosComponent.css';
import './LikeButton.css';
import type { Memo, Reply, User } from '../types';
import { EXCLUDED_MEMO_CATEGORIES } from '../utils/requestFormatters';
import LikeButton from './LikeButton';

interface PublicMemosComponentProps {
  publicMemos: Memo[];
  showPublicMemos: boolean;
  setShowPublicMemos: (show: boolean) => void;
  user: User | null;
  loadPublicMemos: () => Promise<void>;
  closeOtherFeatures: (activeFeature: string) => void;
  handleReplySubmit: (memoId: string) => void;
  handleReplyCancel: () => void;
  handleEditReply: (replyId: string, content: string) => void;
  handleSaveEditReply: (replyId: string) => void;
  handleCancelEditReply: () => void;
  handleDeleteReply: (replyId: string) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onUpdateMemoStatus?: (memoId: string, status: string) => Promise<void>;
  onUpdateMemoTags?: (memoId: string, tags: string[]) => Promise<void>;
  onEditMemo?: (memo: Memo) => void;
  onDeleteMemo?: (memoId: string) => Promise<void>;
  deletingMemoId?: string | null;
}

const PublicMemosComponent: React.FC<PublicMemosComponentProps> = ({
  publicMemos,
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
  onUpdateMemoStatus,
  onUpdateMemoTags,
  onEditMemo,
  onDeleteMemo,
  deletingMemoId,
}) => {
  // 公開メモのローディング状態をPublicMemosComponent内で管理
  const [publicMemosLoading, setPublicMemosLoading] = useState(false);
  
  // いいね状態管理
  const [memoLikes, setMemoLikes] = useState<{ [memoId: string]: { isLiked: boolean; likeCount: number } }>({});
  
  // フィルタリング状態
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [excludeTags, setExcludeTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // 安全ないいね状態の初期化（エラーハンドリング強化版）
  const initializeLikeStates = async () => {
    if (publicMemos.length === 0) {
      console.log('公開メモが空のため、いいね状態の初期化をスキップします');
      return;
    }
    
    if (isInitializing) {
      console.log('いいね状態の初期化は既に実行中です');
      return;
    }
    
    console.log(`いいね状態を初期化中... (メモ数: ${publicMemos.length})`);
    
    try {
      const likeStates: { [memoId: string]: { isLiked: boolean; likeCount: number } } = {};
      let errorCount = 0;
      const maxErrors = 5; // 最大エラー数を増加
      
      // 認証トークンの確認
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('認証トークンが見つからないため、いいね状態の初期化をスキップします');
        return;
      }
      
      // より小さなバッチサイズで安全に処理
      const batchSize = 3;
      const batches = [];
      for (let i = 0; i < publicMemos.length; i += batchSize) {
        batches.push(publicMemos.slice(i, i + batchSize));
      }
      
      for (const batch of batches) {
        // バッチ間で少し待機（API負荷軽減）
        if (batches.indexOf(batch) > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const promises = batch.map(async (memo) => {
          try {
            console.log(`いいね状態を取得中: ${memo.id}`);
            
            // タイムアウト付きのfetch
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒でタイムアウト
            
            const response = await fetch(`/api/memos/${memo.id}/like`, {
              headers: {
                'Authorization': `Bearer ${token}`
              },
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
              // 404エラーは無視（メモが存在しない場合）
              if (response.status === 404) {
                console.warn(`メモが見つかりません: ${memo.id}`);
                return {
                  memoId: memo.id,
                  isLiked: false,
                  likeCount: 0
                };
              }
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            if (data.success) {
              console.log(`いいね状態取得成功: ${memo.id}`, data);
              return {
                memoId: memo.id,
                isLiked: data.isLiked,
                likeCount: data.likeCount
              };
            }
            return null;
          } catch (error) {
            errorCount++;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.warn(`いいね状態の取得をスキップしました (メモID: ${memo.id}):`, errorMessage);
            
            // エラーが多すぎる場合は処理を中断
            if (errorCount >= maxErrors) {
              console.error(`エラーが${maxErrors}回発生したため、いいね状態の初期化を中断します`);
              return null; // エラーを投げずにnullを返す
            }
            
            return {
              memoId: memo.id,
              isLiked: false,
              likeCount: 0
            };
          }
        });
        
        try {
          const results = await Promise.allSettled(promises);
          results.forEach((result) => {
            if (result.status === 'fulfilled' && result.value) {
              likeStates[result.value.memoId] = {
                isLiked: result.value.isLiked,
                likeCount: result.value.likeCount
              };
            }
          });
        } catch (error) {
          console.error('バッチ処理中にエラーが発生しました:', error);
        }
      }
      
      console.log('いいね状態の初期化完了:', likeStates);
      setMemoLikes(likeStates);
    } catch (error) {
      console.error('いいね状態の初期化でエラーが発生しました:', error);
      // エラーが発生してもアプリケーションを停止させない
    }
  };
  
  // ソート状態
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // ステータス・タグ編集状態
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('');
  const [editingTags, setEditingTags] = useState<string>('');
  
  // 削除確認ダイアログ状態
  const [deleteConfirmMemo, setDeleteConfirmMemo] = useState<Memo | null>(null);
  
  // ローディング状態管理
  const [isLoading, setIsLoading] = useState(false);

  // いいね状態を初期化（初回のみ実行）
  const [isInitializing, setIsInitializing] = useState(false);
  const hasInitialized = useRef(false);
  
  // 安全ないいね状態の初期化
  useEffect(() => {
    if (publicMemos.length > 0 && !hasInitialized.current && !isInitializing) {
      hasInitialized.current = true;
      setIsInitializing(true);
      initializeLikeStates().finally(() => {
        setIsInitializing(false);
      });
    }
  }, [publicMemos.length, isInitializing]);

  // publicMemosが変更されたら初期化フラグをリセット
  useEffect(() => {
    hasInitialized.current = false;
  }, [publicMemos]);

  // 公開メモの読み込み関数をPublicMemosComponent内で定義
  const loadPublicMemosLocal = async () => {
    setPublicMemosLoading(true);
    try {
      await loadPublicMemos();
    } finally {
      setPublicMemosLoading(false);
    }
  };

  // フィルタリングされたメモを取得
  const getFilteredMemos = () => {
    const filtered = publicMemos.filter(memo => {
      // 日付フィルター
      if (filterByDate) {
        const filterYear = filterByDate.getFullYear();
        const filterMonth = filterByDate.getMonth();
        const filterDay = filterByDate.getDate();
        
        const memoDate = new Date(memo.createdAt);
        const memoYear = memoDate.getFullYear();
        const memoMonth = memoDate.getMonth();
        const memoDay = memoDate.getDate();
        
        if (!(memoYear === filterYear && memoMonth === filterMonth && memoDay === filterDay)) {
          return false;
        }
      }
      
      // ステータスフィルター
      if (statusFilter !== 'all' && memo.status !== statusFilter) {
        return false;
      }
      
      // タグフィルター（含む）
      if (tagFilter && !memo.tags.some(tag => 
        tag.toLowerCase().includes(tagFilter.toLowerCase())
      )) {
        return false;
      }
      
      // タグフィルター（除外）
      if (excludeTags.length > 0 && memo.tags.some(tag => 
        excludeTags.some(excludeTag => 
          tag.toLowerCase().includes(excludeTag.toLowerCase())
        )
      )) {
        return false;
      }
      
      // カテゴリフィルター
      if (selectedPublicMemoCategory !== "all" && memo.category !== selectedPublicMemoCategory) {
        return false;
      }
      
      // 検索語フィルター
      if (publicMemoSearchTerm.trim()) {
        const searchTerm = publicMemoSearchTerm.toLowerCase();
        if (!memo.title.toLowerCase().includes(searchTerm) &&
            !memo.content.toLowerCase().includes(searchTerm) &&
            !memo.category.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }
      
      return true;
    });
    
    // ソートを適用
    return filtered.sort((a, b) => {
      const aDate = new Date(a[sortBy]);
      const bDate = new Date(b[sortBy]);
      
      if (sortOrder === 'asc') {
        return aDate.getTime() - bDate.getTime();
      } else {
        return bDate.getTime() - aDate.getTime();
      }
    });
  };

  // ステータス更新
  const handleStatusUpdate = async (memoId: string, newStatus: string) => {
    if (onUpdateMemoStatus && !isLoading) {
      setIsLoading(true);
      try {
        await onUpdateMemoStatus(memoId, newStatus);
        
        // ステータス更新後、フィルター条件を維持したまま更新されたメモを表示
        // フィルターをリセットしない
        
        setEditingMemoId(null);
        setEditingStatus('');
      } catch (error) {
        console.error('PublicMemosComponent: ステータス更新エラー:', error);
        alert('ステータス更新に失敗しました');
      } finally {
        setIsLoading(false);
      }
    } else if (isLoading) {
      // 処理中のため無視
    } else {
      console.error('PublicMemosComponent: onUpdateMemoStatus is not provided');
    }
  };

  // タグ更新
  const handleTagsUpdate = async (memoId: string, newTags: string) => {
    if (onUpdateMemoTags && !isLoading) {
      setIsLoading(true);
      try {
        const tagsArray = newTags.split(',').map(tag => tag.trim()).filter(tag => tag);
        await onUpdateMemoTags(memoId, tagsArray);
        
        // タグ更新後、フィルター条件を維持したまま更新されたメモを表示
        setEditingMemoId(null);
        setEditingTags('');
      } catch (error) {
        console.error('タグ更新エラー:', error);
        alert('タグ更新に失敗しました');
      } finally {
        setIsLoading(false);
      }
    } else if (isLoading) {
      // 処理中のため無視
    }
  };

  // 編集開始
  const startEditing = (memo: Memo) => {
    setEditingMemoId(memo.id);
    setEditingStatus(memo.status || 'pending');
    setEditingTags(memo.tags.join(', '));
  };

  // 編集キャンセル
  const cancelEditing = () => {
    setEditingMemoId(null);
    setEditingStatus('');
    setEditingTags('');
  };

  // 除外タグの追加/削除
  const toggleExcludeTag = (tag: string) => {
    setExcludeTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // メモの所有者判定
  const isMemoOwner = (memo: Memo) => {
    if (!user) {
      return false;
    }
    return memo.author === user.email || memo.author === user.displayName;
  };

  // 削除確認
  const handleDeleteConfirm = (memo: Memo) => {
    setDeleteConfirmMemo(memo);
  };

  // 削除実行
  const handleDeleteExecute = async () => {
    if (deleteConfirmMemo && onDeleteMemo && !isLoading) {
      setIsLoading(true);
      try {
        await onDeleteMemo(deleteConfirmMemo.id);
        setDeleteConfirmMemo(null);
      } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました');
      } finally {
        setIsLoading(false);
      }
    } else if (isLoading) {
      // 処理中のため無視
    }
  };

  // 削除キャンセル
  const handleDeleteCancel = () => {
    setDeleteConfirmMemo(null);
  };

  // 内部状態
  const [publicMemoSelectedDate, setPublicMemoSelectedDate] = useState<Date | null>(null);
  const [publicMemoCurrentMonth, setPublicMemoCurrentMonth] = useState(new Date());
  const [selectedPublicMemoCategory, setSelectedPublicMemoCategory] = useState("all");
  const [publicMemoSearchTerm, setPublicMemoSearchTerm] = useState("");
  const [replyingToMemo, setReplyingToMemo] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editingReplyContent, setEditingReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // 日付フィルタリング用の状態
  const [filterByDate, setFilterByDate] = useState<Date | null>(null);

  // ページネーション用の関数
  const getPaginatedMemos = () => {
    const filteredMemos = getFilteredMemos();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return filteredMemos.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredMemos().length / itemsPerPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  // 返信関連の関数はpropsから受け取る

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
    return memo.content.split("\n")[0].trim() || "無題のメモ";
  };

  // 利用可能なジャンル一覧を取得（デフォルト + カスタム）
  const getAllGenres = () => {
    return [
      "仕事", "学習", "趣味", "健康", "家族", "旅行", "読書", "映画", "音楽",
      "スポーツ", "料理", "その他",
    ];
  };

  // 公開メモカテゴリを取得する関数
  const getPublicMemoCategories = () => {
    const memoCategories = new Set((publicMemos || []).map((memo) => memo.category));
    const allCategories = [...memoCategories, ...getAllGenres()];
    
    // 不具合報告・更新要望に関連するカテゴリを除外
    const excludedCategories = EXCLUDED_MEMO_CATEGORIES;
    
    const filteredCategories = allCategories.filter(category => 
      !excludedCategories.includes(category)
    );
    
    return Array.from(new Set(filteredCategories)).sort();
  };

  // 選択された日付の公開メモを取得
  const getPublicMemosForDate = (date: Date) => {
    const filterYear = date.getFullYear();
    const filterMonth = date.getMonth();
    const filterDay = date.getDate();
    
    return (publicMemos || []).filter(memo => {
      const memoDate = new Date(memo.createdAt);
      const memoYear = memoDate.getFullYear();
      const memoMonth = memoDate.getMonth();
      const memoDay = memoDate.getDate();
      
      return memoYear === filterYear && memoMonth === filterMonth && memoDay === filterDay;
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

  // 公開メモの件数を計算する関数
  const getPublicMemoCounts = () => {
    const totalMemos = publicMemos.length;
    const errorReports = publicMemos.filter(memo => memo.postType === 'error_report').length;
    const updateRequests = publicMemos.filter(memo => memo.postType === 'update_request').length;
    const generalMemos = publicMemos.filter(memo => !memo.postType || memo.postType === 'general').length;
    
    return {
      total: totalMemos,
      errorReports,
      updateRequests,
      general: generalMemos
    };
  };

  return (
    <div className="public-memos-section">
      <div className="section-header">
        <div className="section-title">
          <h2>
            <span className="section-icon">🌍</span>
            公開メモ
            <span className="memo-count-badge">
              {getPublicMemoCounts().total}件
            </span>
          </h2>
          <p className="section-description">
            他のユーザーと共有できる公開メモを閲覧できます。不具合報告や改善要望は専用ボタンから送信してください。
          </p>
          <div className="memo-stats">
            <span className="stat-item">
              <i className="bi bi-journal-text"></i>
              一般: {getPublicMemoCounts().general}件
            </span>
            <span className="stat-item">
              <i className="bi bi-bug"></i>
              不具合報告: {getPublicMemoCounts().errorReports}件
            </span>
            <span className="stat-item">
              <i className="bi bi-lightbulb"></i>
              更新要望: {getPublicMemoCounts().updateRequests}件
            </span>
          </div>
        </div>
        <div className="section-controls">
          {showPublicMemos && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="filter-button"
              title="フィルター"
            >
              🔍
            </button>
          )}
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
                  loadPublicMemosLocal();
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
              onClick={loadPublicMemosLocal}
              className="refresh-button"
              title="公開メモを更新"
            >
              🔄
            </button>
          </div>

          {/* フィルタリングUI */}
          {showFilters && (
            <div className="filter-panel">
              <h3>🔍 フィルター設定</h3>
              
              {/* ステータスフィルター */}
              <div className="filter-group">
                <label htmlFor="status-filter">ステータス:</label>
                <select 
                  id="status-filter"
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="ステータスでフィルター"
                >
                  <option value="all">すべて</option>
                  <option value="pending">保留中</option>
                  <option value="in_progress">進行中</option>
                  <option value="resolved">解決済み</option>
                  <option value="closed">閉鎖</option>
                </select>
              </div>

              {/* タグフィルター（含む） */}
              <div className="filter-group">
                <label>タグ（含む）:</label>
                <input
                  type="text"
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  placeholder="タグ名を入力..."
                />
              </div>

              {/* タグフィルター（除外） */}
              <div className="filter-group">
                <label>除外タグ:</label>
                <div className="exclude-tags">
                  {Array.from(new Set(publicMemos.flatMap(memo => memo.tags))).map(tag => (
                    <button
                      key={tag}
                      className={`exclude-tag ${excludeTags.includes(tag) ? 'active' : ''}`}
                      onClick={() => toggleExcludeTag(tag)}
                    >
                      {tag} {excludeTags.includes(tag) ? '✓' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-actions">
                <button 
                  onClick={() => {
                    setStatusFilter('all');
                    setTagFilter('');
                    setExcludeTags([]);
                  }}
                  className="clear-filters-button"
                >
                  フィルタークリア
                </button>
              </div>
            </div>
          )}

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
                      onClick={() => {
                        setPublicMemoSelectedDate(date);
                        setFilterByDate(date);
                        setCurrentPage(1); // ページを1にリセット
                      }}
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
                disabled={isLoading || publicMemosLoading}
              >
                {isLoading || publicMemosLoading ? '検索中...' : '検索'}
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
            
            <div className="sort-controls">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'createdAt' | 'updatedAt');
                  setCurrentPage(1);
                }}
                className="sort-select"
                aria-label="ソート項目"
              >
                <option value="createdAt">作成日</option>
                <option value="updatedAt">更新日</option>
              </select>
              
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value as 'asc' | 'desc');
                  setCurrentPage(1);
                }}
                className="sort-order-select"
                aria-label="ソート順序"
              >
                <option value="desc">降順（新しい順）</option>
                <option value="asc">昇順（古い順）</option>
              </select>
            </div>
            
            {(selectedPublicMemoCategory !== "all" || publicMemoSearchTerm || filterByDate || sortBy !== 'createdAt' || sortOrder !== 'desc') && (
              <button
                onClick={() => {
                  setSelectedPublicMemoCategory("all");
                  setPublicMemoSearchTerm("");
                  setFilterByDate(null);
                  setSortBy('createdAt');
                  setSortOrder('desc');
                  setCurrentPage(1);
                  loadPublicMemosLocal();
                }}
                className="reset-button"
                title="フィルターとソートをリセット"
                disabled={isLoading || publicMemosLoading}
              >
                {isLoading || publicMemosLoading ? '🔄 処理中...' : '🔄 リセット'}
              </button>
            )}
          </div>

          {/* フィルター・ソート情報表示 */}
          {(filterByDate || sortBy !== 'createdAt' || sortOrder !== 'desc') && (
            <div className="filter-info">
              {filterByDate && (
                <span className="filter-label">
                  <i className="bi bi-calendar"></i>
                  日付フィルター: {filterByDate.toLocaleDateString('ja-JP', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  <button
                    onClick={() => {
                      setFilterByDate(null);
                      setCurrentPage(1);
                    }}
                    className="clear-filter-button"
                    title="日付フィルターをクリア"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </span>
              )}
              
              <span className="sort-label">
                <i className="bi bi-sort-down"></i>
                ソート: {sortBy === 'createdAt' ? '作成日' : '更新日'} 
                {sortOrder === 'desc' ? '（新しい順）' : '（古い順）'}
              </span>
            </div>
          )}

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
            {getFilteredMemos().length > 0 && (
              <p>
                {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, getFilteredMemos().length)} / {getFilteredMemos().length} 件
              </p>
            )}
          </div>

          {/* 公開メモ一覧 */}
          <div className="public-memos-list">
            {publicMemosLoading ? (
              <div className="data-loading">
                <div className="spinner"></div>
                <p>公開メモを読み込み中...</p>
              </div>
            ) : getFilteredMemos().length === 0 ? (
              <p className="no-memos">フィルター条件に合う公開メモがありません</p>
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
                        
                        {/* ステータス表示・編集 */}
                        <div className="memo-status">
                          {editingMemoId === memo.id ? (
                            <div className="status-edit">
                              <select 
                                value={editingStatus} 
                                onChange={(e) => setEditingStatus(e.target.value)}
                                className="status-select"
                                aria-label="ステータスを選択"
                              >
                                <option value="pending">保留中</option>
                                <option value="in_progress">進行中</option>
                                <option value="resolved">解決済み</option>
                                <option value="closed">閉鎖</option>
                              </select>
                              <button 
                                onClick={() => {
                                  handleStatusUpdate(memo.id, editingStatus);
                                }}
                                className="save-button"
                                disabled={isLoading}
                              >
                                {isLoading ? '保存中...' : '保存'}
                              </button>
                              <button 
                                onClick={cancelEditing}
                                className="cancel-button"
                              >
                                キャンセル
                              </button>
                            </div>
                          ) : (
                            <span 
                              className={`status-badge status-${memo.status || 'pending'}`}
                              onClick={() => {
                                startEditing(memo);
                              }}
                              title="クリックしてステータスを編集"
                            >
                              {memo.status === 'pending' && '⏳ 保留中'}
                              {memo.status === 'in_progress' && '🔄 進行中'}
                              {memo.status === 'resolved' && '✅ 解決済み'}
                              {memo.status === 'closed' && '🔒 閉鎖'}
                              {!memo.status && '⏳ 保留中'}
                            </span>
                          )}
                        </div>
                        
                        <span className="memo-date">
                          作成: {formatDateTime(memo.createdAt)}
                        </span>
                        {memo.updatedAt && memo.updatedAt !== memo.createdAt && (
                          <span className="memo-updated">
                            更新: {formatDateTime(memo.updatedAt)}
                          </span>
                        )}
                        <span className="author-info">
                          by {memo.author || '匿名'}
                        </span>
                        {memo.postType === 'update_request' && (
                          <span className="update-request-badge"><i className="bi bi-lightbulb"></i> 更新要望</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="memo-content">
                      <p>{memo.content}</p>
                    </div>
                    
                    {/* いいねボタン */}
                    <div className="memo-actions">
                      {!isInitializing && memoLikes[memo.id] !== undefined ? (
                        <LikeButton
                          memoId={memo.id}
                          authorId={memo.userId}
                          initialLikeCount={memoLikes[memo.id]?.likeCount || 0}
                          initialIsLiked={memoLikes[memo.id]?.isLiked || false}
                          onLikeChange={(likeCount, isLiked) => {
                            setMemoLikes(prev => ({
                              ...prev,
                              [memo.id]: { isLiked, likeCount }
                            }));
                          }}
                          onRewardReceived={(reward) => {
                            console.log('いいね報酬を受信しました:', reward);
                            // ここで報酬通知を表示することも可能
                          }}
                          className="memo-like-button"
                        />
                      ) : isInitializing ? (
                        <div className="like-loading">
                          <span>⏳ 読み込み中...</span>
                        </div>
                      ) : (
                        <div className="like-loading">
                          <span>🤍 0</span>
                        </div>
                      )}
                    </div>
                    
                    {/* タグ表示・編集 */}
                    <div className="memo-tags-section">
                      {editingMemoId === memo.id ? (
                        <div className="tags-edit">
                          <input
                            type="text"
                            value={editingTags}
                            onChange={(e) => setEditingTags(e.target.value)}
                            placeholder="タグをカンマ区切りで入力..."
                            className="tags-input"
                          />
                          <button 
                            onClick={() => handleTagsUpdate(memo.id, editingTags)}
                            className="save-button"
                            disabled={isLoading}
                          >
                            {isLoading ? '保存中...' : '保存'}
                          </button>
                          <button 
                            onClick={cancelEditing}
                            className="cancel-button"
                          >
                            キャンセル
                          </button>
                        </div>
                      ) : (
                        <div className="memo-tags">
                          {memo.tags && memo.tags.length > 0 ? (
                            memo.tags.map((tag, index) => (
                              <span 
                                key={index} 
                                className="tag clickable-tag"
                                onClick={() => {
                                  setTagFilter(tag);
                                  setShowFilters(true);
                                }}
                                title={`${tag}でフィルター`}
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="no-tags">タグなし</span>
                          )}
                          <button 
                            onClick={() => startEditing(memo)}
                            className="edit-tags-button"
                            title="タグを編集"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* メモ操作ボタン（所有者のみ） */}
                    {isMemoOwner(memo) && (
                      <div className="memo-actions">
                        <button
                          onClick={() => onEditMemo?.(memo)}
                          className="edit-memo-button"
                          title="メモを編集"
                        >
                          ✏️ 編集
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(memo)}
                          className="delete-memo-button"
                          title="メモを削除"
                          disabled={deletingMemoId === memo.id}
                        >
                          {deletingMemoId === memo.id ? (
                            <i className="bi bi-arrow-clockwise spin"></i>
                          ) : (
                            '🗑️ 削除'
                          )}
                        </button>
                      </div>
                    )}
                    
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
                                      by {reply.author || '匿名'}
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
                      )}
                    </div>
                  </div>
                ))}
                
              </>
            )}
          </div>

          {/* ページネーション（下部） */}
          {getTotalPages() > 1 && (
            <div className="pagination pagination-bottom">
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

          {/* ページ情報（下部） */}
          <div className="pagination-info pagination-info-bottom">
            {getFilteredMemos().length > 0 && (
              <p>
                {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, getFilteredMemos().length)} / {getFilteredMemos().length} 件
              </p>
            )}
          </div>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      {deleteConfirmMemo && (
        <div className="delete-confirm-modal">
          <div className="delete-confirm-content">
            <h3>メモを削除しますか？</h3>
            <div className="delete-confirm-memo">
              <h4>{deleteConfirmMemo.title}</h4>
              <p className="delete-confirm-preview">
                {deleteConfirmMemo.content.length > 100 
                  ? `${deleteConfirmMemo.content.substring(0, 100)}...`
                  : deleteConfirmMemo.content
                }
              </p>
            </div>
            <div className="delete-confirm-actions">
              <button
                onClick={handleDeleteExecute}
                className="confirm-delete-button"
                disabled={isLoading}
              >
                {isLoading ? '削除中...' : '削除する'}
              </button>
              <button
                onClick={handleDeleteCancel}
                className="cancel-delete-button"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicMemosComponent;
