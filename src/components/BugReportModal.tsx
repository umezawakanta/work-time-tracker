import React, { useState } from 'react';
import './BugReportModal.css';
import { getBugReportCategories } from '../utils/requestFormatters';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bugReport: {
    title: string;
    content: string;
    category: string;
    severity: string;
    steps: string;
    expectedBehavior: string;
    actualBehavior: string;
  }) => Promise<void>;
}

const BugReportModal: React.FC<BugReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [steps, setSteps] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const categories = getBugReportCategories();

  const severities = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
    { value: 'critical', label: '緊急' },
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) {
      newErrors.title = 'タイトルは必須項目です。';
    }
    if (!content.trim()) {
      newErrors.content = '詳細説明は必須項目です。';
    }
    if (!category) {
      newErrors.category = 'カテゴリは必須項目です。';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        category,
        severity,
        steps: steps.trim(),
        expectedBehavior: expectedBehavior.trim(),
        actualBehavior: actualBehavior.trim(),
      });
      
      // フォームをリセット
      setTitle('');
      setContent('');
      setCategory('');
      setSeverity('medium');
      setSteps('');
      setExpectedBehavior('');
      setActualBehavior('');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('不具合報告の送信に失敗しました:', error);
      setErrors({ submit: '不具合報告の送信に失敗しました。もう一度お試しください。' });
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
    <div className="bug-report-modal-overlay">
      <div className="bug-report-modal">
        <div className="bug-report-modal-header">
          <h2>
            <i className="bi bi-bug"></i>
            不具合を報告
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

        <form onSubmit={handleSubmit} className="bug-report-form">
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
              placeholder="不具合のタイトルを入力してください"
              disabled={isSubmitting}
              maxLength={100}
              required
              className={errors.title ? 'error' : ''}
            />
            <div className="character-count">{title.length}/100</div>
            {errors.title && <div className="error-message">{errors.title}</div>}
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
                className={errors.category ? 'error' : ''}
              >
                <option value="">カテゴリを選択してください</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && <div className="error-message">{errors.category}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="severity">
                <i className="bi bi-exclamation-triangle"></i>
                重要度
              </label>
              <select
                id="severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                disabled={isSubmitting}
              >
                {severities.map((sev) => (
                  <option key={sev.value} value={sev.value}>
                    {sev.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="steps">
              <i className="bi bi-list-ol"></i>
              再現手順
            </label>
            <textarea
              id="steps"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="不具合を再現するための手順を入力してください"
              disabled={isSubmitting}
              rows={3}
              maxLength={500}
            />
            <div className="character-count">{steps.length}/500</div>
          </div>

          <div className="form-group">
            <label htmlFor="expectedBehavior">
              <i className="bi bi-check-circle"></i>
              期待される動作
            </label>
            <textarea
              id="expectedBehavior"
              value={expectedBehavior}
              onChange={(e) => setExpectedBehavior(e.target.value)}
              placeholder="本来期待される動作を入力してください"
              disabled={isSubmitting}
              rows={2}
              maxLength={300}
            />
            <div className="character-count">{expectedBehavior.length}/300</div>
          </div>

          <div className="form-group">
            <label htmlFor="actualBehavior">
              <i className="bi bi-x-circle"></i>
              実際の動作
            </label>
            <textarea
              id="actualBehavior"
              value={actualBehavior}
              onChange={(e) => setActualBehavior(e.target.value)}
              placeholder="実際に起こった動作を入力してください"
              disabled={isSubmitting}
              rows={2}
              maxLength={300}
            />
            <div className="character-count">{actualBehavior.length}/300</div>
          </div>

          <div className="form-group">
            <label htmlFor="content">
              <i className="bi bi-chat-text"></i>
              詳細説明 <span className="required">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="不具合の詳細を入力してください。エラーメッセージ、スクリーンショットの説明なども含めてください。"
              disabled={isSubmitting}
              rows={4}
              maxLength={1000}
              required
              className={errors.content ? 'error' : ''}
            />
            <div className="character-count">{content.length}/1000</div>
            {errors.content && <div className="error-message">{errors.content}</div>}
          </div>

          {errors.submit && (
            <div className="error-message submit-error">
              <i className="bi bi-exclamation-triangle"></i>
              {errors.submit}
            </div>
          )}

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
              disabled={isSubmitting}
            >
              <i className="bi bi-send"></i>
              {isSubmitting ? '送信中...' : '不具合を報告'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BugReportModal;
