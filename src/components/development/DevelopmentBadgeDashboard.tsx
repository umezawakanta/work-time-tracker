import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Zap, Code, Palette, CheckCircle, Lock } from 'lucide-react';
import { DevelopmentBadge, BadgeCategory, DEVELOPMENT_BADGES } from '@/types/development-badges';

const difficultyColors = {
  bronze: 'bg-amber-100 text-amber-800 border-amber-200',
  silver: 'bg-gray-100 text-gray-800 border-gray-200',
  gold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  platinum: 'bg-purple-100 text-purple-800 border-purple-200',
  legendary: 'bg-gradient-to-r from-orange-400 to-pink-400 text-white border-none',
};

export const DevelopmentBadgeDashboard: React.FC = () => {
  const [badges, setBadges] = useState<DevelopmentBadge[]>(DEVELOPMENT_BADGES);
  const [selectedCategory, setSelectedCategory] = useState<'all' | BadgeCategory>('all');

  // GitHub APIからコミット数や進捗を取得
  useEffect(() => {
    fetchDevelopmentProgress();
  }, []);

  const fetchDevelopmentProgress = async () => {
    // GitHub API経由で実際の開発進捗を取得
    // コミット数、PR数、機能完成度などを分析
    try {
      const progress = await analyzeRepositoryProgress();
      updateBadgeProgress(progress);
    } catch (error) {
      console.error('Failed to fetch development progress:', error);
    }
  };

  const analyzeRepositoryProgress = async () => {
    // 実装例：GitHub APIを使用した進捗分析
    return {
      commitCount: 127,
      featuresCompleted: ['todo_crud', 'responsive_design'],
      testCoverage: 75,
      performanceScore: 85,
    };
  };

  const updateBadgeProgress = (progress: any) => {
    setBadges((currentBadges) =>
      currentBadges.map((badge) => {
        const updatedBadge = { ...badge };

        // バッジごとの進捗計算ロジック
        badge.requirements.forEach((req) => {
          switch (req.type) {
            case 'commit_count':
              req.current = progress.commitCount;
              break;
            case 'feature_complete':
              req.current = progress.featuresCompleted.includes(req.target)
                ? 'completed'
                : 'pending';
              break;
            case 'performance_score':
              req.current = progress.performanceScore;
              break;
          }
        });

        // 進捗率計算
        const completedRequirements = badge.requirements.filter((req) => {
          if (req.type === 'commit_count' || req.type === 'performance_score') {
            return Number(req.current) >= Number(req.target);
          }
          return req.current === 'completed';
        }).length;

        updatedBadge.progress = Math.round(
          (completedRequirements / badge.requirements.length) * 100
        );
        updatedBadge.isUnlocked = updatedBadge.progress === 100;

        return updatedBadge;
      })
    );
  };

  const categoryIcons = {
    foundation: <Code className="h-5 w-5" />,
    features: <Target className="h-5 w-5" />,
    ui_ux: <Palette className="h-5 w-5" />,
    performance: <Zap className="h-5 w-5" />,
    testing: <CheckCircle className="h-5 w-5" />,
    automation: <Zap className="h-5 w-5" />,
    community: <Trophy className="h-5 w-5" />,
    systematization: <Target className="h-5 w-5" />,
    completion: <Trophy className="h-5 w-5" />,
  };

  const filteredBadges =
    selectedCategory === 'all'
      ? badges
      : badges.filter((badge) => badge.category === selectedCategory);

  const overallProgress = Math.round(
    (badges.filter((b) => b.isUnlocked).length / badges.length) * 100
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">🏆 開発バッジシステム</h1>
            <p className="text-gray-600 mt-2">
              サイト開発の進捗をバッジで可視化・ゲーミフィケーション
            </p>
          </div>
          <Button onClick={fetchDevelopmentProgress} variant="outline">
            進捗を更新
          </Button>
        </div>

        {/* 全体進捗 */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              開発完成度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">全体進捗</span>
                  <span className="text-sm font-medium">{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {badges.filter((b) => b.isUnlocked).length}
                  </div>
                  <div className="text-sm text-gray-600">獲得済み</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {badges.filter((b) => b.progress > 0 && !b.isUnlocked).length}
                  </div>
                  <div className="text-sm text-gray-600">進行中</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {badges.filter((b) => b.progress === 0).length}
                  </div>
                  <div className="text-sm text-gray-600">未着手</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{badges.length}</div>
                  <div className="text-sm text-gray-600">総バッジ数</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* カテゴリフィルター */}
      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
        <TabsList className="grid grid-cols-5 lg:grid-cols-10 mb-6">
          <TabsTrigger value="all">全て</TabsTrigger>
          <TabsTrigger value="foundation">基盤</TabsTrigger>
          <TabsTrigger value="features">機能</TabsTrigger>
          <TabsTrigger value="ui_ux">UI/UX</TabsTrigger>
          <TabsTrigger value="performance">性能</TabsTrigger>
          <TabsTrigger value="testing">テスト</TabsTrigger>
          <TabsTrigger value="automation">自動化</TabsTrigger>
          <TabsTrigger value="community">コミュニティ</TabsTrigger>
          <TabsTrigger value="systematization">仕組み化</TabsTrigger>
          <TabsTrigger value="completion">完成</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// 個別バッジカード
const BadgeCard: React.FC<{ badge: DevelopmentBadge }> = ({ badge }) => {
  return (
    <Card
      className={`relative overflow-hidden transition-all hover:shadow-lg ${
        badge.isUnlocked ? 'border-green-200 bg-green-50' : 'border-gray-200'
      }`}
    >
      {badge.isUnlocked && (
        <div className="absolute top-2 right-2">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="text-4xl">{badge.icon}</div>
          <Badge className={difficultyColors[badge.difficulty]}>{badge.difficulty}</Badge>
        </div>
        <CardTitle className="text-lg">{badge.name}</CardTitle>
        <p className="text-sm text-gray-600">{badge.description}</p>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* 進捗バー */}
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

          {/* 要件リスト */}
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
                <span className="text-gray-600">{req.description}</span>
                <span className="text-gray-400 ml-auto">
                  {req.type === 'feature_complete'
                    ? req.current === 'completed'
                      ? '✓'
                      : '○'
                    : `${req.current}/${req.target}`}
                </span>
              </div>
            ))}
          </div>

          {badge.nextMilestone && !badge.isUnlocked && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
              <strong>次のマイルストーン:</strong> {badge.nextMilestone}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
