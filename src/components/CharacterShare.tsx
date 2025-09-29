import React, { useState } from 'react';
import { Character } from '../types/character';
import './CharacterShare.css';

interface CharacterShareProps {
  character: Character | null;
  onClose: () => void;
}

const CharacterShare: React.FC<CharacterShareProps> = ({
  character,
  onClose
}) => {
  const [shareText, setShareText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // キャラクター情報をテキストに変換
  const generateShareText = () => {
    if (!character) return '';

    const levelText = `レベル ${character.level}`;
    const expText = `${character.experience} EXP`;
    const accessoriesText = character.customization.accessories.length > 0 
      ? `アクセサリー: ${character.customization.accessories.join(', ')}`
      : 'アクセサリーなし';
    
    return `🎭 私のキャラクター「${character.name}」\n${levelText} | ${expText}\n${accessoriesText}\n\n#WorkTimeTracker #キャラクター`;
  };

  // 共有テキストを生成
  const handleGenerateText = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const text = generateShareText();
      setShareText(text);
      setIsGenerating(false);
    }, 500);
  };

  // テキストをコピー
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      alert('テキストをコピーしました！');
    } catch (err) {
      console.error('コピーに失敗しました:', err);
      alert('コピーに失敗しました。手動でコピーしてください。');
    }
  };

  // URLを生成
  const generateShareUrl = () => {
    if (!character) return '';
    
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      character: character.id,
      level: character.level.toString(),
      exp: character.experience.toString(),
      color: character.customization.color,
      accessories: character.customization.accessories.join(',')
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  // URLを生成
  const handleGenerateUrl = () => {
    const url = generateShareUrl();
    setShareUrl(url);
  };

  // URLをコピー
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('URLをコピーしました！');
    } catch (err) {
      console.error('コピーに失敗しました:', err);
      alert('コピーに失敗しました。手動でコピーしてください。');
    }
  };

  // Twitterで共有
  const handleTwitterShare = () => {
    const text = encodeURIComponent(shareText);
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank');
  };

  // LINEで共有
  const handleLineShare = () => {
    const text = encodeURIComponent(shareText);
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl || window.location.href)}&text=${text}`;
    window.open(url, '_blank');
  };

  if (!character) {
    return (
      <div className="character-share">
        <div className="no-character">
          <p>キャラクターを選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="character-share">
      <div className="share-header">
        <h3>📤 キャラクター共有</h3>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="share-content">
        <div className="character-preview">
          <div className="character-avatar">
            <span className="character-emoji">
              {character.type === 'cute' && '🐱'}
              {character.type === 'cool' && '🦁'}
              {character.type === 'mysterious' && '🦄'}
              {character.type === 'energetic' && '🐶'}
            </span>
          </div>
          <div className="character-info">
            <h4>{character.name}</h4>
            <p>レベル {character.level} | {character.experience} EXP</p>
            {character.customization.accessories.length > 0 && (
              <p>アクセサリー: {character.customization.accessories.join(', ')}</p>
            )}
          </div>
        </div>

        <div className="share-options">
          <div className="share-section">
            <h4>📝 テキスト共有</h4>
            <p>キャラクター情報をテキストで共有できます</p>
            <div className="share-controls">
              <button 
                className="generate-button" 
                onClick={handleGenerateText}
                disabled={isGenerating}
              >
                {isGenerating ? '生成中...' : 'テキスト生成'}
              </button>
              {shareText && (
                <button className="copy-button" onClick={handleCopyText}>
                  コピー
                </button>
              )}
            </div>
            {shareText && (
              <div className="share-text-preview">
                <textarea 
                  value={shareText} 
                  readOnly 
                  className="share-textarea"
                />
              </div>
            )}
          </div>

          <div className="share-section">
            <h4>🔗 URL共有</h4>
            <p>キャラクター情報を含むURLを生成できます</p>
            <div className="share-controls">
              <button className="generate-button" onClick={handleGenerateUrl}>
                URL生成
              </button>
              {shareUrl && (
                <button className="copy-button" onClick={handleCopyUrl}>
                  コピー
                </button>
              )}
            </div>
            {shareUrl && (
              <div className="share-url-preview">
                <input 
                  type="text" 
                  value={shareUrl} 
                  readOnly 
                  className="share-input"
                />
              </div>
            )}
          </div>

          <div className="share-section">
            <h4>🌐 SNS共有</h4>
            <p>ソーシャルメディアで共有できます</p>
            <div className="sns-buttons">
              <button 
                className="sns-button twitter" 
                onClick={handleTwitterShare}
                disabled={!shareText}
              >
                🐦 Twitter
              </button>
              <button 
                className="sns-button line" 
                onClick={handleLineShare}
                disabled={!shareUrl}
              >
                💬 LINE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterShare;
