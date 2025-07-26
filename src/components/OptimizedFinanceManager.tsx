/**
 * 💰 最適化財務マネージャー
 * 認知特性に基づく個人最適化資産管理システム
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Zap,
  Target,
  Clock,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Calendar,
  CreditCard,
  Wallet,
  Smartphone,
  Building,
  ShoppingCart,
  Car,
  Home,
  Utensils,
  Gamepad2,
  Heart,
  GraduationCap,
  Coffee,
  Gift,
  Lightbulb,
  Shield,
  X,
  Save,
  Edit,
  Filter,
  Settings,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import CognitiveIntegrationService from '@/services/cognitive/CognitiveIntegrationService';

// 最適化された金融取引型
interface OptimizedTransaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  description: string;
  date: Date;

  // 認知・心理分析
  emotionalTrigger?:
    | 'stress'
    | 'impulse'
    | 'boredom'
    | 'celebration'
    | 'necessity'
    | 'social_pressure';
  energyLevel: number; // 1-10 取引時のエネルギーレベル
  cognitiveLoad: number; // 1-10 取引の複雑さ
  adhdImpact: 'helpful' | 'neutral' | 'harmful';

  // 計画・時間
  isPlanned: boolean;
  timeSpentMinutes: number;
  paymentMethod: 'cash' | 'card' | 'digital' | 'bank_transfer';
  location?: string;

  // 衝動制御支援
  impulsePrevention?: {
    waitTimeMinutes: number;
    alternativeActions: string[];
    finalDecision: 'proceed' | 'delay' | 'cancel';
    reflectionNotes?: string;
  };

  // 最適化
  isOptimizedTransaction: boolean;
  optimizationSuggestions: string[];
  automationLevel: 'manual' | 'assisted' | 'automatic';

  // メタデータ
  tags: string[];
  relatedGoalId?: string;
  recurringTransactionId?: string;
  notes?: string;
}

interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: string;
  priority: 'low' | 'medium' | 'high';
  cognitiveStrategy: 'visual' | 'automatic' | 'social';
  milestones: { amount: number; date: Date; achieved: boolean }[];
  motivationTriggers: string[];
}

interface BudgetCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  monthlyBudget: number;
  currentSpent: number;
  cognitiveComplexity: 'simple' | 'moderate' | 'complex';
  automationLevel: number; // 0-100%
  adhdFriendly: boolean;
}

interface CognitiveFinanceSettings {
  visualSimplification: boolean;
  autoExpenseTracking: boolean;
  impulsePrevention: boolean;
  lowCognitiveMode: boolean;
  budgetAlerts: boolean;
  socialSupport: boolean;
  gamification: boolean;
}

export const OptimizedFinanceManager: React.FC = () => {
  // Core state
  const [transactions, setTransactions] = useState<OptimizedTransaction[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [cognitiveService] = useState(() => new CognitiveIntegrationService());

  // Settings
  const [cognitiveSettings, setCognitiveSettings] = useState<CognitiveFinanceSettings>({
    visualSimplification: true,
    autoExpenseTracking: false,
    impulsePrevention: true,
    lowCognitiveMode: true,
    budgetAlerts: true,
    socialSupport: false,
    gamification: true,
  });

  // UI state
  const [currentPeriod, setCurrentPeriod] = useState(new Date());
  const [viewMode, setViewMode] = useState<'simple' | 'detailed' | 'analytics'>('simple');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<OptimizedTransaction | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form state
  const [newTransaction, setNewTransaction] = useState<Partial<OptimizedTransaction>>({});
  const [currentEnergyLevel, setCurrentEnergyLevel] = useState(7);

  // Initialize data
  useEffect(() => {
    const initializeFinanceData = async () => {
      // デモ予算カテゴリ
      const demoBudgetCategories: BudgetCategory[] = [
        {
          id: 'food',
          name: '食費',
          icon: <Utensils className="h-4 w-4" />,
          monthlyBudget: 40000,
          currentSpent: 32000,
          cognitiveComplexity: 'simple',
          automationLevel: 30,
          adhdFriendly: true,
        },
        {
          id: 'transport',
          name: '交通費',
          icon: <Car className="h-4 w-4" />,
          monthlyBudget: 15000,
          currentSpent: 12000,
          cognitiveComplexity: 'simple',
          automationLevel: 80,
          adhdFriendly: true,
        },
        {
          id: 'entertainment',
          name: '娯楽',
          icon: <Gamepad2 className="h-4 w-4" />,
          monthlyBudget: 20000,
          currentSpent: 25000,
          cognitiveComplexity: 'complex',
          automationLevel: 10,
          adhdFriendly: false,
        },
        {
          id: 'health',
          name: '医療・健康',
          icon: <Heart className="h-4 w-4" />,
          monthlyBudget: 10000,
          currentSpent: 8000,
          cognitiveComplexity: 'moderate',
          automationLevel: 50,
          adhdFriendly: true,
        },
        {
          id: 'education',
          name: '学習・自己投資',
          icon: <GraduationCap className="h-4 w-4" />,
          monthlyBudget: 15000,
          currentSpent: 12000,
          cognitiveComplexity: 'moderate',
          automationLevel: 60,
          adhdFriendly: true,
        },
      ];

      // サンプル取引データ
      const sampleTransactions: OptimizedTransaction[] = [
        {
          id: '1',
          amount: 50000,
          type: 'income',
          category: '給与',
          description: '月給（12月分）',
          date: new Date(2024, 11, 15),
          emotionalTrigger: 'necessity',
          energyLevel: 8,
          cognitiveLoad: 2,
          adhdImpact: 'helpful',
          isPlanned: true,
          timeSpentMinutes: 0,
          paymentMethod: 'bank_transfer',
          isOptimizedTransaction: true,
          optimizationSuggestions: ['自動積立設定で貯蓄を増やしましょう'],
          automationLevel: 'automatic',
          tags: ['salary', 'monthly', 'regular'],
        },
        {
          id: '2',
          amount: -1200,
          type: 'expense',
          category: 'food',
          description: 'コンビニ昼食',
          date: new Date(2024, 11, 18, 12, 30),
          emotionalTrigger: 'necessity',
          energyLevel: 6,
          cognitiveLoad: 3,
          adhdImpact: 'neutral',
          isPlanned: true,
          timeSpentMinutes: 10,
          paymentMethod: 'card',
          isOptimizedTransaction: true,
          optimizationSuggestions: ['お弁当作りで節約できます'],
          automationLevel: 'manual',
          tags: ['food', 'lunch', 'convenience'],
        },
        {
          id: '3',
          amount: -3500,
          type: 'expense',
          category: 'entertainment',
          description: 'ゲーム課金（衝動購入）',
          date: new Date(2024, 11, 17, 22, 15),
          emotionalTrigger: 'stress',
          energyLevel: 3,
          cognitiveLoad: 8,
          adhdImpact: 'harmful',
          isPlanned: false,
          timeSpentMinutes: 5,
          paymentMethod: 'digital',
          impulsePrevention: {
            waitTimeMinutes: 0,
            alternativeActions: ['散歩', '音楽聴く', '友人に連絡'],
            finalDecision: 'proceed',
            reflectionNotes: 'ストレスが高かった。次回は24時間待つ',
          },
          isOptimizedTransaction: false,
          optimizationSuggestions: [
            '衝動購入防止：24時間待機ルールを設定',
            'ストレス対処：代替活動リストを活用',
            '予算管理：娯楽費の月次制限を設定',
          ],
          automationLevel: 'manual',
          tags: ['impulse', 'stress', 'digital', 'gaming'],
        },
        {
          id: '4',
          amount: -8000,
          type: 'expense',
          category: 'health',
          description: '病院受診（定期検診）',
          date: new Date(2024, 11, 16, 14, 0),
          emotionalTrigger: 'necessity',
          energyLevel: 5,
          cognitiveLoad: 6,
          adhdImpact: 'helpful',
          isPlanned: true,
          timeSpentMinutes: 120,
          paymentMethod: 'cash',
          isOptimizedTransaction: true,
          optimizationSuggestions: ['定期検診は健康投資として重要'],
          automationLevel: 'assisted',
          tags: ['health', 'medical', 'preventive'],
        },
      ];

      // 財務データを認知特性に基づいて最適化
      const optimizedTransactions = sampleTransactions.map((transaction) => {
        const optimized = cognitiveService.optimizeFinanceView('demo-user', transaction);
        return { ...transaction, ...optimized };
      });

      setTransactions(optimizedTransactions);
      setBudgetCategories(demoBudgetCategories);

      // サンプル目標
      setGoals([
        {
          id: '1',
          title: '緊急資金（3ヶ月分）',
          targetAmount: 300000,
          currentAmount: 180000,
          deadline: new Date(2025, 5, 30),
          category: '貯蓄',
          priority: 'high',
          cognitiveStrategy: 'automatic',
          milestones: [
            { amount: 100000, date: new Date(2024, 11, 31), achieved: true },
            { amount: 200000, date: new Date(2025, 2, 31), achieved: false },
            { amount: 300000, date: new Date(2025, 5, 30), achieved: false },
          ],
          motivationTriggers: ['安心感', '将来への備え', '自立'],
        },
      ]);
    };

    initializeFinanceData();
  }, [cognitiveService]);

  // 現在期間の取引データ
  const currentPeriodTransactions = useMemo(() => {
    const start = startOfMonth(currentPeriod);
    const end = endOfMonth(currentPeriod);

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= start && transactionDate <= end;
    });
  }, [transactions, currentPeriod]);

  // 統計計算
  const financialStats = useMemo(() => {
    const income = currentPeriodTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = currentPeriodTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const plannedExpenses = currentPeriodTransactions
      .filter((t) => t.type === 'expense' && t.isPlanned)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const impulseExpenses = currentPeriodTransactions
      .filter((t) => t.type === 'expense' && !t.isPlanned)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const harmfulTransactions = currentPeriodTransactions.filter(
      (t) => t.adhdImpact === 'harmful'
    ).length;

    const averageCognitiveLoad =
      currentPeriodTransactions.length > 0
        ? currentPeriodTransactions.reduce((sum, t) => sum + t.cognitiveLoad, 0) /
          currentPeriodTransactions.length
        : 0;

    return {
      income,
      expenses,
      balance: income - expenses,
      plannedExpenseRatio: expenses > 0 ? (plannedExpenses / expenses) * 100 : 0,
      impulseExpenses,
      harmfulTransactions,
      averageCognitiveLoad,
      optimizedTransactions: currentPeriodTransactions.filter((t) => t.isOptimizedTransaction)
        .length,
    };
  }, [currentPeriodTransactions]);

  // 認知負荷に基づく表示最適化
  const getOptimizedView = useCallback(() => {
    if (cognitiveSettings.lowCognitiveMode) {
      return {
        maxCategories: 5,
        maxTransactions: 10,
        showComplexCharts: false,
        useSimpleLanguage: true,
        highlightImportant: true,
      };
    }
    return {
      maxCategories: 10,
      maxTransactions: 50,
      showComplexCharts: true,
      useSimpleLanguage: false,
      highlightImportant: false,
    };
  }, [cognitiveSettings.lowCognitiveMode]);

  const optimizedView = getOptimizedView();

  // 衝動購入防止チェック
  const checkImpulsePrevention = useCallback(
    (amount: number, category: string) => {
      if (!cognitiveSettings.impulsePrevention) return { shouldPrevent: false, message: '' };

      // 高額支出の場合
      if (amount > 5000) {
        return {
          shouldPrevent: true,
          message: '高額支出です。24時間待機してから再検討しませんか？',
          waitTime: 24 * 60, // 24時間
          alternatives: ['散歩する', '友人に相談する', '一晩考える'],
        };
      }

      // 娯楽費が予算超過の場合
      const entertainmentCategory = budgetCategories.find((c) => c.id === 'entertainment');
      if (
        category === 'entertainment' &&
        entertainmentCategory &&
        entertainmentCategory.currentSpent >= entertainmentCategory.monthlyBudget
      ) {
        return {
          shouldPrevent: true,
          message: '娯楽費が予算を超過しています。代替活動を検討しませんか？',
          waitTime: 60, // 1時間
          alternatives: ['無料の娯楽を探す', '来月まで待つ', '予算を見直す'],
        };
      }

      return { shouldPrevent: false, message: '' };
    },
    [cognitiveSettings.impulsePrevention, budgetCategories]
  );

  // 取引追加
  const addTransaction = useCallback(() => {
    if (!newTransaction.amount || !newTransaction.description) return;

    const amount =
      newTransaction.type === 'expense' ? -Math.abs(newTransaction.amount) : newTransaction.amount;

    // 衝動購入防止チェック
    if (newTransaction.type === 'expense') {
      const prevention = checkImpulsePrevention(Math.abs(amount), newTransaction.category || '');
      if (prevention.shouldPrevent && !confirm(`${prevention.message}\n続行しますか？`)) {
        return;
      }
    }

    const transaction: OptimizedTransaction = {
      id: Date.now().toString(),
      amount,
      type: newTransaction.type || 'expense',
      category: newTransaction.category || 'other',
      description: newTransaction.description,
      date: newTransaction.date ? new Date(newTransaction.date) : new Date(),
      emotionalTrigger: newTransaction.emotionalTrigger,
      energyLevel: currentEnergyLevel,
      cognitiveLoad: newTransaction.cognitiveLoad || 5,
      adhdImpact: newTransaction.adhdImpact || 'neutral',
      isPlanned: newTransaction.isPlanned || false,
      timeSpentMinutes: newTransaction.timeSpentMinutes || 5,
      paymentMethod: newTransaction.paymentMethod || 'card',
      isOptimizedTransaction: true,
      optimizationSuggestions: [],
      automationLevel: 'manual',
      tags: newTransaction.tags || [],
    };

    // 認知最適化を適用
    const optimizedTransaction = cognitiveService.optimizeFinanceView('demo-user', transaction);

    setTransactions((prev) => [...prev, { ...transaction, ...optimizedTransaction }]);
    setNewTransaction({});
    setShowAddTransaction(false);
  }, [newTransaction, currentEnergyLevel, cognitiveService, checkImpulsePrevention]);

  // カテゴリ色取得
  const getCategoryColor = (categoryId: string) => {
    const colors = {
      food: 'bg-green-100 text-green-800',
      transport: 'bg-blue-100 text-blue-800',
      entertainment: 'bg-purple-100 text-purple-800',
      health: 'bg-red-100 text-red-800',
      education: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[categoryId as keyof typeof colors] || colors.other;
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <DollarSign className="h-8 w-8" />
              認知最適化財務マネージャー
            </h1>
            <p className="text-green-100">ADHD/ASD特性に基づく個人最適化資産管理</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setCognitiveSettings((prev) => ({
                  ...prev,
                  lowCognitiveMode: !prev.lowCognitiveMode,
                }))
              }
              className={`${cognitiveSettings.lowCognitiveMode ? 'bg-white text-green-600' : ''}`}
            >
              <Brain className="h-4 w-4 mr-2" />
              {cognitiveSettings.lowCognitiveMode ? '簡易表示' : '詳細表示'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowAddTransaction(true)}>
              <Plus className="h-4 w-4" />
              支出記録
            </Button>
          </div>
        </div>

        {/* 財務サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-300" />
              <span className="text-sm text-green-100">収入</span>
            </div>
            <div className="text-2xl font-bold">+{financialStats.income.toLocaleString()}円</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-red-300" />
              <span className="text-sm text-green-100">支出</span>
            </div>
            <div className="text-2xl font-bold">-{financialStats.expenses.toLocaleString()}円</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-blue-300" />
              <span className="text-sm text-green-100">収支</span>
            </div>
            <div
              className={`text-2xl font-bold ${financialStats.balance >= 0 ? 'text-green-200' : 'text-red-200'}`}
            >
              {financialStats.balance >= 0 ? '+' : ''}
              {financialStats.balance.toLocaleString()}円
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-purple-300" />
              <span className="text-sm text-green-100">最適化率</span>
            </div>
            <div className="text-2xl font-bold">
              {Math.round(
                (financialStats.optimizedTransactions /
                  Math.max(currentPeriodTransactions.length, 1)) *
                  100
              )}
              %
            </div>
          </div>
        </div>
      </div>

      {/* 認知負荷アラート */}
      {financialStats.averageCognitiveLoad > 7 && (
        <Alert>
          <Brain className="h-4 w-4" />
          <AlertDescription>
            財務取引の認知負荷が高めです。自動化機能の活用をお勧めします。
          </AlertDescription>
        </Alert>
      )}

      {/* 衝動支出アラート */}
      {financialStats.impulseExpenses > 5000 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            今月の衝動支出が{financialStats.impulseExpenses.toLocaleString()}円です。
            衝動購入防止機能を有効化することをお勧めします。
          </AlertDescription>
        </Alert>
      )}

      {/* 期間ナビゲーション */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setCurrentPeriod(subMonths(currentPeriod, 1))}>
            <ArrowDown className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {format(currentPeriod, 'yyyy年M月', { locale: ja })}
          </h2>
          <Button variant="outline" onClick={() => setCurrentPeriod(addMonths(currentPeriod, 1))}>
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentPeriod(new Date())}>
            今月
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'simple' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('simple')}
          >
            シンプル
          </Button>
          <Button
            variant={viewMode === 'detailed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('detailed')}
          >
            詳細
          </Button>
        </div>
      </div>

      {/* 予算カテゴリー */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetCategories.slice(0, optimizedView.maxCategories).map((category) => {
          const usagePercentage = (category.currentSpent / category.monthlyBudget) * 100;
          const isOverBudget = usagePercentage > 100;

          return (
            <Card key={category.id} className={`${isOverBudget ? 'border-red-200' : ''}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {category.icon}
                    <span>{category.name}</span>
                  </div>
                  {category.adhdFriendly && (
                    <Badge variant="outline" className="text-xs">
                      ADHD配慮
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">使用額</span>
                  <span className={`font-medium ${isOverBudget ? 'text-red-600' : ''}`}>
                    {category.currentSpent.toLocaleString()}円
                  </span>
                </div>

                <Progress
                  value={Math.min(usagePercentage, 100)}
                  className={`h-2 ${isOverBudget ? 'bg-red-100' : ''}`}
                />

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>予算: {category.monthlyBudget.toLocaleString()}円</span>
                  <span>{Math.round(usagePercentage)}%</span>
                </div>

                {category.automationLevel > 0 && (
                  <div className="text-xs text-blue-600">
                    自動化レベル: {category.automationLevel}%
                  </div>
                )}

                {isOverBudget && (
                  <Alert className="p-2">
                    <AlertTriangle className="h-3 w-3" />
                    <AlertDescription className="text-xs">
                      予算を{Math.round(usagePercentage - 100)}%超過しています
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 最近の取引 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>最近の取引</span>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-sm border rounded px-2 py-1"
                aria-label="カテゴリフィルター"
              >
                <option value="all">全カテゴリ</option>
                {budgetCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentPeriodTransactions
              .filter((t) => selectedCategory === 'all' || t.category === selectedCategory)
              .slice(0, optimizedView.maxTransactions)
              .map((transaction) => (
                <div
                  key={transaction.id}
                  className={`p-3 rounded-lg border ${
                    transaction.adhdImpact === 'harmful'
                      ? 'border-red-200 bg-red-50'
                      : transaction.adhdImpact === 'helpful'
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{transaction.description}</h4>
                        {transaction.isOptimizedTransaction && (
                          <Sparkles className="h-3 w-3 text-purple-500" />
                        )}
                        {!transaction.isPlanned && (
                          <Badge variant="outline" className="text-xs text-orange-600">
                            衝動
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                        <span>{format(new Date(transaction.date), 'M/d HH:mm')}</span>
                        <Badge className={getCategoryColor(transaction.category)}>
                          {transaction.category}
                        </Badge>
                        {cognitiveSettings.lowCognitiveMode && transaction.cognitiveLoad > 7 && (
                          <Badge variant="outline" className="text-orange-600">
                            複雑
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-bold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : ''}
                        {transaction.amount.toLocaleString()}円
                      </div>
                      {transaction.energyLevel <= 3 && transaction.type === 'expense' && (
                        <div className="text-xs text-orange-600">低エネルギー時</div>
                      )}
                    </div>
                  </div>

                  {/* 最適化提案 */}
                  {transaction.optimizationSuggestions.length > 0 && viewMode === 'detailed' && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                      <div className="text-blue-700 font-medium">💡 最適化提案:</div>
                      <ul className="text-blue-600 mt-1">
                        {transaction.optimizationSuggestions
                          .slice(0, 2)
                          .map((suggestion, index) => (
                            <li key={index}>• {suggestion}</li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* 支出記録モーダル */}
      {showAddTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>支出を記録</span>
                <Button variant="ghost" size="sm" onClick={() => setShowAddTransaction(false)}>
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
                    setNewTransaction((prev) => ({
                      ...prev,
                      amount: parseInt(e.target.value) || 0,
                    }))
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">カテゴリ</label>
                  <select
                    value={newTransaction.category || 'food'}
                    onChange={(e) =>
                      setNewTransaction((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full border rounded px-3 py-2"
                    aria-label="支出カテゴリ"
                  >
                    {budgetCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">支払方法</label>
                  <select
                    value={newTransaction.paymentMethod || 'card'}
                    onChange={(e) =>
                      setNewTransaction((prev) => ({
                        ...prev,
                        paymentMethod: e.target.value as any,
                      }))
                    }
                    className="w-full border rounded px-3 py-2"
                    aria-label="支払方法"
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
                  value={newTransaction.emotionalTrigger || 'necessity'}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      emotionalTrigger: e.target.value as any,
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                  aria-label="感情トリガー"
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
                  checked={newTransaction.isPlanned || false}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({ ...prev, isPlanned: e.target.checked }))
                  }
                />
                <label htmlFor="planned" className="text-sm">
                  計画的な支出
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={addTransaction} className="flex-1">
                  記録
                </Button>
                <Button variant="outline" onClick={() => setShowAddTransaction(false)}>
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

export default OptimizedFinanceManager;
