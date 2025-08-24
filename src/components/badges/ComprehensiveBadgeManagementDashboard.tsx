/**
 * 🏆 包括的バッジ管理ダッシュボード
 * 全分野のバッジシステムと4週間のサイバーセキュリティ学習計画を統合管理
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Shield,
  Calendar,
  Trophy,
  TrendingUp,
  Target,
  Clock,
  Star,
  Zap,
  Brain,
  Code,
  Briefcase,
  Globe,
  Lightbulb,
  Users,
  BookOpen,
  Search,
  Filter,
  ChevronRight,
  Award,
  BarChart3,
  Settings,
} from 'lucide-react';
import {
  ALL_COMPREHENSIVE_BADGES,
  TECHNICAL_BADGES,
  BUSINESS_BADGES,
  MARKETING_BADGES,
  SOCIAL_BADGES,
  FINANCIAL_BADGES,
  ComprehensiveBadge,
  BadgeCategory,
} from '@/types/comprehensive-badge-categories';
import {
  CYBERSECURITY_SPECIALIST_BADGE,
  SECURITY_BADGES_COLLECTION,
} from '@/types/cybersecurity-badges';
import {
  weeklyWorkPlanningService,
  WeeklyWorkPlan,
} from '@/services/planning/WeeklyWorkPlanningService';
import { comprehensivePageSyncSystem } from '@/services/integration/ComprehensivePageSyncSystem';

interface BadgeProgress {
  badgeId: string;
  currentProgress: number;
  weeklyGrowth: number;
  estimatedCompletion: string;
  priority: 'high' | 'medium' | 'low';
  relatedPages: string[];
}

interface CategoryStats {
  category: BadgeCategory;
  totalBadges: number;
  unlockedBadges: number;
  averageProgress: number;
  totalPoints: number;
  estimatedHours: number;
  icon: string;
  color: string;
}

const ComprehensiveBadgeManagementDashboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'progress' | 'priority' | 'points' | 'hours'>('progress');
  const [currentWeekPlan, setCurrentWeekPlan] = useState<WeeklyWorkPlan | null>(null);
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalBadges: 0,
    unlockedBadges: 0,
    totalPoints: 0,
    averageProgress: 0,
    weeklyActiveTime: 0,
    completionRate: 0,
  });

  useEffect(() => {
    initializeDashboard();
    setupEventListeners();

    return () => {
      comprehensivePageSyncSystem.destroy();
    };
  }, []);

  const initializeDashboard = () => {
    // 週次計画取得
    const weekPlan = weeklyWorkPlanningService.getCurrentWeekPlan();
    setCurrentWeekPlan(weekPlan);

    // バッジ進捗計算
    const progressData = calculateBadgeProgress();
    setBadgeProgress(progressData);

    // カテゴリ統計計算
    const categoryData = calculateCategoryStats();
    setCategoryStats(categoryData);

    // 全体統計計算
    const overallStats = calculateTotalStats();
    setTotalStats(overallStats);
  };

  const setupEventListeners = () => {
    comprehensivePageSyncSystem.on('badge-progress-updated', (data: any) => {
      updateBadgeProgress(data.badgeId, data.progress);
    });

    weeklyWorkPlanningService.on('progress-updated', (progress: any) => {
      updateCybersecurityProgress(progress);
    });
  };

  const calculateBadgeProgress = (): BadgeProgress[] => {
    return ALL_COMPREHENSIVE_BADGES.map((badge) => ({
      badgeId: badge.id,
      currentProgress: badge.progress,
      weeklyGrowth: Math.random() * 10, // シミュレーション
      estimatedCompletion: calculateEstimatedCompletion(badge),
      priority: calculatePriority(badge),
      relatedPages: badge.relatedPages,
    }));
  };

  const calculateCategoryStats = (): CategoryStats[] => {
    const categories: BadgeCategory[] = [
      'cybersecurity',
      'ci-cd',
      'deployment',
      'hosting',
      'scaling',
      'virtualization',
      'infrastructure',
      'product-management',
      'requirements',
      'agile',
      'skill-mapping',
      'devops',
      'marketing',
      'ecommerce',
      'video-production',
      'gaming',
      'ai-ml',
      'education',
      'social-contribution',
      'information-sharing',
      'certification',
      'finance',
      'entrepreneurship',
      'secretary',
      'management',
    ];

    return categories.map((category) => {
      const categoryBadges = ALL_COMPREHENSIVE_BADGES.filter(
        (badge) => badge.category === category
      );
      const unlockedCount = categoryBadges.filter((badge) => badge.isUnlocked).length;
      const avgProgress =
        categoryBadges.reduce((sum, badge) => sum + badge.progress, 0) / categoryBadges.length || 0;
      const totalPoints = categoryBadges.reduce((sum, badge) => sum + badge.points, 0);
      const totalHours = categoryBadges.reduce((sum, badge) => sum + badge.estimatedHours, 0);

      return {
        category,
        totalBadges: categoryBadges.length,
        unlockedBadges: unlockedCount,
        averageProgress: avgProgress,
        totalPoints,
        estimatedHours: totalHours,
        icon: getCategoryIcon(category),
        color: getCategoryColor(category),
      };
    });
  };

  const calculateTotalStats = () => {
    const total = ALL_COMPREHENSIVE_BADGES.length;
    const unlocked = ALL_COMPREHENSIVE_BADGES.filter((badge) => badge.isUnlocked).length;
    const totalPoints = ALL_COMPREHENSIVE_BADGES.reduce((sum, badge) => sum + badge.points, 0);
    const avgProgress =
      ALL_COMPREHENSIVE_BADGES.reduce((sum, badge) => sum + badge.progress, 0) / total;

    return {
      totalBadges: total,
      unlockedBadges: unlocked,
      totalPoints,
      averageProgress: avgProgress,
      weeklyActiveTime: 35, // シミュレーション
      completionRate: (unlocked / total) * 100,
    };
  };

  const updateBadgeProgress = (badgeId: string, progress: number) => {
    setBadgeProgress((prev) =>
      prev.map((badge) =>
        badge.badgeId === badgeId ? { ...badge, currentProgress: progress } : badge
      )
    );
  };

  const updateCybersecurityProgress = (weeklyProgress: any) => {
    // サイバーセキュリティバッジの進捗を更新
    const cyberProgress = badgeProgress.find((b) => b.badgeId === 'cybersecurity-specialist');
    if (cyberProgress) {
      cyberProgress.currentProgress = weeklyProgress.progressPercentage;
    }
  };

  const calculateEstimatedCompletion = (badge: ComprehensiveBadge): string => {
    const remainingProgress = 100 - badge.progress;
    const estimatedWeeks = Math.ceil((remainingProgress * badge.estimatedHours) / (10 * 7)); // 週10時間想定
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + estimatedWeeks * 7);
    return completionDate.toISOString().split('T')[0];
  };

  const calculatePriority = (badge: ComprehensiveBadge): 'high' | 'medium' | 'low' => {
    if (badge.difficulty === 'legendary' || badge.category === 'cybersecurity') return 'high';
    if (badge.difficulty === 'platinum' || badge.points > 400) return 'medium';
    return 'low';
  };

  const getCategoryIcon = (category: BadgeCategory): string => {
    const iconMap: Record<BadgeCategory, string> = {
      cybersecurity: '🔐',
      'ci-cd': '🔄',
      deployment: '🚀',
      hosting: '🏗️',
      scaling: '📈',
      virtualization: '💻',
      infrastructure: '🏭',
      development: '💻',
      devops: '⚙️',
      testing: '🧪',
      monitoring: '📊',
      maintenance: '🔧',
      performance: '⚡',
      quality: '✅',
      'design-system': '🎨',
      architecture: '🏛️',
      'product-management': '📋',
      'project-management': '📊',
      requirements: '📝',
      agile: '🏃',
      scrum: '🔄',
      'skill-mapping': '🗺️',
      specification: '📋',
      planning: '📅',
      estimation: '📊',
      budgeting: '💰',
      design: '🎨',
      'ux-ui': '✨',
      'visual-design': '🎭',
      'interaction-design': '🤝',
      'user-research': '🔍',
      prototyping: '⚡',
      accessibility: '♿',
      branding: '🏷️',
      marketing: '📈',
      promotion: '📢',
      monetization: '💰',
      ecommerce: '🛒',
      'social-media': '📱',
      'content-creation': '✍️',
      'video-production': '🎬',
      gaming: '🎮',
      'ai-ml': '🤖',
      entrepreneurship: '🚀',
      investment: '💎',
      fundraising: '💰',
      'business-planning': '📊',
      strategy: '♟️',
      innovation: '💡',
      'growth-hacking': '📈',
      legal: '⚖️',
      hr: '👥',
      'labor-relations': '🤝',
      sales: '💼',
      taxation: '📋',
      finance: '💰',
      accounting: '📊',
      secretary: '📋',
      management: '👔',
      leadership: '👑',
      'social-contribution': '🌍',
      education: '📚',
      learning: '📖',
      certification: '🏆',
      'information-sharing': '📢',
      'community-building': '🏘️',
      mentoring: '🧑‍🏫',
      politics: '🏛️',
      economics: '📊',
      philosophy: '🤔',
      religion: '🕊️',
      history: '📜',
      culture: '🎭',
      arts: '🎨',
      language: '🗣️',
      literature: '📚',
      publishing: '📖',
      editing: '✏️',
      research: '🔬',
      analysis: '📊',
    };
    return iconMap[category] || '🏆';
  };

  const getCategoryColor = (category: BadgeCategory): string => {
    const colorMap: Record<string, string> = {
      cybersecurity: 'from-blue-500 to-purple-600',
      'ci-cd': 'from-green-500 to-blue-500',
      'product-management': 'from-purple-500 to-pink-500',
      marketing: 'from-orange-500 to-red-500',
      education: 'from-yellow-500 to-orange-500',
      finance: 'from-green-600 to-teal-600',
    };
    return colorMap[category] || 'from-gray-500 to-gray-600';
  };

  const filteredBadges = ALL_COMPREHENSIVE_BADGES.filter((badge) => {
    const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory;
    const matchesSearch =
      badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedBadges = filteredBadges.sort((a, b) => {
    switch (sortBy) {
      case 'progress':
        return b.progress - a.progress;
      case 'points':
        return b.points - a.points;
      case 'hours':
        return a.estimatedHours - b.estimatedHours;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Trophy className="h-12 w-12 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">🏆 包括的バッジ管理システム</h1>
          </div>
          <p className="text-cyan-200 text-lg">
            全{ALL_COMPREHENSIVE_BADGES.length}バッジ • サイバーセキュリティ週次計画統合
          </p>
        </div>

        {/* 全体統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">総バッジ数</p>
                  <p className="text-white text-3xl font-bold">{totalStats.totalBadges}</p>
                </div>
                <Trophy className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-600 to-teal-600 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">アンロック済み</p>
                  <p className="text-white text-3xl font-bold">{totalStats.unlockedBadges}</p>
                </div>
                <Award className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-600 to-orange-600 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">総ポイント</p>
                  <p className="text-white text-3xl font-bold">
                    {totalStats.totalPoints.toLocaleString()}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">平均進捗</p>
                  <p className="text-white text-3xl font-bold">
                    {totalStats.averageProgress.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* サイバーセキュリティ進捗カード */}
        {currentWeekPlan && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Shield className="h-6 w-6 text-cyan-400" />
                <span>🔐 サイバーセキュリティ週次計画</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-slate-300">現在の週</div>
                  <div className="text-2xl font-bold text-cyan-400">
                    Week {currentWeekPlan.weekNumber}
                  </div>
                  <div className="text-sm text-slate-400">{currentWeekPlan.focusArea}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-slate-300">目標時間</div>
                  <div className="text-2xl font-bold text-green-400">
                    {currentWeekPlan.targetHours}時間
                  </div>
                  <div className="text-sm text-slate-400">
                    日次: {currentWeekPlan.dailyHours}時間
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-slate-300">期待完了数</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {currentWeekPlan.expectedCompletions}バッジ
                  </div>
                  <div className="text-sm text-slate-400">2025年7月25日予定</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* メインコンテンツ */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800">
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="categories">カテゴリ別</TabsTrigger>
            <TabsTrigger value="progress">進捗管理</TabsTrigger>
            <TabsTrigger value="planning">計画</TabsTrigger>
            <TabsTrigger value="analytics">分析</TabsTrigger>
          </TabsList>

          {/* 概要タブ */}
          <TabsContent value="overview" className="space-y-6">
            {/* 検索・フィルター */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="バッジを検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as BadgeCategory | 'all')}
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    aria-label="カテゴリを選択"
                  >
                    <option value="all">全カテゴリ</option>
                    <option value="cybersecurity">🔐 サイバーセキュリティ</option>
                    <option value="ci-cd">🔄 CI/CD</option>
                    <option value="product-management">📋 プロダクト管理</option>
                    <option value="marketing">📈 マーケティング</option>
                    <option value="education">📚 教育</option>
                    <option value="finance">💰 金融</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    aria-label="ソート方法を選択"
                  >
                    <option value="progress">進捗順</option>
                    <option value="points">ポイント順</option>
                    <option value="hours">時間順</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* バッジリスト */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedBadges.slice(0, 12).map((badge) => (
                <Card
                  key={badge.id}
                  className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center space-x-2">
                      <span className="text-2xl">{badge.icon}</span>
                      <span className="text-sm">{badge.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-300">{badge.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">進捗</span>
                        <span className="text-cyan-200">{badge.progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={badge.progress} className="h-2 bg-slate-700" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">ポイント</span>
                        <div className="text-yellow-400 font-semibold">{badge.points}pts</div>
                      </div>
                      <div>
                        <span className="text-slate-400">推定時間</span>
                        <div className="text-green-400 font-semibold">{badge.estimatedHours}h</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant={badge.isUnlocked ? 'default' : 'secondary'}>
                        {badge.isUnlocked ? 'アンロック済み' : 'ロック中'}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-${badge.difficulty === 'legendary' ? 'purple' : badge.difficulty === 'platinum' ? 'blue' : 'green'}-400`}
                      >
                        {badge.difficulty}
                      </Badge>
                    </div>

                    {badge.nextMilestone && (
                      <div className="mt-3 p-2 bg-slate-700 rounded text-xs text-slate-300">
                        <strong>次のマイルストーン:</strong> {badge.nextMilestone}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* カテゴリ別タブ */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryStats.map((category) => (
                <Card key={category.category} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="text-sm capitalize">{category.category}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">総数</span>
                        <div className="text-white font-semibold">{category.totalBadges}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">アンロック</span>
                        <div className="text-green-400 font-semibold">
                          {category.unlockedBadges}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">平均進捗</span>
                        <div className="text-cyan-400 font-semibold">
                          {category.averageProgress.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">総ポイント</span>
                        <div className="text-yellow-400 font-semibold">{category.totalPoints}</div>
                      </div>
                    </div>

                    <Progress value={category.averageProgress} className="h-2 bg-slate-700" />

                    <Button
                      onClick={() => setSelectedCategory(category.category)}
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
                      size="sm"
                    >
                      詳細を見る
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* その他のタブは省略（進捗管理、計画、分析） */}
          <TabsContent value="progress" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">バッジ進捗管理</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {badgeProgress.slice(0, 10).map((progress) => (
                    <div
                      key={progress.badgeId}
                      className="flex items-center justify-between p-3 bg-slate-700 rounded"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-white">{progress.badgeId}</div>
                        <div className="text-sm text-slate-400">
                          週次成長: +{progress.weeklyGrowth.toFixed(1)}%
                        </div>
                      </div>
                      <div className="w-32">
                        <Progress value={progress.currentProgress} className="h-2 bg-slate-600" />
                      </div>
                      <div className="text-sm text-cyan-400 ml-3">
                        {progress.currentProgress.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ComprehensiveBadgeManagementDashboard;
