import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';
import InstallBanner from '@/components/pwa/InstallBanner';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import ThreeStepTour, { TourStepId } from '@/components/engagement/ThreeStepTour';
import { getWeekCount } from '@/services/learning/streak';
import { useAnalytics } from '@/lib/analytics';
import { LanguageSwitcher } from '@/components/internationalization/LanguageSwitcher';
import { logout } from '@/services/api/authApi';
import { ensureOwnReferralCode, buildOwnInviteUrl } from '@/services/share/referral';
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
  CheckSquare,
  ChevronDown,
  ChevronRight,
  BookOpen,
  PenTool,
  Clipboard,
  FolderKanban,
  MapPin,
  Layers,
  Users,
  Twitter,
  TrendingUp,
  CreditCard,
  Star,
  Smartphone,
  LogOut,
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
    label: '🏠 ホーム',
    path: '/',
    description: 'メインホーム画面',
    badge: 'ホーム',
    gradient: 'from-blue-400 via-purple-500 to-pink-500',
    accentColor: 'blue',
  },
  {
    icon: <Home className="h-5 w-5" />,
    label: '🏠 統合ダッシュボード',
    path: '/integrated-dashboard',
    description: 'メインダッシュボード画面',
    badge: 'ダッシュボード',
    gradient: 'from-blue-400 via-purple-500 to-pink-500',
    accentColor: 'blue',
  },
  {
    icon: <Settings className="h-5 w-5" />,
    label: '🗺️ サイトマップ',
    path: '/sitemap',
    description: '全機能一覧・使用ガイド・新機能案内',
    badge: 'ガイド',
    gradient: 'from-green-400 via-blue-500 to-purple-500',
    accentColor: 'green',
  },
  {
    icon: <Target className="h-5 w-5" />,
    label: '📋 タスク管理センター',
    path: '/tasks',
    description: 'すべてのタスク管理機能を統合',
    badge: '統合',
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
  {
    icon: <Brain className="h-5 w-5" />,
    label: '🤖 AI秘書',
    path: '/ai-assistant',
    description: '生成AIパーソナル秘書サービス',
    badge: 'AI',
    gradient: 'from-purple-500 via-indigo-500 to-blue-500',
    accentColor: 'purple',
  },
  {
    icon: <TestTube className="h-5 w-5" />,
    label: '🧭 自己診断',
    path: '/assessments',
    description: 'IQ/MBTIなどの自己診断',
    badge: '診断',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    accentColor: 'emerald',
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    label: '📚 学習',
    path: '/learning',
    description: 'ビジネススクール要点をAI学習',
    badge: '学習',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    accentColor: 'amber',
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
  {
    icon: <Users className="h-5 w-5" />,
    label: '🌟 ベータユーザー募集',
    path: '/beta-user-recruitment',
    description: 'ADHD/ASD特化システムの開発参加・フィードバック提供',
    badge: '募集中',
    gradient: 'from-purple-500 via-pink-500 to-red-500',
    accentColor: 'purple',
  },
  {
    icon: <TestTube className="h-5 w-5" />,
    label: '🧪 実ユーザーテスト',
    path: '/user-testing',
    description: 'ユーザビリティテスト・アクセシビリティ監査・品質保証',
    badge: 'Phase5',
    gradient: 'from-indigo-500 via-blue-500 to-cyan-500',
    accentColor: 'indigo',
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
  // 統合されたタスク管理ページに移行済み
  // {
  //   icon: <CheckSquare className="h-5 w-5" />,
  //   label: '✅ 従来タスク',
  //   path: '/todos',
  //   description: '標準ToDo管理・チェックリスト',
  //   badge: 'ToDo',
  //   gradient: 'from-purple-500 via-indigo-500 to-blue-500',
  //   accentColor: 'purple',
  // },
  // {
  //   icon: <Clipboard className="h-5 w-5" />,
  //   label: '📋 タスク管理',
  //   path: '/task-management',
  //   description: 'プロジェクトとタスクの総合管理',
  //   badge: 'タスク',
  //   gradient: 'from-green-500 via-teal-500 to-blue-500',
  //   accentColor: 'green',
  // },
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

// AI & アシスタントメニューアイテム
const aiAssistantMenuItems: MenuItem[] = [
  {
    icon: <Brain className="h-5 w-5" />,
    label: '🤖 AIアシスタント',
    path: '/ai-assistant',
    description: 'Anthropic Claude連携によるAI支援機能',
    badge: 'AI',
    gradient: 'from-purple-500 via-indigo-500 to-blue-500',
    accentColor: 'purple',
  },
];

// 勤怠管理メニューアイテム
const workTimeMenuItems: MenuItem[] = [
  {
    icon: <Clock className="h-5 w-5" />,
    label: '⏰ 勤怠入力',
    path: '/worktime-entry',
    description: '勤怠時間の記録と入力',
    badge: '入力',
    gradient: 'from-blue-500 via-teal-500 to-green-500',
    accentColor: 'blue',
  },
  {
    icon: <PenTool className="h-5 w-5" />,
    label: '📝 勤怠フォーム',
    path: '/worktime-form',
    description: '詳細な勤怠情報入力フォーム',
    badge: 'フォーム',
    gradient: 'from-teal-500 via-cyan-500 to-blue-500',
    accentColor: 'teal',
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    label: '📊 勤怠レポート',
    path: '/reports',
    description: '勤怠データの詳細レポート表示',
    badge: 'レポート',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    accentColor: 'green',
  },
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
    label: '🔔 メール通知設定',
    path: '/settings/notifications',
    description: 'メール通知の詳細設定',
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
    icon: <Target className="h-5 w-5" />,
    label: '🎯 4象限マトリックス',
    path: '/tasks?tab=quadrant',
    description: 'AI駆動タスク分類・生産性分析（統合タスク管理センター内）',
    badge: '統合',
    gradient: 'from-red-500 via-pink-500 to-rose-500',
    accentColor: 'red',
  },
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
    icon: <Shield className="h-5 w-5" />,
    label: '♿ アクセシビリティ監査',
    path: '/accessibility-audit',
    description: 'WCAG 2.1 AAA準拠監査・包括的ユーザビリティ検証・ADHD/ASD配慮確認',
    badge: '完了',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    accentColor: 'green',
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    label: '🚀 高度パフォーマンス監視',
    path: '/advanced-performance-monitoring',
    description: 'Lighthouse自動監視・リアルタイム性能分析・ADHD配慮UI最適化',
    badge: '最新',
    gradient: 'from-purple-500 via-indigo-500 to-blue-500',
    accentColor: 'purple',
  },
  {
    icon: <Zap className="h-5 w-5" />,
    label: '🏭 本番環境最適化',
    path: '/production-optimization',
    description: 'CDN統合・キャッシュ戦略・監視システム・パフォーマンス最適化',
    badge: '最新',
    gradient: 'from-green-500 via-blue-500 to-purple-500',
    accentColor: 'green',
  },
  {
    icon: <Smartphone className="h-5 w-5" />,
    label: '📱 モバイル最適化',
    path: '/mobile-optimization',
    description: 'PWA機能・タッチ操作・プッシュ通知・ADHD/ASD特化モバイル最適化',
    badge: '最新',
    gradient: 'from-blue-500 via-purple-500 to-pink-500',
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
    label: '🚭 禁煙コーチ',
    path: '/quit-smoking',
    description: 'AIコーチ・衝動対処・節約可視化',
    badge: '最優先',
    gradient: 'from-slate-500 via-gray-500 to-zinc-500',
    accentColor: 'slate',
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

// 開発・ゲーミフィケーションメニューアイテム
const developmentMenuItems: MenuItem[] = [
  {
    icon: <Lightbulb className="h-5 w-5" />,
    label: '🏆 開発バッジ',
    path: '/development-badges',
    description: '開発実績とバッジの確認',
    badge: 'バッジ',
    gradient: 'from-yellow-500 via-orange-500 to-red-500',
    accentColor: 'yellow',
  },
  {
    icon: <Target className="h-5 w-5" />,
    label: '🎮 ゲーミフィケーション',
    path: '/ai-gamification',
    description: 'AI強化ゲーミフィケーション機能',
    badge: 'ゲーム',
    gradient: 'from-purple-500 via-pink-500 to-red-500',
    accentColor: 'purple',
  },
];

// 選挙・政治メニューアイテム
const electionMenuItems: MenuItem[] = [
  {
    icon: <Users className="h-5 w-5" />,
    label: '🗳️ 選挙候補者',
    path: '/election-candidates',
    description: '選挙候補者一覧と情報',
    badge: '選挙',
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    accentColor: 'blue',
  },
  {
    icon: <Plus className="h-5 w-5" />,
    label: '📝 候補者登録',
    path: '/candidate-registration',
    description: '新しい候補者の登録',
    badge: '登録',
    gradient: 'from-green-500 via-teal-500 to-blue-500',
    accentColor: 'green',
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    label: '🏛️ 地区情報',
    path: '/district/1',
    description: '地区別の詳細情報',
    badge: '地区',
    gradient: 'from-indigo-500 via-blue-500 to-cyan-500',
    accentColor: 'indigo',
  },
  {
    icon: <Twitter className="h-5 w-5" />,
    label: '🐦 Twitter',
    path: '/twitter',
    description: 'Twitter統合機能',
    badge: 'SNS',
    gradient: 'from-blue-400 via-sky-500 to-cyan-500',
    accentColor: 'sky',
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    label: '📈 政治トレンド',
    path: '/political-trends',
    description: '政治動向とトレンド分析',
    badge: 'トレンド',
    gradient: 'from-purple-500 via-violet-500 to-indigo-500',
    accentColor: 'purple',
  },
];

// サブスクリプション・請求メニューアイテム
const subscriptionMenuItems: MenuItem[] = [
  {
    icon: <CreditCard className="h-5 w-5" />,
    label: '💳 サブスクリプション',
    path: '/subscription',
    description: 'サブスクリプション管理',
    badge: 'サブスク',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    accentColor: 'green',
  },
  {
    icon: <Star className="h-5 w-5" />,
    label: '⭐ アップグレード',
    path: '/subscription-upgrade',
    description: 'プレミアムプランへのアップグレード',
    badge: 'プレミアム',
    gradient: 'from-yellow-500 via-orange-500 to-red-500',
    accentColor: 'yellow',
  },
  {
    icon: <FileText className="h-5 w-5" />,
    label: '🧾 請求履歴',
    path: '/billing-history',
    description: '過去の請求書と支払い履歴',
    badge: '請求',
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    accentColor: 'blue',
  },
  {
    icon: <BarChart2 className="h-5 w-5" />,
    label: '📊 資産負債レポート',
    path: '/asset-liability-report',
    description: '資産と負債の詳細レポート',
    badge: '資産',
    gradient: 'from-green-500 via-teal-500 to-cyan-500',
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

// ユーザー・設定メニューアイテム
const userMenuItems: MenuItem[] = [
  {
    icon: <User className="h-5 w-5" />,
    label: '👤 プロフィール',
    path: '/profile',
    description: 'ユーザープロフィール設定',
    badge: 'ユーザー',
    gradient: 'from-slate-500 via-gray-500 to-zinc-500',
    accentColor: 'slate',
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
    id: 'ai-assistant',
    title: 'AI & アシスタント',
    icon: <Brain className="h-4 w-4" />,
    items: aiAssistantMenuItems,
    defaultExpanded: false,
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
    id: 'development-gamification',
    title: '開発・ゲーミフィケーション',
    icon: <Target className="h-4 w-4" />,
    items: developmentMenuItems,
    defaultExpanded: false,
  },
  {
    id: 'election-political',
    title: '選挙・政治',
    icon: <Users className="h-4 w-4" />,
    items: electionMenuItems,
    defaultExpanded: false,
  },
  {
    id: 'subscription-billing',
    title: 'サブスクリプション・請求',
    icon: <CreditCard className="h-4 w-4" />,
    items: subscriptionMenuItems,
    defaultExpanded: false,
  },
  {
    id: 'project-management',
    title: 'プロジェクト管理',
    icon: <Lightbulb className="h-4 w-4" />,
    items: projectMenuItems,
    defaultExpanded: false,
  },
  {
    id: 'user-settings',
    title: 'ユーザー・設定',
    icon: <User className="h-4 w-4" />,
    items: userMenuItems,
    defaultExpanded: false,
  },
];

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, setIsAuthenticated, setUser } = useAuth();
  const { trackEvent } = useAnalytics();
  const isDarkMode = theme === 'dark';
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    core: true,
    'adhd-specialized': true,
  });
  const [tourOpen, setTourOpen] = useState(false);
  const [tourProgress, setTourProgress] = useState<Record<TourStepId, boolean>>({
    assessments: false,
    ai: false,
    learning: false,
  });
  const [streakCount, setStreakCount] = useState<number>(0);

  // 翻訳関数（簡易版）
  const t = (key: string) => key;

  const menuSections = getMenuSections(t);

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      setUser(null);
      toast.success('ログアウトしました');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('ログアウトに失敗しました');
    }
  };

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

  // 三段階ツアー進捗の読み込み
  useEffect(() => {
    try {
      const raw = localStorage.getItem('onboarding:3step');
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Record<TourStepId, boolean>>;
        setTourProgress((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
    // 学習ストリーク
    setStreakCount(getWeekCount());
  }, []);

  const persistTour = (next: Record<TourStepId, boolean>) => {
    try {
      localStorage.setItem('onboarding:3step', JSON.stringify(next));
    } catch {}
  };

  const completeTourStep = (step: TourStepId) => {
    setTourProgress((prev) => {
      const next = { ...prev, [step]: true };
      persistTour(next);
      return next;
    });
  };

  const skipTourAll = () => {
    trackEvent('onboarding_tour_skipped_all');
    setTourOpen(false);
    try {
      localStorage.setItem('onboarding:3step_skipped', 'true');
    } catch {}
  };

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
        onClick={() => {
          try {
            trackEvent('nav_click', { path: item.path, label: item.label });
            if (item.path === '/subscription-upgrade') {
              trackEvent('upgrade_cta_click', { location: 'sidebar' });
            }
            if (item.path === '/pricing') {
              trackEvent('pricing_cta_click', { location: 'sidebar' });
            }
            if (item.path === '/invite') {
              trackEvent('invite_nav_click', { location: 'footer_or_sidebar' });
            }
          } catch {}
        }}
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
      {/* Skip to content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-blue-700 focus:px-3 focus:py-2 focus:rounded shadow"
      >
        コンテンツにスキップ
      </a>
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
                aria-label={isCollapsed ? 'サイドバーを展開' : 'サイドバーを折りたたむ'}
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
            <nav className="space-y-2" role="navigation" aria-label="サイドナビゲーション">
              {(searchQuery ? filteredSections : menuSections).map(renderSection)}
            </nav>
          </ScrollArea>

          {/* フッター */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {!isCollapsed && (
              <div className="space-y-3">
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
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                  aria-label="ログアウト"
                >
                  <LogOut className="h-4 w-4" />
                  ログアウト
                </Button>
              </div>
            )}
            {isCollapsed && (
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="icon"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                aria-label="ログアウト"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main id="main-content" role="main" className="flex-1 flex flex-col min-h-screen">
          {/* トップナビゲーション */}
          <header
            className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4"
            role="banner"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Invite quick copy */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      ensureOwnReferralCode();
                      const url = buildOwnInviteUrl();
                      await navigator.clipboard.writeText(url);
                      toast.success('招待リンクをコピーしました');
                      trackEvent('invite_header_copied', { location: 'header' });
                    } catch (e) {
                      toast.error('コピーに失敗しました');
                    }
                  }}
                  aria-label="招待リンクをコピー"
                >
                  友だちを招待
                </Button>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  ダッシュボード
                </h2>
              </div>

              <div className="flex items-center gap-4">
                {/* 3-step progress badge */}
                <button
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs hover:bg-purple-100 border border-purple-200"
                  onClick={() => setTourOpen(true)}
                  aria-label="スタートガイドを開く"
                >
                  <span>ガイド</span>
                  <Badge variant="secondary" className="bg-white text-purple-700 border">
                    {Object.values(tourProgress).filter(Boolean).length}/3
                  </Badge>
                </button>
                <span
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs border border-emerald-200"
                  aria-label="今週の学習ストリーク"
                >
                  🔥 {streakCount}日
                </span>
                <LanguageSwitcher variant="compact" className="text-gray-600 dark:text-gray-300" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="text-gray-600 dark:text-gray-300"
                  aria-label={isDarkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 dark:text-gray-300"
                  onClick={() => {
                    // 通知ページへの遷移（将来的に実装）
                    toast('通知機能は準備中です', { icon: '🔔' });
                  }}
                  aria-label="通知"
                >
                  <Bell className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 dark:text-gray-300"
                  onClick={() => navigate('/settings')}
                  aria-label="設定"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <a
                  href="https://vercel.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline-offset-2 hover:underline"
                >
                  Vercel
                </a>
              </div>
            </div>
          </header>

          {/* ページコンテンツ */}
          <div className="flex-1 p-6">
            {/* Global 3-step Tour */}
            <ThreeStepTour
              open={tourOpen}
              onOpenChange={setTourOpen}
              progress={tourProgress}
              onCompleteStep={completeTourStep}
              onSkipAll={skipTourAll}
              navigateTo={(path) => navigate(path)}
            />
            {/* パンくず（最小）*/}
            <nav className="mb-4 text-sm text-slate-600 dark:text-slate-300" aria-label="パンくず">
              <ol className="flex items-center gap-2">
                <li>
                  <Link to="/" className="hover:underline">
                    ホーム
                  </Link>
                </li>
                <li aria-hidden>›</li>
                <li>
                  <span aria-current="page">{location.pathname.replace('/', '') || 'トップ'}</span>
                </li>
              </ol>
            </nav>
            {children}
            <div className="mt-12">
              <div className="container mx-auto px-4">
                <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 p-4 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    通信は暗号化。データの第三者提供は一切ありません。
                    <a
                      href="/status"
                      className="ml-2 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      システム稼働状況
                    </a>{' '}
                    ·{' '}
                    <a
                      href="/security"
                      className="underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      セキュリティ方針
                    </a>
                  </p>
                </div>
              </div>
            </div>
            <footer className="mt-6">
              <div className="container mx-auto px-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <Link
                    to="/terms"
                    className="hover:text-slate-700 dark:hover:text-slate-200 underline-offset-2 hover:underline"
                  >
                    利用規約
                  </Link>
                  <span className="hidden sm:inline-block">·</span>
                  <Link
                    to="/privacy"
                    className="hover:text-slate-700 dark:hover:text-slate-200 underline-offset-2 hover:underline"
                  >
                    プライバシー
                  </Link>
                  <span className="hidden sm:inline-block">·</span>
                  <Link
                    to="/invite"
                    className="hover:text-slate-700 dark:hover:text-slate-200 underline-offset-2 hover:underline"
                  >
                    友だちを招待
                  </Link>
                  <span className="hidden sm:inline-block">·</span>
                  <Link
                    to="/contact"
                    className="hover:text-slate-700 dark:hover:text-slate-200 underline-offset-2 hover:underline"
                  >
                    お問い合わせ
                  </Link>
                </div>
              </div>
            </footer>
          </div>
          <InstallBanner />
        </main>
      </div>
    </AccessibilityProvider>
  );
}
