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

// アプリケーションのページ・機能リスト
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
    id: 'time-tracker',
    title: '勤怠管理',
    description: '時間追跡 勤務時間 タイムトラッカー work time tracker',
    type: 'page',
    path: '/time-tracker',
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: 'analytics',
    title: '分析',
    description: 'データ分析とレポート 統計 パフォーマンス analysis',
    type: 'page',
    path: '/analytics',
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
    id: 'books',
    title: '読書記録',
    description: '本の管理 読書 書籍 読んだ本 book',
    type: 'page',
    path: '/books',
    icon: <Book className="h-4 w-4" />,
  },
  {
    id: 'goals',
    title: '目標管理',
    description: '目標設定と追跡 ゴール target goal',
    type: 'page',
    path: '/goals',
    icon: <Target className="h-4 w-4" />,
  },
  {
    id: 'achievements',
    title: '成果管理',
    description: 'バッジと成果 実績 achievement trophy',
    type: 'page',
    path: '/achievements',
    icon: <Trophy className="h-4 w-4" />,
  },
  {
    id: 'settings',
    title: '設定',
    description: 'アプリケーション設定 環境設定 config',
    type: 'page',
    path: '/settings',
    icon: <Settings className="h-4 w-4" />,
  },
  // ゲーミフィケーション・エンターテイメント関連
  {
    id: 'gamification',
    title: 'ゲーミフィケーション',
    description: 'ゲーム要素 ポイント レベル 達成感 ゲーム',
    type: 'page',
    path: '/achievements',
    icon: <Trophy className="h-4 w-4" />,
  },
  {
    id: 'pomodoro',
    title: 'ポモドーロタイマー',
    description: '集中タイマー 作業効率 タイマー ポモドーロ',
    type: 'page',
    path: '/pomodoro',
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: 'habits',
    title: '習慣トラッカー',
    description: '習慣管理 日課 ルーチン habit tracker',
    type: 'page',
    path: '/habits',
    icon: <CheckSquare className="h-4 w-4" />,
  },
  {
    id: 'mood-tracker',
    title: '気分トラッカー',
    description: '気分記録 感情管理 メンタルヘルス mood',
    type: 'page',
    path: '/mood',
    icon: <Lightbulb className="h-4 w-4" />,
  },
  {
    id: 'projects',
    title: 'プロジェクト管理',
    description: 'プロジェクト 企画 計画 管理 project',
    type: 'page',
    path: '/projects',
    icon: <Folder className="h-4 w-4" />,
  },
  {
    id: 'notes',
    title: 'ノート',
    description: 'メモ ノート 記録 note 文書',
    type: 'page',
    path: '/notes',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: 'finance',
    title: '家計管理',
    description: '家計簿 支出 収入 お金 finance money',
    type: 'page',
    path: '/finance',
    icon: <BarChart2 className="h-4 w-4" />,
  },
  {
    id: 'health',
    title: '健康管理',
    description: '健康 体重 運動 フィットネス health fitness',
    type: 'page',
    path: '/health',
    icon: <Award className="h-4 w-4" />,
  },
  // エンターテイメント・レクリエーション
  {
    id: 'entertainment',
    title: 'エンターテイメント',
    description: '娯楽 遊び ゲーム 映画 音楽 entertainment',
    type: 'page',
    path: '/entertainment',
    icon: <Trophy className="h-4 w-4" />,
  },
  {
    id: 'games',
    title: 'ゲーム管理',
    description: 'ゲーム プレイ記録 gaming game play',
    type: 'page',
    path: '/games',
    icon: <Trophy className="h-4 w-4" />,
  },
  {
    id: 'media',
    title: 'メディア管理',
    description: '映画 音楽 動画 コンテンツ media',
    type: 'page',
    path: '/media',
    icon: <FileText className="h-4 w-4" />,
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
