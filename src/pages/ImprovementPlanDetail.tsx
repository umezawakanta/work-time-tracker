import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@/components/ui/timeline';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Code,
  Database,
  Package,
  GitBranch,
  TestTube,
  Shield,
  Sparkles,
  TrendingUp,
  FileText,
  Users,
  Calendar,
  Target,
  Rocket,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ImprovementPlanDetail: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // 技術スタック比較
  const techStackComparison = {
    current: {
      frontend: ['React', 'Material-UI', 'Radix UI', 'Tailwind CSS', 'shadcn-ui'],
      backend: ['Express', 'MongoDB', 'WebSocket'],
      tooling: ['Vite', 'ESLint', 'Prettier'],
      deployment: ['Vercel'],
    },
    proposed: {
      frontend: ['Next.js 15', 'Tailwind CSS', 'shadcn-ui'],
      backend: ['Next.js API Routes', 'MongoDB', 'Prisma ORM'],
      tooling: ['Turbo', 'Vitest', 'ESLint', 'Prettier'],
      deployment: ['Vercel (Monorepo)'],
    },
  };

  // 実装ガイドライン
  const implementationGuidelines = [
    {
      phase: 'Phase 1',
      title: 'UIライブラリの統一',
      steps: [
        {
          step: 1,
          title: 'コンポーネント監査',
          description: '全てのコンポーネントをリストアップし、使用しているUIライブラリを特定',
          checklist: [
            'Material-UIコンポーネントのリストアップ',
            'Radix UIコンポーネントのマッピング',
            'shadcn-ui相当品の特定',
          ],
        },
        {
          step: 2,
          title: '段階的置き換え',
          description: '影響の少ないコンポーネントから順次shadcn-uiに置き換え',
          checklist: [
            'ボタンコンポーネントの置き換え',
            'フォーム要素の移行',
            'レイアウトコンポーネントの統一',
          ],
        },
        {
          step: 3,
          title: '旧ライブラリの削除',
          description: '使用されなくなったUIライブラリを削除',
          checklist: [
            'Material-UIの削除',
            'Radix UI（shadcn-ui以外）の削除',
            'バンドルサイズの確認',
          ],
        },
      ],
    },
    {
      phase: 'Phase 2',
      title: 'フォルダ構造の再編成',
      steps: [
        {
          step: 1,
          title: '新構造の設計',
          description: '機能別モジュール構造の設計と合意形成',
          checklist: [
            'フォルダ構造の設計ドキュメント作成',
            'チームレビューと承認',
            '移行計画の策定',
          ],
        },
        {
          step: 2,
          title: '共通コンポーネントの抽出',
          description: '再利用可能なコンポーネントを共通フォルダに移動',
          checklist: [
            'UIコンポーネントの分離',
            'ユーティリティ関数の整理',
            'カスタムフックの共通化',
          ],
        },
        {
          step: 3,
          title: '機能モジュールの作成',
          description: '各機能を独立したモジュールとして再構成',
          checklist: ['勤怠管理モジュールの作成', 'WBS管理モジュールの分離', 'ブログ機能の独立化'],
        },
      ],
    },
  ];

  // タイムライン
  const timeline = [
    {
      date: '2024年2月1日',
      phase: 'Phase 1開始',
      tasks: ['UIライブラリ監査', '依存関係の分析'],
      status: 'planned',
    },
    {
      date: '2024年2月8日',
      phase: 'Phase 1中間',
      tasks: ['コンポーネント置き換え開始', 'テスト実装'],
      status: 'planned',
    },
    {
      date: '2024年2月15日',
      phase: 'Phase 1完了',
      tasks: ['旧ライブラリ削除', 'パフォーマンステスト'],
      status: 'planned',
    },
    {
      date: '2024年2月20日',
      phase: 'Phase 2開始',
      tasks: ['フォルダ構造設計', 'チームレビュー'],
      status: 'planned',
    },
    {
      date: '2024年3月15日',
      phase: 'Phase 2完了',
      tasks: ['モジュール分離完了', '統合テスト'],
      status: 'planned',
    },
    {
      date: '2024年3月20日',
      phase: 'Phase 3開始',
      tasks: ['モノレポ環境構築', 'CI/CD設定'],
      status: 'planned',
    },
    {
      date: '2024年5月1日',
      phase: 'Phase 3完了',
      tasks: ['Next.js移行完了', '本番デプロイ'],
      status: 'planned',
    },
  ];

  // リスクと対策
  const risks = [
    {
      risk: '既存機能の破壊',
      probability: '中',
      impact: '高',
      mitigation: '包括的なテストスイートの作成と段階的な移行',
      icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    },
    {
      risk: '開発期間の延長',
      probability: '高',
      impact: '中',
      mitigation: 'バッファを含めたスケジュール設定と並行作業の最適化',
      icon: <Calendar className="h-5 w-5 text-yellow-500" />,
    },
    {
      risk: 'チーム習熟度',
      probability: '中',
      impact: '中',
      mitigation: '技術勉強会の開催とペアプログラミングの実施',
      icon: <Users className="h-5 w-5 text-blue-500" />,
    },
    {
      risk: 'パフォーマンス低下',
      probability: '低',
      impact: '高',
      mitigation: '各フェーズでのパフォーマンス測定と最適化',
      icon: <TrendingUp className="h-5 w-5 text-red-500" />,
    },
  ];

  // 期待される効果
  const expectedBenefits = [
    {
      category: '開発効率',
      benefits: [
        {
          title: 'コード保守性の向上',
          value: '60%',
          description: '統一されたアーキテクチャによる',
        },
        { title: '開発速度の向上', value: '40%', description: 'モジュール化による並行開発' },
        { title: 'バグ発生率の削減', value: '50%', description: 'テストカバレッジの向上' },
      ],
    },
    {
      category: 'パフォーマンス',
      benefits: [
        { title: 'バンドルサイズ削減', value: '35%', description: 'UIライブラリの統一' },
        { title: '初期ロード時間短縮', value: '45%', description: 'Next.jsのSSR/SSG活用' },
        { title: 'ランタイム性能向上', value: '25%', description: '最適化されたレンダリング' },
      ],
    },
    {
      category: 'ビジネス価値',
      benefits: [
        { title: '新機能追加速度', value: '3x', description: 'モジュール化されたアーキテクチャ' },
        { title: 'スケーラビリティ', value: '∞', description: 'マイクロサービス対応可能' },
        { title: 'チーム拡張性', value: '5x', description: '明確な責任分離' },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/improvement-plan')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            改善計画に戻る
          </Button>
          <h1 className="text-3xl font-bold mb-2">サイト改善計画 - 詳細</h1>
          <p className="text-muted-foreground">
            技術的負債の解消とモダンアーキテクチャへの移行計画
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          総実装期間: 約3ヶ月
        </Badge>
      </div>

      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="implementation">実装ガイド</TabsTrigger>
          <TabsTrigger value="timeline">タイムライン</TabsTrigger>
          <TabsTrigger value="risks">リスク管理</TabsTrigger>
          <TabsTrigger value="benefits">期待効果</TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 現在の技術スタック */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  現在の技術スタック
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(techStackComparison.current).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="font-semibold text-sm mb-2 capitalize">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {items.map((item) => (
                        <Badge key={item} variant="secondary">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 提案する技術スタック */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  提案する技術スタック
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(techStackComparison.proposed).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="font-semibold text-sm mb-2 capitalize">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {items.map((item) => (
                        <Badge key={item} variant="default">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 主要な変更点 */}
          <Card>
            <CardHeader>
              <CardTitle>主要な変更点</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex gap-3">
                  <Package className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">UIライブラリの統一</h4>
                    <p className="text-sm text-muted-foreground">4つのUIライブラリを1つに統合</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <GitBranch className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">モノレポ構造</h4>
                    <p className="text-sm text-muted-foreground">3つの独立したアプリケーション</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Rocket className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Next.js 15</h4>
                    <p className="text-sm text-muted-foreground">最新のReactフレームワーク</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 実装ガイドタブ */}
        <TabsContent value="implementation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>段階的実装ガイドライン</CardTitle>
              <CardDescription>各フェーズの詳細な実装手順とチェックリスト</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {implementationGuidelines.map((phase, phaseIndex) => (
                  <AccordionItem key={phaseIndex} value={`phase-${phaseIndex}`}>
                    <AccordionTrigger className="text-lg font-semibold">
                      {phase.phase}: {phase.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-6 pt-4">
                        {phase.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="relative pl-8">
                            <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                              {step.step}
                            </div>
                            <div className="space-y-3">
                              <h4 className="font-semibold">{step.title}</h4>
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                              <div className="space-y-2">
                                {step.checklist.map((item, itemIndex) => (
                                  <label
                                    key={itemIndex}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    <input type="checkbox" className="rounded border-gray-300" />
                                    <span>{item}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* タイムラインタブ */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>実装タイムライン</CardTitle>
              <CardDescription>各フェーズの開始・終了予定と主要マイルストーン</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-8 last:pb-0">
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                          item.status === 'completed'
                            ? 'border-green-500 bg-green-100'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {item.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Calendar className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="absolute top-10 h-full w-0.5 bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">{item.phase}</h4>
                        <span className="text-sm text-muted-foreground">{item.date}</span>
                      </div>
                      <ul className="space-y-1">
                        {item.tasks.map((task, taskIndex) => (
                          <li key={taskIndex} className="text-sm text-muted-foreground">
                            • {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* リスク管理タブ */}
        <TabsContent value="risks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>リスク評価と対策</CardTitle>
              <CardDescription>プロジェクトの潜在的リスクと軽減策</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {risks.map((risk, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      {risk.icon}
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">{risk.risk}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">発生確率:</span>
                            <Badge
                              variant={risk.probability === '高' ? 'destructive' : 'secondary'}
                            >
                              {risk.probability}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">影響度:</span>
                            <Badge variant={risk.impact === '高' ? 'destructive' : 'secondary'}>
                              {risk.impact}
                            </Badge>
                          </div>
                          <Separator className="my-2" />
                          <div>
                            <span className="font-medium">対策:</span>
                            <p className="text-muted-foreground mt-1">{risk.mitigation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 期待効果タブ */}
        <TabsContent value="benefits" className="space-y-6">
          <div className="grid gap-6">
            {expectedBenefits.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {category.benefits.map((benefit, benefitIndex) => (
                      <div
                        key={benefitIndex}
                        className="text-center p-4 border rounded-lg bg-gradient-to-b from-transparent to-accent/20"
                      >
                        <div className="text-3xl font-bold text-primary mb-2">{benefit.value}</div>
                        <h4 className="font-semibold text-sm mb-1">{benefit.title}</h4>
                        <p className="text-xs text-muted-foreground">{benefit.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <Sparkles className="h-4 w-4 text-green-600" />
            <AlertTitle>投資対効果</AlertTitle>
            <AlertDescription>
              3ヶ月の改善作業により、今後の開発効率が大幅に向上し、
              6ヶ月以内に投資コストを回収できる見込みです。
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* アクションボタン */}
      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" size="lg" onClick={() => navigate('/site-dev')}>
          <GitBranch className="h-4 w-4 mr-2" />
          WBSで進捗を確認
        </Button>
        <Button
          size="lg"
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
        >
          <Rocket className="h-4 w-4 mr-2" />
          実装を開始する
        </Button>
      </div>
    </div>
  );
};

export default ImprovementPlanDetail;
