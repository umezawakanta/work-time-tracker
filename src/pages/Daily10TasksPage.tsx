import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  Circle,
  Calendar,
  TrendingUp,
  Target,
  Flame,
  DollarSign,
  Calendar as CalendarIcon,
  Home,
  Music,
  Utensils,
  Droplets,
} from 'lucide-react';
import { useDaily10Tasks } from '@/hooks/useDaily10Tasks';
import { DailyTask, TaskProgress } from '@/types/daily10';

const categoryIcons = {
  financial: DollarSign,
  planning: CalendarIcon,
  personal: Home,
  health: Target,
};

const categoryColors = {
  financial: 'bg-green-100 text-green-800',
  planning: 'bg-blue-100 text-blue-800',
  personal: 'bg-purple-100 text-purple-800',
  health: 'bg-red-100 text-red-800',
};

interface TaskItemProps {
  task: DailyTask;
  progress?: TaskProgress;
  onUpdate: (taskId: string, completed: boolean, notes?: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, progress, onUpdate }) => {
  const [notes, setNotes] = useState(progress?.notes || '');
  const [showNotes, setShowNotes] = useState(false);
  const IconComponent = categoryIcons[task.category];

  const handleToggle = (completed: boolean) => {
    onUpdate(task.id, completed, notes);
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    if (progress?.completed) {
      onUpdate(task.id, true, newNotes);
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={progress?.completed || false}
            onCheckedChange={handleToggle}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <IconComponent className="h-4 w-4" />
              <h3 className="font-medium">{task.name}</h3>
              <Badge className={categoryColors[task.category]}>{task.category}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
            {progress?.completed && progress.completedAt && (
              <p className="text-xs text-green-600 mb-2">
                完了: {new Date(progress.completedAt).toLocaleTimeString('ja-JP')}
              </p>
            )}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowNotes(!showNotes)}>
                メモ
              </Button>
              {showNotes && (
                <Textarea
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="メモを入力..."
                  className="mt-2"
                  rows={2}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Daily10TasksPage: React.FC = () => {
  const { tasks, progress, stats, isLoading, error, updateProgress } = useDaily10Tasks();
  const [activeTab, setActiveTab] = useState('tasks');

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const completedTasks = progress?.tasks
    ? Object.values(progress.tasks).filter((p) => p.completed).length
    : 0;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">必ず毎日やる10のこと</h1>
        <p className="text-gray-600">毎日の習慣を継続して、目標を達成しましょう</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 進捗サマリー */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>今日の進捗</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {completedTasks}/{totalTasks}
              </div>
              <Progress value={completionRate} className="mb-2" />
              <p className="text-sm text-gray-600">{completionRate}% 完了</p>
            </div>
          </CardContent>
        </Card>

        {/* 連続実行日数 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Flame className="h-5 w-5" />
              <span>連続実行</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {progress?.streak || 0}日
              </div>
              <p className="text-sm text-gray-600">連続実行中</p>
            </div>
          </CardContent>
        </Card>

        {/* 統計情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>統計</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">平均完了率</span>
                <span className="text-sm font-medium">{stats?.averageCompletionRate || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">最長記録</span>
                <span className="text-sm font-medium">{stats?.longestStreak || 0}日</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">タスク一覧</TabsTrigger>
          <TabsTrigger value="stats">統計</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                progress={progress?.tasks[task.id]}
                onUpdate={updateProgress}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 週別統計 */}
            <Card>
              <CardHeader>
                <CardTitle>週別完了率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.weeklyStats.map((week) => (
                    <div key={week.week} className="flex justify-between items-center">
                      <span className="text-sm">{week.week}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={week.completionRate} className="w-20" />
                        <span className="text-sm font-medium">{week.completionRate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 月別統計 */}
            <Card>
              <CardHeader>
                <CardTitle>月別完了率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.monthlyStats.map((month) => (
                    <div key={month.month} className="flex justify-between items-center">
                      <span className="text-sm">{month.month}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={month.completionRate} className="w-20" />
                        <span className="text-sm font-medium">{month.completionRate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Daily10TasksPage;
