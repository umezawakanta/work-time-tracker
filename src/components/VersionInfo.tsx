import React, { useState, useEffect } from 'react';
import { VersionInfo, initializeVersionInfo, updateVersionInfo, shouldCheckForUpdates, checkForUpdates, forceUpdateVersionInfo } from '../utils/version';

interface VersionInfoProps {
  className?: string;
}

const VersionInfoComponent: React.FC<VersionInfoProps> = ({ className = '' }) => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // バージョン情報を強制更新
    const initVersionInfo = forceUpdateVersionInfo();
    setVersionInfo(initVersionInfo);

    // 更新チェックが必要かどうかを確認
    if (shouldCheckForUpdates(initVersionInfo)) {
      checkForUpdatesAsync();
    }
  }, []);

  const checkForUpdatesAsync = async () => {
    if (!versionInfo) {
      return;
    }

    setIsChecking(true);
    try {
      const result = await checkForUpdates(versionInfo.version, versionInfo.buildId);
      setHasUpdate(result.hasUpdate);
      setLatestVersion(result.latestVersion || null);

      // バージョン情報を更新
      const updatedVersionInfo = updateVersionInfo(versionInfo);
      setVersionInfo(updatedVersionInfo);
    } catch (error) {
      console.error('Failed to check for updates:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleForceUpdate = () => {
    const newVersionInfo = forceUpdateVersionInfo();
    setVersionInfo(newVersionInfo);
  };

  const formatBuildDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (!versionInfo) {
    return null;
  }

  return (
    <div className={`version-info ${className}`}>
      <div 
        className="version-display"
        onClick={() => setShowDetails(!showDetails)}
        title="バージョン情報をクリックして詳細を表示"
      >
        <span className="version-text">
          v{versionInfo.version}
          {hasUpdate && <span className="update-indicator">🔄</span>}
        </span>
        {isChecking && <span className="checking-indicator">⏳</span>}
      </div>

      {showDetails && (
        <>
          <div className="version-backdrop" onClick={() => setShowDetails(false)} />
          <div className="version-details">
            <div className="version-detail-item">
              <span className="detail-label">バージョン:</span>
              <span className="detail-value">v{versionInfo.version}</span>
            </div>
            <div className="version-detail-item">
              <span className="detail-label">ビルドID:</span>
              <span className="detail-value">{versionInfo.buildId}</span>
            </div>
            <div className="version-detail-item">
              <span className="detail-label">ビルド日時:</span>
              <span className="detail-value">{formatBuildDate(versionInfo.buildDate)}</span>
            </div>
            {latestVersion && latestVersion !== versionInfo.version && (
              <div className="version-detail-item">
                <span className="detail-label">最新バージョン:</span>
                <span className="detail-value latest-version">v{latestVersion}</span>
              </div>
            )}
            <div className="version-actions">
              <button
                onClick={checkForUpdatesAsync}
                disabled={isChecking}
                className="check-update-button"
              >
                {isChecking ? 'チェック中...' : '更新確認'}
              </button>
              <button
                onClick={handleForceUpdate}
                className="force-update-button"
              >
                バージョン更新
              </button>
              {hasUpdate && (
                <button
                  onClick={handleRefresh}
                  className="refresh-button"
                >
                  更新
                </button>
              )}
              <button
                onClick={() => setShowDetails(false)}
                className="close-details-button"
              >
                閉じる
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VersionInfoComponent;
