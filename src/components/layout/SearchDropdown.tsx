import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Calendar,
  Book,
  Target,
  Settings,
  Home,
  BarChart2,
  Trophy,
  Lightbulb,
  CheckSquare,
  FileText,
  Folder,
  Award,
  Globe,
  User,
} from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  description?: string;
  type: 'todo' | 'project' | 'page' | 'book' | 'knowledge' | 'badge';
  path?: string;
  icon?: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
  completed?: boolean;
  tags?: string[];
}

interface SearchDropdownProps {
  searchQuery: string;
  isOpen: boolean;
  onClose: () => void;
  onItemSelect: (item: SearchItem) => void;
}

// アプリケーションのページ・機能リスト（実際に存在するルートのみ）
const appPages: SearchItem[] = [
  {
    id: 'home',
    title: 'ホーム',
    description: 'メインダッシュボード 統合プラットフォーム',
    type: 'page',
    path: '/',
    icon: <Home className="h-4 w-4" />,
  },
  {
    id: 'todos',
    title: 'ToDoリスト',
    description: 'タスク管理 やることリスト 作業 todo',
    type: 'page',
    path: '/todos',
    icon: <CheckSquare className="h-4 w-4" />,
  },
  {
    id: 'work-time',
    title: '勤怠管理',
    description: '時間追跡 勤務時間 タイムトラッカー work time tracker',
    type: 'page',
    path: '/work-time',
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: 'work-time-reports',
    title: '勤怠レポート',
    description: '勤務時間レポート 統計 分析 reports',
    type: 'page',
    path: '/work-time-reports',
    icon: <BarChart2 className="h-4 w-4" />,
  },
  {
    id: 'work-time-punch',
    title: 'リアルタイム打刻',
    description: 'GPS位置情報による正確な勤怠打刻 出勤 退勤 rest break punch',
    type: 'page',
    path: '/work-time-punch',
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: 'work-time-approval',
    title: '勤怠承認管理',
    description: '従業員の勤怠記録承認 管理者専用 approval admin',
    type: 'page',
    path: '/work-time-approval',
    icon: <CheckSquare className="h-4 w-4" />,
  },
  {
    id: 'work-time-dashboard',
    title: 'リアルタイム勤務監視',
    description: '全従業員の勤務状況リアルタイム監視 dashboard live',
    type: 'page',
    path: '/work-time-dashboard',
    icon: <BarChart2 className="h-4 w-4" />,
  },
  {
    id: 'calendar',
    title: 'カレンダー',
    description: 'スケジュール管理 予定 日程 calendar',
    type: 'page',
    path: '/calendar',
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    id: 'bookshelf',
    title: '読書記録',
    description: '本の管理 読書 書籍 読んだ本 book bookshelf',
    type: 'page',
    path: '/bookshelf',
    icon: <Book className="h-4 w-4" />,
  },
  {
    id: 'blog',
    title: 'ブログ',
    description: 'ブログ記事 投稿 日記 blog',
    type: 'page',
    path: '/blog',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: 'diary',
    title: '日記',
    description: '日記 記録 メモ diary',
    type: 'page',
    path: '/diary',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: 'wbs',
    title: 'WBS作成',
    description: 'プロジェクト計画 WBS 作業分解構造 project',
    type: 'page',
    path: '/wbs',
    icon: <Folder className="h-4 w-4" />,
  },
  {
    id: 'gamification',
    title: 'ゲーミフィケーション',
    description: 'ゲーム要素 ポイント レベル 達成感 ゲーム gamification',
    type: 'page',
    path: '/gamification',
    icon: <Trophy className="h-4 w-4" />,
  },
  {
    id: 'integrated-dashboard',
    title: '統合ダッシュボード',
    description: '統合ダッシュボード 総合管理 dashboard',
    type: 'page',
    path: '/integrated-dashboard',
    icon: <Home className="h-4 w-4" />,
  },
  {
    id: 'super-dashboard',
    title: '究極ダッシュボード',
    description: '究極統合ダッシュボード 次世代プラットフォーム super',
    type: 'page',
    path: '/super-dashboard',
    icon: <Home className="h-4 w-4" />,
  },
  {
    id: 'profile',
    title: 'プロフィール',
    description: 'ユーザープロフィール 設定 profile',
    type: 'page',
    path: '/profile',
    icon: <User className="h-4 w-4" />,
  },
  {
    id: 'sleep-tracker',
    title: '睡眠トラッカー',
    description: '睡眠記録 睡眠管理 sleep tracker',
    type: 'page',
    path: '/sleep-tracker',
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: 'guitar-practice',
    title: 'ギター練習',
    description: 'ギター練習記録 音楽 guitar practice',
    type: 'page',
    path: '/guitar-practice',
    icon: <Trophy className="h-4 w-4" />,
  },
  {
    id: 'impulse-tracker',
    title: '衝動トラッカー',
    description: '衝動管理 自制心 impulse control',
    type: 'page',
    path: '/impulse-tracker',
    icon: <Target className="h-4 w-4" />,
  },
  {
    id: 'asset-calendar',
    title: '資産カレンダー',
    description: '資産管理 カレンダー asset calendar',
    type: 'page',
    path: '/asset-calendar',
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    id: 'twitter',
    title: 'Twitter',
    description: 'Twitter連携 SNS twitter',
    type: 'page',
    path: '/twitter',
    icon: <Globe className="h-4 w-4" />,
  },
  {
    id: 'development-badges',
    title: '開発バッジ',
    description: '開発バッジ 実績 badge development',
    type: 'page',
    path: '/development-badges',
    icon: <Award className="h-4 w-4" />,
  },
  {
    id: 'adhd-support',
    title: 'ADHD支援',
    description: 'ADHD支援 集中力 サポート adhd',
    type: 'page',
    path: '/adhd-support',
    icon: <Lightbulb className="h-4 w-4" />,
  },
  {
    id: 'automation-rules',
    title: '自動化ルール',
    description: '自動化ルール ワークフロー automation',
    type: 'page',
    path: '/automation-rules',
    icon: <Settings className="h-4 w-4" />,
  },
];

