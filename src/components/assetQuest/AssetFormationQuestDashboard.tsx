import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, Crown, Zap, Coins, Award, Calendar, BarChart3 } from 'lucide-react';
import { HeroCharacter } from './HeroCharacter';
import { MonthlyBudgetManager } from './MonthlyBudgetManager';
import { AssetGrowthChart } from './AssetGrowthChart';
import { ExperienceSystem } from './ExperienceSystem';
import { DragonQuestChatbot } from './DragonQuestChatbot';
import { assetQuestService } from '@/services/assetQuest/AssetQuestService';
import { IntegratedAssetManager } from './IntegratedAssetManager';
import { soundManager } from '@/utils/soundManager';

interface AssetQuestData {
  hero: {
    level: number;
    experience: number;
    experienceToNext: number;
    title: string;
    avatar: string;
    totalAssets: number;
  };
  currentMonth: {
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
    target: number;
    daysRemaining: number;
  };
  questProgress: {
    monthlyQuestCompleted: boolean;
    streakDays: number;
    totalQuestsCompleted: number;
    currentReward: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress: number;
  }>;
}

export const AssetFormationQuestDashboard: React.FC = () => {
  const [questData, setQuestData] = useState<AssetQuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<
    'dashboard' | 'budget' | 'progress' | 'achievements' | 'integration'
  >('dashboard');

  useEffect(() => {
    loadQuestData();

    // クエストページBGM開始
    soundManager.startQuestPageBgm();

    // ページを離れる時にBGMを停止
    return () => {
      soundManager.stopQuestPageBgm();
    };
  }, []);

  const loadQuestData = async () => {
    try {
      setLoading(true);
      const data = await assetQuestService.getQuestData();
      setQuestData(data);
    } catch (error) {
      console.error('Failed to load quest data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseUpdate = async (expenses: number) => {
    if (!questData) {
      return;
    }

    const newSavings = questData.currentMonth.income - expenses;
    const newData = {
      ...questData,
      currentMonth: {
        ...questData.currentMonth,
        expenses,
        savings: newSavings,
        savingsRate: (newSavings / questData.currentMonth.income) * 100,
      },
    };

    setQuestData(newData);
    await assetQuestService.updateMonthlyProgress(expenses);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Zap className="w-12 h-12 animate-spin mx-auto mb-4 text-yellow-500" />
          <p className="text-lg font-medium">資産形成クエストを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!questData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">データの読み込みに失敗しました</p>
        <Button onClick={loadQuestData} className="mt-4">
          再試行
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🏰 資産形成クエスト
          </h1>
          <p className="text-lg text-gray-600">
            毎月の収支管理で経験値を獲得し、資産形成の勇者になろう！
          </p>
        </div>

        {/* ナビゲーションタブ */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-2 shadow-lg">
            <div className="flex space-x-2">
              {[
                { id: 'dashboard', label: 'ダッシュボード', icon: BarChart3 },
                { id: 'budget', label: '予算管理', icon: Coins },
                { id: 'progress', label: '成長記録', icon: TrendingUp },
                { id: 'achievements', label: '実績', icon: Award },
                { id: 'integration', label: '統合管理', icon: Target },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={selectedTab === tab.id ? 'default' : 'ghost'}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className="flex items-center gap-2 rounded-full px-6 py-3"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        {selectedTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 勇者ステータス */}
            <div className="lg:col-span-1">
              <HeroCharacter hero={questData.hero} />
            </div>

            {/* 今月のクエスト進捗 */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-6 h-6 text-green-600" />
                    今月のクエスト進捗
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 収支サマリー */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        ¥{questData.currentMonth.income.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">今月の収入</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        ¥{questData.currentMonth.expenses.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">今月の支出</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ¥{questData.currentMonth.savings.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">今月の貯蓄</div>
                    </div>
                  </div>

                  {/* 貯蓄率プログレス */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">貯蓄率</span>
                      <span className="text-lg font-bold text-green-600">
                        {questData.currentMonth.savingsRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={questData.currentMonth.savingsRate} className="h-3" />
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>
                        目標:{' '}
                        {(
                          (questData.currentMonth.target / questData.currentMonth.income) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                      <span>残り {questData.currentMonth.daysRemaining} 日</span>
                    </div>
                  </div>

                  {/* クエスト報酬 */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium mb-1">🎁 今月のクエスト報酬</h4>
                        <p className="text-sm text-gray-600">
                          目標達成で {questData.questProgress.currentReward} EXP 獲得
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            questData.questProgress.monthlyQuestCompleted ? 'default' : 'secondary'
                          }
                          className="mb-2"
                        >
                          {questData.questProgress.monthlyQuestCompleted ? '完了' : '進行中'}
                        </Badge>
                        <div className="text-sm text-gray-600">
                          連続達成: {questData.questProgress.streakDays} 日
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 資産成長チャート */}
            <div className="lg:col-span-3">
              <AssetGrowthChart totalAssets={questData.hero.totalAssets} />
            </div>
          </div>
        )}

        {selectedTab === 'budget' && (
          <MonthlyBudgetManager
            currentMonth={questData.currentMonth}
            onExpenseUpdate={handleExpenseUpdate}
          />
        )}

        {selectedTab === 'progress' && (
          <ExperienceSystem hero={questData.hero} questProgress={questData.questProgress} />
        )}

        {selectedTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questData.achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={achievement.unlocked ? 'border-yellow-300' : 'opacity-60'}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{achievement.icon}</div>
                  <h3 className="font-bold mb-2">{achievement.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
                  {!achievement.unlocked && (
                    <div>
                      <Progress value={achievement.progress} className="h-2 mb-2" />
                      <div className="text-xs text-gray-500">
                        {achievement.progress.toFixed(1)}% 完了
                      </div>
                    </div>
                  )}
                  {achievement.unlocked && (
                    <Badge variant="default" className="bg-yellow-500">
                      <Crown className="w-3 h-3 mr-1" />
                      獲得済み
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedTab === 'integration' && <IntegratedAssetManager />}

        {/* ドラゴンクエスト風AIチャットボット */}
        <DragonQuestChatbot
          currentLevel={questData.hero.level}
          totalAssets={questData.hero.totalAssets}
          savingsRate={questData.currentMonth.savingsRate}
          questCompleted={questData.questProgress.monthlyQuestCompleted}
          streakDays={questData.questProgress.streakDays}
        />
      </div>
    </div>
  );
};
