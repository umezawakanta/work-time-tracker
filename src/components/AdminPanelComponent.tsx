import React, { useState, useEffect } from 'react';
import './AdminPanelComponent.css';
import type { AdminUser } from '../types';

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
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // ユーザー編集フォームの初期化
  useEffect(() => {
    if (editingUser) {
      setEditingUserData({
        name: editingUser.name || '',
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
  const filteredUsers = adminUsers
    .filter(user => 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // フォーム送信処理
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser && editingUserData.name && editingUserData.email) {
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
    const date = new Date(dateString);
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
          <div className="admin-panel-header">
            <button
              onClick={loadAdminUsers}
              className="refresh-button"
              title="ユーザー一覧を更新"
            >
              🔄
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
                        {user.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="user-details">
                        <h3 className="user-name">{user.name || '名前なし'}</h3>
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
                        onClick={() => handleDeleteUser(user.id, user.name || 'ユーザー')}
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
                      value={editingUserData.name || ''}
                      onChange={(e) => setEditingUserData(prev => ({ ...prev, name: e.target.value }))}
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
    </div>
  );
};

export default AdminPanelComponent;
