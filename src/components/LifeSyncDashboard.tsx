import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import {
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle2,
  AlertCircle,
  Users,
  Wallet,
  Timer,
  Brain,
  Sparkles,
  ArrowRight,
  Plus,
  Play,
  Pause,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Award,
  Coffee,
  BookOpen,
  Heart,
  Home,
  Car,
  ShoppingCart,
  Building2,
  CalendarDays,
  MapPin,
  Lightbulb,
} from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  isToday,
} from 'date-fns';
import { ja } from 'date-fns/locale';

// 型定義
interface TaskSummary {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  todayTarget: number;
}

interface AssetSummary {
  totalAssets: number;
  monthlyChange: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  investmentGrowth: number;
}

interface AttendanceSummary {
  status: 'working' | 'break' | 'off' | 'overtime';
  todayHours: number;
  weeklyHours: number;
  monthlyHours: number;
  efficiency: number;
}

interface ProductivityMetrics {
  focusTime: number;
  tasksCompleted: number;
  habitsCompleted: number;
  wellnessScore: number;
  energyLevel: number;
  stressLevel: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  bgColor: string;
}

export const LifeSyncDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // サンプルデータ（実際は API から取得）
  const [taskSummary] = useState<TaskSummary>({
    total: 25,
    completed: 18,
    inProgress: 5,
    overdue: 2,
    todayTarget: 8,
  });

  const [assetSummary] = useState<AssetSummary>({
    totalAssets: 2850000,
    monthlyChange: 4.2,
    monthlyIncome: 350000,
    monthlyExpenses: 280000,
    savingsRate: 20,
    investmentGrowth: 12.5,
  });

  const [attendanceSummary] = useState<AttendanceSummary>({
    status: 'working',
    todayHours: 6.5,
    weeklyHours: 32.5,
    monthlyHours: 142,
    efficiency: 87,
  });

  const [productivityMetrics] = useState<ProductivityMetrics>({
    focusTime: 4.2,
    tasksCompleted: 6,
    habitsCompleted: 8,
    wellnessScore: 85,
    energyLevel: 78,
    stressLevel: 35,
  });

  const quickActions: QuickAction[] = [
    {
      id: 'new-task',
      title: '新しいタスク',
      description: 'タスクを追加',
      icon: <Plus className="h-5 w-5" />,
      path: '/todos',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'expense-record',
      title: '収支記録',
      description: '収入・支出を記録',
      icon: <DollarSign className="h-5 w-5" />,
      path: '/asset-calendar',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'time-punch',
      title: '勤怠打刻',
      description: '出退勤を記録',
      icon: <Clock className="h-5 w-5" />,
      path: '/work-time-punch',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      id: 'calendar',
      title: 'カレンダー',
      description: 'スケジュール確認',
      icon: <Calendar className="h-5 w-5" />,
      path: '/calendar',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      working: { label: '勤務中', color: 'bg-green-100 text-green-800' },
      break: { label: '休憩中', color: 'bg-yellow-100 text-yellow-800' },
      off: { label: '勤務外', color: 'bg-gray-100 text-gray-800' },
      overtime: { label: '残業中', color: 'bg-red-100 text-red-800' },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.off;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return '夜更かしですね';
    if (hour < 12) return 'おはようございます';
    if (hour < 18) return 'こんにちは';
    return 'こんばんは';
  };

  const completionRate = Math.round((taskSummary.completed / taskSummary.total) * 100);
  const todayProgress = Math.round((taskSummary.completed / taskSummary.todayTarget) * 100);

  return (
    <div className="space-y-6">
      {/* ヘッダーセクション */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {getGreeting()}、{user?.displayName || user?.name}さん！
            </h1>
            <p className="text-blue-100 text-lg">
              {format(currentTime, 'yyyy年M月d日(E) HH:mm', { locale: ja })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {Math.round(
                (productivityMetrics.wellnessScore + productivityMetrics.energyLevel) / 2
              )}
            </div>
            <div className="text-blue-100">生活スコア</div>
          </div>
        </div>

        {/* 今日の目標達成状況 */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm">タスク達成</span>
            </div>
            <div className="text-2xl font-bold">
              {taskSummary.completed}/{taskSummary.todayTarget}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="h-5 w-5" />
              <span className="text-sm">集中時間</span>
            </div>
            <div className="text-2xl font-bold">{productivityMetrics.focusTime}h</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm">今月貯蓄</span>
            </div>
            <div className="text-2xl font-bold">{assetSummary.savingsRate}%</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5" />
              <span className="text-sm">ウェルネス</span>
            </div>
            <div className="text-2xl font-bold">{productivityMetrics.wellnessScore}%</div>
          </div>
        </div>
      </div>

      {/* クイックアクションセクション */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Card
            key={action.id}
            className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            onClick={() => navigate(action.path)}
          >
            <CardContent className="p-4">
              <div
                className={`w-12 h-12 rounded-full ${action.bgColor} flex items-center justify-center mb-3`}
              >
                <div className={action.color}>{action.icon}</div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* メインダッシュボードセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* タスク管理サマリー */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              タスク管理
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/todos')}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">今日の進捗</span>
                <span className="text-sm font-semibold">{todayProgress}%</span>
              </div>
              <Progress value={todayProgress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-700">{taskSummary.completed}</div>
                <div className="text-sm text-green-600">完了済み</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-700">{taskSummary.inProgress}</div>
                <div className="text-sm text-blue-600">進行中</div>
              </div>
            </div>

            {taskSummary.overdue > 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">
                  {taskSummary.overdue}件のタスクが期限超過です
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 資産管理サマリー */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-600" />
              資産管理
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/asset-calendar')}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(assetSummary.totalAssets)}
              </div>
              <div className="flex items-center gap-1 text-sm">
                {assetSummary.monthlyChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={assetSummary.monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'}
                >
                  {assetSummary.monthlyChange > 0 ? '+' : ''}
                  {assetSummary.monthlyChange}%
                </span>
                <span className="text-gray-600">今月</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-lg font-bold text-green-700">
                  {formatCurrency(assetSummary.monthlyIncome)}
                </div>
                <div className="text-sm text-green-600">今月収入</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <div className="text-lg font-bold text-red-700">
                  {formatCurrency(assetSummary.monthlyExpenses)}
                </div>
                <div className="text-sm text-red-600">今月支出</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">貯蓄率</span>
              <span className="text-lg font-bold text-blue-700">{assetSummary.savingsRate}%</span>
            </div>
          </CardContent>
        </Card>

        {/* 勤怠・生産性サマリー */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              勤怠・生産性
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/work-time-dashboard')}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">現在のステータス</span>
              <Badge className={getStatusBadge(attendanceSummary.status).color}>
                {getStatusBadge(attendanceSummary.status).label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-orange-700">
                  {attendanceSummary.todayHours}h
                </div>
                <div className="text-sm text-orange-600">今日の勤務</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-700">
                  {attendanceSummary.efficiency}%
                </div>
                <div className="text-sm text-purple-600">効率性</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">エネルギーレベル</span>
                <span className="font-semibold">{productivityMetrics.energyLevel}%</span>
              </div>
              <Progress value={productivityMetrics.energyLevel} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI インサイトセクション */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <Sparkles className="h-4 w-4 text-pink-500" />
            AI生活改善インサイト
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold text-gray-900">生産性アドバイス</span>
              </div>
              <p className="text-sm text-gray-600">
                午前中の集中時間が高いパターンが見られます。重要なタスクを午前に配置することをお勧めします。
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-semibold text-gray-900">資産形成ヒント</span>
              </div>
              <p className="text-sm text-gray-600">
                今月の貯蓄率が目標を上回っています。余剰資金の一部を長期投資に回すことを検討してみましょう。
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="font-semibold text-gray-900">ウェルネス提案</span>
              </div>
              <p className="text-sm text-gray-600">
                最近のストレスレベルがやや高めです。散歩や瞑想など、リラックスできる時間を作ることをお勧めします。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 最近のアクティビティ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              最近のアクティビティ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium">「月次レポート作成」を完了</div>
                  <div className="text-xs text-gray-500">15分前</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium">食費 ¥1,200 を記録</div>
                  <div className="text-xs text-gray-500">1時間前</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Coffee className="h-4 w-4 text-orange-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium">休憩を開始</div>
                  <div className="text-xs text-gray-500">2時間前</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              今週の成果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">タスク完了率</span>
                <span className="text-lg font-bold text-green-600">92%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">平均集中時間</span>
                <span className="text-lg font-bold text-blue-600">5.2h</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">貯蓄目標達成</span>
                <span className="text-lg font-bold text-purple-600">105%</span>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-800">
                    素晴らしい1週間でした！ 🎉
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
