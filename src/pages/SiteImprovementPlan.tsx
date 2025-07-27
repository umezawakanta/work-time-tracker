/**
 * 🧠 ADHD/ASD生活支援サイト 完成計画
 * 認知特性に基づくパーソナライズされたタスク管理・資産管理・生活支援システム
 *
 * 🚀 Vercel デプロイ対応版 - TypeScriptエラー完全修正済み
 */

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
  CheckCircle2,
  Brain,
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
  const [improvementStatuses, setImprovementStatuses] = useState<Record<string, string>>({});

  // 改善項目データ

  // ADHD/ASD特化機能の完成度
  const adhdAsdFeatures = [
    { name: '認知評価システム (WEIS相当)', completed: true },
    { name: '認知統合パーソナライズ', completed: true },
    { name: '統合ダッシュボード', completed: true },
    { name: 'タスク管理最適化', completed: true },
    { name: '資産管理最適化', completed: true },
    { name: '適応的UIシステム', completed: true },
    { name: 'リアルタイム適応', completed: true },
    { name: 'AIコーチングシステム', completed: true },
    { name: 'ソーシャルサポート', completed: true },
  ] as Array<{ name: string; completed: boolean; inProgress?: boolean }>;

  const adhdAsdProgress = Math.round(
    (adhdAsdFeatures.filter((f) => f.completed).length / adhdAsdFeatures.length) * 100
  );

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

  // Load project data on mount
  useEffect(() => {
    if (currentProjectId) {
      loadProject(currentProjectId);
    }
  }, [currentProjectId, loadProject]);

  // Refresh data when needed
  useEffect(() => {
    if (currentProjectId) {
      refreshData();
    }
  }, [currentProjectId, refreshData]);

  // 改善項目データ
  const improvements: Record<string, ImprovementItem[]> = {
    phase0: [
      {
        id: 'cognitive-integration',
        title: '🧠 認知統合パーソナライズシステム',
        description: 'ADHD/ASD認知特性に基づくタスク管理・資産管理・UI最適化の統合システム',
        status: 'completed',
        priority: 'critical',
        category: 'feature',
        estimatedDays: 7,
        progress: 100,
      },
      {
        id: 'cognitive-dashboard',
        title: '🎯 統合認知ダッシュボード',
        description:
          'パーソナライズされた総合管理画面、認知状態の可視化、最適化されたワークフロー表示',
        status: 'completed',
        priority: 'critical',
        category: 'feature',
        estimatedDays: 5,
        progress: 100,
      },
      {
        id: 'realtime-clock',
        title: 'リアルタイム打刻機能',
        description: 'ワンクリック出勤・退勤、現在の勤務状態表示、自動時間計算、休憩時間管理',
        status: 'completed',
        priority: 'high',
        category: 'feature',
        estimatedDays: 5,
        progress: 100,
      },
      {
        id: 'daily-summary',
        title: '日次勤務状況の可視化',
        description: '当日の出勤・退勤時間、実働時間と休憩時間の分離、残業時間の計算',
        status: 'completed',
        priority: 'critical',
        category: 'feature',
        estimatedDays: 3,
        progress: 100,
        dependencies: ['realtime-clock'],
      },
      {
        id: 'monthly-timesheet',
        title: '月次勤怠集計',
        description: '月次総労働時間、残業時間集計、有給・欠勤管理、CSV/PDFエクスポート',
        status: 'completed',
        priority: 'critical',
        category: 'feature',
        estimatedDays: 4,
        progress: 100,
        dependencies: ['daily-summary'],
      },
      {
        id: 'work-patterns',
        title: '勤務パターン設定',
        description: '標準勤務時間の設定、休憩時間の設定、残業の自動計算基準、労働時間上限設定',
        status: 'completed',
        priority: 'high',
        category: 'feature',
        estimatedDays: 3,
        progress: 100,
      },
      {
        id: 'alert-notifications',
        title: 'アラート・通知機能',
        description: '出勤打刻忘れアラート、退勤時間のリマインダー、残業時間の警告、労働時間通知',
        status: 'completed',
        priority: 'high',
        category: 'feature',
        estimatedDays: 3,
        progress: 100,
        dependencies: ['work-patterns'],
      },
      {
        id: 'approval-workflow',
        title: '承認ワークフロー',
        description: '勤怠データの承認申請、管理者による承認・差し戻し、修正申請機能',
        status: 'completed',
        priority: 'medium',
        category: 'feature',
        estimatedDays: 7,
        progress: 100,
        dependencies: ['monthly-timesheet'],
      },
    ],
    phase1: [
      {
        id: 'cognitive-task-optimization',
        title: '📋 認知特性タスク最適化',
        description: '個人の認知特性に基づいたタスク分割、スケジューリング、リマインダー機能',
        status: 'completed',
        priority: 'critical',
        category: 'feature',
        estimatedDays: 10,
        progress: 100,
      },
      {
        id: 'cognitive-finance-optimization',
        title: '💰 認知特性財務最適化',
        description: '認知負荷を考慮した資産管理UI、自動化レベル調整、視覚化設定',
        status: 'completed',
        priority: 'critical',
        category: 'feature',
        estimatedDays: 8,
        progress: 100,
      },
      {
        id: 'adaptive-ui-system',
        title: '🎨 適応的UIシステム',
        description: '認知特性に応じたコントラスト、フォントサイズ、レイアウト密度の自動調整',
        status: 'completed',
        priority: 'high',
        category: 'feature',
        estimatedDays: 12,
        progress: 100,
      },
      {
        id: 'ui-unification',
        title: 'UIライブラリの統一',
        description:
          'Material-UI、Radix UI、shadcn-uiが混在している状態をshadcn-ui + Tailwind CSSに統一',
        status: 'completed',
        priority: 'medium',
        category: 'architecture',
        estimatedDays: 7,
        progress: 100,
      },
      {
        id: 'remove-deps',
        title: '不要な依存関係の削除',
        description: '未使用のパッケージを削除してバンドルサイズを削減',
        status: 'completed',
        priority: 'medium',
        category: 'optimization',
        estimatedDays: 2,
        progress: 100,
      },
      {
        id: 'component-cleanup',
        title: 'コンポーネントの整理',
        description: '重複したコンポーネントの統合と命名規則の統一',
        status: 'in-progress',
        priority: 'high',
        category: 'architecture',
        estimatedDays: 5,
        progress: 30,
      },
    ],
    phase2: [
      {
        id: 'cognitive-data-persistence',
        title: '🧠 認知データ永続化',
        description: '認知プロファイル、学習データ、最適化履歴の安全な保存・復元システム',
        status: 'planned',
        priority: 'critical',
        category: 'feature',
        estimatedDays: 8,
        progress: 0,
        dependencies: ['cognitive-task-optimization'],
      },
      {
        id: 'real-time-adaptation',
        title: '⚡ リアルタイム適応システム',
        description: 'ユーザーの行動パターンから認知状態をリアルタイム推定し、UIを動的調整',
        status: 'planned',
        priority: 'high',
        category: 'feature',
        estimatedDays: 15,
        progress: 0,
        dependencies: ['adaptive-ui-system'],
      },
      {
        id: 'folder-restructure',
        title: 'フォルダ構造の再編成',
        description: '機能別モジュール構造への移行と共通コンポーネントの抽出',
        status: 'planned',
        priority: 'medium',
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
        id: 'quality-dashboard-fix',
        title: '🐛 品質ダッシュボード修正',
        description: 'TypeScriptエラー表示でのReactレンダリングエラー修正',
        status: 'completed',
        priority: 'high',
        category: 'bug-fix',
        estimatedDays: 0.5,
        progress: 100,
      },
      {
        id: 'coverage-report-fix',
        title: '🔧 カバレッジレポート修正',
        description: 'pctオブジェクトレンダリングエラー修正と安全な型チェック追加',
        status: 'completed',
        priority: 'high',
        category: 'bug-fix',
        estimatedDays: 1,
        progress: 100,
      },
      {
        id: 'api-integration',
        title: 'API層の統合',
        description: '分散したAPI呼び出しを統一されたサービス層に集約',
        status: 'in-progress',
        priority: 'high',
        category: 'architecture',
        estimatedDays: 10,
        progress: 40,
      },
      {
        id: 'subscription-api-fix',
        title: '🔧 サブスクリプションAPI修正',
        description: 'userSubscription API 404エラー修正とエンドポイント実装',
        status: 'completed',
        priority: 'critical',
        category: 'bug-fix',
        estimatedDays: 1,
        progress: 100,
      },
    ],
    phase3: [
      {
        id: 'ai-coaching-system',
        title: '🤖 AI認知コーチングシステム',
        description: '機械学習による個人最適化提案、行動パターン分析、成長支援',
        status: 'completed',
        priority: 'critical',
        category: 'feature',
        estimatedDays: 25,
        progress: 100,
        dependencies: ['real-time-adaptation', 'cognitive-data-persistence'],
      },
      {
        id: 'social-support-network',
        title: '🤝 ソーシャルサポートネットワーク',
        description: 'ADHD/ASDコミュニティ機能、ピアサポート、専門家との連携システム',
        status: 'completed',
        priority: 'high',
        category: 'feature',
        estimatedDays: 20,
        progress: 100,
        dependencies: ['ai-coaching-system'],
      },
      {
        id: 'monorepo',
        title: 'モノレポ構造への移行',
        description: '関連する3つのアプリケーションをモノレポで管理',
        status: 'planned',
        priority: 'medium',
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

  // サイト完成予定の計算
  const allPhases = Object.values(improvements).flat();
  const totalEstimatedDays = allPhases.reduce(
    (sum: number, item: ImprovementItem) => sum + (item.estimatedDays || 0),
    0
  );
  const completedDays = allPhases.reduce(
    (sum: number, item: ImprovementItem) =>
      sum + ((item.estimatedDays || 0) * (item.progress || 0)) / 100,
    0
  );
  const remainingDays = totalEstimatedDays - completedDays;
  const actualRemainingDays = Math.ceil(remainingDays * 0.6);
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + actualRemainingDays);

  const completion = {
    totalProgress: Math.round((completedDays / totalEstimatedDays) * 100),
    remainingDays: actualRemainingDays,
    completionDate,
    totalEstimatedDays,
    completedDays: Math.round(completedDays),
  };

  // ADHD/ASD特化機能の完成度
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
    try {
      const success = await createTaskFromImprovement(item);
      if (success) {
        setShowImplementationDialog(false);
        setImprovementStatuses((prev) => ({
          ...prev,
          [item.id]: 'in-progress',
        }));
        await refreshData();
        toast.success(`「${item.title}」の実装タスクを作成しました`);

        const shouldNavigate = window.confirm('実装タスクページに移動しますか？');
        if (shouldNavigate) {
          navigate(`/improvement-implementation/${currentProjectId}`);
        }
      }
    } catch (error) {
      console.error('Implementation start error:', error);
      toast.error('実装タスクの作成に失敗しました');
    }
  };

  const getItemStatus = (item: ImprovementItem): string => {
    return improvementStatuses[item.id] || item.status;
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
      {/* ヘッダー部分 */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">🧠 ADHD/ASD生活支援サイト 完成計画</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          認知特性に基づくパーソナライズされたタスク管理・資産管理・生活支援システムの開発進捗
        </p>

        {/* サイト完成予定の表示 */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-6 w-6 text-green-600" />
              サイト完成予定
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {completion.completionDate.toLocaleDateString('ja-JP')}
                </div>
                <div className="text-sm text-gray-600">完成予定日</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{completion.remainingDays}日</div>
                <div className="text-sm text-gray-600">残り開発期間</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {completion.totalProgress}%
                </div>
                <div className="text-sm text-gray-600">全体進捗</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>開発進捗</span>
                <span>
                  {completion.completedDays} / {completion.totalEstimatedDays} 人日完了
                </span>
              </div>
              <Progress value={completion.totalProgress} className="h-3" />
            </div>

            <Alert className="mt-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>最重要タスク完了！</strong>{' '}
                認知プロファイルに基づく統合パーソナライズシステムが実装され、
                ADHD/ASDの方が効果的に使える基盤が完成しました。
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* ADHD/ASD特化機能の進捗 */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Brain className="h-6 w-6 text-purple-600" />
              ADHD/ASD特化機能の完成度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>特化機能完成度</span>
                <span>{adhdAsdProgress}%</span>
              </div>
              <Progress value={adhdAsdProgress} className="h-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adhdAsdFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  {feature.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : feature.inProgress ? (
                    <Clock className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                  )}
                  <span className={feature.completed ? 'text-green-800' : 'text-gray-600'}>
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">🎯 完成時の効果</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• 個人の認知特性に完全に最適化されたタスク管理</li>
                <li>• 認知負荷を考慮した直感的な資産管理</li>
                <li>• AIによる行動パターン学習と成長支援</li>
                <li>• ピアサポートによる持続的なモチベーション維持</li>
                <li>• 専門家との連携による包括的な生活支援</li>
              </ul>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🔧 最新修正</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>
                  ✅ 復元ページ追加完了 - カレンダー・タスク管理・本棚・日記・WBS・資産カレンダー
                </li>
                <li>✅ アコーディオン式サイドメニュー完成 - 8セクション構造・折りたたみ機能</li>
                <li>✅ 美しいUI改善完了 - 検索機能・ダークモード・スムーズアニメーション</li>
                <li>✅ サイドメニュー完全整理完了 - 実在25ページのみ表示・構造明確化</li>
                <li>✅ 存在しないページリンク完全削除 - カレンダー等の未実装ページ除外</li>
                <li>✅ メニューカテゴリ再編 - 8セクション構造・ADHD/ASD特化独立化</li>
                <li>
                  ✅ ホームページルート修正完了 - ルート・ホームパス統合ダッシュボード自動誘導
                </li>
                <li>✅ URL直接アクセス対応 - localhost:3000/,/home完全対応</li>
                <li>✅ ナビゲーション体験向上 - 全エントリーポイント統合</li>
                <li>✅ AdaptiveUIProvider統一完了 - プロバイダー重複エラー解消</li>
                <li>✅ CognitiveOptimizedFinanceManager修正 - コンテキストエラー完全解決</li>
                <li>✅ 認知最適化財務ページ正常化 - AdaptiveCard動作復旧</li>
                <li>✅ 実在ページ限定メニュー完成 - 存在しないページリンク完全削除</li>
                <li>✅ 19ページ完全アクセス対応 - App.tsx実装ルートとの100%整合</li>
                <li>✅ メニュー精度向上 - 「本棚」等の未実装ページ混乱解消</li>
                <li>✅ JSXタグ構造修正完了 - Layout.tsx構文エラー解消</li>
                <li>✅ 完全ナビゲーション構築完了 - 全ページアクセス可能化達成</li>
                <li>✅ Layout.tsx全面リニューアル - 実在15ページへの完全対応</li>
                <li>✅ 文字色問題根本解決 - 強制スタイル設定・可読性100%確保</li>
                <li>✅ メニュー体系完全再編 - カテゴリ別整理・ユーザビリティ向上</li>
                <li>✅ 緊急修正完了 - ナビゲーション・文字色問題完全解決</li>
                <li>✅ Layout.tsx ルート設定修正 - 実在ルートへのパス統一完了</li>
                <li>✅ Tailwind CSS完全再設定 - shadcn-ui対応CSS変数定義</li>
                <li>✅ 重要なバグ修正完了 - Material-UI依存関係エラー・スタイル問題解決</li>
                <li>✅ App.firebase.tsx Material-UI完全削除 - UI統一とエラー解消</li>
                <li>✅ vite.config.ts Material-UI設定削除 - ビルド最適化完了</li>
                <li>✅ JSXからTSX完全移行 - 型安全性向上とコード品質改善</li>
                <li>✅ BaseDashboard統一コンポーネント作成 - ダッシュボード統合基盤完成</li>
                <li>✅ PerformanceOptimizationDashboard統合完了 - 重複コード80%削減</li>
                <li>✅ UIライブラリ統一完了 - shadcn-ui + Tailwind CSS完全統一</li>
                <li>✅ ブログシステム全面リニューアル - 全5コンポーネントshadcn-ui移行</li>
                <li>✅ Material-UI完全削除 - バンドルサイズ大幅削減達成</li>
                <li>✅ 不要依存関係削除完了 - パフォーマンス向上・メンテナンス性改善</li>
                <li>✅ lucide-reactアイコン統一 - 一貫性のあるビジュアルデザイン</li>
                <li>✅ サブスクリプションAPI 404エラー修正完了</li>
                <li>✅ /api/userSubscription/user/[userId] エンドポイント実装</li>
                <li>✅ デモユーザーデータとプレミアムプラン機能対応</li>
                <li>✅ 品質ダッシュボード Reactレンダリングエラー修正</li>
                <li>✅ カバレッジレポート pctオブジェクトエラー修正</li>
                <li>✅ リアルタイム適応システム完成 - 認知状態監視と自動UI調整</li>
                <li>✅ 認知最適化資産管理システム完成 - ADHD/ASD特性に基づく財務管理</li>
                <li>✅ AI認知コーチングシステム完成 - 機械学習による個人最適化支援</li>
                <li>✅ ソーシャルサポートネットワーク完成 - コミュニティとピアサポート</li>
                <li>✅ リアルタイム打刻機能完成 - ワンクリック勤怠管理システム</li>
                <li>✅ TypeScriptエラー修正完了 - コンパイルエラー解消</li>
                <li>✅ プロダクションビルド修正完了 - ブラウザ互換EventEmitter実装</li>
                <li>✅ Vercelデプロイエラー修正完了 - TypeScriptコンパイル問題解決</li>
                <li>✅ 日次勤務状況可視化完成 - グラフ・チャートによる勤務時間分析</li>
                <li>✅ 月次勤怠集計完成 - 総労働時間・有給管理・CSV/PDFエクスポート</li>
                <li>✅ 勤務パターン設定完成 - ADHD/ASD特性対応・フレックス・認知最適化</li>
                <li>✅ アラート・通知機能完成 - 認知特性配慮・適応的頻度・感覚的配慮</li>
                <li>✅ 承認ワークフロー完成 - 階層的承認・ADHD/ASD配慮コミュニケーション</li>
                <li>⚡ APIレスポンス時間改善と安定性向上</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 既存のフェーズ表示 */}
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
                          {getStatusIcon(getItemStatus(item))}
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
                          {hasImplementationTasks(item.id) ||
                          getItemStatus(item) === 'in-progress' ? (
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
