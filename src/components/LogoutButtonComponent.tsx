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
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 12H15M15 12L11 8M15 12L11 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default LogoutButtonComponent;
