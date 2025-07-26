import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import {
  Brain,
  Calendar,
  DollarSign,
  Target,
  Heart,
  Zap,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Settings,
  Home,
  Activity,
  BarChart3,
  Lightbulb,
  Shield,
  Star,
  Award,
  Play,
  Pause,
  RefreshCw,
  ArrowRight,
  Eye,
  Volume2,
  Palette,
  Timer,
  BookOpen,
  Users,
  Sparkles,
  Mountain,
  Sunrise,
  Coffee,
  Moon,
} from 'lucide-react';
import { format, isToday, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';
import { RootState, AppDispatch } from '@/store';

// 認知評価結果の型定義
interface CognitiveProfile {
  id: string;
  userId: string;
  date: Date;
  verbalComprehension: number;
  perceptualReasoning: number;
  workingMemory: number;
  processingSpeed: number;
  executiveFunction: number;
  attentionalControl: number;
  sensoryProcessing: number;
  socialCognition: number;
  fullScaleIQ: number;
  adhdOptimizedScore: number;
  personalizedSettings: {
    optimalTaskDuration: number;
    preferredBreakFrequency: number;
    visualComplexityLevel: 'low' | 'medium' | 'high';
    auditoryProcessingPreference: 'minimal' | 'moderate' | 'enhanced';
    multitaskingCapacity: 'single' | 'dual' | 'multiple';
    timeStructureNeed: 'rigid' | 'flexible' | 'adaptive';
  };
  strengths: string[];
  challenges: string[];
  recommendations: string[];
}

// 統合データ型
interface IntegratedLifeData {
  cognitive: CognitiveProfile | null;
  tasks: {
    total: number;
    completed: number;
    overdue: number;
    priority: Array<{ id: string; task: string; priority: number; deadline?: string }>;
    nextAction?: { id: string; task: string; estimatedTime: number };
  };
  finance: {
    totalAssets: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
    emergencyFund: number;
    nextBill?: { name: string; amount: number; due: Date };
    weeklyBudget: { spent: number; remaining: number };
  };
  calendar: {
    todayEvents: Array<{ id: string; title: string; time: Date; type: string }>;
    upcomingDeadlines: Array<{ task: string; date: Date; priority: number }>;
    freeTime: Array<{ start: Date; end: Date; duration: number }>;
  };
  wellbeing: {
    energyLevel: number;
    stressLevel: number;
    focusLevel: number;
    moodScore: number;
    sleepQuality: number;
    lastUpdated: Date;
  };
}

// アダプティブUI設定
interface AdaptiveUIConfig {
  fontSize: 'small' | 'medium' | 'large';
  colorScheme: 'default' | 'high-contrast' | 'calm' | 'energizing';
  animationLevel: 'none' | 'minimal' | 'normal' | 'enhanced';
  informationDensity: 'sparse' | 'balanced' | 'dense';
  interactionPattern: 'tap' | 'hover' | 'focus';
  cognitiveLoadLevel: 'minimal' | 'moderate' | 'complex';
}

// スマート推奨システム
interface SmartRecommendation {
  id: string;
  title: string;
  description: string;
  action: string;
  path?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  cognitiveLoad: number; // 1-10
  energyRequired: number; // 1-10
  timeEstimate: number; // minutes
  benefit: string;
  category: 'productivity' | 'wellness' | 'finance' | 'social' | 'routine';
  adhdFriendly: boolean;
  icon: React.ReactNode;
  color: string;
}

export const ADHDIntegratedLifeHub: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const todos = useSelector((state: RootState) => state.todo.items);
  const assetEntries = useSelector((state: RootState) => state.asset.entries);
  const debtEntries = useSelector((state: RootState) => state.debt.entries);

  // 統合ライフデータ
  const [integratedData, setIntegratedData] = useState<IntegratedLifeData | null>(null);
  const [cognitiveProfile, setCognitiveProfile] = useState<CognitiveProfile | null>(null);
  const [adaptiveConfig, setAdaptiveConfig] = useState<AdaptiveUIConfig>({
    fontSize: 'medium',
    colorScheme: 'default',
    animationLevel: 'normal',
    informationDensity: 'balanced',
    interactionPattern: 'tap',
    cognitiveLoadLevel: 'moderate',
  });

  // 現在の状態
  const [currentMode, setCurrentMode] = useState<'overview' | 'focus' | 'planning' | 'emergency'>(
    'overview'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // 時間帯判定
  const currentHour = new Date().getHours();
  const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening';

  // 認知評価データの読み込み
  useEffect(() => {
    loadCognitiveProfile();
  }, []);

  // 統合データの初期化
  useEffect(() => {
    if (cognitiveProfile) {
      generateIntegratedData();
      optimizeAdaptiveUI();
    }
  }, [cognitiveProfile, todos, assetEntries, debtEntries]);

  const loadCognitiveProfile = async () => {
    try {
      // ローカルストレージから認知評価結果を読み込み
      const storedProfile = localStorage.getItem('cognitive-assessment-profile');
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        setCognitiveProfile({
          ...profile,
          date: new Date(profile.date),
        });
      } else {
        // デフォルトプロファイルを作成
        const defaultProfile: CognitiveProfile = {
          id: 'default',
          userId: 'current-user',
          date: new Date(),
          verbalComprehension: 100,
          perceptualReasoning: 105,
          workingMemory: 85,
          processingSpeed: 90,
          executiveFunction: 80,
          attentionalControl: 75,
          sensoryProcessing: 70,
          socialCognition: 95,
          fullScaleIQ: 95,
          adhdOptimizedScore: 88,
          personalizedSettings: {
            optimalTaskDuration: 25,
            preferredBreakFrequency: 15,
            visualComplexityLevel: 'medium',
            auditoryProcessingPreference: 'moderate',
            multitaskingCapacity: 'dual',
            timeStructureNeed: 'flexible',
          },
          strengths: ['創造性', '直感的思考', '問題解決', '適応性'],
          challenges: ['継続的注意', '時間管理', '優先順位付け', '感覚過敏'],
          recommendations: [
            '25分の集中セッション + 5分休憩',
            '視覚的なタスク管理ツールの活用',
            '感覚過敏に配慮した環境調整',
            'ルーティンの構造化',
          ],
        };
        setCognitiveProfile(defaultProfile);
        localStorage.setItem('cognitive-assessment-profile', JSON.stringify(defaultProfile));
      }
    } catch (error) {
      console.error('認知プロファイル読み込みエラー:', error);
      toast.error('認知評価データの読み込みに失敗しました');
    }
  };

  const generateIntegratedData = useCallback(() => {
    if (!cognitiveProfile) return;

    try {
      // タスクデータの統合
      const completedTasks = todos.filter((todo) => todo.completed);
      const overdueTasks = todos.filter(
        (todo) => todo.deadline && new Date(todo.deadline) < new Date() && !todo.completed
      );
      const priorityTasks = todos
        .filter((todo) => !todo.completed && todo.priority >= 4)
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 3);

      // 次のアクション（認知能力に基づく推奨）
      const nextAction = priorityTasks.find((task) => {
        const estimatedTime = task.estimatedDuration || 30;
        return estimatedTime <= cognitiveProfile.personalizedSettings.optimalTaskDuration;
      });

      // 財務データの統合
      const totalAssets = assetEntries.reduce((sum, entry) => sum + entry.value, 0);
      const totalDebts = debtEntries.reduce((sum, entry) => sum + entry.value, 0);
      const netWorth = totalAssets - totalDebts;

      // 今日のイベント（統合カレンダー）
      const today = new Date();
      const todayEvents = [
        ...todos
          .filter((todo) => todo.deadline && isToday(new Date(todo.deadline)))
          .map((todo) => ({
            id: todo._id,
            title: todo.task,
            time: new Date(todo.deadline!),
            type: 'task',
          })),
      ];

      // 空き時間の計算
      const freeTimeSlots = calculateFreeTime(todayEvents, cognitiveProfile);

      const integrated: IntegratedLifeData = {
        cognitive: cognitiveProfile,
        tasks: {
          total: todos.length,
          completed: completedTasks.length,
          overdue: overdueTasks.length,
          priority: priorityTasks.map((task) => ({
            id: task._id,
            task: task.task,
            priority: task.priority,
            deadline: task.deadline,
          })),
          nextAction: nextAction
            ? {
                id: nextAction._id,
                task: nextAction.task,
                estimatedTime: nextAction.estimatedDuration || 30,
              }
            : undefined,
        },
        finance: {
          totalAssets,
          monthlyIncome: 0, // TODO: 実装
          monthlyExpenses: 0, // TODO: 実装
          savingsRate: 0, // TODO: 実装
          emergencyFund: totalAssets * 0.1, // 簡易計算
          weeklyBudget: { spent: 0, remaining: 0 }, // TODO: 実装
        },
        calendar: {
          todayEvents,
          upcomingDeadlines: todos
            .filter((todo) => todo.deadline && new Date(todo.deadline) > today)
            .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
            .slice(0, 5)
            .map((todo) => ({
              task: todo.task,
              date: new Date(todo.deadline!),
              priority: todo.priority,
            })),
          freeTime: freeTimeSlots,
        },
        wellbeing: {
          energyLevel: 7, // TODO: 実装
          stressLevel: 4, // TODO: 実装
          focusLevel: 6, // TODO: 実装
          moodScore: 7, // TODO: 実装
          sleepQuality: 8, // TODO: 実装
          lastUpdated: new Date(),
        },
      };

      setIntegratedData(integrated);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('統合データ生成エラー:', error);
      toast.error('データの統合に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [cognitiveProfile, todos, assetEntries, debtEntries]);

  const calculateFreeTime = (events: any[], profile: CognitiveProfile) => {
    // 簡易的な空き時間計算
    const workHours = [9, 10, 11, 14, 15, 16, 17]; // 仕事時間
    const freeSlots = workHours
      .filter((hour) => !events.some((event) => event.time.getHours() === hour))
      .map((hour) => ({
        start: new Date(new Date().setHours(hour, 0, 0, 0)),
        end: new Date(new Date().setHours(hour + 1, 0, 0, 0)),
        duration: 60,
      }));

    return freeSlots;
  };

  const optimizeAdaptiveUI = () => {
    if (!cognitiveProfile) return;

    const config: AdaptiveUIConfig = {
      fontSize:
        cognitiveProfile.visualComplexityLevel === 'low'
          ? 'large'
          : cognitiveProfile.visualComplexityLevel === 'high'
            ? 'small'
            : 'medium',
      colorScheme: cognitiveProfile.sensoryProcessing < 80 ? 'calm' : 'default',
      animationLevel: cognitiveProfile.sensoryProcessing < 70 ? 'minimal' : 'normal',
      informationDensity: cognitiveProfile.workingMemory < 90 ? 'sparse' : 'balanced',
      interactionPattern: 'tap',
      cognitiveLoadLevel: cognitiveProfile.executiveFunction < 85 ? 'minimal' : 'moderate',
    };

    setAdaptiveConfig(config);
  };

  const generateSmartRecommendations = useMemo((): SmartRecommendation[] => {
    if (!integratedData || !cognitiveProfile) return [];

    const recommendations: SmartRecommendation[] = [];

    // エネルギーレベルに基づく推奨
    if (integratedData.wellbeing.energyLevel >= 8) {
      recommendations.push({
        id: 'high-energy-task',
        title: '重要プロジェクトに集中',
        description: 'エネルギーが高い今こそ、難しいタスクに取り組むチャンスです',
        action: '開始する',
        path: '/adhd-task-manager',
        priority: 'high',
        cognitiveLoad: 8,
        energyRequired: 8,
        timeEstimate: cognitiveProfile.personalizedSettings.optimalTaskDuration,
        benefit: '大きな成果と達成感',
        category: 'productivity',
        adhdFriendly: true,
        icon: <Target className="h-5 w-5" />,
        color: 'bg-red-50 text-red-700 border-red-200',
      });
    }

    // 財務管理の推奨
    if (integratedData.finance.totalAssets > 0) {
      recommendations.push({
        id: 'financial-review',
        title: '週次資産確認',
        description: '資産状況を確認し、今週の支出をチェックしましょう',
        action: '確認する',
        path: '/asset-liability-report',
        priority: 'medium',
        cognitiveLoad: 4,
        energyRequired: 3,
        timeEstimate: 10,
        benefit: '財務安心感の向上',
        category: 'finance',
        adhdFriendly: true,
        icon: <DollarSign className="h-5 w-5" />,
        color: 'bg-green-50 text-green-700 border-green-200',
      });
    }

    // 認知評価に基づく推奨
    if (cognitiveProfile.attentionalControl < 80) {
      recommendations.push({
        id: 'focus-session',
        title: '集中力強化セッション',
        description: '短時間の集中練習で注意力を向上させましょう',
        action: '開始する',
        path: '/adhd-cognitive-assessment',
        priority: 'medium',
        cognitiveLoad: 6,
        energyRequired: 5,
        timeEstimate: 15,
        benefit: '注意力の向上',
        category: 'wellness',
        adhdFriendly: true,
        icon: <Brain className="h-5 w-5" />,
        color: 'bg-purple-50 text-purple-700 border-purple-200',
      });
    }

    return recommendations;
  }, [integratedData, cognitiveProfile]);

  const handleRecommendationAction = (recommendation: SmartRecommendation) => {
    if (recommendation.path) {
      navigate(recommendation.path);
    }
    toast.success(`${recommendation.title}を開始しました`);
  };

  const handleEmergencyMode = () => {
    setCurrentMode('emergency');
    toast.success('緊急サポートモードを有効にしました');
  };

  const syncAllData = async () => {
    setIsLoading(true);
    try {
      await generateIntegratedData();
      toast.success('すべてのデータを同期しました');
    } catch (error) {
      toast.error('同期に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !integratedData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">統合ライフデータを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 
      ${adaptiveConfig.fontSize === 'large' ? 'text-lg' : adaptiveConfig.fontSize === 'small' ? 'text-sm' : 'text-base'}
      ${adaptiveConfig.colorScheme === 'high-contrast' ? 'contrast-125' : ''}
      ${adaptiveConfig.colorScheme === 'calm' ? 'saturate-75' : ''}
    `}
    >
      {/* ヘッダー */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-600" />
              ADHD統合ライフハブ
            </h1>
            <p className="text-gray-600 mt-2">
              認知特性に最適化された、あなただけのライフマネジメントシステム
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={syncAllData}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              同期
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleEmergencyMode}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              緊急サポート
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/adhd-cognitive-assessment')}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              認知設定
            </Button>
          </div>
        </div>

        {/* 認知プロファイル概要 */}
        <div className="mt-4 p-4 bg-white/60 backdrop-blur-sm rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span className="font-medium">認知プロファイル: </span>
                <Badge variant="secondary">{cognitiveProfile?.adhdOptimizedScore}点</Badge>
              </div>
              <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-600">
                <span>
                  最適タスク時間: {cognitiveProfile?.personalizedSettings.optimalTaskDuration}分
                </span>
                <span>
                  休憩頻度: {cognitiveProfile?.personalizedSettings.preferredBreakFrequency}分
                </span>
              </div>
            </div>
            <span className="text-sm text-gray-500">
              最終更新: {format(lastSyncTime, 'HH:mm', { locale: ja })}
            </span>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto">
        <Tabs
          value={currentMode}
          onValueChange={(value) => setCurrentMode(value as any)}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              概要
            </TabsTrigger>
            <TabsTrigger value="focus" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              集中
            </TabsTrigger>
            <TabsTrigger value="planning" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              計画
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              緊急
            </TabsTrigger>
          </TabsList>

          {/* 概要タブ */}
          <TabsContent value="overview" className="space-y-6">
            {/* 今日の状況概要 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">完了済みタスク</p>
                      <p className="text-2xl font-bold text-green-600">
                        {integratedData.tasks.completed}
                      </p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <Progress
                    value={(integratedData.tasks.completed / integratedData.tasks.total) * 100}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">純資産</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ¥{integratedData.finance.totalAssets.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    緊急資金: ¥{integratedData.finance.emergencyFund.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">エネルギーレベル</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {integratedData.wellbeing.energyLevel}/10
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-orange-600" />
                  </div>
                  <Progress value={integratedData.wellbeing.energyLevel * 10} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">今日の予定</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {integratedData.calendar.todayEvents.length}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    空き時間: {integratedData.calendar.freeTime.length}スロット
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* スマート推奨 */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  AI推奨アクション
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generateSmartRecommendations.slice(0, 6).map((rec) => (
                    <div
                      key={rec.id}
                      className={`p-4 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${rec.color}`}
                      onClick={() => handleRecommendationAction(rec)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {rec.icon}
                          <h3 className="font-medium text-sm">{rec.title}</h3>
                        </div>
                        <Badge
                          variant={
                            rec.priority === 'high'
                              ? 'destructive'
                              : rec.priority === 'medium'
                                ? 'default'
                                : 'secondary'
                          }
                          className="text-xs"
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-xs mb-2 opacity-80">{rec.description}</p>
                      <div className="flex items-center justify-between text-xs opacity-70">
                        <span>{rec.timeEstimate}分</span>
                        <span>負荷: {rec.cognitiveLoad}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 次のアクション */}
            {integratedData.tasks.nextAction && (
              <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-blue-600" />
                    推奨次アクション
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-lg">
                        {integratedData.tasks.nextAction.task}
                      </h3>
                      <p className="text-sm text-gray-600">
                        推定時間: {integratedData.tasks.nextAction.estimatedTime}分
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate('/adhd-task-manager')}
                      className="flex items-center gap-2"
                    >
                      開始する
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 集中タブ */}
          <TabsContent value="focus" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-600" />
                  集中モード
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  認知プロファイルに基づいた最適な集中環境を設定します
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => navigate('/adhd-task-manager')}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                  >
                    <Timer className="h-6 w-6" />
                    ポモドーロ開始
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/adhd-cognitive-assessment')}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                  >
                    <Brain className="h-6 w-6" />
                    認知トレーニング
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/impulse-control')}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                  >
                    <Shield className="h-6 w-6" />
                    衝動制御練習
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 計画タブ */}
          <TabsContent value="planning" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    今日の予定
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {integratedData.calendar.todayEvents.length > 0 ? (
                      integratedData.calendar.todayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="font-medium">{event.title}</span>
                          <span className="text-sm text-gray-600">
                            {format(event.time, 'HH:mm', { locale: ja })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">今日の予定はありません</p>
                    )}
                  </div>
                  <Button className="w-full mt-4" onClick={() => navigate('/calendar')}>
                    カレンダーを開く
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    週次目標
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>タスク完了率</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>貯金目標</span>
                        <span>60%</span>
                      </div>
                      <Progress value={60} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>ウェルビーング</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 緊急タブ */}
          <TabsContent value="emergency" className="space-y-6">
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  緊急サポートシステム
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-red-600">ADHD/ASDクライシス時の即座サポートシステムです</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="destructive"
                    className="h-16 flex flex-col items-center justify-center gap-2"
                    onClick={() => navigate('/impulse-control')}
                  >
                    <Shield className="h-6 w-6" />
                    衝動制御緊急支援
                  </Button>
                  <Button
                    variant="destructive"
                    className="h-16 flex flex-col items-center justify-center gap-2"
                    onClick={() => navigate('/adhd-support')}
                  >
                    <Heart className="h-6 w-6" />
                    感情調整支援
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center gap-2"
                    onClick={() => navigate('/adhd-cognitive-assessment')}
                  >
                    <Brain className="h-6 w-6" />
                    認知リセット
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center gap-2"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent('openLifeSupportBot', {
                          detail: { action: 'emergency' },
                        })
                      )
                    }
                  >
                    <Users className="h-6 w-6" />
                    AIサポート
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
