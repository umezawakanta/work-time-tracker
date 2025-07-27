import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import {
  Home,
  Search,
  Bell,
  Settings,
  Menu,
  X,
  User,
  Plus,
  Calendar,
  Brain,
  Target,
  Clock,
  BarChart3,
  FileText,
  Activity,
  Shield,
  AlertTriangle,
  BarChart2,
  Bed,
  Zap,
  Music,
  Lightbulb,
  TestTube,
  DollarSign,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  BookOpen,
  PenTool,
  Clipboard,
  FolderKanban,
  MapPin,
  Layers,
} from 'lucide-react';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  description?: string;
  badge?: string;
  gradient?: string;
  accentColor?: string;
}

interface MenuSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: MenuItem[];
  defaultExpanded?: boolean;
}

interface LayoutProps {
  children: React.ReactNode;
}

// コアメニューアイテム - App.tsxで実際にアクティブなルートのみ
const getCoreMenuItems = (t: (key: string) => string): MenuItem[] => [
  {
    icon: <Home className="h-5 w-5" />,
    label: '🏠 統合ダッシュボード',
    path: '/integrated-dashboard',
    description: 'メインダッシュボード画面',
    badge: 'ホーム',
    gradient: 'from-blue-400 via-purple-500 to-pink-500',
    accentColor: 'blue',
  },
  {
    icon: <Target className="h-5 w-5" />,
    label: '🎯 ADHDタスク管理',
    path: '/adhd-task-manager',
    description: 'インテリジェント実行機能サポート',
    badge: 'コア',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    accentColor: 'indigo',
  },
  {
    icon: <Brain className="h-5 w-5" />,
    label: '🧠 ADHD統合ライフ',
    path: '/adhd-integrated-life',
    description: 'ADHD/ASD特化型生活支援システム',
    badge: 'コア',
    gradient: 'from-purple-500 via-indigo-500 to-blue-500',
    accentColor: 'purple',
  },
];

// ADHD/ASD特化機能メニューアイテム
const adhdSpecializedMenuItems: MenuItem[] = [
  {
    icon: <TestTube className="h-5 w-5" />,
    label: '🧪 認知機能評価',
    path: '/adhd-cognitive-assessment',
    description: 'WEIS準拠の科学的認知機能測定',
    badge: '科学的',
    gradient: 'from-violet-500 via-purple-500 to-indigo-500',
    accentColor: 'violet',
  },
  {
    icon: <Brain className="h-5 w-5" />,
    label: '📅 統合ライフページ',
    path: '/adhd-integrated-life-page',
    description: 'ADHD/ASD総合ライフ管理',
    badge: '重要',
    gradient: 'from-blue-500 via-teal-500 to-green-500',
    accentColor: 'blue',
  },
  {
    icon: <DollarSign className="h-5 w-5" />,
    label: '💰 認知最適化財務管理',
    path: '/cognitive-finance',
    description: 'ADHD/ASD特性に配慮した資産管理',
    badge: '財務',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    accentColor: 'green',
  },
];

// カレンダー・タスク管理メニューアイテム
const calendarTaskMenuItems: MenuItem[] = [
  {
    icon: <Calendar className="h-5 w-5" />,
    label: '📅 カレンダー',
    path: '/calendar',
    description: 'スケジュール管理とイベント計画',
    badge: 'スケジュール',
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    accentColor: 'blue',
  },
  {
    icon: <Clipboard className="h-5 w-5" />,
    label: '📋 タスク管理',
    path: '/task-management',
    description: 'プロジェクトとタスクの総合管理',
    badge: 'タスク',
    gradient: 'from-green-500 via-teal-500 to-blue-500',
    accentColor: 'green',
  },
  {
    icon: <PenTool className="h-5 w-5" />,
    label: '📖 日記',
    path: '/diary',
    description: '日々の記録と振り返り',
    badge: '記録',
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    accentColor: 'pink',
  },
];

