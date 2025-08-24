// src/pages/QuadrantDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { selectAllTodos } from '@/components/dailyToDoReminder/store/selectors/todoSelectors';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { EisenhowerMatrix } from '@/components/quadrant/EisenhowerMatrix';
import QuadrantUsageGuide from '@/components/help/QuadrantUsageGuide';
import TaskInputForm from '@/components/quadrant/TaskInputForm';
import {
  QuadrantAnalysisResult,
  UnifiedTaskData,
} from '@/services/ai/QuadrantClassificationService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import {
  Settings,
  Download,
  Share2,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Clock,
  Target,
  AlertTriangle,
  Users,
  Calendar,
  Activity,
  Brain,
  RefreshCw,
  FileText,
  BarChart3,
  PieChart,
  Filter,
  Search,
} from 'lucide-react';

/**
 * 4象限俯瞰ダッシュボードページ
 */
const QuadrantDashboard: React.FC = () => {
  const { user } = useAuth();
  const todos = useSelector(selectAllTodos);
  const [customTasks, setCustomTasks] = useState<UnifiedTaskData[]>([]);

  // ダッシュボード設定
  const [settings, setSettings] = useState({
    autoRefresh: true,
    refreshInterval: 5, // minutes
    showAnalytics: true,
    enableNotifications: true,
    displayMode: 'grid' as 'grid' | 'list',
    filterCompleted: false,
  });

  // 分析結果の状態
  const [currentAnalysis, setCurrentAnalysis] = useState<QuadrantAnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<QuadrantAnalysisResult[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showUsageGuide, setShowUsageGuide] = useState(false);

  // タスク管理
  const handleTaskAdd = (newTask: UnifiedTaskData) => {
    setCustomTasks((prev) => [...prev, newTask]);
    toast.success('タスクが追加されました。AI分析を実行中...');
  };

  const handleTasksImport = (tasks: UnifiedTaskData[]) => {
    setCustomTasks((prev) => [...prev, ...tasks]);
    toast.success(`${tasks.length}個のサンプルタスクがインポートされました`);
  };

  // 統合タスクリスト（Todo + カスタムタスク）
  const allTasks = [...(todos || []), ...customTasks];

  // タスクのフィルタリング
  const filteredTasks = React.useMemo(() => {
    console.log('🔍 フィルタリング開始:', {
      todosType: typeof allTasks,
      todosIsArray: Array.isArray(allTasks),
      todosLength: allTasks?.length,
      firstTodoSample: allTasks?.[0],
    });

    if (!allTasks || !Array.isArray(allTasks)) {
      console.warn('🚨 allTasks が無効な値です:', allTasks);
      return [];
    }

    // より詳細なデバッグ情報
    const validTasks = allTasks.filter((task, index) => {
      const isValid = task !== null && task !== undefined && typeof task === 'object';
      if (!isValid) {
        console.warn(`🚨 無効なタスク[${index}]:`, task);
      }
      return isValid;
    });

    console.log('✅ 有効なタスク数:', validTasks.length);
    console.log('📝 有効なタスクのサンプル:', validTasks.slice(0, 3));

    // 型ガードをより寛容に変更
    let filtered = validTasks.filter((task): task is any => {
      // 必要最小限のプロパティをチェック
      return (
        task &&
        typeof task === 'object' &&
        ('_id' in task || 'id' in task) &&
        ('task' in task || 'title' in task)
      );
    });

    console.log('🔍 型チェック後のタスク数:', filtered.length);

    // 完了タスクのフィルタリング
    if (settings.filterCompleted) {
      const beforeFilter = filtered.length;
      filtered = filtered.filter((task: any) => !task.completed);
      console.log(`🗂️ 完了タスクフィルタ: ${beforeFilter} → ${filtered.length}`);
    }

    console.log('📋 最終フィルタリング結果:', {
      original: todos.length,
      valid: validTasks.length,
      typeChecked: filtered.length,
      filterCompleted: settings.filterCompleted,
      sampleFilteredTask: filtered[0],
    });

    return filtered;
  }, [allTasks, settings.filterCompleted]);

  // 分析結果の保存
  const handleAnalysisComplete = (analysis: QuadrantAnalysisResult) => {
    setCurrentAnalysis(analysis);

    // 履歴に追加（最新5件まで保持）
    setAnalysisHistory((prev) => {
      const newHistory = [
        {
          ...analysis,
          timestamp: new Date(),
        },
        ...prev,
      ].slice(0, 5);
      return newHistory;
    });

    // 通知が有効な場合のアラート
    if (settings.enableNotifications) {
      if (analysis.quadrantBreakdown.essential.count > analysis.totalTasks * 0.3) {
        toast('⚠️ 緊急タスクが多すぎます。優先度の見直しをおすすめします。', {
          icon: '⚠️',
          duration: 4000,
        });
      }
      if (analysis.productivity.score < 60) {
        toast('ℹ️ 生産性スコアが低めです。タスクの整理を検討してください。', {
          icon: 'ℹ️',
          duration: 4000,
        });
      }
    }
  };

  // タスククリック時の処理
  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    console.log('タスクが選択されました:', task);
  };

  // レポート出力
  const handleExportReport = () => {
    if (!currentAnalysis) {
      toast.error('分析結果がありません');
      return;
    }

    const report = {
      timestamp: new Date().toISOString(),
      user: user?.email || user?.name || '未知のユーザー',
      analysis: currentAnalysis,
      settings: settings,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quadrant-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('分析レポートをダウンロードしました');
  };

  // 分析結果の共有
  const handleShareAnalysis = async () => {
    if (!currentAnalysis) {
      toast.error('分析結果がありません');
      return;
    }

    const shareText = `🎯 4象限タスク分析結果

📊 総タスク数: ${currentAnalysis.totalTasks}件
📈 生産性スコア: ${currentAnalysis.productivity.score}/100

🔥 必須タスク: ${currentAnalysis.quadrantBreakdown.essential.count}件
📈 効果性タスク: ${currentAnalysis.quadrantBreakdown.effectiveness.count}件
⚡ 錯覚タスク: ${currentAnalysis.quadrantBreakdown.illusion.count}件
🗑️ 浪費タスク: ${currentAnalysis.quadrantBreakdown.waste.count}件

#生産性 #タスク管理 #アイゼンハワーマトリックス`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '4象限タスク分析結果',
          text: shareText,
        });
        toast.success('分析結果を共有しました');
      } catch (error) {
        console.error('共有エラー:', error);
      }
    } else {
      // フォールバック: クリップボードにコピー
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success('分析結果をクリップボードにコピーしました');
      } catch (error) {
        toast.error('クリップボードへのコピーに失敗しました');
      }
    }
  };

  // 設定の保存（LocalStorage）
  useEffect(() => {
    const savedSettings = localStorage.getItem('quadrant-dashboard-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('設定読み込みエラー:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('quadrant-dashboard-settings', JSON.stringify(settings));
  }, [settings]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <span>4象限タスク俯瞰ダッシュボード</span>
          </h1>
          <p className="text-gray-600 mt-2">Gemini AI による自動タスク分類と生産性分析</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowUsageGuide(true)}
            variant="outline"
            size="sm"
            className="bg-blue-50 hover:bg-blue-100 border-blue-200"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            使用方法
          </Button>
          <Button onClick={handleExportReport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            レポート出力
          </Button>
          <Button onClick={handleShareAnalysis} variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            結果共有
          </Button>
        </div>
      </div>

      {/* クイック統計 */}
      {currentAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">総タスク数</p>
                  <p className="text-2xl font-bold">{currentAnalysis.totalTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">生産性スコア</p>
                  <p className="text-2xl font-bold">{currentAnalysis.productivity.score}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">緊急タスク</p>
                  <p className="text-2xl font-bold">
                    {currentAnalysis.quadrantBreakdown.essential.count}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">重要タスク</p>
                  <p className="text-2xl font-bold">
                    {currentAnalysis.quadrantBreakdown.effectiveness.count}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm text-gray-600">効果性割合</p>
                  <p className="text-2xl font-bold">
                    {Math.round(currentAnalysis.quadrantBreakdown.effectiveness.percentage)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* メインコンテンツ */}
      <Tabs defaultValue="matrix" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="input">タスク入力</TabsTrigger>
          <TabsTrigger value="matrix">4象限マトリックス</TabsTrigger>
          <TabsTrigger value="analytics">分析・レポート</TabsTrigger>
          <TabsTrigger value="history">履歴・トレンド</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
        </TabsList>

        {/* タスク入力タブ */}
        <TabsContent value="input" className="space-y-6">
          <TaskInputForm onTaskAdd={handleTaskAdd} onTasksImport={handleTasksImport} />

          {customTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>追加されたタスク ({customTasks.length}件)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {customTasks.map((task) => (
                    <div key={task.id} className="p-3 border rounded-lg">
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-gray-600">
                        {task.description && <div className="mt-1">{task.description}</div>}
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          {task.category && <span>📂 {task.category}</span>}
                          {task.estimatedTime && <span>⏱️ {task.estimatedTime}分</span>}
                          {task.deadline && (
                            <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* メイン4象限マトリックス */}
        <TabsContent value="matrix" className="space-y-6">
          <EisenhowerMatrix
            tasks={filteredTasks}
            onTaskClick={handleTaskClick}
            onQuadrantAnalysis={handleAnalysisComplete}
            showAnalytics={settings.showAnalytics}
            autoRefresh={settings.autoRefresh}
            refreshInterval={settings.refreshInterval}
            className="min-h-[600px]"
          />

          {/* 選択されたタスクの詳細 */}
          {selectedTask && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>選択されたタスクの詳細</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">{selectedTask.title || selectedTask.task}</h3>
                    <p className="text-gray-600 mt-1">
                      {selectedTask.description || selectedTask.note || '説明なし'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {selectedTask.category && (
                      <Badge variant="secondary">{selectedTask.category}</Badge>
                    )}
                    {selectedTask.priority && (
                      <Badge variant="outline">優先度: {selectedTask.priority}</Badge>
                    )}
                    {selectedTask.deadline && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        期限: {new Date(selectedTask.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 分析・レポート */}
        <TabsContent value="analytics" className="space-y-6">
          {currentAnalysis ? (
            <div className="space-y-6">
              {/* 生産性インサイト */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5" />
                    <span>AI インサイト</span>
                  </CardTitle>
                  <CardDescription>Gemini AI による分析とアドバイス</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentAnalysis.productivity.insights.map((insight, index) => (
                      <Alert key={index}>
                        <Brain className="h-4 w-4" />
                        <AlertDescription>{insight}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 時間配分の分析 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5" />
                    <span>時間配分分析</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(currentAnalysis.timeDistribution).map(
                      ([quadrant, percentage]) => (
                        <div key={quadrant} className="text-center">
                          <div className="text-2xl font-bold">{percentage}%</div>
                          <div className="text-sm text-gray-600 capitalize">{quadrant}</div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 推奨アクション */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-600">今すぐ実行</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {currentAnalysis.recommendations.focus.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-amber-600">委任検討</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {currentAnalysis.recommendations.delegate.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Users className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                分析結果がありません。メインタブでタスクを分析してください。
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* 履歴・トレンド */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>分析履歴</span>
              </CardTitle>
              <CardDescription>過去の分析結果とトレンド</CardDescription>
            </CardHeader>
            <CardContent>
              {analysisHistory.length > 0 ? (
                <div className="space-y-4">
                  {analysisHistory.map((analysis, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{new Date().toLocaleString()}</p>
                          <p className="text-sm text-gray-600">
                            タスク数: {analysis.totalTasks}, 生産性: {analysis.productivity.score}
                            /100
                          </p>
                        </div>
                        <Badge
                          variant={analysis.productivity.score >= 70 ? 'default' : 'secondary'}
                        >
                          {analysis.productivity.score >= 70 ? '良好' : '要改善'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="text-red-600">
                          必須: {analysis.quadrantBreakdown.essential.count}
                        </div>
                        <div className="text-blue-600">
                          効果性: {analysis.quadrantBreakdown.effectiveness.count}
                        </div>
                        <div className="text-amber-600">
                          錯覚: {analysis.quadrantBreakdown.illusion.count}
                        </div>
                        <div className="text-gray-600">
                          浪費: {analysis.quadrantBreakdown.waste.count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>分析履歴がありません</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 設定 */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>ダッシュボード設定</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">自動更新</p>
                  <p className="text-sm text-gray-600">定期的にタスクを再分析</p>
                </div>
                <Switch
                  checked={settings.autoRefresh}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, autoRefresh: checked }))
                  }
                />
              </div>

              {settings.autoRefresh && (
                <div>
                  <p className="font-medium mb-2">更新間隔: {settings.refreshInterval}分</p>
                  <Slider
                    value={[settings.refreshInterval]}
                    onValueChange={([value]) =>
                      setSettings((prev) => ({ ...prev, refreshInterval: value }))
                    }
                    min={1}
                    max={60}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">分析レポート表示</p>
                  <p className="text-sm text-gray-600">チャートと詳細分析を表示</p>
                </div>
                <Switch
                  checked={settings.showAnalytics}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, showAnalytics: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">通知</p>
                  <p className="text-sm text-gray-600">重要な洞察を通知</p>
                </div>
                <Switch
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, enableNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">完了タスクをフィルタ</p>
                  <p className="text-sm text-gray-600">完了済みタスクを非表示</p>
                </div>
                <Switch
                  checked={settings.filterCompleted}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, filterCompleted: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>使い方ガイド</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">4象限マトリックス</p>
                    <p className="text-sm text-gray-600">
                      タスクは重要度と緊急度によって自動的に4つの象限に分類されます
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Brain className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">AI分析</p>
                    <p className="text-sm text-gray-600">
                      Gemini AIがタスクの内容を分析し、最適な分類と推奨アクションを提案します
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">生産性スコア</p>
                    <p className="text-sm text-gray-600">
                      効果性タスクの割合に基づいて生産性を評価し、改善提案をします
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 使用ガイドモーダル */}
      <QuadrantUsageGuide
        isOpen={showUsageGuide}
        onClose={() => setShowUsageGuide(false)}
        showAsModal={true}
      />
    </div>
  );
};

export default QuadrantDashboard;
