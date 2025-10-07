import React from 'react';
import type { MemoFormProps } from '../../types/memos';

const MemoForm: React.FC<MemoFormProps> = ({
  isEditing,
  title,
  setTitle,
  content,
  setContent,
  category,
  setCategory,
  tags,
  setTags,
  isPublic,
  setIsPublic,
  isFamilyOnly,
  setIsFamilyOnly,
  isAdminOnly,
  setIsAdminOnly,
  onSubmit,
  onCancel,
  loading,
  availableCategories
}) => {
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget;
      const newTag = input.value.trim();
      
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        input.value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <form onSubmit={onSubmit} className="memo-form">
      <h3>{isEditing ? 'メモを編集' : '新しいメモを作成'}</h3>
      
      <div className="form-group">
        <label htmlFor="memoTitle">タイトル *</label>
        <input
          type="text"
          id="memoTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
          placeholder="メモのタイトルを入力してください"
        />
      </div>

      <div className="form-group">
        <label htmlFor="memoContent">内容 *</label>
        <textarea
          id="memoContent"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={loading}
          rows={8}
          placeholder="メモの内容を入力してください（Markdown対応）"
        />
        <small className="form-help">
          Markdown記法が使用できます。コードブロック、リスト、リンクなどがサポートされています。
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="memoCategory">カテゴリ *</label>
        <select
          id="memoCategory"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          disabled={loading}
        >
          <option value="">選択してください</option>
          {availableCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="memoTags">タグ</label>
        <div className="tags-input-container">
          <input
            type="text"
            id="memoTags"
            onKeyDown={handleTagInput}
            disabled={loading}
            placeholder="タグを入力してEnterまたは,を押してください"
            className="tags-input"
          />
          <div className="tags-display">
            {tags.map((tag, index) => (
              <span key={index} className="tag-item">
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="tag-remove"
                  disabled={loading}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>公開範囲</label>
        <div className="visibility-options">
          <label className="visibility-option">
            <input
              type="radio"
              name="memoVisibility"
              value="private"
              checked={!isPublic && !isFamilyOnly && !isAdminOnly}
              onChange={() => {
                setIsPublic(false);
                setIsFamilyOnly(false);
                setIsAdminOnly(false);
              }}
              disabled={loading}
            />
            <span>非公開</span>
          </label>
          <label className="visibility-option">
            <input
              type="radio"
              name="memoVisibility"
              value="family"
              checked={isFamilyOnly && !isPublic && !isAdminOnly}
              onChange={() => {
                setIsPublic(false);
                setIsFamilyOnly(true);
                setIsAdminOnly(false);
              }}
              disabled={loading}
            />
            <span>家族のみ</span>
          </label>
          <label className="visibility-option">
            <input
              type="radio"
              name="memoVisibility"
              value="public"
              checked={isPublic && !isFamilyOnly && !isAdminOnly}
              onChange={() => {
                setIsPublic(true);
                setIsFamilyOnly(false);
                setIsAdminOnly(false);
              }}
              disabled={loading}
            />
            <span>公開</span>
          </label>
          <label className="visibility-option">
            <input
              type="radio"
              name="memoVisibility"
              value="admin"
              checked={isAdminOnly && !isPublic && !isFamilyOnly}
              onChange={() => {
                setIsPublic(false);
                setIsFamilyOnly(false);
                setIsAdminOnly(true);
              }}
              disabled={loading}
            />
            <span>管理者のみ</span>
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="cancel-button"
          disabled={loading}
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="submit-button"
          disabled={loading || !title.trim() || !content.trim() || !category}
        >
          {loading ? '処理中...' : (isEditing ? '更新' : '作成')}
        </button>
      </div>
    </form>
  );
};

export default MemoForm;
