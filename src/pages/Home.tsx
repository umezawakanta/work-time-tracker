import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchTodoItems } from '@/store/todoSlice';
import { setTrialActivated } from '@/store/userSlice';
import { useAuth } from '@/context/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle,
  Award,
  Zap,
  ArrowRight,
  Brain,
  BarChart3,
  Sparkles,
  Users,
  Clock4,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const isUserLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  const hasActiveSubscription = useSelector((state: RootState) => state.user.hasActiveSubscription);

  // ToDoデータの初期化
  useEffect(() => {
    if (isAuthenticated && isUserLoggedIn) {
      dispatch(fetchTodoItems()).then((result) => {
        console.log('[Home] 📋 ToDoデータ取得結果:', {
          success: result.meta.requestStatus === 'fulfilled',
          todoCount:
            result.meta.requestStatus === 'fulfilled' && Array.isArray(result.payload)
              ? result.payload.length
              : 0,
        });
      });
    }
  }, [isAuthenticated, isUserLoggedIn, dispatch]);

  // メトリクス用のダミーデータ（実際のAPIと連携時は削除）
  const metrics = {
    todayTasks: 5,
    completedTasks: 3,
    workHours: 6.5,
    productivity: 85,
    streak: 7,
    totalProjects: 12,
  };

  const quickActions = [
    {
      icon: <Clock className="h-5 w-5" />,
      title: '勤怠記録',
      description: '今日の作業を記録',
      path: '/work-time',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: 'プロジェクト管理',
      description: 'タスクとプロジェクト',
      path: '/integrated-dashboard',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: 'レポート分析',
      description: '生産性の分析',
      path: '/work-time-reports',
      color: 'bg-emerald-500',
      hoverColor: 'hover:bg-emerald-600',
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: 'カレンダー',
      description: 'スケジュール管理',
      path: '/calendar',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
    },
  ];

  const recentActivities = [
    { task: 'ダッシュボード UI改善', time: '2時間前', status: 'completed' },
    { task: 'API設計ドキュメント', time: '4時間前', status: 'in-progress' },
    { task: 'ユーザーテスト実施', time: '昨日', status: 'completed' },
    { task: 'デザインレビュー', time: '2日前', status: 'completed' },
  ];

  if (!isUserLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* ヒーローセクション */}
        <section className="pt-20 pb-32 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <Badge
                variant="secondary"
                className="mb-4 px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                新機能: AI駆動の生産性分析
              </Badge>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              あなたの
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                {' '}
                生産性を{' '}
              </span>
              最大化
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              時間管理、プロジェクト管理、分析機能を統合した
              <br />
              次世代の生産性プラットフォーム
            </p>

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
        </section>

        {/* 機能紹介セクション */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                強力な機能セット
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                生産性向上に必要な全ての機能を一つのプラットフォームで
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Clock4 className="h-8 w-8" />,
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
                  icon: <Brain className="h-8 w-8" />,
                  title: 'AI分析',
                  description: '生産性パターンの自動分析と改善提案',
                  gradient: 'from-emerald-500 to-emerald-600',
                },
                {
                  icon: <Users className="h-8 w-8" />,
                  title: 'チーム協業',
                  description: 'チームでの効率的なコラボレーション',
                  gradient: 'from-orange-500 to-orange-600',
                },
                {
                  icon: <BarChart3 className="h-8 w-8" />,
                  title: '詳細レポート',
                  description: '包括的な分析ダッシュボード',
                  gradient: 'from-pink-500 to-pink-600',
                },
                {
                  icon: <Trophy className="h-8 w-8" />,
                  title: '目標達成',
                  description: 'ゲーミフィケーションで習慣化を促進',
                  gradient: 'from-amber-500 to-amber-600',
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md"
                >
                  <CardContent className="p-8">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ログイン済みユーザー向けダッシュボード
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ウェルカムヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            おはようございます、{user?.name || 'ユーザー'}さん！
          </h1>
          <p className="text-slate-600 text-lg">今日も生産的な一日にしましょう 🚀</p>
        </div>

        {/* メトリクスカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: '今日のタスク',
              value: `${metrics.completedTasks}/${metrics.todayTasks}`,
              icon: <CheckCircle className="h-6 w-6" />,
              color: 'text-emerald-600',
              bgColor: 'bg-emerald-50',
              progress: (metrics.completedTasks / metrics.todayTasks) * 100,
            },
            {
              title: '作業時間',
              value: `${metrics.workHours}h`,
              icon: <Clock className="h-6 w-6" />,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50',
              progress: (metrics.workHours / 8) * 100,
            },
            {
              title: '生産性スコア',
              value: `${metrics.productivity}%`,
              icon: <TrendingUp className="h-6 w-6" />,
              color: 'text-purple-600',
              bgColor: 'bg-purple-50',
              progress: metrics.productivity,
            },
            {
              title: '連続記録',
              value: `${metrics.streak}日`,
              icon: <Award className="h-6 w-6" />,
              color: 'text-amber-600',
              bgColor: 'bg-amber-50',
              progress: (metrics.streak / 30) * 100,
            },
          ].map((metric, index) => (
            <Card
              key={index}
              className="border-0 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn('p-3 rounded-xl', metric.bgColor)}>
                    <div className={metric.color}>{metric.icon}</div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                    <p className="text-sm text-slate-500">{metric.title}</p>
                  </div>
                </div>
                <Progress value={metric.progress} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* クイックアクションとアクティビティ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* クイックアクション */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  クイックアクション
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="h-auto p-4 justify-start hover:scale-[1.02] transition-all duration-200"
                      onClick={() => navigate(action.path)}
                    >
                      <div
                        className={cn(
                          'p-3 rounded-xl mr-4 text-white',
                          action.color,
                          action.hoverColor
                        )}
                      >
                        {action.icon}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-900">{action.title}</p>
                        <p className="text-sm text-slate-500">{action.description}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 最近のアクティビティ */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                最近のアクティビティ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        activity.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{activity.task}</p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
