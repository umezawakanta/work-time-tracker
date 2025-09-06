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
  BookOpen,
  Code,
  Newspaper,
  FileText,
  Refrigerator,
  Sparkles,
  Shirt,
  Sun,
  Folders,
  Archive,
  ExternalLink,
} from 'lucide-react';
import { useDaily10Tasks } from '@/hooks/useDaily10Tasks';
import { DailyTask, TaskProgress } from '@/types/daily10';

const categoryIcons = {
  finance: DollarSign,
  planning: CalendarIcon,
  personal: Home,
  hobby: Music,
  household: Utensils,
  work: Code,
};

// 個別タスク用のアイコンマッピング
const taskIcons: { [key: string]: React.ComponentType<any> } = {
  '1': DollarSign,
  '2': DollarSign,
  '3': CalendarIcon,
  '4': DollarSign,
  '5': DollarSign,
  '6': DollarSign,
  '7': Music,
  '8': Utensils,
  '9': Utensils,
  '10': Droplets,
  '11': BookOpen,
  '12': Code,
  '13': Newspaper,
  '14': FileText,
  '15': Refrigerator,
  '16': Sparkles,
  '17': Shirt,
  '18': Sun,
  '19': Folders,
  '20': Archive,
};

const categoryColors = {
  finance: 'bg-green-100 text-green-800',
  planning: 'bg-blue-100 text-blue-800',
  personal: 'bg-purple-100 text-purple-800',
  hobby: 'bg-yellow-100 text-yellow-800',
  household: 'bg-orange-100 text-orange-800',
  work: 'bg-indigo-100 text-indigo-800',
};

// タスクに対応するページのリンクを生成
const getTaskLink = (taskId: string) => {
  const taskLinks: { [key: string]: { href: string; label: string; icon: string } } = {
    '1': { href: '/asset-liability-report', label: '資産負債レポート', icon: '📊' },
    '2': { href: '/asset-liability-report', label: '資産負債レポート', icon: '📊' },
    '3': { href: '/calendar', label: 'カレンダー', icon: '📅' },
    '4': { href: '/subscriptions', label: 'サブスクリプション管理', icon: '💳' },
    '5': { href: '/debt', label: '負債管理', icon: '💸' },
    '6': { href: '/utilities', label: '光熱費管理', icon: '⚡' },
    '7': { href: '/guitar-practice', label: 'ギター練習記録', icon: '🎸' },
    '8': { href: '/household', label: '家事管理', icon: '🍽️' },
    '9': { href: '/cooking', label: '料理管理', icon: '👨‍🍳' },
    '10': { href: '/personal-care', label: '個人ケア', icon: '🛁' },
    '11': { href: '/reading', label: '読書記録', icon: '📚' },
    '12': { href: '/development', label: '開発進捗', icon: '💻' },
    '13': { href: '/household', label: '家事管理', icon: '📰' },
    '14': { href: '/household', label: '家事管理', icon: '📄' },
    '15': { href: '/cooking', label: '料理管理', icon: '❄️' },
    '16': { href: '/household', label: '家事管理', icon: '🧹' },
    '17': { href: '/household', label: '家事管理', icon: '👕' },
    '18': { href: '/household', label: '家事管理', icon: '☀️' },
    '19': { href: '/household', label: '家事管理', icon: '👔' },
    '20': { href: '/household', label: '家事管理', icon: '📦' },
  };

  return taskLinks[taskId] || null;
};

