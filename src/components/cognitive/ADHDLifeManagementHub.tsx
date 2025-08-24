import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import {
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  CreditCard,
  Target,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Brain,
  Zap,
  Battery,
  Timer,
  Coffee,
  Home,
  Car,
  ShoppingCart,
  Utensils,
  Gamepad2,
  Heart,
  BookOpen,
  Laptop,
  Phone,
  Shield,
  Lightbulb,
  Star,
  Award,
  Sparkles,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  LineChart,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Building2,
  Briefcase,
  GraduationCap,
  Activity,
  Smile,
  Frown,
  Meh,
  RefreshCw,
  Settings,
  HelpCircle,
  X,
  Save,
  Edit,
  Trash2,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
} from 'lucide-react';
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  parseISO,
  addMinutes,
  differenceInMinutes,
  addHours,
  subDays,
  isToday,
  isTomorrow,
  addWeeks,
  addMonths,
} from 'date-fns';
import { ja } from 'date-fns/locale';

// 型定義
interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  category: 'work' | 'personal' | 'health' | 'finance' | 'learning' | 'social';
  energyRequired: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  isRecurring: boolean;
  reminderMinutes: number[];
  color: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  actualDuration?: number;
  energyCost?: number; // 実際に消費したエネルギー
  moneyImpact?: {
    amount: number;
    type: 'income' | 'expense';
    category: string;
  };
}

interface FinanceTransaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Date;
  location?: string;
  isRecurring: boolean;
  emotionalTrigger?: 'stress' | 'boredom' | 'celebration' | 'impulse' | 'necessity';
  adhdImpact: 'helpful' | 'neutral' | 'harmful'; // ADHD症状への影響
  timeSpentMinutes?: number; // 購入/作業にかかった時間
  energyLevel?: number; // その時のエネルギーレベル
  tags: string[];
}

interface EnergyProfile {
  date: Date;
  hourlyLevels: number[]; // 24時間の各時間帯のエネルギーレベル
  peakHours: number[];
  lowHours: number[];
  averageLevel: number;
  factors: {
    sleep: number;
    exercise: number;
    stress: number;
    medication: number;
    social: number;
  };
}

interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: 'emergency' | 'investment' | 'purchase' | 'debt' | 'experience';
  priority: 'low' | 'medium' | 'high';
  motivationLevel: number; // 1-10
  adhdStrategy: string; // ADHD向け達成戦略
  timeInvestment: number; // 達成に必要な時間（時間/週）
}

interface LifeSimulation {
  timeHorizon: number; // 年数
  scenarios: {
    optimistic: { savings: number; happiness: number; achievements: number };
    realistic: { savings: number; happiness: number; achievements: number };
    pessimistic: { savings: number; happiness: number; achievements: number };
  };
  recommendations: string[];
  adhdConsiderations: string[];
}

