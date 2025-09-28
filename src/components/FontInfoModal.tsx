import React from 'react';
import { FontOption } from '../constants/fonts';
import './FontInfoModal.css';

interface FontInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  font: FontOption | null;
}

const FontInfoModal: React.FC<FontInfoModalProps> = ({
  isOpen,
  onClose,
  font
}) => {
  if (!isOpen || !font) return null;

  const getReadabilityText = (readability?: string) => {
    switch (readability) {
      case 'high': return '読みやすい';
      case 'medium': return '普通';
      case 'low': return '読みにくい';
      default: return '未設定';
    }
  };

  const getAgeGroupText = (ageGroup?: string) => {
    switch (ageGroup) {
      case 'child': return 'こども向け';
      case 'teen': return 'ティーン向け';
      case 'adult': return '大人向け';
      case 'all': return '全年齢';
      default: return '未設定';
    }
  };

  const getSubcategoryText = (subcategory?: string) => {
    switch (subcategory) {
      case 'rounded': return '丸文字';
      case 'handwriting': return '手書き風';
      case 'cute': return '可愛い';
      case 'school': return '学校風';
      case 'modern': return 'モダン';
      case 'classic': return 'クラシック';
      default: return '未分類';
    }
  };

  return (
    <div className="font-info-modal-overlay">
      <div className="font-info-modal">
        <div className="font-info-header">
          <h3>フォント詳細情報</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="font-info-body">
          <div className="font-preview-large">
            <h4>プレビュー</h4>
            <div 
              className="font-preview-text"
              style={{ fontFamily: font.value === 'system' ? 'inherit' : font.value }}
            >
              {font.previewText || font.label}
            </div>
          </div>

          <div className="font-details">
            <div className="detail-section">
              <h4>基本情報</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>フォント名</label>
                  <span>{font.label}</span>
                </div>
                <div className="detail-item">
                  <label>フォント値</label>
                  <code>{font.value}</code>
                </div>
                <div className="detail-item">
                  <label>カテゴリ</label>
                  <span>{font.category}</span>
                </div>
                <div className="detail-item">
                  <label>サブカテゴリ</label>
                  <span>{getSubcategoryText(font.subcategory)}</span>
                </div>
              </div>
            </div>

            {font.description && (
              <div className="detail-section">
                <h4>説明</h4>
                <p className="font-description">{font.description}</p>
              </div>
            )}

            <div className="detail-section">
              <h4>特性</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>対象年齢</label>
                  <span>{getAgeGroupText(font.ageGroup)}</span>
                </div>
                <div className="detail-item">
                  <label>読みやすさ</label>
                  <span>{getReadabilityText(font.readability)}</span>
                </div>
              </div>
            </div>

            {font.tags && font.tags.length > 0 && (
              <div className="detail-section">
                <h4>タグ</h4>
                <div className="font-tags">
                  {font.tags.map((tag, index) => (
                    <span key={index} className="font-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-section">
              <h4>使用例</h4>
              <div className="usage-examples">
                <div className="usage-example">
                  <h5>日本語テキスト</h5>
                  <p 
                    style={{ fontFamily: font.value === 'system' ? 'inherit' : font.value }}
                    className="usage-text"
                  >
                    可愛いキャラクターと一緒に作業時間を管理しよう！
                  </p>
                </div>
                <div className="usage-example">
                  <h5>English Text</h5>
                  <p 
                    style={{ fontFamily: font.value === 'system' ? 'inherit' : font.value }}
                    className="usage-text"
                  >
                    Work Time Tracker with Cute Characters!
                  </p>
                </div>
                <div className="usage-example">
                  <h5>数字・記号</h5>
                  <p 
                    style={{ fontFamily: font.value === 'system' ? 'inherit' : font.value }}
                    className="usage-text"
                  >
                    1234567890 !@#$%^&*()
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="font-info-footer">
          <button className="close-modal-button" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default FontInfoModal;
