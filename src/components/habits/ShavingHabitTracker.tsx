/**
 * 🪒 髭剃り習慣トラッカー
 * 毎日の髭剃りを確実に実現するための包括的支援ダッシュボード
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Scissors,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  Award,
  Calendar,
  Settings,
  BarChart3,
  User,
  Timer,
  Shield,
  Sparkles,
  HelpCircle,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  shavingHabitService,
  ShavingRecord,
  ShavingStats,
  ShavingMilestone,
  ShavingEmergencyAction,
} from '@/services/habits/ShavingHabitService';

export const ShavingHabitTracker: React.FC = () => {
  const [todayRecord, setTodayRecord] = useState<ShavingRecord | undefined>();
  const [stats, setStats] = useState<ShavingStats | null>(null);
  const [milestones, setMilestones] = useState<ShavingMilestone[]>([]);
  const [showEmergencyMode, setShowEmergencyMode] = useState(false);
  const [emergencyOptions, setEmergencyOptions] = useState<ShavingEmergencyAction[]>([]);
  const [guidance, setGuidance] = useState('');
  const [showQuickRecord, setShowQuickRecord] = useState(false);

  // 記録用のフォーム状態
  const [shavingType, setShavingType] = useState<
    'electric' | 'safety_razor' | 'cartridge' | 'disposable'
  >('electric');
  const [method, setMethod] = useState<'dry_shave' | 'with_cream' | 'with_gel' | 'with_soap'>(
    'dry_shave'
  );
  const [duration, setDuration] = useState(5);
  const [quality, setQuality] = useState<
    'perfect' | 'good' | 'adequate' | 'rushed' | 'skipped_areas'
  >('good');
  const [skinCondition, setSkinCondition] = useState<
    'excellent' | 'good' | 'normal' | 'irritated' | 'cuts'
  >('normal');

  useEffect(() => {
    loadData();
    setupEventListeners();

    return () => {
      shavingHabitService.off('shaving_recorded', handleShavingRecorded);
      shavingHabitService.off('milestone_unlocked', handleMilestoneUnlocked);
      shavingHabitService.off('reminder', handleReminder);
    };
  }, []);

  const loadData = (): void => {
    setTodayRecord(shavingHabitService.getTodayRecord());
    setStats(shavingHabitService.getStats());
    setMilestones(shavingHabitService.getMilestones());
    setGuidance(shavingHabitService.generateShavingGuidance());
    setEmergencyOptions(shavingHabitService.getEmergencyShavingOptions());
  };

  const setupEventListeners = (): void => {
    shavingHabitService.on('shaving_recorded', handleShavingRecorded);
    shavingHabitService.on('milestone_unlocked', handleMilestoneUnlocked);
    shavingHabitService.on('reminder', handleReminder);
  };

  const handleShavingRecorded = (record: ShavingRecord): void => {
    setTodayRecord(record);
    setStats(shavingHabitService.getStats());
    setGuidance(shavingHabitService.generateShavingGuidance());
    setShowQuickRecord(false);
  };

  const handleMilestoneUnlocked = (milestone: ShavingMilestone): void => {
    alert(`🎉 マイルストーン達成！\n${milestone.title}\n${milestone.description}`);
    setMilestones(shavingHabitService.getMilestones());
  };

  const handleReminder = (data: any): void => {
    if (data.type === 'emergency') {
      setShowEmergencyMode(true);
    }
    alert(`🪒 ${data.message}`);
  };

  const recordShaving = (): void => {
    const newRecord = shavingHabitService.recordShaving({
      shavingType,
      method,
      duration,
      quality,
      skinCondition,
      timeOfDay: getTimeOfDay(),
    });

    console.log('✅ 髭剃り記録完了:', newRecord);
  };

  const recordEmergencyShaving = (action: ShavingEmergencyAction): void => {
    const newRecord = shavingHabitService.recordShaving({
      shavingType: 'electric',
      method: 'dry_shave',
      duration: action.estimatedTime,
      quality: 'rushed',
      skinCondition: 'normal',
      timeOfDay: getTimeOfDay(),
      notes: `緊急モード: ${action.title}`,
    });

    setShowEmergencyMode(false);
    console.log('⚡ 緊急髭剃り記録:', newRecord);
  };

  const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  const formatTimeOfDay = (timeOfDay: string): string => {
    const map = {
      morning: '朝',
      afternoon: '昼',
      evening: '夕方',
      night: '夜',
    };
    return map[timeOfDay as keyof typeof map] || timeOfDay;
  };

  const getQualityColor = (quality: string): string => {
    const colors = {
      perfect: 'text-green-600',
      good: 'text-blue-600',
      adequate: 'text-yellow-600',
      rushed: 'text-orange-600',
      skipped_areas: 'text-red-600',
    };
    return colors[quality as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* ヘッダー */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-blue-600" />
            🪒 髭剃り習慣トラッカー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium">{guidance}</div>
            <Button
              onClick={() => setShowQuickRecord(!showQuickRecord)}
              className="flex items-center gap-2"
              variant={todayRecord?.completed ? 'outline' : 'default'}
            >
              {todayRecord?.completed ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  完了済み
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  髭剃り記録
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 今日の記録 */}
      {todayRecord && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              今日の髭剃り記録
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">方法</div>
                <div className="font-medium">{todayRecord.shavingType}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">時間帯</div>
                <div className="font-medium">{formatTimeOfDay(todayRecord.timeOfDay)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">所要時間</div>
                <div className="font-medium">{todayRecord.duration}分</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">仕上がり</div>
                <div className={cn('font-medium', getQualityColor(todayRecord.quality))}>
                  {todayRecord.quality}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 髭剃り記録フォーム */}
      {showQuickRecord && !todayRecord?.completed && (
        <Card>
          <CardHeader>
            <CardTitle>髭剃り完了を記録</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="shaving-type" className="text-sm font-medium">
                  シェーバータイプ
                </label>
                <select
                  id="shaving-type"
                  value={shavingType}
                  onChange={(e) => setShavingType(e.target.value as any)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="electric">電気シェーバー</option>
                  <option value="cartridge">カートリッジ</option>
                  <option value="safety_razor">安全カミソリ</option>
                  <option value="disposable">使い捨て</option>
                </select>
              </div>
              <div>
                <label htmlFor="shaving-method" className="text-sm font-medium">
                  方法
                </label>
                <select
                  id="shaving-method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="dry_shave">ドライ剃り</option>
                  <option value="with_cream">シェービングクリーム</option>
                  <option value="with_gel">シェービングジェル</option>
                  <option value="with_soap">石鹸</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="shaving-duration" className="text-sm font-medium">
                  所要時間（分）
                </label>
                <input
                  id="shaving-duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full mt-1 p-2 border rounded-md"
                  min="1"
                  max="30"
                  placeholder="5"
                />
              </div>
              <div>
                <label htmlFor="shaving-quality" className="text-sm font-medium">
                  仕上がり
                </label>
                <select
                  id="shaving-quality"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as any)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="perfect">完璧</option>
                  <option value="good">良好</option>
                  <option value="adequate">十分</option>
                  <option value="rushed">急いだ</option>
                  <option value="skipped_areas">剃り残し</option>
                </select>
              </div>
              <div>
                <label htmlFor="skin-condition" className="text-sm font-medium">
                  肌の状態
                </label>
                <select
                  id="skin-condition"
                  value={skinCondition}
                  onChange={(e) => setSkinCondition(e.target.value as any)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="excellent">最高</option>
                  <option value="good">良好</option>
                  <option value="normal">普通</option>
                  <option value="irritated">ヒリヒリ</option>
                  <option value="cuts">切り傷</option>
                </select>
              </div>
            </div>

            <Button onClick={recordShaving} className="w-full">
              髭剃り完了を記録
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 統計情報 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.currentStreak}</div>
                  <div className="text-sm text-gray-600">連続日数</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.longestStreak}</div>
                  <div className="text-sm text-gray-600">最高記録</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.monthlySuccessRate.toFixed(0)}%</div>
                  <div className="text-sm text-gray-600">30日成功率</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.averageDuration.toFixed(0)}分</div>
                  <div className="text-sm text-gray-600">平均時間</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* マイルストーン */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            マイルストーン
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestones.slice(0, 6).map((milestone) => (
              <div
                key={milestone.days}
                className={cn(
                  'p-3 rounded-lg border',
                  milestone.unlocked
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{milestone.badge}</span>
                  <span className="font-medium">{milestone.title}</span>
                  {milestone.unlocked && <CheckCircle className="w-4 h-4 text-green-600" />}
                </div>
                <div className="text-sm text-gray-600">{milestone.description}</div>
                <div className="text-xs text-blue-600 mt-1">報酬: {milestone.reward}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 緊急モード */}
      {showEmergencyMode && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              緊急モード: 簡単髭剃りオプション
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emergencyOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div>
                    <div className="font-medium">{option.title}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                    <div className="text-xs text-blue-600">
                      {option.estimatedTime}分 • 効果: {option.effectiveness}/10
                    </div>
                  </div>
                  <Button
                    onClick={() => recordEmergencyShaving(option)}
                    size="sm"
                    variant="outline"
                  >
                    実行
                  </Button>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setShowEmergencyMode(false)}
              variant="outline"
              className="w-full mt-4"
            >
              閉じる
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ヘルプ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            使い方ガイド
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>• 毎日髭剃り後に「髭剃り記録」ボタンから記録</div>
            <div>• 連続記録でマイルストーンを獲得</div>
            <div>• 時間がない時は「緊急モード」を活用</div>
            <div>• 統計で自分のパターンを把握</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
