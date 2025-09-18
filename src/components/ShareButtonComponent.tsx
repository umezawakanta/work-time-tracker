import React, { useState } from 'react';
import './ShareButtonComponent.css';

interface ShareButtonComponentProps {
  className?: string;
}

const ShareButtonComponent: React.FC<ShareButtonComponentProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [randomElements, setRandomElements] = useState(() => generateRandomElements());

  const siteUrl = window.location.origin;
  
  // ランダムな要素を生成する関数
  function generateRandomElements() {
    const adjectives = ['可愛い', '素敵な', '楽しい', '便利な', '効率的な', '魅力的な', '実用的な', '革新的な', '優しい', '親しみやすい', '頼もしい', '面白い', '素晴らしい', '驚きの', '特別な', 'ユニークな'];
    const characters = ['キャラクター', '仲間', 'パートナー', 'お友達', 'アシスタント', 'サポーター', '相棒', 'チームメイト', 'ガイド', 'コーチ', 'メンター', 'バディ'];
    const activities = ['作業時間管理', '時間トラッキング', 'プロジェクト管理', 'タスク管理', '時間記録', '作業効率化', '生産性向上', '時間活用', 'スケジュール管理', '進捗管理', '目標達成', '成果向上'];
    const features = ['タイマー機能', 'メモ機能', '作業記録', '分析機能', 'レポート機能', 'カレンダー機能', '統計機能', '目標設定', '通知機能', 'データ可視化', 'エクスポート機能', 'カスタマイズ機能', '同期機能', 'バックアップ機能'];
    const benefits = ['効率的な作業管理', '時間の有効活用', '生産性の向上', '目標達成のサポート', '進捗の可視化', '習慣の定着', 'モチベーション維持', '成果の分析'];
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    const randomFeatures = features.sort(() => 0.5 - Math.random()).slice(0, 3);
    const randomBenefit = benefits[Math.floor(Math.random() * benefits.length)];
    
    return {
      adjective: randomAdjective,
      character: randomCharacter,
      activity: randomActivity,
      features: randomFeatures,
      benefit: randomBenefit
    };
  }

  const siteTitle = `Work Time Tracker - ${randomElements.adjective}${randomElements.character}と一緒に${randomElements.activity}`;
  const siteDescription = `${randomElements.adjective}${randomElements.character}と一緒に${randomElements.activity}ができるWebアプリです。${randomElements.features.join('、')}など、${randomElements.benefit}をサポートします。ユーザーから要求があった機能をすぐに実装します！`;

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
          // コピー成功後に新しいランダム要素を生成
          setRandomElements(generateRandomElements());
          return;
        } catch (err) {
          console.error('コピーに失敗しました:', err);
          return;
        }
      case 'native':
        try {
          if (navigator.share) {
            await navigator.share(shareData);
            // ネイティブシェア成功後に新しいランダム要素を生成
            setRandomElements(generateRandomElements());
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
    
    // シェア処理完了後に新しいランダム要素を生成
    setRandomElements(generateRandomElements());
  };

  return (
    <div className={`share-button-container ${className}`}>
      <button
        className="share-button"
        onClick={() => {
          setRandomElements(generateRandomElements());
          setIsOpen(!isOpen);
        }}
        aria-label="シェア"
      >
        <i className="bi bi-share share-icon"></i>
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
                <i className="bi bi-facebook share-option-icon"></i>
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
                <i className="bi bi-clipboard share-option-icon"></i>
                <span>URLコピー</span>
              </button>

              {typeof navigator.share === 'function' && (
                <button
                  className="share-option native"
                  onClick={() => handleShare('native')}
                >
                  <i className="bi bi-phone share-option-icon"></i>
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