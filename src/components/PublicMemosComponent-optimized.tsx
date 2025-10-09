import React, { useState, useEffect } from 'react';
import { usePublicMemos } from '../hooks/usePublicMemos';
import { useMemoLikes } from '../hooks/useMemoLikes';
import { usePagination } from '../hooks/usePagination';
import { useMemoEditing } from '../hooks/useMemoEditing';
import { getPublicMemoCounts } from '../utils/memoHelpers';
import { MemoFilterPanel } from './PublicMemos/MemoFilterPanel';
import { MemoStats } from './PublicMemos/MemoStats';
import { MemoItem } from './PublicMemos/MemoItem';
import { Pagination } from './PublicMemos/Pagination';
import type { Memo, User } from '../types';
import './PublicMemosComponent.css';

interface PublicMemosComponentProps {
  publicMemos: Memo[];
  showPublicMemos: boolean;
  setShowPublicMemos: (show: boolean) => void;
  user: User | null;
  loadPublicMemos: () => Promise<void>;
  onUpdateMemoStatus: (memoId: string, status: string) => Promise<void>;
  onUpdateMemoTags: (memoId: string, tags: string[]) => Promise<void>;
  onEditMemo: (memo: Memo) => void;
  onDeleteMemo: (memoId: string) => Promise<void>;
  onAddReply: (memoId: string, content: string) => Promise<void>;
  onEditReply: (replyId: string, content: string) => Promise<void>;
  onDeleteReply: (replyId: string) => Promise<void>;
  onLikeReply: (replyId: string) => Promise<void>;
  onUnlikeReply: (replyId: string) => Promise<void>;
  isReplyLiked: (replyId: string) => boolean;
}

