import React, { useState } from 'react';
import { renderMarkdown } from '../../utils/markdownRenderer';
import { formatDateTime } from '../../utils/memoHelpers';
import type { Memo, Reply, User } from '../../types';

interface RepliesSectionProps {
  memo: Memo;
  isExpanded: boolean;
  onToggle: () => void;
  user: User | null;
  onAddReply: (memoId: string, content: string) => void;
  onEditReply: (replyId: string, content: string) => void;
  onDeleteReply: (replyId: string) => void;
  onLikeReply: (replyId: string) => void;
  onUnlikeReply: (replyId: string) => void;
  isReplyLiked: (replyId: string) => boolean;
}

const RepliesSection: React.FC<RepliesSectionProps> = ({
  memo,
  isExpanded,
  onToggle,
  user,
  onAddReply,
  onEditReply,
  onDeleteReply,
  onLikeReply,
  onUnlikeReply,
  isReplyLiked
}) => {
  const [replyContent, setReplyContent] = useState('');
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onAddReply(memo.id, replyContent.trim());
      setReplyContent('');
    }
  };

  const handleEditReply = (replyId: string, content: string) => {
    setEditingReplyId(replyId);
    setEditingContent(content);
  };

  const handleSaveEdit = (replyId: string) => {
    if (editingContent.trim()) {
      onEditReply(replyId, editingContent.trim());
      setEditingReplyId(null);
      setEditingContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingReplyId(null);
    setEditingContent('');
  };

  const handleDeleteReply = (replyId: string) => {
    if (confirm('この返信を削除しますか？')) {
      onDeleteReply(replyId);
    }
  };

  const handleLikeReply = (replyId: string) => {
    if (isReplyLiked(replyId)) {
      onUnlikeReply(replyId);
    } else {
      onLikeReply(replyId);
    }
  };

  const isReplyOwner = (reply: Reply): boolean => {
    if (!user) return false;
    return reply.author === user.email || reply.author === user.displayName;
  };

  return (
    <div className="replies-section">
      <div className="replies-header" onClick={onToggle}>
        <h4>
          💬 返信 ({memo.replies?.length || 0})
        </h4>
        <button className={`toggle-button ${isExpanded ? 'expanded' : ''}`}>
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="replies-content">
          {/* 返信追加フォーム */}
          {user && (
            <form className="reply-form" onSubmit={handleAddReply}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="返信を入力..."
                className="reply-textarea"
                rows={3}
              />
              <div className="reply-actions">
                <button type="submit" className="reply-submit-button">
                  返信
                </button>
                <button
                  type="button"
                  onClick={() => setReplyContent('')}
                  className="reply-cancel-button"
                >
                  クリア
                </button>
              </div>
            </form>
          )}

          {/* 返信一覧 */}
          <div className="replies-list">
            {memo.replies?.map((reply) => (
              <div key={reply.id} className="reply-item">
                <div className="reply-header">
                  <div className="reply-author">
                    {reply.author}
                  </div>
                  <div className="reply-date">
                    {formatDateTime(reply.createdAt)}
                  </div>
                </div>

                <div className="reply-content">
                  {editingReplyId === reply.id ? (
                    <div className="reply-edit-form">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="reply-edit-textarea"
                        rows={3}
                      />
                      <div className="reply-edit-actions">
                        <button
                          onClick={() => handleSaveEdit(reply.id)}
                          className="reply-save-button"
                        >
                          保存
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="reply-cancel-button"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="reply-text"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(reply.content)
                      }}
                    />
                  )}
                </div>

                <div className="reply-actions">
                  <button
                    onClick={() => handleLikeReply(reply.id)}
                    className={`like-button ${isReplyLiked(reply.id) ? 'liked' : ''}`}
                  >
                    👍 {reply.likeCount || 0}
                  </button>

                  {isReplyOwner(reply) && (
                    <>
                      <button
                        onClick={() => handleEditReply(reply.id, reply.content)}
                        className="edit-button"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDeleteReply(reply.id)}
                        className="delete-button"
                      >
                        削除
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RepliesSection;