const getTypeIcon = (type: SearchItem['type']) => {
  switch (type) {
    case 'todo':
      return <CheckSquare className="h-4 w-4" />;
    case 'project':
      return <Folder className="h-4 w-4" />;
    case 'page':
      return <Globe className="h-4 w-4" />;
    case 'book':
      return <Book className="h-4 w-4" />;
    case 'knowledge':
      return <Lightbulb className="h-4 w-4" />;
    case 'badge':
      return <Award className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getTypeLabel = (type: SearchItem['type']) => {
  switch (type) {
    case 'todo':
      return 'タスク';
    case 'project':
      return 'プロジェクト';
    case 'page':
      return 'ページ';
    case 'book':
      return '本';
    case 'knowledge':
      return '知識';
    case 'badge':
      return 'バッジ';
    default:
      return 'その他';
  }
};

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  searchQuery,
  isOpen,
  onClose,
  onItemSelect,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !searchQuery.trim()) {
    return null;
  }

  // 検索処理
  const searchTerm = searchQuery.toLowerCase();
  const results = appPages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchTerm) ||
      page.description?.toLowerCase().includes(searchTerm)
  );

  const handleItemSelect = (item: SearchItem) => {
    onItemSelect(item);
    if (item.path) {
      navigate(item.path);
    }
    onClose();
  };

  const groupedResults = results.reduce(
    (groups, item) => {
      const type = item.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(item);
      return groups;
    },
    {} as Record<string, SearchItem[]>
  );

  return (
    <>
      {/* オーバーレイ */}
      <div className="fixed inset-0 z-40" onClick={onClose} style={{ background: 'transparent' }} />

      {/* 検索結果ドロップダウン */}
      <div
        className="absolute top-full left-0 w-full z-50 mt-2"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxHeight: '400px',
          overflow: 'auto',
        }}
      >
        {results.length === 0 ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '14px',
            }}
          >
            検索結果が見つかりませんでした
          </div>
        ) : (
          <div style={{ padding: '8px 0' }}>
            {Object.entries(groupedResults).map(([type, items], index) => (
              <div key={type}>
                {index > 0 && (
                  <div
                    style={{
                      height: '1px',
                      backgroundColor: '#e2e8f0',
                      margin: '8px 0',
                    }}
                  />
                )}
                <div
                  style={{
                    padding: '8px 12px 4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {getTypeIcon(type as SearchItem['type'])}{' '}
                  {getTypeLabel(type as SearchItem['type'])}
                </div>
                <div>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemSelect(item)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 12px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        borderRadius: '8px',
                        margin: '0 4px',
                        color: '#1e293b',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '8px',
                          flexShrink: 0,
                        }}
                      >
                        {item.icon || getTypeIcon(item.type)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: '500',
                            color: '#1e293b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.title}
                        </div>
                        {item.description && (
                          <div
                            style={{
                              fontSize: '14px',
                              color: '#64748b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.description}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