// 勤怠管理メニューアイテム
const workTimeMenuItems: MenuItem[] = [
  {
    icon: <Clock className="h-5 w-5" />,
    label: '⏰ リアルタイム勤怠',
    path: '/realtime-clock',
    description: 'リアルタイム勤怠打刻システム',
    badge: '勤怠',
    gradient: 'from-green-500 via-teal-500 to-blue-500',
    accentColor: 'green',
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    label: '📊 日次勤務可視化',
    path: '/daily-work-visualization',
    description: '日次勤務状況の詳細分析',
    badge: '分析',
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    accentColor: 'blue',
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    label: '📅 月次勤怠集計',
    path: '/monthly-timesheet',
    description: '月次勤怠データの集計と管理',
    badge: '集計',
    gradient: 'from-indigo-500 via-blue-500 to-cyan-500',
    accentColor: 'indigo',
  },
  {
    icon: <Settings className="h-5 w-5" />,
    label: '⚙️ 勤務パターン設定',
    path: '/work-pattern-settings',
    description: '個人の勤務パターン設定',
    badge: '設定',
    gradient: 'from-gray-500 via-slate-500 to-zinc-500',
    accentColor: 'gray',
  },
  {
    icon: <Bell className="h-5 w-5" />,
    label: '🔔 通知設定',
    path: '/notification-settings',
    description: 'アラート・通知の詳細設定',
    badge: '通知',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    accentColor: 'orange',
  },
  {
    icon: <CheckCircle className="h-5 w-5" />,
    label: '✅ 承認ワークフロー',
    path: '/approval-workflow',
    description: '勤怠承認・申請管理',
    badge: '承認',
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    accentColor: 'emerald',
  },
];

// ブログ・コンテンツメニューアイテム
const blogMenuItems: MenuItem[] = [
  {
    icon: <FileText className="h-5 w-5" />,
    label: '📝 ブログ',
    path: '/blog',
    description: 'ブログ記事の管理と閲覧',
    badge: 'コンテンツ',
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    accentColor: 'pink',
  },
  {
    icon: <Plus className="h-5 w-5" />,
    label: '✏️ 新規ブログ投稿',
    path: '/blog/new',
    description: '新しいブログ記事を作成',
    badge: '作成',
    gradient: 'from-violet-500 via-purple-500 to-indigo-500',
    accentColor: 'violet',
  },
];

// システム・分析メニューアイテム
const systemMenuItems: MenuItem[] = [
  {
    icon: <Activity className="h-5 w-5" />,
    label: '📈 アナリティクス',
    path: '/analytics',
    description: 'サイト分析とメトリクス',
    badge: '分析',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    accentColor: 'cyan',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    label: '🛡️ 品質ダッシュボード',
    path: '/quality-dashboard',
    description: '品質メトリクス・テスト・パフォーマンス',
    badge: 'QA',
    gradient: 'from-blue-500 via-blue-600 to-blue-700',
    accentColor: 'blue',
  },
  {
    icon: <AlertTriangle className="h-5 w-5" />,
    label: '⚠️ エラーダッシュボード',
    path: '/error-dashboard',
    description: 'エラー監視とデバッグ情報',
    badge: 'エラー',
    gradient: 'from-red-500 via-orange-500 to-red-600',
    accentColor: 'red',
  },
  {
    icon: <BarChart2 className="h-5 w-5" />,
    label: '📊 カバレッジレポート',
    path: '/coverage-report',
    description: 'テストカバレッジレポート',
    badge: 'テスト',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    accentColor: 'green',
  },
];

// 個人開発・ライフスタイルメニューアイテム
const personalMenuItems: MenuItem[] = [
  {
    icon: <BookOpen className="h-5 w-5" />,
    label: '📚 本棚',
    path: '/bookshelf',
    description: '読書記録と本の管理',
    badge: '読書',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    accentColor: 'amber',
  },
  {
    icon: <Bed className="h-5 w-5" />,
    label: '😴 睡眠トラッカー',
    path: '/sleep-tracker',
    description: '睡眠パターンの記録と分析',
    badge: '健康',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    accentColor: 'indigo',
  },
  {
    icon: <Zap className="h-5 w-5" />,
    label: '⚡ 衝動トラッカー',
    path: '/impulse-tracker',
    description: 'ADHD衝動性の記録と管理',
    badge: 'ADHD',
    gradient: 'from-yellow-500 via-orange-500 to-red-500',
    accentColor: 'yellow',
  },
  {
    icon: <Music className="h-5 w-5" />,
    label: '🎸 ギター練習',
    path: '/guitar-practice',
    description: 'ギター練習の記録と進捗管理',
    badge: '趣味',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    accentColor: 'amber',
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    label: '💼 資産カレンダー',
    path: '/asset-calendar',
    description: '資産管理とイベント計画',
    badge: '資産',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    accentColor: 'green',
  },
];

// プロジェクト管理メニューアイテム
const projectMenuItems: MenuItem[] = [
  {
    icon: <Lightbulb className="h-5 w-5" />,
    label: '💡 改善計画',
    path: '/improvement-plan',
    description: 'サイト改善プランの管理',
    badge: '重要',
    gradient: 'from-amber-500 via-yellow-500 to-orange-500',
    accentColor: 'amber',
  },
  {
    icon: <FolderKanban className="h-5 w-5" />,
    label: '📊 WBSクリエイター',
    path: '/wbs-creator',
    description: 'ワークブレイクダウン構造作成',
    badge: 'プロジェクト',
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    accentColor: 'blue',
  },
];

