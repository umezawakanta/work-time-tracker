import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  Calendar,
  AlertTriangle,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { ja } from 'date-fns/locale';

// 打刻記録の型定義（WorkTimePunchSystemと同じ）
interface PunchRecord {
  id: string;
  userId: string;
  userName?: string;
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
  rejectionReason?: string;
}

// ユーザー情報
interface UserInfo {
  id: string;
  name: string;
  department: string;
  position: string;
  workLocation: string;
}

// 承認統計
interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export const WorkTimeApprovalSystem: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // 状態管理
  const [pendingRecords, setPendingRecords] = useState<PunchRecord[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<PunchRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<ApprovalStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [filter, setFilter] = useState<'all' | 'today' | 'yesterday' | 'pending'>('pending');

  // 管理者権限チェック
  const isAdmin = user?.isAdmin || false;

  // データ読み込み
  useEffect(() => {
    if (isAdmin) {
      loadPendingRecords();
      loadUsers();
      loadStats();
    }
  }, [isAdmin]);

  // 承認待ち記録の読み込み
  const loadPendingRecords = async () => {
    try {
      // 実際の実装ではAPIから取得
      const mockRecords: PunchRecord[] = [
        {
          id: 'record_1',
          userId: 'user_1',
          userName: '田中太郎',
          type: 'clock_in',
          timestamp: new Date(2024, 0, 15, 9, 15, 0),
          location: {
            latitude: 35.6812,
            longitude: 139.7671,
            address: '東京都千代田区丸の内1-1-1',
          },
          status: 'pending',
          note: '電車遅延により遅刻',
        },
        {
          id: 'record_2',
          userId: 'user_2',
          userName: '佐藤花子',
          type: 'clock_out',
          timestamp: new Date(2024, 0, 15, 18, 45, 0),
          location: {
            latitude: 35.685,
            longitude: 139.75,
            address: '東京都港区赤坂2-2-2',
          },
          status: 'pending',
          note: '客先での直帰',
        },
      ];

      setPendingRecords(mockRecords);
    } catch (error) {
      toast({
        title: 'エラー',
        description: '承認待ち記録の読み込みに失敗しました。',
        variant: 'destructive',
      });
    }
  };

  // ユーザー情報の読み込み
  const loadUsers = async () => {
    try {
      const mockUsers: UserInfo[] = [
        {
          id: 'user_1',
          name: '田中太郎',
          department: '営業部',
          position: '主任',
          workLocation: '本社',
        },
        {
          id: 'user_2',
          name: '佐藤花子',
          department: '開発部',
          position: 'エンジニア',
          workLocation: '支社',
        },
      ];

      setUsers(mockUsers);
    } catch (error) {
      console.error('ユーザー情報の読み込みに失敗:', error);
    }
  };

  // 統計情報の読み込み
  const loadStats = async () => {
    try {
      const mockStats: ApprovalStats = {
        pending: 5,
        approved: 23,
        rejected: 2,
        total: 30,
      };

      setStats(mockStats);
    } catch (error) {
      console.error('統計情報の読み込みに失敗:', error);
    }
  };

  // 承認処理
  const handleApproval = async (recordId: string, approved: boolean, reason?: string) => {
    if (!user) return;

    setIsProcessing(true);

    try {
      const updatedRecord: Partial<PunchRecord> = {
        status: approved ? 'approved' : 'rejected',
        approvedBy: user.id,
        approvedAt: new Date(),
        rejectionReason: reason,
      };

      // APIへの送信（模擬）
      await updatePunchRecord(recordId, updatedRecord);

      // ローカル状態の更新
      setPendingRecords((prev) => prev.filter((record) => record.id !== recordId));

      // 統計の更新
      setStats((prev) => ({
        ...prev,
        pending: prev.pending - 1,
        approved: approved ? prev.approved + 1 : prev.approved,
        rejected: approved ? prev.rejected : prev.rejected + 1,
      }));

      toast({
        title: approved ? '承認完了' : '却下完了',
        description: approved ? '打刻記録を承認しました。' : '打刻記録を却下しました。',
      });

      setSelectedRecord(null);
      setRejectionReason('');
    } catch (error) {
      toast({
        title: 'エラー',
        description: '承認処理に失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 打刻記録の更新（模擬API）
  const updatePunchRecord = async (
    recordId: string,
    updates: Partial<PunchRecord>
  ): Promise<void> => {
    // 模擬的な遅延
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 実際の実装ではサーバーAPIを呼び出し
    console.log('Updating punch record:', recordId, updates);
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

  // 日付フィルター
  const getFilteredRecords = () => {
    return pendingRecords.filter((record) => {
      switch (filter) {
        case 'today':
          return isToday(record.timestamp);
        case 'yesterday':
          return isYesterday(record.timestamp);
        case 'pending':
          return record.status === 'pending';
        default:
          return true;
      }
    });
  };

  // 管理者権限がない場合
  if (!isAdmin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>アクセス権限なし</AlertTitle>
        <AlertDescription>この機能を利用するには管理者権限が必要です。</AlertDescription>
      </Alert>
    );
  }

  const filteredRecords = getFilteredRecords();

  return (
    <div className="space-y-6">
      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">承認待ち</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">承認済み</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">却下</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">合計</div>
          </CardContent>
        </Card>
      </div>

      {/* フィルター */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            {[
              { key: 'pending', label: '承認待ち' },
              { key: 'today', label: '今日' },
              { key: 'yesterday', label: '昨日' },
              { key: 'all', label: 'すべて' },
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={filter === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(key as typeof filter)}
              >
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 承認待ち一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            打刻承認管理 ({filteredRecords.length}件)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">承認待ちの記録はありません</div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => {
                const userInfo = users.find((u) => u.id === record.userId);

                return (
                  <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        {/* ユーザー情報 */}
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{record.userName}</span>
                          {userInfo && (
                            <Badge variant="outline">
                              {userInfo.department} - {userInfo.position}
                            </Badge>
                          )}
                        </div>

                        {/* 打刻情報 */}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(record.timestamp, 'MM/dd HH:mm:ss', { locale: ja })}
                          </div>
                          <Badge>{getPunchTypeLabel(record.type)}</Badge>
                        </div>

                        {/* 位置情報 */}
                        {record.location && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            {record.location.address}
                          </div>
                        )}

                        {/* 備考 */}
                        {record.note && (
                          <div className="flex items-start gap-1 text-sm">
                            <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                            <span className="text-gray-700">{record.note}</span>
                          </div>
                        )}
                      </div>

                      {/* アクション */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRecord(record)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          詳細
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApproval(record.id, true)}
                          disabled={isProcessing}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          承認
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setSelectedRecord(record)}
                          disabled={isProcessing}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          却下
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 詳細・却下理由入力モーダル */}
      {selectedRecord && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>打刻記録詳細</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">従業員</label>
                <div className="text-sm text-gray-600">{selectedRecord.userName}</div>
              </div>
              <div>
                <label className="text-sm font-medium">打刻種別</label>
                <div className="text-sm text-gray-600">
                  {getPunchTypeLabel(selectedRecord.type)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">打刻時刻</label>
                <div className="text-sm text-gray-600">
                  {format(selectedRecord.timestamp, 'yyyy/MM/dd HH:mm:ss', { locale: ja })}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">位置情報</label>
                <div className="text-sm text-gray-600">
                  {selectedRecord.location?.address || '位置情報なし'}
                </div>
              </div>
            </div>

            {selectedRecord.note && (
              <div>
                <label className="text-sm font-medium">備考</label>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {selectedRecord.note}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">却下理由（却下する場合のみ）</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="却下する理由を入力してください"
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRecord(null);
                  setRejectionReason('');
                }}
              >
                キャンセル
              </Button>
              <Button
                variant="default"
                onClick={() => handleApproval(selectedRecord.id, true)}
                disabled={isProcessing}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                承認
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleApproval(selectedRecord.id, false, rejectionReason)}
                disabled={isProcessing || !rejectionReason.trim()}
              >
                <XCircle className="h-4 w-4 mr-1" />
                却下
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
