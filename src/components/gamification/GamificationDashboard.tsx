import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Trophy,
  Star,
  Target,
  Zap,
  Crown,
  Gift,
  TrendingUp,
  Users,
  Award,
  Flame,
  Coins,
  Calendar,
  Medal,
  ChevronUp,
  ChevronDown,
  Minus,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// サービスのインポート（実際の実装時）
// import { pointRewardService } from '@/services/gamification/PointRewardService';
// import { leaderboardService } from '@/services/gamification/LeaderboardService';

interface GamificationStats {
  userPoints: {
    total: number;
    available: number;
    level: number;
    rank: string;
    streak: number;
    nextLevelPoints: number;
    currentLevelProgress: number;
  };
  leaderboardPositions: {
    global: number;
    weekly: number;
    friends: number;
  };
  recentTransactions: Transaction[];
  availableRewards: Reward[];
  dailyChallenges: Challenge[];
  achievements: Achievement[];
  multipliers: Multiplier[];
}

interface Transaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  timestamp: string;
  multiplier?: number;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: string;
  image: string;
  canAfford: boolean;
  popular: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  expiresIn: string;
  completed: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Multiplier {
  id: string;
  name: string;
  factor: number;
  expiresAt: string;
  remainingTime: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  displayName: string;
  avatar: string;
  score: number;
  tier: string;
  change: 'up' | 'down' | 'same' | 'new';
}

