import React, { useEffect } from 'react';
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
  CheckSquare,
} from 'lucide-react';
import DailyTodoReminder from '@/components/dailyToDoReminder/DailyTodoReminder';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

  // Add this after the stats array and before the return statement
  const recentActivities = [
    { task: 'ダッシュボード UI改善', time: '2時間前', status: 'completed' },
    { task: 'API設計ドキュメント', time: '4時間前', status: 'in-progress' },
    { task: 'ユーザーテスト実施', time: '昨日', status: 'completed' },
    { task: 'デザインレビュー', time: '2日前', status: 'completed' },
  ];

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

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* DailyTodoReminderを左側に配置 */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900">今日のToDo</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/todos')}
                className="flex items-center gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                詳細管理
              </Button>
            </div>
            <DailyTodoReminder isPremium={hasActiveSubscription} />
          </div>
        </div>

        {/* 右側に最近のアクティビティ */}
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

      {/* クイックアクションセクション */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: <CheckSquare className="h-6 w-6" />,
            title: 'ToDo管理',
            description: 'タスクの詳細管理',
            path: '/todos',
            gradient: 'from-green-500 to-green-600',
          },
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
