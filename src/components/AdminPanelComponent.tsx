import React, { useState, useEffect } from 'react';
import './AdminPanelComponent.css';
import ResponseFormModal from './ResponseFormModal';
import ApiListComponent from './ApiListComponent';
import { getAuthToken } from '../utils/authUtils';

// タブの型定義
type AdminTab = 'users' | 'sourcecode' | 'errorreports' | 'updaterequests' | 'lintererrors' | 'testresults' | 'announcements' | 'apilist' | 'responses';

// ソースコードアイテムコンポーネント
interface SourceCodeItemProps {
  file: any;
  onFileSelect: (file: any) => void;
}

const SourceCodeItem: React.FC<SourceCodeItemProps> = ({ file, onFileSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getFileIcon = (file: any) => {
    if (file.type === 'directory') {
      return isExpanded ? 'bi-folder2-open' : 'bi-folder2';
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'tsx':
      case 'ts':
        return 'bi-filetype-tsx';
      case 'js':
      case 'jsx':
        return 'bi-filetype-jsx';
      case 'css':
        return 'bi-filetype-css';
      case 'json':
        return 'bi-filetype-json';
      case 'html':
        return 'bi-filetype-html';
      case 'md':
        return 'bi-filetype-md';
      default:
        return 'bi-file-earmark';
    }
  };

  const handleClick = () => {
    if (file.type === 'directory') {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(file);
    }
  };

  return (
    <div className="source-code-item">
      <div 
        className="source-code-header clickable"
        onClick={handleClick}
      >
        <div className="source-code-info">
          <i className={`bi ${getFileIcon(file)}`}></i>
          <span className="source-code-name">{file.name}</span>
        </div>
        <div className="source-code-meta">
          <span className="source-code-path">{file.path}</span>
          {file.type === 'directory' && (
            <span className="expand-icon">
              <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'}`}></i>
            </span>
          )}
        </div>
      </div>
      
      {isExpanded && file.children && (
        <div className="source-code-children">
          {file.children.map((child: any, index: number) => (
            <SourceCodeItem 
              key={index} 
              file={child} 
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 不具合報告アイテムコンポーネント
interface ErrorReportItemProps {
  report: any;
  formatDateTime: (date: string) => string;
  onSelectMemo: (report: any) => void;
}

const ErrorReportItem: React.FC<ErrorReportItemProps> = ({ report, formatDateTime, onSelectMemo }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="error-report-item">
      <div 
        className="error-report-header clickable"
        onClick={() => setIsExpanded(!isExpanded)}
      >
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
          <span className="expand-icon">
            <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'}`}></i>
          </span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="error-report-details">
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
          <div className="error-report-actions">
            <button
              className="response-button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectMemo(report);
              }}
              title="対応を送信"
            >
              <i className="bi bi-reply"></i>
              対応を送信
            </button>
            {report.status && (
              <span className={`status-badge status-${report.status}`}>
                {report.status === 'pending' && '未対応'}
                {report.status === 'in_progress' && '対応中'}
                {report.status === 'resolved' && '解決済み'}
                {report.status === 'closed' && 'クローズ'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
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
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [errorReports, setErrorReports] = useState<any[]>([]);
  const [errorReportsLoading, setErrorReportsLoading] = useState(false);
  const [errorReportsError, setErrorReportsError] = useState<string | null>(null);
  const [apiErrorCount, setApiErrorCount] = useState(0);
  const [updateRequests, setUpdateRequests] = useState<any[]>([]);
  const [updateRequestsLoading, setUpdateRequestsLoading] = useState(false);
  const [updateRequestsError, setUpdateRequestsError] = useState<string | null>(null);
  const [selectedMemo, setSelectedMemo] = useState<any>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [linterErrors, setLinterErrors] = useState<any[]>([]);
  const [linterErrorsLoading, setLinterErrorsLoading] = useState(false);
  const [linterErrorsError, setLinterErrorsError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [testResultsLoading, setTestResultsLoading] = useState(false);
  const [testResultsError, setTestResultsError] = useState<string | null>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState<'all' | 'active'>('all');
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  // プロジェクト構造の定義
  const projectStructure = [
    {
      name: 'src',
      type: 'directory',
      path: 'src',
      children: [
        {
          name: 'components',
          type: 'directory',
          path: 'src/components',
          children: [
            { name: 'App.tsx', type: 'file', path: 'src/App.tsx' },
            { name: 'AdminPanelComponent.tsx', type: 'file', path: 'src/components/AdminPanelComponent.tsx' },
            { name: 'HeaderComponent.tsx', type: 'file', path: 'src/components/HeaderComponent.tsx' },
            { name: 'MemosComponent.tsx', type: 'file', path: 'src/components/MemosComponent.tsx' },
            { name: 'PublicMemosComponent.tsx', type: 'file', path: 'src/components/PublicMemosComponent.tsx' },
            { name: 'WorkRecordsComponent.tsx', type: 'file', path: 'src/components/WorkRecordsComponent.tsx' },
            { name: 'ReportsComponent.tsx', type: 'file', path: 'src/components/ReportsComponent.tsx' },
            { name: 'LoginComponent.tsx', type: 'file', path: 'src/components/LoginComponent.tsx' },
            { name: 'ShareButtonComponent.tsx', type: 'file', path: 'src/components/ShareButtonComponent.tsx' },
            { name: 'ErrorReportingModal.tsx', type: 'file', path: 'src/components/ErrorReportingModal.tsx' },
            { name: 'UserGreetingComponent.tsx', type: 'file', path: 'src/components/UserGreetingComponent.tsx' },
            { name: 'VersionInfo.tsx', type: 'file', path: 'src/components/VersionInfo.tsx' },
            { name: 'UserInfoComponent.tsx', type: 'file', path: 'src/components/UserInfoComponent.tsx' },
            { name: 'SelfEncyclopediaComponent.tsx', type: 'file', path: 'src/components/SelfEncyclopediaComponent.tsx' },
            { name: 'PrivacyPolicyComponent.tsx', type: 'file', path: 'src/components/PrivacyPolicyComponent.tsx' },
            { name: 'TermsOfServiceComponent.tsx', type: 'file', path: 'src/components/TermsOfServiceComponent.tsx' },
          ]
        },
        {
          name: 'server',
          type: 'directory',
          path: 'src/server',
          children: [
            { name: 'database.ts', type: 'file', path: 'src/server/database.ts' },
            { name: 'models.ts', type: 'file', path: 'src/server/models.ts' },
            { name: 'auth.ts', type: 'file', path: 'src/server/auth.ts' },
            { name: 'validation.ts', type: 'file', path: 'src/server/validation.ts' },
            { name: 'types.ts', type: 'file', path: 'src/server/types.ts' },
            { name: 'utils.ts', type: 'file', path: 'src/server/utils.ts' },
          ]
        },
        {
          name: 'types',
          type: 'directory',
          path: 'src/types',
          children: [
            { name: 'index.ts', type: 'file', path: 'src/types/index.ts' },
          ]
        },
        {
          name: 'utils',
          type: 'directory',
          path: 'src/utils',
          children: [
            { name: 'dateUtils.ts', type: 'file', path: 'src/utils/dateUtils.ts' },
            { name: 'formatUtils.ts', type: 'file', path: 'src/utils/formatUtils.ts' },
          ]
        },
        {
          name: 'constants',
          type: 'directory',
          path: 'src/constants',
          children: [
            { name: 'cookingRecipes.ts', type: 'file', path: 'src/constants/cookingRecipes.ts' },
            { name: 'fonts.ts', type: 'file', path: 'src/constants/fonts.ts' },
            { name: 'themes.ts', type: 'file', path: 'src/constants/themes.ts' },
          ]
        },
        { name: 'App.tsx', type: 'file', path: 'src/App.tsx' },
        { name: 'App.css', type: 'file', path: 'src/App.css' },
        { name: 'main.tsx', type: 'file', path: 'src/main.tsx' },
        { name: 'types.ts', type: 'file', path: 'src/types.ts' },
      ]
    },
    {
      name: 'api',
      type: 'directory',
      path: 'api',
      children: [
        {
          name: 'auth',
          type: 'directory',
          path: 'api/auth',
          children: [
            { name: 'login.ts', type: 'file', path: 'api/auth/login.ts' },
            { name: 'register.ts', type: 'file', path: 'api/auth/register.ts' },
            { name: 'verify.ts', type: 'file', path: 'api/auth/verify.ts' },
          ]
        },
        {
          name: 'memos',
          type: 'directory',
          path: 'api/memos',
          children: [
            { name: 'index.ts', type: 'file', path: 'api/memos/index.ts' },
            { name: 'public.ts', type: 'file', path: 'api/memos/public.ts' },
            { name: '[id].ts', type: 'file', path: 'api/memos/[id].ts' },
            { name: 'reply.ts', type: 'file', path: 'api/memos/reply.ts' },
          ]
        },
        {
          name: 'work-records',
          type: 'directory',
          path: 'api/work-records',
          children: [
            { name: 'salary.ts', type: 'file', path: 'api/work-records/salary.ts' },
            { name: 'diary.ts', type: 'file', path: 'api/work-records/diary.ts' },
          ]
        },
        {
          name: 'admin',
          type: 'directory',
          path: 'api/admin',
          children: [
            { name: 'users.ts', type: 'file', path: 'api/admin/users.ts' },
            { name: 'user-edit.ts', type: 'file', path: 'api/admin/user-edit.ts' },
            { name: 'user-delete.ts', type: 'file', path: 'api/admin/user-delete.ts' },
          ]
        },
        {
          name: 'utils',
          type: 'directory',
          path: 'api/utils',
          children: [
            { name: 'database.ts', type: 'file', path: 'api/utils/database.ts' },
            { name: 'errorHandler.js', type: 'file', path: 'api/utils/errorHandler.js' },
            { name: 'schemas.ts', type: 'file', path: 'api/utils/schemas.ts' },
            { name: 'types.js', type: 'file', path: 'api/utils/types.js' },
            { name: 'validation.ts', type: 'file', path: 'api/utils/validation.ts' },
          ]
        },
        { name: 'user-settings.ts', type: 'file', path: 'api/user-settings.ts' },
        { name: 'version/check.ts', type: 'file', path: 'api/version/check.ts' },
      ]
    },
    { name: 'package.json', type: 'file', path: 'package.json' },
    { name: 'tsconfig.json', type: 'file', path: 'tsconfig.json' },
    { name: 'vite.config.ts', type: 'file', path: 'vite.config.ts' },
    { name: 'vercel.json', type: 'file', path: 'vercel.json' },
    { name: 'index.html', type: 'file', path: 'index.html' },
  ];
  
  // 各タブの件数を管理する状態
  const [tabCounts, setTabCounts] = useState({
    users: 0,
    errorReports: 0,
    updateRequests: 0,
    linterErrors: 0,
    testErrors: 0
  });

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

  // ユーザー数の更新
  useEffect(() => {
    setTabCounts(prev => ({ ...prev, users: adminUsers.length }));
  }, [adminUsers]);

  // API一覧のエラー件数を「apilist」タブがアクティブなときのみ定期的に取得
  useEffect(() => {
    if (activeTab === 'apilist') {
      loadApiErrorCount();
      const interval = setInterval(loadApiErrorCount, 30000); // 30秒ごとに更新
      return () => clearInterval(interval);
    }
  }, [activeTab]);

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
          const reports = data.errorReports || [];
          setErrorReports(reports);
          setTabCounts(prev => ({ ...prev, errorReports: reports.length }));
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
      
      // 管理者権限でアクセスするため、/api/memosを使用（adminOnly=trueで不具合報告・更新要望のみ取得）
      const response = await fetch('/api/memos?adminOnly=true', {
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
          setTabCounts(prev => ({ ...prev, updateRequests: updateRequestsData.length }));
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

  // リンターエラーを取得する関数
  const loadLinterErrors = async () => {
    setLinterErrorsLoading(true);
    setLinterErrorsError(null);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/admin/linter-errors', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('リンターエラーの取得に失敗しました');
      }

      const data = await response.json();
      const errors = data.errors || [];
      setLinterErrors(errors);
      setTabCounts(prev => ({ ...prev, linterErrors: errors.length }));
    } catch (error) {
      console.error('リンターエラー取得エラー:', error);
      setLinterErrorsError(error instanceof Error ? error.message : 'リンターエラーの取得に失敗しました');
    } finally {
      setLinterErrorsLoading(false);
    }
  };

  // テスト結果を取得する関数
  const loadTestResults = async () => {
    setTestResultsLoading(true);
    setTestResultsError(null);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/admin/test-results', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('テスト結果の取得に失敗しました');
      }

      const data = await response.json();
      setTestResults(data);
      setTabCounts(prev => ({ ...prev, testErrors: data.failed || 0 }));
    } catch (error) {
      console.error('テスト結果取得エラー:', error);
      setTestResultsError(error instanceof Error ? error.message : 'テスト結果の取得に失敗しました');
    } finally {
      setTestResultsLoading(false);
    }
  };

  // 通知送信機能
  const handleSendResponse = async (responseData: {
    memoId: string;
    response: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  }) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          memoId: responseData.memoId,
          response: responseData.response,
          status: responseData.status,
        }),
      });

      if (!response.ok) {
        throw new Error('通知の送信に失敗しました');
      }

      const result = await response.json();
      alert('通知を送信しました');
      
      // データを再読み込み
      if (activeTab === 'errorreports') {
        loadErrorReports();
      } else if (activeTab === 'updaterequests') {
        loadUpdateRequests();
      }
    } catch (error) {
      console.error('通知送信エラー:', error);
      throw error;
    }
  };

  const handleSelectMemo = (memo: any) => {
    console.log('handleSelectMemo called with memo:', memo);
    setSelectedMemo(memo);
    setShowResponseModal(true);
    console.log('Response modal should be shown now');
  };

  // API一覧のエラー件数を取得
  const loadApiErrorCount = async () => {
    try {
      const token = getAuthToken((message) => console.error(message));
      if (!token) return;
      
      const response = await fetch('/api/admin/api-list', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stats) {
          setApiErrorCount(data.stats.error || 0);
        }
      }
    } catch (error) {
      console.error('API一覧エラー件数取得エラー:', error);
    }
  };

  // お知らせ送信機能
  const handleSendAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      alert('タイトルとメッセージを入力してください。');
      return;
    }

    setSendingAnnouncement(true);
    
    try {
      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          title: announcementTitle.trim(),
          message: announcementMessage.trim(),
          targetUsers: announcementTarget
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(`お知らせを${data.notificationCount}人のユーザーに送信しました！`);
          setAnnouncementTitle('');
          setAnnouncementMessage('');
          setAnnouncementTarget('all');
          setShowAnnouncementModal(false);
        } else {
          alert('お知らせの送信に失敗しました。');
        }
      } else {
        alert('お知らせの送信に失敗しました。');
      }
    } catch (error) {
      console.error('お知らせ送信エラー:', error);
      alert('お知らせの送信に失敗しました。');
    } finally {
      setSendingAnnouncement(false);
    }
  };

  // ESCキーでモーダルを閉じる機能
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showResponseModal) {
        console.log('ESC key pressed, closing modal');
        setShowResponseModal(false);
        setSelectedMemo(null);
      }
    };

    if (showResponseModal) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showResponseModal]);

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
    if (!dateString) {
      return '日付不明';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '無効な日付';
    }
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
              <span className="tab-count">({tabCounts.users})</span>
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
              <span className="tab-count">({tabCounts.errorReports})</span>
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
              <span className="tab-count">({tabCounts.updateRequests})</span>
            </button>
            <button
              className={`admin-tab ${activeTab === 'lintererrors' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('lintererrors');
                if (linterErrors.length === 0) {
                  loadLinterErrors();
                }
              }}
            >
              <i className="bi bi-exclamation-triangle"></i>
              リンターエラー
              <span className="tab-count">({tabCounts.linterErrors})</span>
            </button>
            <button
              className={`admin-tab ${activeTab === 'testresults' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('testresults');
                if (!testResults) {
                  loadTestResults();
                }
              }}
            >
              <i className="bi bi-check-circle"></i>
              テスト結果
              <span className="tab-count">({tabCounts.testErrors})</span>
            </button>
            <button
              className={`admin-tab announcement-tab ${activeTab === 'announcements' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('announcements');
                setShowAnnouncementModal(true);
              }}
              title="お知らせを送信"
            >
              <i className="bi bi-bullhorn"></i>
              お知らせ送信
            </button>
            <button
              className={`admin-tab ${activeTab === 'apilist' ? 'active' : ''}`}
              onClick={() => setActiveTab('apilist')}
              title="API一覧・監視"
            >
              <i className="bi bi-list-ul"></i>
              API一覧
              {apiErrorCount > 0 && (
                <span className="error-count-badge">{apiErrorCount}</span>
              )}
            </button>
            <button
              className={`admin-tab ${activeTab === 'responses' ? 'active' : ''}`}
              onClick={() => setActiveTab('responses')}
              title="返信管理"
            >
              <i className="bi bi-reply"></i>
              返信管理
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
                  <div className="source-code-list">
                    {projectStructure.map((file, index) => (
                      <SourceCodeItem 
                        key={index} 
                        file={file} 
                        onFileSelect={(file) => {
                          console.log('Selected file:', file);
                          // ファイル選択時の処理（必要に応じて実装）
                        }}
                      />
                    ))}
                  </div>
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
                    <ErrorReportItem 
                      key={report.id} 
                      report={report} 
                      formatDateTime={formatDateTime}
                      onSelectMemo={handleSelectMemo}
                    />
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
                          <div className="update-request-actions">
                            <button
                              className="response-button"
                              onClick={() => handleSelectMemo(request)}
                              title="対応を送信"
                            >
                              <i className="bi bi-reply"></i>
                              対応を送信
                            </button>
                            {request.status && (
                              <span className={`status-badge status-${request.status}`}>
                                {request.status === 'pending' && '未対応'}
                                {request.status === 'in_progress' && '対応中'}
                                {request.status === 'resolved' && '解決済み'}
                                {request.status === 'closed' && 'クローズ'}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* リンターエラータブ */}
            {activeTab === 'lintererrors' && (
              <div className="tab-pane">
                <div className="tab-header">
                  <h3>リンターエラー一覧</h3>
                  <div className="tab-actions">
                    <button
                      onClick={loadLinterErrors}
                      className="refresh-button"
                      title="リンターエラーを更新"
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
                <div className="linter-errors-content">
                  {linterErrorsLoading ? (
                    <div className="loading-message">
                      <i className="bi bi-hourglass-split"></i>
                      リンターエラーを読み込み中...
                    </div>
                  ) : linterErrorsError ? (
                    <div className="error-message">
                      <i className="bi bi-exclamation-triangle"></i>
                      {linterErrorsError}
                      <button
                        onClick={loadLinterErrors}
                        className="retry-button"
                        title="再試行"
                      >
                        <i className="bi bi-arrow-clockwise"></i>
                        再試行
                      </button>
                    </div>
                  ) : linterErrors.length === 0 ? (
                    <div className="no-data-message">
                      <i className="bi bi-check-circle"></i>
                      リンターエラーはありません
                    </div>
                  ) : (
                    <div className="linter-errors-list">
                      {linterErrors.map((error, index) => (
                        <div key={index} className="linter-error-item">
                          <div className="linter-error-header">
                            <div className="linter-error-info">
                              <h4 className="linter-error-file">
                                <i className="bi bi-file-code"></i>
                                {error.file || 'Unknown file'}
                              </h4>
                              <span className="linter-error-line">
                                行 {error.line || 'N/A'}, 列 {error.column || 'N/A'}
                              </span>
                            </div>
                            <span className={`linter-error-severity severity-${error.severity || 'error'}`}>
                              {error.severity === 'warning' ? '警告' : 'エラー'}
                            </span>
                          </div>
                          <div className="linter-error-content">
                            <p className="linter-error-message">
                              {error.message || 'No message available'}
                            </p>
                            {error.rule && (
                              <span className="linter-error-rule">
                                ルール: {error.rule}
                              </span>
                            )}
                          </div>
                          {error.source && (
                            <div className="linter-error-source">
                              <pre>{error.source}</pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* テスト結果タブ */}
            {activeTab === 'testresults' && (
              <div className="tab-pane">
                <div className="tab-header">
                  <h3>ユニットテスト結果</h3>
                  <div className="tab-actions">
                    <button
                      onClick={loadTestResults}
                      className="refresh-button"
                      title="テスト結果を更新"
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
                <div className="test-results-content">
                  {testResultsLoading ? (
                    <div className="loading-message">
                      <i className="bi bi-hourglass-split"></i>
                      テスト結果を読み込み中...
                    </div>
                  ) : testResultsError ? (
                    <div className="error-message">
                      <i className="bi bi-exclamation-triangle"></i>
                      {testResultsError}
                      <button
                        onClick={loadTestResults}
                        className="retry-button"
                        title="再試行"
                      >
                        <i className="bi bi-arrow-clockwise"></i>
                        再試行
                      </button>
                    </div>
                  ) : !testResults ? (
                    <div className="no-data-message">
                      <i className="bi bi-info-circle"></i>
                      テスト結果を読み込んでください
                    </div>
                  ) : (
                    <div className="test-results-list">
                      {/* テスト結果サマリー */}
                      <div className="test-summary">
                        <div className="summary-stats">
                          <div className="stat-card passed">
                            <i className="bi bi-check-circle"></i>
                            <div className="stat-info">
                              <span className="stat-number">{testResults.passed || 0}</span>
                              <span className="stat-label">成功</span>
                            </div>
                          </div>
                          <div className="stat-card failed">
                            <i className="bi bi-x-circle"></i>
                            <div className="stat-info">
                              <span className="stat-number">{testResults.failed || 0}</span>
                              <span className="stat-label">失敗</span>
                            </div>
                          </div>
                          <div className="stat-card skipped">
                            <i className="bi bi-skip-forward"></i>
                            <div className="stat-info">
                              <span className="stat-number">{testResults.skipped || 0}</span>
                              <span className="stat-label">スキップ</span>
                            </div>
                          </div>
                          <div className="stat-card total">
                            <i className="bi bi-list-ol"></i>
                            <div className="stat-info">
                              <span className="stat-number">{testResults.total || 0}</span>
                              <span className="stat-label">合計</span>
                            </div>
                          </div>
                        </div>
                        <div className="test-coverage">
                          <div className="coverage-info">
                            <span className="coverage-label">カバレッジ</span>
                            <span className="coverage-percentage">{testResults.coverage || 0}%</span>
                          </div>
                          <div className="coverage-bar">
                            <div 
                              className="coverage-fill" 
                              style={{ width: `${testResults.coverage || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* テスト詳細 */}
                      {testResults.tests && testResults.tests.length > 0 && (
                        <div className="test-details">
                          <h4>テスト詳細</h4>
                          <div className="test-list">
                            {testResults.tests.map((test: any, index: number) => (
                              <div key={index} className={`test-item ${test.status}`}>
                                <div className="test-header">
                                  <div className="test-status">
                                    <i className={`bi ${
                                      test.status === 'passed' ? 'bi-check-circle' :
                                      test.status === 'failed' ? 'bi-x-circle' :
                                      'bi-skip-forward'
                                    }`}></i>
                                    <span className="status-text">
                                      {test.status === 'passed' ? '成功' :
                                       test.status === 'failed' ? '失敗' : 'スキップ'}
                                    </span>
                                  </div>
                                  <div className="test-duration">
                                    {test.duration}ms
                                  </div>
                                </div>
                                <div className="test-name">
                                  {test.name}
                                </div>
                                {test.error && (
                                  <div className="test-error">
                                    <pre>{test.error}</pre>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 実行時間 */}
                      <div className="test-timing">
                        <div className="timing-info">
                          <i className="bi bi-clock"></i>
                          <span>実行時間: {testResults.duration || 0}ms</span>
                        </div>
                        <div className="timing-info">
                          <i className="bi bi-calendar"></i>
                          <span>実行日時: {testResults.timestamp ? new Date(testResults.timestamp).toLocaleString('ja-JP') : '不明'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* お知らせ送信タブ */}
            {activeTab === 'announcements' && (
              <div className="tab-pane">
                <div className="tab-header">
                  <h3>お知らせ送信</h3>
                  <div className="tab-actions">
                    <button
                      onClick={() => setShowAnnouncementModal(true)}
                      className="primary-button"
                      title="新しいお知らせを作成"
                    >
                      <i className="bi bi-plus-circle"></i>
                      新しいお知らせ
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
                <div className="announcement-content">
                  <div className="announcement-info">
                    <div className="info-card">
                      <div className="info-icon">
                        <i className="bi bi-bullhorn"></i>
                      </div>
                      <div className="info-content">
                        <h4>お知らせ機能について</h4>
                        <p>管理者からユーザーに重要な情報を通知できます。</p>
                        <ul>
                          <li>全ユーザーまたはアクティブユーザーに送信可能</li>
                          <li>通知はリアルタイムで配信されます</li>
                          <li>ユーザーは通知センターで確認できます</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="announcement-actions">
                    <button
                      onClick={() => setShowAnnouncementModal(true)}
                      className="announcement-create-button"
                    >
                      <i className="bi bi-bullhorn"></i>
                      お知らせを作成
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* API一覧タブ */}
            {activeTab === 'apilist' && (
              <div className="tab-pane">
                <ApiListComponent />
              </div>
            )}

            {/* 返信管理タブ */}
            {activeTab === 'responses' && (
              <div className="tab-pane">
                <div className="tab-header">
                  <h3>
                    <i className="bi bi-reply"></i>
                    返信管理
                  </h3>
                  <div className="response-counts">
                    <span className="count-item">
                      <i className="bi bi-bug"></i>
                      不具合報告: {errorReports?.filter((report: any) => report.postType === 'error_report').length || 0}件
                    </span>
                    <span className="count-item">
                      <i className="bi bi-lightbulb"></i>
                      更新要望: {updateRequests?.filter((request: any) => request.postType === 'update_request').length || 0}件
                    </span>
                  </div>
                  <button
                    className="toggle-response-button"
                    onClick={() => setShowResponseModal(!showResponseModal)}
                    title={showResponseModal ? '返信フォームを閉じる' : '返信フォームを開く'}
                  >
                    <i className={`bi ${showResponseModal ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                    {showResponseModal ? '閉じる' : '開く'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 返信フォームモーダル */}
      <ResponseFormModal
        isOpen={showResponseModal}
        onClose={() => {
          setShowResponseModal(false);
          setSelectedMemo(null);
        }}
        memo={selectedMemo}
        onSubmit={handleSendResponse}
        loading={false}
      />


      {/* お知らせ送信モーダル */}
      {showAnnouncementModal && (
        <div className="announcement-modal-overlay">
          <div className="announcement-modal">
            <div className="announcement-modal-header">
              <h3>
                <i className="bi bi-megaphone"></i>
                お知らせ送信
              </h3>
              <button
                onClick={() => {
                  setShowAnnouncementModal(false);
                  setAnnouncementTitle('');
                  setAnnouncementMessage('');
                  setAnnouncementTarget('all');
                }}
                className="close-announcement-button"
                title="閉じる"
              >
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className="announcement-modal-body">
              <div className="form-group">
                <label htmlFor="announcementTitle">タイトル</label>
                <input
                  id="announcementTitle"
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="お知らせのタイトルを入力"
                  className="form-control"
                  disabled={sendingAnnouncement}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="announcementTarget">送信先</label>
                <select
                  id="announcementTarget"
                  value={announcementTarget}
                  onChange={(e) => setAnnouncementTarget(e.target.value as 'all' | 'active')}
                  className="form-control"
                  disabled={sendingAnnouncement}
                >
                  <option value="all">全ユーザー</option>
                  <option value="active">アクティブユーザー（過去30日以内）</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="announcementMessage">メッセージ</label>
                <textarea
                  id="announcementMessage"
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  placeholder="お知らせの内容を入力"
                  className="form-control"
                  rows={6}
                  disabled={sendingAnnouncement}
                  required
                />
              </div>
            </div>

            <div className="announcement-modal-footer">
              <button
                onClick={() => {
                  setShowAnnouncementModal(false);
                  setAnnouncementTitle('');
                  setAnnouncementMessage('');
                  setAnnouncementTarget('all');
                }}
                className="btn btn-secondary"
                disabled={sendingAnnouncement}
              >
                キャンセル
              </button>
              <button
                onClick={handleSendAnnouncement}
                className="btn btn-primary"
                disabled={sendingAnnouncement || !announcementTitle.trim() || !announcementMessage.trim()}
              >
                {sendingAnnouncement ? (
                  <>
                    <i className="bi bi-hourglass-split"></i>
                    送信中...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send"></i>
                    お知らせを送信
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelComponent;
