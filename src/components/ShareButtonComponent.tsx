import React, { useState } from 'react';
import './ShareButtonComponent.css';

interface ShareButtonComponentProps {
  className?: string;
}

const ShareButtonComponent: React.FC<ShareButtonComponentProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const siteUrl = window.location.origin;
  const siteTitle = 'Work Time Tracker - 可愛いキャラクターと一緒に作業時間を管理';
  const siteDescription = '可愛いキャラクターと一緒に作業時間を管理できるWebアプリです。タイマー機能、メモ機能、作業記録など、効率的な作業管理をサポートします。';

  const shareData = {
    title: siteTitle,
    text: siteDescription,
    url: siteUrl,
  };

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(siteUrl);
    const encodedTitle = encodeURIComponent(siteTitle);
    const encodedDescription = encodeURIComponent(siteDescription);

    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'line':
        shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(siteUrl);
          alert('URLをコピーしました！');
          return;
        } catch (err) {
          console.error('コピーに失敗しました:', err);
          return;
        }
      case 'native':
        try {
          if (navigator.share) {
            await navigator.share(shareData);
            return;
          }
        } catch (err) {
          console.error('ネイティブシェアに失敗しました:', err);
        }
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className={`share-button-container ${className}`}>
      <button
        className="share-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="シェア"
      >
        <span className="share-icon">📤</span>
        <span className="share-text">シェア</span>
      </button>

      {isOpen && (
        <div className="share-dropdown">
          <div className="share-dropdown-content">
            <div className="share-header">
              <h3>シェア</h3>
              <button
                className="close-button"
                onClick={() => setIsOpen(false)}
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
            
            <div className="share-description">
              <p>{siteDescription}</p>
            </div>

            <div className="share-buttons">
              <button
                className="share-option twitter"
                onClick={() => handleShare('twitter')}
              >
                <span className="share-option-icon">🐦</span>
                <span>Twitter</span>
              </button>

              <button
                className="share-option facebook"
                onClick={() => handleShare('facebook')}
              >
                <span className="share-option-icon">📘</span>
                <span>Facebook</span>
              </button>

              <button
                className="share-option line"
                onClick={() => handleShare('line')}
              >
                <span className="share-option-icon">💬</span>
                <span>LINE</span>
              </button>

              <button
                className="share-option linkedin"
                onClick={() => handleShare('linkedin')}
              >
                <span className="share-option-icon">💼</span>
                <span>LinkedIn</span>
              </button>

              <button
                className="share-option copy"
                onClick={() => handleShare('copy')}
              >
                <span className="share-option-icon">📋</span>
                <span>URLコピー</span>
              </button>

              {navigator.share && (
                <button
                  className="share-option native"
                  onClick={() => handleShare('native')}
                >
                  <span className="share-option-icon">📱</span>
                  <span>その他</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButtonComponent;