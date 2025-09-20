import React, { useState } from 'react';
import { APP_VERSION, CHANGELOG } from '../constants/version';
import './VersionInfo.css';

interface VersionInfoProps {
  className?: string;
}

const VersionInfo: React.FC<VersionInfoProps> = ({ className = '' }) => {
  const [showChangelog, setShowChangelog] = useState(false);

  const latestChangelog = CHANGELOG[0];

  return (
    <div className={`version-info ${className}`}>
      <div className="version-display">
        <span className="version-label">バージョン:</span>
        <span className="version-number">{APP_VERSION}</span>
        {latestChangelog && (
          <button
            className="changelog-toggle"
            onClick={() => setShowChangelog(!showChangelog)}
            title="更新履歴を表示"
          >
            {showChangelog ? '▼' : '▶'} 更新履歴
          </button>
        )}
      </div>

      {showChangelog && (
        <div className="changelog-container">
          <div className="changelog-header">
            <h3>更新履歴</h3>
            <button
              className="close-changelog"
              onClick={() => setShowChangelog(false)}
              title="閉じる"
            >
              ×
            </button>
          </div>
          <div className="changelog-content">
            {CHANGELOG.map((entry) => (
              <div key={entry.version} className={`changelog-entry ${entry.type}`}>
                <div className="changelog-version">
                  <span className="version-number">{entry.version}</span>
                  <span className="version-date">({entry.date})</span>
                </div>
                <div className="changelog-type">
                  {entry.type === 'bugfix' && '🐛 バグ修正'}
                  {entry.type === 'feature' && '✨ 新機能'}
                  {entry.type === 'improvement' && '⚡ 改善'}
                  {entry.type === 'breaking' && '💥 破壊的変更'}
                </div>
                <ul className="changelog-changes">
                  {entry.changes.map((change, changeIndex) => (
                    <li key={changeIndex}>{change}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionInfo;