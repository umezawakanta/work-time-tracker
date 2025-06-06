import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Database,
  Shield,
  Code2,
  GitBranch,
  Users,
  BarChart3,
  Settings,
  Layers,
  Network,
  Monitor,
  Lock,
  Zap,
  Target,
  Calendar,
  DollarSign,
  TrendingUp,
  BookOpen,
  MessageSquare,
  Clock,
  CheckSquare,
  User,
  Vote,
  Music,
  Heart,
  Moon,
  Twitter,
  Download,
  ExternalLink,
  Copy,
  Eye,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FeatureModule {
  id: string;
  name: string;
  description: string;
  status: 'implemented' | 'partial' | 'planned';
  priority: 'critical' | 'high' | 'medium' | 'low';
  components: string[];
  dependencies: string[];
  apis: string[];
  icon: React.ReactNode;
}

interface TechStackItem {
  category: string;
  items: {
    name: string;
    version: string;
    purpose: string;
    status: 'active' | 'deprecated' | 'planned';
  }[];
}

export default function SystemDesignDocuments() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // システムの主要機能モジュール
  const featureModules: FeatureModule[] = [
    {
      id: 'auth',
      name: 'ユーザー認証・認可',
      description: 'JWT認証、ユーザー登録・ログイン、権限管理',
      status: 'implemented',
      priority: 'critical',
      components: ['Login.tsx', 'Register.tsx', 'AuthContext.tsx', 'PrivateRoute.tsx'],
      dependencies: ['bcryptjs', 'jsonwebtoken', 'axios'],
      apis: ['/auth/login', '/auth/register', '/auth/verify'],
      icon: <Lock className="w-5 h-5" />,
    },
    {
      id: 'worktime',
      name: '勤怠管理システム',
      description: 'リアルタイム打刻、勤務時間管理、レポート生成',
      status: 'implemented',
      priority: 'critical',
      components: ['WorkTimeEntry.tsx', 'WorkTimeReports.tsx', 'WorkTimeEntryForm.tsx'],
      dependencies: ['date-fns', 'recharts', 'react-chartjs-2'],
      apis: ['/api/worktime/start', '/api/worktime/end', '/api/worktime/reports'],
      icon: <Clock className="w-5 h-5" />,
    },
    {
      id: 'finance',
      name: '資産負債管理',
      description: '資産・負債の追跡、財務分析、目標設定',
      status: 'implemented',
      priority: 'high',
      components: ['AssetLiabilityReportPage.tsx', 'GoalManagement.tsx', 'QuickInput.tsx'],
      dependencies: ['chart.js', 'recharts', 'date-fns'],
      apis: ['/api/assets', '/api/debts', '/api/goals'],
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      id: 'subscription',
      name: 'サブスクリプション管理',
      description: '定期購読サービスの管理、支払い追跡',
      status: 'implemented',
      priority: 'medium',
      components: ['SubscriptionManagementPage.tsx', 'SubscriptionManagement.tsx'],
      dependencies: ['uuid', 'date-fns'],
      apis: ['/api/subscriptions', '/api/payment-methods'],
      icon: <Target className="w-5 h-5" />,
    },
    {
      id: 'diary',
      name: '日記・目標管理',
      description: '日記記録、習慣追跡、達成度管理',
      status: 'implemented',
      priority: 'medium',
      components: ['DiaryPage.tsx', 'GoalTracking.jsx', 'AchievementsList.tsx'],
      dependencies: ['react-hook-form', 'zod'],
      apis: ['/api/diary', '/api/goals', '/api/achievements'],
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      id: 'calendar',
      name: 'カレンダー・スケジュール',
      description: 'イベント管理、スケジューリング',
      status: 'partial',
      priority: 'medium',
      components: ['CalendarPage.tsx', 'EventModal.tsx', 'CalendarHeader.tsx'],
      dependencies: ['@fullcalendar/react', 'react-big-calendar'],
      apis: ['/api/events', '/api/calendar'],
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: 'books',
      name: '読書管理',
      description: '本棚管理、読書記録、読書目標',
      status: 'implemented',
      priority: 'low',
      components: ['BookShelfPage.tsx', 'BookCard.tsx', 'ReadingChallenge.tsx'],
      dependencies: ['react-hook-form'],
      apis: ['/api/books', '/api/reading-progress'],
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      id: 'blog',
      name: 'ブログシステム',
      description: 'ブログ投稿、編集、閲覧機能',
      status: 'implemented',
      priority: 'low',
      components: ['BlogPage.tsx', 'BlogPostDetail.tsx', 'BlogPostEditor.tsx'],
      dependencies: ['react-hook-form'],
      apis: ['/api/blog/posts', '/api/blog/comments'],
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      id: 'politics',
      name: '政治情報管理',
      description: '選挙候補者管理、政治トレンド分析',
      status: 'implemented',
      priority: 'low',
      components: [
        'ElectionCandidatesPage.tsx',
        'PoliticalTrends.tsx',
        'CandidateRegistrationPage.tsx',
      ],
      dependencies: ['recharts', 'axios'],
      apis: ['/api/candidates', '/api/political-trends'],
      icon: <Vote className="w-5 h-5" />,
    },
    {
      id: 'improvement',
      name: 'サイト改善計画',
      description: 'AI分析による改善提案、実装管理',
      status: 'partial',
      priority: 'high',
      components: ['SiteImprovementPlan.tsx', 'ImprovementImplementation.tsx'],
      dependencies: ['@anthropic-ai/sdk', 'GeminiService.ts'],
      apis: ['/api/improvement/analyze', '/api/improvement/tasks'],
      icon: <TrendingUp className="w-5 h-5" />,
    },
  ];

  // 技術スタック詳細
  const techStack: TechStackItem[] = [
    {
      category: 'フロントエンド',
      items: [
        { name: 'React', version: '19.1.0', purpose: 'UIライブラリ', status: 'active' },
        { name: 'TypeScript', version: '5.8.3', purpose: '型安全な開発', status: 'active' },
        { name: 'Vite', version: '6.3.0', purpose: 'ビルドツール', status: 'active' },
        { name: 'Tailwind CSS', version: '3.3.3', purpose: 'CSSフレームワーク', status: 'active' },
        { name: 'Radix UI', version: '1.x', purpose: 'UIコンポーネント', status: 'active' },
        { name: 'React Router', version: '7.5.0', purpose: 'ルーティング', status: 'active' },
        { name: 'React Hook Form', version: '7.55.0', purpose: 'フォーム管理', status: 'active' },
      ],
    },
    {
      category: 'バックエンド',
      items: [
        { name: 'Node.js', version: '22.x', purpose: 'サーバーランタイム', status: 'active' },
        { name: 'Express', version: '5.1.0', purpose: 'Webフレームワーク', status: 'active' },
        { name: 'MongoDB', version: '6.15.0', purpose: 'データベース', status: 'active' },
        { name: 'Mongoose', version: '8.13.2', purpose: 'ODM', status: 'active' },
        { name: 'JWT', version: '9.0.2', purpose: '認証', status: 'active' },
      ],
    },
    {
      category: 'データ可視化',
      items: [
        { name: 'Chart.js', version: '4.4.9', purpose: 'チャート描画', status: 'active' },
        { name: 'Recharts', version: '2.15.2', purpose: 'Reactチャート', status: 'active' },
        {
          name: 'React ChartJS 2',
          version: '5.3.0',
          purpose: 'Chart.js React統合',
          status: 'active',
        },
      ],
    },
    {
      category: 'AI・分析',
      items: [
        { name: 'Anthropic SDK', version: '0.20.0', purpose: 'Claude AI統合', status: 'active' },
        { name: 'Google Gemini', version: 'custom', purpose: 'AI分析', status: 'active' },
      ],
    },
    {
      category: 'テスト・品質管理',
      items: [
        { name: 'Jest', version: '29.7.0', purpose: 'ユニットテスト', status: 'active' },
        {
          name: 'Testing Library',
          version: '16.3.0',
          purpose: 'コンポーネントテスト',
          status: 'active',
        },
        { name: 'Cypress', version: '14.3.0', purpose: 'E2Eテスト', status: 'active' },
        { name: 'ESLint', version: '9.24.0', purpose: 'コード品質', status: 'active' },
        { name: 'Prettier', version: '3.2.5', purpose: 'コードフォーマット', status: 'active' },
      ],
    },
  ];

  // データベース設計
  const databaseSchema = {
    users: {
      fields: ['_id', 'name', 'email', 'password', 'isAdmin', 'avatar', 'settings'],
      relationships: ['workTimeEntries', 'assets', 'debts', 'diaryEntries', 'subscriptions'],
    },
    workTimeEntries: {
      fields: ['_id', 'userId', 'startTime', 'endTime', 'projectName', 'description', 'breakTime'],
      relationships: ['user'],
    },
    assets: {
      fields: ['_id', 'userId', 'date', 'value', 'account', 'category', 'targetSettings'],
      relationships: ['user'],
    },
    debts: {
      fields: ['_id', 'userId', 'date', 'value', 'account', 'category', 'interestRate'],
      relationships: ['user'],
    },
    diaryEntries: {
      fields: ['_id', 'userId', 'date', 'achievement', 'mood', 'tags', 'difficulty'],
      relationships: ['user'],
    },
    subscriptions: {
      fields: ['_id', 'userId', 'name', 'amount', 'billingDate', 'type', 'isActive'],
      relationships: ['user'],
    },
    candidates: {
      fields: ['_id', 'name', 'party', 'prefecture', 'district', 'status', 'biography'],
      relationships: [],
    },
    books: {
      fields: ['_id', 'userId', 'title', 'author', 'status', 'rating', 'notes'],
      relationships: ['user'],
    },
  };

  // API設計
  const apiEndpoints = [
    {
      category: '認証API',
      endpoints: [
        { method: 'POST', path: '/auth/register', description: 'ユーザー登録' },
        { method: 'POST', path: '/auth/login', description: 'ログイン' },
        { method: 'POST', path: '/auth/logout', description: 'ログアウト' },
        { method: 'GET', path: '/auth/verify', description: 'トークン検証' },
      ],
    },
    {
      category: '勤怠管理API',
      endpoints: [
        { method: 'POST', path: '/api/worktime/start', description: '勤務開始' },
        { method: 'POST', path: '/api/worktime/end', description: '勤務終了' },
        { method: 'GET', path: '/api/worktime/reports', description: 'レポート取得' },
        { method: 'GET', path: '/api/worktime/status', description: '勤務状態取得' },
      ],
    },
    {
      category: '財務管理API',
      endpoints: [
        { method: 'GET', path: '/api/assets', description: '資産一覧取得' },
        { method: 'POST', path: '/api/assets', description: '資産追加' },
        { method: 'PUT', path: '/api/assets/:id', description: '資産更新' },
        { method: 'DELETE', path: '/api/assets/:id', description: '資産削除' },
        { method: 'GET', path: '/api/debts', description: '負債一覧取得' },
        { method: 'POST', path: '/api/debts', description: '負債追加' },
      ],
    },
    {
      category: '改善計画API',
      endpoints: [
        { method: 'POST', path: '/api/improvement/analyze', description: 'AI分析実行' },
        { method: 'GET', path: '/api/improvement/tasks', description: 'タスク一覧取得' },
        { method: 'POST', path: '/api/improvement/tasks', description: 'タスク作成' },
        { method: 'PUT', path: '/api/improvement/tasks/:id', description: 'タスク更新' },
      ],
    },
  ];

  // セキュリティ要件
  const securityFeatures = [
    {
      category: '認証・認可',
      items: [
        'JWT トークンベース認証',
        'bcrypt によるパスワードハッシュ化',
        'ロールベースアクセス制御（RBAC）',
        'セッション管理',
      ],
    },
    {
      category: 'データ保護',
      items: [
        'HTTPS 通信の強制',
        'CORS 設定による Origin 制限',
        '機密データの暗号化',
        'SQL インジェクション対策',
      ],
    },
    {
      category: 'API セキュリティ',
      items: [
        'Rate Limiting',
        'Input Validation',
        'Error Handling',
        'セキュリティヘッダー（Helmet.js）',
      ],
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('クリップボードにコピーしました');
  };

  const downloadAsMarkdown = () => {
    // Markdown形式でドキュメントを生成
    const markdown = generateMarkdownDoc();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'work-time-tracker-design-doc.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('設計書をダウンロードしました');
  };

  const generateMarkdownDoc = () => {
    return `# Work Time Tracker システム設計書

## システム概要
Work Time Trackerは、個人向けの包括的な管理システムです。勤怠管理を中心に、財務管理、読書記録、日記機能など、多様な個人データを統合的に管理できます。

## 技術スタック
### フロントエンド
- React 19.1.0
- TypeScript 5.8.3
- Vite 6.3.0
- Tailwind CSS 3.3.3
- Radix UI

### バックエンド
- Node.js + Express 5.1.0
- MongoDB + Mongoose 8.13.2
- JWT認証

### AI・分析
- Anthropic Claude API
- Google Gemini API

## 主要機能
${featureModules
  .map(
    (module) => `
### ${module.name}
${module.description}
- ステータス: ${module.status}
- 優先度: ${module.priority}
- 主要コンポーネント: ${module.components.join(', ')}
`
  )
  .join('')}

## API設計
${apiEndpoints
  .map(
    (category) => `
### ${category.category}
${category.endpoints.map((endpoint) => `- ${endpoint.method} ${endpoint.path} - ${endpoint.description}`).join('\n')}
`
  )
  .join('')}

## セキュリティ
${securityFeatures
  .map(
    (category) => `
### ${category.category}
${category.items.map((item) => `- ${item}`).join('\n')}
`
  )
  .join('')}
`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">システム設計書</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Work Time Tracker アプリケーションの包括的な技術仕様書
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={downloadAsMarkdown} className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Markdown でダウンロード</span>
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                window.open('https://github.com/umezawakanta/work-time-tracker', '_blank')
              }
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              GitHub で表示
            </Button>
          </div>
        </div>

        {/* メインコンテンツ */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="features">機能</TabsTrigger>
            <TabsTrigger value="tech-stack">技術</TabsTrigger>
            <TabsTrigger value="database">DB設計</TabsTrigger>
            <TabsTrigger value="api">API設計</TabsTrigger>
            <TabsTrigger value="security">セキュリティ</TabsTrigger>
            <TabsTrigger value="architecture">アーキテクチャ</TabsTrigger>
          </TabsList>

          {/* システム概要 */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="w-5 h-5" />
                  <span>プロジェクト概要</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">対象ユーザー</span>
                    </div>
                    <p className="text-sm text-gray-600">個人利用者、小規模チーム</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <span className="font-semibold">主要目標</span>
                    </div>
                    <p className="text-sm text-gray-600">包括的な個人データ管理</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold">技術特徴</span>
                    </div>
                    <p className="text-sm text-gray-600">React + TypeScript + AI</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="w-5 h-5 text-orange-600" />
                      <span className="font-semibold">データ分析</span>
                    </div>
                    <p className="text-sm text-gray-600">AI による自動分析</p>
                  </div>
                </div>

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    このアプリケーションは、勤怠管理を中心とした個人向け包括管理システムです。 React
                    + TypeScript による現代的なWebアプリケーションとして設計され、
                    AI技術を活用した分析機能を含んでいます。
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">主要な価値提案</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">✅ 統合管理</h4>
                      <p className="text-sm text-gray-600">
                        勤怠、財務、読書、日記など複数のデータを一元管理
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">🤖 AI分析</h4>
                      <p className="text-sm text-gray-600">Claude AIによる改善提案と自動分析</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">📊 データ可視化</h4>
                      <p className="text-sm text-gray-600">
                        Chart.js、Rechartsによる豊富なグラフ表示
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">🔒 セキュリティ</h4>
                      <p className="text-sm text-gray-600">JWT認証、データ暗号化、セキュアな通信</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 機能モジュール */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {featureModules.map((module) => (
                <Card key={module.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {module.icon}
                        <span>{module.name}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Badge
                          variant={
                            module.status === 'implemented'
                              ? 'default'
                              : module.status === 'partial'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {module.status}
                        </Badge>
                        <Badge
                          variant={
                            module.priority === 'critical'
                              ? 'destructive'
                              : module.priority === 'high'
                                ? 'default'
                                : module.priority === 'medium'
                                  ? 'secondary'
                                  : 'outline'
                          }
                        >
                          {module.priority}
                        </Badge>
                      </div>
                    </CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">主要コンポーネント</h4>
                        <div className="flex flex-wrap gap-1">
                          {module.components.map((component, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {component}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">依存関係</h4>
                        <div className="flex flex-wrap gap-1">
                          {module.dependencies.map((dep, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {dep}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">API エンドポイント</h4>
                        <div className="space-y-1">
                          {module.apis.map((api, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <code className="bg-gray-100 px-2 py-1 rounded text-xs">{api}</code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(api)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 技術スタック */}
          <TabsContent value="tech-stack" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {techStack.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Code2 className="w-5 h-5" />
                      <span>{category.category}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{item.name}</span>
                              <Badge variant="outline" className="text-xs">
                                v{item.version}
                              </Badge>
                              <Badge
                                variant={
                                  item.status === 'active'
                                    ? 'default'
                                    : item.status === 'deprecated'
                                      ? 'destructive'
                                      : 'secondary'
                                }
                                className="text-xs"
                              >
                                {item.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{item.purpose}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* データベース設計 */}
          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>データベース スキーマ設計</span>
                </CardTitle>
                <CardDescription>MongoDBを使用したドキュメント指向データベース</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Object.entries(databaseSchema).map(([tableName, schema]) => (
                    <Card key={tableName} className="border-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{tableName}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium mb-2">フィールド</h4>
                            <div className="space-y-1">
                              {schema.fields.map((field, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs font-mono">
                                    {field}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                          <Separator />
                          <div>
                            <h4 className="font-medium mb-2">関連</h4>
                            <div className="space-y-1">
                              {schema.relationships.map((rel, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <Badge variant="secondary" className="text-xs">
                                    → {rel}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API設計 */}
          <TabsContent value="api" className="space-y-6">
            <div className="space-y-6">
              {apiEndpoints.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Network className="w-5 h-5" />
                      <span>{category.category}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.endpoints.map((endpoint, endpointIndex) => (
                        <div
                          key={endpointIndex}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <Badge
                              variant={
                                endpoint.method === 'GET'
                                  ? 'default'
                                  : endpoint.method === 'POST'
                                    ? 'secondary'
                                    : endpoint.method === 'PUT'
                                      ? 'outline'
                                      : 'destructive'
                              }
                              className="w-16 justify-center"
                            >
                              {endpoint.method}
                            </Badge>
                            <code className="font-mono text-sm">{endpoint.path}</code>
                            <span className="text-sm text-gray-600">{endpoint.description}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(`${endpoint.method} ${endpoint.path}`)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* セキュリティ */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {securityFeatures.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>{category.category}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>セキュリティ実装詳細</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      すべてのAPI通信はHTTPS必須、JWT認証により保護されています。
                      機密データは暗号化され、適切なアクセス制御が実装されています。
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">🔐 認証フロー</h4>
                      <div className="text-sm space-y-1">
                        <p>1. ユーザー登録/ログイン</p>
                        <p>2. パスワードbcrypt化</p>
                        <p>3. JWTトークン発行</p>
                        <p>4. 各リクエストでトークン検証</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">🛡️ データ保護</h4>
                      <div className="text-sm space-y-1">
                        <p>1. HTTPS通信強制</p>
                        <p>2. CORS設定</p>
                        <p>3. Input Validation</p>
                        <p>4. Rate Limiting</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* アーキテクチャ */}
          <TabsContent value="architecture" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Layers className="w-5 h-5" />
                  <span>システムアーキテクチャ</span>
                </CardTitle>
                <CardDescription>3層アーキテクチャによるスケーラブルな設計</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* アーキテクチャ図（簡易版） */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-semibold mb-2 text-blue-600">プレゼンテーション層</h3>
                        <div className="space-y-1 text-sm">
                          <p>• React Components</p>
                          <p>• Tailwind CSS</p>
                          <p>• React Router</p>
                          <p>• State Management</p>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-semibold mb-2 text-green-600">ビジネスロジック層</h3>
                        <div className="space-y-1 text-sm">
                          <p>• Express.js API</p>
                          <p>• JWT 認証</p>
                          <p>• データ処理</p>
                          <p>• AI サービス</p>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-semibold mb-2 text-purple-600">データ層</h3>
                        <div className="space-y-1 text-sm">
                          <p>• MongoDB</p>
                          <p>• Mongoose ODM</p>
                          <p>• Firebase</p>
                          <p>• External APIs</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* デプロイメント情報 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">開発環境</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>フロントエンド:</span>
                          <Badge variant="outline">Vite Dev Server</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>バックエンド:</span>
                          <Badge variant="outline">Node.js + Express</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>データベース:</span>
                          <Badge variant="outline">MongoDB Local</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>ビルド:</span>
                          <Badge variant="outline">TypeScript + Vite</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">本番環境（推奨）</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>フロントエンド:</span>
                          <Badge>Vercel / Netlify</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>バックエンド:</span>
                          <Badge>Railway / Render</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>データベース:</span>
                          <Badge>MongoDB Atlas</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>CDN:</span>
                          <Badge>Cloudflare</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* パフォーマンス考慮事項 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>パフォーマンス最適化</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">🚀 フロントエンド</h4>
                          <ul className="text-sm space-y-1">
                            <li>• React.lazy による Code Splitting</li>
                            <li>• React.memo によるコンポーネント最適化</li>
                            <li>• useCallback/useMemo の適切な使用</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">⚡ バックエンド</h4>
                          <ul className="text-sm space-y-1">
                            <li>• MongoDB インデックス最適化</li>
                            <li>• API レスポンス キャッシュ</li>
                            <li>• 非同期処理の活用</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">📊 データ</h4>
                          <ul className="text-sm space-y-1">
                            <li>• ページネーション実装</li>
                            <li>• データ圧縮</li>
                            <li>• 適切なクエリ設計</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">🌐 ネットワーク</h4>
                          <ul className="text-sm space-y-1">
                            <li>• gzip 圧縮</li>
                            <li>• CDN 活用</li>
                            <li>• HTTP/2 サポート</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
