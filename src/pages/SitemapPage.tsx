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
import { getFeatureByPath, isFeatureAccessible } from '@/config/features';

/**
 * サイトマップメインページ
 */
const SitemapPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const canShow = (path: string) => {
    const res = isFeatureAccessible(path);
    if (path.startsWith('/_bg/')) return false;
    return res.allowed;
  };

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
    <>
      <style>
        {`
          /* サイトマップ専用のモバイルファーストスタイル */
          .sitemap-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            position: relative;
            width: 100vw;
            max-width: 100vw;
            overflow-x: hidden;
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          .sitemap-container * {
            box-sizing: border-box;
          }
          
          .sitemap-container .sitemap-content {
            max-width: 6xl;
            margin: 0 auto;
            padding: 1rem;
            width: 100%;
            box-sizing: border-box;
          }
          
          .sitemap-container .sitemap-header {
            background: white;
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(0, 0, 0, 0.05);
          }
          
          .sitemap-container .sitemap-title {
            font-size: 1.5rem;
            font-weight: 900;
            color: #1f2937;
            margin-bottom: 0.5rem;
            line-height: 1.2;
            letter-spacing: -0.025em;
          }
          
          .sitemap-container .sitemap-subtitle {
            font-size: 0.9rem;
            color: #6b7280;
            line-height: 1.4;
          }
          
          .sitemap-container .sitemap-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
            width: 100%;
            box-sizing: border-box;
          }
          
          .sitemap-container .sitemap-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
            border: 1px solid #e2e8f0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            will-change: transform;
            width: 100%;
            box-sizing: border-box;
            max-width: 100%;
            overflow: hidden;
          }
          
          .sitemap-container .sitemap-card:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          }
          
          .sitemap-container .sitemap-card-header {
            padding: 1rem 1.25rem 0.625rem;
            border-bottom: 1px solid #f1f5f9;
            background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
          }
          
          .sitemap-container .sitemap-card-title {
            font-size: 1rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.375rem;
            line-height: 1.3;
            letter-spacing: -0.025em;
          }
          
          .sitemap-container .sitemap-card-description {
            font-size: 0.8rem;
            color: #6b7280;
            line-height: 1.4;
          }
          
          .sitemap-container .sitemap-card-content {
            padding: 1.25rem;
            width: 100%;
            box-sizing: border-box;
            overflow-x: hidden;
          }
          
          .sitemap-container .sitemap-search {
            background: white;
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 1rem;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
            border: 1px solid #e2e8f0;
          }
          
          .sitemap-container .sitemap-search-input {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 2.5rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 0.9rem;
            box-sizing: border-box;
          }
          
          .sitemap-container .sitemap-search-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          .sitemap-container .sitemap-category-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 1rem;
          }
          
          .sitemap-container .sitemap-category-button {
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.8rem;
            font-weight: 600;
            transition: all 0.3s ease;
            border: 1px solid #d1d5db;
            background: white;
            color: #374151;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            min-height: 2.5rem;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }
          
          .sitemap-container .sitemap-category-button:hover {
            background: #f3f4f6;
            border-color: #9ca3af;
          }
          
          .sitemap-container .sitemap-category-button.active {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
          }
          
          .sitemap-container .sitemap-tabs {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
            border: 1px solid #e2e8f0;
            overflow: hidden;
          }
          
          .sitemap-container .sitemap-tabs-list {
            display: flex;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            padding: 0.5rem;
            gap: 0.25rem;
          }
          
          .sitemap-container .sitemap-tabs-trigger {
            flex: 1;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            font-size: 0.8rem;
            font-weight: 600;
            transition: all 0.3s ease;
            background: transparent;
            border: none;
            color: #6b7280;
            cursor: pointer;
            text-align: center;
            min-height: 2.5rem;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }
          
          .sitemap-container .sitemap-tabs-trigger:hover {
            background: #e2e8f0;
            color: #374151;
          }
          
          .sitemap-container .sitemap-tabs-trigger[data-state="active"] {
            background: #3b82f6;
            color: white;
          }
          
          .sitemap-container .sitemap-tabs-content {
            padding: 1.5rem;
          }
          
          .sitemap-container .sitemap-feature-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
            width: 100%;
            box-sizing: border-box;
          }
          
          .sitemap-container .sitemap-feature-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
            border: 1px solid #e2e8f0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            will-change: transform;
            width: 100%;
            box-sizing: border-box;
            max-width: 100%;
            overflow: hidden;
            cursor: pointer;
          }
          
          .sitemap-container .sitemap-feature-card:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          }
          
          .sitemap-container .sitemap-feature-card.new {
            border-color: #fecaca;
            background: #fef2f2;
          }
          
          .sitemap-container .sitemap-feature-card-header {
            padding: 1rem 1.25rem 0.625rem;
            border-bottom: 1px solid #f1f5f9;
            background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
          }
          
          .sitemap-container .sitemap-feature-card-title {
            font-size: 0.9rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.375rem;
            line-height: 1.3;
            letter-spacing: -0.025em;
          }
          
          .sitemap-container .sitemap-feature-card-description {
            font-size: 0.75rem;
            color: #6b7280;
            line-height: 1.4;
            margin-bottom: 0.75rem;
          }
          
          .sitemap-container .sitemap-feature-card-content {
            padding: 1.25rem;
            width: 100%;
            box-sizing: border-box;
            overflow-x: hidden;
          }
          
          .sitemap-container .sitemap-feature-path {
            font-size: 0.7rem;
            background: #f3f4f6;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            color: #374151;
            font-family: monospace;
            word-break: break-all;
          }
          
          .sitemap-container .sitemap-badge {
            padding: 0.125rem 0.375rem;
            border-radius: 6px;
            font-size: 0.6rem;
            font-weight: 600;
            transition: all 0.3s ease;
            border: 1px solid transparent;
            flex-shrink: 0;
            flex-grow: 0;
            max-width: 100%;
            min-width: 0;
            word-break: break-word;
            line-height: 1.2;
            display: inline-block;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .sitemap-container .sitemap-badge.new {
            background: #fecaca;
            color: #dc2626;
            border-color: #fecaca;
          }
          
          .sitemap-container .sitemap-badge.active {
            background: #dcfce7;
            color: #166534;
            border-color: #dcfce7;
          }
          
          .sitemap-container .sitemap-badge.available {
            background: #dbeafe;
            color: #1e40af;
            border-color: #dbeafe;
          }
          
          /* タブレット対応 */
          @media (min-width: 640px) {
            .sitemap-container .sitemap-content {
              padding: 1.5rem;
            }
            
            .sitemap-container .sitemap-title {
              font-size: 2rem;
            }
            
            .sitemap-container .sitemap-feature-grid {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .sitemap-container .sitemap-category-buttons {
              flex-wrap: nowrap;
              overflow-x: auto;
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            
            .sitemap-container .sitemap-category-buttons::-webkit-scrollbar {
              display: none;
            }
          }
          
          /* デスクトップ対応 */
          @media (min-width: 1024px) {
            .sitemap-container .sitemap-content {
              padding: 2rem;
            }
            
            .sitemap-container .sitemap-title {
              font-size: 2.25rem;
            }
            
            .sitemap-container .sitemap-feature-grid {
              grid-template-columns: repeat(3, 1fr);
            }
            
            .sitemap-container .sitemap-category-buttons {
              flex-wrap: wrap;
            }
          }
        `}
      </style>
      <div className="sitemap-container">
        <div className="sitemap-content">
          {/* ヘッダー */}
          <div className="sitemap-header">
            <h1 className="sitemap-title">
              <Map className="w-8 h-8 text-blue-600 inline-block mr-3" />
              Work Time Tracker サイトマップ
            </h1>
            <p className="sitemap-subtitle">全機能一覧・使用方法ガイド・新機能案内</p>
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
              {canShow('/') && (
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
                  <p className="text-xs text-gray-600 mb-2">
                    日常タスクのクイック追加（要ログイン）
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => navigate('/')}
                  >
                    ログイン後に追加
                  </Button>
                </div>
              )}

              {canShow('/todos') && (
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
                  <p className="text-xs text-gray-600 mb-2">
                    優先度・期限・カテゴリ設定（要ログイン）
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => navigate('/todos')}
                  >
                    ログイン後に管理
                  </Button>
                </div>
              )}

              {canShow('/game-loop-tasks') && (
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
              )}

              {canShow('/integrated-dashboard') && (
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
                  <p className="text-xs text-gray-600 mb-2">
                    プロジェクト管理・進捗追跡（要ログイン）
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => navigate('/integrated-dashboard')}
                  >
                    ログイン後に管理
                  </Button>
                </div>
              )}

              {canShow('/adhd-integrated-life') && (
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
              )}

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
        <div className="sitemap-search">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="機能名やキーワードで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sitemap-search-input"
            />
          </div>
          <div className="sitemap-category-buttons">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`sitemap-category-button ${
                  selectedCategory === category.id ? 'active' : ''
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="sitemap-tabs">
          <div className="sitemap-tabs-list">
            <button className="sitemap-tabs-trigger" data-state="active">
              グリッド表示
            </button>
            <button className="sitemap-tabs-trigger">リスト表示</button>
            <button className="sitemap-tabs-trigger">使用ガイド</button>
          </div>

          <div className="sitemap-tabs-content">
            <div className="sitemap-feature-grid">
              {filteredPages
                .filter((p) => {
                  const feature = getFeatureByPath(p.path);
                  return !feature || feature.status === 'complete';
                })
                .map((page) => (
                  <div
                    key={page.path}
                    className={`sitemap-feature-card ${page.isNew ? 'new' : ''}`}
                    onClick={() => handlePageNavigation(page.path)}
                  >
                    <div className="sitemap-feature-card-header">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {page.icon}
                          <div className="sitemap-feature-card-title">{page.name}</div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {page.isNew && <span className="sitemap-badge new">NEW!</span>}
                          <span className={`sitemap-badge ${page.status}`}>
                            {page.status === 'active' && 'アクティブ'}
                            {page.status === 'available' && '利用可能'}
                            {page.status === 'new' && '新機能'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="sitemap-feature-card-content">
                      <div className="sitemap-feature-card-description">{page.description}</div>
                      <div className="flex items-center justify-between">
                        <code className="sitemap-feature-path">{page.path}</code>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {filteredPages.length === 0 && (
              <div className="sitemap-card">
                <div
                  className="sitemap-card-content"
                  style={{ textAlign: 'center', padding: '2rem' }}
                >
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">該当する機能が見つかりません</h3>
                  <p className="text-gray-600 mb-4">
                    検索条件を変更するか、カテゴリフィルタを調整してください。
                  </p>
                  <button
                    className="sitemap-category-button"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                  >
                    フィルタをクリア
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SitemapPage;
