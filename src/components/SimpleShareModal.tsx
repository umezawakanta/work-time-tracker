import React from 'react';
import { BadgeShareData } from '../types/badge';
import './SimpleShareModal.css';

interface SimpleShareModalProps {
  shareData: BadgeShareData;
  onClose: () => void;
}

const SimpleShareModal: React.FC<SimpleShareModalProps> = ({
  shareData,
  onClose
}) => {
  console.log('=== SimpleShareModal rendered ===');
  console.log('shareData:', shareData);
  console.log('onClose:', onClose);
  
  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.shareText)}&url=${encodeURIComponent(shareData.shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareData.shareText);
      alert('シェアテキストをコピーしました！');
    } catch (error) {
      alert('コピーに失敗しました');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>X（Twitter）でシェア</h3>
          <button onClick={onClose} className="close-button">
            ✕
          </button>
        </div>
        
        <div className="badge-info">
          <div className="badge-display">
            <span className="badge-icon">{shareData.badge.icon}</span>
            <div className="badge-details">
              <h4>{shareData.badge.name}</h4>
              <p>{shareData.badge.description}</p>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="share-text" className="form-label">
            シェアテキスト
          </label>
          <textarea
            id="share-text"
            value={shareData.shareText}
            readOnly
            className="form-textarea"
          />
          <button onClick={handleCopyText} className="copy-button">
            📋 コピー
          </button>
        </div>
        
        <div className="button-group">
          <button onClick={handleTwitterShare} className="twitter-button">
            𝕏 Xでシェア
          </button>
          <button onClick={onClose} className="cancel-button">
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleShareModal;