export const ADHDLifeManagementHub: React.FC = () => {
  const { user } = useAuth();

  // 状態管理
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'calendar' | 'finance' | 'goals' | 'simulation'
  >('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  // カレンダーデータ
  const [events, setEvents] = useState<ScheduleEvent[]>([
    {
      id: '1',
      title: '朝のルーティン',
      startTime: new Date(2024, 11, 18, 7, 0),
      endTime: new Date(2024, 11, 18, 8, 30),
      category: 'health',
      energyRequired: 'low',
      priority: 'high',
      isRecurring: true,
      reminderMinutes: [15],
      color: '#10B981',
      status: 'completed',
      actualDuration: 85,
      energyCost: 2,
    },
    {
      id: '2',
      title: '重要プロジェクト作業',
      startTime: new Date(2024, 11, 18, 9, 0),
      endTime: new Date(2024, 11, 18, 11, 0),
      category: 'work',
      energyRequired: 'high',
      priority: 'urgent',
      isRecurring: false,
      reminderMinutes: [30, 10],
      color: '#EF4444',
      status: 'in-progress',
      moneyImpact: {
        amount: 5000,
        type: 'income',
        category: 'work',
      },
    },
    {
      id: '3',
      title: '家計簿記録',
      startTime: new Date(2024, 11, 18, 20, 0),
      endTime: new Date(2024, 11, 18, 20, 30),
      category: 'finance',
      energyRequired: 'low',
      priority: 'medium',
      isRecurring: true,
      reminderMinutes: [10],
      color: '#8B5CF6',
      status: 'scheduled',
    },
  ]);

  // 財務データ
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([
    {
      id: '1',
      amount: -1500,
      type: 'expense',
      category: '食費',
      description: 'コンビニ弁当（衝動買い）',
      date: new Date(2024, 11, 18, 12, 30),
      isRecurring: false,
      emotionalTrigger: 'stress',
      adhdImpact: 'harmful',
      timeSpentMinutes: 10,
      energyLevel: 3,
      tags: ['convenience', 'impulse'],
    },
    {
      id: '2',
      amount: 50000,
      type: 'income',
      category: '給与',
      description: '月給',
      date: new Date(2024, 11, 15),
      isRecurring: true,
      adhdImpact: 'helpful',
      timeSpentMinutes: 0,
      energyLevel: 8,
      tags: ['salary', 'stable'],
    },
    {
      id: '3',
      amount: -3000,
      type: 'expense',
      category: '交通費',
      description: '電車代',
      date: new Date(2024, 11, 18, 9, 0),
      isRecurring: false,
      emotionalTrigger: 'necessity',
      adhdImpact: 'neutral',
      timeSpentMinutes: 5,
      energyLevel: 6,
      tags: ['transport', 'necessary'],
    },
  ]);

  // エネルギープロファイル
  const [energyProfile, setEnergyProfile] = useState<EnergyProfile>({
    date: new Date(),
    hourlyLevels: [2, 1, 1, 2, 3, 5, 7, 8, 9, 8, 7, 6, 5, 4, 6, 7, 8, 7, 6, 5, 4, 3, 3, 2],
    peakHours: [8, 9, 16, 17],
    lowHours: [1, 2, 13, 14],
    averageLevel: 5.5,
    factors: {
      sleep: 7,
      exercise: 5,
      stress: 6,
      medication: 8,
      social: 4,
    },
  });

  // 財務目標
  const [goals, setGoals] = useState<FinancialGoal[]>([
    {
      id: '1',
      title: '緊急資金',
      targetAmount: 300000,
      currentAmount: 150000,
      deadline: new Date(2025, 5, 1),
      category: 'emergency',
      priority: 'high',
      motivationLevel: 8,
      adhdStrategy: '自動積立で意識しない貯金',
      timeInvestment: 2,
    },
    {
      id: '2',
      title: 'ノートパソコン買い替え',
      targetAmount: 150000,
      currentAmount: 45000,
      deadline: new Date(2025, 2, 1),
      category: 'purchase',
      priority: 'medium',
      motivationLevel: 9,
      adhdStrategy: '週単位での小額積立',
      timeInvestment: 1,
    },
  ]);

  // 人生シミュレーション
  const [lifeSimulation, setLifeSimulation] = useState<LifeSimulation>({
    timeHorizon: 10,
    scenarios: {
      optimistic: { savings: 5000000, happiness: 8.5, achievements: 12 },
      realistic: { savings: 2500000, happiness: 7.0, achievements: 8 },
      pessimistic: { savings: 500000, happiness: 5.5, achievements: 4 },
    },
    recommendations: [
      '毎月3万円の自動積立を設定',
      'エネルギーピーク時間を収入活動に集中',
      'ストレス支出の代替行動を準備',
    ],
    adhdConsiderations: [
      '衝動買い防止のための24時間ルール導入',
      '予算アプリでリアルタイム支出追跡',
      'エネルギー低下時の金銭判断を避ける',
    ],
  });

  // 統計計算
  const todayEvents = events.filter((event) => isSameDay(event.startTime, new Date()));
  const todayIncome = transactions
    .filter((t) => t.type === 'income' && isSameDay(t.date, new Date()))
    .reduce((sum, t) => sum + t.amount, 0);
  const todayExpenses = transactions
    .filter((t) => t.type === 'expense' && isSameDay(t.date, new Date()))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const currentEnergyLevel = energyProfile.hourlyLevels[new Date().getHours()] || 5;
  const timeValue = todayIncome > 0 ? Math.round(todayIncome / 8) : 2000; // 時給概算

  // イベント作成・編集
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<ScheduleEvent>>({});
  const [newTransaction, setNewTransaction] = useState<Partial<FinanceTransaction>>({});

  return (
    <div className="space-y-6">
      {/* ヘッダー - 統合ダッシュボード */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Calendar className="h-8 w-8" />
              ADHD/ASD ライフマネジメントハブ
            </h1>
            <p className="text-indigo-100">時間とお金を統合管理して、安心できる人生を設計</p>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="text-gray-700">
              <Settings className="h-4 w-4 mr-2" />
              設定
            </Button>
          </div>
        </div>

        {/* 今日の統合サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Battery className="h-5 w-5 text-yellow-300" />
              <span className="text-sm text-indigo-100">現在エネルギー</span>
            </div>
            <div className="text-2xl font-bold">{currentEnergyLevel}/10</div>
            <div className="text-xs text-indigo-200">
              {currentEnergyLevel >= 7
                ? '絶好調'
                : currentEnergyLevel >= 5
                  ? '良好'
                  : currentEnergyLevel >= 3
                    ? '普通'
                    : '要休憩'}
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-green-300" />
              <span className="text-sm text-indigo-100">今日の予定</span>
            </div>
            <div className="text-2xl font-bold">{todayEvents.length}</div>
            <div className="text-xs text-indigo-200">
              {todayEvents.filter((e) => e.status === 'completed').length}件完了
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-300" />
              <span className="text-sm text-indigo-100">今日の収支</span>
            </div>
            <div className="text-2xl font-bold">
              {todayIncome - todayExpenses >= 0 ? '+' : ''}
              {(todayIncome - todayExpenses).toLocaleString()}円
            </div>
            <div className="text-xs text-indigo-200">時給換算: {timeValue.toLocaleString()}円</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-purple-300" />
              <span className="text-sm text-indigo-100">目標進捗</span>
            </div>
            <div className="text-2xl font-bold">
              {Math.round(
                (goals.reduce((sum, goal) => sum + goal.currentAmount / goal.targetAmount, 0) /
                  goals.length) *
                  100
              )}
              %
            </div>
            <div className="text-xs text-indigo-200">平均達成率</div>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'dashboard', label: '📊 ダッシュボード', icon: <BarChart3 className="h-4 w-4" /> },
          {
            id: 'calendar',
            label: '📅 スマートカレンダー',
            icon: <Calendar className="h-4 w-4" />,
          },
          { id: 'finance', label: '💰 ADHD家計簿', icon: <Wallet className="h-4 w-4" /> },
          { id: 'goals', label: '🎯 目標管理', icon: <Target className="h-4 w-4" /> },
          {
            id: 'simulation',
            label: '🔮 人生シミュレーション',
            icon: <Sparkles className="h-4 w-4" />,
          },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={currentView === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView(tab.id as any)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* メインコンテンツエリア */}
      {currentView === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 今日のエネルギー最適化スケジュール */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                エネルギー最適化スケジュール
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* エネルギーグラフ */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">今日のエネルギー変動</span>
                    <span className="text-xs text-gray-500">現在: {new Date().getHours()}時</span>
                  </div>
                  <div className="flex items-end gap-1 h-20">
                    {energyProfile.hourlyLevels.map((level, hour) => {
                      const isCurrentHour = hour === new Date().getHours();
                      const isPeakHour = energyProfile.peakHours.includes(hour);
                      const isLowHour = energyProfile.lowHours.includes(hour);

                      return (
                        <div
                          key={hour}
                          className={`flex-1 rounded-t transition-all ${
                            isCurrentHour
                              ? 'bg-blue-500'
                              : isPeakHour
                                ? 'bg-green-400'
                                : isLowHour
                                  ? 'bg-red-300'
                                  : 'bg-gray-300'
                          }`}
                          style={{ height: `${(level / 10) * 100}%` }}
                          title={`${hour}時: エネルギーレベル${level}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0時</span>
                    <span>6時</span>
                    <span>12時</span>
                    <span>18時</span>
                    <span>24時</span>
                  </div>
                </div>

                {/* 今日の推奨スケジュール */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">エネルギーベース推奨</h4>
                  {todayEvents.map((event) => {
                    const eventHour = event.startTime.getHours();
                    const energyAtTime = energyProfile.hourlyLevels[eventHour];
                    const isOptimal =
                      (event.energyRequired === 'high' && energyAtTime >= 7) ||
                      (event.energyRequired === 'medium' && energyAtTime >= 5) ||
                      (event.energyRequired === 'low' && energyAtTime >= 3);

                    return (
                      <div
                        key={event.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isOptimal
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-yellow-50 border border-yellow-200'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">{event.title}</div>
                          <div className="text-xs text-gray-600">
                            {format(event.startTime, 'HH:mm', { locale: ja })} -
                            {format(event.endTime, 'HH:mm', { locale: ja })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={isOptimal ? 'default' : 'secondary'} className="text-xs">
                            {isOptimal ? '最適' : '要調整'}
                          </Badge>
                          {event.moneyImpact && (
                            <span
                              className={`text-xs ${
                                event.moneyImpact.type === 'income'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {event.moneyImpact.type === 'income' ? '+' : '-'}
                              {event.moneyImpact.amount.toLocaleString()}円
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ADHD特化型支出パターン分析 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                ADHD支出パターン分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 支出の感情トリガー分析 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">感情トリガー別支出</h4>
                  <div className="space-y-2">
                    {['stress', 'impulse', 'boredom', 'celebration', 'necessity'].map((trigger) => {
                      const triggerTransactions = transactions.filter(
                        (t) => t.emotionalTrigger === trigger && t.type === 'expense'
                      );
                      const amount = triggerTransactions.reduce(
                        (sum, t) => sum + Math.abs(t.amount),
                        0
                      );
                      const percentage =
                        transactions.length > 0
                          ? (triggerTransactions.length /
                              transactions.filter((t) => t.type === 'expense').length) *
                            100
                          : 0;

                      const triggerLabels: Record<
                        string,
                        { label: string; color: string; icon: any }
                      > = {
                        stress: {
                          label: 'ストレス',
                          color: 'bg-red-500',
                          icon: <AlertTriangle className="h-3 w-3" />,
                        },
                        impulse: {
                          label: '衝動',
                          color: 'bg-orange-500',
                          icon: <Zap className="h-3 w-3" />,
                        },
                        boredom: {
                          label: '退屈',
                          color: 'bg-yellow-500',
                          icon: <Clock className="h-3 w-3" />,
                        },
                        celebration: {
                          label: 'お祝い',
                          color: 'bg-green-500',
                          icon: <Star className="h-3 w-3" />,
                        },
                        necessity: {
                          label: '必要',
                          color: 'bg-blue-500',
                          icon: <Shield className="h-3 w-3" />,
                        },
                      };

                      return (
                        <div key={trigger} className="flex items-center gap-3">
                          <div className="flex items-center gap-2 w-20">
                            <div
                              className={`w-3 h-3 rounded-full ${triggerLabels[trigger].color}`}
                            />
                            <span className="text-xs text-gray-600">
                              {triggerLabels[trigger].label}
                            </span>
                          </div>
                          <div className="flex-1">
                            <Progress value={percentage} className="h-2" />
                          </div>
                          <span className="text-xs text-gray-600 w-16 text-right">
                            {amount.toLocaleString()}円
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ADHD影響度別支出 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">ADHD症状への影響</h4>
                  <div className="space-y-2">
                    {['helpful', 'neutral', 'harmful'].map((impact) => {
                      const impactTransactions = transactions.filter(
                        (t) => t.adhdImpact === impact
                      );
                      const amount = impactTransactions.reduce(
                        (sum, t) => sum + Math.abs(t.amount),
                        0
                      );

                      const impactLabels: Record<
                        string,
                        { label: string; color: string; textColor: string }
                      > = {
                        helpful: {
                          label: '症状改善',
                          color: 'bg-green-100',
                          textColor: 'text-green-800',
                        },
                        neutral: {
                          label: '中立',
                          color: 'bg-gray-100',
                          textColor: 'text-gray-800',
                        },
                        harmful: {
                          label: '症状悪化',
                          color: 'bg-red-100',
                          textColor: 'text-red-800',
                        },
                      };

                      return (
                        <div
                          key={impact}
                          className={`p-3 rounded-lg ${impactLabels[impact].color}`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm font-medium ${impactLabels[impact].textColor}`}
                            >
                              {impactLabels[impact].label}
                            </span>
                            <span className={`text-sm ${impactLabels[impact].textColor}`}>
                              {amount.toLocaleString()}円 ({impactTransactions.length}件)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 時間×お金の価値可視化 */}
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-indigo-800 mb-2 flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    時間の価値換算
                  </h4>
                  <div className="text-2xl font-bold text-indigo-900 mb-1">
                    {timeValue.toLocaleString()}円/時間
                  </div>
                  <div className="text-xs text-indigo-600">
                    衝動買い1,500円 = あなたの{Math.round((1500 / timeValue) * 60)}分の時間
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* クイックアクション */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                今すぐできるADHD向けアクション
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={() => setShowEventDialog(true)}
                  className="flex flex-col items-center gap-2 h-20 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                  variant="outline"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">予定追加</span>
                </Button>

                <Button
                  onClick={() => setShowTransactionDialog(true)}
                  className="flex flex-col items-center gap-2 h-20 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
                  variant="outline"
                >
                  <DollarSign className="h-5 w-5" />
                  <span className="text-xs">支出記録</span>
                </Button>

                <Button
                  className="flex flex-col items-center gap-2 h-20 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
                  variant="outline"
                  onClick={() => {
                    const nextPeakHour = energyProfile.peakHours.find(
                      (hour) => hour > new Date().getHours()
                    );
                    if (nextPeakHour) {
                      alert(
                        `次のエネルギーピーク: ${nextPeakHour}時頃です！重要なタスクをその時間に予定しましょう。`
                      );
                    }
                  }}
                >
                  <Zap className="h-5 w-5" />
                  <span className="text-xs">ピーク時間確認</span>
                </Button>

                <Button
                  className="flex flex-col items-center gap-2 h-20 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200"
                  variant="outline"
                  onClick={() => {
                    const impulsePrevention = [
                      '24時間待つルールを適用',
                      '現在のエネルギーレベルをチェック',
                      '本当に必要か3回自問',
                      '代替行動を試す',
                    ];
                    alert(
                      `衝動買い防止チェック:\n\n${impulsePrevention.map((item, i) => `${i + 1}. ${item}`).join('\n')}`
                    );
                  }}
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-xs">衝動買い防止</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 他のビューは後で実装 */}
      {currentView === 'calendar' && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              スマートカレンダー（開発中）
            </h3>
            <p className="text-gray-600">
              エネルギーレベルを考慮した最適なスケジューリング機能を開発中です
            </p>
          </CardContent>
        </Card>
      )}

      {currentView === 'finance' && (
        <Card>
          <CardContent className="p-8 text-center">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">ADHD家計簿（開発中）</h3>
            <p className="text-gray-600">感情トリガーを考慮した支出管理機能を開発中です</p>
          </CardContent>
        </Card>
      )}

      {currentView === 'goals' && (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">目標管理（開発中）</h3>
            <p className="text-gray-600">ADHD特性を考慮した目標設定・達成支援機能を開発中です</p>
          </CardContent>
        </Card>
      )}

      {currentView === 'simulation' && (
        <Card>
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              人生シミュレーション（開発中）
            </h3>
            <p className="text-gray-600">将来の安心を可視化するシミュレーション機能を開発中です</p>
          </CardContent>
        </Card>
      )}

      {/* 新しいイベント追加ダイアログ */}
      {showEventDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>新しい予定を追加</span>
                <Button variant="ghost" size="sm" onClick={() => setShowEventDialog(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">タイトル</label>
                <Input
                  value={newEvent.title || ''}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="予定のタイトル..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event-category" className="text-sm font-medium text-gray-700">
                    カテゴリ
                  </label>
                  <select
                    id="event-category"
                    value={newEvent.category || 'personal'}
                    onChange={(e) =>
                      setNewEvent((prev) => ({ ...prev, category: e.target.value as any }))
                    }
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="work">仕事</option>
                    <option value="personal">個人</option>
                    <option value="health">健康</option>
                    <option value="finance">財務</option>
                    <option value="learning">学習</option>
                    <option value="social">社交</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="event-energy" className="text-sm font-medium text-gray-700">
                    エネルギー
                  </label>
                  <select
                    id="event-energy"
                    value={newEvent.energyRequired || 'medium'}
                    onChange={(e) =>
                      setNewEvent((prev) => ({ ...prev, energyRequired: e.target.value as any }))
                    }
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    // 実際の実装では、newEventをeventsに追加
                    setShowEventDialog(false);
                    setNewEvent({});
                  }}
                  className="flex-1"
                >
                  追加
                </Button>
                <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                  キャンセル
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 新しい支出記録ダイアログ */}
      {showTransactionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>支出を記録</span>
                <Button variant="ghost" size="sm" onClick={() => setShowTransactionDialog(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">金額</label>
                <Input
                  type="number"
                  value={newTransaction.amount || ''}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({ ...prev, amount: parseInt(e.target.value) }))
                  }
                  placeholder="支出金額..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">説明</label>
                <Input
                  value={newTransaction.description || ''}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="何に使った？"
                />
              </div>

              <div>
                <label htmlFor="transaction-trigger" className="text-sm font-medium text-gray-700">
                  感情トリガー
                </label>
                <select
                  id="transaction-trigger"
                  aria-label="感情トリガー"
                  value={newTransaction.emotionalTrigger || 'necessity'}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      emotionalTrigger: e.target.value as any,
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="necessity">必要</option>
                  <option value="stress">ストレス</option>
                  <option value="impulse">衝動</option>
                  <option value="boredom">退屈</option>
                  <option value="celebration">お祝い</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    // 実際の実装では、newTransactionをtransactionsに追加
                    setShowTransactionDialog(false);
                    setNewTransaction({});
                  }}
                  className="flex-1"
                >
                  記録
                </Button>
                <Button variant="outline" onClick={() => setShowTransactionDialog(false)}>
                  キャンセル
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
