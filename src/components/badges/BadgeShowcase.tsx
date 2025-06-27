import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Trophy,
  Star,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  Search,
  Filter,
  Target,
  Zap,
  Crown,
  Medal,
  Award,
  Gem,
  ChevronRight,
  Calendar,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import {
  EXPANDED_BADGES_DATABASE,
  getBadgeStatsSummary,
} from '@/services/development/ExpandedBadgesDatabase';
import { DevelopmentBadge, BadgeCategory } from '@/types/development-badges';

interface BadgeGrouping {
  category: BadgeCategory;
  name: string;
  icon: React.ElementType;
  color: string;
  badges: DevelopmentBadge[];
}

interface BadgeFilters {
  category: BadgeCategory | 'all';
  difficulty: string;
  status: 'all' | 'completed' | 'in-progress' | 'available' | 'locked';
  searchQuery: string;
}

export const BadgeShowcase: React.FC = () => {
  const [badges, setBadges] = useState<DevelopmentBadge[]>([]);
  const [groupedBadges, setGroupedBadges] = useState<BadgeGrouping[]>([]);
  const [filters, setFilters] = useState<BadgeFilters>({
    category: 'all',
    difficulty: 'all',
    status: 'all',
    searchQuery: '',
  });
  const [selectedBadge, setSelectedBadge] = useState<DevelopmentBadge | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'categories'>('categories');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    initializeBadgeShowcase();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  /**
   * 🚀 バッジショーケース初期化
   */
  const initializeBadgeShowcase = () => {
    setBadges(EXPANDED_BADGES_DATABASE);
    const summary = getBadgeStatsSummary();
    setStats(summary);

    // カテゴリ別グループ化
    const groupings = createBadgeGroupings(EXPANDED_BADGES_DATABASE);
    setGroupedBadges(groupings);

    console.log('🏆 バッジショーケース初期化完了:', EXPANDED_BADGES_DATABASE.length, 'バッジ');
  };

  /**
   * 📊 バッジグループ化
   */
  const createBadgeGroupings = (allBadges: DevelopmentBadge[]): BadgeGrouping[] => {
    const categoryMap: Record<
      BadgeCategory,
      { name: string; icon: React.ElementType; color: string }
    > = {
      foundation: { name: 'プラットフォーム基盤', icon: Trophy, color: 'text-blue-600' },
      features: { name: '機能開発', icon: Zap, color: 'text-green-600' },
      ui_ux: { name: 'UI/UX', icon: Star, color: 'text-purple-600' },
      performance: { name: 'パフォーマンス', icon: TrendingUp, color: 'text-orange-600' },
      testing: { name: 'テスト・品質', icon: CheckCircle2, color: 'text-teal-600' },
      automation: { name: '自動化・CI/CD', icon: Target, color: 'text-red-600' },
      community: { name: 'コミュニティ', icon: Award, color: 'text-pink-600' },
      ai_ml: { name: 'AI・機械学習', icon: Crown, color: 'text-indigo-600' },
      internationalization: { name: '国際化', icon: Medal, color: 'text-cyan-600' },
      entrepreneurship: { name: '起業・事業', icon: Gem, color: 'text-yellow-600' },
      agile: { name: 'アジャイル', icon: Zap, color: 'text-lime-600' },
      design: { name: 'デザイン', icon: Star, color: 'text-rose-600' },
      devops: { name: 'DevOps・インフラ', icon: BarChart3, color: 'text-slate-600' },
      skill_mapping: { name: 'スキルマップ', icon: Trophy, color: 'text-amber-600' },
      business: { name: 'ビジネス・経営', icon: Crown, color: 'text-emerald-600' },
      finance: { name: '財務・会計', icon: Medal, color: 'text-green-700' },
      legal: { name: '法務・コンプライアンス', icon: Award, color: 'text-gray-600' },
      accounting: { name: '会計・税務', icon: BarChart3, color: 'text-blue-700' },
      hr: { name: '人事・労務', icon: Trophy, color: 'text-purple-700' },
      marketing: { name: 'マーケティング', icon: TrendingUp, color: 'text-pink-700' },
      sales: { name: '営業・販売', icon: Target, color: 'text-orange-700' },
      monetization: { name: 'マネタイゼーション', icon: Gem, color: 'text-yellow-700' },
      content: { name: 'コンテンツ制作', icon: Star, color: 'text-indigo-700' },
      publishing: { name: '出版・編集', icon: Medal, color: 'text-cyan-700' },
      sustainability: { name: '持続可能性', icon: Trophy, color: 'text-lime-700' },
      philosophy: { name: '哲学・思想', icon: Crown, color: 'text-gray-700' },
      economics: { name: '経済・投資', icon: BarChart3, color: 'text-emerald-700' },
      culture: { name: '文化・歴史', icon: Award, color: 'text-amber-700' },
      arts: { name: '芸術・創作', icon: Star, color: 'text-rose-700' },
      literature: { name: '文学・言語', icon: Medal, color: 'text-blue-800' },
      politics: { name: '政治・社会', icon: Trophy, color: 'text-red-700' },
      security: { name: 'セキュリティ', icon: Target, color: 'text-red-800' },
      gamification: { name: 'ゲーミフィケーション', icon: Zap, color: 'text-purple-800' },
      accessibility: { name: 'アクセシビリティ', icon: CheckCircle2, color: 'text-teal-700' },
    };

    const categories = Object.keys(categoryMap) as BadgeCategory[];

    return categories
      .map((category) => {
        const categoryBadges = allBadges.filter((badge) => badge.category === category);
        return {
          category,
          name: categoryMap[category].name,
          icon: categoryMap[category].icon,
          color: categoryMap[category].color,
          badges: categoryBadges,
        };
      })
      .filter((group) => group.badges.length > 0);
  };

  /**
   * 🔍 フィルター適用
   */
  const applyFilters = () => {
    let filteredBadges = [...EXPANDED_BADGES_DATABASE];

    // カテゴリフィルター
    if (filters.category !== 'all') {
      filteredBadges = filteredBadges.filter((badge) => badge.category === filters.category);
    }

    // 難易度フィルター
    if (filters.difficulty !== 'all') {
      filteredBadges = filteredBadges.filter((badge) => badge.difficulty === filters.difficulty);
    }

    // ステータスフィルター
    if (filters.status !== 'all') {
      filteredBadges = filteredBadges.filter((badge) => {
        switch (filters.status) {
          case 'completed':
            return badge.isCompleted;
          case 'in-progress':
            return !badge.isCompleted && badge.progress > 0;
          case 'available':
            return badge.isUnlocked && !badge.isCompleted && badge.progress === 0;
          case 'locked':
            return !badge.isUnlocked;
          default:
            return true;
        }
      });
    }

    // 検索フィルター
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredBadges = filteredBadges.filter(
        (badge) =>
          badge.name.toLowerCase().includes(query) ||
          badge.description.toLowerCase().includes(query)
      );
    }

    setBadges(filteredBadges);

    // グループ化も更新
    const groupings = createBadgeGroupings(filteredBadges);
    setGroupedBadges(groupings);
  };

  /**
   * 🎨 難易度スタイル取得
   */
  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'bronze':
        return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
      case 'silver':
        return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
      case 'gold':
        return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
      case 'platinum':
        return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'legendary':
        return { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  /**
   * 🏆 バッジカードレンダリング
   */
  const renderBadgeCard = (badge: DevelopmentBadge) => {
    const difficultyStyle = getDifficultyStyle(badge.difficulty);
    const isCompleted = badge.isCompleted;
    const isInProgress = !isCompleted && badge.progress > 0;
    const isLocked = !badge.isUnlocked;

    return (
      <Card
        key={badge.id}
        className={`
          cursor-pointer transition-all duration-200 hover:shadow-lg
          ${isCompleted ? 'ring-2 ring-green-500 bg-green-50' : ''}
          ${isInProgress ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
          ${isLocked ? 'opacity-60 grayscale' : ''}
        `}
        onClick={() => setSelectedBadge(badge)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{badge.icon}</span>
              <div>
                <h3 className="font-semibold text-sm">{badge.name}</h3>
                <p className="text-xs text-muted-foreground">{badge.category}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <Badge
                variant="outline"
                className={`text-xs ${difficultyStyle.color} ${difficultyStyle.bg} ${difficultyStyle.border}`}
              >
                {badge.difficulty}
              </Badge>

              {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-600" />}
              {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
              {!isCompleted && !isLocked && <Unlock className="w-4 h-4 text-blue-600" />}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{badge.description}</p>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>進捗</span>
              <span className="font-medium">{badge.progress}%</span>
            </div>
            <Progress value={badge.progress} className="h-2" />
          </div>

          {badge.points && (
            <div className="flex justify-between items-center mt-3 pt-2 border-t">
              <span className="text-xs text-muted-foreground">獲得ポイント</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span className="text-xs font-medium">{badge.points}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  /**
   * 📊 統計ダッシュボード
   */
  const renderStatsDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">総バッジ数</p>
              <p className="text-2xl font-bold">{stats?.totalBadges || 0}</p>
            </div>
            <Trophy className="w-8 h-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">完了済み</p>
              <p className="text-2xl font-bold text-green-600">{stats?.completedBadges || 0}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">完了率</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats?.completionRate?.toFixed(1) || 0}%
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">総ポイント</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats?.totalPoints?.toLocaleString() || 0}
              </p>
            </div>
            <Star className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="w-8 h-8 text-primary" />
            バッジショーケース
          </h1>
          <p className="text-muted-foreground mt-2">
            全分野にわたる開発・ビジネス・人文バッジの完全コレクション
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'categories' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('categories')}
          >
            カテゴリ別
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            グリッド
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            リスト
          </Button>
        </div>
      </div>

      {/* 統計ダッシュボード */}
      {stats && renderStatsDashboard()}

      {/* フィルター */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="バッジを検索..."
                value={filters.searchQuery}
                onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                className="pl-10"
              />
            </div>

            <select
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value as any }))}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">全カテゴリ</option>
              {groupedBadges.map((group) => (
                <option key={group.category} value={group.category}>
                  {group.name}
                </option>
              ))}
            </select>

            <select
              value={filters.difficulty}
              onChange={(e) => setFilters((prev) => ({ ...prev, difficulty: e.target.value }))}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">全難易度</option>
              <option value="bronze">ブロンズ</option>
              <option value="silver">シルバー</option>
              <option value="gold">ゴールド</option>
              <option value="platinum">プラチナ</option>
              <option value="legendary">レジェンダリー</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as any }))}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">全ステータス</option>
              <option value="completed">完了済み</option>
              <option value="in-progress">進行中</option>
              <option value="available">利用可能</option>
              <option value="locked">ロック中</option>
            </select>

            <Button
              variant="outline"
              onClick={() =>
                setFilters({ category: 'all', difficulty: 'all', status: 'all', searchQuery: '' })
              }
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              リセット
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* バッジ表示 */}
      {viewMode === 'categories' && (
        <div className="space-y-6">
          {groupedBadges.map((group) => (
            <Card key={group.category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <group.icon className={`w-6 h-6 ${group.color}`} />
                  <span>{group.name}</span>
                  <Badge variant="outline">{group.badges.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {group.badges.map((badge) => renderBadgeCard(badge))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {badges.map((badge) => renderBadgeCard(badge))}
        </div>
      )}

      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="p-4 hover:bg-muted/50 cursor-pointer flex items-center justify-between"
                  onClick={() => setSelectedBadge(badge)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <h3 className="font-semibold">{badge.name}</h3>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{badge.progress}%</div>
                      <Progress value={badge.progress} className="w-20 h-2" />
                    </div>

                    <Badge variant="outline" className={getDifficultyStyle(badge.difficulty).color}>
                      {badge.difficulty}
                    </Badge>

                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* バッジ詳細モーダル */}
      {selectedBadge && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedBadge(null)}
        >
          <Card
            className="max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-4xl">{selectedBadge.icon}</span>
                <div>
                  <h2 className="text-xl">{selectedBadge.name}</h2>
                  <Badge
                    variant="outline"
                    className={getDifficultyStyle(selectedBadge.difficulty).color}
                  >
                    {selectedBadge.difficulty}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{selectedBadge.description}</p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>進捗状況</span>
                  <span className="font-medium">{selectedBadge.progress}%</span>
                </div>
                <Progress value={selectedBadge.progress} className="h-3" />
              </div>

              {selectedBadge.requirements && (
                <div>
                  <h3 className="font-semibold mb-2">達成要件</h3>
                  <div className="space-y-2">
                    {selectedBadge.requirements.map((req, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded bg-muted/50"
                      >
                        <span className="text-sm">{req.description}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {req.progress || 0}/{req.target}
                          </span>
                          {req.isCompleted && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedBadge.points && (
                <div className="flex items-center justify-between p-3 rounded bg-yellow-50 border border-yellow-200">
                  <span className="font-medium">獲得ポイント</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="font-bold text-lg">{selectedBadge.points}</span>
                  </div>
                </div>
              )}

              {selectedBadge.completedAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    完了日: {new Date(selectedBadge.completedAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BadgeShowcase;
