import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  CheckCircle,
  XCircle,
  Clock,
  Edit3,
  User,
  Calendar,
  AlertTriangle,
  Eye,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Label } from '@/components/ui/label';

// 修正申請の型定義
interface CorrectionRequest {
  id: string;
  recordId: string;
  punchRecord: {
    type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
    timestamp: Date;
    location?: string;
    note?: string;
  };
  requestedBy: string;
  requestedByName: string;
  requestedAt: Date;
  reason: string;
  correctionType: 'time' | 'location' | 'type' | 'note';
  originalValue: any;
  correctedValue: any;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  priority: 'low' | 'medium' | 'high';
}

// 承認統計
interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  todayProcessed: number;
}

export const WorkTimeCorrectionApproval: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // 状態管理
  const [correctionRequests, setCorrectionRequests] = useState<CorrectionRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CorrectionRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<ApprovalStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
    todayProcessed: 0,
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'today' | 'yesterday'>('pending');

  // 管理者権限チェック
  const isAdmin = user?.isAdmin || false;

  // データ読み込み
  useEffect(() => {
    if (isAdmin) {
      loadCorrectionRequests();
      loadStats();
    }
  }, [isAdmin]);

  // 修正申請の読み込み
  const loadCorrectionRequests = async () => {
    try {
      // 模擬データの読み込み（実際の実装ではAPIコール）
      const mockRequests: CorrectionRequest[] = [
        {
          id: 'corr_1',
          recordId: 'record_1',
          punchRecord: {
            type: 'clock_in',
            timestamp: new Date('2024-01-15T09:00:00'),
            location: '東京都千代田区',
            note: '事業所内での出勤打刻',
          },
          requestedBy: 'user_1',
          requestedByName: '田中太郎',
          requestedAt: new Date('2024-01-15T10:00:00'),
          reason: '実際の出勤時刻は8:45でした。電車の遅延により遅れて打刻しました。',
          correctionType: 'time',
          originalValue: '09:00',
          correctedValue: '08:45',
          status: 'pending',
          priority: 'medium',
        },
        {
          id: 'corr_2',
          recordId: 'record_2',
          punchRecord: {
            type: 'break_start',
            timestamp: new Date('2024-01-16T12:00:00'),
            location: '東京都渋谷区',
            note: '事業所外での休憩開始',
          },
          requestedBy: 'user_2',
          requestedByName: '佐藤花子',
          requestedAt: new Date('2024-01-16T13:00:00'),
          reason: '客先訪問中のため事業所外で休憩を取りました。',
          correctionType: 'location',
          originalValue: '東京都渋谷区（事業所外）',
          correctedValue: '東京都新宿区（客先）',
          status: 'pending',
          priority: 'high',
        },
        {
          id: 'corr_3',
          recordId: 'record_3',
          punchRecord: {
            type: 'clock_out',
            timestamp: new Date('2024-01-14T18:30:00'),
            location: '東京都千代田区',
            note: '事業所内での退勤打刻',
          },
          requestedBy: 'user_3',
          requestedByName: '山田次郎',
          requestedAt: new Date('2024-01-15T09:00:00'),
          reason: '打刻を忘れており、実際の退勤時刻は18:00でした。',
          correctionType: 'time',
          originalValue: '18:30',
          correctedValue: '18:00',
          status: 'approved',
          approvedBy: user?.id,
          approvedAt: new Date('2024-01-15T10:00:00'),
          priority: 'low',
        },
      ];

      setCorrectionRequests(mockRequests);
    } catch (error) {
      console.error('修正申請の読み込みに失敗:', error);
    }
  };

  // 統計情報の読み込み
  const loadStats = async () => {
    try {
      const mockStats: ApprovalStats = {
        pending: 2,
        approved: 8,
        rejected: 1,
        total: 11,
        todayProcessed: 3,
      };

      setStats(mockStats);
    } catch (error) {
      console.error('統計情報の読み込みに失敗:', error);
    }
  };

  // 承認処理
  const handleApproval = async (requestId: string, approved: boolean, reason?: string) => {
    if (!user) return;

    setIsProcessing(true);

    try {
      // APIへの送信（模擬）
      await processCorrectionRequest(requestId, approved, reason);

      // ローカル状態の更新
      setCorrectionRequests((prev) =>
        prev.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: approved ? 'approved' : 'rejected',
                approvedBy: user.id,
                approvedAt: new Date(),
                rejectionReason: reason,
              }
            : request
        )
      );

      // 統計の更新
      setStats((prev) => ({
        ...prev,
        pending: prev.pending - 1,
        approved: approved ? prev.approved + 1 : prev.approved,
        rejected: approved ? prev.rejected : prev.rejected + 1,
        todayProcessed: prev.todayProcessed + 1,
      }));

      toast({
        title: approved ? '修正申請を承認しました' : '修正申請を却下しました',
        description: approved
          ? '従業員に承認通知が送信されました。'
          : '従業員に却下理由が送信されました。',
      });

      setSelectedRequest(null);
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

  // 修正申請の処理（模擬API）
  const processCorrectionRequest = async (
    requestId: string,
    approved: boolean,
    reason?: string
  ): Promise<void> => {
    // 模擬的な遅延
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 実際の実装ではサーバーAPIを呼び出し
    console.log('Processing correction request:', { requestId, approved, reason });
  };

  // 打刻タイプのラベル取得
  const getPunchTypeLabel = (type: CorrectionRequest['punchRecord']['type']): string => {
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

  // 修正項目のラベル取得
  const getCorrectionTypeLabel = (type: CorrectionRequest['correctionType']): string => {
    switch (type) {
      case 'time':
        return '時刻修正';
      case 'location':
        return '場所修正';
      case 'type':
        return 'タイプ修正';
      case 'note':
        return '備考修正';
      default:
        return '修正';
    }
  };

  // 優先度バッジの取得
  const getPriorityBadge = (priority: CorrectionRequest['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">緊急</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">普通</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">低</Badge>;
      default:
        return <Badge variant="secondary">不明</Badge>;
    }
  };

  // ステータスバッジの取得
  const getStatusBadge = (status: CorrectionRequest['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">承認済み</Badge>;
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">承認待ち</Badge>
        );
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">却下</Badge>;
      default:
        return <Badge variant="secondary">不明</Badge>;
    }
  };

  // フィルタリング
  const getFilteredRequests = () => {
    return correctionRequests.filter((request) => {
      switch (filter) {
        case 'pending':
          return request.status === 'pending';
        case 'today':
          return isToday(request.requestedAt);
        case 'yesterday':
          return isYesterday(request.requestedAt);
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

  const filteredRequests = getFilteredRequests();

  return (
    <div className="space-y-6">
      {/* ヘッダーと統計 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            修正申請承認管理
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">承認待ち</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">承認済み</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">却下済み</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">総申請数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.todayProcessed}</div>
              <div className="text-sm text-gray-600">今日処理済み</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* フィルター */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Select value={filter} onValueChange={(value: typeof filter) => setFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全ての申請</SelectItem>
                <SelectItem value="pending">承認待ち</SelectItem>
                <SelectItem value="today">今日の申請</SelectItem>
                <SelectItem value="yesterday">昨日の申請</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 修正申請リスト */}
      <Card>
        <CardHeader>
          <CardTitle>修正申請一覧（{filteredRequests.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              フィルター条件に一致する修正申請がありません。
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className={`border rounded-lg p-4 ${
                    request.status === 'pending' ? 'border-yellow-200 bg-yellow-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{request.requestedByName}</span>
                        </div>
                        {getCorrectionTypeLabel(request.correctionType)}
                        {getPriorityBadge(request.priority)}
                        {getStatusBadge(request.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">元の打刻記録</div>
                          <div className="bg-gray-100 rounded p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="h-3 w-3" />
                              <span className="text-sm">
                                {format(request.punchRecord.timestamp, 'MM/dd HH:mm')} -{' '}
                                {getPunchTypeLabel(request.punchRecord.type)}
                              </span>
                            </div>
                            {request.punchRecord.location && (
                              <div className="text-xs text-gray-600">
                                📍 {request.punchRecord.location}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-600 mb-1">修正内容</div>
                          <div className="bg-blue-50 rounded p-3">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-600">{request.originalValue}</span>
                              <ArrowRight className="h-3 w-3 text-blue-600" />
                              <span className="font-medium text-blue-800">
                                {request.correctedValue}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="text-sm text-gray-600 mb-1">修正理由</div>
                        <div className="text-sm bg-gray-50 rounded p-3">{request.reason}</div>
                      </div>

                      <div className="text-xs text-gray-500">
                        申請日時: {format(request.requestedAt, 'yyyy/MM/dd HH:mm', { locale: ja })}
                      </div>

                      {request.status === 'rejected' && request.rejectionReason && (
                        <div className="mt-3">
                          <div className="text-sm text-red-600 mb-1">却下理由</div>
                          <div className="text-sm bg-red-50 rounded p-3 text-red-800">
                            {request.rejectionReason}
                          </div>
                        </div>
                      )}
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => handleApproval(request.id, true)}
                          disabled={isProcessing}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          承認
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              disabled={isProcessing}
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              却下
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>修正申請の却下</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <div className="text-sm text-gray-600 mb-2">申請内容</div>
                                <div className="bg-gray-50 rounded p-3 text-sm">
                                  <div className="font-medium mb-1">
                                    {request.requestedByName} -{' '}
                                    {getCorrectionTypeLabel(request.correctionType)}
                                  </div>
                                  <div>
                                    {request.originalValue} → {request.correctedValue}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="rejection-reason">却下理由</Label>
                                <Textarea
                                  id="rejection-reason"
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="却下する理由を詳しく説明してください"
                                  rows={3}
                                />
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    if (selectedRequest) {
                                      handleApproval(selectedRequest.id, false, rejectionReason);
                                    }
                                  }}
                                  disabled={!rejectionReason.trim() || isProcessing}
                                  variant="destructive"
                                  className="flex-1"
                                >
                                  却下する
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedRequest(null);
                                    setRejectionReason('');
                                  }}
                                >
                                  キャンセル
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
