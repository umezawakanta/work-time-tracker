import React, { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import {
  Timer,
  Users,
  CheckCircle,
  History,
  Edit3,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Shield,
  Zap,
  Star,
  Rocket,
  Target,
  Award,
  TrendingUp,
  X,
  Loader2,
} from 'lucide-react';

// 🚀 Performance: Lazy load heavy components for better code splitting
const LazyFeatureCard = lazy(() =>
  Promise.resolve({
    default: ({
      feature,
      isExpanded,
      onExpand,
      onNavigate,
    }: {
      feature: NewFeature;
      isExpanded: boolean;
      onExpand: () => void;
      onNavigate: () => void;
    }) => (
      <Card
        className={`transition-all duration-300 hover:shadow-lg cursor-pointer border-2 ${
          isExpanded ? 'border-blue-300 shadow-lg' : 'border-gray-200'
        }`}
        onClick={onExpand}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">{feature.icon}</div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {feature.title}
                  {feature.badge && (
                    <Badge
                      className={
                        feature.badge === 'NEW'
                          ? 'bg-green-100 text-green-800'
                          : feature.badge === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {feature.badge}
                    </Badge>
                  )}
                </CardTitle>
                <Badge className={getCategoryBadgeColor(feature.category)}>
                  {feature.category === 'worktime'
                    ? '勤怠管理'
                    : feature.category === 'management'
                      ? '管理機能'
                      : '生産性'}
                </Badge>
              </div>
            </div>
            <ArrowRight
              className={`h-5 w-5 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-gray-600 mb-4">{feature.description}</p>

          {isExpanded && (
            <div className="space-y-4 border-t pt-4">
              {/* 主要機能 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  主要機能
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {feature.highlights.map((highlight, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              {/* メリット */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  期待できるメリット
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {feature.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* アクションボタン */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate();
                }}
                className="w-full mt-4"
                size="lg"
              >
                {feature.title}を使ってみる
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {!isExpanded && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate();
              }}
              variant="outline"
              className="w-full"
            >
              今すぐ使用する
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
    ),
  })
);

// 新機能の定義
interface NewFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
  isNew: boolean;
  category: 'worktime' | 'productivity' | 'management';
  adminOnly?: boolean;
  highlights: string[];
  benefits: string[];
}

// 🚀 Performance: Move large static data outside component to prevent re-creation
const newFeatures: NewFeature[] = [
  {
    id: 'realtime-punch',
    title: 'リアルタイム勤怠打刻',
    description:
      'GPS位置情報による正確な勤怠管理システム。出勤・退勤・休憩の打刻をワンクリックで！',
    icon: <Timer className="h-6 w-6" />,
    path: '/work-time-punch',
    badge: 'NEW',
    isNew: true,
    category: 'worktime',
    highlights: [
      'GPS位置情報による自動場所判定',
      'リアルタイムタイマー表示',
      '事業所内外の自動判別',
      'ワンクリック打刻システム',
    ],
    benefits: [
      '正確な勤務時間の記録',
      '不正打刻の防止',
      '管理者の負担軽減',
      'コンプライアンス向上',
    ],
  },
  {
    id: 'worktime-history',
    title: '勤怠履歴管理',
    description: '詳細な打刻履歴の確認と修正申請機能。過去の勤怠データを簡単に管理・修正できます。',
    icon: <History className="h-6 w-6" />,
    path: '/work-time-history',
    badge: 'NEW',
    isNew: true,
    category: 'worktime',
    highlights: ['詳細な打刻履歴表示', '修正申請機能', 'CSVエクスポート', '高度なフィルタリング'],
    benefits: [
      '過去データの詳細確認',
      '修正プロセスの効率化',
      'データの透明性向上',
      '監査対応の簡素化',
    ],
  },
  {
    id: 'worktime-approval',
    title: '勤怠承認管理',
    description: '管理者による勤怠記録の承認システム。効率的なワークフローで承認業務を簡素化。',
    icon: <CheckCircle className="h-6 w-6" />,
    path: '/work-time-approval',
    badge: 'ADMIN',
    isNew: true,
    category: 'management',
    adminOnly: true,
    highlights: [
      '承認待ち一覧表示',
      'ワンクリック承認・却下',
      '承認統計レポート',
      '詳細な却下理由記録',
    ],
    benefits: ['承認業務の効率化', '承認状況の可視化', '管理者負担の軽減', 'ガバナンス強化'],
  },
  {
    id: 'correction-approval',
    title: '修正申請承認',
    description: '従業員からの打刻修正申請を効率的に管理。透明性のある承認プロセスを実現。',
    icon: <Edit3 className="h-6 w-6" />,
    path: '/work-time-correction',
    badge: 'ADMIN',
    isNew: true,
    category: 'management',
    adminOnly: true,
    highlights: [
      '修正申請の詳細表示',
      '優先度ベースの管理',
      '承認・却下の理由記録',
      '修正前後の比較表示',
    ],
    benefits: [
      '修正プロセスの透明化',
      '管理者業務の効率化',
      '従業員の信頼性向上',
      'コンプライアンス強化',
    ],
  },
  {
    id: 'realtime-monitoring',
    title: 'リアルタイム勤務監視',
    description: '全従業員の勤務状況をリアルタイムで監視。統計情報とダッシュボードで一目で把握。',
    icon: <Users className="h-6 w-6" />,
    path: '/work-time-dashboard',
    badge: 'LIVE',
    isNew: true,
    category: 'management',
    adminOnly: true,
    highlights: ['リアルタイム勤務状況表示', '統計サマリー', '30秒自動更新', '位置情報表示'],
    benefits: [
      'リアルタイム状況把握',
      '緊急時の迅速対応',
      '労務管理の効率化',
      'データドリブン経営',
    ],
  },
];

// 🚀 Performance: Extract utility function to prevent inline creation
const getCategoryBadgeColor = (category: string) => {
  switch (category) {
    case 'worktime':
      return 'bg-blue-100 text-blue-800';
    case 'management':
      return 'bg-purple-100 text-purple-800';
    case 'productivity':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const FeatureDiscoveryDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'worktime' | 'productivity' | 'management'
  >('all');
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const isAdmin = user?.isAdmin || false;

  // 🚀 Performance: Memoize filtered features to prevent recalculation
  const filteredFeatures = React.useMemo(
    () =>
      newFeatures.filter((feature) => {
        if (selectedCategory !== 'all' && feature.category !== selectedCategory) return false;
        if (feature.adminOnly && !isAdmin) return false;
        return true;
      }),
    [selectedCategory, isAdmin]
  );

  // 🚀 Performance: Memoize categories to prevent recreation
  const categories = React.useMemo(
    () => [
      { id: 'all', label: '全て', icon: <Sparkles className="h-4 w-4" /> },
      { id: 'worktime', label: '勤怠管理', icon: <Clock className="h-4 w-4" /> },
      { id: 'management', label: '管理機能', icon: <Shield className="h-4 w-4" /> },
    ],
    []
  );

  const handleFeatureClick = React.useCallback(
    (feature: NewFeature) => {
      navigate(feature.path);
    },
    [navigate]
  );

  return (
    <div className="space-y-6">
      {/* ウェルカムメッセージ */}
      {showWelcome && (
        <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <div className="flex items-center justify-between">
            <div>
              <AlertDescription className="text-blue-800">
                <strong>🎉 新機能が追加されました！</strong>
                包括的な勤怠管理システムが利用可能になりました。GPS打刻、承認ワークフロー、リアルタイム監視など、
                業務効率を大幅に向上させる機能をぜひお試しください。
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWelcome(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      )}

      {/* ヘッダー */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Rocket className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            新機能ダッシュボード
          </h1>
        </div>
        <p className="text-gray-600 text-lg">
          最新の機能を発見して、業務効率を大幅に向上させましょう
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-800">{filteredFeatures.length}</p>
                <p className="text-green-600 text-sm">利用可能な新機能</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-800">100%</p>
                <p className="text-blue-600 text-sm">業務効率向上</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-800">
                  {isAdmin ? 'フル' : 'スタンダード'}
                </p>
                <p className="text-purple-600 text-sm">アクセスレベル</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* カテゴリーフィルター */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.id as any)}
            className="flex items-center gap-2"
          >
            {category.icon}
            {category.label}
          </Button>
        ))}
      </div>

      {/* 機能カード - 🚀 Performance: Use lazy loading for better performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          }
        >
          {filteredFeatures.map((feature) => (
            <LazyFeatureCard
              key={feature.id}
              feature={feature}
              isExpanded={expandedFeature === feature.id}
              onExpand={() =>
                setExpandedFeature(expandedFeature === feature.id ? null : feature.id)
              }
              onNavigate={() => handleFeatureClick(feature)}
            />
          ))}
        </Suspense>
      </div>

      {/* フッターメッセージ */}
      <Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">さらなる機能開発中</h3>
          </div>
          <p className="text-gray-600">
            より多くの生産性向上機能が続々と追加予定です。ご期待ください！
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
