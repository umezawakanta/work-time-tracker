import React from 'react';
import { renderMarkdown } from '../../utils/markdownRenderer';
import { 
  getMemoTitle, 
  formatDateTime, 
  isMemoOwner, 
  getMemoStatusText, 
  getMemoStatusClass,
  getPostTypeText,
  getPostTypeClass,
  getMemoPreview
} from '../../utils/memoHelpers';
import type { Memo, User } from '../../types';
import LikeButton from '../LikeButton';
import RepliesSection from './RepliesSection';

interface MemoItemProps {
  memo: Memo;
  user: User | null;
  isExpanded: boolean;
  onToggleReplies: () => void;
  editingMemoId: string | null;
  editingStatus: string;
  setEditingStatus: (status: string) => void;
  editingTags: string;
  setEditingTags: (tags: string) => void;
  onStartEditing: (memo: Memo) => void;
  onCancelEditing: () => void;
  onStatusUpdate: (memoId: string, status: string) => void;
  onTagsUpdate: (memoId: string, tags: string[]) => void;
  onEditMemo: (memo: Memo) => void;
  onDeleteMemo: (memoId: string) => void;
  memoLikes: { [memoId: string]: { isLiked: boolean; likeCount: number } };
  setMemoLikes: (likes: { [memoId: string]: { isLiked: boolean; likeCount: number } }) => void;
  isInitializing: boolean;
  onAddReply: (memoId: string, content: string) => void;
  onEditReply: (replyId: string, content: string) => void;
  onDeleteReply: (replyId: string) => void;
  onLikeReply: (replyId: string) => void;
  onUnlikeReply: (replyId: string) => void;
  isReplyLiked: (replyId: string) => boolean;
}

const MemoItem: React.FC<MemoItemProps> = ({
  memo,
  user,
  isExpanded,
  onToggleReplies,
  editingMemoId,
  editingStatus,
  setEditingStatus,
  editingTags,
  setEditingTags,
  onStartEditing,
  onCancelEditing,
  onStatusUpdate,
  onTagsUpdate,
  onEditMemo,
  onDeleteMemo,
  memoLikes,
  setMemoLikes,
  isInitializing,
  onAddReply,
  onEditReply,
  onDeleteReply,
  onLikeReply,
  onUnlikeReply,
  isReplyLiked
}) => {
  const isEditing = editingMemoId === memo.id;
  const isOwner = isMemoOwner(memo, user);
  const likeState = memoLikes[memo.id] || { isLiked: false, likeCount: 0 };

  const handleStatusUpdate = () => {
    if (editingStatus !== memo.status) {
      onStatusUpdate(memo.id, editingStatus);
    }
    onCancelEditing();
  };

  const handleTagsUpdate = () => {
    const newTags = editingTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    onTagsUpdate(memo.id, newTags);
    onCancelEditing();
  };

  const handleDelete = () => {
    if (confirm('このメモを削除しますか？')) {
      onDeleteMemo(memo.id);
    }
  };

  const handleLike = () => {
    if (isInitializing) return;
    
    const newLikes = { ...memoLikes };
    const currentState = newLikes[memo.id] || { isLiked: false, likeCount: 0 };
    
    newLikes[memo.id] = {
      isLiked: !currentState.isLiked,
      likeCount: currentState.isLiked ? currentState.likeCount - 1 : currentState.likeCount + 1
    };
    
    setMemoLikes(newLikes);
  };

  return (
    <div className={`memo-item ${isEditing ? 'editing' : ''}`}>
      <div className="memo-header">
        <div className="memo-title">
          <h3>{getMemoTitle(memo)}</h3>
          <div className="memo-meta">
            <span className="memo-author">by {memo.author}</span>
            <span className="memo-date">{formatDateTime(memo.createdAt)}</span>
          </div>
        </div>
        
        <div className="memo-actions">
          <LikeButton
            isLiked={likeState.isLiked}
            likeCount={likeState.likeCount}
            onLike={handleLike}
            disabled={isInitializing}
          />
          
          {isOwner && (
            <>
              {isEditing ? (
                <div className="editing-actions">
                  <button onClick={handleStatusUpdate} className="save-button">
                    保存
                  </button>
                  <button onClick={onCancelEditing} className="cancel-button">
                    キャンセル
                  </button>
                </div>
              ) : (
                <div className="owner-actions">
                  <button onClick={() => onStartEditing(memo)} className="edit-button">
                    編集
                  </button>
                  <button onClick={handleDelete} className="delete-button">
                    削除
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="memo-content">
        {isEditing ? (
          <div className="memo-edit-form">
            <div className="edit-field">
              <label>ステータス:</label>
              <select
                value={editingStatus}
                onChange={(e) => setEditingStatus(e.target.value)}
                className="edit-select"
              >
                <option value="pending">保留中</option>
                <option value="in_progress">対応中</option>
                <option value="resolved">解決済み</option>
                <option value="rejected">却下</option>
              </select>
            </div>
            
            <div className="edit-field">
              <label>タグ:</label>
              <input
                type="text"
                value={editingTags}
                onChange={(e) => setEditingTags(e.target.value)}
                placeholder="タグをカンマ区切りで入力"
                className="edit-input"
              />
            </div>
          </div>
        ) : (
          <div className="memo-body">
            <div
              className="memo-text"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(memo.content)
              }}
            />
          </div>
        )}
      </div>

      <div className="memo-footer">
        <div className="memo-tags">
          {memo.tags.map((tag, index) => (
            <span key={index} className="memo-tag">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="memo-status">
          <span className={`status-badge ${getMemoStatusClass(memo.status || 'pending')}`}>
            {getMemoStatusText(memo.status || 'pending')}
          </span>
          <span className={`post-type-badge ${getPostTypeClass(memo.postType || 'general')}`}>
            {getPostTypeText(memo.postType || 'general')}
          </span>
        </div>
      </div>

      <RepliesSection
        memo={memo}
        isExpanded={isExpanded}
        onToggle={onToggleReplies}
        user={user}
        onAddReply={onAddReply}
        onEditReply={onEditReply}
        onDeleteReply={onDeleteReply}
        onLikeReply={onLikeReply}
        onUnlikeReply={onUnlikeReply}
        isReplyLiked={isReplyLiked}
      />
    </div>
  );
};

export default MemoItem;

