import { useAuth } from '@/hooks/useAuth';
/**
 * ⏰ リアルタイム打刻ダッシュボード
 * ワンクリック打刻・勤務状態表示・リアルタイム更新
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import TimeTrackingService from '@/services/timeTracking/TimeTrackingService';
import {
  Clock,
  Play,
  Square,
  Coffee,
  Home,
  Building,
  MapPin,
  Calendar,
  Timer,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Pause,
  RotateCcw,
  Zap,
  Target,
  Activity,
  BarChart3,
  Settings,
  Bell,
  Moon,
  Sun,
  Briefcase,
  Edit,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { format, differenceInMinutes, addMinutes } from 'date-fns';
import { ja } from 'date-fns/locale';

interface WorkStatus {
  status: 'not_started' | 'working' | 'on_break' | 'finished';
  workDuration: number;
  breakDuration: number;
  isOvertime: boolean;
  clockInTime?: Date;
  lastBreakStart?: Date;
  estimatedClockOut?: Date;
}

interface TimeRecord {
  id: string;
  date: string;
  clockIn?: Date;
  clockOut?: Date;
  status: string;
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  overtimeMinutes: number;
  location?: {
    type: 'office' | 'home' | 'client' | 'other';
    address?: string;
  };
}

export const RealtimeClockDashboard: React.FC = () => {
  // State Management
  const [timeService] = useState(() => new TimeTrackingService());
  const { isAuthenticated, user } = useAuth();
  const resolvedUserId = user?.id || user?._id || user?.uid || user?.email || '';
  const [workStatus, setWorkStatus] = useState<WorkStatus>({
    status: 'not_started',
    workDuration: 0,
    breakDuration: 0,
    isOvertime: false,
  });
  const [todayRecord, setTodayRecord] = useState<TimeRecord | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState<'office' | 'home' | 'client' | 'other'>(
    'office'
  );
  const [notes, setNotes] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [recentRecords, setRecentRecords] = useState<TimeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // データ更新
  const updateWorkStatus = useCallback(() => {
    if (!resolvedUserId) return;
    const status = timeService.getCurrentWorkStatus(resolvedUserId);
    const record = timeService.getTodaysRecord(resolvedUserId);
    setWorkStatus(status);
    setTodayRecord(record);
  }, [timeService, resolvedUserId]);

  // 現在時刻の更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      updateWorkStatus();
    }, 1000);

    return () => clearInterval(timer);
  }, [updateWorkStatus]);

  // 初期データ読み込み
  useEffect(() => {
    if (resolvedUserId) updateWorkStatus();

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const records = resolvedUserId
      ? timeService.getTimeRecords(resolvedUserId, startDate, endDate)
      : [];
    setRecentRecords(records.slice(0, 5));

    // イベントリスナー
    const handleClockEvent = () => {
      updateWorkStatus();
    };

    timeService.on('clockedIn', handleClockEvent);
    timeService.on('clockedOut', handleClockEvent);
    timeService.on('breakStarted', handleClockEvent);
    timeService.on('breakEnded', handleClockEvent);
    timeService.on('timeUpdated', handleClockEvent);

    return () => {
      timeService.off('clockedIn', handleClockEvent);
      timeService.off('clockedOut', handleClockEvent);
      timeService.off('breakStarted', handleClockEvent);
      timeService.off('breakEnded', handleClockEvent);
      timeService.off('timeUpdated', handleClockEvent);
    };
  }, [timeService, updateWorkStatus, resolvedUserId]);

  // 打刻アクション
  const handleClockIn = async () => {
    setIsLoading(true);
    try {
      if (!isAuthenticated || !resolvedUserId) throw new Error('ログインが必要です');
      await timeService.clockIn(
        resolvedUserId,
        {
          type: selectedLocation,
          address: selectedLocation === 'office' ? '本社オフィス' : undefined,
        },
        notes
      );
      setNotes('');
    } catch (error) {
      console.error('Clock in error:', error);
      alert(error instanceof Error ? error.message : '出勤打刻に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    setIsLoading(true);
    try {
      if (!isAuthenticated || !resolvedUserId) throw new Error('ログインが必要です');
      await timeService.clockOut(resolvedUserId, notes);
      setNotes('');
    } catch (error) {
      console.error('Clock out error:', error);
      alert(error instanceof Error ? error.message : '退勤打刻に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartBreak = async () => {
    setIsLoading(true);
    try {
      if (!isAuthenticated || !resolvedUserId) throw new Error('ログインが必要です');
      await timeService.startBreak(resolvedUserId, notes);
      setNotes('');
    } catch (error) {
      console.error('Start break error:', error);
      alert(error instanceof Error ? error.message : '休憩開始に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndBreak = async () => {
    setIsLoading(true);
    try {
      if (!isAuthenticated || !resolvedUserId) throw new Error('ログインが必要です');
      await timeService.endBreak(resolvedUserId);
    } catch (error) {
      console.error('End break error:', error);
      alert(error instanceof Error ? error.message : '休憩終了に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // ユーティリティ関数
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}時間${mins.toString().padStart(2, '0')}分`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'on_break':
        return <Coffee className="h-4 w-4 text-yellow-600" />;
      case 'finished':
        return <Square className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'working':
        return '勤務中';
      case 'on_break':
        return '休憩中';
      case 'finished':
        return '勤務終了';
      default:
        return '未出勤';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'on_break':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'finished':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getLocationIcon = (locationType: string) => {
    switch (locationType) {
      case 'home':
        return <Home className="h-4 w-4" />;
      case 'office':
        return <Building className="h-4 w-4" />;
      case 'client':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const standardWorkHours = 8 * 60; // 8時間
  const workProgress = Math.min((workStatus.workDuration / standardWorkHours) * 100, 100);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Clock className="h-8 w-8 text-blue-600" />
            勤怠管理システム
          </h1>
          <p className="text-gray-600 mt-1">リアルタイム打刻・勤務時間管理</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-mono font-bold">
              {format(currentTime, 'HH:mm:ss', { locale: ja })}
            </div>
            <div className="text-sm text-gray-600">
              {format(currentTime, 'yyyy年MM月dd日(E)', { locale: ja })}
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 現在の勤務状況 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              現在の勤務状況
            </CardTitle>
            <Badge className={getStatusColor(workStatus.status)}>
              {getStatusIcon(workStatus.status)}
              <span className="ml-1">{getStatusText(workStatus.status)}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatDuration(workStatus.workDuration)}
              </div>
              <div className="text-sm text-gray-600">勤務時間</div>
              <Progress value={workProgress} className="mt-2 h-2" />
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {formatDuration(workStatus.breakDuration)}
              </div>
              <div className="text-sm text-gray-600">休憩時間</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {workStatus.isOvertime
                  ? formatDuration(workStatus.workDuration - standardWorkHours)
                  : '0時間00分'}
              </div>
              <div className="text-sm text-gray-600">残業時間</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {workStatus.estimatedClockOut
                  ? format(workStatus.estimatedClockOut, 'HH:mm', { locale: ja })
                  : '--:--'}
              </div>
              <div className="text-sm text-gray-600">予定退勤</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 打刻アクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-green-600" />
              打刻アクション
            </CardTitle>
            <CardDescription>ワンクリックで出勤・退勤・休憩の打刻</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 勤務地選択 */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'office', label: 'オフィス', icon: Building },
                { value: 'home', label: '在宅', icon: Home },
                { value: 'client', label: '客先', icon: Briefcase },
                { value: 'other', label: 'その他', icon: MapPin },
              ].map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={selectedLocation === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLocation(value as any)}
                  className="flex flex-col gap-1 h-auto py-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>

            {/* 打刻ボタン */}
            <div className="grid grid-cols-2 gap-3">
              {workStatus.status === 'not_started' && (
                <Button
                  onClick={handleClockIn}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 col-span-2"
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  出勤打刻
                </Button>
              )}

              {workStatus.status === 'working' && (
                <>
                  <Button
                    onClick={handleStartBreak}
                    disabled={isLoading}
                    variant="outline"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  >
                    <Coffee className="h-4 w-4 mr-1" />
                    休憩開始
                  </Button>
                  <Button
                    onClick={handleClockOut}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Square className="h-4 w-4 mr-1" />
                    退勤打刻
                  </Button>
                </>
              )}

              {workStatus.status === 'on_break' && (
                <>
                  <Button
                    onClick={handleEndBreak}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 col-span-2"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    休憩終了
                  </Button>
                </>
              )}

              {workStatus.status === 'finished' && (
                <div className="col-span-2 text-center p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">本日の勤務は完了しました</p>
                </div>
              )}
            </div>

            {/* メモ入力 */}
            <div>
              <textarea
                placeholder="メモ（任意）"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* 今日の詳細 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              今日の勤務詳細
            </CardTitle>
            <CardDescription>
              {format(currentTime, 'yyyy年MM月dd日(E)', { locale: ja })}の記録
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayRecord ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">出勤時刻</span>
                    <div className="font-mono text-lg">
                      {todayRecord.clockIn
                        ? format(todayRecord.clockIn, 'HH:mm', { locale: ja })
                        : '--:--'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">退勤時刻</span>
                    <div className="font-mono text-lg">
                      {todayRecord.clockOut
                        ? format(todayRecord.clockOut, 'HH:mm', { locale: ja })
                        : '--:--'}
                    </div>
                  </div>
                </div>

                {todayRecord.location && (
                  <div className="flex items-center gap-2 text-sm">
                    {getLocationIcon(todayRecord.location.type)}
                    <span className="text-gray-600">勤務地:</span>
                    <span>
                      {todayRecord.location.type === 'office'
                        ? 'オフィス'
                        : todayRecord.location.type === 'home'
                          ? '在宅'
                          : todayRecord.location.type === 'client'
                            ? '客先'
                            : 'その他'}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">実働時間</span>
                    <span className="font-medium">
                      {formatDuration(todayRecord.totalWorkMinutes)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">休憩時間</span>
                    <span className="font-medium">
                      {formatDuration(todayRecord.totalBreakMinutes)}
                    </span>
                  </div>
                  {todayRecord.overtimeMinutes > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">残業時間</span>
                      <span className="font-medium text-orange-600">
                        {formatDuration(todayRecord.overtimeMinutes)}
                      </span>
                    </div>
                  )}
                </div>

                {workStatus.isOvertime && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-700">
                      標準勤務時間を超過しています。適切な休憩と健康管理を心がけてください。
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>まだ出勤打刻されていません</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 今週の勤務サマリー */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            今週の勤務サマリー
          </CardTitle>
          <CardDescription>過去7日間の勤務記録</CardDescription>
        </CardHeader>
        <CardContent>
          {recentRecords.length > 0 ? (
            <div className="space-y-3">
              {recentRecords.map((record, index) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">
                      {format(new Date(record.date), 'MM/dd(E)', { locale: ja })}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getStatusIcon(record.status)}
                      <span className="ml-1">{getStatusText(record.status)}</span>
                    </Badge>
                    {record.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        {getLocationIcon(record.location.type)}
                        <span>
                          {record.location.type === 'office'
                            ? 'オフィス'
                            : record.location.type === 'home'
                              ? '在宅'
                              : record.location.type === 'client'
                                ? '客先'
                                : 'その他'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <div className="font-medium">{formatDuration(record.totalWorkMinutes)}</div>
                      <div className="text-xs text-gray-600">実働</div>
                    </div>
                    {record.overtimeMinutes > 0 && (
                      <div className="text-right text-orange-600">
                        <div className="font-medium">+{formatDuration(record.overtimeMinutes)}</div>
                        <div className="text-xs">残業</div>
                      </div>
                    )}
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatDuration(
                        recentRecords.reduce((sum, r) => sum + r.totalWorkMinutes, 0)
                      )}
                    </div>
                    <div className="text-xs text-gray-600">総勤務時間</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">
                      {formatDuration(recentRecords.reduce((sum, r) => sum + r.overtimeMinutes, 0))}
                    </div>
                    <div className="text-xs text-gray-600">総残業時間</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {recentRecords.filter((r) => r.status === 'finished').length}日
                    </div>
                    <div className="text-xs text-gray-600">出勤日数</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>勤務記録がありません</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ADHD/ASD配慮機能の統合 */}
      <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <Zap className="h-4 w-4 text-purple-600" />
        <AlertTitle className="text-purple-800">🧠 ADHD/ASD配慮機能</AlertTitle>
        <AlertDescription className="text-purple-700">
          認知特性に配慮した勤怠管理機能が統合されています。
          リマインダー、視覚的な状況表示、ルーティン化支援により、無理なく継続的な勤怠管理を実現します。
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default RealtimeClockDashboard;
