import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Target,
  Zap,
  Code,
  Palette,
  CheckCircle,
  ArrowRight,
  Star,
  Award,
  TrendingUp,
  Activity,
  Users,
  BarChart3,
  Settings,
  Sparkles,
  Rocket,
  Calendar,
  Clock,
  Gamepad2,
  RefreshCw,
} from 'lucide-react';
import { DevelopmentBadge, DEVELOPMENT_BADGES } from '@/types/development-badges';
import { useAuth } from '@/hooks/useAuth';
import { UserOnboardingModal } from '@/components/engagement/UserOnboardingModal';
import { unifiedBadgeManagementService } from '@/services/badges/UnifiedBadgeManagementService';
import { gameLoopTaskService, GameLoopStats } from '@/services/productivity/GameLoopTaskService';
import { toast } from 'react-hot-toast';

const difficultyColors = {
  bronze: 'bg-amber-100 text-amber-800 border-amber-200',
  silver: 'bg-gray-100 text-gray-800 border-gray-200',
  gold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  platinum: 'bg-purple-100 text-purple-800 border-purple-200',
  legendary: 'bg-gradient-to-r from-orange-400 to-pink-400 text-white border-none',
};

const categoryIcons = {
  foundation: <Code className="h-5 w-5" />,
  features: <Target className="h-5 w-5" />,
  ui_ux: <Palette className="h-5 w-5" />,
  performance: <Zap className="h-5 w-5" />,
  testing: <CheckCircle className="h-5 w-5" />,
  automation: <Settings className="h-5 w-5" />,
  community: <Users className="h-5 w-5" />,
  systematization: <Target className="h-5 w-5" />,
  completion: <Trophy className="h-5 w-5" />,
  operations: <Activity className="h-5 w-5" />,
  monitoring: <BarChart3 className="h-5 w-5" />,
  analytics: <TrendingUp className="h-5 w-5" />,
  business: <Users className="h-5 w-5" />,
  growth: <Rocket className="h-5 w-5" />,
};

const categoryLabels = {
  foundation: '基盤構築',
  features: '機能実装',
  ui_ux: 'UI/UX改善',
  performance: 'パフォーマンス',
  testing: 'テスト・品質',
  automation: '自動化',
  community: 'コミュニティ',
  systematization: '仕組み化',
  completion: '完成度',
  operations: '運用',
  monitoring: '監視',
  analytics: '分析',
  business: 'ビジネス',
  growth: '成長',
};

