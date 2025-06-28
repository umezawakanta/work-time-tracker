import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { addTodoItem, updateTodoItem, fetchTodoItems } from '@/store/todoSlice';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Star,
  Flame,
  Target,
  CheckCircle2,
  Plus,
  Clock,
  Award,
  Crown,
  Gamepad2,
  CheckSquare,
  Calendar,
  Zap,
  TrendingUp,
  Users,
  Gift,
  Heart,
  Brain,
  Sparkles,
} from 'lucide-react';
import { useUnifiedPageSync } from '@/hooks/useUnifiedPageSync';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

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
  type: 'gamification' | 'todo' | 'both';
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

export const IntegratedTaskDashboard: React.FC<{
  isPremium?: boolean;
}> = ({ isPremium = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { recordActivity } = useUnifiedPageSync('integrated-tasks');

  // Redux state
  const todos = useSelector((state: RootState) => state.todo.items) || [];
  const safeTodos = Array.isArray(todos) ? todos : [];

  // Local state
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

  const [integratedTasks, setIntegratedTasks] = useState<DailyTask[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTab, setSelectedTab] = useState<'tasks' | 'achievements' | 'stats'>('tasks');

  // 統合タスクの初期化
  useEffect(() => {
    initializeIntegratedTasks();
    loadPlayerStats();
    loadAchievements();
  }, [safeTodos]);

  const initializeIntegratedTasks = () => {
    // ゲーミフィケーションタスク
    const gamificationTasks: DailyTask[] = [
      {
        id: 'game-1',
        title: '朝の運動',
        description: '15分間の軽い運動またはストレッチ',
        category: 'health',
        difficulty: 'easy',
        xpReward: 20,
        isCompleted: false,
        streak: 3,
        isHabit: true,
        priority: 'high',
        type: 'gamification',
      },
      {
        id: 'game-2',
        title: '新しいスキル学習',
        description: '30分間の技術学習またはオンライン講座',
        category: 'learning',
        difficulty: 'medium',
        xpReward: 30,
        isCompleted: false,
        streak: 2,
        isHabit: true,
        priority: 'medium',
        type: 'gamification',
      },
      {
        id: 'game-3',
        title: '読書時間',
        description: '20分間の読書または技術記事',
        category: 'learning',
        difficulty: 'easy',
        xpReward: 25,
        isCompleted: false,
        streak: 1,
        isHabit: true,
        priority: 'medium',
        type: 'gamification',
      },
    ];

    // ToDoタスクをゲーミフィケーション形式に変換
    const todoTasks: DailyTask[] = safeTodos
      .filter((todo) => !todo.completed && isToday(todo.createdAt))
      .slice(0, 7) // 最大7件
      .map((todo, index) => ({
        id: `todo-${todo.id}`,
        title: todo.task,
        description: todo.description || '詳細なし',
        category: getCategoryFromTodo(todo),
        difficulty: getDifficultyFromTodo(todo),
        xpReward: getXPRewardFromTodo(todo),
        isCompleted: todo.completed,
        completedAt: todo.completedDate,
        streak: 0,
        isHabit: false,
        priority: getPriorityFromTodo(todo),
        type: 'todo',
      }));

    setIntegratedTasks([...gamificationTasks, ...todoTasks]);
  };

  const isToday = (dateString?: string): boolean => {
    if (!dateString) return true;
    const today = new Date().toDateString();
    return new Date(dateString).toDateString() === today;
  };

  const getCategoryFromTodo = (todo: any): DailyTask['category'] => {
    const title = todo.task.toLowerCase();
    if (title.includes('運動') || title.includes('健康')) return 'health';
    if (title.includes('学習') || title.includes('勉強')) return 'learning';
    if (title.includes('会議') || title.includes('打ち合わせ')) return 'social';
    return 'work';
  };

  const getDifficultyFromTodo = (todo: any): DailyTask['difficulty'] => {
    if (todo.priority && todo.priority > 4) return 'hard';
    if (todo.priority && todo.priority > 2) return 'medium';
    return 'easy';
  };

  const getXPRewardFromTodo = (todo: any): number => {
    const difficulty = getDifficultyFromTodo(todo);
    const baseXP = { easy: 15, medium: 25, hard: 40 };
    return baseXP[difficulty];
  };

  const getPriorityFromTodo = (todo: any): DailyTask['priority'] => {
    if (todo.isPrioritized) return 'high';
    if (todo.priority && todo.priority > 3) return 'high';
    if (todo.priority && todo.priority > 1) return 'medium';
    return 'low';
  };

  const loadPlayerStats = () => {
    try {
      const saved = localStorage.getItem('playerStats');
      if (saved) {
        setPlayerStats(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load player stats:', error);
    }
  };

  const loadAchievements = () => {
    try {
      const saved = localStorage.getItem('achievements');
      if (saved) {
        setAchievements(JSON.parse(saved));
      } else {
        // デフォルトアチーブメント
        setAchievements([
          {
            id: 'first-task',
            title: '最初のタスク',
            description: '初回タスクを完了する',
            icon: '🎯',
            unlocked: false,
            progress: 0,
            maxProgress: 1,
            category: 'milestone',
            rarity: 'common',
          },
          {
            id: 'streak-week',
            title: '1週間ストリーク',
            description: '7日連続でタスクを完了する',
            icon: '🔥',
            unlocked: false,
            progress: 0,
            maxProgress: 7,
            category: 'consistency',
            rarity: 'rare',
          },
          {
            id: 'xp-milestone',
            title: 'XPマスター',
            description: '1000XPを獲得する',
            icon: '⭐',
            unlocked: false,
            progress: 0,
            maxProgress: 1000,
            category: 'progression',
            rarity: 'epic',
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  };

  const completeTask = (taskId: string) => {
    setIntegratedTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId && !task.isCompleted) {
          const completedTask = {
            ...task,
            isCompleted: true,
            completedAt: new Date().toISOString(),
          };

          // XP獲得処理
          gainXP(task.xpReward, task.title);

          // ToDoタスクの場合、Reduxも更新
          if (task.type === 'todo') {
            const todoId = task.id.replace('todo-', '');
            dispatch(
              updateTodoItem({
                id: todoId,
                completed: true,
                completedDate: new Date().toISOString(),
              })
            );
          }

          // アクティビティ記録
          recordActivity('integrated-tasks', 'task_completed', {
            taskId,
            category: task.category,
            xpGained: task.xpReward,
            type: task.type,
          });

          // アチーブメント進捗更新
          updateAchievements('task_completed', task);

          // 通知表示
          toast.success(`✨ +${task.xpReward} XP獲得! ${task.title}を完了しました！`);

          return completedTask;
        }
        return task;
      })
    );
  };

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
        toast.success(`🎉 レベルアップ! レベル${newLevel}に到達しました！`);
      }

      const updatedStats = {
        ...prev,
        level: newLevel,
        currentXP: remainingXP,
        totalXP: newTotalXP,
        xpToNextLevel: xpForNextLevel,
        totalTasksCompleted: prev.totalTasksCompleted + 1,
        weeklyXP: prev.weeklyXP + amount,
        monthlyXP: prev.monthlyXP + amount,
      };

      // ローカルストレージに保存
      localStorage.setItem('playerStats', JSON.stringify(updatedStats));

      return updatedStats;
    });
  };

  const calculateXPForLevel = (level: number): number => {
    return Math.floor(100 * Math.pow(1.2, level - 1));
  };

  const updateAchievements = (eventType: string, data?: any) => {
    setAchievements((prev) =>
      prev.map((achievement) => {
        let updated = { ...achievement };

        switch (achievement.id) {
          case 'first-task':
            if (eventType === 'task_completed' && !achievement.unlocked) {
              updated = {
                ...achievement,
                unlocked: true,
                unlockedAt: new Date().toISOString(),
                progress: 1,
              };
              toast.success(`🏆 アチーブメント獲得: ${achievement.title}!`);
            }
            break;
          case 'xp-milestone':
            updated.progress = playerStats.totalXP;
            if (updated.progress >= updated.maxProgress && !achievement.unlocked) {
              updated.unlocked = true;
              updated.unlockedAt = new Date().toISOString();
              toast.success(`🏆 アチーブメント獲得: ${achievement.title}!`);
            }
            break;
        }

        return updated;
      })
    );
  };

  const addNewTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: DailyTask = {
      id: `custom-${Date.now()}`,
      title: newTaskTitle,
      description: 'カスタムタスク',
      category: 'personal',
      difficulty: 'medium',
      xpReward: 25,
      isCompleted: false,
      streak: 0,
      isHabit: false,
      priority: 'medium',
      type: 'both',
    };

    setIntegratedTasks((prev) => [...prev, newTask]);
    setNewTaskTitle('');

    // ToDoとしても追加
    dispatch(
      addTodoItem({
        task: newTaskTitle,
        description: 'カスタムタスク',
        priority: 3,
        createdAt: new Date().toISOString(),
      })
    );

    toast.success('新しいタスクを追加しました！');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work':
        return <Gamepad2 className="h-4 w-4" />;
      case 'health':
        return <Heart className="h-4 w-4" />;
      case 'learning':
        return <Brain className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
      case 'personal':
        return <Star className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'hard':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const completedTasks = integratedTasks.filter((task) => task.isCompleted);
  const pendingTasks = integratedTasks.filter((task) => !task.isCompleted);
  const completionRate =
    integratedTasks.length > 0
      ? Math.round((completedTasks.length / integratedTasks.length) * 100)
      : 0;

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            統合タスクダッシュボード
            <Badge variant="outline" className="ml-2 bg-white/50">
              レベル {playerStats.level}
            </Badge>
          </CardTitle>
        </div>

        {/* プレイヤー統計 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-slate-700">
                {playerStats.currentXP} / {playerStats.xpToNextLevel} XP
              </p>
              <Progress
                value={Math.round((playerStats.currentXP / playerStats.xpToNextLevel) * 100)}
                className="h-2 bg-white/50 mt-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-slate-700">ストリーク</p>
              <p className="text-lg font-bold text-orange-600">{playerStats.streakDays}日</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-slate-700">今日の完了率</p>
              <p className="text-lg font-bold text-green-600">{completionRate}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-slate-700">総完了数</p>
              <p className="text-lg font-bold text-purple-600">{playerStats.totalTasksCompleted}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)}>
          <TabsList className="grid w-full grid-cols-3 bg-white/50">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              タスク
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              アチーブメント
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              統計
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-6">
            {/* 新しいタスク追加 */}
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="新しいタスクを追加..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addNewTask()}
                className="bg-white/70"
              />
              <Button onClick={addNewTask} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* タスクリスト */}
            <div className="space-y-3">
              {integratedTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    'p-4 rounded-lg border transition-all duration-200',
                    task.isCompleted
                      ? 'bg-white/30 border-green-200 opacity-75'
                      : 'bg-white/70 border-white/50 hover:bg-white/90'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.isCompleted}
                      onCheckedChange={() => !task.isCompleted && completeTask(task.id)}
                      className="mt-1"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={cn(
                            'font-medium',
                            task.isCompleted ? 'line-through text-gray-500' : 'text-slate-900'
                          )}
                        >
                          {task.title}
                        </h4>

                        <div className="flex items-center gap-1">
                          {getCategoryIcon(task.category)}
                          <Badge
                            variant="outline"
                            className={cn('text-xs', getDifficultyColor(task.difficulty))}
                          >
                            {task.difficulty}
                          </Badge>

                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600">
                            {task.type}
                          </Badge>

                          {task.isHabit && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-purple-50 text-purple-600"
                            >
                              習慣 {task.streak}🔥
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium text-yellow-600">
                            +{task.xpReward} XP
                          </span>
                        </div>

                        {task.isCompleted && task.completedAt && (
                          <span className="text-xs text-gray-500">
                            完了:{' '}
                            {new Date(task.completedAt).toLocaleTimeString('ja-JP', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {integratedTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium mb-2">タスクがありません</p>
                <p className="text-sm">新しいタスクを追加して始めましょう！</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={cn(
                    'p-4 rounded-lg border',
                    achievement.unlocked
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                      : 'bg-white/50 border-gray-200'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>

                      <div className="flex items-center gap-2">
                        <Progress
                          value={Math.round((achievement.progress / achievement.maxProgress) * 100)}
                          className="h-2 flex-1"
                        />
                        <span className="text-xs text-gray-500">
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                      </div>

                      {achievement.unlocked && (
                        <Badge className="mt-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                          <Crown className="h-3 w-3 mr-1" />
                          獲得済み
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <h4 className="font-semibold text-slate-900">レベル進捗</h4>
                </div>
                <p className="text-2xl font-bold text-blue-600">{playerStats.level}</p>
                <p className="text-sm text-gray-600">
                  次のレベルまで {playerStats.xpToNextLevel - playerStats.currentXP} XP
                </p>
              </div>

              <div className="bg-white/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <h4 className="font-semibold text-slate-900">ストリーク記録</h4>
                </div>
                <p className="text-2xl font-bold text-orange-600">{playerStats.streakDays}</p>
                <p className="text-sm text-gray-600">最長記録: {playerStats.longestStreak}日</p>
              </div>

              <div className="bg-white/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h4 className="font-semibold text-slate-900">総獲得XP</h4>
                </div>
                <p className="text-2xl font-bold text-yellow-600">{playerStats.totalXP}</p>
                <p className="text-sm text-gray-600">今週: {playerStats.weeklyXP} XP</p>
              </div>

              <div className="bg-white/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <h4 className="font-semibold text-slate-900">完了タスク</h4>
                </div>
                <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
                <p className="text-sm text-gray-600">今日の完了率: {completionRate}%</p>
              </div>

              <div className="bg-white/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  <h4 className="font-semibold text-slate-900">アチーブメント</h4>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {achievements.filter((a) => a.unlocked).length}
                </p>
                <p className="text-sm text-gray-600">{achievements.length}個中</p>
              </div>

              <div className="bg-white/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-indigo-500" />
                  <h4 className="font-semibold text-slate-900">平均完了率</h4>
                </div>
                <p className="text-2xl font-bold text-indigo-600">
                  {Math.round(playerStats.averageCompletionRate)}%
                </p>
                <p className="text-sm text-gray-600">全期間平均</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
