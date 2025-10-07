import React, { useState, useEffect } from 'react';
import './MemosComponent.css';
import type { Memo, Reply } from '../types';
import { EXCLUDED_MEMO_CATEGORIES } from '../utils/requestFormatters';
import { useGenreManagement } from '../hooks/useGenreManagement';
import { usePagination } from '../hooks/usePagination';
import { useReplyManagement } from '../hooks/useReplyManagement';
import GenreManagementModal from './memos/GenreManagementModal';
import MemoItem from './memos/MemoItem';
import MemoForm from './memos/MemoForm';
import MemoFilters from './memos/MemoFilters';
import Pagination from './memos/Pagination';
import type { MemosComponentProps } from '../types/memos';

const MemosComponent: React.FC<MemosComponentProps> = (props) => {
  const {
    memos,
    showMemos,
    setShowMemos,
    closeOtherFeatures,
    showMemoForm,
    setShowMemoForm,
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
    selectedMemoCategory,
    setSelectedMemoCategory,
    getMemoCategories,
    loading,
    loadMemos,
    handleCreateMemo,
    handleUpdateMemo,
    handleEditMemo,
    handleDeleteMemo,
    handleMemoCategoryChange,
    handleLikeMemo,
    handleUnlikeMemo,
    handleReplyToMemo,
    handleDeleteReply,
    handleLikeReply,
    handleUnlikeReply
  } = props;

  // カスタムフックの使用
  const genreManagement = useGenreManagement();
  const replyManagement = useReplyManagement();

  // フィルタリングされたメモを取得
  const filteredMemos = memos.filter(memo => {
    if (selectedMemoCategory === 'all') return true;
    return memo.category === selectedMemoCategory;
  });

  // ページネーション
  const pagination = usePagination(filteredMemos, 10);

  // メモのローディング状態
  const [memosLoading, setMemosLoading] = useState(false);

  // メモ読み込み関数
  const loadMemosLocal = async () => {
    setMemosLoading(true);
    try {
      await loadMemos();
    } finally {
      setMemosLoading(false);
    }
  };

  // 初期化
  useEffect(() => {
    if (showMemos && memos.length === 0) {
      loadMemosLocal();
    }
    genreManagement.loadGenreManagement();
  }, [showMemos]);

  // カテゴリ変更時にページネーションをリセット
  useEffect(() => {
    pagination.resetPagination();
  }, [selectedMemoCategory]);

  // メモがいいねされているかチェック
  const isMemoLiked = (memo: Memo): boolean => {
    // ユーザーIDの取得（実際の実装では適切な方法で取得）
    const currentUserId = 'current-user-id'; // 実際のユーザーIDに置き換え
    return memo.likes && memo.likes.includes(currentUserId);
  };

  // 返信がいいねされているかチェック
  const isReplyLiked = (replyId: string): boolean => {
    const currentUserId = 'current-user-id'; // 実際のユーザーIDに置き換え
    return replyManagement.isReplyLiked(
      { id: replyId, likes: [] } as Reply, 
      currentUserId
    );
  };

  // 返信処理
  const handleReply = async (memoId: string, content: string) => {
    await replyManagement.submitReply(memoId, content, handleReplyToMemo);
  };

  // 返信削除処理
  const handleDeleteReplyWrapper = async (replyId: string) => {
    await handleDeleteReply(replyId);
  };

  // 返信いいね処理
  const handleReplyLike = async (replyId: string) => {
    await handleLikeReply(replyId);
  };

  // 返信いいね取り消し処理
  const handleReplyUnlike = async (replyId: string) => {
    await handleUnlikeReply(replyId);
  };

  return (
    <div className="memos-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">📝</span>
          メモ
        </h2>
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
                if (memos.length === 0) {
                  loadMemosLocal();
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

      {showMemos && (
        <div className="memos-content">
          <div className="memos-header">
            <div className="memos-controls">
              <MemoFilters
                categories={getMemoCategories()}
                selectedCategory={selectedMemoCategory}
                onCategoryChange={handleMemoCategoryChange}
                onReset={() => {
                  setSelectedMemoCategory("all");
                  loadMemosLocal();
                }}
              />
              <button
                onClick={loadMemosLocal}
                className="refresh-button"
                title="メモを更新"
              >
                🔄
              </button>
              <button
                onClick={genreManagement.openGenreModal}
                className="genre-management-button"
                title="ジャンル管理"
              >
                🏷️ ジャンル管理
              </button>
            </div>
          </div>

          <div className="memos-stats">
            <div className="stat-card">
              <h3>総メモ数</h3>
              <p className="stat-value">{memos.length}</p>
            </div>
            <div className="stat-card">
              <h3>公開メモ</h3>
              <p className="stat-value">
                {memos.filter(memo => memo.isPublic).length}
              </p>
            </div>
            <div className="stat-card">
              <h3>今月のメモ</h3>
              <p className="stat-value">
                {memos.filter(memo => {
                  const memoDate = new Date(memo.createdAt);
                  const now = new Date();
                  return memoDate.getMonth() === now.getMonth() && 
                         memoDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>

          <div className="memos-actions">
            <button
              onClick={() => {
                setEditingMemo(null);
                setShowMemoForm(!showMemoForm);
                if (!showMemoForm) {
                  setMemoTitle("");
                  setMemoContent("");
                  setMemoCategory("");
                  setMemoTags([]);
                  setMemoIsPublic(false);
                  setMemoIsFamilyOnly(false);
                  setMemoIsAdminOnly(false);
                }
              }}
              className="add-memo-button"
            >
              {showMemoForm ? "キャンセル" : "メモを追加"}
            </button>
          </div>

          {showMemoForm && (
            <MemoForm
              isEditing={!!editingMemo}
              title={memoTitle}
              setTitle={setMemoTitle}
              content={memoContent}
              setContent={setMemoContent}
              category={memoCategory}
              setCategory={setMemoCategory}
              tags={memoTags}
              setTags={setMemoTags}
              isPublic={memoIsPublic}
              setIsPublic={setMemoIsPublic}
              isFamilyOnly={memoIsFamilyOnly}
              setIsFamilyOnly={setMemoIsFamilyOnly}
              isAdminOnly={memoIsAdminOnly}
              setIsAdminOnly={setMemoIsAdminOnly}
              onSubmit={editingMemo ? handleUpdateMemo : handleCreateMemo}
              onCancel={() => {
                setShowMemoForm(false);
                setEditingMemo(null);
              }}
              loading={loading}
              availableCategories={getMemoCategories()}
            />
          )}

          <div className="memos-list">
            {memosLoading ? (
              <div className="data-loading">
                <div className="spinner"></div>
                <p>メモを読み込み中...</p>
              </div>
            ) : pagination.currentItems.length === 0 ? (
              <p className="no-memos">メモがありません</p>
            ) : (
              <>
                {pagination.currentItems.map((memo) => (
                  <MemoItem
                    key={memo.id}
                    memo={memo}
                    onEdit={handleEditMemo}
                    onDelete={handleDeleteMemo}
                    onLike={handleLikeMemo}
                    onUnlike={handleUnlikeMemo}
                    onReply={handleReply}
                    onDeleteReply={handleDeleteReplyWrapper}
                    onLikeReply={handleReplyLike}
                    onUnlikeReply={handleReplyUnlike}
                    currentUserId="current-user-id" // 実際のユーザーIDに置き換え
                    isLiked={isMemoLiked(memo)}
                    isReplyLiked={isReplyLiked}
                  />
                ))}
                
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={pagination.goToPage}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* ジャンル管理モーダル */}
      <GenreManagementModal
        isOpen={genreManagement.isGenreModalOpen}
        onClose={genreManagement.closeGenreModal}
        customCategories={genreManagement.customCategories}
        setCustomCategories={(categories) => setCustomCategories(categories)}
        deletedDefaultCategories={genreManagement.deletedDefaultCategories}
        setDeletedDefaultCategories={(categories) => setDeletedDefaultCategories(categories)}
        onSave={genreManagement.saveGenreManagement}
        DEFAULT_CATEGORIES={genreManagement.DEFAULT_CATEGORIES}
      />
    </div>
  );
};

export default MemosComponent;