export const DevelopmentBadgeShowcasePage: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [achievements, setAchievements] = useState<DevelopmentBadge[]>([]);

  // ゲームループシステム統合状態
  const [gameLoopStats, setGameLoopStats] = useState<GameLoopStats | null>(null);
  const [showGameLoopIntegration, setShowGameLoopIntegration] = useState(false);
  const [badgeAccelerationData, setBadgeAccelerationData] = useState<{
    acceleratedBadges: number;
    timeReduction: number;
    progressBoost: number;
    motivationIndex: number;
  } | null>(null);

  useEffect(() => {
    // 統一バッジ管理サービスからバッジデータを取得
    const unifiedBadges = unifiedBadgeManagementService.getBadgeData();

    // バッジデータをソート
    const sortedBadges = [...unifiedBadges].sort((a, b) => {
      if (a.isUnlocked && !b.isUnlocked) {
        return -1;
      }
      if (!a.isUnlocked && b.isUnlocked) {
        return 1;
      }
      if (a.isUnlocked && b.isUnlocked) {
        return new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime();
      }
      return b.progress - a.progress;
    });
    setAchievements(sortedBadges);

    // ゲームループ統合初期化
    initializeGameLoopIntegration();

    // 統一サービスのイベントリスナー設定
    const handleBadgeUpdate = () => {
      const updatedBadges = unifiedBadgeManagementService.getBadgeData();
      const sortedUpdatedBadges = [...updatedBadges].sort((a, b) => {
        if (a.isUnlocked && !b.isUnlocked) {
          return -1;
        }
        if (!a.isUnlocked && b.isUnlocked) {
          return 1;
        }
        if (a.isUnlocked && b.isUnlocked) {
          return new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime();
        }
        return b.progress - a.progress;
      });
      setAchievements(sortedUpdatedBadges);
      calculateBadgeAcceleration(updatedBadges); // ゲームループ効果再計算
    };

    const handleBadgeUnlocked = (data: any) => {
      console.log('🏆 実績ページ: 新しいバッジがアンロックされました！', data.badge.name);
      handleBadgeUpdate(); // データを再取得
    };

    // イベントリスナー登録
    unifiedBadgeManagementService.on('badge-progress-updated', handleBadgeUpdate);
    unifiedBadgeManagementService.on('badge-unlocked', handleBadgeUnlocked);
    unifiedBadgeManagementService.on('sync-data-updated', handleBadgeUpdate);

    // クリーンアップ
    return () => {
      unifiedBadgeManagementService.off('badge-progress-updated', handleBadgeUpdate);
      unifiedBadgeManagementService.off('badge-unlocked', handleBadgeUnlocked);
      unifiedBadgeManagementService.off('sync-data-updated', handleBadgeUpdate);
    };
  }, []);

  // ゲームループ統合初期化
  const initializeGameLoopIntegration = async () => {
    try {
      const stats = gameLoopTaskService.getGameLoopStats();
      setGameLoopStats(stats);
      setShowGameLoopIntegration(true);
      calculateBadgeAcceleration(achievements);

      console.log('🎮 Badge Showcase × Game Loop統合完了:', stats);
    } catch (error) {
      console.error('Game Loop統合エラー:', error);
    }
  };

  // バッジ獲得加速効果計算
  const calculateBadgeAcceleration = (badges: DevelopmentBadge[]) => {
    if (!gameLoopStats) return;

    // ゲームループによるバッジ獲得加速効果を計算
    const completedToday = gameLoopStats.tasksCompletedToday || 0;
    const streakDays = gameLoopStats.currentStreak || 0;
    const totalCompleted = gameLoopStats.totalTasksCompleted || 0;

    // 加速されるバッジ数（進行中のバッジの一部）
    const inProgressBadges = badges.filter((badge) => badge.progress > 0 && badge.progress < 100);
    const acceleratedBadges = Math.min(Math.floor(completedToday * 0.3), inProgressBadges.length);

    // 時間短縮効果（マイクロタスクによる継続性向上）
    const timeReduction = Math.min(streakDays * 2, 30); // 最大30%短縮

    // 進捗ブースト（プロシージネーション削減効果）
    const progressBoost = Math.min(completedToday * 3, 25); // 最大25%向上

    // モチベーション指数（継続性×達成感）
    const motivationIndex = Math.min(streakDays * 5 + completedToday * 10, 100);

    setBadgeAccelerationData({
      acceleratedBadges,
      timeReduction,
      progressBoost,
      motivationIndex,
    });
  };

  const filteredBadges =
    selectedCategory === 'all'
      ? achievements
      : achievements.filter((badge) => badge.category === selectedCategory);

  const unlockedBadges = achievements.filter((b) => b.isUnlocked);
  const totalProgress = Math.round((unlockedBadges.length / achievements.length) * 100);

  // Get recent achievements (last 30 days)
  const recentAchievements = unlockedBadges.filter((badge) => {
    if (!badge.unlockedAt) {
      return false;
    }
    const achievementDate = new Date(badge.unlockedAt);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return achievementDate > thirtyDaysAgo;
  });

  // Latest achievements for highlighting
  const latestAchievements = [
    'sustainable-code-champion',
    'system-monitoring-master',
    'user-engagement-champion',
    'operations-efficiency-expert',
    'data-analytics-expert',
  ];

  const renderFeatureHighlight = (badgeId: string) => {
    const highlights = {
      'sustainable-code-champion': {
        title: '♻️ 持続可能な開発',
        features: [
          'カーボンフットプリント監視',
          'エネルギー効率的アルゴリズム',
          'リソース最適化',
          'グリーンメトリクス',
        ],
        impact: 'CO2排出量を35%削減、エネルギー効率を45%向上',
      },
      'system-monitoring-master': {
        title: '📊 システム監視',
        features: [
          'リアルタイム監視 (10秒間隔)',
          'インテリジェントアラート',
          'SLO/SLI追跡',
          'ヘルスチェックシステム',
        ],
        impact: '99.9%のアップタイム達成、障害検知時間を90%短縮',
      },
      'user-engagement-champion': {
        title: '👥 ユーザーエンゲージメント',
        features: [
          '包括的オンボーディング (10ステップ)',
          'リテンション分析',
          'エンゲージメントスコア',
          'チャーン予測',
        ],
        impact: 'ユーザー継続率を60%向上、オンボーディング完了率85%',
      },
      'operations-efficiency-expert': {
        title: '🔧 運用効率化',
        features: [
          'GitHub Actions CI/CD',
          'Vercel自動デプロイ',
          'インフラ監視',
          'バックアップシステム',
        ],
        impact: 'デプロイ時間を80%短縮、障害復旧時間を70%削減',
      },
      'data-analytics-expert': {
        title: '📈 データ分析',
        features: [
          'ユーザー行動追跡',
          'A/Bテストフレームワーク',
          'コンバージョンファネル',
          '予測分析エンジン',
        ],
        impact: 'データドリブンな意思決定支援、コンバージョン率25%向上',
      },
    };

    const highlight = highlights[badgeId as keyof typeof highlights];
    if (!highlight) {
      return null;
    }

    return (
      <Card className="border-l-4 border-l-green-500 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-green-600" />
            {highlight.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 text-sm text-gray-700">実装機能</h4>
              <ul className="space-y-1">
                {highlight.features.map((feature, index) => (
                  <li key={index} className="text-sm flex items-center">
                    <CheckCircle className="w-3 h-3 mr-2 text-green-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm text-gray-700">インパクト</h4>
              <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
                {highlight.impact}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderBadgeCard = (badge: DevelopmentBadge) => {
    const isLatest = latestAchievements.includes(badge.id);

    return (
      <Card
        key={badge.id}
        className={`relative overflow-hidden transition-all hover:shadow-lg ${
          badge.isUnlocked
            ? 'border-green-200 bg-green-50'
            : badge.progress > 0
              ? 'border-blue-200 bg-blue-50'
              : 'border-gray-200'
        } ${isLatest ? 'ring-2 ring-purple-500 shadow-lg' : ''}`}
      >
        {badge.isUnlocked && (
          <div className="absolute top-2 right-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        )}

        {isLatest && (
          <div className="absolute top-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 text-xs font-semibold">
            🆕 NEW
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="text-4xl">{badge.icon}</div>
            <Badge className={difficultyColors[badge.difficulty]}>{badge.difficulty}</Badge>
          </div>
          <CardTitle className="text-lg">{badge.name}</CardTitle>
          <CardDescription>{badge.description}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">進捗</span>
                <span className="text-sm">{badge.progress}%</span>
              </div>
              <Progress
                value={badge.progress}
                className={`h-2 ${badge.isUnlocked ? 'bg-green-100' : ''}`}
              />
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">要件:</h4>
              {badge.requirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div
                    className={`w-2 h-2 rounded-full ${(() => {
                      if (req.type === 'commit_count' || req.type === 'performance_score') {
                        return Number(req.current) >= Number(req.target)
                          ? 'bg-green-500'
                          : 'bg-gray-300';
                      }
                      return req.current === 'completed' ? 'bg-green-500' : 'bg-gray-300';
                    })()}`}
                  />
                  <span className="text-gray-600 flex-1">{req.description}</span>
                  <span className="text-gray-400">
                    {req.type === 'feature_complete'
                      ? req.current === 'completed'
                        ? '✓'
                        : '○'
                      : `${req.current}/${req.target}`}
                  </span>
                </div>
              ))}
            </div>

            {/* Achievement date */}
            {badge.isUnlocked && badge.unlockedAt && (
              <div className="text-xs text-green-600 bg-green-100 p-2 rounded flex items-center">
                <Award className="w-3 h-3 mr-1" />
                獲得日: {new Date(badge.unlockedAt).toLocaleDateString('ja-JP')}
              </div>
            )}

            {/* Next milestone */}
            {badge.nextMilestone && !badge.isUnlocked && (
              <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded flex items-center">
                <Target className="w-3 h-3 mr-1" />
                次の目標: {badge.nextMilestone}
              </div>
            )}

            {/* Feature highlight for latest achievements */}
            {isLatest && badge.isUnlocked && (
              <div className="mt-4">{renderFeatureHighlight(badge.id)}</div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold flex items-center">
              🏆 開発バッジ実績
              <Sparkles className="ml-3 text-yellow-500" />
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              最新の開発成果とテクニカルアチーブメントをご紹介
            </p>
          </div>
          <Button
            onClick={() => setShowOnboarding(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Users className="w-4 h-4 mr-2" />
            オンボーディング体験
          </Button>
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                獲得バッジ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{unlockedBadges.length}</div>
              <div className="text-sm text-gray-600">/ {achievements.length} バッジ</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                全体進捗
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{totalProgress}%</div>
              <Progress value={totalProgress} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Star className="h-5 w-5 mr-2 text-purple-500" />
                今月の達成
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{recentAchievements.length}</div>
              <div className="text-sm text-gray-600">新規獲得バッジ</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Rocket className="h-5 w-5 mr-2 text-orange-500" />
                難易度レベル
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {Math.max(
                  ...unlockedBadges.map((b) =>
                    b.difficulty === 'legendary'
                      ? 5
                      : b.difficulty === 'platinum'
                        ? 4
                        : b.difficulty === 'gold'
                          ? 3
                          : b.difficulty === 'silver'
                            ? 2
                            : 1
                  )
                )}
              </div>
              <div className="text-sm text-gray-600">最高レベル</div>
            </CardContent>
          </Card>
        </div>

        {/* Latest achievements showcase */}
        {recentAchievements.length > 0 && (
          <Card className="mb-8 border-4 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Star className="w-6 h-6 mr-2 text-yellow-500" />
                🎉 最新アチーブメント
              </CardTitle>
              <CardDescription>最近獲得した開発バッジと実装した主要機能</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {recentAchievements.slice(0, 3).map((badge) => (
                  <div key={badge.id} className="flex items-center p-4 bg-white rounded-lg border">
                    <div className="text-3xl mr-4">{badge.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{badge.name}</h4>
                      <p className="text-gray-600 text-sm">{badge.description}</p>
                      <div className="flex items-center mt-2">
                        <Badge className={difficultyColors[badge.difficulty]}>
                          {badge.difficulty}
                        </Badge>
                        <span className="ml-2 text-xs text-gray-500">
                          {badge.unlockedAt &&
                            new Date(badge.unlockedAt).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Badge categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-5 lg:grid-cols-15 mb-6 h-auto flex-wrap">
          <TabsTrigger value="all" className="flex items-center">
            <Trophy className="w-4 h-4 mr-1" />
            全て
          </TabsTrigger>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="flex items-center text-xs">
              {categoryIcons[key as keyof typeof categoryIcons]}
              <span className="ml-1 hidden lg:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBadges.map((badge) => renderBadgeCard(badge))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Development roadmap */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            開発ロードマップ
          </CardTitle>
          <CardDescription>次に達成予定のバッジと開発計画</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {achievements
              .filter((badge) => !badge.isUnlocked && badge.progress > 0)
              .slice(0, 5)
              .map((badge) => (
                <div key={badge.id} className="flex items-center p-4 border rounded-lg">
                  <div className="text-2xl mr-4">{badge.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{badge.name}</h4>
                      <Badge className={difficultyColors[badge.difficulty]}>
                        {badge.difficulty}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{badge.description}</p>
                    <div className="flex items-center">
                      <Progress value={badge.progress} className="flex-1 h-2 mr-3" />
                      <span className="text-sm font-medium">{badge.progress}%</span>
                    </div>
                    {badge.nextMilestone && (
                      <p className="text-xs text-blue-600 mt-1">Next: {badge.nextMilestone}</p>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 ml-4" />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Onboarding modal */}
      <UserOnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
};
