import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import {
  Sun,
  Moon,
  Coffee,
  Battery,
  Zap,
  Brain,
  Heart,
  Star,
  Target,
  CheckCircle2,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  Smile,
  Award,
  Sparkles,
  Play,
  Pause,
  ArrowRight,
  Plus,
  Eye,
  Volume2,
  Thermometer,
  Activity,
  BarChart3,
  Timer,
  Lightbulb,
  Shield,
  Home,
  Users,
  BookOpen,
  Gamepad2,
  Music,
  Camera,
  Headphones,
  Palette,
  Mountain,
  Waves,
  Flower,
  Rainbow,
  Flame,
  Snowflake,
  Sunrise,
  Sunset,
  CloudRain,
  Wind,
  Leaf,
  TreePine,
  Feather,
  Fish,
  Bird,
  Cat,
  Dog,
  Rabbit,
  Turtle,
} from 'lucide-react';
import { format, isToday, addHours, differenceInHours } from 'date-fns';
import { ja } from 'date-fns/locale';

// ADHD/ASD状態管理の型定義
interface PersonalState {
  energy: {
    current: number; // 0-10
    optimal: number;
    trend: 'rising' | 'stable' | 'falling';
    lastUpdated: Date;
  };
  focus: {
    level: number; // 0-10
    duration: number; // 分
    sessionType: 'deep' | 'light' | 'break' | 'hyperfocus';
  };
  mood: {
    level: number; // 0-10
    dominant: 'excited' | 'calm' | 'anxious' | 'motivated' | 'overwhelmed' | 'content';
    triggers: string[];
  };
  sensory: {
    overload: number; // 0-10
    preferences: {
      sound: 'quiet' | 'ambient' | 'music';
      light: 'dim' | 'natural' | 'bright';
      activity: 'calm' | 'moderate' | 'stimulating';
    };
  };
  executive: {
    taskInitiation: number; // 0-10
    workingMemory: number; // 0-10
    flexibility: number; // 0-10
    inhibition: number; // 0-10
  };
}

interface SmartRecommendation {
  id: string;
  title: string;
  description: string;
  action: string;
  path?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timeRequired: number; // 分
  energyCost: number; // 1-10
  benefit: string;
  icon: React.ReactNode;
  color: string;
  category: 'productivity' | 'wellness' | 'social' | 'creative' | 'routine';
}

interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface EncouragementMessage {
  id: string;
  message: string;
  context:
    | 'morning'
    | 'afternoon'
    | 'evening'
    | 'low-energy'
    | 'high-energy'
    | 'achievement'
    | 'struggle';
  tone: 'encouraging' | 'understanding' | 'celebrating' | 'gentle' | 'motivating';
  adhdPositive: boolean; // ADHD特性を肯定的に捉えたメッセージ
}