interface TaskItemProps {
  task: DailyTask;
  progress?: TaskProgress;
  onUpdate: (taskId: string, completed: boolean, notes?: string, subtaskId?: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, progress, onUpdate }) => {
  const [notes, setNotes] = useState(progress?.notes || '');
  const [showNotes, setShowNotes] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showStepsStates, setShowStepsStates] = useState<Record<string, boolean>>({});
  const IconComponent = taskIcons[task.id] || categoryIcons[task.category] || Circle;

  const handleToggle = (completed: boolean) => {
    onUpdate(task.id, completed, notes);
  };

  const handleSubtaskToggle = (subtaskId: string, completed: boolean) => {
    onUpdate(task.id, completed, notes, subtaskId);
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    if (progress?.completed) {
      onUpdate(task.id, true, newNotes);
    }
  };

  const completedSubtasks = progress?.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  // リンク情報を一度だけ取得
  const taskLink = getTaskLink(task.id);

  // タスク固有のメッセージを生成
  const getTaskMessage = () => {
    if (progress?.completed) {
      return '✅ 完了しました！お疲れ様でした。';
    }

    const taskMessages: { [key: string]: string } = {
      '1': '💰 財布の中の現金残高を確認して、資産管理ページに入力しろ！',
      '2': '📊 銀行口座の残高をチェックして、資産状況を把握しよう！',
      '3': '📅 カレンダーを開いて、今後の予定を確認しよう！',
      '4': '💳 固定費の支払い状況をチェックして、家計を管理しよう！',
      '5': '💸 利息の支払いを確認して、お金の無駄をなくそう！',
      '6': '⚡ 光熱費の使用量をチェックして、節約を心がけよう！',
      '7': '🎸 ギターを手に取って、今日も練習しよう！',
      '8': '🍽️ 食器を洗って、キッチンを清潔に保とう！',
      '9': '👨‍🍳 冷蔵庫を開けて、今日の料理を決めよう！',
      '10': '🛁 お風呂に入って、一日の疲れを癒そう！',
      '11': '📚 本を開いて、知識を深めよう！',
      '12': '💻 コードを書いて、このサイトをより良くしよう！',
      '13': '📰 古い新聞を整理して、部屋をすっきりさせよう！',
      '14': '📄 チラシを分別して、リサイクルに協力しよう！',
      '15': '❄️ 冷蔵庫の中身を確認して、食材を無駄にしないようにしよう！',
      '16': '🧹 掃除機をかけて、床をきれいにしよう！',
      '17': '👕 洗濯物を集めて、清潔な衣類を保とう！',
      '18': '☀️ 洗濯物を干して、太陽の光で乾かそう！',
      '19': '👔 洗濯物をたたんで、整理整頓しよう！',
      '20': '📦 押入れを整理して、収納をスッキリさせよう！',
    };

    return taskMessages[task.id] || 'このタスクに取り組んでみましょう！';
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
              {task.subtasks && task.subtasks.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {completedSubtasks}/{totalSubtasks} サブタスク
                </Badge>
              )}
            </div>

            {/* タスク固有のメッセージ */}
            <div className="mb-3 p-2 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">{getTaskMessage()}</p>
            </div>

            {/* タスク対応ページへのリンク */}
            {taskLink && (
              <div className="mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    window.open(taskLink.href, '_blank');
                  }}
                >
                  <span className="mr-2">{taskLink.icon}</span>
                  {taskLink.label}ページを開く
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              </div>
            )}

            {/* サブタスク進捗バー */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>サブタスク進捗</span>
                  <span>{Math.round(subtaskProgress)}%</span>
                </div>
                <Progress value={subtaskProgress} className="h-2" />
              </div>
            )}

            {/* サブタスク表示ボタン */}
            <div className="flex items-center space-x-2 mb-2">
              {/* デバッグ情報 */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500">Subtasks: {task.subtasks?.length || 0}</div>
              )}
              {task.subtasks && task.subtasks.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setShowSubtasks(!showSubtasks)}>
                  {showSubtasks ? 'サブタスクを隠す' : 'サブタスクを表示'} ({task.subtasks.length})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowNotes(!showNotes)}>
                メモ
              </Button>
            </div>

            {/* サブタスクの使い方説明 */}
            {task.subtasks && task.subtasks.length > 0 && !showSubtasks && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">📋 サブタスクの使い方</h4>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>「サブタスクを表示」ボタンをクリックしてサブタスク一覧を表示</li>
                  <li>各サブタスクの「手順を表示」ボタンで具体的な手順を確認</li>
                  <li>完了したサブタスクのチェックボックスをクリックして進捗を更新</li>
                  <li>すべてのサブタスクが完了すると、メインタスクも自動完了</li>
                </ol>
              </div>
            )}

            {/* サブタスクがない場合の説明 */}
            {(!task.subtasks || task.subtasks.length === 0) && (
              <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">
                  ⚠️ サブタスクがありません
                </h4>
                <p className="text-xs text-yellow-700">
                  このタスクにはサブタスクが定義されていません。タスクを直接チェックして完了してください。
                </p>
              </div>
            )}

            {/* サブタスク一覧 */}
            {showSubtasks && task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-3 space-y-3 border-t pt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">サブタスク (各5分以内)</h4>
                {task.subtasks.map((subtask) => {
                  const subtaskProgress = progress?.subtasks?.find(
                    (st) => st.subtaskId === subtask.id
                  );
                  const showSteps = showStepsStates[subtask.id] || false;
                  const setShowSteps = (value: boolean) => {
                    setShowStepsStates((prev) => ({ ...prev, [subtask.id]: value }));
                  };

                  return (
                    <div key={subtask.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center space-x-2 text-sm mb-2">
                        <Checkbox
                          checked={subtaskProgress?.completed || false}
                          onCheckedChange={(checked) =>
                            handleSubtaskToggle(subtask.id, checked as boolean)
                          }
                          className="h-4 w-4"
                        />
                        <span
                          className={`flex-1 font-medium ${subtaskProgress?.completed ? 'line-through text-gray-500' : ''}`}
                        >
                          {subtask.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {subtask.estimatedMinutes}分
                        </Badge>
                      </div>

                      {/* 手順表示ボタン */}
                      {subtask.steps && subtask.steps.length > 0 && (
                        <div className="ml-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSteps(!showSteps)}
                            className="text-xs h-6 px-2"
                          >
                            {showSteps ? '手順を隠す' : '手順を表示'} ({subtask.steps.length}
                            ステップ)
                          </Button>

                          {/* 手順一覧 */}
                          {showSteps && (
                            <div className="mt-2 ml-2">
                              <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600">
                                {subtask.steps.map((step, index) => (
                                  <li key={index} className="leading-relaxed">
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 完了時刻表示 */}
                      {subtaskProgress?.completed && subtaskProgress.completedAt && (
                        <div className="ml-6 mt-1">
                          <span className="text-xs text-green-600">
                            完了:{' '}
                            {new Date(subtaskProgress.completedAt).toLocaleTimeString('ja-JP')}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {progress?.completed && progress.completedAt && (
              <p className="text-xs text-green-600 mb-2">
                完了: {new Date(progress.completedAt).toLocaleTimeString('ja-JP')}
              </p>
            )}

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
      </CardContent>
    </Card>
  );
};

const Daily10TasksPage: React.FC = () => {
  const { tasks, progress, stats, isLoading, error, updateProgress } = useDaily10Tasks();
  const [activeTab, setActiveTab] = useState('tasks');

  // デバッグ用：タスクデータの内容を確認
  console.log('Tasks data:', tasks);
  console.log('First task subtasks:', tasks[0]?.subtasks);
  console.log('First task subtasks length:', tasks[0]?.subtasks?.length);
  console.log('Tasks length:', tasks.length);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);

  // タスク状況に応じたメッセージを生成
  const getMotivationalMessage = () => {
    if (!progress?.tasks || tasks.length === 0) {
      return '今日も一日頑張りましょう！まずは最初のタスクから始めてみてください。';
    }

    const completedTasks = progress.tasks.filter((task) => task.completed).length;
    const totalTasks = tasks.length;
    const completionRate = (completedTasks / totalTasks) * 100;

    // 未完了のタスクを特定
    const incompleteTasks = tasks.filter((task) => {
      const taskProgress = progress.tasks.find((t) => t.taskId === task.id);
      return !taskProgress?.completed;
    });

    // 特定のタスクに基づくメッセージ
    const financeTasks = incompleteTasks.filter((task) => task.category === 'finance');
    const householdTasks = incompleteTasks.filter((task) => task.category === 'household');
    const personalTasks = incompleteTasks.filter((task) => task.category === 'personal');

    if (completionRate === 0) {
      return '今日はまだ何も始めていませんね。まずは「直近3ヶ月の収入と支出をすべて把握する」から始めてみませんか？';
    } else if (completionRate < 25) {
      if (financeTasks.length > 0) {
        return '財布の中の現金残高を確認して、資産管理ページに入力しろ！お金の管理は毎日が大切です。';
      }
      return 'いいスタートです！続けて次のタスクにも取り組んでみましょう。';
    } else if (completionRate < 50) {
      if (householdTasks.length > 0) {
        return '家事も大切なタスクです。洗い物や掃除を済ませて、清潔な環境を保ちましょう！';
      }
      return '順調に進んでいます！あと半分で今日の目標達成です。';
    } else if (completionRate < 75) {
      if (personalTasks.length > 0) {
        return '自分の時間も大切にしましょう。読書やギターの練習でリフレッシュしてください！';
      }
      return '素晴らしい進捗です！あと少しで今日の目標を達成できます。';
    } else if (completionRate < 100) {
      return 'もうすぐ完了です！最後の一押しで今日の目標を達成しましょう！';
    } else {
      return '🎉 おめでとうございます！今日の目標を100%達成しました！明日も頑張りましょう！';
    }
  };

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
        <h1 className="text-3xl font-bold mb-2">必ず毎日やる20のこと</h1>
        <p className="text-gray-600 mb-2">毎日の習慣を継続して、目標を達成しましょう</p>
        <p className="text-sm text-gray-500">
          各タスクは5分以内で完了できるサブタスクに分割されています
        </p>

        {/* 動的メッセージ表示 */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Target className="h-5 w-5 text-blue-600 mt-0.5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900 mb-1">今日のメッセージ</h3>
              <p className="text-sm text-blue-800">{getMotivationalMessage()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 使い方ガイド */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 mb-3">📚 使い方ガイド</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
          <div>
            <h4 className="font-medium mb-2">🔍 サブタスクの確認方法</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>各タスクの「サブタスクを表示」ボタンをクリック</li>
              <li>「手順を表示」ボタンで具体的な手順を確認</li>
              <li>各サブタスクは5分以内で完了可能</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium mb-2">✅ 進捗の更新方法</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>完了したサブタスクのチェックボックスをクリック</li>
              <li>すべてのサブタスクが完了するとメインタスクも自動完了</li>
              <li>資産管理ページでの入力は自動的に反映されます</li>
            </ol>
          </div>
        </div>
      </div>

      {/* デバッグ情報 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">🐛 デバッグ情報</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <div>タスク数: {tasks.length}</div>
            <div>ローディング中: {isLoading ? 'はい' : 'いいえ'}</div>
            <div>エラー: {error || 'なし'}</div>
            <div>最初のタスクのサブタスク数: {tasks[0]?.subtasks?.length || 0}</div>
            <Button onClick={() => window.location.reload()} size="sm" className="mt-2">
              ページを再読み込み
            </Button>
          </div>
        </div>
      )}

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
