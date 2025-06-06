import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchTodoItems } from '@/store/todoSlice';
import { useAuth } from '@/context/useAuth';
import { PageLayout } from '@/components/layout/PageLayout';
import { EnhancedCard } from '@/components/common/EnhancedCard';
import { StatsGrid } from '@/components/common/StatsGrid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Target,
  BarChart3,
  Calendar,
  CheckCircle,
  Award,
  Zap,
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp,
} from 'lucide-react';

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const isUserLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  const hasActiveSubscription = useSelector((state: RootState) => state.user.hasActiveSubscription);

  // ToDoデータの初期化
  useEffect(() => {
    if (isAuthenticated && isUserLoggedIn) {
      dispatch(fetchTodoItems());
    }
  }, [isAuthenticated, isUserLoggedIn, dispatch]);

  // 統計データ
  const stats = [
    {
      title: '今日のタスク',
      value: '3/5',
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      progress: 60,
      change: { value: 12, period: '先週比' },
    },
    {
      title: '作業時間',
      value: '6.5h',
      icon: <Clock className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      progress: 81,
      change: { value: 8, period: '昨日比' },
    },
    {
      title: '生産性スコア',
      value: '85%',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      progress: 85,
      change: { value: 5, period: '今月平均' },
    },
    {
      title: '連続記録',
      value: '7日',
      icon: <Award className="h-6 w-6" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      progress: 23,
      change: { value: 0, period: '目標30日' },
    },
  ];

  if (!isUserLoggedIn) {
    return (
      <PageLayout
        title="あなたの生産性を最大化"
        subtitle="時間管理、プロジェクト管理、分析機能を統合した次世代の生産性プラットフォーム"
        badge={{
          text: 'AI駆動の生産性分析',
          variant: 'default',
          icon: <Sparkles className="w-4 h-4" />,
        }}
        headerGradient
        maxWidth="full"
      >
        {/* 機能紹介セクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: <Clock className="h-8 w-8" />,
              title: '時間管理',
              description: '正確な時間追跡と自動レポート生成',
              gradient: 'from-blue-500 to-blue-600',
            },
            {
              icon: <Target className="h-8 w-8" />,
              title: 'プロジェクト管理',
              description: 'タスク管理とプロジェクト進捗の可視化',
              gradient: 'from-purple-500 to-purple-600',
            },
            {
              icon: <BarChart3 className="h-8 w-8" />,
              title: '詳細レポート',
              description: '包括的な分析ダッシュボード',
              gradient: 'from-emerald-500 to-emerald-600',
            },
          ].map((feature, index) => (
            <EnhancedCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              gradient={feature.gradient}
              action={{
                text: '詳細を見る',
                onClick: () => navigate('/register'),
              }}
            />
          ))}
        </div>

        {/* CTAセクション */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate('/register')}
            >
              無料で始める
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg border-2 hover:bg-slate-50"
              onClick={() => navigate('/login')}
            >
              ログイン
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // ログイン済みユーザー向けダッシュボード
  return (
    <PageLayout
      title={`おはようございます、${user?.name || 'ユーザー'}さん！`}
      subtitle="今日も生産的な一日にしましょう 🚀"
      badge={{
        text: hasActiveSubscription ? 'プレミアム' : 'フリー',
        variant: hasActiveSubscription ? 'default' : 'secondary',
      }}
      headerGradient
    >
      {/* 統計セクション */}
      <StatsGrid stats={stats} className="mb-8" />

      {/* クイックアクションセクション */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: <Clock className="h-6 w-6" />,
            title: '勤怠記録',
            description: '今日の作業を記録',
            path: '/work-time',
            gradient: 'from-blue-500 to-blue-600',
          },
          {
            icon: <Target className="h-6 w-6" />,
            title: 'プロジェクト管理',
            description: 'タスクとプロジェクト',
            path: '/integrated-dashboard',
            gradient: 'from-purple-500 to-purple-600',
          },
          {
            icon: <BarChart3 className="h-6 w-6" />,
            title: 'レポート分析',
            description: '生産性の分析',
            path: '/work-time-reports',
            gradient: 'from-emerald-500 to-emerald-600',
          },
          {
            icon: <Calendar className="h-6 w-6" />,
            title: 'カレンダー',
            description: 'スケジュール管理',
            path: '/calendar',
            gradient: 'from-orange-500 to-orange-600',
          },
        ].map((action, index) => (
          <EnhancedCard
            key={index}
            title={action.title}
            description={action.description}
            icon={action.icon}
            gradient={action.gradient}
            action={{
              text: '開く',
              onClick: () => navigate(action.path),
            }}
          />
        ))}
      </div>
    </PageLayout>
  );
};

export default Home;
