import React from 'react';
import './LogoutButtonComponent.css';

interface LogoutButtonComponentProps {
  onLogout: () => void;
}

const LogoutButtonComponent: React.FC<LogoutButtonComponentProps> = ({ onLogout }) => {
  return (
    <div className="logout-container">
      <button
        onClick={onLogout}
        className="logout-button"
        title="ログアウト"
      >
        <i className="bi bi-box-arrow-right"></i>
      </button>
    </div>
  );
};

export default LogoutButtonComponent;
