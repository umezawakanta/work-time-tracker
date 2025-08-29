/**
 * 🗺️ サイトマップページ
 * 全機能の一覧と案内
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  Map,
  Search,
  Target,
  Home,
  BarChart3,
  Calendar,
  CheckSquare,
  Clock,
  Settings,
  Brain,
  Trophy,
  BookOpen,
  Users,
  Crown,
  CreditCard,
  Lock,
  FileText,
  Star,
  ExternalLink,
  ArrowRight,
  Activity,
  TrendingUp,
  Zap,
  Shield,
  HelpCircle,
  Lightbulb,
  ChevronRight,
  Sparkles,
  Play,
  Package,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getFeatureByPath } from '@/config/features';

/**
 * サイトマップメインページ
 */
const SitemapPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 全ページ・機能の定義
  const allPages = [
    // コア機能
    {
      name: 'ホーム',
      path: '/',
      icon: <Home className="w-4 h-4" />,
      category: 'core',
      status: 'active',
      description: 'メインダッシュボード・統計概要',
      keywords: ['ダッシュボード', 'メイン', 'ホーム', '概要'],
    },
    {
      name: '統合ダッシュボード',
      path: '/integrated-dashboard',
      icon: <BarChart3 className="w-4 h-4" />,
      category: 'core',
      status: 'active',
      description: 'プロジェクト統合管理・全体分析',
      keywords: ['統合', 'プロジェクト', '分析', '管理'],
    },
    {
      name: 'カレンダー',
      path: '/calendar',
      icon: <Calendar className="w-4 h-4" />,
      category: 'core',
      status: 'active',
      description: 'スケジュール管理・予定表',
      keywords: ['カレンダー', 'スケジュール', '予定', '日程'],
    },

    // 生産性管理（タスク追加可能）
    {
      name: 'ゲームループタスク',
      path: '/game-loop-tasks',
      icon: <Play className="w-4 h-4" />,
      category: 'productivity',
      status: 'active',
      description: 'プロシージネーション対策・自動タスク分解・マイクロタスク管理',
      keywords: [
        'ゲーム',
        'プロシージネーション',
        'やる気',
        'モチベーション',
        'タスク追加',
        '分解',
      ],
      features: ['タスク追加', 'AI分解', 'マイクロタスク'],
    },
    {
      name: '従来タスク',
      path: '/todos',
      icon: <CheckSquare className="w-4 h-4" />,
      category: 'productivity',
      status: 'active',
      description: '標準ToDo管理・チェックリスト',
      keywords: ['todo', 'タスク', 'チェックリスト', 'やることリスト'],
    },
    {
      name: 'タスク管理',
      path: '/task-management',
      icon: <Package className="w-4 h-4" />,
      category: 'productivity',
      status: 'active',
      description: 'タスク一覧・編集・管理',
      keywords: ['タスク', '管理', '編集', '一覧'],
    },
    {
      name: '本棚',
      path: '/bookshelf',
      icon: <BookOpen className="w-4 h-4" />,
      category: 'productivity',
      status: 'active',
      description: '読書習慣管理・読書記録',
      keywords: ['読書', '本', '習慣', '記録'],
    },

    // 分析・レポート（NEW機能含む）
    {
      name: '🆕 4象限マトリックス',
      path: '/quadrant-dashboard',
      icon: <Target className="w-4 h-4" />,
      category: 'analysis',
      status: 'new',
      description: 'Gemini AI駆動タスク分類・生産性分析（アイゼンハワーマトリックス）',
      keywords: ['4象限', 'アイゼンハワー', 'AI', 'gemini', '分類', '生産性', '重要', '緊急'],
      isNew: true,
    },
    {
      name: '勤怠管理レポート',
      path: '/reports',
      icon: <Clock className="w-4 h-4" />,
      category: 'analysis',
      status: 'active',
      description: '作業時間分析・勤怠レポート',
      keywords: ['勤怠', '時間', '分析', 'レポート', '働く時間'],
    },
    {
      name: '開発バッジ',
      path: '/development-badges',
      icon: <Trophy className="w-4 h-4" />,
      category: 'analysis',
      status: 'active',
      description: '開発進捗管理・実績バッジ',
      keywords: ['バッジ', '実績', '進捗', '開発'],
    },
    {
      name: 'バッジ完了予測',
      path: '/badge-completion',
      icon: <Target className="w-4 h-4" />,
      category: 'analysis',
      status: 'active',
      description: 'AI駆動バッジ完了予測',
      keywords: ['予測', 'AI', 'バッジ', '完了'],
    },
    {
      name: 'バッジショーケース',
      path: '/badge-showcase',
      icon: <Sparkles className="w-4 h-4" />,
      category: 'analysis',
      status: 'active',
      description: '実績展示・共有機能',
      keywords: ['ショーケース', '展示', '共有', '実績'],
    },

    // 自動化
    {
      name: '自動化ルール',
      path: '/automation-rules',
      icon: <Settings className="w-4 h-4" />,
      category: 'automation',
      status: 'active',
      description: 'システム自動化・ルール設定',
      keywords: ['自動化', 'ルール', 'システム', '効率化'],
    },
    {
      name: 'AI統合',
      path: '/multi-ai',
      icon: <Brain className="w-4 h-4" />,
      category: 'automation',
      status: 'available',
      description: 'AI機能統合・複数AI連携',
      keywords: ['AI', '人工知能', '統合', '連携'],
    },

    // 課金・サブスクリプション
    {
      name: 'サブスクリプション管理',
      path: '/subscription',
      icon: <CreditCard className="w-4 h-4" />,
      category: 'subscription',
      status: 'active',
      description: 'プラン管理・契約状況',
      keywords: ['サブスクリプション', 'プラン', '契約', '管理'],
    },
    {
      name: 'アップグレード',
      path: '/subscription-upgrade',
      icon: <Star className="w-4 h-4" />,
      category: 'subscription',
      status: 'active',
      description: 'プラン変更・アップグレード',
      keywords: ['アップグレード', 'プラン変更', '料金'],
    },
    {
      name: '課金履歴',
      path: '/billing-history',
      icon: <FileText className="w-4 h-4" />,
      category: 'subscription',
      status: 'active',
      description: '支払い履歴・請求書',
      keywords: ['課金', '支払い', '履歴', '請求書'],
    },

    // 認証・アカウント
    {
      name: 'プロフィール',
      path: '/profile',
      icon: <Users className="w-4 h-4" />,
      category: 'account',
      status: 'active',
      description: 'ユーザー設定・プロフィール編集',
      keywords: ['プロフィール', 'ユーザー', '設定', 'アカウント'],
    },

    // その他機能
    {
      name: 'ブログ',
      path: '/blog',
      icon: <FileText className="w-4 h-4" />,
      category: 'other',
      status: 'active',
      description: 'ブログ記事一覧・投稿',
      keywords: ['ブログ', '記事', '投稿', '日記'],
    },
    {
      name: '日記',
      path: '/diary',
      icon: <BookOpen className="w-4 h-4" />,
      category: 'other',
      status: 'active',
      description: '日記管理・記録',
      keywords: ['日記', '記録', '振り返り'],
    },
    {
      name: '睡眠トラッカー',
      path: '/sleep-tracker',
      icon: <Clock className="w-4 h-4" />,
      category: 'other',
      status: 'active',
      description: '睡眠パターン分析・記録',
      keywords: ['睡眠', '記録', '分析', '健康'],
    },
  ];

  // 管理者限定ページ
  if (user?.isAdmin) {
    allPages.push({
      name: '管理者ダッシュボード',
      path: '/admin',
      icon: <Crown className="w-4 h-4" />,
      category: 'admin',
      status: 'active',
      description: 'システム管理・ユーザー管理',
      keywords: ['管理者', 'admin', 'システム管理', 'ユーザー管理'],
    });
  }

  // カテゴリ定義
  const categories = [
    { id: 'all', name: '全て', icon: <Map className="w-4 h-4" />, color: 'bg-gray-100' },
    { id: 'core', name: 'コア機能', icon: <Home className="w-4 h-4" />, color: 'bg-blue-100' },
    {
      id: 'productivity',
      name: '生産性',
      icon: <Target className="w-4 h-4" />,
      color: 'bg-purple-100',
    },
    {
      id: 'analysis',
      name: '分析・レポート',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'bg-orange-100',
    },
    { id: 'automation', name: '自動化', icon: <Zap className="w-4 h-4" />, color: 'bg-green-100' },
    {
      id: 'subscription',
      name: '課金',
      icon: <CreditCard className="w-4 h-4" />,
      color: 'bg-yellow-100',
    },
    {
      id: 'account',
      name: 'アカウント',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-pink-100',
    },
    { id: 'other', name: 'その他', icon: <Package className="w-4 h-4" />, color: 'bg-gray-100' },
  ];

  if (user?.isAdmin) {
    categories.push({
      id: 'admin',
      name: '管理者',
      icon: <Crown className="w-4 h-4" />,
      color: 'bg-red-100',
    });
  }

  // フィルタリング
  const filteredPages = allPages.filter((page) => {
    const matchesCategory = selectedCategory === 'all' || page.category === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.keywords.some((keyword) => keyword.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // ステータス色の取得
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'available':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // ページナビゲーション
  const handlePageNavigation = (path: string) => {
    const feature = getFeatureByPath(path);
    if (feature && feature.status !== 'complete') {
      return; // 非完成は遷移不可
    }
    navigate(path);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <Map className="w-8 h-8 text-blue-600" />
              <span>Work Time Tracker サイトマップ</span>
            </h1>
            <p className="text-gray-600 mt-2">全機能一覧・使用方法ガイド・新機能案内</p>
          </div>
        </div>

        {/* 新機能ハイライト */}
        {/* 完成している場合のみ新機能CTAを表示（未完成はサイトマップから非表示） */}
        {(() => {
          const quad = getFeatureByPath('/quadrant-dashboard');
          if (!quad || quad.status !== 'complete') return null;
          return (
            <Alert className="border-red-200 bg-red-50">
              <Target className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>🆕 新機能リリース:</strong>
                「4象限マトリックス」でAI駆動のタスク分類・生産性分析が利用可能になりました！
                <Button
                  variant="link"
                  className="p-0 ml-2 h-auto text-red-600 underline"
                  onClick={() => navigate('/quadrant-dashboard')}
                >
                  今すぐ試す <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </AlertDescription>
            </Alert>
          );
        })()}

        {/* タスク追加クイックガイド */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <CheckSquare className="w-5 h-5" />
              <span>⚡ タスク追加クイックガイド</span>
              <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                5つの方法
              </Badge>
              <Badge variant="destructive" className="bg-red-200 text-red-800">
                🔐 ログイン必須
              </Badge>
            </CardTitle>
            <CardDescription className="text-blue-700">
              ⚠️
              すべてのタスク管理機能にログインが必要です。目的に応じてタスクを追加できる場所をご案内します
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Home className="w-4 h-4 text-green-600" />
                <span className="font-medium text-sm">ホームページ</span>
                <Badge variant="outline" className="text-xs">
                  最速
                </Badge>
                <Badge variant="destructive" className="text-xs bg-red-100 text-red-700">
                  🔐
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-2">日常タスクのクイック追加（要ログイン）</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => navigate('/')}
              >
                ログイン後に追加
              </Button>
            </div>

            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm">従来タスク</span>
                <Badge variant="outline" className="text-xs">
                  詳細
                </Badge>
                <Badge variant="destructive" className="text-xs bg-red-100 text-red-700">
                  🔐
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-2">優先度・期限・カテゴリ設定（要ログイン）</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => navigate('/todos')}
              >
                ログイン後に管理
              </Button>
            </div>

            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Play className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-sm">ゲームループ</span>
                <Badge variant="outline" className="text-xs">
                  AI分解
                </Badge>
                <Badge variant="destructive" className="text-xs bg-red-100 text-red-700">
                  🔐
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-2">大きな作業を自動分解（要ログイン）</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => navigate('/game-loop-tasks')}
              >
                ログイン後に分解
              </Button>
            </div>

            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-sm">統合ダッシュボード</span>
                <Badge variant="outline" className="text-xs">
                  プロジェクト
                </Badge>
                <Badge variant="destructive" className="text-xs bg-red-100 text-red-700">
                  🔐
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-2">プロジェクト管理・進捗追跡（要ログイン）</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => navigate('/integrated-dashboard')}
              >
                ログイン後に管理
              </Button>
            </div>

            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-4 h-4 text-indigo-600" />
                <span className="font-medium text-sm">認知特化</span>
                <Badge variant="outline" className="text-xs">
                  ADHD対応
                </Badge>
                <Badge variant="destructive" className="text-xs bg-red-100 text-red-700">
                  🔐
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-2">認知特性に最適化（要ログイン）</p>
              <Button size="sm" variant="outline" className="w-full text-xs" disabled>
                ログイン後に認知系機能から
              </Button>
            </div>

            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 flex items-center justify-center">
              <div className="text-center">
                <Lightbulb className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-blue-800 mb-1">迷ったら？</p>
                <p className="text-xs text-blue-600">ログイン後にホームページから始めよう！</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 検索・フィルタ */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="機能名やキーワードで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center space-x-1"
                >
                  {category.icon}
                  <span>{category.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* メインコンテンツ */}
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">グリッド表示</TabsTrigger>
          <TabsTrigger value="list">リスト表示</TabsTrigger>
          <TabsTrigger value="guide">使用ガイド</TabsTrigger>
        </TabsList>

        {/* グリッド表示 */}
        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPages
              .filter((p) => {
                const feature = getFeatureByPath(p.path);
                return !feature || feature.status === 'complete';
              })
              .map((page) => (
                <Card
                  key={page.path}
                  className={`hover:shadow-md transition-shadow cursor-pointer border-2 ${
                    page.isNew ? 'border-red-200 bg-red-50' : 'border-transparent'
                  }`}
                  onClick={() => handlePageNavigation(page.path)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {page.icon}
                        <CardTitle className="text-sm">{page.name}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-1">
                        {page.isNew && (
                          <Badge variant="destructive" className="text-xs">
                            NEW!
                          </Badge>
                        )}
                        <Badge className={`text-xs ${getStatusColor(page.status)}`}>
                          {page.status === 'active' && 'アクティブ'}
                          {page.status === 'available' && '利用可能'}
                          {page.status === 'new' && '新機能'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs mb-3">{page.description}</CardDescription>
                    <div className="flex items-center justify-between">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{page.path}</code>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {filteredPages.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">該当する機能が見つかりません</h3>
                <p className="text-gray-600 mb-4">
                  検索条件を変更するか、カテゴリフィルタを調整してください。
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                >
                  フィルタをクリア
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* リスト表示 */}
        <TabsContent value="list" className="space-y-4">
          {categories
            .filter((cat) => cat.id !== 'all')
            .map((category) => {
              const categoryPages = filteredPages.filter((page) => {
                const match = page.category === category.id;
                if (!match) return false;
                const feature = getFeatureByPath(page.path);
                return !feature || feature.status === 'complete';
              });
              if (categoryPages.length === 0) return null;

              return (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {category.icon}
                      <span>{category.name}</span>
                      <Badge variant="outline">{categoryPages.length}件</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categoryPages.map((page) => (
                        <div
                          key={page.path}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => handlePageNavigation(page.path)}
                        >
                          <div className="flex items-center space-x-3">
                            {page.icon}
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{page.name}</span>
                                {page.isNew && (
                                  <Badge variant="destructive" className="text-xs">
                                    NEW!
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{page.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {page.path}
                            </code>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </TabsContent>

        {/* 使用ガイド */}
        <TabsContent value="guide" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* クイックスタート */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>🚀 クイックスタート</span>
                </CardTitle>
                <CardDescription>初回利用時の推奨手順</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </span>
                    <div>
                      <strong>プロフィール設定</strong>
                      <p className="text-sm text-gray-600">
                        まずはプロフィールページで基本情報を設定
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </span>
                    <div>
                      <strong>タスク登録</strong>
                      <p className="text-sm text-gray-600">「従来タスク」でタスクを追加・整理</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </span>
                    <div>
                      <strong>4象限分析</strong>
                      <p className="text-sm text-gray-600">「4象限マトリックス」でAI分析を実行</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      4
                    </span>
                    <div>
                      <strong>ゲームループ開始</strong>
                      <p className="text-sm text-gray-600">「ゲームループタスク」で楽しく実行</p>
                    </div>
                  </li>
                </ol>
                <Button className="w-full mt-4" onClick={() => navigate('/quadrant-dashboard')}>
                  🆕 新機能から始める
                </Button>
              </CardContent>
            </Card>

            {/* 主要機能紹介 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>⭐ 主要機能</span>
                </CardTitle>
                <CardDescription>特に重要な機能をピックアップ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-l-red-500 pl-4">
                    <h4 className="font-semibold flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>4象限マトリックス</span>
                      <Badge variant="destructive" className="text-xs">
                        NEW!
                      </Badge>
                    </h4>
                    <p className="text-sm text-gray-600">
                      Gemini AIによるタスク自動分類・生産性分析
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm"
                      onClick={() => navigate('/quadrant-dashboard')}
                    >
                      使ってみる →
                    </Button>
                  </div>

                  <div className="border-l-4 border-l-purple-500 pl-4">
                    <h4 className="font-semibold flex items-center space-x-2">
                      <Play className="w-4 h-4" />
                      <span>ゲームループタスク</span>
                    </h4>
                    <p className="text-sm text-gray-600">
                      プロシージネーション対策・ゲーミフィケーション
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm"
                      onClick={() => navigate('/game-loop-tasks')}
                    >
                      試してみる →
                    </Button>
                  </div>

                  <div className="border-l-4 border-l-blue-500 pl-4">
                    <h4 className="font-semibold flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>統合ダッシュボード</span>
                    </h4>
                    <p className="text-sm text-gray-600">全システム統合・総合分析ビュー</p>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm"
                      onClick={() => navigate('/integrated-dashboard')}
                    >
                      確認する →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ヘルプ・サポート */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5" />
                  <span>❓ ヘルプ・サポート</span>
                </CardTitle>
                <CardDescription>困ったときのサポート情報</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>安全な使用:</strong>
                      全データは暗号化され、プライバシーが保護されています。
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <h5 className="font-medium">📚 参考リソース</h5>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• 4象限分析: アイゼンハワーマトリックス理論</li>
                      <li>• ゲームループ: プロシージネーション研究</li>
                      <li>• AI分析: Gemini AI技術活用</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium">🔧 トラブルシューティング</h5>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• ページが表示されない → ログイン確認</li>
                      <li>• 分析が失敗する → タスク詳細情報の充実</li>
                      <li>• 動作が重い → ブラウザのキャッシュクリア</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* システム統合効果 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>🔗 システム統合効果</span>
                </CardTitle>
                <CardDescription>各機能の連携メリット</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
                    <h5 className="font-medium mb-2">🎯 生産性向上の流れ</h5>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center space-x-2">
                        <Target className="w-3 h-3" />
                        <span>4象限でタスク分類</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-gray-400 ml-1" />
                      <div className="flex items-center space-x-2">
                        <Play className="w-3 h-3" />
                        <span>ゲームループで実行</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-gray-400 ml-1" />
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-3 h-3" />
                        <span>統合ダッシュボードで分析</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-gray-400 ml-1" />
                      <div className="flex items-center space-x-2">
                        <Zap className="w-3 h-3" />
                        <span>自動化で効率化</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    各システムが連携することで、単体使用時の3倍以上の生産性向上効果が期待できます。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SitemapPage;