const GamificationDashboard: React.FC = () => {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [leaderboards, setLeaderboards] = useState<{
    global: LeaderboardEntry[];
    weekly: LeaderboardEntry[];
    friends: LeaderboardEntry[];
  }>({
    global: [],
    weekly: [],
    friends: [],
  });
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGamificationData();
    const interval = setInterval(loadGamificationData, 30000); // 30秒ごと更新
    return () => clearInterval(interval);
  }, []);

  /**
   * 🎮 ゲーミフィケーションデータ読み込み
   */
  const loadGamificationData = async () => {
    try {
      // 実際の実装ではサービスからデータを取得
      const mockStats: GamificationStats = {
        userPoints: {
          total: 4567,
          available: 3890,
          level: 12,
          rank: 'Advanced',
          streak: 18,
          nextLevelPoints: 5000,
          currentLevelProgress: 91.34, // 4567/5000 * 100
        },
        leaderboardPositions: {
          global: 156,
          weekly: 23,
          friends: 3,
        },
        recentTransactions: [
          {
            id: '1',
            type: 'earn',
            amount: 25,
            description: '緊急タスク完了',
            timestamp: '2 分前',
            multiplier: 1.5,
          },
          {
            id: '2',
            type: 'earn',
            amount: 15,
            description: 'ポモドーロ完了',
            timestamp: '15 分前',
          },
          {
            id: '3',
            type: 'spend',
            amount: -100,
            description: 'ダークテーマ購入',
            timestamp: '1 時間前',
          },
        ],
        availableRewards: [
          {
            id: 'dark_theme',
            name: 'ダークテーマ',
            description: '目に優しいダークテーマ',
            cost: 100,
            category: 'テーマ',
            image: '/themes/dark.png',
            canAfford: true,
            popular: true,
          },
          {
            id: 'analytics_pro',
            name: '高度アナリティクス',
            description: '詳細分析レポート',
            cost: 250,
            category: '機能',
            image: '/features/analytics.png',
            canAfford: true,
            popular: false,
          },
          {
            id: 'productivity_boost',
            name: '生産性ブースト',
            description: '24時間ポイント2倍',
            cost: 200,
            category: 'ブースト',
            image: '/boosts/productivity.png',
            canAfford: true,
            popular: true,
          },
        ],
        dailyChallenges: [
          {
            id: '1',
            title: 'タスクマスター',
            description: '今日中に5つのタスクを完了',
            progress: 3,
            target: 5,
            reward: 100,
            difficulty: 'easy',
            expiresIn: '8時間32分',
            completed: false,
          },
          {
            id: '2',
            title: 'ポモドーロチャンピオン',
            description: 'ポモドーロを4回完了',
            progress: 2,
            target: 4,
            reward: 150,
            difficulty: 'medium',
            expiresIn: '8時間32分',
            completed: false,
          },
          {
            id: '3',
            title: '早起き鳥',
            description: '朝6時前にアプリを開く',
            progress: 1,
            target: 1,
            reward: 80,
            difficulty: 'medium',
            expiresIn: '完了',
            completed: true,
          },
        ],
        achievements: [
          {
            id: '1',
            name: '初心者',
            description: '最初のタスクを完了',
            icon: '🌟',
            unlockedAt: '2024-01-15',
            rarity: 'common',
          },
          {
            id: '2',
            name: 'ストリークマスター',
            description: '7日連続でタスクを完了',
            icon: '🔥',
            unlockedAt: '2024-01-22',
            rarity: 'rare',
          },
        ],
        multipliers: [
          {
            id: '1',
            name: '週末ブースト',
            factor: 1.5,
            expiresAt: '2024-01-28T23:59:59Z',
            remainingTime: '2時間15分',
          },
        ],
      };

      const mockLeaderboards = {
        global: Array.from({ length: 10 }, (_, i) => ({
          rank: i + 1,
          username: `user${i + 1}`,
          displayName: `ユーザー${i + 1}`,
          avatar: `/avatars/user${i + 1}.png`,
          score: 10000 - i * 500,
          tier: i < 3 ? 'gold' : i < 7 ? 'silver' : 'bronze',
          change: ['up', 'down', 'same'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'same',
        })),
        weekly: Array.from({ length: 10 }, (_, i) => ({
          rank: i + 1,
          username: `user${i + 1}`,
          displayName: `ユーザー${i + 1}`,
          avatar: `/avatars/user${i + 1}.png`,
          score: 2000 - i * 100,
          tier: i < 3 ? 'gold' : i < 7 ? 'silver' : 'bronze',
          change: ['up', 'down', 'same'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'same',
        })),
        friends: Array.from({ length: 5 }, (_, i) => ({
          rank: i + 1,
          username: `friend${i + 1}`,
          displayName: `フレンド${i + 1}`,
          avatar: `/avatars/friend${i + 1}.png`,
          score: 1500 - i * 150,
          tier: i < 2 ? 'gold' : 'silver',
          change: ['up', 'down', 'same'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'same',
        })),
      };

      setStats(mockStats);
      setLeaderboards(mockLeaderboards);
      setLoading(false);
    } catch (error) {
      console.error('ゲーミフィケーションデータ読み込みエラー:', error);
      setLoading(false);
    }
  };

  /**
   * 🎁 報酬購入
   */
  const purchaseReward = async (rewardId: string) => {
    try {
      // pointRewardService.spendPoints(userId, rewardId);

      toast({
        title: '報酬購入完了！',
        description: '報酬を正常に購入しました',
        variant: 'default',
      });

      await loadGamificationData();
    } catch (error) {
      toast({
        title: '購入エラー',
        description: '報酬の購入に失敗しました',
        variant: 'destructive',
      });
    }
  };

  /**
   * 🎨 難易度色取得
   */
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * 🏆 ティア色取得
   */
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'gold':
        return 'text-yellow-600';
      case 'silver':
        return 'text-gray-500';
      case 'bronze':
        return 'text-amber-600';
      default:
        return 'text-gray-400';
    }
  };

  /**
   * 📈 変動アイコン取得
   */
  const getChangeIcon = (change: string) => {
    switch (change) {
      case 'up':
        return <ChevronUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <ChevronDown className="h-3 w-3 text-red-600" />;
      case 'same':
        return <Minus className="h-3 w-3 text-gray-400" />;
      default:
        return <Star className="h-3 w-3 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center p-8">
        <p>ゲーミフィケーションデータを読み込めませんでした</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">総ポイント</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.userPoints.total.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600">
                  利用可能: {stats.userPoints.available.toLocaleString()}
                </p>
              </div>
              <Coins className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">レベル & ランク</p>
                <p className="text-2xl font-bold text-purple-900">Lv.{stats.userPoints.level}</p>
                <p className="text-xs text-purple-600">{stats.userPoints.rank}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">連続記録</p>
                <p className="text-2xl font-bold text-orange-900">{stats.userPoints.streak}日</p>
                <p className="text-xs text-orange-600">継続中</p>
              </div>
              <Flame className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">グローバル順位</p>
                <p className="text-2xl font-bold text-green-900">
                  #{stats.leaderboardPositions.global}
                </p>
                <p className="text-xs text-green-600">週間: #{stats.leaderboardPositions.weekly}</p>
              </div>
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* レベル進捗 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            レベル進捗
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>レベル {stats.userPoints.level}</span>
              <span>レベル {stats.userPoints.level + 1}</span>
            </div>
            <Progress value={stats.userPoints.currentLevelProgress} className="h-3" />
            <div className="flex justify-between text-xs text-gray-600">
              <span>
                {stats.userPoints.total.toLocaleString()} /{' '}
                {stats.userPoints.nextLevelPoints.toLocaleString()} ポイント
              </span>
              <span>{(100 - stats.userPoints.currentLevelProgress).toFixed(1)}% 残り</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* メインコンテンツ */}
      <Tabs defaultValue="challenges" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="challenges">チャレンジ</TabsTrigger>
          <TabsTrigger value="rewards">報酬</TabsTrigger>
          <TabsTrigger value="leaderboard">ランキング</TabsTrigger>
          <TabsTrigger value="achievements">実績</TabsTrigger>
          <TabsTrigger value="activity">アクティビティ</TabsTrigger>
        </TabsList>

        {/* デイリーチャレンジ */}
        <TabsContent value="challenges">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.dailyChallenges.map((challenge) => (
              <Card
                key={challenge.id}
                className={challenge.completed ? 'bg-green-50 border-green-200' : ''}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{challenge.title}</CardTitle>
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>
                        進捗: {challenge.progress} / {challenge.target}
                      </span>
                      <span className="flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        {challenge.reward}
                      </span>
                    </div>
                    <Progress
                      value={(challenge.progress / challenge.target) * 100}
                      className={challenge.completed ? 'bg-green-100' : ''}
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>期限: {challenge.expiresIn}</span>
                      {challenge.completed && (
                        <span className="text-green-600 font-medium">完了✓</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 報酬ショップ */}
        <TabsContent value="rewards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.availableRewards.map((reward) => (
              <Card key={reward.id} className="relative">
                {reward.popular && (
                  <Badge className="absolute top-2 right-2 bg-orange-500">人気</Badge>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Gift className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{reward.name}</CardTitle>
                      <CardDescription>{reward.category}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">{reward.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4" />
                        <span className="font-medium">{reward.cost}</span>
                      </div>
                      <Button
                        size="sm"
                        disabled={!reward.canAfford}
                        onClick={() => purchaseReward(reward.id)}
                      >
                        {reward.canAfford ? '購入' : 'ポイント不足'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* リーダーボード */}
        <TabsContent value="leaderboard">
          <Tabs defaultValue="global" className="space-y-4">
            <TabsList>
              <TabsTrigger value="global">グローバル</TabsTrigger>
              <TabsTrigger value="weekly">週間</TabsTrigger>
              <TabsTrigger value="friends">フレンド</TabsTrigger>
            </TabsList>

            {(['global', 'weekly', 'friends'] as const).map((leaderboardType) => (
              <TabsContent key={leaderboardType} value={leaderboardType}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      {leaderboardType === 'global'
                        ? 'グローバルランキング'
                        : leaderboardType === 'weekly'
                          ? '週間ランキング'
                          : 'フレンドランキング'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {leaderboards[leaderboardType].map((entry) => (
                        <div
                          key={entry.rank}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${getTierColor(entry.tier)}`}>
                                #{entry.rank}
                              </span>
                              {getChangeIcon(entry.change)}
                            </div>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={entry.avatar} />
                              <AvatarFallback>{entry.displayName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{entry.displayName}</p>
                              <p className="text-xs text-gray-600">@{entry.username}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{entry.score.toLocaleString()}</p>
                            <p className="text-xs text-gray-600 capitalize">{entry.tier}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        {/* 実績 */}
        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.achievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{achievement.name}</h3>
                        <Badge
                          variant={achievement.rarity === 'legendary' ? 'default' : 'secondary'}
                        >
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-gray-500">獲得日: {achievement.unlockedAt}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* アクティビティ */}
        <TabsContent value="activity">
          <div className="space-y-4">
            {/* アクティブマルチプライヤー */}
            {stats.multipliers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    アクティブブースト
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.multipliers.map((multiplier) => (
                      <div
                        key={multiplier.id}
                        className="flex items-center justify-between p-2 rounded border"
                      >
                        <div>
                          <p className="font-medium">{multiplier.name}</p>
                          <p className="text-sm text-gray-600">{multiplier.factor}x ポイント</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{multiplier.remainingTime}</p>
                          <p className="text-xs text-gray-600">残り時間</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 最近のアクティビティ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  最近のアクティビティ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-2 rounded border"
                    >
                      <div className="flex items-center gap-2">
                        {transaction.type === 'earn' ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-xs text-gray-600">{transaction.timestamp}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {transaction.type === 'earn' ? '+' : ''}
                          {transaction.amount}
                          {transaction.multiplier && ` (${transaction.multiplier}x)`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamificationDashboard;
