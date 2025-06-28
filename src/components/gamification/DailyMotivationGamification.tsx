import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Trophy,
  Star,
  Zap,
  Flame,
  Target,
  Calendar,
  CheckCircle2,
  Plus,
  TrendingUp,
  Award,
  Crown,
  Gem,
  Clock,
  BarChart3,
  Sparkles,
  Users,
  Gift,
  Rocket,
  Heart,
  Brain,
} from 'lucide-react';
import { useUnifiedPageSync } from '@/hooks/useUnifiedPageSync';

interface DailyTask {
  id: string;
  title: string;
  description: string;
  category: 'work' | 'health' | 'learning' | 'social' | 'personal';
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  isCompleted: boolean;
  completedAt?: string;
  streak: number;
  isHabit: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface PlayerStats {
  level: number;
  currentXP: number;
  totalXP: number;
  xpToNextLevel: number;
  streakDays: number;
  longestStreak: number;
  totalTasksCompleted: number;
  averageCompletionRate: number;
  weeklyXP: number;
  monthlyXP: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  expiresAt: string;
}

export const DailyMotivationGamification: React.FC = () => {
  const { recordActivity, getUnifiedStats } = useUnifiedPageSync('gamification');
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    level: 1,
    currentXP: 0,
    totalXP: 0,
    xpToNextLevel: 100,
    streakDays: 0,
    longestStreak: 0,
    totalTasksCompleted: 0,
    averageCompletionRate: 0,
    weeklyXP: 0,
    monthlyXP: 0,
  });

  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([
    {
      id: '1',
      title: '朝の運動',
      description: '15分間の軽い運動またはストレッチ',
      category: 'health',
      difficulty: 'easy',
      xpReward: 20,
      isCompleted: false,
      streak: 3,
      isHabit: true,
      priority: 'high',
    },
    {
      id: '2',
      title: 'タスク管理',
      description: '今日のタスクを整理して優先順位を決める',
      category: 'work',
      difficulty: 'easy',
      xpReward: 15,
      isCompleted: false,
      streak: 5,
      isHabit: true,
      priority: 'high',
    },
    {
      id: '3',
      title: '新しいスキル学習',
      description: '30分間の技術学習またはオンライン講座',
      category: 'learning',
      difficulty: 'medium',
      xpReward: 30,
      isCompleted: false,
      streak: 2,
      isHabit: true,
      priority: 'medium',
    },
    {
      id: '4',
      title: '読書時間',
      description: '20分間の読書または技術記事',
      category: 'learning',
      difficulty: 'easy',
      xpReward: 25,
      isCompleted: false,
      streak: 1,
      isHabit: true,
      priority: 'medium',
    },
    {
      id: '5',
      title: 'プロジェクト進捗',
      description: '重要なプロジェクトを30分以上進める',
      category: 'work',
      difficulty: 'hard',
      xpReward: 50,
      isCompleted: false,
      streak: 0,
      isHabit: false,
      priority: 'high',
    },
    {
      id: '6',
      title: '水分補給',
      description: '1日8杯の水を飲む',
      category: 'health',
      difficulty: 'easy',
      xpReward: 10,
      isCompleted: false,
      streak: 7,
      isHabit: true,
      priority: 'medium',
    },
    {
      id: '7',
      title: '感謝の記録',
      description: '今日感謝したことを3つ書き出す',
      category: 'personal',
      difficulty: 'easy',
      xpReward: 15,
      isCompleted: false,
      streak: 4,
      isHabit: true,
      priority: 'low',
    },
    {
      id: '8',
      title: 'コードレビュー',
      description: '他の人のコードをレビューまたは自分のコードを改善',
      category: 'work',
      difficulty: 'medium',
      xpReward: 35,
      isCompleted: false,
      streak: 0,
      isHabit: false,
      priority: 'medium',
    },
    {
      id: '9',
      title: '家族・友人との時間',
      description: '大切な人と意味のある会話をする',
      category: 'social',
      difficulty: 'easy',
      xpReward: 20,
      isCompleted: false,
      streak: 2,
      isHabit: true,
      priority: 'medium',
    },
    {
      id: '10',
      title: '整理整頓',
      description: 'デスク周りまたは部屋の整理整頓',
      category: 'personal',
      difficulty: 'easy',
      xpReward: 15,
      isCompleted: false,
      streak: 1,
      isHabit: true,
      priority: 'low',
    },
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-steps',
      title: '最初の一歩',
      description: '初回のタスクを完了する',
      icon: '🎯',
      unlocked: true,
      unlockedAt: '2024-01-15T09:00:00Z',
      progress: 1,
      maxProgress: 1,
      category: 'milestone',
      rarity: 'common',
    },
    {
      id: 'streak-master',
      title: 'ストリークマスター',
      description: '7日連続でタスクを完了する',
      icon: '🔥',
      unlocked: false,
      progress: 3,
      maxProgress: 7,
      category: 'consistency',
      rarity: 'rare',
    },
    {
      id: 'level-up',
      title: 'レベルアップ',
      description: 'レベル5に到達する',
      icon: '⭐',
      unlocked: false,
      progress: 1,
      maxProgress: 5,
      category: 'progression',
      rarity: 'epic',
    },
    {
      id: 'learning-devotee',
      title: '学習の達人',
      description: '学習タスクを30回完了する',
      icon: '🧠',
      unlocked: false,
      progress: 8,
      maxProgress: 30,
      category: 'learning',
      rarity: 'epic',
    },
  ]);

  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([
    {
      id: 'daily-1',
      title: '完璧な一日',
      description: '全ての習慣タスクを完了する',
      xpReward: 100,
      progress: 2,
      maxProgress: 4,
      isCompleted: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'daily-2',
      title: 'スピードランナー',
      description: '午前中に3つのタスクを完了する',
      xpReward: 75,
      progress: 1,
      maxProgress: 3,
      isCompleted: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'tasks' | 'achievements' | 'challenges' | 'stats'>(
    'tasks'
  );

  /**
   * タスク完了処理
   */
  const completeTask = (taskId: string) => {
    setDailyTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId && !task.isCompleted) {
          const completedTask = {
            ...task,
            isCompleted: true,
            completedAt: new Date().toISOString(),
          };

          // XP獲得とレベルアップ処理
          gainXP(task.xpReward, task.title);

          // ストリーク更新
          if (task.isHabit) {
            updateStreak(taskId);
          }

          // アチーブメント進捗更新
          updateAchievements('task_completed', task);

          // ページ同期記録
          recordActivity('gamification', 'task_completed', {
            taskId,
            category: task.category,
            xpGained: task.xpReward,
          });

          return completedTask;
        }
        return task;
      })
    );
  };

  /**
   * XP獲得とレベルアップ
   */
  const gainXP = (amount: number, taskTitle: string) => {
    setPlayerStats((prev) => {
      const newCurrentXP = prev.currentXP + amount;
      const newTotalXP = prev.totalXP + amount;

      // レベルアップ判定
      let newLevel = prev.level;
      let xpForNextLevel = prev.xpToNextLevel;
      let remainingXP = newCurrentXP;

      while (remainingXP >= xpForNextLevel) {
        remainingXP -= xpForNextLevel;
        newLevel++;
        xpForNextLevel = calculateXPForLevel(newLevel + 1) - calculateXPForLevel(newLevel);

        // レベルアップ通知
        showLevelUpNotification(newLevel);
      }

      return {
        ...prev,
        level: newLevel,
        currentXP: remainingXP,
        totalXP: newTotalXP,
        xpToNextLevel: xpForNextLevel,
        totalTasksCompleted: prev.totalTasksCompleted + 1,
        weeklyXP: prev.weeklyXP + amount,
        monthlyXP: prev.monthlyXP + amount,
      };
    });

    // XP獲得アニメーション
    showXPGainNotification(amount, taskTitle);
  };

  /**
   * レベル計算
   */
  const calculateXPForLevel = (level: number): number => {
    return Math.floor(100 * Math.pow(1.2, level - 1));
  };

  /**
   * ストリーク更新
   */
  const updateStreak = (taskId: string) => {
    const today = new Date().toDateString();
    const lastCompletion = localStorage.getItem(`task_${taskId}_last_completion`);

    if (lastCompletion !== today) {
      setDailyTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId) {
            const newStreak = task.streak + 1;
            localStorage.setItem(`task_${taskId}_last_completion`, today);
            localStorage.setItem(`task_${taskId}_streak`, newStreak.toString());

            return { ...task, streak: newStreak };
          }
          return task;
        })
      );

      // 全体ストリーク更新
      setPlayerStats((prev) => ({
        ...prev,
        streakDays: prev.streakDays + 1,
        longestStreak: Math.max(prev.longestStreak, prev.streakDays + 1),
      }));
    }
  };

  /**
   * アチーブメント進捗更新
   */
  const updateAchievements = (eventType: string, data?: any) => {
    setAchievements((prev) =>
      prev.map((achievement) => {
        let updatedAchievement = { ...achievement };

        switch (achievement.id) {
          case 'first-steps':
            if (eventType === 'task_completed' && !achievement.unlocked) {
              updatedAchievement = {
                ...achievement,
                unlocked: true,
                unlockedAt: new Date().toISOString(),
                progress: 1,
              };
              showAchievementNotification(updatedAchievement);
            }
            break;

          case 'streak-master':
            if (eventType === 'task_completed' && data?.isHabit) {
              updatedAchievement.progress = Math.min(
                updatedAchievement.maxProgress,
                playerStats.streakDays
              );
              if (
                updatedAchievement.progress >= updatedAchievement.maxProgress &&
                !achievement.unlocked
              ) {
                updatedAchievement.unlocked = true;
                updatedAchievement.unlockedAt = new Date().toISOString();
                showAchievementNotification(updatedAchievement);
              }
            }
            break;

          case 'level-up':
            updatedAchievement.progress = playerStats.level;
            if (
              updatedAchievement.progress >= updatedAchievement.maxProgress &&
              !achievement.unlocked
            ) {
              updatedAchievement.unlocked = true;
              updatedAchievement.unlockedAt = new Date().toISOString();
              showAchievementNotification(updatedAchievement);
            }
            break;

          case 'learning-devotee':
            if (eventType === 'task_completed' && data?.category === 'learning') {
              updatedAchievement.progress = Math.min(
                updatedAchievement.maxProgress,
                updatedAchievement.progress + 1
              );
              if (
                updatedAchievement.progress >= updatedAchievement.maxProgress &&
                !achievement.unlocked
              ) {
                updatedAchievement.unlocked = true;
                updatedAchievement.unlockedAt = new Date().toISOString();
                showAchievementNotification(updatedAchievement);
              }
            }
            break;
        }

        return updatedAchievement;
      })
    );
  };

  /**
   * 通知表示
   */
  const showXPGainNotification = (xp: number, taskTitle: string) => {
    console.log(`✨ +${xp} XP獲得! "${taskTitle}" 完了`);

    // より良い視覚的フィードバックのために、将来的にtoast通知を追加可能
    // toast.success(`✨ +${xp} XP獲得! ${taskTitle}を完了しました！`);
  };

  const showLevelUpNotification = (newLevel: number) => {
    console.log(`🎉 レベルアップ! レベル${newLevel}に到達しました！`);

    // レベルアップ時の特別演出
    const levelUpRewards = {
      5: { bonus: 50, title: '初級マスター' },
      10: { bonus: 100, title: '中級エキスパート' },
      15: { bonus: 200, title: '上級プロフェッショナル' },
      20: { bonus: 500, title: 'マスタークラス' },
    };

    const reward = levelUpRewards[newLevel as keyof typeof levelUpRewards];
    if (reward) {
      setPlayerStats((prev) => ({
        ...prev,
        totalXP: prev.totalXP + reward.bonus,
      }));
      console.log(`🏆 特別報酬: ${reward.title} - ボーナス${reward.bonus} XP!`);
    }

    // 将来的にtoast通知を追加可能
    // toast.success(`🎉 レベル${newLevel}に到達！おめでとうございます！`, {
    //   duration: 5000,
    // });
  };

  const showAchievementNotification = (achievement: Achievement) => {
    console.log(`🏆 アチーブメント解除: ${achievement.title}`);

    // アチーブメント解除時のボーナスXP
    const bonusXP =
      achievement.rarity === 'legendary'
        ? 100
        : achievement.rarity === 'epic'
          ? 75
          : achievement.rarity === 'rare'
            ? 50
            : 25;

    setPlayerStats((prev) => ({
      ...prev,
      totalXP: prev.totalXP + bonusXP,
      currentXP: prev.currentXP + bonusXP,
    }));

    // 将来的にtoast通知を追加可能
    // toast.success(`🏆 ${achievement.title} 解除！ボーナス${bonusXP} XP獲得！`, {
    //   duration: 6000,
    // });
  };

  /**
   * 新しいタスク追加
   */
  const addNewTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: DailyTask = {
        id: Date.now().toString(),
        title: newTaskTitle,
        description: '新しいタスク',
        category: 'personal',
        difficulty: 'medium',
        xpReward: 25,
        isCompleted: false,
        streak: 0,
        isHabit: false,
        priority: 'medium',
      };

      setDailyTasks((prev) => [...prev, newTask]);
      setNewTaskTitle('');
      setShowAddTask(false);
    }
  };

  /**
   * カテゴリアイコン取得
   */
  const getCategoryIcon = (category: string) => {
    const icons = {
      work: <Rocket className="w-4 h-4" />,
      health: <Heart className="w-4 h-4" />,
      learning: <Brain className="w-4 h-4" />,
      social: <Users className="w-4 h-4" />,
      personal: <Star className="w-4 h-4" />,
    };
    return icons[category as keyof typeof icons] || <Target className="w-4 h-4" />;
  };

  /**
   * 難易度色取得
   */
  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'text-green-600',
      medium: 'text-yellow-600',
      hard: 'text-red-600',
    };
    return colors[difficulty as keyof typeof colors] || 'text-gray-600';
  };

  /**
   * レア度色取得
   */
  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'border-gray-300',
      rare: 'border-blue-400',
      epic: 'border-purple-500',
      legendary: 'border-yellow-500',
    };
    return colors[rarity as keyof typeof colors] || 'border-gray-300';
  };

  // 完了率計算
  const completionRate = Math.round(
    (dailyTasks.filter((task) => task.isCompleted).length / dailyTasks.length) * 100
  );

  const habitTasks = dailyTasks.filter((task) => task.isHabit);
  const habitCompletionRate = Math.round(
    (habitTasks.filter((task) => task.isCompleted).length / habitTasks.length) * 100
  );

  useEffect(() => {
    // ページ訪問記録
    recordActivity('gamification', 'page_visit');

    // ローカルストレージからデータ復元
    loadFromLocalStorage();

    // 日次リセット処理
    checkDailyReset();
  }, [recordActivity]);

  /**
   * ローカルストレージからデータを読み込み
   */
  const loadFromLocalStorage = () => {
    try {
      const savedStats = localStorage.getItem('gamification_player_stats');
      const savedTasks = localStorage.getItem('gamification_daily_tasks');
      const savedAchievements = localStorage.getItem('gamification_achievements');

      if (savedStats) {
        setPlayerStats(JSON.parse(savedStats));
      }

      if (savedTasks) {
        setDailyTasks(JSON.parse(savedTasks));
      }

      if (savedAchievements) {
        setAchievements(JSON.parse(savedAchievements));
      }
    } catch (error) {
      console.error('ローカルストレージからの読み込みエラー:', error);
    }
  };

  /**
   * ローカルストレージにデータを保存
   */
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('gamification_player_stats', JSON.stringify(playerStats));
      localStorage.setItem('gamification_daily_tasks', JSON.stringify(dailyTasks));
      localStorage.setItem('gamification_achievements', JSON.stringify(achievements));
    } catch (error) {
      console.error('ローカルストレージへの保存エラー:', error);
    }
  };

  /**
   * 日次リセット処理
   */
  const checkDailyReset = () => {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('gamification_last_reset');

    if (lastReset !== today) {
      // 新しい日なので、完了状態をリセット
      setDailyTasks((prev) =>
        prev.map((task) => ({
          ...task,
          isCompleted: false,
          completedAt: undefined,
        }))
      );

      // 新しいデイリーチャレンジを生成
      generateNewDailyChallenges();

      localStorage.setItem('gamification_last_reset', today);

      // 毎日ログインボーナス
      if (lastReset) {
        gainXP(10, '毎日ログインボーナス');
      }
    }
  };

  /**
   * 新しいデイリーチャレンジを生成
   */
  const generateNewDailyChallenges = () => {
    const challenges = [
      {
        id: 'daily-perfectionist',
        title: '完璧主義者',
        description: '全ての習慣タスクを完了する',
        xpReward: 100,
        progress: 0,
        maxProgress: dailyTasks.filter((t) => t.isHabit).length,
        isCompleted: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'daily-early-bird',
        title: '早起きの鳥',
        description: '午前10時までに3つのタスクを完了する',
        xpReward: 75,
        progress: 0,
        maxProgress: 3,
        isCompleted: false,
        expiresAt: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(), // 14時間後
      },
      {
        id: 'daily-learner',
        title: '学習熱心',
        description: '学習系タスクを2つ完了する',
        xpReward: 60,
        progress: 0,
        maxProgress: 2,
        isCompleted: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    setDailyChallenges(challenges);
  };

  /**
   * 週間レベルボーナス計算
   */
  const getWeeklyLevelBonus = () => {
    const dayOfWeek = new Date().getDay();
    const multiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.5 : 1.2; // 週末はボーナス高め
    return Math.floor(playerStats.level * multiplier);
  };

  /**
   * モチベーションメッセージ取得
   */
  const getMotivationMessage = () => {
    const completedToday = dailyTasks.filter((task) => task.isCompleted).length;
    const totalTasks = dailyTasks.length;
    const completionRate = (completedToday / totalTasks) * 100;

    if (completionRate === 100) {
      return '🎉 素晴らしい！今日のタスクを全て完了しました！';
    } else if (completionRate >= 80) {
      return '🔥 絶好調です！あと少しで完璧な一日に！';
    } else if (completionRate >= 60) {
      return '💪 良いペースです！この調子で頑張りましょう！';
    } else if (completionRate >= 40) {
      return '⚡ まだまだこれから！一歩ずつ進みましょう！';
    } else if (completionRate >= 20) {
      return '🌱 スタートは大切！小さな一歩から始めましょう！';
    } else {
      return '🎯 新しい一日の始まりです！最初のタスクから始めてみませんか？';
    }
  };

  // データ保存の自動化
  useEffect(() => {
    saveToLocalStorage();
  }, [playerStats, dailyTasks, achievements]);

  return (
    <div className="space-y-6 p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-600" />
            日々のモチベーション
          </h1>
          <p className="text-muted-foreground mt-2">毎日の積み重ねでレベルアップしよう！</p>
        </div>

        {/* レベル表示 */}
        <div className="text-right">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-yellow-600" />
            <span className="text-2xl font-bold">レベル {playerStats.level}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-sm">
              {playerStats.currentXP} / {playerStats.xpToNextLevel} XP
            </span>
          </div>
          <Progress
            value={(playerStats.currentXP / playerStats.xpToNextLevel) * 100}
            className="w-32 h-2 mt-1"
          />
        </div>
      </div>

      {/* モチベーションメッセージ */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">今日のモチベーション</p>
              <p className="font-medium text-blue-800">{getMotivationMessage()}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">週間ボーナス: </span>
              <span className="font-semibold text-purple-600">+{getWeeklyLevelBonus()} XP</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">今日: </span>
              <span className="font-semibold">
                {dailyTasks.filter((task) => task.isCompleted).length}/{dailyTasks.length} 完了
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">今日の進捗</p>
                <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">連続達成</p>
                <p className="text-2xl font-bold text-orange-600">{playerStats.streakDays}日</p>
              </div>
              <Flame className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">週間XP</p>
                <p className="text-2xl font-bold text-purple-600">{playerStats.weeklyXP}</p>
              </div>
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">習慣完了率</p>
                <p className="text-2xl font-bold text-blue-600">{habitCompletionRate}%</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* タブナビゲーション */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'tasks', label: '今日のタスク', icon: CheckCircle2 },
          { id: 'challenges', label: 'デイリーチャレンジ', icon: Target },
          { id: 'achievements', label: 'アチーブメント', icon: Trophy },
          { id: 'stats', label: '統計', icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              selectedTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* タスクタブ */}
      {selectedTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">今日のタスク</h2>
            <Button onClick={() => setShowAddTask(!showAddTask)} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              タスク追加
            </Button>
          </div>

          {showAddTask && (
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="新しいタスクを入力..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addNewTask()}
                  />
                  <Button onClick={addNewTask}>追加</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {dailyTasks.map((task) => (
              <Card
                key={task.id}
                className={`transition-all ${task.isCompleted ? 'opacity-60' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={task.isCompleted}
                        onCheckedChange={() => !task.isCompleted && completeTask(task.id)}
                      />

                      <div className="flex items-center gap-2">
                        {getCategoryIcon(task.category)}
                        <div>
                          <h3 className={`font-medium ${task.isCompleted ? 'line-through' : ''}`}>
                            {task.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.isHabit && task.streak > 0 && (
                        <Badge variant="outline" className="text-orange-600">
                          <Flame className="w-3 h-3 mr-1" />
                          {task.streak}日
                        </Badge>
                      )}

                      <Badge variant="outline" className={getDifficultyColor(task.difficulty)}>
                        +{task.xpReward} XP
                      </Badge>

                      {task.priority === 'high' && (
                        <Badge variant="destructive" className="text-xs">
                          重要
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* チャレンジタブ */}
      {selectedTab === 'challenges' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">デイリーチャレンジ</h2>

          <div className="grid gap-4">
            {dailyChallenges.map((challenge) => (
              <Card key={challenge.id} className={challenge.isCompleted ? 'border-green-500' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{challenge.title}</h3>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    </div>
                    <Badge variant={challenge.isCompleted ? 'default' : 'outline'}>
                      +{challenge.xpReward} XP
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        進捗: {challenge.progress} / {challenge.maxProgress}
                      </span>
                      <span>{Math.round((challenge.progress / challenge.maxProgress) * 100)}%</span>
                    </div>
                    <Progress value={(challenge.progress / challenge.maxProgress) * 100} />
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-muted-foreground">
                      期限:{' '}
                      {new Date(challenge.expiresAt).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {challenge.isCompleted && (
                      <Badge variant="default" className="text-green-600">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        完了
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* アチーブメントタブ */}
      {selectedTab === 'achievements' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">アチーブメント</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`${getRarityColor(achievement.rarity)} border-2 ${
                  achievement.unlocked ? 'bg-green-50' : 'opacity-75'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <h3 className="font-medium">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>

                    {achievement.unlocked && (
                      <Badge variant="default" className="text-green-600">
                        解除済み
                      </Badge>
                    )}
                  </div>

                  {!achievement.unlocked && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>進捗</span>
                        <span>
                          {achievement.progress} / {achievement.maxProgress}
                        </span>
                      </div>
                      <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-3">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        achievement.rarity === 'legendary'
                          ? 'text-yellow-600'
                          : achievement.rarity === 'epic'
                            ? 'text-purple-600'
                            : achievement.rarity === 'rare'
                              ? 'text-blue-600'
                              : 'text-gray-600'
                      }`}
                    >
                      {achievement.rarity.toUpperCase()}
                    </Badge>

                    {achievement.unlocked && achievement.unlockedAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(achievement.unlockedAt).toLocaleDateString('ja-JP')}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 統計タブ */}
      {selectedTab === 'stats' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">詳細統計</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* レベル進捗 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  レベル進捗
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    レベル {playerStats.level}
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    次のレベルまで {playerStats.xpToNextLevel - playerStats.currentXP} XP
                  </div>
                  <Progress
                    value={(playerStats.currentXP / playerStats.xpToNextLevel) * 100}
                    className="h-3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">総XP</p>
                    <p className="text-lg font-semibold">{playerStats.totalXP.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">完了タスク</p>
                    <p className="text-lg font-semibold">{playerStats.totalTasksCompleted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ストリーク統計 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  ストリーク記録
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">現在のストリーク</p>
                    <p className="text-3xl font-bold text-orange-600">{playerStats.streakDays}</p>
                    <p className="text-xs">日連続</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">最長記録</p>
                    <p className="text-3xl font-bold text-red-600">{playerStats.longestStreak}</p>
                    <p className="text-xs">日</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">習慣別ストリーク</h4>
                  {habitTasks.map((task) => (
                    <div key={task.id} className="flex justify-between items-center">
                      <span className="text-sm">{task.title}</span>
                      <Badge variant="outline" className="text-orange-600">
                        {task.streak}日
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* カテゴリ別統計 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                カテゴリ別完了率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['work', 'health', 'learning', 'social', 'personal'].map((category) => {
                  const categoryTasks = dailyTasks.filter((task) => task.category === category);
                  const completedCount = categoryTasks.filter((task) => task.isCompleted).length;
                  const completionRate =
                    categoryTasks.length > 0
                      ? Math.round((completedCount / categoryTasks.length) * 100)
                      : 0;

                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category)}
                          <span className="capitalize">{category}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {completedCount}/{categoryTasks.length} ({completionRate}%)
                        </span>
                      </div>
                      <Progress value={completionRate} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DailyMotivationGamification;
