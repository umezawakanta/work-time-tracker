import React, { useState } from 'react';
import './UpdateRequestModal.css';

interface UpdateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updateRequest: {
    title: string;
    content: string;
    category: string;
    priority: string;
  }) => Promise<void>;
}

const UpdateRequestModal: React.FC<UpdateRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'ui', label: 'UI/UX改善' },
    { value: 'feature', label: '新機能追加' },
    { value: 'performance', label: 'パフォーマンス改善' },
    { value: 'bugfix', label: 'バグ修正' },
    { value: 'accessibility', label: 'アクセシビリティ' },
    { value: 'other', label: 'その他' },
  ];

  const priorities = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
    { value: 'urgent', label: '緊急' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !category) {
      alert('タイトル、内容、カテゴリは必須項目です。');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        category,
        priority,
      });
      
      // フォームをリセット
      setTitle('');
      setContent('');
      setCategory('');
      setPriority('medium');
      onClose();
    } catch (error) {
      console.error('更新要望の送信に失敗しました:', error);
      alert('更新要望の送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="update-request-modal-overlay">
      <div className="update-request-modal">
        <div className="update-request-modal-header">
          <h2>
            <i className="bi bi-lightbulb"></i>
            更新要望を送信
          </h2>
          <button
            onClick={handleClose}
            className="close-button"
            disabled={isSubmitting}
            title="閉じる"
            aria-label="モーダルを閉じる"
          >
            <i className="bi bi-x"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="update-request-form">
          <div className="form-group">
            <label htmlFor="title">
              <i className="bi bi-card-text"></i>
              タイトル <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="更新要望のタイトルを入力してください"
              disabled={isSubmitting}
              maxLength={100}
              required
            />
            <div className="character-count">{title.length}/100</div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">
                <i className="bi bi-tags"></i>
                カテゴリ <span className="required">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSubmitting}
                required
              >
                <option value="">カテゴリを選択してください</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">
                <i className="bi bi-flag"></i>
                優先度
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={isSubmitting}
              >
                {priorities.map((pri) => (
                  <option key={pri.value} value={pri.value}>
                    {pri.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="content">
              <i className="bi bi-chat-text"></i>
              詳細内容 <span className="required">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="更新要望の詳細を入力してください。具体的な改善点や期待する動作を記述してください。"
              disabled={isSubmitting}
              rows={6}
              maxLength={1000}
              required
            />
            <div className="character-count">{content.length}/1000</div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="cancel-button"
              disabled={isSubmitting}
            >
              <i className="bi bi-x-circle"></i>
              キャンセル
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={!title.trim() || !content.trim() || !category || isSubmitting}
            >
              <i className="bi bi-send"></i>
              {isSubmitting ? '送信中...' : '更新要望を送信'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateRequestModal;
