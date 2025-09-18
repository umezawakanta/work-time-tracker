import React, { useState } from 'react';
import './ShareButtonComponent.css';

interface ShareButtonComponentProps {
  url?: string;
  title?: string;
  description?: string;
}

const ShareButtonComponent: React.FC<ShareButtonComponentProps> = ({
  url = window.location.href,
  title = 'Work Time Tracker - 作業時間管理アプリ',
  description = '可愛いキャラクターと一緒に作業時間を管理できるアプリです。タイマー機能、記録管理、メモ機能などが充実！'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const shareData = {
    title,
    text: description,
    url
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('シェアがキャンセルされました');
      }
    } else {
      // フォールバック: URLをクリップボードにコピー
      navigator.clipboard.writeText(url);
      alert('URLをクリップボードにコピーしました！');
    }
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareToLine = () => {
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;
    window.open(lineUrl, '_blank', 'width=600,height=400');
  };

  const shareToLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    alert('URLをクリップボードにコピーしました！');
  };

  return (
    <div className="share-container">
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
          
          <div className="share-content">
            <p className="share-description">
              {description}
            </p>
            
            <div className="share-buttons">
              <button 
                className="share-option twitter"
                onClick={shareToTwitter}
                title="Twitterでシェア"
              >
                <span className="social-icon">🐦</span>
                <span>Twitter</span>
              </button>
              
              <button 
                className="share-option facebook"
                onClick={shareToFacebook}
                title="Facebookでシェア"
              >
                <span className="social-icon">📘</span>
                <span>Facebook</span>
              </button>
              
              <button 
                className="share-option line"
                onClick={shareToLine}
                title="LINEでシェア"
              >
                <span className="social-icon">💬</span>
                <span>LINE</span>
              </button>
              
              <button 
                className="share-option linkedin"
                onClick={shareToLinkedIn}
                title="LinkedInでシェア"
              >
                <span className="social-icon">💼</span>
                <span>LinkedIn</span>
              </button>
              
              <button 
                className="share-option native"
                onClick={handleNativeShare}
                title="ネイティブシェア"
              >
                <span className="social-icon">📱</span>
                <span>シェア</span>
              </button>
              
              <button 
                className="share-option copy"
                onClick={copyUrl}
                title="URLをコピー"
              >
                <span className="social-icon">📋</span>
                <span>URLコピー</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButtonComponent;
