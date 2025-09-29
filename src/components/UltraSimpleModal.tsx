import React from 'react';

interface UltraSimpleModalProps {
  onClose: () => void;
}

const UltraSimpleModal: React.FC<UltraSimpleModalProps> = ({ onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h2 style={{ color: 'red', marginBottom: '20px' }}>
          🎉 モーダルが表示されました！
        </h2>
        <p style={{ marginBottom: '30px' }}>
          これはテスト用のシンプルなモーダルです。
        </p>
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

export default UltraSimpleModal;
