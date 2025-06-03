import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';

interface ImprovementItem {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed' | 'deferred';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  estimatedDays?: number;
  progress?: number;
  dependencies?: string[];
}

const SiteImprovementPlan: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState<'phase1' | 'phase2' | 'phase3'>('phase1');

  const improvements: Record<string, ImprovementItem[]> = {
    phase1: [
      {
        id: 'ui-unification',
        title: 'UIライブラリの統一',
        description:
          'Material-UI、Radix UI、shadcn-uiが混在している状態をshadcn-ui + Tailwind CSSに統一',
        status: 'planned',
        priority: 'high',
        category: 'architecture',
        estimatedDays: 7,
        progress: 0,
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

  const currentProblems = [
    {
      icon: <Target className="h-5 w-5" />,
      title: 'プロジェクトの方向性が不明確',
      description: '20以上の異なる機能が一つのアプリケーションに混在',
      impact: 'high',
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

  const phaseData = {
    phase1: {
      title: 'Phase 1: 基盤整備',
      duration: '1-2週間',
      description: 'UIライブラリの統一と不要な依存関係の削除',
    },
    phase2: {
      title: 'Phase 2: 構造改善',
      duration: '2-4週間',
      description: 'フォルダ構造の再編成とテストの追加',
    },
    phase3: {
      title: 'Phase 3: アーキテクチャ刷新',
      duration: '1-2ヶ月',
      description: 'モノレポ構造への移行と機能の分離',
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">サイト改善計画</h1>
        <p className="text-muted-foreground">
          Work Time Trackerの技術的負債を解消し、スケーラブルなアーキテクチャへ移行
        </p>
      </div>

      {/* 現状の問題点 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            現状の問題点
          </CardTitle>
          <CardDescription>解決すべき技術的課題の一覧</CardDescription>
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
                      problem.impact === 'high'
                        ? 'border-red-200 text-red-700'
                        : 'border-orange-200 text-orange-700'
                    }`}
                  >
                    影響度: {problem.impact === 'high' ? '高' : '中'}
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
          <CardDescription>3つのフェーズで段階的に改善を実施</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPhase} onValueChange={(v) => setSelectedPhase(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="phase1">Phase 1</TabsTrigger>
              <TabsTrigger value="phase2">Phase 2</TabsTrigger>
              <TabsTrigger value="phase3">Phase 3</TabsTrigger>
            </TabsList>

            {Object.entries(phaseData).map(([phase, data]) => (
              <TabsContent key={phase} value={phase} className="space-y-4">
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertTitle>{data.title}</AlertTitle>
                  <AlertDescription>
                    <p>{data.description}</p>
                    <p className="mt-1 font-semibold">推定期間: {data.duration}</p>
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  {improvements[phase].map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(item.status)}
                          <div>
                            <h4 className="font-semibold text-sm">{item.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`ml-2 ${getPriorityColor(item.priority)}`}
                        >
                          {item.priority === 'critical' && '最重要'}
                          {item.priority === 'high' && '重要'}
                          {item.priority === 'medium' && '中'}
                          {item.priority === 'low' && '低'}
                        </Badge>
                      </div>

                      {item.estimatedDays && (
                        <div className="text-xs text-muted-foreground mt-2">
                          推定作業日数: {item.estimatedDays}日
                        </div>
                      )}

                      {item.dependencies && item.dependencies.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          依存: {item.dependencies.join(', ')}
                        </div>
                      )}

                      {item.progress !== undefined && item.status === 'in-progress' && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>進捗</span>
                            <span>{item.progress}%</span>
                          </div>
                          <Progress value={item.progress} className="h-2" />
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

      {/* アクションボタン */}
      <div className="mt-8 flex justify-center">
        <Button
          size="lg"
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
        >
          改善計画の詳細を見る
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SiteImprovementPlan;
