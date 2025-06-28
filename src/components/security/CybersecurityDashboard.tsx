/**
 * 🔐 サイバーセキュリティ学習ダッシュボード
 * 4週間77時間の集中学習プログラム管理
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Shield,
  Lock,
  Activity,
} from 'lucide-react';
import {
  weeklyWorkPlanningService,
  WeeklyWorkPlan,
  WorkPlanProgress,
} from '@/services/planning/WeeklyWorkPlanningService';
import {
  CYBERSECURITY_SPECIALIST_BADGE,
  SECURITY_BADGES_COLLECTION,
} from '@/types/cybersecurity-badges';

interface CybersecurityDashboardProps {
  className?: string;
}

const CybersecurityDashboard: React.FC<CybersecurityDashboardProps> = ({ className }) => {
  const [currentWeekPlan, setCurrentWeekPlan] = useState<WeeklyWorkPlan | null>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<WorkPlanProgress[]>([]);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [todayHours, setTodayHours] = useState<number>(0);
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);

  useEffect(() => {
    initializeDashboard();
    setupEventListeners();

    return () => {
      weeklyWorkPlanningService.destroy();
    };
  }, []);

  const initializeDashboard = () => {
    const currentPlan = weeklyWorkPlanningService.getCurrentWeekPlan();
    setCurrentWeekPlan(currentPlan);

    // 4週間分の進捗を取得
    const allProgress = [];
    for (let week = 1; week <= 4; week++) {
      const progress = weeklyWorkPlanningService.getWeeklyProgress(week);
      if (progress) {
        allProgress.push(progress);
      }
    }
    setWeeklyProgress(allProgress);

    // 全体進捗計算
    const totalHours = 77; // Week1: 20h + Week2: 20h + Week3: 20h + Week4: 17h
    const completedHours = allProgress.reduce((sum, p) => sum + p.hoursCompleted, 0);
    setOverallProgress((completedHours / totalHours) * 100);
  };

  const setupEventListeners = () => {
    weeklyWorkPlanningService.on('progress-updated', (progress: WorkPlanProgress) => {
      setWeeklyProgress((prev) =>
        prev.map((p) => (p.weekNumber === progress.weekNumber ? progress : p))
      );
    });

    weeklyWorkPlanningService.on(
      'milestone-completed',
      ({ milestoneId }: { milestoneId: string }) => {
        setCompletedMilestones((prev) => [...prev, milestoneId]);
      }
    );

    weeklyWorkPlanningService.on('week-completed', ({ weekNumber }: { weekNumber: number }) => {
      setActiveWeek(Math.min(4, weekNumber + 1));
    });
  };

  const recordStudySession = (hours: number) => {
    setTodayHours((prev) => prev + hours);
    weeklyWorkPlanningService.recordLearningProgress(
      activeWeek,
      hours,
      [`Week ${activeWeek} スキル習得`],
      []
    );
  };

  const completeMilestone = (weekNumber: number, milestoneId: string) => {
    weeklyWorkPlanningService.completeMilestone(weekNumber, milestoneId);
  };

  const getWeeklyProgressData = (weekNumber: number) => {
    return weeklyProgress.find((p) => p.weekNumber === weekNumber);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const getWeekPlan = (weekNumber: number) => {
    const plans = weeklyWorkPlanningService.getFullSchedule();
    return plans.find((p) => p.weekNumber === weekNumber);
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 ${className}`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="h-12 w-12 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">🔐 サイバーセキュリティスペシャリスト</h1>
          </div>
          <p className="text-cyan-200 text-lg">
            4週間77時間の集中学習プログラム • {getCurrentDate()}
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-slate-300">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>今日の学習: {todayHours.toFixed(1)}時間</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>現在: Week {activeWeek}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>全体進捗: {overallProgress.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* 全体進捗カード */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              <span>学習進捗概要</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-300">
                <span>全体完了率</span>
                <span>{overallProgress.toFixed(1)}% / 100%</span>
              </div>
              <Progress value={overallProgress} className="h-2 bg-slate-700" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((week) => {
                const progress = getWeeklyProgressData(week);
                const weekPlan = getWeekPlan(week);
                return (
                  <div key={week} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">Week {week}</span>
                      <Badge variant={week === activeWeek ? 'default' : 'secondary'}>
                        {progress?.progressPercentage.toFixed(0) || 0}%
                      </Badge>
                    </div>
                    <Progress
                      value={progress?.progressPercentage || 0}
                      className="h-1 bg-slate-700"
                    />
                    <div className="text-xs text-slate-400">
                      {progress?.hoursCompleted.toFixed(1) || 0}h / {weekPlan?.targetHours || 0}h
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* メインコンテンツ - タブ */}
        <Tabs defaultValue="current-week" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800">
            <TabsTrigger value="current-week">今週の計画</TabsTrigger>
            <TabsTrigger value="milestones">マイルストーン</TabsTrigger>
            <TabsTrigger value="schedule">全体スケジュール</TabsTrigger>
            <TabsTrigger value="badges">バッジ進捗</TabsTrigger>
            <TabsTrigger value="analytics">分析</TabsTrigger>
          </TabsList>

          {/* 今週の計画 */}
          <TabsContent value="current-week" className="space-y-6">
            {currentWeekPlan && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 今週の学習内容 */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-cyan-400" />
                      <span>
                        Week {currentWeekPlan.weekNumber}:{' '}
                        {currentWeekPlan.focusArea.split(' - ')[1]}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-cyan-200 mb-2">学習モジュール</h4>
                        <div className="space-y-1">
                          {currentWeekPlan.learningModules.map((module, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 text-sm text-slate-300"
                            >
                              <CheckCircle className="h-3 w-3 text-green-400" />
                              <span>{module}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-cyan-200 mb-2">実践演習</h4>
                        <div className="space-y-1">
                          {currentWeekPlan.practicalExercises.map((exercise, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 text-sm text-slate-300"
                            >
                              <Lock className="h-3 w-3 text-yellow-400" />
                              <span>{exercise}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 学習セッション記録 */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-cyan-400" />
                      <span>学習セッション</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          onClick={() => recordStudySession(0.5)}
                          className="bg-cyan-600 hover:bg-cyan-700"
                          size="sm"
                        >
                          30分
                        </Button>
                        <Button
                          onClick={() => recordStudySession(1)}
                          className="bg-cyan-600 hover:bg-cyan-700"
                          size="sm"
                        >
                          1時間
                        </Button>
                        <Button
                          onClick={() => recordStudySession(2)}
                          className="bg-cyan-600 hover:bg-cyan-700"
                          size="sm"
                        >
                          2時間
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm text-slate-300">
                          今日の目標: {currentWeekPlan.dailyHours}時間
                        </div>
                        <Progress
                          value={(todayHours / currentWeekPlan.dailyHours) * 100}
                          className="h-2 bg-slate-700"
                        />
                        <div className="text-xs text-slate-400">
                          {todayHours.toFixed(1)}h / {currentWeekPlan.dailyHours}h
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-cyan-200">リスク要因</h4>
                      {currentWeekPlan.riskFactors.map((risk, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm text-orange-300"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          <span>{risk}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* マイルストーン */}
          <TabsContent value="milestones" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((week) => {
                const weekPlan = getWeekPlan(week);
                if (!weekPlan) return null;

                return (
                  <Card key={week} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Week {week} マイルストーン</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {weekPlan.milestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          className={`p-3 rounded border ${
                            milestone.status === 'completed'
                              ? 'bg-green-900 border-green-600'
                              : 'bg-slate-700 border-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white text-sm">{milestone.title}</h4>
                            <Badge
                              variant={milestone.status === 'completed' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {milestone.status === 'completed' ? '完了' : '未完了'}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-300 mb-2">{milestone.description}</p>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>{milestone.estimatedHours}時間</span>
                            <span>{milestone.targetDate.toLocaleDateString('ja-JP')}</span>
                          </div>
                          {milestone.status !== 'completed' && (
                            <Button
                              onClick={() => completeMilestone(week, milestone.id)}
                              size="sm"
                              className="mt-2 w-full bg-cyan-600 hover:bg-cyan-700"
                            >
                              完了にする
                            </Button>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* 全体スケジュール */}
          <TabsContent value="schedule" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">4週間学習スケジュール</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyWorkPlanningService.getFullSchedule().map((week) => (
                    <div
                      key={week.weekNumber}
                      className={`p-4 rounded border ${
                        week.weekNumber === activeWeek
                          ? 'bg-cyan-900 border-cyan-600'
                          : 'bg-slate-700 border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-white">
                          Week {week.weekNumber}: {week.focusArea.split(' - ')[1]}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-cyan-200">
                            {week.targetHours}時間
                          </Badge>
                          <Badge variant={week.weekNumber === activeWeek ? 'default' : 'secondary'}>
                            {week.weekNumber === activeWeek ? '進行中' : '予定'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-slate-300">
                        {week.startDate.toLocaleDateString('ja-JP')} -{' '}
                        {week.endDate.toLocaleDateString('ja-JP')}
                      </div>
                      <div className="text-sm text-slate-400 mt-2">
                        期待される完了バッジ数: {week.expectedCompletions}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* バッジ進捗 */}
          <TabsContent value="badges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SECURITY_BADGES_COLLECTION.map((badge) => (
                <Card key={badge.id} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center space-x-2">
                      <span className="text-2xl">{badge.icon}</span>
                      <span className="text-sm">{badge.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-slate-300">{badge.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">進捗</span>
                        <span className="text-cyan-200">{badge.progress}%</span>
                      </div>
                      <Progress value={badge.progress} className="h-2 bg-slate-700" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={badge.isUnlocked ? 'default' : 'secondary'}>
                        {badge.isUnlocked ? 'アンロック済み' : 'ロック中'}
                      </Badge>
                      <span className="text-sm text-cyan-200">{badge.points}pts</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 分析 */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">学習統計</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">
                        {weeklyProgress.reduce((sum, p) => sum + p.hoursCompleted, 0).toFixed(1)}
                      </div>
                      <div className="text-sm text-slate-400">総学習時間</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {completedMilestones.length}
                      </div>
                      <div className="text-sm text-slate-400">完了マイルストーン</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">予測</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">バッジ完了予想</span>
                      <span className="text-cyan-200">2025年7月25日</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">信頼度</span>
                      <span className="text-green-400">85%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CybersecurityDashboard;
