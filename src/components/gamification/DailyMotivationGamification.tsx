import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { addTodoItem, updateTodoItem } from '@/store/todoSlice';
import { useInternationalization } from '@/hooks/useInternationalization';
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
  Award,
  Crown,
  Gamepad2,
  Heart,
  Brain,
  Users,
  TrendingUp,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SimpleTask {
  id: string;
  title: string;
  description: string;
  category: 'work' | 'health' | 'learning' | 'social' | 'personal';
  xpReward: number;
  isCompleted: boolean;
  completedAt?: string;
  isHabit: boolean;
}

interface PlayerStats {
  level: number;
  currentXP: number;
  totalXP: number;
  xpToNextLevel: number;
  streakDays: number;
  totalTasksCompleted: number;
}

export const DailyMotivationGamification: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector((state: RootState) => state.todo.items) || [];
  const { t } = useInternationalization();

  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    level: 1,
    currentXP: 0,
    totalXP: 0,
    xpToNextLevel: 100,
    streakDays: 0,
    totalTasksCompleted: 0,
  });

  const [tasks, setTasks] = useState<SimpleTask[]>([
    {
      id: '1',
      title: '朝の運動',
      description: '15分間の軽い運動またはストレッチ',
      category: 'health',
      xpReward: 20,
      isCompleted: false,
      isHabit: true,
    },
    {
      id: '2',
      title: '新しいスキル学習',
      description: '30分間の技術学習またはオンライン講座',
      category: 'learning',
      xpReward: 30,
      isCompleted: false,
      isHabit: true,
    },
    {
      id: '3',
      title: '読書時間',
      description: '20分間の読書または技術記事',
      category: 'learning',
      xpReward: 25,
      isCompleted: false,
      isHabit: true,
    },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTab, setSelectedTab] = useState<'tasks' | 'stats'>('tasks');
  const [isInitialized, setIsInitialized] = useState(false);

  // データ保存を最適化
  const saveToLocalStorage = useCallback(() => {
    if (!isInitialized) return; // 初期化完了後のみ保存

    try {
      localStorage.setItem('gamification_player_stats', JSON.stringify(playerStats));
      localStorage.setItem('gamification_tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('ローカルストレージへの保存エラー:', error);
    }
  }, [playerStats, tasks, isInitialized]);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedStats = localStorage.getItem('gamification_player_stats');
      const savedTasks = localStorage.getItem('gamification_tasks');

      if (savedStats) {
        setPlayerStats(JSON.parse(savedStats));
      }

      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }

      setIsInitialized(true); // 初期化完了をマーク
    } catch (error) {
      console.error('ローカルストレージからの読み込みエラー:', error);
      setIsInitialized(true); // エラーでも初期化完了とする
    }
  }, []);

  // 初期化時にローカルストレージから復元
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // データ保存をデバウンス（初期化後のみ）
  useEffect(() => {
    if (!isInitialized) return;

    const timeout = setTimeout(() => {
      saveToLocalStorage();
    }, 500);

    return () => clearTimeout(timeout);
  }, [saveToLocalStorage, isInitialized]);

  const completeTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId && !task.isCompleted) {
          const completedTask = {
            ...task,
            isCompleted: true,
            completedAt: new Date().toISOString(),
          };

          // XP獲得
          gainXP(task.xpReward, task.title);

          // ToDoとしても完了にする（統合機能）
          if (task.title) {
            const todoItem = todos.find((todo) => todo.task === task.title);
            if (todoItem) {
              dispatch(
                updateTodoItem({
                  _id: todoItem._id,
                  updates: {
                    completed: true,
                    completedDate: new Date().toISOString(),
                  },
                })
              );
            }
          }

          return completedTask;
        }
        return task;
      })
    );
  };

  const gainXP = useCallback((amount: number, taskTitle: string) => {
    setPlayerStats((prev) => {
      const newCurrentXP = prev.currentXP + amount;
      const newTotalXP = prev.totalXP + amount;

      // レベルアップ判定
      let newLevel = prev.level;
      let xpForNextLevel = prev.xpToNextLevel;
      let remainingXP = newCurrentXP;
      let levelUpsCount = 0;

      while (remainingXP >= xpForNextLevel) {
        remainingXP -= xpForNextLevel;
        newLevel++;
        levelUpsCount++;
        xpForNextLevel = Math.floor(100 * Math.pow(1.2, newLevel - 1));
      }

      // 通知をsetTimeoutで遅延実行（レンダリング後に実行）
      setTimeout(() => {
        if (levelUpsCount > 0) {
          toast.success(`🎉 レベルアップ! レベル${newLevel}に到達しました！`);
        }
        toast.success(`✨ +${amount} XP獲得! ${taskTitle}を完了しました！`);
      }, 0);

      return {
        ...prev,
        level: newLevel,
        currentXP: remainingXP,
        totalXP: newTotalXP,
        xpToNextLevel: xpForNextLevel,
        totalTasksCompleted: prev.totalTasksCompleted + 1,
      };
    });
  }, []);

  const addNewTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: SimpleTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: 'カスタムタスク',
      category: 'personal',
      xpReward: 25,
      isCompleted: false,
      isHabit: false,
    };

    setTasks((prev) => [...prev, newTask]);

    // ToDoとしても追加（統合機能）
    dispatch(
      addTodoItem({
        task: newTaskTitle,
        priority: 3,
        isPrioritized: false,
        createdAt: new Date().toISOString(),
      })
    );

    setNewTaskTitle('');
    toast.success(`新しいタスクを追加しました: ${newTaskTitle}`);
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

  const completedTasks = tasks.filter((task) => task.isCompleted);
  const completionRate =
    tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ヘッダー統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('home.level')}</p>
                <p className="text-2xl font-bold text-yellow-600">{playerStats.level}</p>
              </div>
              <Crown className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">XP</p>
                <p className="text-lg font-bold text-blue-600">
                  {playerStats.currentXP}/{playerStats.xpToNextLevel}
                </p>
              </div>
              <Star className="h-8 w-8 text-blue-600" />
            </div>
            <Progress
              value={Math.round((playerStats.currentXP / playerStats.xpToNextLevel) * 100)}
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('home.today_progress')}</p>
                <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('home.total_completed')}</p>
                <p className="text-2xl font-bold text-purple-600">
                  {playerStats.totalTasksCompleted}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* タブコンテンツ */}
      <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {t('home.today_tasks')}
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('home.statistics')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          {/* タスク追加 */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder={t('home.add_new_task')}
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addNewTask()}
                />
                <Button onClick={addNewTask}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* タスクリスト */}
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card
                key={task.id}
                className={`transition-all ${task.isCompleted ? 'opacity-60 bg-green-50' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={task.isCompleted}
                      onCheckedChange={() => !task.isCompleted && completeTask(task.id)}
                    />

                    <div className="flex items-center gap-2 flex-1">
                      {getCategoryIcon(task.category)}
                      <div className="flex-1">
                        <h4
                          className={`font-medium ${task.isCompleted ? 'line-through text-gray-500' : ''}`}
                        >
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-blue-600">
                        +{task.xpReward} XP
                      </Badge>

                      {task.isHabit && (
                        <Badge variant="outline" className="text-orange-600">
                          <Flame className="h-3 w-3 mr-1" />
                          習慣
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-medium mb-2">タスクがありません</p>
              <p className="text-sm">新しいタスクを追加して始めましょう！</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('home.level_progress')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>現在のレベル</span>
                    <span className="font-bold">{playerStats.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>次のレベルまで</span>
                    <span className="font-bold">
                      {playerStats.xpToNextLevel - playerStats.currentXP} XP
                    </span>
                  </div>
                  <Progress
                    value={Math.round((playerStats.currentXP / playerStats.xpToNextLevel) * 100)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  タスク統計
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>総完了数</span>
                    <span className="font-bold">{playerStats.totalTasksCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>今日の完了率</span>
                    <span className="font-bold">{completionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>総獲得XP</span>
                    <span className="font-bold">{playerStats.totalXP}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DailyMotivationGamification;
