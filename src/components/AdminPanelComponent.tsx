import React, { useState, useEffect } from 'react';
import './AdminPanelComponent.css';
import type { AdminUser } from '../types';
import SourceCodeViewer from './SourceCodeViewer';

interface AdminPanelComponentProps {
  showAdminPanel: boolean;
  setShowAdminPanel: (show: boolean) => void;
  adminUsers: AdminUser[];
  adminUsersLoading: boolean;
  editingUser: AdminUser | null;
  setEditingUser: (user: AdminUser | null) => void;
  loadAdminUsers: () => void;
  handleEditUser: (user: AdminUser) => void;
  handleUpdateUser: (updatedUser: AdminUser) => void;
  handleDeleteUser: (userId: string, userName: string) => void;
  closeOtherFeatures: (activeFeature: string) => void;
}

const AdminPanelComponent: React.FC<AdminPanelComponentProps> = ({
  showAdminPanel,
  setShowAdminPanel,
  adminUsers,
  adminUsersLoading,
  editingUser,
  setEditingUser,
  loadAdminUsers,
  handleEditUser,
  handleUpdateUser,
  handleDeleteUser,
  closeOtherFeatures,
}) => {
  const [editingUserData, setEditingUserData] = useState<Partial<AdminUser>>({});
  const [showUserForm, setShowUserForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'email' | 'role' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState<'users' | 'sourcecode' | 'errorreports' | 'updaterequests'>('users');
  const [errorReports, setErrorReports] = useState<any[]>([]);
  const [errorReportsLoading, setErrorReportsLoading] = useState(false);
  const [errorReportsError, setErrorReportsError] = useState<string | null>(null);
  const [updateRequests, setUpdateRequests] = useState<any[]>([]);
  const [updateRequestsLoading, setUpdateRequestsLoading] = useState(false);
  const [updateRequestsError, setUpdateRequestsError] = useState<string | null>(null);

  // ユーザー編集フォームの初期化
  useEffect(() => {
    if (editingUser) {
      setEditingUserData({
        email: editingUser.email || '',
        role: editingUser.role || 'user',
      });
      setShowUserForm(true);
    } else {
      setEditingUserData({});
      setShowUserForm(false);
    }
  }, [editingUser]);

  // 検索・ソート機能
  const filteredUsers = (adminUsers || [])
    .filter(user => 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // 不具合報告メモを取得
  const loadErrorReports = async () => {
    setErrorReportsLoading(true);
    setErrorReportsError(null);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/admin/error-reports', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setErrorReports(data.errorReports || []);
        } else {
          console.error('API returned error:', data.message);
          setErrorReportsError(data.message || 'エラーレポートの取得に失敗しました');
          setErrorReports([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `サーバーエラー (${response.status})`;
        console.error('Failed to load error reports:', response.status, errorMessage);
        setErrorReportsError(errorMessage);
        setErrorReports([]);
      }
    } catch (error) {
      console.error('Error loading error reports:', error);
      setErrorReportsError('ネットワークエラーが発生しました');
      setErrorReports([]);
    } finally {
      setErrorReportsLoading(false);
    }
  };

  // 更新要望メモを取得
  const loadUpdateRequests = async () => {
    setUpdateRequestsLoading(true);
    setUpdateRequestsError(null);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/memos/public', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // postTypeがupdate_requestのメモのみをフィルタリング
          const updateRequestsData = (data.memos || []).filter((memo: any) => 
            memo.postType === 'update_request'
          );
          setUpdateRequests(updateRequestsData);
        } else {
          console.error('API returned error:', data.message);
          setUpdateRequestsError(data.message || '更新要望の取得に失敗しました');
          setUpdateRequests([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `サーバーエラー (${response.status})`;
        console.error('Failed to load update requests:', response.status, errorMessage);
        setUpdateRequestsError(errorMessage);
        setUpdateRequests([]);
      }
    } catch (error) {
      console.error('Error loading update requests:', error);
      setUpdateRequestsError('ネットワークエラーが発生しました');
      setUpdateRequests([]);
    } finally {
      setUpdateRequestsLoading(false);
    }
  };

  // フォーム送信処理
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser && editingUserData.email) {
      handleUpdateUser({
        ...editingUser,
        ...editingUserData,
      });
      setEditingUser(null);
      setEditingUserData({});
      setShowUserForm(false);
    }
  };

  // フォームキャンセル処理
  const handleFormCancel = () => {
    setEditingUser(null);
    setEditingUserData({});
    setShowUserForm(false);
  };

  // 日時フォーマット関数
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '日付不明';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '無効な日付';
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ロールの色を取得
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#dc3545';
      case 'moderator':
        return '#fd7e14';
      case 'user':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  };

  // ロールの表示名を取得
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理者';
      case 'moderator':
        return 'モデレーター';
      case 'user':
        return 'ユーザー';
      default:
        return role;
    }
  };

  return (
    <div className="admin-panel-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">
            <div className="mini-character">
              <div className="mini-character-halo"></div>
              <div className="mini-character-wings">
                <div className="mini-wing left-mini-wing"></div>
                <div className="mini-wing right-mini-wing"></div>
              </div>
              <div className="mini-character-face">
                <div className="mini-character-eyes">
                  <div className="mini-eye left-mini-eye"></div>
                  <div className="mini-eye right-mini-eye"></div>
                </div>
                <div className="mini-character-mouth"></div>
              </div>
              <div className="mini-character-body"></div>
              <div className="mini-sparkles">
                <div className="mini-sparkle mini-sparkle-1"></div>
                <div className="mini-sparkle mini-sparkle-2"></div>
              </div>
            </div>
          </span>
          管理者パネル
        </h2>
        <div className="section-controls">
          {showAdminPanel ? (
            <button
              onClick={() => setShowAdminPanel(false)}
              className="close-section-button"
              title="セクションを閉じる"
            >
              ✕
            </button>
          ) : (
            <button
              onClick={() => {
                closeOtherFeatures("admin-panel");
                setShowAdminPanel(true);
                loadAdminUsers();
              }}
              className="show-section-button"
              title="セクションを表示"
            >
              ▶️
            </button>
          )}
        </div>
      </div>

      {showAdminPanel && (
        <div className="admin-panel-content">
          {/* タブナビゲーション */}
          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <i className="bi bi-people"></i>
              ユーザー管理
            </button>
            <button
              className={`admin-tab ${activeTab === 'sourcecode' ? 'active' : ''}`}
              onClick={() => setActiveTab('sourcecode')}
            >
              <i className="bi bi-code-slash"></i>
              ソースコード
            </button>
            <button
              className={`admin-tab ${activeTab === 'errorreports' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('errorreports');
                if (errorReports.length === 0) {
                  loadErrorReports();
                }
              }}
            >
              <i className="bi bi-bug"></i>
              不具合報告
            </button>
            <button
              className={`admin-tab ${activeTab === 'updaterequests' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('updaterequests');
                if (updateRequests.length === 0) {
                  loadUpdateRequests();
                }
              }}
            >
              <i className="bi bi-lightbulb"></i>
              更新要望
            </button>
          </div>

          {/* タブコンテンツ */}
          <div className="admin-tab-content">
            {/* ユーザー管理タブ */}
            {activeTab === 'users' && (
              <div className="tab-pane">
                <div className="tab-header">
                  <h3>ユーザー管理</h3>
                  <button
                    onClick={loadAdminUsers}
                    className="refresh-button"
                    title="ユーザー一覧を更新"
                  >
                    <i className="bi bi-arrow-clockwise"></i>
                  </button>
                </div>

                {/* 統計カード */}
                <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <span className="stat-number">{adminUsers.length}</span>
                <span className="stat-label">総ユーザー数</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👑</div>
              <div className="stat-content">
                <span className="stat-number">
                  {adminUsers.filter(user => user.role === 'admin').length}
                </span>
                <span className="stat-label">管理者</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🛡️</div>
              <div className="stat-content">
                <span className="stat-number">
                  {adminUsers.filter(user => user.role === 'moderator').length}
                </span>
                <span className="stat-label">モデレーター</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👤</div>
              <div className="stat-content">
                <span className="stat-number">
                  {adminUsers.filter(user => user.role === 'user').length}
                </span>
                <span className="stat-label">一般ユーザー</span>
              </div>
            </div>
          </div>

          {/* 検索・フィルター */}
          <div className="admin-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="ユーザー名、メールアドレス、ロールで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="sort-controls">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="sort-select"
                aria-label="並び替え項目を選択"
              >
                <option value="createdAt">登録日時</option>
                <option value="name">ユーザー名</option>
                <option value="email">メールアドレス</option>
                <option value="role">ロール</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="sort-order-button"
                title={`${sortOrder === 'asc' ? '降順' : '昇順'}で並び替え`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* ユーザー一覧 */}
          {adminUsersLoading ? (
            <div className="data-loading">
              <div className="spinner"></div>
              <p>ユーザー一覧を読み込み中...</p>
            </div>
          ) : (
            <div className="users-list">
              {filteredUsers.length === 0 ? (
                <div className="no-data-message">
                  <p>📝 ユーザーが見つかりません</p>
                  <p>検索条件を変更してみてください</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="user-item">
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.email?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="user-details">
                        <h3 className="user-name">{user.displayName || '名前なし'}</h3>
                        <p className="user-email">{user.email}</p>
                        <p className="user-created">
                          登録日: {formatDateTime(user.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="user-role">
                      <span 
                        className="role-badge"
                        style={{ backgroundColor: getRoleColor(user.role || 'user') }}
                      >
                        {getRoleDisplayName(user.role || 'user')}
                      </span>
                    </div>
                    <div className="user-actions">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="edit-button"
                        title="編集"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email || 'ユーザー')}
                        className="delete-button"
                        title="削除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ユーザー編集フォーム */}
          {showUserForm && editingUser && (
            <div className="user-edit-modal">
              <div className="modal-overlay" onClick={handleFormCancel}></div>
              <div className="modal-content">
                <div className="modal-header">
                  <h3>ユーザー編集</h3>
                  <button
                    onClick={handleFormCancel}
                    className="close-modal-button"
                    title="閉じる"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleFormSubmit} className="user-edit-form">
                  <div className="form-group">
                    <label htmlFor="userName">ユーザー名</label>
                    <input
                      type="text"
                      id="userName"
                      value={editingUserData.email || ''}
                      onChange={(e) => setEditingUserData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="userEmail">メールアドレス</label>
                    <input
                      type="email"
                      id="userEmail"
                      value={editingUserData.email || ''}
                      onChange={(e) => setEditingUserData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="userRole">ロール</label>
                    <select
                      id="userRole"
                      value={editingUserData.role || 'user'}
                      onChange={(e) => setEditingUserData(prev => ({ ...prev, role: e.target.value }))}
                      className="form-select"
                    >
                      <option value="user">ユーザー</option>
                      <option value="moderator">モデレーター</option>
                      <option value="admin">管理者</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="save-button">
                      保存
                    </button>
                    <button
                      type="button"
                      onClick={handleFormCancel}
                      className="cancel-button"
                    >
                      キャンセル
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
              </div>
            )}

            {/* ソースコードタブ */}
            {activeTab === 'sourcecode' && (
              <div className="tab-pane">
                <div className="tab-header">
                  <h3>ソースコード一覧</h3>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="back-button"
                    title="ユーザー管理に戻る"
                  >
                    <i className="bi bi-arrow-left"></i>
                  </button>
                </div>
                <div className="source-code-content">
                  <SourceCodeViewer
                    isOpen={true}
                    onClose={() => setActiveTab('users')}
                  />
                </div>
              </div>
            )}

            {/* 不具合報告タブ */}
            {activeTab === 'errorreports' && (
              <div className="tab-pane">
                <div className="tab-header">
                  <h3>不具合報告一覧</h3>
                  <div className="tab-actions">
                    <button
                      onClick={loadErrorReports}
                      className="refresh-button"
                      title="不具合報告を更新"
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                    </button>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="back-button"
                      title="ユーザー管理に戻る"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </button>
                  </div>
                </div>
                <div className="error-reports-content">

              {errorReportsLoading ? (
                <div className="loading-message">
                  <i className="bi bi-hourglass-split"></i>
                  不具合報告を読み込み中...
                </div>
              ) : errorReportsError ? (
                <div className="error-message">
                  <i className="bi bi-exclamation-triangle"></i>
                  {errorReportsError}
                  <button
                    onClick={loadErrorReports}
                    className="retry-button"
                    title="再試行"
                  >
                    <i className="bi bi-arrow-clockwise"></i>
                    再試行
                  </button>
                </div>
              ) : errorReports.length === 0 ? (
                <div className="no-data-message">
                  <i className="bi bi-info-circle"></i>
                  不具合報告はありません
                </div>
              ) : (
                <div className="error-reports-list">
                  {errorReports.map((report) => (
                    <div key={report.id} className="error-report-item">
                      <div className="error-report-header">
                        <h4 className="error-report-title">
                          {report.title}
                        </h4>
                        <div className="error-report-meta">
                          <span className="error-report-author">
                            <i className="bi bi-person"></i>
                            {report.author}
                          </span>
                          <span className="error-report-date">
                            <i className="bi bi-calendar"></i>
                            {formatDateTime(report.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="error-report-content">
                        <p>{report.content}</p>
                      </div>
                      {(report.replies || []).length > 0 && (
                        <div className="error-report-replies">
                          <h5>返信 ({(report.replies || []).length}件)</h5>
                          {(report.replies || []).map((reply: any) => (
                            <div key={reply.id} className="error-report-reply">
                              <div className="reply-header">
                                <span className="reply-author">{reply.author}</span>
                                <span className="reply-date">
                                  {formatDateTime(reply.createdAt)}
                                </span>
                              </div>
                              <p className="reply-content">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
                </div>
              </div>
            )}

            {/* 更新要望タブ */}
            {activeTab === 'updaterequests' && (
              <div className="tab-pane">
                <div className="tab-header">
                  <h3>更新要望一覧</h3>
                  <div className="tab-actions">
                    <button
                      onClick={loadUpdateRequests}
                      className="refresh-button"
                      title="更新要望を更新"
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                    </button>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="back-button"
                      title="ユーザー管理に戻る"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </button>
                  </div>
                </div>
                <div className="update-requests-content">
                  {updateRequestsLoading ? (
                    <div className="loading-message">
                      <i className="bi bi-hourglass-split"></i>
                      更新要望を読み込み中...
                    </div>
                  ) : updateRequestsError ? (
                    <div className="error-message">
                      <i className="bi bi-exclamation-triangle"></i>
                      {updateRequestsError}
                      <button
                        onClick={loadUpdateRequests}
                        className="retry-button"
                        title="再試行"
                      >
                        <i className="bi bi-arrow-clockwise"></i>
                        再試行
                      </button>
                    </div>
                  ) : updateRequests.length === 0 ? (
                    <div className="no-data-message">
                      <i className="bi bi-info-circle"></i>
                      更新要望はありません
                    </div>
                  ) : (
                    <div className="update-requests-list">
                      {updateRequests.map((request) => (
                        <div key={request.id} className="update-request-item">
                          <div className="update-request-header">
                            <h4 className="update-request-title">
                              {request.title || '無題'}
                            </h4>
                            <div className="update-request-meta">
                              <span className="update-request-author">
                                by {request.author || '匿名'}
                              </span>
                              <span className="update-request-date">
                                {new Date(request.createdAt).toLocaleString('ja-JP')}
                              </span>
                            </div>
                          </div>
                          <div className="update-request-content">
                            <p>{request.content}</p>
                          </div>
                          <div className="update-request-tags">
                            <span className="update-request-badge">
                              <i className="bi bi-lightbulb"></i>
                              更新要望
                            </span>
                            {request.category && (
                              <span className="category-badge">
                                {request.category}
                              </span>
                            )}
                          </div>
                          {request.replies && request.replies.length > 0 && (
                            <div className="update-request-replies">
                              <h5>返信 ({request.replies.length})</h5>
                              {request.replies.map((reply: any) => (
                                <div key={reply.id} className="reply-item">
                                  <div className="reply-header">
                                    <span className="reply-author">{reply.author}</span>
                                    <span className="reply-date">
                                      {new Date(reply.createdAt).toLocaleString('ja-JP')}
                                    </span>
                                  </div>
                                  <p className="reply-content">{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelComponent;
