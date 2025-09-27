// バージョン情報の管理
export interface VersionInfo {
  version: string;
  buildId: string;
  buildDate: string;
  lastChecked?: string;
}

// ビルド情報を生成
export const generateBuildInfo = (): Omit<VersionInfo, 'lastChecked'> => {
  const buildId = `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const buildDate = new Date().toISOString();
  
  return {
    version: '1.0.12', // package.jsonから取得する場合はimport.meta.env.VITE_APP_VERSION
    buildId,
    buildDate
  };
};

// ローカルストレージからバージョン情報を取得
export const getStoredVersionInfo = (): VersionInfo | null => {
  try {
    const stored = localStorage.getItem('appVersionInfo');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to parse stored version info:', error);
    return null;
  }
};

// バージョン情報をローカルストレージに保存
export const storeVersionInfo = (versionInfo: VersionInfo): void => {
  try {
    localStorage.setItem('appVersionInfo', JSON.stringify(versionInfo));
  } catch (error) {
    console.error('Failed to store version info:', error);
  }
};

// バージョン情報を初期化
export const initializeVersionInfo = (): VersionInfo => {
  const stored = getStoredVersionInfo();
  const newVersionInfo = {
    ...generateBuildInfo(),
    lastChecked: new Date().toISOString()
  };
  
  // 常に新しいバージョン情報を生成して保存
  storeVersionInfo(newVersionInfo);
  return newVersionInfo;
};

// バージョンチェックが必要かどうかを判定
export const shouldCheckForUpdates = (versionInfo: VersionInfo): boolean => {
  if (!versionInfo.lastChecked) {
    return true;
  }
  
  const lastChecked = new Date(versionInfo.lastChecked);
  const now = new Date();
  const hoursSinceLastCheck = (now.getTime() - lastChecked.getTime()) / (1000 * 60 * 60);
  
  // 24時間ごとにチェック
  return hoursSinceLastCheck >= 24;
};

// バージョン情報を更新
export const updateVersionInfo = (versionInfo: VersionInfo): VersionInfo => {
  const updated = {
    ...versionInfo,
    lastChecked: new Date().toISOString()
  };
  
  storeVersionInfo(updated);
  return updated;
};

// バージョン比較
export const compareVersions = (version1: string, version2: string): number => {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part > v2part) {
      return 1;
    }
    if (v1part < v2part) {
      return -1;
    }
  }
  
  return 0;
};

// バージョン情報を強制更新
export const forceUpdateVersionInfo = (): VersionInfo => {
  const newVersionInfo = {
    ...generateBuildInfo(),
    lastChecked: new Date().toISOString()
  };
  
  storeVersionInfo(newVersionInfo);
  return newVersionInfo;
};

// 更新が必要かどうかをチェック
export const checkForUpdates = async (version: string, buildId: string): Promise<{ hasUpdate: boolean; latestVersion?: string }> => {
  try {
    console.log('Checking for updates with version:', version, 'buildId:', buildId);
    
    const response = await fetch(`/api/version/check?version=${encodeURIComponent(version)}&buildId=${encodeURIComponent(buildId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Version check response:', data);
      
      return {
        hasUpdate: data.hasUpdate || false,
        latestVersion: data.latestVersion
      };
    } else {
      console.warn('Version check failed with status:', response.status);
      const errorData = await response.json().catch(() => ({}));
      console.warn('Error response:', errorData);
      // サーバーエラーの場合は更新なしとして扱う
      return { hasUpdate: false };
    }
  } catch (error) {
    console.error('Failed to check for updates:', error);
    // ネットワークエラーやその他のエラーの場合は更新なしとして扱う
    return { hasUpdate: false };
  }
};
