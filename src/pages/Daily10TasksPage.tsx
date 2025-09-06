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
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useAuth } from '@/hooks/useAuth';
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
    '2': { href: '/bank-accounts', label: '銀行口座管理', icon: '🏦' },
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
  mainAccount?: any;
  bankLoading?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  progress,
  onUpdate,
  mainAccount,
  bankLoading,
}) => {
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

    // メイン銀行口座の情報を含むメッセージ
    if (task.id === '2') {
      if (mainAccount) {
        return `🏦 メイン銀行口座「${mainAccount.bankName} ${mainAccount.accountName}」の入出金履歴を確認しよう！${mainAccount.lastBalance ? ` 現在の残高: ${mainAccount.lastBalance.toLocaleString()}円` : ''}`;
      } else if (!bankLoading) {
        return '🏦 メイン銀行口座を登録してから、入出金履歴を確認しよう！銀行口座管理ページで登録できます。';
      }
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

            {/* 詳細な手順説明 */}
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-1">
                <Target className="h-4 w-4" />
                このタスクの進め方
              </h4>
              <div className="text-xs text-blue-800 space-y-1">
                {task.id === '1' && (
                  <div>
                    <p className="font-medium mb-1">💰 直近3ヶ月の収入と支出をすべて把握する</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>「サブタスクを表示」をクリックして10個のサブタスクを確認</li>
                      <li>各サブタスクの「手順を表示」で具体的な手順を確認</li>
                      <li>財布の現金、銀行残高、投資残高を順番に確認</li>
                      <li>資産管理ページで入力（自動で「毎日20のこと」に反映）</li>
                      <li>給与明細、ボーナス、副業収入を確認</li>
                      <li>固定費・変動費の支出を確認</li>
                    </ol>
                  </div>
                )}
                {task.id === '2' && (
                  <div>
                    <p className="font-medium mb-1">🏦 現在の資産と負債をすべて把握する</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>銀行口座管理ページでメイン口座を登録</li>
                      <li>銀行データ取り込み機能でCSVファイルをアップロード</li>
                      <li>資産負債レポートページで全体を確認</li>
                      <li>投資口座、クレジットカード残高も確認</li>
                    </ol>
                  </div>
                )}
                {task.id === '3' && (
                  <div>
                    <p className="font-medium mb-1">📅 現在から3ヶ月後までの予定をすべて把握する</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>カレンダーアプリを開く（Googleカレンダー、Outlook等）</li>
                      <li>3ヶ月先までスケジュールを確認</li>
                      <li>重要な予定をメモに記録</li>
                      <li>定期的な予定（会議、支払い日等）を確認</li>
                    </ol>
                  </div>
                )}
                {task.id === '4' && (
                  <div>
                    <p className="font-medium mb-1">
                      💳 先月と今月の固定費の支払いと支払日をすべて把握
                    </p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>家賃、光熱費、通信費、保険料等の固定費をリストアップ</li>
                      <li>各支払いの支払日を確認</li>
                      <li>支払い状況（完了/未完了）をチェック</li>
                      <li>今月の支払い予定を確認</li>
                    </ol>
                  </div>
                )}
                {task.id === '5' && (
                  <div>
                    <p className="font-medium mb-1">💸 直近3ヶ月の利息の支払いをすべて把握</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>クレジットカードの利息支払いを確認</li>
                      <li>ローン（住宅ローン、カーローン等）の利息を確認</li>
                      <li>借入金の利息支払いを確認</li>
                      <li>支払い総額と支払い日を記録</li>
                    </ol>
                  </div>
                )}
                {task.id === '6' && (
                  <div>
                    <p className="font-medium mb-1">⚡ 直近3ヶ月の光熱費の支払いをすべて把握</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>電気代の請求書を確認</li>
                      <li>ガス代の請求書を確認</li>
                      <li>水道代の請求書を確認</li>
                      <li>使用量の変化をチェック</li>
                    </ol>
                  </div>
                )}
                {task.id === '7' && (
                  <div>
                    <p className="font-medium mb-1">🎸 ギターの練習</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>ギターを手に取る</li>
                      <li>基本練習（コード、スケール等）を5分間</li>
                      <li>好きな曲を1曲練習</li>
                      <li>練習内容を記録（任意）</li>
                    </ol>
                  </div>
                )}
                {task.id === '8' && (
                  <div>
                    <p className="font-medium mb-1">🍽️ 洗い物</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>シンクの食器を確認</li>
                      <li>食器用洗剤を準備</li>
                      <li>食器を洗って乾かす</li>
                      <li>キッチンを清潔に保つ</li>
                    </ol>
                  </div>
                )}
                {task.id === '9' && (
                  <div>
                    <p className="font-medium mb-1">👨‍🍳 自炊</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>冷蔵庫の中身を確認</li>
                      <li>今日のメニューを決める</li>
                      <li>食材を準備して調理</li>
                      <li>食事を楽しむ</li>
                    </ol>
                  </div>
                )}
                {task.id === '10' && (
                  <div>
                    <p className="font-medium mb-1">🛁 風呂</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>お風呂の準備をする</li>
                      <li>入浴して体を洗う</li>
                      <li>リラックスして疲れを癒す</li>
                      <li>清潔な体で一日を終える</li>
                    </ol>
                  </div>
                )}
                {!['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(task.id) && (
                  <div>
                    <p className="font-medium mb-1">📝 このタスクの進め方</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>「サブタスクを表示」をクリックして詳細を確認</li>
                      <li>各サブタスクの「手順を表示」で具体的な手順を確認</li>
                      <li>5分以内で完了できるように取り組む</li>
                      <li>完了したらチェックボックスをクリック</li>
                    </ol>
                  </div>
                )}
              </div>
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
                {task.subtasks && Array.isArray(task.subtasks)
                  ? task.subtasks.map((subtask) => {
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
                                    {subtask.steps && Array.isArray(subtask.steps)
                                      ? subtask.steps.map((step, index) => (
                                          <li key={index} className="leading-relaxed">
                                            {step}
                                          </li>
                                        ))
                                      : null}
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
                    })
                  : null}
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
  const { user } = useAuth();
  const { mainAccount, isLoading: bankLoading } = useBankAccounts(user?.id || '');
  const [activeTab, setActiveTab] = useState('tasks');

  // タスクデータの検証（本番環境では非表示）
  if (process.env.NODE_ENV === 'development') {
    console.log('Tasks data:', tasks);
    console.log('First task subtasks:', tasks[0]?.subtasks);
    console.log('First task subtasks length:', tasks[0]?.subtasks?.length);
    console.log('Tasks length:', tasks.length);
    console.log('Is loading:', isLoading);
    console.log('Error:', error);
  }

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

        {/* クイックスタートガイド */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Target className="h-5 w-5 text-green-600 mt-0.5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-900 mb-2">🚀 クイックスタートガイド</h3>
              <div className="text-sm text-green-800 space-y-1">
                <p>
                  <strong>1. まず最初に：</strong>
                  「直近3ヶ月の収入と支出をすべて把握する」から始めましょう
                </p>
                <p>
                  <strong>2. サブタスクを確認：</strong>
                  「サブタスクを表示」ボタンで10個のステップを確認
                </p>
                <p>
                  <strong>3. 手順を確認：</strong>各サブタスクの「手順を表示」で具体的なやり方を見る
                </p>
                <p>
                  <strong>4. 実行：</strong>5分以内で完了できるように取り組む
                </p>
                <p>
                  <strong>5. チェック：</strong>完了したらチェックボックスをクリック
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 動的メッセージ表示 */}
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
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

      {/* 詳細な使い方ガイド */}
      <div className="mb-6 space-y-4">
        {/* 基本操作ガイド */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Target className="h-5 w-5" />
            基本操作ガイド
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-700">
            <div>
              <h4 className="font-semibold mb-2 text-blue-900">📋 タスクの進め方</h4>
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  <strong>タスクを選択</strong> - 下のリストから取り組みたいタスクを選ぶ
                </li>
                <li>
                  <strong>サブタスクを確認</strong> - 「サブタスクを表示」ボタンをクリック
                </li>
                <li>
                  <strong>手順を確認</strong> - 「手順を表示」ボタンで具体的な手順を見る
                </li>
                <li>
                  <strong>実行</strong> - 手順に従って5分以内でタスクを完了
                </li>
                <li>
                  <strong>チェック</strong> - 完了したサブタスクのチェックボックスをクリック
                </li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-blue-900">✅ 進捗の管理</h4>
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  <strong>サブタスク完了</strong> - 各サブタスクのチェックボックスをクリック
                </li>
                <li>
                  <strong>メインタスク完了</strong> - 全サブタスク完了で自動的に完了
                </li>
                <li>
                  <strong>自動連携</strong> - 資産管理ページでの入力は自動反映
                </li>
                <li>
                  <strong>進捗確認</strong> - 上部の進捗バーで全体の進捗を確認
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* 重要なタスクの詳細説明 */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            重要なタスクの詳細説明
          </h3>
          <div className="space-y-4 text-sm text-green-700">
            <div className="p-3 bg-white rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">
                💰 直近3ヶ月の収入と支出をすべて把握する
              </h4>
              <p className="mb-2">このタスクは10個のサブタスクに分かれています：</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>財布の中の現金残高を確認（5分）</li>
                <li>銀行口座の残高を確認（5分）</li>
                <li>投資口座の残高を確認（5分）</li>
                <li>クレジットカードの未払い残高を確認（5分）</li>
                <li>資産管理ページに入力（5分）</li>
                <li>給与明細を確認（5分）</li>
                <li>ボーナス支給を確認（5分）</li>
                <li>副業収入を確認（5分）</li>
                <li>固定費の支払いを確認（5分）</li>
                <li>変動費の支出を確認（5分）</li>
              </ol>
            </div>
            <div className="p-3 bg-white rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">
                🏦 現在の資産と負債をすべて把握する
              </h4>
              <p className="mb-2">このタスクは銀行口座管理と連携しています：</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>メイン銀行口座を登録（銀行口座管理ページ）</li>
                <li>銀行データ取り込み機能を使用</li>
                <li>資産負債レポートページで確認</li>
                <li>自動的に「毎日20のこと」に反映</li>
              </ul>
            </div>
          </div>
        </div>

        {/* よくある質問 */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            <Circle className="h-5 w-5" />
            よくある質問
          </h3>
          <div className="space-y-3 text-sm text-yellow-700">
            <div>
              <h4 className="font-semibold text-yellow-900">Q: サブタスクが表示されません</h4>
              <p>
                A:
                「サブタスクを表示」ボタンをクリックしてください。一部のタスクにはサブタスクが定義されていない場合があります。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-900">Q: 手順が分からない</h4>
              <p>
                A: 各サブタスクの「手順を表示」ボタンをクリックすると、具体的な手順が表示されます。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-900">Q: 進捗が保存されません</h4>
              <p>
                A:
                ブラウザの更新ボタンを押すか、ページを再読み込みしてください。進捗は自動的に保存されます。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-900">Q: 銀行口座の情報が表示されません</h4>
              <p>
                A:
                銀行口座管理ページでメイン銀行口座を登録してください。登録後、このページで口座情報が表示されます。
              </p>
            </div>
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
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  progress={progress?.tasks[task.id]}
                  onUpdate={updateProgress}
                  mainAccount={mainAccount}
                  bankLoading={bankLoading}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {isLoading ? 'タスクを読み込み中...' : 'タスクが見つかりません'}
              </div>
            )}
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
                  {stats?.weeklyStats && stats.weeklyStats.length > 0 ? (
                    stats.weeklyStats.map((week) => (
                      <div key={week.week} className="flex justify-between items-center">
                        <span className="text-sm">{week.week}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={week.completionRate} className="w-20" />
                          <span className="text-sm font-medium">{week.completionRate}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      週別データがありません
                    </div>
                  )}
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
                  {stats?.monthlyStats && stats.monthlyStats.length > 0 ? (
                    stats.monthlyStats.map((month) => (
                      <div key={month.month} className="flex justify-between items-center">
                        <span className="text-sm">{month.month}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={month.completionRate} className="w-20" />
                          <span className="text-sm font-medium">{month.completionRate}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      月別データがありません
                    </div>
                  )}
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
