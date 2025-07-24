import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Clock,
  Edit3,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Search,
  Filter,
  Download,
  History,
  MessageSquare,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isToday, isYesterday } from 'date-fns';
import { ja } from 'date-fns/locale';

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
  correctionRequests?: CorrectionRequest[];
  hasCorrections?: boolean;
}

// 修正申請の型定義
interface CorrectionRequest {
  id: string;
  recordId: string;
  requestedBy: string;
  requestedAt: Date;
  reason: string;
  correctionType: 'time' | 'location' | 'type' | 'note';
  originalValue: any;
  correctedValue: any;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

// フィルター設定
interface FilterOptions {
  dateRange: 'today' | 'yesterday' | 'week' | 'month' | 'custom';
  status: 'all' | 'pending' | 'approved' | 'rejected';
  type: 'all' | 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  hasCorrectionRequests: boolean;
  customStartDate?: string;
  customEndDate?: string;
}

export const WorkTimeHistoryManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // 状態管理
  const [records, setRecords] = useState<PunchRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<PunchRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<PunchRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // フィルター設定
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'month',
    status: 'all',
    type: 'all',
    hasCorrectionRequests: false,
  });

  // 修正申請フォーム
  const [correctionForm, setCorrectionForm] = useState({
    reason: '',
    correctionType: 'time' as CorrectionRequest['correctionType'],
    correctedValue: '',
  });

  // データ読み込み
  useEffect(() => {
    loadWorkTimeHistory();
  }, [user]);

  // フィルタリング処理
  useEffect(() => {
    applyFilters();
  }, [records, filters, searchQuery]);

  // 勤怠履歴の読み込み
  const loadWorkTimeHistory = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // 模擬データの読み込み（実際の実装ではAPIコール）
      const mockRecords: PunchRecord[] = [
        {
          id: 'record_1',
          userId: user.id,
          type: 'clock_in',
          timestamp: new Date('2024-01-15T09:00:00'),
          location: {
            latitude: 35.6812,
            longitude: 139.7671,
            address: '東京都千代田区',
          },
          status: 'approved',
          note: '事業所内での出勤打刻',
          correctionRequests: [
            {
              id: 'corr_1',
              recordId: 'record_1',
              requestedBy: user.id,
              requestedAt: new Date('2024-01-15T10:00:00'),
              reason: '実際の出勤時刻は8:45でした',
              correctionType: 'time',
              originalValue: '09:00',
              correctedValue: '08:45',
              status: 'approved',
              approvedBy: 'admin_1',
              approvedAt: new Date('2024-01-15T11:00:00'),
            },
          ],
          hasCorrections: true,
        },
        {
          id: 'record_2',
          userId: user.id,
          type: 'clock_out',
          timestamp: new Date('2024-01-15T18:00:00'),
          location: {
            latitude: 35.6812,
            longitude: 139.7671,
            address: '東京都千代田区',
          },
          status: 'approved',
          note: '事業所内での退勤打刻',
        },
        {
          id: 'record_3',
          userId: user.id,
          type: 'break_start',
          timestamp: new Date('2024-01-16T12:00:00'),
          location: {
            latitude: 35.6895,
            longitude: 139.6917,
            address: '東京都渋谷区',
          },
          status: 'pending',
          note: '事業所外での休憩開始（要承認）',
        },
      ];

      setRecords(mockRecords);
    } catch (error) {
      toast({
        title: 'エラー',
        description: '勤怠履歴の読み込みに失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // フィルター適用
  const applyFilters = () => {
    let filtered = [...records];

    // 日付範囲フィルター
    const now = new Date();
    switch (filters.dateRange) {
      case 'today':
        filtered = filtered.filter((record) => isToday(record.timestamp));
        break;
      case 'yesterday':
        filtered = filtered.filter((record) => isYesterday(record.timestamp));
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((record) => record.timestamp >= weekAgo);
        break;
      case 'month':
        filtered = filtered.filter(
          (record) => record.timestamp >= startOfMonth(now) && record.timestamp <= endOfMonth(now)
        );
        break;
      case 'custom':
        if (filters.customStartDate && filters.customEndDate) {
          const start = new Date(filters.customStartDate);
          const end = new Date(filters.customEndDate);
          filtered = filtered.filter(
            (record) => record.timestamp >= start && record.timestamp <= end
          );
        }
        break;
    }

    // ステータスフィルター
    if (filters.status !== 'all') {
      filtered = filtered.filter((record) => record.status === filters.status);
    }

    // タイプフィルター
    if (filters.type !== 'all') {
      filtered = filtered.filter((record) => record.type === filters.type);
    }

    // 修正申請フィルター
    if (filters.hasCorrectionRequests) {
      filtered = filtered.filter((record) => record.hasCorrections);
    }

    // 検索クエリフィルター
    if (searchQuery) {
      filtered = filtered.filter(
        (record) =>
          record.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          getPunchTypeLabel(record.type).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  };

  // 修正申請の送信
  const handleCorrectionRequest = async () => {
    if (!selectedRecord || !correctionForm.reason.trim()) {
      toast({
        title: 'エラー',
        description: '修正理由を入力してください。',
        variant: 'destructive',
      });
      return;
    }

    try {
      const correctionRequest: CorrectionRequest = {
        id: `corr_${Date.now()}`,
        recordId: selectedRecord.id,
        requestedBy: user?.id || '',
        requestedAt: new Date(),
        reason: correctionForm.reason,
        correctionType: correctionForm.correctionType,
        originalValue: getOriginalValue(selectedRecord, correctionForm.correctionType),
        correctedValue: correctionForm.correctedValue,
        status: 'pending',
      };

      // 模擬API送信
      await submitCorrectionRequest(correctionRequest);

      // ローカル状態の更新
      setRecords((prev) =>
        prev.map((record) =>
          record.id === selectedRecord.id
            ? {
                ...record,
                correctionRequests: [...(record.correctionRequests || []), correctionRequest],
                hasCorrections: true,
              }
            : record
        )
      );

      toast({
        title: '修正申請完了',
        description: '修正申請を送信しました。管理者の承認をお待ちください。',
      });

      setShowCorrectionDialog(false);
      setSelectedRecord(null);
      setCorrectionForm({ reason: '', correctionType: 'time', correctedValue: '' });
    } catch (error) {
      toast({
        title: 'エラー',
        description: '修正申請の送信に失敗しました。',
        variant: 'destructive',
      });
    }
  };

  // 元の値を取得
  const getOriginalValue = (record: PunchRecord, type: CorrectionRequest['correctionType']) => {
    switch (type) {
      case 'time':
        return format(record.timestamp, 'HH:mm');
      case 'location':
        return record.location?.address || '';
      case 'type':
        return record.type;
      case 'note':
        return record.note || '';
      default:
        return '';
    }
  };

  // 修正申請の送信（模擬API）
  const submitCorrectionRequest = async (request: CorrectionRequest): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Correction request submitted:', request);
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

  // ステータスバッジの取得
  const getStatusBadge = (status: PunchRecord['status']) => {
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

  // CSVエクスポート
  const handleExportCSV = () => {
    const csvContent = [
      ['日時', 'タイプ', 'ステータス', '場所', '備考'],
      ...filteredRecords.map((record) => [
        format(record.timestamp, 'yyyy-MM-dd HH:mm'),
        getPunchTypeLabel(record.type),
        record.status === 'approved'
          ? '承認済み'
          : record.status === 'pending'
            ? '承認待ち'
            : '却下',
        record.location?.address || '',
        record.note || '',
      ]),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `勤怠履歴_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダーと統計 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            勤怠履歴管理
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{records.length}</div>
              <div className="text-sm text-gray-600">総打刻数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {records.filter((r) => r.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">承認済み</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {records.filter((r) => r.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">承認待ち</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {records.filter((r) => r.hasCorrections).length}
              </div>
              <div className="text-sm text-gray-600">修正申請</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 検索・フィルター */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* 検索 */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="場所、備考で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 期間フィルター */}
            <Select
              value={filters.dateRange}
              onValueChange={(value: FilterOptions['dateRange']) =>
                setFilters((prev) => ({ ...prev, dateRange: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">今日</SelectItem>
                <SelectItem value="yesterday">昨日</SelectItem>
                <SelectItem value="week">過去1週間</SelectItem>
                <SelectItem value="month">今月</SelectItem>
                <SelectItem value="custom">カスタム期間</SelectItem>
              </SelectContent>
            </Select>

            {/* ステータスフィルター */}
            <Select
              value={filters.status}
              onValueChange={(value: FilterOptions['status']) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全ステータス</SelectItem>
                <SelectItem value="approved">承認済み</SelectItem>
                <SelectItem value="pending">承認待ち</SelectItem>
                <SelectItem value="rejected">却下</SelectItem>
              </SelectContent>
            </Select>

            {/* エクスポートボタン */}
            <Button onClick={handleExportCSV} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              CSV出力
            </Button>
          </div>

          {/* カスタム期間選択 */}
          {filters.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="start-date">開始日</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={filters.customStartDate || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, customStartDate: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="end-date">終了日</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={filters.customEndDate || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, customEndDate: e.target.value }))
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 打刻履歴リスト */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>打刻履歴（{filteredRecords.length}件）</span>
            <Button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  hasCorrectionRequests: !prev.hasCorrectionRequests,
                }))
              }
              variant={filters.hasCorrectionRequests ? 'default' : 'outline'}
              size="sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              修正申請のみ
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              フィルター条件に一致する記録が見つかりません。
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {format(record.timestamp, 'MM/dd HH:mm', { locale: ja })}
                        </span>
                      </div>
                      <Badge variant="outline">{getPunchTypeLabel(record.type)}</Badge>
                      {getStatusBadge(record.status)}
                      {record.hasCorrections && (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          修正申請あり
                        </Badge>
                      )}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRecord(record)}
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          修正申請
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>打刻記録の修正申請</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="correction-type">修正項目</Label>
                            <Select
                              value={correctionForm.correctionType}
                              onValueChange={(value: CorrectionRequest['correctionType']) =>
                                setCorrectionForm((prev) => ({ ...prev, correctionType: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="time">時刻</SelectItem>
                                <SelectItem value="location">場所</SelectItem>
                                <SelectItem value="type">打刻タイプ</SelectItem>
                                <SelectItem value="note">備考</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="original-value">現在の値</Label>
                            <Input
                              id="original-value"
                              value={getOriginalValue(record, correctionForm.correctionType)}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>

                          <div>
                            <Label htmlFor="corrected-value">修正後の値</Label>
                            <Input
                              id="corrected-value"
                              value={correctionForm.correctedValue}
                              onChange={(e) =>
                                setCorrectionForm((prev) => ({
                                  ...prev,
                                  correctedValue: e.target.value,
                                }))
                              }
                              placeholder="修正後の値を入力"
                            />
                          </div>

                          <div>
                            <Label htmlFor="reason">修正理由</Label>
                            <Textarea
                              id="reason"
                              value={correctionForm.reason}
                              onChange={(e) =>
                                setCorrectionForm((prev) => ({ ...prev, reason: e.target.value }))
                              }
                              placeholder="修正が必要な理由を詳しく説明してください"
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button onClick={handleCorrectionRequest} className="flex-1">
                              修正申請を送信
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowCorrectionDialog(false);
                                setSelectedRecord(null);
                                setCorrectionForm({
                                  reason: '',
                                  correctionType: 'time',
                                  correctedValue: '',
                                });
                              }}
                            >
                              キャンセル
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="mt-2 space-y-1">
                    {record.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {record.location.address}
                      </div>
                    )}
                    {record.note && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MessageSquare className="h-3 w-3" />
                        {record.note}
                      </div>
                    )}
                  </div>

                  {/* 修正申請履歴 */}
                  {record.correctionRequests && record.correctionRequests.length > 0 && (
                    <div className="mt-3 border-t pt-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">修正申請履歴</div>
                      <div className="space-y-2">
                        {record.correctionRequests.map((correction) => (
                          <div key={correction.id} className="bg-gray-50 rounded p-3 text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">
                                {correction.correctionType === 'time'
                                  ? '時刻修正'
                                  : correction.correctionType === 'location'
                                    ? '場所修正'
                                    : correction.correctionType === 'type'
                                      ? 'タイプ修正'
                                      : '備考修正'}
                              </span>
                              <Badge
                                className={
                                  correction.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : correction.status === 'rejected'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                }
                              >
                                {correction.status === 'approved'
                                  ? '承認済み'
                                  : correction.status === 'rejected'
                                    ? '却下'
                                    : '承認待ち'}
                              </Badge>
                            </div>
                            <div className="text-gray-600">
                              {correction.originalValue} → {correction.correctedValue}
                            </div>
                            <div className="text-gray-600 mt-1">理由: {correction.reason}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              申請日時: {format(correction.requestedAt, 'MM/dd HH:mm')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