// メニューセクション定義
const getMenuSections = (t: (key: string) => string): MenuSection[] => [
  {
    id: 'core',
    title: 'コア機能',
    icon: <Home className="h-4 w-4" />,
    items: getCoreMenuItems(t),
    defaultExpanded: true,
  },
  {
    id: 'adhd-specialized',
    title: 'ADHD/ASD特化機能',
    icon: <Brain className="h-4 w-4" />,
    items: adhdSpecializedMenuItems,
    defaultExpanded: true,
  },
  {
    id: 'calendar-task',
    title: 'カレンダー・タスク',
    icon: <Calendar className="h-4 w-4" />,
    items: calendarTaskMenuItems,
    defaultExpanded: false,
  },
  {
    id: 'work-time',
    title: '勤怠管理',
    icon: <Clock className="h-4 w-4" />,
    items: workTimeMenuItems,
    defaultExpanded: false,
  },
  {
    id: 'blog-content',
    title: 'ブログ・コンテンツ',
    icon: <FileText className="h-4 w-4" />,
    items: blogMenuItems,
    defaultExpanded: false,
  },
  {
    id: 'system-analysis',
    title: 'システム・分析',
    icon: <Activity className="h-4 w-4" />,
    items: systemMenuItems,
    defaultExpanded: false,
  },
  {
    id: 'personal-lifestyle',
    title: '個人・ライフスタイル',
    icon: <Bed className="h-4 w-4" />,
    items: personalMenuItems,
    defaultExpanded: false,
  },
  {
    id: 'project-management',
    title: 'プロジェクト管理',
    icon: <Lightbulb className="h-4 w-4" />,
    items: projectMenuItems,
    defaultExpanded: false,
  },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const isDarkMode = theme === 'dark';
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    core: true,
    'adhd-specialized': true,
  });

  // 翻訳関数（簡易版）
  const t = (key: string) => key;

  const menuSections = getMenuSections(t);

  // セクションの展開状態を切り替え
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // 初期展開状態を設定
  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    menuSections.forEach((section) => {
      initialState[section.id] = section.defaultExpanded || false;
    });
    setExpandedSections(initialState);
  }, []);

  const renderMenuItem = (item: MenuItem) => {
    const isActive = location.pathname === item.path;

    return (
      <Link
        to={item.path}
        key={item.path}
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out
          ${
            isActive
              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500 shadow-sm'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
          }
          ${isCollapsed ? 'justify-center px-2' : ''}
        `}
      >
        <div
          className={`transition-colors duration-200 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
        >
          {item.icon}
        </div>

        {!isCollapsed && (
          <>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{item.label}</span>
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {item.description}
                </p>
              )}
            </div>
          </>
        )}
      </Link>
    );
  };

  const renderSection = (section: MenuSection) => {
    const isExpanded = expandedSections[section.id];

    return (
      <div key={section.id} className="mb-4">
        <button
          onClick={() => toggleSection(section.id)}
          className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition-all duration-200
            hover:bg-slate-100 dark:hover:bg-slate-800/50 group
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <div className="text-slate-500 dark:text-slate-400">{section.icon}</div>
          {!isCollapsed && (
            <>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex-1">
                {section.title}
              </span>
              <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            </>
          )}
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-1 mt-2 pl-2">{section.items.map(renderMenuItem)}</div>
        </div>
      </div>
    );
  };

  // サイドバーの検索機能
  const filteredSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <AccessibilityProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        {/* サイドバー */}
        <aside
          className={`${isCollapsed ? 'w-16' : 'w-72'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out flex flex-col shadow-lg`}
        >
          {/* ヘッダー */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>

              {!isCollapsed && (
                <div className="flex-1">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">LifeSync</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">生産性プラットフォーム</p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="メニューを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
              </div>
            )}
          </div>

          {/* メニューコンテンツ */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-2">
              {(searchQuery ? filteredSections : menuSections).map(renderSection)}
            </nav>
          </ScrollArea>

          {/* フッター */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.name || 'ゲストユーザー'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email || 'demo@example.com'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 flex flex-col min-h-screen">
          {/* トップナビゲーション */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  ダッシュボード
                </h2>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="text-gray-600 dark:text-gray-300"
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </Button>

                <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300">
                  <Bell className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* ページコンテンツ */}
          <div className="flex-1 p-6">{children}</div>
        </main>
      </div>
    </AccessibilityProvider>
  );
}

// 使用しない旧コード（削除）
const badgeMenuItems: MenuItem[] = [];
const devQualityMenuItems: MenuItem[] = [];
const toolsMenuItems: MenuItem[] = [];
const additionalMenuItems: MenuItem[] = [];
