// X（Twitter）シェアコンポーネント

import React, { useState } from 'react';
import { BadgeShareData } from '../types/badge';
import './TwitterShare.css';

interface TwitterShareProps {
  shareData: BadgeShareData;
  onClose: () => void;
}

const TwitterShare: React.FC<TwitterShareProps> = ({
  shareData,
  onClose
}) => {
  const [isSharing, setIsSharing] = useState(false);
  
  console.log('TwitterShare component rendered with shareData:', shareData);

  const handleTwitterShare = () => {
    setIsSharing(true);
    
    // Twitter Web Intent URLを生成
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.shareText)}&url=${encodeURIComponent(shareData.shareUrl)}`;
    
    // 新しいウィンドウでTwitterを開く
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    
    // 少し遅延してから閉じる
    setTimeout(() => {
      setIsSharing(false);
      onClose();
    }, 1000);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareData.shareText);
      alert('シェアテキストをコピーしました！');
    } catch (error) {
      console.error('Failed to copy text:', error);
      alert('コピーに失敗しました');
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareData.shareUrl);
      alert('URLをコピーしました！');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      alert('コピーに失敗しました');
    }
  };

  return (
    <div className="twitter-share-modal">
      <div className="twitter-share-overlay" onClick={onClose}></div>
      <div className="twitter-share-content">
        <div className="twitter-share-header">
          <h3>X（Twitter）でシェア</h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="twitter-share-body">
          <div className="badge-preview">
            <div className="badge-icon">{shareData.badge.icon}</div>
            <div className="badge-info">
              <h4>{shareData.badge.name}</h4>
              <p>{shareData.badge.description}</p>
            </div>
          </div>
          
          <div className="share-text-preview">
            <label htmlFor="share-text">シェアテキスト</label>
            <textarea
              id="share-text"
              value={shareData.shareText}
              readOnly
              className="share-textarea"
              rows={3}
            />
            <button className="copy-button" onClick={handleCopyText}>
              📋 コピー
            </button>
          </div>
          
          <div className="share-url-preview">
            <label htmlFor="share-url">シェアURL</label>
            <input
              id="share-url"
              type="text"
              value={shareData.shareUrl}
              readOnly
              className="share-input"
            />
            <button className="copy-button" onClick={handleCopyUrl}>
              📋 コピー
            </button>
          </div>
        </div>
        
        <div className="twitter-share-actions">
          <button 
            className="twitter-share-button" 
            onClick={handleTwitterShare}
            disabled={isSharing}
          >
            {isSharing ? (
              <>
                <span className="loading-spinner"></span>
                シェア中...
              </>
            ) : (
              <>
                <span className="twitter-icon">𝕏</span>
                Xでシェア
              </>
            )}
          </button>
          
          <button className="cancel-button" onClick={onClose}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwitterShare;
