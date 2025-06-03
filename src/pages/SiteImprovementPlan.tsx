import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Target,
  Package,
  Layers,
  Code,
  FileText,
  Rocket,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  GitBranch,
  Shield,
  Palette,
  Database,
  Globe,
  Play,
  Timer,
  Calendar,
  Bell,
  Users,
  FileSpreadsheet,
  Settings,
  Plus,
  ExternalLink,
  Activity,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ImprovementItem, PhaseData } from '@/types/implementation';
import { useImplementation } from '@/hooks/useImplementation';

const SiteImprovementPlan: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState<'phase0' | 'phase1' | 'phase2' | 'phase3'>(
    'phase0'
  );
  const [showImplementationDialog, setShowImplementationDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ImprovementItem | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string>('site-improvement-2024');

  const navigate = useNavigate();
  const {
    tasks,
    logs,
    currentProject,
    isLoading,
    error,
    createTaskFromImprovement,
    loadProject,
    refreshData,
  } = useImplementation(currentProjectId);

  // 改善項目データ
  const improvements: Record<string, ImprovementItem[]> = {
    phase0: [
      {
        id: 'realtime-clock',
        title: 'リアルタイム打刻機能',
        description: 'ワンクリック出勤・退勤、現在の勤務状態表示、自動時間計算、休憩時間管理',
        status: 'planned',
        priority: 'critical',
        category: 'feature',
        estimatedDays: 5,
        progress: 0,
      },
      {
        id: 'daily-summary',
        title: '日次勤務状況の可視化',
        description: '当日の出勤・退勤時間、実働時間と休憩時間の分離、残業時間の計算',
        status: 'planned',
        priority: 'critical',
        category: 'feature',
        estimatedDays: 3,
        progress: 0,
        dependencies: ['realtime-clock'],
      },
      {
        id: 'monthly-timesheet',
        title: '月次勤怠集計',
        description: '月次総労働時間、残業時間集計、有給・欠勤管理、CSV/PDFエクスポート',
        status: 'planned',
        priority: 'critical',
        category: 'feature',
        estimatedDays: 4,
        progress: 0,
        dependencies: ['daily-summary'],
      },
      {
        id: 'work-patterns',
        title: '勤務パターン設定',
        description: '標準勤務時間の設定、休憩時間の設定、残業の自動計算基準、労働時間上限設定',
        status: 'planned',
        priority: 'high',
        category: 'feature',
        estimatedDays: 3,
        progress: 0,
      },
      {
        id: 'alert-notifications',
        title: 'アラート・通知機能',
        description: '出勤打刻忘れアラート、退勤時間のリマインダー、残業時間の警告、労働時間通知',
        status: 'planned',
        priority: 'high',
        category: 'feature',
        estimatedDays: 3,
        progress: 0,
        dependencies: ['work-patterns'],
      },
      {
        id: 'approval-workflow',
        title: '承認ワークフロー',
        description: '勤怠データの承認申請、管理者による承認・差し戻し、修正申請機能',
        status: 'planned',
        priority: 'medium',
        category: 'feature',
        estimatedDays: 7,
        progress: 0,
        dependencies: ['monthly-timesheet'],
      },
    ],
    phase1: [
      {
        id: 'ui-unification',
        title: 'UIライブラリの統一',
        description:
          'Material-UI、Radix UI、shadcn-uiが混在している状態をshadcn-ui + Tailwind CSSに統一',
        status: 'in-progress',
        priority: 'high',
        category: 'architecture',
        estimatedDays: 7,
        progress: 25,
      },
      {
        id: 'remove-deps',
        title: '不要な依存関係の削除',
        description: '未使用のパッケージを削除してバンドルサイズを削減',
        status: 'planned',
        priority: 'medium',
        category: 'optimization',
        estimatedDays: 2,
        progress: 0,
      },
      {
        id: 'component-cleanup',
        title: 'コンポーネントの整理',
        description: '重複したコンポーネントの統合と命名規則の統一',
        status: 'planned',
        priority: 'high',
        category: 'architecture',
        estimatedDays: 5,
        progress: 0,
      },
    ],
    phase2: [
      {
        id: 'folder-restructure',
        title: 'フォルダ構造の再編成',
        description: '機能別モジュール構造への移行と共通コンポーネントの抽出',
        status: 'planned',
        priority: 'critical',
        category: 'architecture',
        estimatedDays: 14,
        progress: 0,
        dependencies: ['component-cleanup'],
      },
      {
        id: 'add-tests',
        title: 'テストカバレッジの向上',
        description: '主要コンポーネントのユニットテストとE2Eテストの追加',
        status: 'planned',
        priority: 'high',
        category: 'quality',
        estimatedDays: 21,
        progress: 0,
      },
      {
        id: 'api-integration',
        title: 'API層の統合',
        description: '分散したAPI呼び出しを統一されたサービス層に集約',
        status: 'planned',
        priority: 'high',
        category: 'architecture',
        estimatedDays: 10,
        progress: 0,
      },
    ],
    phase3: [
      {
        id: 'monorepo',
        title: 'モノレポ構造への移行',
        description: '関連する3つのアプリケーションをモノレポで管理',
        status: 'planned',
        priority: 'critical',
        category: 'architecture',
        estimatedDays: 30,
        progress: 0,
        dependencies: ['folder-restructure', 'api-integration'],
      },
      {
        id: 'feature-separation',
        title: '機能の分離',
        description: '仕事管理、個人生活、社会活動の3つのアプリに分割',
        status: 'planned',
        priority: 'critical',
        category: 'architecture',
        estimatedDays: 45,
        progress: 0,
        dependencies: ['monorepo'],
      },
      {
        id: 'nextjs-migration',
        title: 'Next.js 15への移行',
        description: 'App RouterとServer Componentsを活用した最新アーキテクチャへ',
        status: 'planned',
        priority: 'high',
        category: 'technology',
        estimatedDays: 30,
        progress: 0,
        dependencies: ['feature-separation'],
      },
    ],
  };

  // 現状の問題点
  const currentProblems = [
    {
      icon: <Target className="h-5 w-5" />,
      title: 'プロジェクトの方向性が不明確',
      description: '20以上の異なる機能が一つのアプリケーションに混在',
      impact: 'high',
    },
    {
      icon: <Timer className="h-5 w-5" />,
      title: '勤怠管理機能が不完全',
      description: '手動入力のみで、実用的な打刻・承認機能が不足',
      impact: 'critical',
    },
    {
      icon: <Layers className="h-5 w-5" />,
      title: 'UIライブラリの混在',
      description: 'Material-UI、Radix UI、Tailwind CSS、shadcn-uiが混在し、統一性が欠如',
      impact: 'medium',
    },
    {
      icon: <Package className="h-5 w-5" />,
      title: '依存関係の肥大化',
      description: '未使用や重複したパッケージによりバンドルサイズが増大',
      impact: 'medium',
    },
    {
      icon: <GitBranch className="h-5 w-5" />,
      title: 'コード構造の複雑化',
      description: '機能が増えるたびに複雑さが増し、保守性が低下',
      impact: 'high',
    },
  ];

  // 提案するアーキテクチャ
  const proposedArchitecture = [
    {
      name: 'Work Management Suite',
      icon: <Code className="h-6 w-6" />,
      description: '仕事関連機能',
      features: ['勤怠管理', 'WBS管理', 'タスク管理'],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Personal Life Tracker',
      icon: <Shield className="h-6 w-6" />,
      description: '個人生活管理',
      features: ['睡眠トラッカー', '衝動トラッカー', '日記', 'ギター練習'],
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Social Platform',
      icon: <Globe className="h-6 w-6" />,
      description: '社会活動',
      features: ['ブログ', '選挙情報', 'Twitter連携'],
      color: 'from-green-500 to-emerald-500',
    },
  ];

  // フェーズデータ
  const phaseData: Record<string, PhaseData> = {
    phase0: {
      id: 'phase0',
      title: 'Phase 0: MVP機能完成',
      duration: '2-3週間',
      description: '勤怠管理アプリとして必要最低限の機能を実装してリリース',
      status: 'in-progress',
      progress: calculatePhaseProgress('phase0'),
    },
    phase1: {
      id: 'phase1',
      title: 'Phase 1: 基盤整備',
      duration: '1-2週間',
      description: 'UIライブラリの統一と不要な依存関係の削除',
      status: 'not-started',
      progress: calculatePhaseProgress('phase1'),
    },
    phase2: {
      id: 'phase2',
      title: 'Phase 2: 構造改善',
      duration: '2-4週間',
      description: 'フォルダ構造の再編成とテストの追加',
      status: 'not-started',
      progress: calculatePhaseProgress('phase2'),
    },
    phase3: {
      id: 'phase3',
      title: 'Phase 3: アーキテクチャ刷新',
      duration: '1-2ヶ月',
      description: 'モノレポ構造への移行と機能の分離',
      status: 'not-started',
      progress: calculatePhaseProgress('phase3'),
    },
  };

  // ユーティリティ関数
  useEffect(() => {
    loadProject(currentProjectId);
  }, [loadProject, currentProjectId]);

  function calculatePhaseProgress(phase: string): number {
    const phaseItems = improvements[phase] || [];
    if (phaseItems.length === 0) return 0;

    const totalProgress = phaseItems.reduce((sum, item) => sum + (item.progress || 0), 0);
    return Math.round(totalProgress / phaseItems.length);
  }

  function hasImplementationTasks(itemId: string): boolean {
    return tasks.some((task) => task.tags.includes(itemId) || task.title.includes(itemId));
  }

  const startImplementation = async (item: ImprovementItem) => {
    const success = await createTaskFromImprovement(item);
    if (success) {
      setShowImplementationDialog(false);
      item.status = 'in-progress';
      refreshData();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'planned':
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      case 'deferred':
        return <XCircle className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">サイト改善計画</h1>
        <p className="text-muted-foreground">
          Work Time
          Trackerをまず実用的な勤怠管理アプリとして完成させ、その後技術的負債を解消してスケーラブルなアーキテクチャへ移行
        </p>
      </div>

      {/* MVP重要性の説明 */}
      <Alert className="mb-8 border-blue-200 bg-blue-50">
        <Rocket className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">MVP（Minimum Viable Product）優先</AlertTitle>
        <AlertDescription className="text-blue-700">
          技術的改善の前に、まず勤怠管理アプリとしての基本機能を完成させてリリースすることを最優先とします。
          実用的な価値を提供してからアーキテクチャの改善に取り組みます。
        </AlertDescription>
      </Alert>

      {/* 現状の問題点 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            現状の問題点
          </CardTitle>
          <CardDescription>解決すべき技術的課題と機能的課題の一覧</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {currentProblems.map((problem, index) => (
              <div
                key={index}
                className="flex gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">{problem.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{problem.title}</h4>
                  <p className="text-sm text-muted-foreground">{problem.description}</p>
                  <Badge
                    variant="outline"
                    className={`mt-2 text-xs ${
                      problem.impact === 'critical'
                        ? 'border-red-200 text-red-700'
                        : problem.impact === 'high'
                          ? 'border-red-200 text-red-700'
                          : 'border-orange-200 text-orange-700'
                    }`}
                  >
                    影響度:{' '}
                    {problem.impact === 'critical'
                      ? '最重要'
                      : problem.impact === 'high'
                        ? '高'
                        : '中'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 提案するアーキテクチャ */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-green-500" />
            提案するアーキテクチャ
          </CardTitle>
          <CardDescription>3つの独立したアプリケーションに分割</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {proposedArchitecture.map((app, index) => (
              <Card key={index} className="overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${app.color}`} />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {app.icon}
                    {app.name}
                  </CardTitle>
                  <CardDescription>{app.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {app.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 段階的移行計画 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            段階的移行計画
          </CardTitle>
          <CardDescription>4つのフェーズで段階的に改善を実施</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPhase} onValueChange={(v) => setSelectedPhase(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="phase0" className="text-xs">
                <div className="flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  MVP
                </div>
              </TabsTrigger>
              <TabsTrigger value="phase1">Phase 1</TabsTrigger>
              <TabsTrigger value="phase2">Phase 2</TabsTrigger>
              <TabsTrigger value="phase3">Phase 3</TabsTrigger>
            </TabsList>

            {Object.entries(phaseData).map(([phase, data]) => (
              <TabsContent key={phase} value={phase} className="space-y-4">
                <Alert className={phase === 'phase0' ? 'border-green-200 bg-green-50' : ''}>
                  <Clock className={`h-4 w-4 ${phase === 'phase0' ? 'text-green-600' : ''}`} />
                  <AlertTitle className={phase === 'phase0' ? 'text-green-800' : ''}>
                    {data.title}
                  </AlertTitle>
                  <AlertDescription className={phase === 'phase0' ? 'text-green-700' : ''}>
                    <p>{data.description}</p>
                    <p className="mt-1 font-semibold">推定期間: {data.duration}</p>
                    <div className="mt-2">
                      <Progress value={data.progress} className="w-full" />
                      <p className="text-xs mt-1">進捗: {data.progress}%</p>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  {improvements[phase].map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(item.status)}
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{item.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${getPriorityColor(item.priority)}`}>
                            {item.priority === 'critical' && '最重要'}
                            {item.priority === 'high' && '重要'}
                            {item.priority === 'medium' && '中'}
                            {item.priority === 'low' && '低'}
                          </Badge>
                          {hasImplementationTasks(item.id) ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              実装中
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedItem(item);
                                setShowImplementationDialog(true);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              実装開始
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm mt-3">
                        <div className="text-muted-foreground">
                          推定作業日数: {item.estimatedDays}日
                        </div>
                        {item.progress !== undefined && item.progress > 0 && (
                          <div className="flex items-center gap-2">
                            <Progress value={item.progress} className="w-20 h-2" />
                            <span className="text-xs text-muted-foreground">{item.progress}%</span>
                          </div>
                        )}
                      </div>

                      {item.dependencies && item.dependencies.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-2">
                          依存: {item.dependencies.join(', ')}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* 実装開始ダイアログ */}
      <Dialog open={showImplementationDialog} onOpenChange={setShowImplementationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>実装タスクの作成</DialogTitle>
            <DialogDescription>
              改善項目「{selectedItem?.title}」の実装タスクを作成します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedItem && (
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">概要</h4>
                  <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm">推定期間</h4>
                    <p className="text-sm">{selectedItem.estimatedDays}日</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">優先度</h4>
                    <Badge className={getPriorityColor(selectedItem.priority)}>
                      {selectedItem.priority === 'critical' && '最重要'}
                      {selectedItem.priority === 'high' && '重要'}
                      {selectedItem.priority === 'medium' && '中'}
                      {selectedItem.priority === 'low' && '低'}
                    </Badge>
                  </div>
                </div>
                {selectedItem.dependencies && selectedItem.dependencies.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm">依存関係</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedItem.dependencies.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImplementationDialog(false)}>
              キャンセル
            </Button>
            <Button
              onClick={() => selectedItem && startImplementation(selectedItem)}
              disabled={isLoading}
            >
              {isLoading ? '作成中...' : '実装タスクを作成'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SiteImprovementPlan;
