import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  Clock,
  MapPin,
  Coffee,
  Home,
  CheckCircle,
  AlertCircle,
  Navigation,
  Timer,
  Calendar,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

// 勤務状態の型定義
type WorkStatus = 'not_started' | 'working' | 'on_break' | 'finished';

// 打刻記録の型定義
interface PunchRecord {
  id: string;
  userId: string;
  type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  note?: string;
}

// 位置情報の型定義
interface LocationInfo {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  isWithinWorkArea?: boolean;
}

export const WorkTimePunchSystem: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // 状態管理
  const [workStatus, setWorkStatus] = useState<WorkStatus>('not_started');
  const [currentLocation, setCurrentLocation] = useState<LocationInfo | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [workStartTime, setWorkStartTime] = useState<Date | null>(null);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [todayRecords, setTodayRecords] = useState<PunchRecord[]>([]);
  const [isPunchingIn, setIsPunchingIn] = useState(false);
  const [showApprovalRequired, setShowApprovalRequired] = useState(false);

  // タイマー用のref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [breakTime, setBreakTime] = useState(0);

  // 事業所の設定（実際の運用では設定画面から管理）
  const workAreas = [
    {
      name: '本社',
      latitude: 35.6812,
      longitude: 139.7671,
      radius: 100, // メートル
    },
    {
      name: '支社',
      latitude: 35.6895,
      longitude: 139.6917,
      radius: 150,
    },
  ];

  // 位置情報取得
  const getCurrentLocation = async (): Promise<LocationInfo | null> => {
    if (!navigator.geolocation) {
      toast({
        title: 'エラー',
        description: 'このブラウザは位置情報をサポートしていません。',
        variant: 'destructive',
      });
      return null;
    }

    setIsGettingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const locationInfo: LocationInfo = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      // 住所の逆ジオコーディング（実際の実装ではGeocoding APIを使用）
      try {
        locationInfo.address = await reverseGeocode(
          position.coords.latitude,
          position.coords.longitude
        );
      } catch (e) {
        console.warn('住所の取得に失敗:', e);
      }

      // 事業所内かどうかの判定
      locationInfo.isWithinWorkArea = isWithinWorkArea(locationInfo);

      return locationInfo;
    } catch (error) {
      console.error('位置情報の取得に失敗:', error);
      toast({
        title: '位置情報エラー',
        description: '位置情報の取得に失敗しました。手動で場所を入力してください。',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGettingLocation(false);
    }
  };

  // 簡易逆ジオコーディング（実際の実装ではGoogle Maps APIなどを使用）
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // 模擬的な住所生成
    return `東京都${Math.floor(Math.random() * 23 + 1)}区サンプル${Math.floor(Math.random() * 999 + 1)}`;
  };

  // 事業所内判定
  const isWithinWorkArea = (location: LocationInfo): boolean => {
    return workAreas.some((area) => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        area.latitude,
        area.longitude
      );
      return distance <= area.radius;
    });
  };

  // 2点間の距離計算（メートル）
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // 地球の半径（メートル）
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // 打刻記録の作成
  const createPunchRecord = async (
    type: PunchRecord['type'],
    location: LocationInfo | null
  ): Promise<void> => {
    if (!user) return;

    const record: PunchRecord = {
      id: `punch_${Date.now()}`,
      userId: user.id,
      type,
      timestamp: new Date(),
      location: location
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address,
          }
        : undefined,
      status: location?.isWithinWorkArea ? 'approved' : 'pending',
      note: location?.isWithinWorkArea ? '事業所内での打刻' : '事業所外での打刻（要承認）',
    };

    // ローカル状態の更新
    setTodayRecords((prev) => [...prev, record]);

    // サーバーに送信（実際の実装ではAPIコール）
    try {
      await savePunchRecord(record);

      toast({
        title: '打刻完了',
        description: `${getPunchTypeLabel(type)}を記録しました。`,
        variant: location?.isWithinWorkArea ? 'default' : 'destructive',
      });

      if (!location?.isWithinWorkArea) {
        setShowApprovalRequired(true);
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: '打刻の記録に失敗しました。',
        variant: 'destructive',
      });
    }
  };

  // 打刻タイプのラベル取得
  const getPunchTypeLabel = (type: PunchRecord['type']): string => {
    switch (type) {
      case 'clock_in':
        return '出勤';
      case 'clock_out':
        return '退勤';
      case 'break_start':
        return '休憩開始';
      case 'break_end':
        return '休憩終了';
      default:
        return '打刻';
    }
  };

  // 打刻記録の保存（模擬API）
  const savePunchRecord = async (record: PunchRecord): Promise<void> => {
    // 模擬的な遅延
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // ローカルストレージに保存（実際の実装ではサーバーAPI）
    const existingRecords = JSON.parse(localStorage.getItem('punchRecords') || '[]');
    existingRecords.push(record);
    localStorage.setItem('punchRecords', JSON.stringify(existingRecords));
  };

  // 出勤打刻
  const handleClockIn = async () => {
    setIsPunchingIn(true);

    const location = await getCurrentLocation();
    setCurrentLocation(location);

    await createPunchRecord('clock_in', location);

    setWorkStatus('working');
    setWorkStartTime(new Date());

    setIsPunchingIn(false);
  };

  // 退勤打刻
  const handleClockOut = async () => {
    setIsPunchingIn(true);

    const location = await getCurrentLocation();
    setCurrentLocation(location);

    await createPunchRecord('clock_out', location);

    setWorkStatus('finished');
    setWorkStartTime(null);

    setIsPunchingIn(false);
  };

  // 休憩開始
  const handleBreakStart = async () => {
    setIsPunchingIn(true);

    const location = await getCurrentLocation();
    setCurrentLocation(location);

    await createPunchRecord('break_start', location);

    setWorkStatus('on_break');
    setBreakStartTime(new Date());

    setIsPunchingIn(false);
  };

  // 休憩終了
  const handleBreakEnd = async () => {
    setIsPunchingIn(true);

    const location = await getCurrentLocation();
    setCurrentLocation(location);

    await createPunchRecord('break_end', location);

    setWorkStatus('working');
    setBreakStartTime(null);

    setIsPunchingIn(false);
  };

  // タイマー更新
  useEffect(() => {
    if (workStatus === 'working' && workStartTime) {
      timerRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - workStartTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [workStatus, workStartTime]);

  // 休憩時間タイマー
  useEffect(() => {
    if (workStatus === 'on_break' && breakStartTime) {
      const breakTimer = setInterval(() => {
        const now = new Date();
        const breakElapsed = Math.floor((now.getTime() - breakStartTime.getTime()) / 1000);
        setBreakTime(breakElapsed);
      }, 1000);

      return () => clearInterval(breakTimer);
    }
  }, [workStatus, breakStartTime]);

  // 時間フォーマット
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 勤務状態表示
  const getStatusDisplay = () => {
    switch (workStatus) {
      case 'not_started':
        return { label: '未出勤', color: 'bg-gray-500', icon: <Clock className="h-4 w-4" /> };
      case 'working':
        return { label: '勤務中', color: 'bg-green-500', icon: <Timer className="h-4 w-4" /> };
      case 'on_break':
        return { label: '休憩中', color: 'bg-yellow-500', icon: <Coffee className="h-4 w-4" /> };
      case 'finished':
        return { label: '退勤済み', color: 'bg-blue-500', icon: <Home className="h-4 w-4" /> };
      default:
        return { label: '不明', color: 'bg-gray-500', icon: <Clock className="h-4 w-4" /> };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="space-y-6">
      {/* リアルタイム状況表示 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              リアルタイム勤怠
            </CardTitle>
            <Badge className={`${statusDisplay.color} text-white`}>
              {statusDisplay.icon}
              <span className="ml-1">{statusDisplay.label}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 勤務時間 */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">勤務時間</div>
              <div className="text-2xl font-bold text-blue-700">{formatTime(elapsedTime)}</div>
            </div>

            {/* 休憩時間 */}
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">休憩時間</div>
              <div className="text-2xl font-bold text-yellow-700">{formatTime(breakTime)}</div>
            </div>

            {/* 現在時刻 */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">現在時刻</div>
              <div className="text-2xl font-bold text-gray-700">
                {format(new Date(), 'HH:mm:ss', { locale: ja })}
              </div>
            </div>
          </div>

          {/* 位置情報表示 */}
          {currentLocation && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>現在地: {currentLocation.address || '住所取得中...'}</span>
                {currentLocation.isWithinWorkArea ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 打刻ボタン */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            打刻操作
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {workStatus === 'not_started' && (
              <Button
                onClick={handleClockIn}
                disabled={isPunchingIn || isGettingLocation}
                className="h-16 text-lg bg-green-600 hover:bg-green-700"
              >
                {isPunchingIn ? '処理中...' : '出勤'}
              </Button>
            )}

            {workStatus === 'working' && (
              <>
                <Button
                  onClick={handleBreakStart}
                  disabled={isPunchingIn || isGettingLocation}
                  className="h-16 text-lg bg-yellow-600 hover:bg-yellow-700"
                >
                  {isPunchingIn ? '処理中...' : '休憩開始'}
                </Button>
                <Button
                  onClick={handleClockOut}
                  disabled={isPunchingIn || isGettingLocation}
                  className="h-16 text-lg bg-red-600 hover:bg-red-700"
                >
                  {isPunchingIn ? '処理中...' : '退勤'}
                </Button>
              </>
            )}

            {workStatus === 'on_break' && (
              <Button
                onClick={handleBreakEnd}
                disabled={isPunchingIn || isGettingLocation}
                className="h-16 text-lg bg-blue-600 hover:bg-blue-700 col-span-2"
              >
                {isPunchingIn ? '処理中...' : '休憩終了'}
              </Button>
            )}

            {workStatus === 'finished' && (
              <div className="col-span-2 text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-gray-600">本日の勤務は終了しました</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 承認待ち警告 */}
      {showApprovalRequired && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>承認待ち</AlertTitle>
          <AlertDescription>
            事業所外での打刻のため、管理者の承認が必要です。承認されるまでお待ちください。
          </AlertDescription>
        </Alert>
      )}

      {/* 今日の打刻履歴 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            今日の打刻履歴
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayRecords.length === 0 ? (
            <div className="text-center py-4 text-gray-500">まだ打刻記録がありません</div>
          ) : (
            <div className="space-y-2">
              {todayRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      {format(record.timestamp, 'HH:mm:ss', { locale: ja })}
                    </div>
                    <div className="font-medium">{getPunchTypeLabel(record.type)}</div>
                    {record.location?.address && (
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {record.location.address}
                      </div>
                    )}
                  </div>
                  <Badge
                    variant={
                      record.status === 'approved'
                        ? 'default'
                        : record.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {record.status === 'approved'
                      ? '承認済み'
                      : record.status === 'pending'
                        ? '承認待ち'
                        : '却下'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
