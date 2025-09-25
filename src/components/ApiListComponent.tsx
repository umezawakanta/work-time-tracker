import React, { useState, useEffect } from 'react';
import './ApiListComponent.css';
import { getAuthToken } from '../utils/authUtils';

// 成功率計算のユーティリティ関数
const calculateSuccessRate = (totalChecks: number, successfulChecks: number): number => {
  return totalChecks > 0 ? Math.round((successfulChecks / totalChecks) * 100) : 0;
};

interface ApiEndpoint {
  id: string;
  path: string;
  method: string;
  description: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  lastChecked: string;
  responseTime?: number;
  errorCount: number;
  successRate: number;
  lastError?: string;
  totalChecks?: number;
  successfulChecks?: number;
}

interface HealthCheckResult {
  endpoint: string;
  method: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  responseTime: number;
  statusCode?: number;
  error?: string;
  lastChecked: string;
}

interface ApiListComponentProps {
  className?: string;
}

const ApiListComponent: React.FC<ApiListComponentProps> = ({ className = '' }) => {
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'healthy' | 'warning' | 'error'>('all');
  const [sortBy, setSortBy] = useState<'path' | 'status' | 'lastChecked' | 'errorCount'>('path');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isHealthChecking, setIsHealthChecking] = useState(false);

  // API一覧を取得
  const loadApiEndpoints = async () => {
    setLoading(true);
    setError(null);

    try {
      // getAuthToken is a synchronous function that returns the token directly.
      // If an error occurs during token retrieval, it will call the provided callback with the error message.
      const token = getAuthToken(setError);
      if (!token) {
        return;
      }

      const response = await fetch('/api/admin/api-list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('API一覧の取得に失敗しました');
      }

      const data = await response.json();
      setApiEndpoints(data.endpoints || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // ヘルスチェックを実行
  const performHealthCheck = async () => {
    setIsHealthChecking(true);
    setError(null);
    
    try {
      const token = getAuthToken(setError);
      if (!token) {
        return;
      }

      const response = await fetch('/api/admin/api-health-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          endpoints: apiEndpoints.map(api => ({
            path: api.path,
            method: api.method
          }))
        })
      });

      if (!response.ok) {
        throw new Error('ヘルスチェックの実行に失敗しました');
      }

      const data = await response.json();
      
      // 結果を既存のAPI一覧にマージ
      const updatedEndpoints = apiEndpoints.map(api => {
        const healthResult = data.results.find((r: HealthCheckResult) => 
          r.endpoint === api.path && r.method === api.method
        );
        
        if (healthResult) {
          // 実際の成功率を計算（過去のチェック回数と成功回数に基づく）
          const totalChecks = (api.totalChecks || 0) + 1;
          const successfulChecks = (api.successfulChecks || 0) + (healthResult.status === 'healthy' ? 1 : 0);
          const actualSuccessRate = calculateSuccessRate(totalChecks, successfulChecks);
          
          return {
            ...api,
            status: healthResult.status,
            responseTime: healthResult.responseTime,
            lastChecked: healthResult.lastChecked,
            errorCount: healthResult.status === 'error' ? api.errorCount + 1 : api.errorCount,
            successRate: actualSuccessRate,
            totalChecks: totalChecks,
            successfulChecks: successfulChecks
          };
        }
        
        return api;
      });
      
      setApiEndpoints(updatedEndpoints);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ヘルスチェック中にエラーが発生しました');
    } finally {
      setIsHealthChecking(false);
    }
  };

  // コンポーネントマウント時にAPI一覧を取得
  useEffect(() => {
    loadApiEndpoints();
  }, []);

  // フィルタリングとソート
  const filteredAndSortedEndpoints = apiEndpoints
    .filter(endpoint => {
      if (filter === 'all') {
        return true;
      }
      return endpoint.status === filter;
    })
    .sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortBy) {
        case 'path':
          aValue = a.path;
          bValue = b.path;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'lastChecked':
          aValue = new Date(a.lastChecked).getTime();
          bValue = new Date(b.lastChecked).getTime();
          break;
        case 'errorCount':
          aValue = a.errorCount;
          bValue = b.errorCount;
          break;
        default:
          aValue = a.path;
          bValue = b.path;
      }

      if (aValue === bValue) {
        return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // ステータス別の色を取得
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#28a745';
      case 'warning':
        return '#ffc107';
      case 'error':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  // ステータス別のアイコンを取得
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bi-check-circle-fill';
      case 'warning':
        return 'bi-exclamation-triangle-fill';
      case 'error':
        return 'bi-x-circle-fill';
      default:
        return 'bi-question-circle-fill';
    }
  };

  // メソッド別の色を取得
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return '#28a745';
      case 'POST':
        return '#007bff';
      case 'PUT':
        return '#ffc107';
      case 'DELETE':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  return (
    <div className={`api-list-container ${className}`}>
      <div className="api-list-header">
        <h2>
          <i className="bi bi-list-ul"></i>
          API一覧・監視
        </h2>
        <div className="header-buttons">
          <button
            className="refresh-button"
            onClick={loadApiEndpoints}
            disabled={loading}
          >
            <i className={`bi bi-arrow-clockwise ${loading ? 'spinning' : ''}`}></i>
            更新
          </button>
          <button
            className="health-check-button"
            onClick={performHealthCheck}
            disabled={isHealthChecking || loading}
          >
            <i className={`bi bi-heart-pulse ${isHealthChecking ? 'spinning' : ''}`}></i>
            {isHealthChecking ? 'チェック中...' : 'ヘルスチェック'}
          </button>
        </div>
      </div>

      {/* フィルターとソート */}
      <div className="api-list-controls">
        <div className="filter-controls">
          <label>ステータス:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'healthy' | 'warning' | 'error')}
            title="ステータスフィルター"
          >
            <option value="all">すべて</option>
            <option value="healthy">正常</option>
            <option value="warning">警告</option>
            <option value="error">エラー</option>
          </select>
        </div>

        <div className="sort-controls">
          <label>並び順:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'path' | 'status' | 'lastChecked' | 'errorCount')}
            title="並び順選択"
          >
            <option value="path">パス</option>
            <option value="status">ステータス</option>
            <option value="lastChecked">最終確認</option>
            <option value="errorCount">エラー数</option>
          </select>
          <button
            className="sort-order-button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title="並び順を切り替え"
          >
            <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
          </button>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="error-message">
          <i className="bi bi-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* ローディング表示 */}
      {loading && (
        <div className="loading-message">
          <i className="bi bi-hourglass-split spinning"></i>
          API一覧を読み込み中...
        </div>
      )}

      {/* API一覧テーブル */}
      {!loading && !error && (
        <div className="api-list-table-container">
          <table className="api-list-table">
            <thead>
              <tr>
                <th>ステータス</th>
                <th>メソッド</th>
                <th>パス</th>
                <th>説明</th>
                <th>成功率</th>
                <th>エラー数</th>
                <th>応答時間</th>
                <th>最終確認</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedEndpoints.map((endpoint) => (
                <tr key={endpoint.id} className={`api-endpoint-row status-${endpoint.status}`}>
                  <td>
                    <span
                      className={`status-indicator status-${endpoint.status}`}
                    >
                      <i className={getStatusIcon(endpoint.status)}></i>
                      {endpoint.status === 'healthy' && '正常'}
                      {endpoint.status === 'warning' && '警告'}
                      {endpoint.status === 'error' && 'エラー'}
                      {endpoint.status === 'unknown' && '不明'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`method-badge method-${endpoint.method.toLowerCase()}`}
                    >
                      {endpoint.method}
                    </span>
                  </td>
                  <td className="path-cell">
                    <code>{endpoint.path}</code>
                  </td>
                  <td className="description-cell">
                    {endpoint.description}
                  </td>
                  <td>
                    <div className="success-rate">
                      <div className="success-rate-bar">
                        <div
                          className="success-rate-fill"
                          style={{ width: `${endpoint.successRate}%` }}
                        ></div>
                      </div>
                      <span className="success-rate-text">
                        {endpoint.successRate}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`error-count ${endpoint.errorCount > 0 ? 'has-errors' : ''}`}>
                      {endpoint.errorCount}
                    </span>
                  </td>
                  <td>
                    {endpoint.responseTime ? (
                      <span className="response-time">
                        {endpoint.responseTime}ms
                      </span>
                    ) : (
                      <span className="no-data">-</span>
                    )}
                  </td>
                  <td>
                    <span className="last-checked">
                      {new Date(endpoint.lastChecked).toLocaleString('ja-JP')}
                    </span>
                  </td>
                  <td>
                    {/* <div className="action-buttons"></div> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAndSortedEndpoints.length === 0 && (
            <div className="no-data-message">
              <i className="bi bi-inbox"></i>
              表示するAPIがありません
            </div>
          )}
        </div>
      )}

      {/* 統計情報 */}
      {!loading && !error && apiEndpoints.length > 0 && (
        <div className="api-stats">
          <div className="stat-item">
            <span className="stat-label">総API数:</span>
            <span className="stat-value">{apiEndpoints.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">正常:</span>
            <span className="stat-value healthy">
              {apiEndpoints.filter(api => api.status === 'healthy').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">警告:</span>
            <span className="stat-value warning">
              {apiEndpoints.filter(api => api.status === 'warning').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">エラー:</span>
            <span className="stat-value error">
              {apiEndpoints.filter(api => api.status === 'error').length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiListComponent;