const PublicMemosComponent: React.FC<PublicMemosComponentProps> = ({
  publicMemos,
  showPublicMemos,
  setShowPublicMemos,
  user,
  loadPublicMemos,
  onUpdateMemoStatus,
  onUpdateMemoTags,
  onEditMemo,
  onDeleteMemo,
  onAddReply,
  onEditReply,
  onDeleteReply,
  onLikeReply,
  onUnlikeReply,
  isReplyLiked
}) => {
  // カスタムフックの使用
  const {
    statusFilter,
    setStatusFilter,
    tagFilter,
    setTagFilter,
    excludeTags,
    toggleExcludeTag,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filterByDate,
    setFilterByDate,
    searchQuery,
    setSearchQuery,
    filteredMemos,
    availableTags,
    clearFilters,
    changeSort,
    setDateFilter,
  } = usePublicMemos(publicMemos);

  const { memoLikes, setMemoLikes, isInitializing, toggleLike } = useMemoLikes(publicMemos);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    getPaginatedItems,
    getPaginationInfo,
  } = usePagination(filteredMemos.length);

  const {
    editingMemoId,
    editingStatus,
    setEditingStatus,
    editingTags,
    setEditingTags,
    startEditing,
    cancelEditing,
  } = useMemoEditing();

  // その他の状態管理
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirmMemo, setDeleteConfirmMemo] = useState<Memo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // データの読み込み
  useEffect(() => {
    if (showPublicMemos) {
      loadPublicMemos();
    }
  }, [showPublicMemos, loadPublicMemos]);

  // 統計データの計算
  const counts = getPublicMemoCounts(publicMemos);
  const paginatedMemos = getPaginatedItems(filteredMemos);
  const paginationInfo = getPaginationInfo();

  // 返信の展開/折りたたみを切り替え
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

  // メモのステータス更新
  const handleStatusUpdate = async (memoId: string, status: string) => {
    try {
      await onUpdateMemoStatus(memoId, status);
    } catch (error) {
      console.error('ステータス更新エラー:', error);
    }
  };

  // メモのタグ更新
  const handleTagsUpdate = async (memoId: string, tags: string[]) => {
    try {
      await onUpdateMemoTags(memoId, tags);
    } catch (error) {
      console.error('タグ更新エラー:', error);
    }
  };

  // メモの削除
  const handleDeleteMemo = async (memoId: string) => {
    try {
      await onDeleteMemo(memoId);
      setDeleteConfirmMemo(null);
    } catch (error) {
      console.error('メモ削除エラー:', error);
    }
  };

  // 返信の追加
  const handleAddReply = async (memoId: string, content: string) => {
    try {
      await onAddReply(memoId, content);
    } catch (error) {
      console.error('返信追加エラー:', error);
    }
  };

  // 返信の編集
  const handleEditReply = async (replyId: string, content: string) => {
    try {
      await onEditReply(replyId, content);
    } catch (error) {
      console.error('返信編集エラー:', error);
    }
  };

  // 返信の削除
  const handleDeleteReply = async (replyId: string) => {
    try {
      await onDeleteReply(replyId);
    } catch (error) {
      console.error('返信削除エラー:', error);
    }
  };

  // 返信のいいね
  const handleLikeReply = async (replyId: string) => {
    try {
      await onLikeReply(replyId);
    } catch (error) {
      console.error('返信いいねエラー:', error);
    }
  };

  // 返信のいいね解除
  const handleUnlikeReply = async (replyId: string) => {
    try {
      await onUnlikeReply(replyId);
    } catch (error) {
      console.error('返信いいね解除エラー:', error);
    }
  };

  return (
    <div className="public-memos-section">
      <div className="section-header">
        <h2>📝 公開メモ</h2>
        <div className="header-actions">
          <button
            className="toggle-button"
            onClick={() => setShowPublicMemos(!showPublicMemos)}
          >
            {showPublicMemos ? '非表示' : '表示'}
          </button>
          {showPublicMemos && (
            <button
              className="filter-button"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'フィルター非表示' : 'フィルター表示'}
            </button>
          )}
        </div>
      </div>

      {showPublicMemos && (
        <div className="public-memos-content">
          {/* フィルターパネル */}
          {showFilters && (
            <MemoFilterPanel
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              tagFilter={tagFilter}
              setTagFilter={setTagFilter}
              excludeTags={excludeTags}
              toggleExcludeTag={toggleExcludeTag}
              availableTags={availableTags}
              onClearFilters={clearFilters}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />
          )}

          {/* 統計 */}
          <MemoStats
            memos={publicMemos}
            currentMonth={currentMonth}
            viewMode={viewMode}
            selectedDate={filterByDate}
            onDateSelect={setDateFilter}
          />

          {/* ページネーション（上部） */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              position="top"
              showInfo={true}
            />
          )}

          {/* メモ一覧 */}
          <div className="public-memos-list">
            {paginatedMemos.map((memo) => (
              <MemoItem
                key={memo.id}
                memo={memo}
                user={user}
                isExpanded={expandedReplies.has(memo.id)}
                onToggleReplies={() => toggleReplies(memo.id)}
                editingMemoId={editingMemoId}
                editingStatus={editingStatus}
                setEditingStatus={setEditingStatus}
                editingTags={editingTags}
                setEditingTags={setEditingTags}
                onStartEditing={startEditing}
                onCancelEditing={cancelEditing}
                onStatusUpdate={handleStatusUpdate}
                onTagsUpdate={handleTagsUpdate}
                onEditMemo={onEditMemo}
                onDeleteMemo={handleDeleteMemo}
                memoLikes={memoLikes}
                setMemoLikes={setMemoLikes}
                isInitializing={isInitializing}
                onAddReply={handleAddReply}
                onEditReply={handleEditReply}
                onDeleteReply={handleDeleteReply}
                onLikeReply={handleLikeReply}
                onUnlikeReply={handleUnlikeReply}
                isReplyLiked={isReplyLiked}
              />
            ))}
          </div>

          {/* ページネーション（下部） */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              position="bottom"
              showInfo={true}
            />
          )}

          {/* 削除確認モーダル */}
          {deleteConfirmMemo && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>メモを削除</h3>
                <p>「{deleteConfirmMemo.title}」を削除しますか？</p>
                <div className="modal-actions">
                  <button
                    onClick={() => handleDeleteMemo(deleteConfirmMemo.id)}
                    className="delete-button"
                  >
                    削除
                  </button>
                  <button
                    onClick={() => setDeleteConfirmMemo(null)}
                    className="cancel-button"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicMemosComponent;

