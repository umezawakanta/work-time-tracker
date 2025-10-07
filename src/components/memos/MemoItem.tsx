import React from 'react';
import { renderMarkdown, truncateContent, stripHtmlTags } from '../../utils/markdownRenderer';
import type { MemoItemProps } from '../../types/memos';

const MemoItem: React.FC<MemoItemProps> = ({
  memo,
  onEdit,
  onDelete,
  onLike,
  onUnlike,
  onReply,
  onDeleteReply,
  onLikeReply,
  onUnlikeReply,
  currentUserId,
  isLiked,
  isReplyLiked
}) => {
  const handleLike = async () => {
    if (isLiked) {
      await onUnlike(memo.id);
    } else {
      await onLike(memo.id);
    }
  };

  const handleReplyLike = async (replyId: string) => {
    if (isReplyLiked(replyId)) {
      await onUnlikeReply(replyId);
    } else {
      await onLikeReply(replyId);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (window.confirm('この返信を削除しますか？')) {
      await onDeleteReply(replyId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLikeCount = () => {
    return memo.likes ? memo.likes.length : 0;
  };

  const getReplyLikeCount = (replyId: string) => {
    const reply = memo.replies?.find(r => r.id === replyId);
    return reply?.likes ? reply.likes.length : 0;
  };

  return (
    <div className="memo-item">
      <div className="memo-header">
        <h3 className="memo-title">{memo.title}</h3>
        <div className="memo-meta">
          <span className="memo-category">{memo.category}</span>
          <span className="memo-date">{formatDate(memo.createdAt)}</span>
          {memo.isPublic && <span className="visibility-badge public">公開</span>}
          {memo.isFamilyOnly && <span className="visibility-badge family">家族のみ</span>}
          {memo.isAdminOnly && <span className="visibility-badge admin">管理者のみ</span>}
          {!memo.isPublic && !memo.isFamilyOnly && !memo.isAdminOnly && (
            <span className="visibility-badge private">非公開</span>
          )}
        </div>
      </div>

      <div className="memo-content">
        <div 
          className="memo-text"
          dangerouslySetInnerHTML={{ 
            __html: renderMarkdown(memo.content) 
          }}
        />
      </div>

      {memo.tags && memo.tags.length > 0 && (
        <div className="memo-tags">
          {memo.tags.map((tag, index) => (
            <span key={index} className="memo-tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="memo-actions">
        <button 
          className={`like-button ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          ❤️ {getLikeCount()}
        </button>
        <button 
          className="reply-button"
          onClick={() => onReply(memo.id, '')}
        >
          💬 返信
        </button>
        <button 
          className="edit-button"
          onClick={() => onEdit(memo)}
        >
          編集
        </button>
        <button 
          className="delete-button"
          onClick={() => onDelete(memo.id, memo.title)}
        >
          削除
        </button>
      </div>

      {/* 返信セクション */}
      {memo.replies && memo.replies.length > 0 && (
        <div className="replies-section">
          <h4>返信 ({memo.replies.length})</h4>
          {memo.replies.map((reply) => (
            <div key={reply.id} className="reply-item">
              <div className="reply-header">
                <span className="reply-author">{reply.authorName || '匿名'}</span>
                <span className="reply-date">{formatDate(reply.createdAt)}</span>
              </div>
              <div className="reply-content">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: renderMarkdown(reply.content) 
                  }}
                />
              </div>
              <div className="reply-actions">
                <button 
                  className={`reply-like-button ${isReplyLiked(reply.id) ? 'liked' : ''}`}
                  onClick={() => handleReplyLike(reply.id)}
                >
                  ❤️ {getReplyLikeCount(reply.id)}
                </button>
                {reply.authorId === currentUserId && (
                  <button 
                    className="reply-delete-button"
                    onClick={() => handleDeleteReply(reply.id)}
                  >
                    削除
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoItem;
