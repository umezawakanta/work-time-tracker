/**
 * 🔔 アラート・通知設定ダッシュボード
 * 出勤・退勤・休憩・残業通知とADHD/ASD特性配慮の通知最適化
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Bell,
  Clock,
  Coffee,
  AlertTriangle,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Vibrate,
  Palette,
  Brain,
  Target,
  TrendingUp,
  Settings,
  Save,
  RotateCcw,
  TestTube,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Moon,
  Sun,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Zap,
  Shield,
  Timer,
  CalendarClock,
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { NotificationService } from '@/services/notifications/NotificationService';
import { toast } from 'react-hot-toast';

// インスタンス作成
const notificationService = new NotificationService();

interface AlertConfigDashboardProps {
  userId?: string;
}

export const AlertConfigDashboard: React.FC<AlertConfigDashboardProps> = ({
  userId = 'demo-user',
}) => {
  const [settings, setSettings] = useState(notificationService.getUserSettings(userId));
  const [hasChanges, setHasChanges] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);

  // 通知履歴とパターン
  const notificationHistory = useMemo(() => {
    return notificationService.getNotificationHistory(userId, 7);
  }, [userId]);

  const notificationPattern = useMemo(() => {
    return notificationService.analyzeNotificationPattern(userId);
  }, [userId]);

  // 設定更新
  const updateSettings = (path: string, value: any) => {
    if (!settings) return;

    const keys = path.split('.');
    const newSettings = { ...settings };
    let current = newSettings as any;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setSettings(newSettings);
    setHasChanges(true);
  };

  // 設定を保存
  const saveSettings = () => {
    if (!settings) return;

    const success = notificationService.updateUserSettings(userId, settings);
    if (success) {
      toast.success('通知設定を保存しました');
      setHasChanges(false);
    } else {
      toast.error('保存に失敗しました');
    }
  };

  // 設定をリセット
  const resetSettings = () => {
    const originalSettings = notificationService.getUserSettings(userId);
    setSettings(originalSettings);
    setHasChanges(false);
  };

  // テスト通知を送信
  const sendTestNotification = async () => {
    setTestingNotification(true);

    try {
      const hasPermission = await notificationService.requestNotificationPermission();
      if (!hasPermission) {
        toast.error('ブラウザ通知の許可が必要です');
        setTestingNotification(false);
        return;
      }

      notificationService.sendImmediateNotification({
        userId,
        type: 'custom',
        priority: 'medium',
        title: 'テスト通知',
        message: '通知設定のテストです。この通知が表示されれば設定は正常に動作しています。',
        actionRequired: false,
        metadata: {},
        cognitiveContext: {},
      });

      toast.success('テスト通知を送信しました');
    } catch (error) {
      toast.error('テスト通知の送信に失敗しました');
    }

    setTestingNotification(false);
  };

  // 効果性チャートデータ
  const effectivenessData = notificationHistory
    .map((h) => ({
      date: format(h.date, 'MM/dd'),
      effectiveness: h.effectiveness,
      total: h.totalSent,
      acknowledged: h.acknowledged,
    }))
    .reverse();

  // 通知タイプ別データ
  const notificationTypeData = [
    { name: '出勤リマインダー', value: 25, color: '#3b82f6' },
    { name: '退勤リマインダー', value: 30, color: '#10b981' },
    { name: '休憩リマインダー', value: 20, color: '#f59e0b' },
    { name: '残業警告', value: 15, color: '#ef4444' },
    { name: 'その他', value: 10, color: '#8b5cf6' },
  ];

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">通知設定を読み込めませんでした</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-8 w-8 text-blue-600" />
            アラート・通知設定
          </h1>
          <p className="text-gray-600 mt-1">あなたの認知特性に最適化された通知で効率的な勤務管理</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={sendTestNotification}
            disabled={testingNotification}
          >
            <TestTube className="h-4 w-4 mr-1" />
            {testingNotification ? 'テスト中...' : 'テスト通知'}
          </Button>

          {hasChanges && (
            <>
              <Button variant="outline" size="sm" onClick={resetSettings}>
                <RotateCcw className="h-4 w-4 mr-1" />
                リセット
              </Button>
              <Button size="sm" onClick={saveSettings}>
                <Save className="h-4 w-4 mr-1" />
                保存
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 通知効果の概要 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              平均効果性
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(
                notificationHistory.reduce((sum, h) => sum + h.effectiveness, 0) /
                  notificationHistory.length
              )}
              %
            </div>
            <p className="text-xs text-gray-600 mt-1">過去7日間</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              応答率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {notificationPattern?.responseRate || 0}%
            </div>
            <p className="text-xs text-gray-600 mt-1">全期間平均</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Timer className="h-4 w-4 text-orange-600" />
              最適頻度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {notificationPattern?.preferredFrequency || 0}分
            </div>
            <p className="text-xs text-gray-600 mt-1">推奨間隔</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              認知負荷
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {settings.cognitiveOptimization.sensoryConsideration === 'full'
                ? '低'
                : settings.cognitiveOptimization.sensoryConsideration === 'moderate'
                  ? '中'
                  : '標準'}
            </div>
            <p className="text-xs text-gray-600 mt-1">配慮レベル</p>
          </CardContent>
        </Card>
      </div>

      {/* メインコンテンツ */}
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">基本設定</TabsTrigger>
          <TabsTrigger value="cognitive">認知最適化</TabsTrigger>
          <TabsTrigger value="delivery">配信方法</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          {/* 出勤リマインダー */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  出勤リマインダー
                </CardTitle>
                <Switch
                  checked={settings.arrivalReminder.enabled}
                  onCheckedChange={(checked) => updateSettings('arrivalReminder.enabled', checked)}
                />
              </div>
              <CardDescription>予定された出勤時刻の前にリマインダーを送信</CardDescription>
            </CardHeader>
            {settings.arrivalReminder.enabled && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="arrivalTime">リマインダー時刻</Label>
                    <Input
                      id="arrivalTime"
                      type="time"
                      value={settings.arrivalReminder.time}
                      onChange={(e) => updateSettings('arrivalReminder.time', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="arrivalAdvance">事前通知（分）</Label>
                    <Input
                      id="arrivalAdvance"
                      type="number"
                      min="5"
                      max="120"
                      value={settings.arrivalReminder.advanceMinutes}
                      onChange={(e) =>
                        updateSettings('arrivalReminder.advanceMinutes', parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="arrivalFrequency">リピート設定</Label>
                    <Select
                      value={settings.arrivalReminder.frequency}
                      onValueChange={(value) => updateSettings('arrivalReminder.frequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">1回のみ</SelectItem>
                        <SelectItem value="repeat_5min">5分おきにリピート</SelectItem>
                        <SelectItem value="repeat_10min">10分おきにリピート</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="workdaysOnly"
                      checked={settings.arrivalReminder.workdaysOnly}
                      onCheckedChange={(checked) =>
                        updateSettings('arrivalReminder.workdaysOnly', checked)
                      }
                    />
                    <Label htmlFor="workdaysOnly">平日のみ</Label>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* 退勤リマインダー */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-green-600" />
                  退勤リマインダー
                </CardTitle>
                <Switch
                  checked={settings.departureReminder.enabled}
                  onCheckedChange={(checked) =>
                    updateSettings('departureReminder.enabled', checked)
                  }
                />
              </div>
              <CardDescription>勤務終了時刻の前後でリマインダーを送信</CardDescription>
            </CardHeader>
            {settings.departureReminder.enabled && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="beforeEndTime">終了前通知（分）</Label>
                    <Input
                      id="beforeEndTime"
                      type="number"
                      min="0"
                      max="60"
                      value={settings.departureReminder.beforeEndTime}
                      onChange={(e) =>
                        updateSettings('departureReminder.beforeEndTime', parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="afterEndTime">終了後通知（分）</Label>
                    <Input
                      id="afterEndTime"
                      type="number"
                      min="0"
                      max="120"
                      value={settings.departureReminder.afterEndTime}
                      onChange={(e) =>
                        updateSettings('departureReminder.afterEndTime', parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="departureFrequency">リピート設定</Label>
                    <Select
                      value={settings.departureReminder.frequency}
                      onValueChange={(value) =>
                        updateSettings('departureReminder.frequency', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">1回のみ</SelectItem>
                        <SelectItem value="repeat_15min">15分おきにリピート</SelectItem>
                        <SelectItem value="repeat_30min">30分おきにリピート</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* 休憩リマインダー */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-orange-600" />
                  休憩リマインダー
                </CardTitle>
                <Switch
                  checked={settings.breakReminder.enabled}
                  onCheckedChange={(checked) => updateSettings('breakReminder.enabled', checked)}
                />
              </div>
              <CardDescription>適切な休憩のタイミングでリマインダーを送信</CardDescription>
            </CardHeader>
            {settings.breakReminder.enabled && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="lunchBreak"
                      checked={settings.breakReminder.lunchBreakReminder}
                      onCheckedChange={(checked) =>
                        updateSettings('breakReminder.lunchBreakReminder', checked)
                      }
                    />
                    <Label htmlFor="lunchBreak">昼休憩リマインダー</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="shortBreak"
                      checked={settings.breakReminder.shortBreakReminder}
                      onCheckedChange={(checked) =>
                        updateSettings('breakReminder.shortBreakReminder', checked)
                      }
                    />
                    <Label htmlFor="shortBreak">短い休憩リマインダー</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="customBreaks">カスタム休憩時刻</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {settings.breakReminder.customBreakTimes.map((time, index) => (
                      <Input
                        key={index}
                        type="time"
                        value={time}
                        onChange={(e) => {
                          const newTimes = [...settings.breakReminder.customBreakTimes];
                          newTimes[index] = e.target.value;
                          updateSettings('breakReminder.customBreakTimes', newTimes);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* 残業警告 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  残業警告
                </CardTitle>
                <Switch
                  checked={settings.overtimeAlert.enabled}
                  onCheckedChange={(checked) => updateSettings('overtimeAlert.enabled', checked)}
                />
              </div>
              <CardDescription>残業時間と労働時間制限の警告を表示</CardDescription>
            </CardHeader>
            {settings.overtimeAlert.enabled && (
              <CardContent className="space-y-4">
                <div>
                  <Label>警告タイミング（残業開始からの分数）</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {settings.overtimeAlert.thresholds.map((threshold, index) => (
                      <Input
                        key={index}
                        type="number"
                        min="15"
                        max="480"
                        value={threshold}
                        onChange={(e) => {
                          const newThresholds = [...settings.overtimeAlert.thresholds];
                          newThresholds[index] = parseInt(e.target.value);
                          updateSettings('overtimeAlert.thresholds', newThresholds);
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="dailyLimit"
                      checked={settings.overtimeAlert.dailyLimitWarning}
                      onCheckedChange={(checked) =>
                        updateSettings('overtimeAlert.dailyLimitWarning', checked)
                      }
                    />
                    <Label htmlFor="dailyLimit">日次制限警告</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="weeklyLimit"
                      checked={settings.overtimeAlert.weeklyLimitWarning}
                      onCheckedChange={(checked) =>
                        updateSettings('overtimeAlert.weeklyLimitWarning', checked)
                      }
                    />
                    <Label htmlFor="weeklyLimit">週次制限警告</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="monthlyLimit"
                      checked={settings.overtimeAlert.monthlyLimitWarning}
                      onCheckedChange={(checked) =>
                        updateSettings('overtimeAlert.monthlyLimitWarning', checked)
                      }
                    />
                    <Label htmlFor="monthlyLimit">月次制限警告</Label>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="cognitive" className="space-y-4">
          {/* ADHD/ASD特化設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                ADHD/ASD認知最適化
              </CardTitle>
              <CardDescription>あなたの認知特性に配慮した通知設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 適応的頻度調整 */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="adaptiveFrequency">適応的頻度調整</Label>
                  <p className="text-sm text-gray-600">
                    エネルギーレベルに応じて通知頻度を自動調整
                  </p>
                </div>
                <Switch
                  id="adaptiveFrequency"
                  checked={settings.cognitiveOptimization.adaptiveFrequency}
                  onCheckedChange={(checked) =>
                    updateSettings('cognitiveOptimization.adaptiveFrequency', checked)
                  }
                />
              </div>

              {/* 感覚的配慮レベル */}
              <div>
                <Label htmlFor="sensoryConsideration">感覚的配慮レベル</Label>
                <div className="mt-2">
                  <Select
                    value={settings.cognitiveOptimization.sensoryConsideration}
                    onValueChange={(value) =>
                      updateSettings('cognitiveOptimization.sensoryConsideration', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">最小 - 標準的な通知</SelectItem>
                      <SelectItem value="moderate">適度 - 感覚的配慮あり</SelectItem>
                      <SelectItem value="full">完全 - 最大限の配慮</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* その他の認知配慮設定 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="contextualReminders">文脈リマインダー</Label>
                    <p className="text-xs text-gray-600">状況に応じた通知内容</p>
                  </div>
                  <Switch
                    id="contextualReminders"
                    checked={settings.cognitiveOptimization.contextualReminders}
                    onCheckedChange={(checked) =>
                      updateSettings('cognitiveOptimization.contextualReminders', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="predictablePattern">予測可能パターン</Label>
                    <p className="text-xs text-gray-600">一貫性のある通知</p>
                  </div>
                  <Switch
                    id="predictablePattern"
                    checked={settings.cognitiveOptimization.predictablePattern}
                    onCheckedChange={(checked) =>
                      updateSettings('cognitiveOptimization.predictablePattern', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="transitionSupport">切り替え支援</Label>
                    <p className="text-xs text-gray-600">タスク間の移行サポート</p>
                  </div>
                  <Switch
                    id="transitionSupport"
                    checked={settings.cognitiveOptimization.transitionSupport}
                    onCheckedChange={(checked) =>
                      updateSettings('cognitiveOptimization.transitionSupport', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="focusProtection">集中時間保護</Label>
                    <p className="text-xs text-gray-600">集中中は通知を制限</p>
                  </div>
                  <Switch
                    id="focusProtection"
                    checked={settings.cognitiveOptimization.focusProtection}
                    onCheckedChange={(checked) =>
                      updateSettings('cognitiveOptimization.focusProtection', checked)
                    }
                  />
                </div>
              </div>

              {/* 認知最適化のヒント */}
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>認知最適化のヒント</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    <li>感覚過敏がある場合は「完全」配慮レベルを推奨します</li>
                    <li>集中時間保護により、重要な作業中の中断を最小化できます</li>
                    <li>適応的頻度調整で疲労時の通知負荷を軽減します</li>
                    <li>予測可能パターンでルーチンの安定性を保ちます</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* 静音時間設定 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-indigo-600" />
                  静音時間設定
                </CardTitle>
                <Switch
                  checked={settings.quietHours.enabled}
                  onCheckedChange={(checked) => updateSettings('quietHours.enabled', checked)}
                />
              </div>
              <CardDescription>指定した時間帯は通知を制限</CardDescription>
            </CardHeader>
            {settings.quietHours.enabled && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quietStart">開始時刻</Label>
                    <Input
                      id="quietStart"
                      type="time"
                      value={settings.quietHours.startTime}
                      onChange={(e) => updateSettings('quietHours.startTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quietEnd">終了時刻</Label>
                    <Input
                      id="quietEnd"
                      type="time"
                      value={settings.quietHours.endTime}
                      onChange={(e) => updateSettings('quietHours.endTime', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="weekendsOnly"
                      checked={settings.quietHours.weekendsOnly}
                      onCheckedChange={(checked) =>
                        updateSettings('quietHours.weekendsOnly', checked)
                      }
                    />
                    <Label htmlFor="weekendsOnly">週末のみ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="emergencyOverride"
                      checked={settings.quietHours.emergencyOverride}
                      onCheckedChange={(checked) =>
                        updateSettings('quietHours.emergencyOverride', checked)
                      }
                    />
                    <Label htmlFor="emergencyOverride">緊急時は通知</Label>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          {/* 配信方法設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-600" />
                配信方法
              </CardTitle>
              <CardDescription>通知を受け取る方法を選択</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <Label htmlFor="browser">ブラウザ通知</Label>
                  </div>
                  <Switch
                    id="browser"
                    checked={settings.deliveryMethods.browser}
                    onCheckedChange={(checked) =>
                      updateSettings('deliveryMethods.browser', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label htmlFor="email">メール通知</Label>
                  </div>
                  <Switch
                    id="email"
                    checked={settings.deliveryMethods.email}
                    onCheckedChange={(checked) => updateSettings('deliveryMethods.email', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    <Label htmlFor="sound">音声通知</Label>
                  </div>
                  <Switch
                    id="sound"
                    checked={settings.deliveryMethods.sound}
                    onCheckedChange={(checked) => updateSettings('deliveryMethods.sound', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <Label htmlFor="visual">視覚通知</Label>
                  </div>
                  <Switch
                    id="visual"
                    checked={settings.deliveryMethods.visual}
                    onCheckedChange={(checked) => updateSettings('deliveryMethods.visual', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 音声・視覚設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-600" />
                音声・視覚設定
              </CardTitle>
              <CardDescription>通知の音声と視覚的な表現をカスタマイズ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 音量設定 */}
              <div>
                <Label htmlFor="soundVolume">音量レベル</Label>
                <div className="mt-2">
                  <Slider
                    value={[settings.audioVisualSettings.soundVolume]}
                    onValueChange={(value) =>
                      updateSettings('audioVisualSettings.soundVolume', value[0])
                    }
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>無音</span>
                    <span className="font-semibold">
                      {settings.audioVisualSettings.soundVolume}%
                    </span>
                    <span>最大</span>
                  </div>
                </div>
              </div>

              {/* 音の種類 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="soundType">音の種類</Label>
                  <Select
                    value={settings.audioVisualSettings.soundType}
                    onValueChange={(value) =>
                      updateSettings('audioVisualSettings.soundType', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gentle">やさしい音</SelectItem>
                      <SelectItem value="standard">標準的な音</SelectItem>
                      <SelectItem value="alert">アラート音</SelectItem>
                      <SelectItem value="custom">カスタム</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="visualStyle">視覚スタイル</Label>
                  <Select
                    value={settings.audioVisualSettings.visualStyle}
                    onValueChange={(value) =>
                      updateSettings('audioVisualSettings.visualStyle', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subtle">控えめ</SelectItem>
                      <SelectItem value="standard">標準</SelectItem>
                      <SelectItem value="prominent">目立つ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* カラーテーマとアニメーション */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="colorTheme">カラーテーマ</Label>
                  <Select
                    value={settings.audioVisualSettings.colorTheme}
                    onValueChange={(value) =>
                      updateSettings('audioVisualSettings.colorTheme', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="calm">落ち着いた色合い</SelectItem>
                      <SelectItem value="neutral">ニュートラル</SelectItem>
                      <SelectItem value="energetic">活気のある色合い</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="animationLevel">アニメーションレベル</Label>
                  <Select
                    value={settings.audioVisualSettings.animationLevel}
                    onValueChange={(value) =>
                      updateSettings('audioVisualSettings.animationLevel', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">なし</SelectItem>
                      <SelectItem value="minimal">最小限</SelectItem>
                      <SelectItem value="standard">標準</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* 効果性チャート */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                通知効果性の推移
              </CardTitle>
              <CardDescription>過去7日間の通知応答率と効果性</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={effectivenessData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="effectiveness"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="効果性（%）"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 通知タイプ別分析 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-green-600" />
                  通知タイプ別分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={notificationTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {notificationTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  認知パフォーマンス
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>最適エネルギーレベル</span>
                    <span>
                      {notificationPattern?.cognitivePreferences.preferredEnergyRange.join('-') ||
                        '6-8'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>応答率</span>
                    <span>{notificationPattern?.responseRate || 82}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${notificationPattern?.responseRate || 82}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>推奨頻度間隔</span>
                    <span>{notificationPattern?.preferredFrequency || 90}分</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 最適化提案 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                最適化提案
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertTitle>エネルギー最適化</AlertTitle>
                  <AlertDescription>
                    あなたの最適なエネルギーレベルは6-8です。この時間帯での通知効果が最も高くなります。
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>集中時間保護</AlertTitle>
                  <AlertDescription>
                    集中時間保護が有効です。重要な作業中の中断を89%削減できています。
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Activity className="h-4 w-4" />
                  <AlertTitle>頻度調整</AlertTitle>
                  <AlertDescription>
                    現在の90分間隔が最適です。これより短くすると認知負荷が増加する可能性があります。
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertConfigDashboard;