export const ADHDSmartHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 個人状態管理
  const [personalState, setPersonalState] = useState<PersonalState>({
    energy: {
      current: 7,
      optimal: 8,
      trend: 'stable',
      lastUpdated: new Date(),
    },
    focus: {
      level: 6,
      duration: 25,
      sessionType: 'light',
    },
    mood: {
      level: 7,
      dominant: 'motivated',
      triggers: ['morning_routine_completed'],
    },
    sensory: {
      overload: 3,
      preferences: {
        sound: 'ambient',
        light: 'natural',
        activity: 'moderate',
      },
    },
    executive: {
      taskInitiation: 6,
      workingMemory: 7,
      flexibility: 8,
      inhibition: 5,
    },
  });

  // 今日の進捗データ
  const [todayProgress, setTodayProgress] = useState({
    tasksCompleted: 3,
    totalTasks: 8,
    energyPoints: 15,
    focusMinutes: 120,
    wellnessScore: 8.2,
    moneyManaged: 2500,
    streakDays: 5,
  });

  // 最新の成果バッジ
  const [recentBadges, setRecentBadges] = useState<AchievementBadge[]>([
    {
      id: '1',
      title: '朝の戦士',
      description: '5日連続で朝ルーティンを完了',
      icon: <Sunrise className="h-5 w-5" />,
      color: 'text-orange-600',
      unlockedAt: new Date(),
      rarity: 'rare',
    },
    {
      id: '2',
      title: 'フォーカスマスター',
      description: '2時間の集中セッションを達成',
      icon: <Brain className="h-5 w-5" />,
      color: 'text-purple-600',
      unlockedAt: new Date(),
      rarity: 'epic',
    },
  ]);

  // 現在時刻ベースの状況判定
  const currentHour = new Date().getHours();
  const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening';

  // エネルギーレベルに基づく状態
  const energyStatus =
    personalState.energy.current >= 8
      ? 'high-energy'
      : personalState.energy.current >= 6
        ? 'moderate'
        : 'low-energy';

  // 応援メッセージシステム
  const encouragementMessages: EncouragementMessage[] = [
    {
      id: '1',
      message: '🌟 あなたのADHD脳の創造性が今日も素晴らしい結果を生み出していますね！',
      context: 'high-energy',
      tone: 'celebrating',
      adhdPositive: true,
    },
    {
      id: '2',
      message:
        '💙 今日はエネルギーが少し低めですね。それも自然なリズムです。小さな一歩から始めましょう。',
      context: 'low-energy',
      tone: 'understanding',
      adhdPositive: true,
    },
    {
      id: '3',
      message: '🚀 朝の新鮮なエネルギーを感じています！あなたの好奇心が新しい発見を導くでしょう。',
      context: 'morning',
      tone: 'encouraging',
      adhdPositive: true,
    },
    {
      id: '4',
      message:
        '🏆 連続5日間の成果達成！あなたの粘り強さとユニークな視点が素晴らしい結果を生んでいます。',
      context: 'achievement',
      tone: 'celebrating',
      adhdPositive: true,
    },
    {
      id: '5',
      message: '🌙 夜のリフレクション時間。今日感じた小さな喜びも、すべてあなたの成長の証です。',
      context: 'evening',
      tone: 'gentle',
      adhdPositive: true,
    },
  ];

  // 現在の状況に最適なメッセージを選択
  const getCurrentMessage = useCallback(() => {
    const contextMatches = encouragementMessages.filter(
      (msg) =>
        msg.context === timeOfDay ||
        msg.context === energyStatus ||
        (todayProgress.streakDays >= 5 && msg.context === 'achievement')
    );
    return (
      contextMatches[Math.floor(Math.random() * contextMatches.length)] || encouragementMessages[0]
    );
  }, [timeOfDay, energyStatus, todayProgress.streakDays]);

  const currentMessage = getCurrentMessage();

  // スマート推奨システム
  const generateRecommendations = useCallback((): SmartRecommendation[] => {
    const recommendations: SmartRecommendation[] = [];

    // エネルギーレベルに基づく推奨
    if (personalState.energy.current >= 8) {
      recommendations.push({
        id: 'high-energy-task',
        title: '重要プロジェクトに取り組む',
        description: 'エネルギーが高い今がチャンス！',
        action: '開始',
        path: '/adhd-task-manager',
        priority: 'high',
        timeRequired: 60,
        energyCost: 8,
        benefit: '大きな達成感と成果',
        icon: <Target className="h-5 w-5" />,
        color: 'bg-red-50 text-red-700 border-red-200',
        category: 'productivity',
      });
    } else if (personalState.energy.current >= 5) {
      recommendations.push({
        id: 'medium-energy-task',
        title: '日常タスクを片付ける',
        description: '適度なエネルギーで着実に進めましょう',
        action: '実行',
        path: '/adhd-task-manager',
        priority: 'medium',
        timeRequired: 30,
        energyCost: 5,
        benefit: '達成感とすっきり感',
        icon: <CheckCircle2 className="h-5 w-5" />,
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        category: 'productivity',
      });
    } else {
      recommendations.push({
        id: 'low-energy-care',
        title: 'セルフケアタイム',
        description: 'エネルギー回復を優先しましょう',
        action: '休憩',
        priority: 'urgent',
        timeRequired: 15,
        energyCost: 1,
        benefit: 'エネルギー回復',
        icon: <Heart className="h-5 w-5" />,
        color: 'bg-green-50 text-green-700 border-green-200',
        category: 'wellness',
      });
    }

    // 時間帯に基づく推奨
    if (timeOfDay === 'morning') {
      recommendations.push({
        id: 'morning-routine',
        title: '朝のルーティン確認',
        description: '1日を最高にスタートしましょう',
        action: '確認',
        path: '/adhd-life-sync',
        priority: 'high',
        timeRequired: 10,
        energyCost: 2,
        benefit: '1日の基盤作り',
        icon: <Sun className="h-5 w-5" />,
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        category: 'routine',
      });
    }

    // 財務管理
    recommendations.push({
      id: 'finance-check',
      title: '今日の支出をチェック',
      description: '2分で済む簡単確認',
      action: '記録',
      path: '/adhd-life-management',
      priority: 'medium',
      timeRequired: 5,
      energyCost: 2,
      benefit: '金銭不安の軽減',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      category: 'productivity',
    });

    return recommendations.slice(0, 3); // 最大3つまで
  }, [personalState, timeOfDay]);

  const smartRecommendations = generateRecommendations();

  // エネルギー調整ガイド
  const getEnergyAdjustmentGuide = () => {
    if (personalState.sensory.overload > 7) {
      return {
        title: '感覚調整が必要です',
        suggestions: [
          '静かな場所に移動',
          '照明を暗くする',
          'ノイズキャンセリングヘッドフォンを使用',
          '深呼吸を5回',
        ],
        icon: <Volume2 className="h-5 w-5" />,
        color: 'bg-orange-50 border-orange-200',
      };
    } else if (personalState.energy.current < 4) {
      return {
        title: 'エネルギー回復モード',
        suggestions: ['10分間の瞑想', '軽い散歩', '好きな音楽を聴く', '水分補給'],
        icon: <Battery className="h-5 w-5" />,
        color: 'bg-blue-50 border-blue-200',
      };
    } else {
      return {
        title: '良い状態を維持',
        suggestions: [
          '現在のリズムを保つ',
          '適度な休憩を忘れずに',
          '達成感を味わう',
          '次のステップを準備',
        ],
        icon: <Sparkles className="h-5 w-5" />,
        color: 'bg-green-50 border-green-200',
      };
    }
  };

  const energyGuide = getEnergyAdjustmentGuide();

  // プログレスアニメーション
  const [showProgressAnimation, setShowProgressAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowProgressAnimation(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* パーソナル状態ヘッダー */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute top-4 right-4 opacity-20">
          <Brain className="h-16 w-16" />
        </div>

        <div className="relative z-10">
          {/* 挨拶とメッセージ */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              {timeOfDay === 'morning' ? (
                <Sun className="h-8 w-8" />
              ) : timeOfDay === 'afternoon' ? (
                <Zap className="h-8 w-8" />
              ) : (
                <Moon className="h-8 w-8" />
              )}
              {timeOfDay === 'morning'
                ? 'おはようございます'
                : timeOfDay === 'afternoon'
                  ? 'お疲れ様です'
                  : 'お疲れ様でした'}
              、{user?.name || 'あなた'}さん
            </h1>
            <p className="text-lg text-indigo-100 mb-4">
              {format(new Date(), 'M月d日(E)', { locale: ja })} • {currentMessage.message}
            </p>
          </div>

          {/* 現在の状態サマリー */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Battery className="h-5 w-5 text-yellow-300" />
                <span className="text-sm text-indigo-100">エネルギー</span>
              </div>
              <div className="text-2xl font-bold mb-1">{personalState.energy.current}/10</div>
              <div className="text-xs text-indigo-200">
                {personalState.energy.current >= 8
                  ? '絶好調'
                  : personalState.energy.current >= 6
                    ? '良好'
                    : personalState.energy.current >= 4
                      ? '普通'
                      : '要休憩'}
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-green-300" />
                <span className="text-sm text-indigo-100">今日のタスク</span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {todayProgress.tasksCompleted}/{todayProgress.totalTasks}
              </div>
              <div className="text-xs text-indigo-200">
                {Math.round((todayProgress.tasksCompleted / todayProgress.totalTasks) * 100)}% 完了
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="h-5 w-5 text-blue-300" />
                <span className="text-sm text-indigo-100">集中時間</span>
              </div>
              <div className="text-2xl font-bold mb-1">{todayProgress.focusMinutes}分</div>
              <div className="text-xs text-indigo-200">素晴らしい集中力</div>
            </div>

            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-red-300" />
                <span className="text-sm text-indigo-100">連続記録</span>
              </div>
              <div className="text-2xl font-bold mb-1">{todayProgress.streakDays}日</div>
              <div className="text-xs text-indigo-200">継続は力なり</div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左カラム: 今すぐできるアクション */}
        <div className="lg:col-span-2 space-y-6">
          {/* スマート推奨アクション */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                今のあなたに最適なアクション
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {smartRecommendations.map((rec, index) => (
                  <div
                    key={rec.id}
                    className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${rec.color}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {rec.icon}
                          <h3 className="font-semibold">{rec.title}</h3>
                          <Badge variant="outline" className="ml-auto">
                            {rec.timeRequired}分
                          </Badge>
                        </div>
                        <p className="text-sm mb-3">{rec.description}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span>💪 エネルギー: {rec.energyCost}/10</span>
                          <span>🎯 効果: {rec.benefit}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => rec.path && navigate(rec.path)}
                        className="ml-4"
                        size="sm"
                      >
                        {rec.action}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ワンタッチアクセスボタン */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-green-500" />
                ワンタッチアクセス
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  onClick={() => navigate('/adhd-task-manager')}
                  className="h-20 flex flex-col items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                  variant="outline"
                >
                  <Target className="h-6 w-6" />
                  <span className="text-xs">タスク管理</span>
                </Button>

                <Button
                  onClick={() => navigate('/adhd-life-management')}
                  className="h-20 flex flex-col items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
                  variant="outline"
                >
                  <Calendar className="h-6 w-6" />
                  <span className="text-xs">カレンダー</span>
                </Button>

                <Button
                  onClick={() => navigate('/adhd-life-management')}
                  className="h-20 flex flex-col items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
                  variant="outline"
                >
                  <DollarSign className="h-6 w-6" />
                  <span className="text-xs">家計簿</span>
                </Button>

                <Button
                  className="h-20 flex flex-col items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200"
                  variant="outline"
                  onClick={() => {
                    // エネルギー状態更新のモーダルなどを開く
                    alert(
                      'エネルギー状態を更新しますか？\n\n現在: ' +
                        personalState.energy.current +
                        '/10'
                    );
                  }}
                >
                  <Battery className="h-6 w-6" />
                  <span className="text-xs">状態更新</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右カラム: 進捗と調整ガイド */}
        <div className="space-y-6">
          {/* 今日の進捗 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                今日の成果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">タスク達成</span>
                    <span className="text-sm text-gray-600">
                      {todayProgress.tasksCompleted}/{todayProgress.totalTasks}
                    </span>
                  </div>
                  <Progress
                    value={(todayProgress.tasksCompleted / todayProgress.totalTasks) * 100}
                    className={`h-2 transition-all duration-1000 ${showProgressAnimation ? 'opacity-100' : 'opacity-0'}`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">集中時間</span>
                    <span className="text-sm text-gray-600">{todayProgress.focusMinutes}分</span>
                  </div>
                  <Progress
                    value={(todayProgress.focusMinutes / 240) * 100}
                    className={`h-2 transition-all duration-1000 delay-300 ${showProgressAnimation ? 'opacity-100' : 'opacity-0'}`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">ウェルネススコア</span>
                    <span className="text-sm text-gray-600">{todayProgress.wellnessScore}/10</span>
                  </div>
                  <Progress
                    value={todayProgress.wellnessScore * 10}
                    className={`h-2 transition-all duration-1000 delay-600 ${showProgressAnimation ? 'opacity-100' : 'opacity-0'}`}
                  />
                </div>

                <div className="bg-yellow-50 rounded-lg p-3 mt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">今日のポイント</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-900">
                    +{todayProgress.energyPoints}pt
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* エネルギー調整ガイド */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {energyGuide.icon}
                状態調整ガイド
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg ${energyGuide.color}`}>
                <h3 className="font-semibold mb-3">{energyGuide.title}</h3>
                <div className="space-y-2">
                  {energyGuide.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-gray-600" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 最近の成果バッジ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                最新の成果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg"
                  >
                    <div className={`p-2 rounded-full bg-white ${badge.color}`}>{badge.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{badge.title}</div>
                      <div className="text-xs text-gray-600">{badge.description}</div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        badge.rarity === 'legendary'
                          ? 'bg-purple-100 text-purple-800'
                          : badge.rarity === 'epic'
                            ? 'bg-blue-100 text-blue-800'
                            : badge.rarity === 'rare'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {badge.rarity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* クイック統計 */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{todayProgress.streakDays}</div>
              <div className="text-sm text-gray-600">継続日数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {todayProgress.tasksCompleted}
              </div>
              <div className="text-sm text-gray-600">完了タスク</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((todayProgress.focusMinutes / 60) * 10) / 10}h
              </div>
              <div className="text-sm text-gray-600">集中時間</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                ¥{todayProgress.moneyManaged.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">管理金額</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{todayProgress.wellnessScore}</div>
              <div className="text-sm text-gray-600">ウェルネス</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
