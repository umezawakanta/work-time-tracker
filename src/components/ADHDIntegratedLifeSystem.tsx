import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Battery,
  Brain,
  Heart,
  Target,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
  Coffee,
  Home,
  Car,
  Utensils,
  ShoppingCart,
  Phone,
  Book,
  Gamepad2,
  Music,
  Briefcase,
  GraduationCap,
  Activity,
  Timer,
  BarChart3,
  PieChart,
  Sparkles,
  Star,
  Award,
  Eye,
  EyeOff,
  Filter,
  Settings,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Lightbulb,
} from 'lucide-react';
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  addHours,
  subHours,
  parseISO,
  isToday,
  isTomorrow,
  addMinutes,
  differenceInMinutes,
  startOfDay,
  endOfDay,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { ja } from 'date-fns/locale';

// 統合データ型定義
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  type: 'task' | 'appointment' | 'routine' | 'break' | 'finance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  energyRequired: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  category: 'work' | 'personal' | 'health' | 'finance' | 'social' | 'creative';
  color: string;
  isRecurring: boolean;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[];
    endDate?: Date;
  };
  reminders: number[]; // minutes before
  location?: string;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  adhdTags: string[];
  emotionalImpact: 'positive' | 'neutral' | 'negative';
}

interface FinanceRecord {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  description: string;
  date: Date;
  location?: string;
  paymentMethod: 'cash' | 'card' | 'digital' | 'bank_transfer';
  emotionalTrigger?:
    | 'stress'
    | 'impulse'
    | 'boredom'
    | 'celebration'
    | 'necessity'
    | 'social_pressure';
  adhdImpact: 'helpful' | 'neutral' | 'harmful';
  energyLevel: number; // 1-10 at time of transaction
  timeSpentMinutes: number;
  isPlanned: boolean;
  tags: string[];
  relatedEventId?: string; // link to calendar event
  impulsePrevention?: {
    waitTimeMinutes: number;
    alternativeActions: string[];
    finalDecision: 'proceed' | 'delay' | 'cancel';
  };
}

interface EnergyPattern {
  date: Date;
  hourlyLevels: number[]; // 24 hours, 0-10 scale
  averageLevel: number;
  peakHours: number[];
  lowHours: number[];
  factors: {
    sleep: number;
    exercise: number;
    stress: number;
    medication: number;
    nutrition: number;
    social: number;
  };
  notes?: string;
}

interface PersonalStats {
  currentStreak: number;
  tasksCompleted: number;
  totalFocusTime: number; // minutes
  moneyManaged: number;
  energyAverage: number;
  improvementAreas: string[];
  achievements: string[];
  weeklyGoals: {
    tasks: { target: number; current: number };
    focus: { target: number; current: number };
    budget: { target: number; current: number };
    energy: { target: number; current: number };
  };
}

interface ViewState {
  mode: 'day' | 'week' | 'month';
  currentDate: Date;
  showFinance: boolean;
  showTasks: boolean;
  showEnergy: boolean;
  filterCategory: string;
  filterPriority: string;
}

