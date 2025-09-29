import React from 'react';
import { BadgeShareData } from '../types/badge';

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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '20px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3>X（Twitter）でシェア</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '30px' }}>{shareData.badge.icon}</span>
            <div>
              <h4 style={{ margin: 0 }}>{shareData.badge.name}</h4>
              <p style={{ margin: 0, color: '#666' }}>{shareData.badge.description}</p>
            </div>
          </div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="share-text" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            シェアテキスト
          </label>
          <textarea
            id="share-text"
            value={shareData.shareText}
            readOnly
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              minHeight: '80px',
              resize: 'vertical'
            }}
          />
          <button
            onClick={handleCopyText}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            📋 コピー
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={handleTwitterShare}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1da1f2',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            𝕏 Xでシェア
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleShareModal;
