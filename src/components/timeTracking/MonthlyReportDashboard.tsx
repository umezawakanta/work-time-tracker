import { useAuth } from '@/hooks/useAuth';
/**
 * 📊 月次勤怠レポートダッシュボード
 * 月次統計、有給管理、エクスポート機能を含む包括的な勤怠レポート
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Calendar,
  Download,
  FileText,
  Clock,
  Coffee,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertCircle,
  CheckCircle2,
  Users,
  BarChart3,
  PieChart as PieChartIcon,
  FileSpreadsheet,
  Printer,
  Plus,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Timer,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import MonthlyTimesheetService from '@/services/timeTracking/MonthlyTimesheetService';

// インスタンス作成
const monthlyService = new MonthlyTimesheetService();

interface MonthlyReportDashboardProps {
  userId?: string;
}

export const MonthlyReportDashboard: React.FC<MonthlyReportDashboardProps> = ({ userId }) => {
  const { user } = useAuth();
  const resolvedUserId = userId || user?.id || user?._id || user?.uid || user?.email || '';
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [leaveRequest, setLeaveRequest] = useState({
    date: '',
    type: 'full_day',
    reason: '',
    hours: '',
  });

  // 月次データの取得
  const monthlyData = useMemo(() => {
    return monthlyService.getMonthlyTimesheet(
      resolvedUserId,
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1
    );
  }, [resolvedUserId, selectedDate]);

  // 月次比較データ
  const comparisonData = useMemo(() => {
    return monthlyService.generateMonthlyComparison(resolvedUserId, 6);
  }, [resolvedUserId]);

  // 有給休暇残高
  const leaveBalance = useMemo(() => {
    return monthlyService.calculateAnnualLeaveBalance(resolvedUserId);
  }, [resolvedUserId]);

  // 有給休暇記録
  const leaveRecords = useMemo(() => {
    return monthlyService.getPaidLeaveRecords(
      resolvedUserId,
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1
    );
  }, [resolvedUserId, selectedDate]);

  // 月を変更
  const changeMonth = (direction: 'prev' | 'next') => {
    setSelectedDate((current) =>
      direction === 'prev' ? subMonths(current, 1) : addMonths(current, 1)
    );
  };

  // 時間フォーマット
  const formatHours = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  // パーセンテージの色分け
  const getPercentageColor = (
    value: number,
    type: 'positive' | 'negative' = 'positive'
  ): string => {
    if (type === 'positive') {
      return value >= 90 ? 'text-green-600' : value >= 75 ? 'text-blue-600' : 'text-yellow-600';
    } else {
      return value >= 30 ? 'text-red-600' : value >= 15 ? 'text-yellow-600' : 'text-green-600';
    }
  };

  // トレンドアイコン
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-blue-600" />;
    }
  };

  // 有給申請提出
  const submitLeaveRequest = () => {
    monthlyService.submitPaidLeaveRequest({
      userId: resolvedUserId,
      date: new Date(leaveRequest.date),
      type: leaveRequest.type as any,
      reason: leaveRequest.reason,
      hours: leaveRequest.hours ? parseInt(leaveRequest.hours) : undefined,
    });

    setShowLeaveDialog(false);
    setLeaveRequest({ date: '', type: 'full_day', reason: '', hours: '' });
  };

  // CSVエクスポート
  const exportToCSV = () => {
    const csvData = monthlyService.exportToCSV(userId, {
      format: 'csv',
      includeCharts: false,
      includeRecommendations: true,
      period: 'current_month',
      language: 'ja',
    });

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `勤怠レポート_${format(selectedDate, 'yyyy年MM月', { locale: ja })}.csv`;
    link.click();
  };

  // 出勤率の円グラフデータ
  const attendanceChartData = monthlyData
    ? [
        { name: '出勤', value: monthlyData.actualWorkDays, color: '#3b82f6' },
        { name: '欠勤', value: monthlyData.absentDays, color: '#ef4444' },
      ]
    : [];

  if (!monthlyData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">選択された月のデータがありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            月次勤怠集計
          </h1>

          <div className="flex items-center gap-2 bg-white rounded-lg border p-2">
            <Button variant="ghost" size="sm" onClick={() => changeMonth('prev')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <span className="text-lg font-semibold min-w-[120px] text-center">
              {format(selectedDate, 'yyyy年MM月', { locale: ja })}
            </span>

            <Button variant="ghost" size="sm" onClick={() => changeMonth('next')}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                有給申請
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>有給休暇申請</DialogTitle>
                <DialogDescription>有給休暇の申請を行います</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="leave-date">取得日</Label>
                  <Input
                    id="leave-date"
                    type="date"
                    value={leaveRequest.date}
                    onChange={(e) => setLeaveRequest((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="leave-type">取得種別</Label>
                  <Select
                    value={leaveRequest.type}
                    onValueChange={(value) => setLeaveRequest((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_day">全日</SelectItem>
                      <SelectItem value="half_day_am">午前半休</SelectItem>
                      <SelectItem value="half_day_pm">午後半休</SelectItem>
                      <SelectItem value="hourly">時間単位</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {leaveRequest.type === 'hourly' && (
                  <div>
                    <Label htmlFor="leave-hours">時間数</Label>
                    <Input
                      id="leave-hours"
                      type="number"
                      min="1"
                      max="8"
                      value={leaveRequest.hours}
                      onChange={(e) =>
                        setLeaveRequest((prev) => ({ ...prev, hours: e.target.value }))
                      }
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="leave-reason">理由</Label>
                  <Textarea
                    id="leave-reason"
                    value={leaveRequest.reason}
                    onChange={(e) =>
                      setLeaveRequest((prev) => ({ ...prev, reason: e.target.value }))
                    }
                    placeholder="有給取得の理由を入力してください"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>
                  キャンセル
                </Button>
                <Button onClick={submitLeaveRequest}>申請する</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-1" />
            CSV出力
          </Button>
        </div>
      </div>

      {/* 概要カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 出勤率 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              出勤率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPercentageColor(monthlyData.attendanceRate)}`}>
              {monthlyData.attendanceRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {monthlyData.actualWorkDays}/{monthlyData.totalWorkDays}日出勤
            </p>
            <Progress value={monthlyData.attendanceRate} className="mt-2" />
          </CardContent>
        </Card>

        {/* 総労働時間 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              総労働時間
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatHours(monthlyData.totalWorkMinutes)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              平均: {formatHours(monthlyData.averageWorkMinutes)}/日
            </p>
          </CardContent>
        </Card>

        {/* 残業時間 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Timer className="h-4 w-4 text-orange-600" />
              残業時間
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getPercentageColor(monthlyData.overtimeRate, 'negative')}`}
            >
              {formatHours(monthlyData.totalOvertimeMinutes)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              残業率: {monthlyData.overtimeRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        {/* 勤務効率 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              勤務効率
              {getTrendIcon(monthlyData.monthlyTrend)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPercentageColor(monthlyData.efficiency)}`}>
              {monthlyData.efficiency.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600 mt-1 capitalize">
              {monthlyData.monthlyTrend === 'improving' && '改善傾向'}
              {monthlyData.monthlyTrend === 'declining' && '要注意'}
              {monthlyData.monthlyTrend === 'stable' && '安定'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* メインコンテンツ */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="trends">トレンド</TabsTrigger>
          <TabsTrigger value="leave">有給管理</TabsTrigger>
          <TabsTrigger value="details">詳細</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 出勤状況円グラフ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-blue-600" />
                  出勤状況
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={attendanceChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {attendanceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 勤務時間内訳 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  勤務時間内訳
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">通常勤務</span>
                    <span className="font-semibold">
                      {formatHours(monthlyData.totalWorkMinutes - monthlyData.totalOvertimeMinutes)}
                    </span>
                  </div>
                  <Progress
                    value={
                      ((monthlyData.totalWorkMinutes - monthlyData.totalOvertimeMinutes) /
                        monthlyData.totalWorkMinutes) *
                      100
                    }
                    className="h-2"
                  />

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">残業時間</span>
                    <span className="font-semibold text-orange-600">
                      {formatHours(monthlyData.totalOvertimeMinutes)}
                    </span>
                  </div>
                  <Progress
                    value={(monthlyData.totalOvertimeMinutes / monthlyData.totalWorkMinutes) * 100}
                    className="h-2"
                  />

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">休憩時間</span>
                    <span className="font-semibold text-blue-600">
                      {formatHours(monthlyData.totalBreakMinutes)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 推奨事項 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                推奨事項
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {monthlyData.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400"
                  >
                    <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-blue-800">{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {/* 月次比較トレンド */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                月次トレンド比較
              </CardTitle>
              <CardDescription>過去6ヶ月の勤務状況推移</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalHours"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="総労働時間"
                  />
                  <Line
                    type="monotone"
                    dataKey="overtimeHours"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="残業時間"
                  />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="効率(%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 有給残高 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-green-600" />
                  有給残高
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {leaveBalance.remaining}日
                    </div>
                    <p className="text-xs text-gray-600">残り日数</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{leaveBalance.used}日</div>
                    <p className="text-xs text-gray-600">使用済み</p>
                  </div>
                </div>

                <Progress
                  value={(leaveBalance.used / leaveBalance.totalEntitled) * 100}
                  className="h-3"
                />

                <p className="text-xs text-gray-600 text-center">
                  年間付与: {leaveBalance.totalEntitled}日 / 繰越可能: {leaveBalance.carryover}日
                </p>
              </CardContent>
            </Card>

            {/* 今月の有給使用 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-purple-600" />
                  今月の有給使用
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaveRecords.length > 0 ? (
                    leaveRecords.map((record, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {format(record.date, 'MM月dd日', { locale: ja })}
                          </p>
                          <p className="text-xs text-gray-600">{record.reason}</p>
                        </div>
                        <Badge
                          variant={record.approvalStatus === 'approved' ? 'default' : 'secondary'}
                        >
                          {record.type === 'full_day' && '全日'}
                          {record.type === 'half_day_am' && '午前半休'}
                          {record.type === 'half_day_pm' && '午後半休'}
                          {record.type === 'hourly' && `${record.hours}時間`}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">今月の有給使用はありません</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {/* 詳細統計 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">遅刻・早退</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">遅刻回数</span>
                    <span className="font-semibold">{monthlyData.lateCount}回</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">早退回数</span>
                    <span className="font-semibold">{monthlyData.earlyLeaveCount}回</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">平均時刻</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">到着時刻</span>
                    <span className="font-semibold">{monthlyData.averageArrivalTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">退社時刻</span>
                    <span className="font-semibold">{monthlyData.averageDepartureTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">特別休暇</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">使用日数</span>
                    <span className="font-semibold">{monthlyData.specialLeaveUsed}日</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">種別</span>
                    <span className="font-semibold text-xs">病気・慶弔等</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonthlyReportDashboard;
