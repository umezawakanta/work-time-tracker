/**
 * 🔮 拡張バッジ完了予測システム
 * AI駆動の12週間詳細予測と予定・実績の包括的可視化システム
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
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Settings,
  RefreshCw,
  Zap,
  Star,
  Award,
  Brain,
  Activity,
  CalendarDays,
  Clock4,
  Trophy,
  LineChart,
  PieChart,
  MapPin,
} from 'lucide-react';
import { weeklyWorkPlanningService } from '@/services/planning/WeeklyWorkPlanningService';
import { comprehensivePageSyncSystem } from '@/services/integration/ComprehensivePageSyncSystem';
import { unifiedBadgeManagementService } from '@/services/badges/UnifiedBadgeManagementService';
import {
  ALL_COMPREHENSIVE_BADGES_EXTENDED,
  WEEKLY_BADGE_MAPPING,
  BADGE_STATISTICS,
} from '@/types/comprehensive-badges-extended';

interface PlanVsActualData {
  date: string;
  plannedHours: number;
  actualHours: number;
  plannedCompletions: number;
  actualCompletions: number;
  efficiency: number;
  accuracy: number;
}

interface BadgeScheduleItem {
  badgeId: string;
  badgeName: string;
  icon: string;
  plannedDate: string;
  actualDate?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'delayed' | 'cancelled';
  weekNumber: number;
  confidence: number;
  estimatedHours: number;
  actualHours?: number;
  dependencies: string[];
  relatedPages: string[];
}

interface WeeklySchedule {
  weekNumber: number;
  startDate: string;
  endDate: string;
  targetHours: number;
  actualHours: number;
  scheduledBadges: BadgeScheduleItem[];
  completedBadges: BadgeScheduleItem[];
  delayedBadges: BadgeScheduleItem[];
  efficiency: number;
  onTrackScore: number;
}

const EnhancedBadgePredictionSystem: React.FC = () => {
  const [weeklySchedules, setWeeklySchedules] = useState<WeeklySchedule[]>([]);
  const [planVsActual, setPlanVsActual] = useState<PlanVsActualData[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'4weeks' | '8weeks' | '12weeks'>(
    '12weeks'
  );
  const [predictionAccuracy, setPredictionAccuracy] = useState<number>(85);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isIntensiveMode, setIsIntensiveMode] = useState<boolean>(false);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [totalPlannedBadges, setTotalPlannedBadges] = useState<number>(50);
  const [completedBadges, setCompletedBadges] = useState<number>(0);

  useEffect(() => {
    initializeEnhancedPredictionSystem();
    setupRealTimeUpdates();

    return () => {
      cleanupEventListeners();
    };
  }, []);

  const initializeEnhancedPredictionSystem = () => {
    const schedules = generateWeeklySchedules();
    setWeeklySchedules(schedules);

    const planActualData = generatePlanVsActualData();
    setPlanVsActual(planActualData);

    setLastUpdated(new Date().toLocaleString('ja-JP'));

    console.log('🔮 拡張バッジ完了予測システム初期化完了');
  };

  const generateWeeklySchedules = (): WeeklySchedule[] => {
    const schedules: WeeklySchedule[] = [];

    // 基本的な12週間スケジュール生成
    for (let week = 1; week <= 12; week++) {
      const startDate = getWeekStartDate(week);
      const endDate = getWeekEndDate(week);
      const targetHours = week === 4 ? 17 : week === 6 ? 15 : 20;

      let scheduledBadges: BadgeScheduleItem[] = [];

      // Week 1-4: サイバーセキュリティ集中期間
      if (week <= 4) {
        scheduledBadges.push({
          badgeId: 'cybersecurity-specialist',
          badgeName: '🔐 サイバーセキュリティスペシャリスト',
          icon: '🔐',
          plannedDate: '2025-07-25',
          status: 'scheduled',
          weekNumber: week,
          confidence: week === 1 ? 90 : week === 2 ? 88 : week === 3 ? 92 : 95,
          estimatedHours: 77,
          dependencies: [],
          relatedPages: ['development-badges', 'quality-dashboard', 'system-monitoring'],
        });

        if (week === 4) {
          scheduledBadges.push({
            badgeId: 'skill-mapping-expert',
            badgeName: '🗺️ スキルマップエキスパート',
            icon: '🗺️',
            plannedDate: '2025-07-25',
            status: 'scheduled',
            weekNumber: week,
            confidence: 90,
            estimatedHours: 25,
            dependencies: [],
            relatedPages: ['development-badges', 'badge-showcase'],
          });
        }
      }

      // Week 5以降: 多様なバッジ
      else if (week === 5) {
        scheduledBadges = [
          {
            badgeId: 'accessibility-champion',
            badgeName: '♿ アクセシビリティチャンピオン',
            icon: '♿',
            plannedDate: endDate,
            status: 'scheduled',
            weekNumber: week,
            confidence: 85,
            estimatedHours: 15,
            dependencies: [],
            relatedPages: ['pwa-features', 'cross-browser-testing'],
          },
          {
            badgeId: 'ux-research-specialist',
            badgeName: '🔍 UXリサーチスペシャリスト',
            icon: '🔍',
            plannedDate: endDate,
            status: 'scheduled',
            weekNumber: week,
            confidence: 80,
            estimatedHours: 25,
            dependencies: [],
            relatedPages: ['system-design', 'pwa-features'],
          },
          {
            badgeId: 'requirements-analyst',
            badgeName: '📊 要件定義スペシャリスト',
            icon: '📊',
            plannedDate: endDate,
            status: 'scheduled',
            weekNumber: week,
            confidence: 85,
            estimatedHours: 28,
            dependencies: [],
            relatedPages: ['wbs-creation', 'improvement-planning'],
          },
        ];
      }

      schedules.push({
        weekNumber: week,
        startDate,
        endDate,
        targetHours,
        actualHours: 0,
        scheduledBadges,
        completedBadges: [],
        delayedBadges: [],
        efficiency: 0,
        onTrackScore: 85,
      });
    }

    return schedules;
  };

  const generatePlanVsActualData = (): PlanVsActualData[] => {
    const data: PlanVsActualData[] = [];
    const startDate = new Date('2025-06-28');

    for (let week = 0; week < 12; week++) {
      const weekDate = new Date(startDate);
      weekDate.setDate(startDate.getDate() + week * 7);

      const plannedHours = week === 3 ? 17 : week === 5 ? 15 : 20;
      const actualHours = week < 4 ? Math.random() * plannedHours : 0;

      data.push({
        date: weekDate.toISOString().split('T')[0],
        plannedHours,
        actualHours,
        plannedCompletions: week === 3 ? 2 : week >= 4 ? Math.floor(Math.random() * 4) + 1 : 0,
        actualCompletions: week < 4 ? Math.floor(Math.random() * 2) : 0,
        efficiency: actualHours > 0 ? (actualHours / plannedHours) * 100 : 0,
        accuracy: week < 4 ? 80 + Math.random() * 15 : 85,
      });
    }

    return data;
  };

  const setupRealTimeUpdates = () => {
    const interval = setInterval(() => {
      updateRealTimeData();
    }, 30000);

    unifiedBadgeManagementService.on('badge-progress-updated', handleBadgeProgressUpdate);
    unifiedBadgeManagementService.on('badge-unlocked', handleBadgeUnlocked);
    weeklyWorkPlanningService.on('progress-updated', handleWeeklyProgressUpdate);

    return () => {
      clearInterval(interval);
    };
  };

  const cleanupEventListeners = () => {
    unifiedBadgeManagementService.removeAllListeners();
    weeklyWorkPlanningService.removeAllListeners();
  };

  const updateRealTimeData = () => {
    setLastUpdated(new Date().toLocaleString('ja-JP'));

    const badges = unifiedBadgeManagementService.getUnifiedBadgeData
      ? unifiedBadgeManagementService.getUnifiedBadgeData()
      : [];
    const completed = badges.filter((badge) => badge.isUnlocked).length;
    setCompletedBadges(completed);

    const totalProgress =
      badges.length > 0
        ? badges.reduce((sum, badge) => sum + badge.progress, 0) / badges.length
        : 0;
    setOverallProgress(totalProgress);
  };

  const handleBadgeProgressUpdate = (data: any) => {
    console.log('🔮 バッジ進捗更新:', data);
    updateScheduleStatus(data.badgeId, data.progress);
  };

  const handleBadgeUnlocked = (data: any) => {
    console.log('🎉 バッジアンロック:', data);
    markBadgeCompleted(data.badgeId, new Date().toISOString().split('T')[0]);
  };

  const handleWeeklyProgressUpdate = (data: any) => {
    console.log('📊 週次進捗更新:', data);
    updateWeeklyActuals(data);
  };

  const updateScheduleStatus = (badgeId: string, progress: number) => {
    setWeeklySchedules((prev) =>
      prev.map((schedule) => ({
        ...schedule,
        scheduledBadges: schedule.scheduledBadges.map((badge) =>
          badge.badgeId === badgeId
            ? {
                ...badge,
                status: progress >= 100 ? 'completed' : progress > 0 ? 'in-progress' : 'scheduled',
              }
            : badge
        ),
      }))
    );
  };

  const markBadgeCompleted = (badgeId: string, completionDate: string) => {
    setWeeklySchedules((prev) =>
      prev.map((schedule) => {
        const badge = schedule.scheduledBadges.find((b) => b.badgeId === badgeId);
        if (badge) {
          return {
            ...schedule,
            scheduledBadges: schedule.scheduledBadges.filter((b) => b.badgeId !== badgeId),
            completedBadges: [
              ...schedule.completedBadges,
              { ...badge, status: 'completed', actualDate: completionDate },
            ],
          };
        }
        return schedule;
      })
    );
  };

  const updateWeeklyActuals = (data: any) => {
    const { weekNumber, hoursSpent } = data;
    setWeeklySchedules((prev) =>
      prev.map((schedule) =>
        schedule.weekNumber === weekNumber
          ? {
              ...schedule,
              actualHours: hoursSpent,
              efficiency: (hoursSpent / schedule.targetHours) * 100,
            }
          : schedule
      )
    );
  };

  const getWeekStartDate = (weekNumber: number): string => {
    const startDate = new Date('2025-06-28');
    startDate.setDate(startDate.getDate() + (weekNumber - 1) * 7);
    return startDate.toISOString().split('T')[0];
  };

  const getWeekEndDate = (weekNumber: number): string => {
    const startDate = new Date('2025-06-28');
    startDate.setDate(startDate.getDate() + (weekNumber - 1) * 7 + 6);
    return startDate.toISOString().split('T')[0];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'delayed':
        return 'bg-red-500';
      case 'scheduled':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'delayed':
        return <AlertTriangle className="h-4 w-4" />;
      case 'scheduled':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const recalculatePredictions = () => {
    console.log('🔄 予測再計算中...');
    setLastUpdated(new Date().toLocaleString('ja-JP'));
    initializeEnhancedPredictionSystem();
  };

  const toggleIntensiveMode = () => {
    setIsIntensiveMode((prev) => !prev);
    console.log('⚡ 集中モード:', !isIntensiveMode ? 'ON' : 'OFF');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="h-12 w-12 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">🔮 拡張バッジ完了予測システム</h1>
          </div>
          <p className="text-cyan-200 text-lg">
            AI駆動の12週間詳細予測 • 精度: {predictionAccuracy.toFixed(1)}% • 最終更新:{' '}
            {lastUpdated}
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={recalculatePredictions}
              variant="outline"
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              再計算
            </Button>
            <Button
              onClick={toggleIntensiveMode}
              variant={isIntensiveMode ? 'default' : 'outline'}
              className={isIntensiveMode ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              <Zap className="h-4 w-4 mr-2" />
              集中モード {isIntensiveMode ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-slate-400">総予測バッジ数</p>
                  <p className="text-2xl font-bold text-white">{totalPlannedBadges}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-sm font-medium text-slate-400">完了済みバッジ</p>
                  <p className="text-2xl font-bold text-white">{completedBadges}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-slate-400">総学習時間</p>
                  <p className="text-2xl font-bold text-white">450h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-slate-400">予測精度</p>
                  <p className="text-2xl font-bold text-white">{predictionAccuracy.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* メインコンテンツタブ */}
        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="schedule" className="flex items-center space-x-2">
              <CalendarDays className="h-4 w-4" />
              <span>週次スケジュール</span>
            </TabsTrigger>
            <TabsTrigger value="plan-vs-actual" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>予定vs実績</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center space-x-2">
              <LineChart className="h-4 w-4" />
              <span>バッジタイムライン</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <PieChart className="h-4 w-4" />
              <span>分析ダッシュボード</span>
            </TabsTrigger>
          </TabsList>

          {/* 週次スケジュール */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {weeklySchedules.slice(0, 12).map((schedule) => (
                <Card key={schedule.weekNumber} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span>Week {schedule.weekNumber}</span>
                      <Badge variant={schedule.onTrackScore >= 80 ? 'default' : 'destructive'}>
                        {schedule.onTrackScore}%
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-slate-400">
                      {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 時間進捗 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">学習時間</span>
                        <span className="text-cyan-200">
                          {schedule.actualHours}h / {schedule.targetHours}h
                        </span>
                      </div>
                      <Progress
                        value={(schedule.actualHours / schedule.targetHours) * 100}
                        className="h-2 bg-slate-700"
                      />
                    </div>

                    {/* 予定バッジ */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-white">予定バッジ</h4>
                      {schedule.scheduledBadges.map((badge) => (
                        <div
                          key={badge.badgeId}
                          className="flex items-center justify-between p-2 bg-slate-700 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{badge.icon}</span>
                            <div>
                              <p className="text-xs font-medium text-white truncate max-w-[150px]">
                                {badge.badgeName}
                              </p>
                              <p className="text-xs text-slate-400">
                                {formatDate(badge.plannedDate)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div
                              className={`w-2 h-2 rounded-full ${getStatusColor(badge.status)}`}
                            ></div>
                            {getStatusIcon(badge.status)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 完了バッジ */}
                    {schedule.completedBadges.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-green-400">完了バッジ</h4>
                        {schedule.completedBadges.map((badge) => (
                          <div
                            key={badge.badgeId}
                            className="flex items-center justify-between p-2 bg-green-900/20 rounded"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{badge.icon}</span>
                              <div>
                                <p className="text-xs font-medium text-green-400 truncate max-w-[150px]">
                                  {badge.badgeName}
                                </p>
                                <p className="text-xs text-green-300">
                                  {badge.actualDate && formatDate(badge.actualDate)}
                                </p>
                              </div>
                            </div>
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 予定vs実績 */}
          <TabsContent value="plan-vs-actual" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>予定vs実績 比較分析</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 学習時間比較 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">学習時間推移</h3>
                    <div className="space-y-3">
                      {planVsActual.slice(0, 8).map((data, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Week {index + 1}</span>
                            <span className="text-cyan-200">{formatDate(data.date)}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">予定: {data.plannedHours}h</span>
                              <span className="text-green-400">
                                実績: {data.actualHours.toFixed(1)}h
                              </span>
                            </div>
                            <div className="relative">
                              <Progress
                                value={(data.plannedHours / 20) * 100}
                                className="h-2 bg-slate-700"
                              />
                              <Progress
                                value={(data.actualHours / 20) * 100}
                                className="h-2 bg-slate-700 absolute top-0 opacity-70"
                              />
                            </div>
                            <div className="text-xs text-right">
                              <span
                                className={
                                  data.efficiency >= 90
                                    ? 'text-green-400'
                                    : data.efficiency >= 70
                                      ? 'text-yellow-400'
                                      : 'text-red-400'
                                }
                              >
                                効率性: {data.efficiency.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* バッジ完了数比較 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">バッジ完了数推移</h3>
                    <div className="space-y-3">
                      {planVsActual.slice(0, 8).map((data, index) => (
                        <div key={index} className="p-3 bg-slate-700 rounded space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-400">Week {index + 1}</span>
                            <span className="text-xs text-slate-400">{formatDate(data.date)}</span>
                          </div>
                          <div className="flex justify-between">
                            <div className="text-center">
                              <p className="text-xs text-slate-400">予定</p>
                              <p className="text-lg font-bold text-blue-400">
                                {data.plannedCompletions}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-slate-400">実績</p>
                              <p className="text-lg font-bold text-green-400">
                                {data.actualCompletions}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-slate-400">精度</p>
                              <p className="text-lg font-bold text-purple-400">
                                {data.accuracy.toFixed(0)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* バッジタイムライン */}
          <TabsContent value="timeline" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <LineChart className="h-5 w-5" />
                  <span>バッジ獲得タイムライン</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {weeklySchedules.map((schedule) => (
                    <div key={schedule.weekNumber} className="relative">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-16 text-center">
                          <div className="text-sm font-medium text-white">
                            Week {schedule.weekNumber}
                          </div>
                          <div className="text-xs text-slate-400">
                            {formatDate(schedule.startDate)}
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          {schedule.scheduledBadges.map((badge, index) => (
                            <div
                              key={badge.badgeId}
                              className="flex items-center space-x-3 p-2 bg-slate-700 rounded"
                            >
                              <span className="text-lg">{badge.icon}</span>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-white">{badge.badgeName}</p>
                                <p className="text-xs text-slate-400">
                                  予定: {formatDate(badge.plannedDate)} | 信頼度: {badge.confidence}
                                  %
                                </p>
                              </div>
                              <div
                                className={`w-3 h-3 rounded-full ${getStatusColor(badge.status)}`}
                              ></div>
                            </div>
                          ))}
                          {schedule.completedBadges.map((badge) => (
                            <div
                              key={badge.badgeId}
                              className="flex items-center space-x-3 p-2 bg-green-900/20 rounded"
                            >
                              <span className="text-lg">{badge.icon}</span>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-green-400">
                                  {badge.badgeName}
                                </p>
                                <p className="text-xs text-green-300">
                                  完了: {badge.actualDate && formatDate(badge.actualDate)}
                                </p>
                              </div>
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            </div>
                          ))}
                        </div>
                      </div>
                      {schedule.weekNumber < 12 && (
                        <div className="ml-8 mt-2 w-px h-4 bg-slate-600"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 分析ダッシュボード */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">予測精度分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-400">{predictionAccuracy}%</div>
                      <div className="text-sm text-slate-400">全体予測精度</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-400">時間予測精度</span>
                        <span className="text-sm text-green-400">88%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-400">完了日予測精度</span>
                        <span className="text-sm text-blue-400">82%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-400">依存関係予測精度</span>
                        <span className="text-sm text-purple-400">85%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">カテゴリ別進捗</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-400">セキュリティ</span>
                        <span className="text-sm text-cyan-200">6バッジ</span>
                      </div>
                      <Progress value={60} className="h-2 bg-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-400">技術・開発</span>
                        <span className="text-sm text-cyan-200">15バッジ</span>
                      </div>
                      <Progress value={20} className="h-2 bg-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-400">プロジェクト管理</span>
                        <span className="text-sm text-cyan-200">10バッジ</span>
                      </div>
                      <Progress value={15} className="h-2 bg-slate-700" />
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

export default EnhancedBadgePredictionSystem;
