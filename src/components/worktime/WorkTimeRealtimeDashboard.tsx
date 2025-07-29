import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  Users,
  Timer,
  Coffee,
  Home,
  MapPin,
  Clock,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

// 従業員の勤務状況
interface EmployeeStatus {
  id: string;
  name: string;
  department: string;
  status: 'not_started' | 'working' | 'on_break' | 'finished';
  clockInTime?: Date;
  breakStartTime?: Date;
  currentLocation?: {
    address: string;
    isWithinWorkArea: boolean;
  };
  workDuration: number; // 秒
  breakDuration: number; // 秒
  pendingApprovals: number;
}

// チーム統計
interface TeamStats {
  totalEmployees: number;
  working: number;
  onBreak: number;
  notStarted: number;
  finished: number;
  pendingApprovals: number;
  averageWorkTime: number;
}

export const WorkTimeRealtimeDashboard: React.FC = () => {
  const { user } = useAuth();

  // 状態管理
  const [employees, setEmployees] = useState<EmployeeStatus[]>([]);
  const [stats, setStats] = useState<TeamStats>({
    totalEmployees: 0,
    working: 0,
    onBreak: 0,
    notStarted: 0,
    finished: 0,
    pendingApprovals: 0,
    averageWorkTime: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  // 管理者権限チェック
  const isAdmin = user?.isAdmin || false;

  // データ読み込み
  useEffect(() => {
    if (isAdmin) {
      loadEmployeeStatuses();

      // 30秒ごとに自動更新
      const interval = setInterval(() => {
        loadEmployeeStatuses();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  // 従業員状況の読み込み（本番API対応）
  const loadEmployeeStatuses = async () => {
    try {
      setIsLoading(true);

      // 本番環境でのAPI呼び出し
      const response = await fetch('/api/worktime/employee-status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEmployees(data.data);
          return;
        }
      }

      // API接続失敗時は空の配列を設定
      console.warn('Employee status API not available');
      setEmployees([]);

      throw new Error('Employee status API is not available in production');
    } catch (error) {
      console.error('Failed to load employee statuses:', error);
      setEmployees([]);
      setError('従業員状況データの取得に失敗しました。管理者にお問い合わせください。');
    } finally {
      setIsLoading(false);
    }
  };

  // 手動更新
  const handleRefresh = () => {
    loadEmployeeStatuses();
  };

  // 時間フォーマット
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // 状態表示の設定
  const getStatusDisplay = (status: EmployeeStatus['status']) => {
    switch (status) {
      case 'not_started':
        return {
          label: '未出勤',
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          icon: <Clock className="h-4 w-4" />,
        };
      case 'working':
        return {
          label: '勤務中',
          color: 'bg-green-500',
          textColor: 'text-green-700',
          icon: <Timer className="h-4 w-4" />,
        };
      case 'on_break':
        return {
          label: '休憩中',
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          icon: <Coffee className="h-4 w-4" />,
        };
      case 'finished':
        return {
          label: '退勤済み',
          color: 'bg-blue-500',
          textColor: 'text-blue-700',
          icon: <Home className="h-4 w-4" />,
        };
      default:
        return {
          label: '不明',
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          icon: <Clock className="h-4 w-4" />,
        };
    }
  };

  // 管理者権限がない場合
  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">アクセス権限が必要です</h3>
        <p className="text-gray-600">この機能を利用するには管理者権限が必要です。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">リアルタイム勤務監視</h2>
          <p className="text-sm text-gray-600 mt-1">
            最終更新: {format(lastUpdate, 'HH:mm:ss', { locale: ja })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          更新
        </Button>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalEmployees}</div>
            <div className="text-sm text-gray-600">総従業員数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.working}</div>
            <div className="text-sm text-gray-600">勤務中</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.onBreak}</div>
            <div className="text-sm text-gray-600">休憩中</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.notStarted}</div>
            <div className="text-sm text-gray-600">未出勤</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.finished}</div>
            <div className="text-sm text-gray-600">退勤済み</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.pendingApprovals}</div>
            <div className="text-sm text-gray-600">承認待ち</div>
          </CardContent>
        </Card>
      </div>

      {/* 平均勤務時間 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <span className="font-medium">本日の平均勤務時間</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {formatTime(stats.averageWorkTime)}
          </div>
        </CardContent>
      </Card>

      {/* 従業員一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            従業員勤務状況
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">データを読み込み中...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((employee) => {
                const statusDisplay = getStatusDisplay(employee.status);

                return (
                  <div key={employee.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        {/* 基本情報 */}
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-lg">{employee.name}</span>
                          <Badge variant="outline">{employee.department}</Badge>
                          <Badge className={`${statusDisplay.color} text-white`}>
                            {statusDisplay.icon}
                            <span className="ml-1">{statusDisplay.label}</span>
                          </Badge>
                        </div>

                        {/* 勤務時間情報 */}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {employee.clockInTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              出勤: {format(employee.clockInTime, 'HH:mm', { locale: ja })}
                            </div>
                          )}
                          <div>勤務: {formatTime(employee.workDuration)}</div>
                          <div>休憩: {formatTime(employee.breakDuration)}</div>
                        </div>

                        {/* 位置情報 */}
                        {employee.currentLocation && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{employee.currentLocation.address}</span>
                            {employee.currentLocation.isWithinWorkArea ? (
                              <Badge variant="default" className="ml-2">
                                事業所内
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="ml-2">
                                事業所外
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 承認待ち警告 */}
                      {employee.pendingApprovals > 0 && (
                        <div className="text-right">
                          <Badge variant="destructive">
                            承認待ち {employee.pendingApprovals}件
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