export const ADHDIntegratedLifeSystem: React.FC = () => {
  const { user } = useAuth();

  // Core state management
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [finances, setFinances] = useState<FinanceRecord[]>([]);
  const [energyPatterns, setEnergyPatterns] = useState<EnergyPattern[]>([]);
  const [personalStats, setPersonalStats] = useState<PersonalStats>({
    currentStreak: 7,
    tasksCompleted: 23,
    totalFocusTime: 890,
    moneyManaged: 145000,
    energyAverage: 7.2,
    improvementAreas: ['時間管理', '支出コントロール'],
    achievements: ['7日連続達成', 'エネルギー管理改善'],
    weeklyGoals: {
      tasks: { target: 30, current: 23 },
      focus: { target: 1200, current: 890 },
      budget: { target: 50000, current: 32000 },
      energy: { target: 7.5, current: 7.2 },
    },
  });

  const [viewState, setViewState] = useState<ViewState>({
    mode: 'week',
    currentDate: new Date(),
    showFinance: true,
    showTasks: true,
    showEnergy: true,
    filterCategory: 'all',
    filterPriority: 'all',
  });

  // Form states
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddFinance, setShowAddFinance] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({});
  const [newFinance, setNewFinance] = useState<Partial<FinanceRecord>>({});

  // Current time and energy tracking
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentEnergy, setCurrentEnergy] = useState(7);

  // Initialize with sample data
  useEffect(() => {
    const sampleEvents: CalendarEvent[] = [
      {
        id: '1',
        title: '朝のルーティン',
        start: new Date(2024, 11, 18, 7, 0),
        end: new Date(2024, 11, 18, 8, 30),
        type: 'routine',
        priority: 'high',
        energyRequired: 'low',
        status: 'completed',
        category: 'health',
        color: '#10B981',
        isRecurring: true,
        recurrence: { frequency: 'daily' },
        reminders: [15],
        adhdTags: ['morning', 'routine', 'self-care'],
        emotionalImpact: 'positive',
      },
      {
        id: '2',
        title: '重要プロジェクト作業',
        start: new Date(2024, 11, 18, 9, 0),
        end: new Date(2024, 11, 18, 11, 0),
        type: 'task',
        priority: 'urgent',
        energyRequired: 'high',
        status: 'in-progress',
        category: 'work',
        color: '#EF4444',
        isRecurring: false,
        reminders: [30, 10],
        estimatedCost: 0,
        adhdTags: ['focus-required', 'important'],
        emotionalImpact: 'neutral',
      },
      {
        id: '3',
        title: '昼食',
        start: new Date(2024, 11, 18, 12, 0),
        end: new Date(2024, 11, 18, 13, 0),
        type: 'routine',
        priority: 'medium',
        energyRequired: 'low',
        status: 'scheduled',
        category: 'health',
        color: '#F59E0B',
        isRecurring: true,
        recurrence: { frequency: 'daily' },
        reminders: [10],
        estimatedCost: 800,
        adhdTags: ['nutrition', 'break'],
        emotionalImpact: 'positive',
      },
    ];

    const sampleFinances: FinanceRecord[] = [
      {
        id: '1',
        amount: -1200,
        type: 'expense',
        category: '食費',
        description: 'コンビニ昼食',
        date: new Date(2024, 11, 18, 12, 30),
        paymentMethod: 'card',
        emotionalTrigger: 'necessity',
        adhdImpact: 'neutral',
        energyLevel: 6,
        timeSpentMinutes: 15,
        isPlanned: true,
        tags: ['food', 'daily'],
        relatedEventId: '3',
      },
      {
        id: '2',
        amount: -3500,
        type: 'expense',
        category: '娯楽',
        description: 'ゲーム課金（衝動）',
        date: new Date(2024, 11, 17, 22, 15),
        paymentMethod: 'digital',
        emotionalTrigger: 'stress',
        adhdImpact: 'harmful',
        energyLevel: 3,
        timeSpentMinutes: 5,
        isPlanned: false,
        tags: ['impulse', 'digital'],
        impulsePrevention: {
          waitTimeMinutes: 0,
          alternativeActions: ['散歩', '音楽聴く', '友人に連絡'],
          finalDecision: 'proceed',
        },
      },
      {
        id: '3',
        amount: 50000,
        type: 'income',
        category: '給与',
        description: '月給（12月分）',
        date: new Date(2024, 11, 15),
        paymentMethod: 'bank_transfer',
        adhdImpact: 'helpful',
        energyLevel: 8,
        timeSpentMinutes: 0,
        isPlanned: true,
        tags: ['salary', 'monthly'],
      },
    ];

    setEvents(sampleEvents);
    setFinances(sampleFinances);

    // Update current time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  // Calendar navigation
  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    setViewState((prev) => {
      let newDate = prev.currentDate;
      switch (prev.mode) {
        case 'day':
          newDate =
            direction === 'next' ? addDays(prev.currentDate, 1) : subDays(prev.currentDate, 1);
          break;
        case 'week':
          newDate =
            direction === 'next' ? addWeeks(prev.currentDate, 1) : subWeeks(prev.currentDate, 1);
          break;
        case 'month':
          newDate =
            direction === 'next' ? addWeeks(prev.currentDate, 4) : subWeeks(prev.currentDate, 4);
          break;
      }
      return { ...prev, currentDate: newDate };
    });
  }, []);

  // Get events for current view
  const getEventsForView = useCallback(() => {
    const { mode, currentDate } = viewState;
    let startDate: Date, endDate: Date;

    switch (mode) {
      case 'day':
        startDate = startOfDay(currentDate);
        endDate = endOfDay(currentDate);
        break;
      case 'week':
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
        break;
    }

    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (
        (eventStart >= startDate && eventStart <= endDate) ||
        (eventEnd >= startDate && eventEnd <= endDate) ||
        (eventStart <= startDate && eventEnd >= endDate)
      );
    });
  }, [events, viewState]);

  // Get finances for current view
  const getFinancesForView = useCallback(() => {
    const { mode, currentDate } = viewState;
    let startDate: Date, endDate: Date;

    switch (mode) {
      case 'day':
        startDate = startOfDay(currentDate);
        endDate = endOfDay(currentDate);
        break;
      case 'week':
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
        break;
    }

    return finances.filter((finance) => {
      const financeDate = new Date(finance.date);
      return financeDate >= startDate && financeDate <= endDate;
    });
  }, [finances, viewState]);

  const currentEvents = getEventsForView();
  const currentFinances = getFinancesForView();

  // Calculate current period stats
  const periodStats = useMemo(() => {
    const income = currentFinances
      .filter((f) => f.type === 'income')
      .reduce((sum, f) => sum + f.amount, 0);

    const expenses = currentFinances
      .filter((f) => f.type === 'expense')
      .reduce((sum, f) => sum + Math.abs(f.amount), 0);

    const completedTasks = currentEvents.filter((e) => e.status === 'completed').length;
    const totalTasks = currentEvents.filter((e) => e.type === 'task').length;

    const focusTime = currentEvents
      .filter((e) => e.status === 'completed' && e.adhdTags.includes('focus-required'))
      .reduce((sum, e) => sum + differenceInMinutes(new Date(e.end), new Date(e.start)), 0);

    const impulsiveExpenses = currentFinances
      .filter((f) => f.type === 'expense' && !f.isPlanned)
      .reduce((sum, f) => sum + Math.abs(f.amount), 0);

    return {
      income,
      expenses,
      balance: income - expenses,
      completedTasks,
      totalTasks,
      taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      focusTime,
      impulsiveExpenses,
      plannedExpenseRatio: expenses > 0 ? ((expenses - impulsiveExpenses) / expenses) * 100 : 100,
    };
  }, [currentFinances, currentEvents]);

  // Energy optimization recommendations
  const getEnergyRecommendations = useCallback(() => {
    const currentHour = currentTime.getHours();
    const recommendations = [];

    if (currentEnergy < 4) {
      recommendations.push({
        type: 'rest',
        message: 'エネルギーが低下しています。15分の休憩をお勧めします。',
        action: 'break',
        priority: 'high',
      });
    } else if (currentEnergy > 8 && currentHour >= 9 && currentHour <= 11) {
      recommendations.push({
        type: 'productivity',
        message: '高エネルギー時間帯です！重要なタスクに取り組みましょう。',
        action: 'focus-work',
        priority: 'high',
      });
    }

    // Check for upcoming high-energy tasks during low-energy periods
    const upcomingEvents = events.filter((e) => {
      const eventStart = new Date(e.start);
      const timeDiff = differenceInMinutes(eventStart, currentTime);
      return timeDiff > 0 && timeDiff <= 60;
    });

    upcomingEvents.forEach((event) => {
      if (event.energyRequired === 'high' && currentEnergy < 6) {
        recommendations.push({
          type: 'preparation',
          message: `「${event.title}」まで${Math.round(differenceInMinutes(new Date(event.start), currentTime))}分。エネルギー回復の準備をしましょう。`,
          action: 'prepare',
          priority: 'medium',
        });
      }
    });

    return recommendations;
  }, [currentEnergy, currentTime, events]);

  const energyRecommendations = getEnergyRecommendations();

  // Add new event
  const addEvent = useCallback(() => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description || '',
      start: new Date(newEvent.start),
      end: new Date(newEvent.end),
      type: newEvent.type || 'task',
      priority: newEvent.priority || 'medium',
      energyRequired: newEvent.energyRequired || 'medium',
      status: 'scheduled',
      category: newEvent.category || 'personal',
      color: newEvent.color || '#3B82F6',
      isRecurring: newEvent.isRecurring || false,
      reminders: newEvent.reminders || [15],
      adhdTags: newEvent.adhdTags || [],
      emotionalImpact: newEvent.emotionalImpact || 'neutral',
    };

    setEvents((prev) => [...prev, event]);
    setNewEvent({});
    setShowAddEvent(false);
  }, [newEvent]);

  // Add new finance record
  const addFinance = useCallback(() => {
    if (!newFinance.amount || !newFinance.description) return;

    const finance: FinanceRecord = {
      id: Date.now().toString(),
      amount: newFinance.amount,
      type: newFinance.type || 'expense',
      category: newFinance.category || '食費',
      description: newFinance.description,
      date: newFinance.date ? new Date(newFinance.date) : new Date(),
      paymentMethod: newFinance.paymentMethod || 'card',
      emotionalTrigger: newFinance.emotionalTrigger,
      adhdImpact: newFinance.adhdImpact || 'neutral',
      energyLevel: currentEnergy,
      timeSpentMinutes: newFinance.timeSpentMinutes || 5,
      isPlanned: newFinance.isPlanned || false,
      tags: newFinance.tags || [],
    };

    setFinances((prev) => [...prev, finance]);
    setNewFinance({});
    setShowAddFinance(false);
  }, [newFinance, currentEnergy]);

  // Update event status
  const updateEventStatus = useCallback((eventId: string, newStatus: CalendarEvent['status']) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === eventId ? { ...event, status: newStatus } : event))
    );
  }, []);

  // Time grid for day/week view
  const generateTimeGrid = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map((hour) => ({
      hour,
      label: format(new Date().setHours(hour, 0, 0, 0), 'HH:mm'),
      events: currentEvents.filter((event) => {
        const eventStart = new Date(event.start);
        return eventStart.getHours() === hour;
      }),
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with navigation and stats */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Calendar className="h-8 w-8" />
              統合ライフマネジメントシステム
            </h1>
            <p className="text-blue-100">ADHD/ASD特化型 カレンダー × 資産管理 × エネルギー最適化</p>
          </div>

          {/* View controls */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setViewState((prev) => ({ ...prev, mode: 'day' }))}
              className={`${viewState.mode === 'day' ? 'bg-white text-blue-600' : ''}`}
            >
              日
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setViewState((prev) => ({ ...prev, mode: 'week' }))}
              className={`${viewState.mode === 'week' ? 'bg-white text-blue-600' : ''}`}
            >
              週
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setViewState((prev) => ({ ...prev, mode: 'month' }))}
              className={`${viewState.mode === 'month' ? 'bg-white text-blue-600' : ''}`}
            >
              月
            </Button>
          </div>
        </div>

        {/* Period stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-green-300" />
              <span className="text-sm text-blue-100">タスク完了率</span>
            </div>
            <div className="text-2xl font-bold">{Math.round(periodStats.taskCompletionRate)}%</div>
            <div className="text-xs text-blue-200">
              {periodStats.completedTasks}/{periodStats.totalTasks} 完了
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-yellow-300" />
              <span className="text-sm text-blue-100">収支バランス</span>
            </div>
            <div className="text-2xl font-bold">
              {periodStats.balance >= 0 ? '+' : ''}
              {periodStats.balance.toLocaleString()}円
            </div>
            <div className="text-xs text-blue-200">
              計画支出率: {Math.round(periodStats.plannedExpenseRatio)}%
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="h-5 w-5 text-purple-300" />
              <span className="text-sm text-blue-100">集中時間</span>
            </div>
            <div className="text-2xl font-bold">
              {Math.round((periodStats.focusTime / 60) * 10) / 10}h
            </div>
            <div className="text-xs text-blue-200">深い集中時間</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Battery className="h-5 w-5 text-red-300" />
              <span className="text-sm text-blue-100">現在エネルギー</span>
            </div>
            <div className="text-2xl font-bold">{currentEnergy}/10</div>
            <div className="text-xs text-blue-200">
              {currentEnergy >= 8
                ? '絶好調'
                : currentEnergy >= 6
                  ? '良好'
                  : currentEnergy >= 4
                    ? '普通'
                    : '要休憩'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation and quick actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {format(
              viewState.currentDate,
              viewState.mode === 'day'
                ? 'M月d日(E)'
                : viewState.mode === 'week'
                  ? 'M月d日〜'
                  : 'M月',
              { locale: ja }
            )}
            {viewState.mode === 'week' &&
              format(addDays(viewState.currentDate, 6), 'd日', { locale: ja })}
          </h2>
          <Button variant="outline" onClick={() => navigateDate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setViewState((prev) => ({ ...prev, currentDate: new Date() }))}
          >
            今日
          </Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setShowAddEvent(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            予定追加
          </Button>
          <Button
            onClick={() => setShowAddFinance(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            支出記録
          </Button>
        </div>
      </div>

      {/* Energy recommendations */}
      {energyRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              エネルギー最適化提案
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {energyRecommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    rec.priority === 'high'
                      ? 'border-red-500 bg-red-50'
                      : rec.priority === 'medium'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="font-medium text-sm">{rec.message}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main calendar/timeline view */}
      {viewState.mode === 'week' && (
        <Card>
          <CardHeader>
            <CardTitle>週間ビュー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-1 text-sm">
              {/* Time column */}
              <div className="space-y-12">
                <div className="h-8"></div> {/* Header spacer */}
                {Array.from({ length: 24 }, (_, hour) => (
                  <div key={hour} className="h-12 flex items-center text-gray-500 text-xs">
                    {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const date = addDays(
                  startOfWeek(viewState.currentDate, { weekStartsOn: 1 }),
                  dayIndex
                );
                const dayEvents = currentEvents.filter((event) =>
                  isSameDay(new Date(event.start), date)
                );

                return (
                  <div key={dayIndex} className="border-l border-gray-200">
                    {/* Day header */}
                    <div
                      className={`h-8 flex items-center justify-center text-sm font-medium border-b ${
                        isToday(date) ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      {format(date, 'E d', { locale: ja })}
                    </div>

                    {/* Hour slots */}
                    <div className="space-y-1">
                      {Array.from({ length: 24 }, (_, hour) => {
                        const hourEvents = dayEvents.filter((event) => {
                          const eventStart = new Date(event.start);
                          return eventStart.getHours() === hour;
                        });

                        return (
                          <div key={hour} className="h-12 border-b border-gray-100 relative">
                            {hourEvents.map((event) => (
                              <div
                                key={event.id}
                                className={`absolute inset-x-1 mx-1 px-2 py-1 rounded text-xs cursor-pointer transition-all hover:shadow-md`}
                                style={{
                                  backgroundColor: event.color + '20',
                                  borderLeft: `3px solid ${event.color}`,
                                  top: `${(new Date(event.start).getMinutes() / 60) * 100}%`,
                                  height: `${Math.min(
                                    (differenceInMinutes(
                                      new Date(event.end),
                                      new Date(event.start)
                                    ) /
                                      60) *
                                      100,
                                    100
                                  )}%`,
                                }}
                                onClick={() => setEditingEvent(event)}
                              >
                                <div className="font-medium truncate">{event.title}</div>
                                {event.estimatedCost && (
                                  <div className="text-xs text-gray-600">
                                    ¥{event.estimatedCost.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Finance summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              収支サマリー
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">収入</div>
                  <div className="text-xl font-bold text-green-600">
                    +{periodStats.income.toLocaleString()}円
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">支出</div>
                  <div className="text-xl font-bold text-red-600">
                    -{periodStats.expenses.toLocaleString()}円
                  </div>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">衝動支出</span>
                  <span className="text-orange-600 font-medium">
                    -{periodStats.impulsiveExpenses.toLocaleString()}円
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min((periodStats.impulsiveExpenses / periodStats.expenses) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  支出の{Math.round((periodStats.impulsiveExpenses / periodStats.expenses) * 100)}
                  %が計画外
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              今週の目標進捗
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(personalStats.weeklyGoals).map(([key, goal]) => {
                const percentage = Math.min((goal.current / goal.target) * 100, 100);
                const labels = {
                  tasks: 'タスク完了',
                  focus: '集中時間',
                  budget: '予算内支出',
                  energy: 'エネルギー平均',
                };

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {labels[key as keyof typeof labels]}
                      </span>
                      <span className="text-sm text-gray-600">
                        {goal.current} / {goal.target}
                        {key === 'focus' && '分'}
                        {key === 'budget' && '円'}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">{Math.round(percentage)}% 達成</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>新しい予定を追加</span>
                <Button variant="ghost" size="sm" onClick={() => setShowAddEvent(false)}>
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
                  <label className="text-sm font-medium text-gray-700">開始時間</label>
                  <Input
                    type="datetime-local"
                    value={
                      newEvent.start ? format(new Date(newEvent.start), "yyyy-MM-dd'T'HH:mm") : ''
                    }
                    onChange={(e) =>
                      setNewEvent((prev) => ({ ...prev, start: new Date(e.target.value) }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">終了時間</label>
                  <Input
                    type="datetime-local"
                    value={newEvent.end ? format(new Date(newEvent.end), "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) =>
                      setNewEvent((prev) => ({ ...prev, end: new Date(e.target.value) }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">種類</label>
                  <select
                    value={newEvent.type || 'task'}
                    onChange={(e) =>
                      setNewEvent((prev) => ({ ...prev, type: e.target.value as any }))
                    }
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="task">タスク</option>
                    <option value="appointment">予定</option>
                    <option value="routine">ルーティン</option>
                    <option value="break">休憩</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">優先度</label>
                  <select
                    value={newEvent.priority || 'medium'}
                    onChange={(e) =>
                      setNewEvent((prev) => ({ ...prev, priority: e.target.value as any }))
                    }
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                    <option value="urgent">緊急</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">必要エネルギー</label>
                  <select
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
                <div>
                  <label className="text-sm font-medium text-gray-700">予想費用（円）</label>
                  <Input
                    type="number"
                    value={newEvent.estimatedCost || ''}
                    onChange={(e) =>
                      setNewEvent((prev) => ({
                        ...prev,
                        estimatedCost: parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={addEvent} className="flex-1">
                  追加
                </Button>
                <Button variant="outline" onClick={() => setShowAddEvent(false)}>
                  キャンセル
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Finance Modal */}
      {showAddFinance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>支出を記録</span>
                <Button variant="ghost" size="sm" onClick={() => setShowAddFinance(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">金額</label>
                <Input
                  type="number"
                  value={newFinance.amount || ''}
                  onChange={(e) =>
                    setNewFinance((prev) => ({ ...prev, amount: parseInt(e.target.value) || 0 }))
                  }
                  placeholder="支出金額..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">説明</label>
                <Input
                  value={newFinance.description || ''}
                  onChange={(e) =>
                    setNewFinance((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="何に使った？"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">カテゴリ</label>
                  <select
                    value={newFinance.category || '食費'}
                    onChange={(e) =>
                      setNewFinance((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="食費">食費</option>
                    <option value="交通費">交通費</option>
                    <option value="娯楽">娯楽</option>
                    <option value="医療費">医療費</option>
                    <option value="生活用品">生活用品</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">支払方法</label>
                  <select
                    value={newFinance.paymentMethod || 'card'}
                    onChange={(e) =>
                      setNewFinance((prev) => ({ ...prev, paymentMethod: e.target.value as any }))
                    }
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="cash">現金</option>
                    <option value="card">カード</option>
                    <option value="digital">電子マネー</option>
                    <option value="bank_transfer">銀行振込</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">感情トリガー</label>
                <select
                  value={newFinance.emotionalTrigger || 'necessity'}
                  onChange={(e) =>
                    setNewFinance((prev) => ({ ...prev, emotionalTrigger: e.target.value as any }))
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="necessity">必要</option>
                  <option value="stress">ストレス</option>
                  <option value="impulse">衝動</option>
                  <option value="boredom">退屈</option>
                  <option value="celebration">お祝い</option>
                  <option value="social_pressure">社会的圧力</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="planned"
                  checked={newFinance.isPlanned || false}
                  onChange={(e) =>
                    setNewFinance((prev) => ({ ...prev, isPlanned: e.target.checked }))
                  }
                />
                <label htmlFor="planned" className="text-sm">
                  計画的な支出
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={addFinance} className="flex-1">
                  記録
                </Button>
                <Button variant="outline" onClick={() => setShowAddFinance(false)}>
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
