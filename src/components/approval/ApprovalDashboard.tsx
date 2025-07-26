/**
 * 📋 承認ワークフローダッシュボード
 * 勤怠データ承認申請・管理者承認・差し戻し・修正申請機能
 * ADHD/ASD特性配慮のコミュニケーション最適化
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
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
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  MessageSquare,
  Eye,
  Calendar,
  User,
  Users,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Download,
  Upload,
  Filter,
  Search,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Shield,
  Heart,
  Brain,
  Target,
  Star,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  HelpCircle,
  Settings,
  Plus,
  Edit,
  Trash2,
  Reply,
  Forward,
  Archive,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import ApprovalWorkflowService from '@/services/approval/ApprovalWorkflowService';
import { toast } from 'react-hot-toast';

// インスタンス作成
const approvalService = new ApprovalWorkflowService();

interface ApprovalDashboardProps {
  userId?: string;
  userRole?: string;
}

export const ApprovalDashboard: React.FC<ApprovalDashboardProps> = ({
  userId = 'demo-user',
  userRole = 'employee',
}) => {
  // State
  const [activeTab, setActiveTab] = useState<
    'overview' | 'my-requests' | 'pending-approvals' | 'history'
  >('overview');
  const [myRequests, setMyRequests] = useState(approvalService.getUserRequests(userId));
  const [pendingApprovals, setPendingApprovals] = useState(
    approvalService.getPendingApprovals(userId)
  );
  const [approvalHistory, setApprovalHistory] = useState(
    approvalService.getApprovalHistory(userId)
  );
  const [statistics, setStatistics] = useState(approvalService.getApprovalStatistics(userId));

  // Dialogs
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Form state
  const [newRequestForm, setNewRequestForm] = useState({
    type: 'timesheet',
    title: '',
    description: '',
    urgency: 'medium',
    targetData: {},
  });

  const [approvalForm, setApprovalForm] = useState({
    decision: 'approve',
    comments: '',
    conditions: [] as string[],
  });

  // Filters
  const [requestFilter, setRequestFilter] = useState({
    status: 'all',
    type: 'all',
    urgency: 'all',
    dateRange: '30',
  });

  // 権限チェック
  const isApprover = ['supervisor', 'manager', 'hr', 'admin'].includes(userRole);
  const isAdmin = ['admin', 'hr'].includes(userRole);

  // データ更新
  const refreshData = () => {
    setMyRequests(approvalService.getUserRequests(userId));
    if (isApprover) {
      setPendingApprovals(approvalService.getPendingApprovals(userId));
    }
    setApprovalHistory(approvalService.getApprovalHistory(userId));
    setStatistics(approvalService.getApprovalStatistics(userId));
  };

  useEffect(() => {
    refreshData();

    // サービスのイベントリスナー
    const handleRequestCreated = () => refreshData();
    const handleDecisionProcessed = () => refreshData();

    approvalService.on('requestCreated', handleRequestCreated);
    approvalService.on('decisionProcessed', handleDecisionProcessed);

    return () => {
      approvalService.off('requestCreated', handleRequestCreated);
      approvalService.off('decisionProcessed', handleDecisionProcessed);
    };
  }, [userId, userRole]);

  // フィルタリングされた申請
  const filteredRequests = useMemo(() => {
    return myRequests.filter((request) => {
      if (requestFilter.status !== 'all' && request.status !== requestFilter.status) return false;
      if (requestFilter.type !== 'all' && request.type !== requestFilter.type) return false;
      if (requestFilter.urgency !== 'all' && request.urgency !== requestFilter.urgency)
        return false;

      const daysSinceSubmission = Math.floor(
        (Date.now() - request.submittedAt.getTime()) / (24 * 60 * 60 * 1000)
      );
      if (
        requestFilter.dateRange !== 'all' &&
        daysSinceSubmission > parseInt(requestFilter.dateRange)
      )
        return false;

      return true;
    });
  }, [myRequests, requestFilter]);

  // 新規申請を作成
  const createNewRequest = () => {
    if (!newRequestForm.title || !newRequestForm.description) {
      toast.error('タイトルと説明を入力してください');
      return;
    }

    const requestId = approvalService.createApprovalRequest({
      userId,
      type: newRequestForm.type as any,
      targetData: newRequestForm.targetData,
      submittedBy: userId,
      title: newRequestForm.title,
      description: newRequestForm.description,
      urgency: newRequestForm.urgency as any,
      attachments: [],
      approvalFlow: generateApprovalFlow(newRequestForm.type),
      comments: [],
      notifications: [],
      cognitiveSupport: {
        structuredFormat: true,
        reminderSettings: {
          enabled: true,
          frequency: 2,
          escalationDays: 3,
        },
        clarificationSupport: true,
        visualAids: true,
      },
    });

    toast.success('承認申請を作成しました');
    setShowNewRequestDialog(false);
    setNewRequestForm({
      type: 'timesheet',
      title: '',
      description: '',
      urgency: 'medium',
      targetData: {},
    });
    refreshData();
  };

  // 承認フローを生成
  const generateApprovalFlow = (type: string) => {
    // 簡略化されたフロー生成
    const baseFlow = [
      {
        id: 'step-1',
        stepNumber: 1,
        approverRole: 'supervisor' as const,
        approverIds: ['supervisor-1'],
        requiredApprovals: 1,
        currentApprovals: [],
        status: 'pending' as const,
      },
    ];

    if (type === 'timesheet' || type === 'overtime') {
      baseFlow.push({
        id: 'step-2',
        stepNumber: 2,
        approverRole: 'hr' as const,
        approverIds: ['hr-1'],
        requiredApprovals: 1,
        currentApprovals: [],
        status: 'pending' as const,
      });
    }

    return baseFlow;
  };

  // 承認決定を処理
  const processApproval = () => {
    if (!selectedRequest || !approvalForm.comments) {
      toast.error('コメントを入力してください');
      return;
    }

    const success = approvalService.processApprovalDecision(selectedRequest.id, userId, {
      approverId: userId,
      decision: approvalForm.decision as any,
      comments: approvalForm.comments,
      conditions: approvalForm.conditions,
    });

    if (success) {
      toast.success('承認処理を完了しました');
      setShowApprovalDialog(false);
      setSelectedRequest(null);
      setApprovalForm({
        decision: 'approve',
        comments: '',
        conditions: [],
      });
      refreshData();
    } else {
      toast.error('承認処理に失敗しました');
    }
  };

  // ステータス表示用関数
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_review':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'withdrawn':
        return <RotateCcw className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 統計チャートデータ
  const approvalTrendData = approvalHistory
    .map((h) => ({
      month: h.month,
      approved: h.approved,
      rejected: h.rejected,
      pending: h.pending,
      total: h.totalRequests,
    }))
    .reverse();

  const statusDistributionData = [
    { name: '承認済み', value: statistics.approved, color: '#10b981' },
    { name: '拒否', value: statistics.rejected, color: '#ef4444' },
    { name: '審査中', value: statistics.pending, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            承認ワークフロー
          </h1>
          <p className="text-gray-600 mt-1">
            {isApprover ? '申請の承認管理と個人申請の管理' : '勤怠データと各種申請の承認管理'}
          </p>
        </div>

        <Button onClick={() => setShowNewRequestDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />
          新規申請
        </Button>
      </div>

      {/* 概要統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              総申請数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.total}</div>
            <p className="text-xs text-gray-600 mt-1">今月: {statistics.thisMonth}件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              承認率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics.total > 0
                ? Math.round((statistics.approved / statistics.total) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-gray-600 mt-1">{statistics.approved}件承認済み</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              平均承認時間
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statistics.averageApprovalTime}時間
            </div>
            <p className="text-xs text-gray-600 mt-1">全申請平均</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              コンプライアンス
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{statistics.complianceRate}%</div>
            <p className="text-xs text-gray-600 mt-1">期限内提出率</p>
          </CardContent>
        </Card>
      </div>

      {/* メインコンテンツ */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="my-requests">自分の申請 ({myRequests.length})</TabsTrigger>
          {isApprover && (
            <TabsTrigger value="pending-approvals">
              承認待ち ({pendingApprovals.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="history">履歴・分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* 重要な通知 */}
          {pendingApprovals.length > 0 && isApprover && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>承認待ちの申請があります</AlertTitle>
              <AlertDescription>
                {pendingApprovals.length}
                件の申請が承認を待っています。緊急度の高いものから確認してください。
              </AlertDescription>
            </Alert>
          )}

          {/* 承認フローの視覚化 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-blue-600" />
                承認フロー概要
              </CardTitle>
              <CardDescription>現在のシステムでの標準的な承認フロー</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 勤怠承認フロー */}
                <div>
                  <h4 className="font-medium text-sm mb-3">勤怠データ承認</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">申請者</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">上司</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">人事</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">完了</span>
                    </div>
                  </div>
                </div>

                {/* 有給申請フロー */}
                <div>
                  <h4 className="font-medium text-sm mb-3">有給申請</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">申請者</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">上司</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">完了</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ADHD/ASD配慮機能 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                ADHD/ASD配慮機能
              </CardTitle>
              <CardDescription>認知特性に配慮した承認ワークフロー機能</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-sm">構造化された申請フォーム</h4>
                      <p className="text-xs text-gray-600">明確な項目と順序で迷いを軽減</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-sm">視覚的進捗表示</h4>
                      <p className="text-xs text-gray-600">現在の状況が一目で分かる</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-sm">適応的リマインダー</h4>
                      <p className="text-xs text-gray-600">個人のペースに合わせた通知</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-sm">明確な期限表示</h4>
                      <p className="text-xs text-gray-600">時間管理をサポート</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-sm">支援的コミュニケーション</h4>
                      <p className="text-xs text-gray-600">理解しやすい言葉遣い</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-sm">エラー防止支援</h4>
                      <p className="text-xs text-gray-600">入力ミスを事前に検出</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-requests" className="space-y-4">
          {/* フィルター */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                フィルター
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="statusFilter">ステータス</Label>
                  <Select
                    value={requestFilter.status}
                    onValueChange={(value) =>
                      setRequestFilter((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="submitted">提出済み</SelectItem>
                      <SelectItem value="in_review">審査中</SelectItem>
                      <SelectItem value="approved">承認済み</SelectItem>
                      <SelectItem value="rejected">拒否</SelectItem>
                      <SelectItem value="withdrawn">撤回</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="typeFilter">申請タイプ</Label>
                  <Select
                    value={requestFilter.type}
                    onValueChange={(value) =>
                      setRequestFilter((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="timesheet">勤怠データ</SelectItem>
                      <SelectItem value="leave_request">有給申請</SelectItem>
                      <SelectItem value="overtime">残業申請</SelectItem>
                      <SelectItem value="correction">修正申請</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="urgencyFilter">緊急度</Label>
                  <Select
                    value={requestFilter.urgency}
                    onValueChange={(value) =>
                      setRequestFilter((prev) => ({ ...prev, urgency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="urgent">緊急</SelectItem>
                      <SelectItem value="high">高</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="low">低</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dateFilter">期間</Label>
                  <Select
                    value={requestFilter.dateRange}
                    onValueChange={(value) =>
                      setRequestFilter((prev) => ({ ...prev, dateRange: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="7">過去7日</SelectItem>
                      <SelectItem value="30">過去30日</SelectItem>
                      <SelectItem value="90">過去3ヶ月</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 申請一覧 */}
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">申請がありません</p>
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{request.title}</h3>
                          <Badge variant="outline" className={getStatusColor(request.status)}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1">
                              {request.status === 'approved' && '承認済み'}
                              {request.status === 'rejected' && '拒否'}
                              {request.status === 'in_review' && '審査中'}
                              {request.status === 'withdrawn' && '撤回'}
                              {request.status === 'submitted' && '提出済み'}
                            </span>
                          </Badge>
                          <Badge variant="outline" className={getUrgencyColor(request.urgency)}>
                            {request.urgency === 'urgent' && '緊急'}
                            {request.urgency === 'high' && '高'}
                            {request.urgency === 'medium' && '中'}
                            {request.urgency === 'low' && '低'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{request.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(request.submittedAt, 'yyyy/MM/dd HH:mm', { locale: ja })}
                          </span>
                          {request.deadline && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              期限: {format(request.deadline, 'yyyy/MM/dd', { locale: ja })}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            // 詳細表示ダイアログを開く（実装省略）
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          詳細
                        </Button>
                        {request.status === 'submitted' || request.status === 'in_review' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const success = approvalService.withdrawRequest(request.id, userId);
                              if (success) {
                                toast.success('申請を撤回しました');
                                refreshData();
                              }
                            }}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            撤回
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    {/* 承認進捗 */}
                    {request.status === 'in_review' && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-sm mb-2">承認進捗</h4>
                        <div className="flex items-center gap-2">
                          {request.approvalFlow.map((step, index) => (
                            <React.Fragment key={step.id}>
                              <div
                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                                  step.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : step.status === 'pending' &&
                                        index === request.currentStepIndex
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {step.status === 'approved' ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : step.status === 'pending' &&
                                  index === request.currentStepIndex ? (
                                  <Clock className="h-3 w-3" />
                                ) : (
                                  <div className="w-3 h-3 border rounded-full" />
                                )}
                                <span>
                                  {step.approverRole === 'supervisor' && '上司'}
                                  {step.approverRole === 'manager' && '管理者'}
                                  {step.approverRole === 'hr' && '人事'}
                                  {step.approverRole === 'admin' && '管理者'}
                                </span>
                              </div>
                              {index < request.approvalFlow.length - 1 && (
                                <ArrowRight className="h-3 w-3 text-gray-400" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* コメント */}
                    {request.comments.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-medium text-sm mb-2">最新コメント</h4>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {request.comments[request.comments.length - 1].authorName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(
                                request.comments[request.comments.length - 1].timestamp,
                                { locale: ja, addSuffix: true }
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {request.comments[request.comments.length - 1].content}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {isApprover && (
          <TabsContent value="pending-approvals" className="space-y-4">
            <div className="space-y-4">
              {pendingApprovals.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">承認待ちの申請はありません</p>
                  </CardContent>
                </Card>
              ) : (
                pendingApprovals.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{request.title}</h3>
                            <Badge variant="outline" className={getUrgencyColor(request.urgency)}>
                              {request.urgency === 'urgent' && '🔥 緊急'}
                              {request.urgency === 'high' && '⚡ 高'}
                              {request.urgency === 'medium' && '📝 中'}
                              {request.urgency === 'low' && '📋 低'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{request.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              申請者: {request.submittedBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDistanceToNow(request.submittedAt, {
                                locale: ja,
                                addSuffix: true,
                              })}
                            </span>
                            {request.deadline && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                期限: {format(request.deadline, 'MM/dd', { locale: ja })}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowApprovalDialog(true);
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            承認処理
                          </Button>
                        </div>
                      </div>

                      {/* 申請内容プレビュー */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-sm mb-2">申請内容</h4>
                        {request.type === 'timesheet' && request.targetData.timesheet && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">月:</span>
                              <span className="ml-1 font-medium">
                                {request.targetData.timesheet.month}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">総労働時間:</span>
                              <span className="ml-1 font-medium">
                                {request.targetData.timesheet.totalWorkingHours}h
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">残業時間:</span>
                              <span className="ml-1 font-medium">
                                {request.targetData.timesheet.overtimeHours}h
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">有給時間:</span>
                              <span className="ml-1 font-medium">
                                {request.targetData.timesheet.leaveHours}h
                              </span>
                            </div>
                          </div>
                        )}
                        {request.type === 'leave_request' && request.targetData.leaveRequest && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">期間:</span>
                              <span className="ml-1 font-medium">
                                {format(request.targetData.leaveRequest.startDate, 'MM/dd', {
                                  locale: ja,
                                })}{' '}
                                -
                                {format(request.targetData.leaveRequest.endDate, 'MM/dd', {
                                  locale: ja,
                                })}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">種類:</span>
                              <span className="ml-1 font-medium">
                                {request.targetData.leaveRequest.leaveType === 'paid' && '有給休暇'}
                                {request.targetData.leaveRequest.leaveType === 'sick' && '病気休暇'}
                                {request.targetData.leaveRequest.leaveType === 'personal' && '私用'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">理由:</span>
                              <span className="ml-1 font-medium">
                                {request.targetData.leaveRequest.reason}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        )}

        <TabsContent value="history" className="space-y-4">
          {/* 承認統計チャート */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  承認傾向
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={approvalTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="approved"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                    />
                    <Area
                      type="monotone"
                      dataKey="rejected"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                    />
                    <Area
                      type="monotone"
                      dataKey="pending"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-green-600" />
                  ステータス分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* 承認履歴テーブル */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                月次承認履歴
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">月</th>
                      <th className="text-left py-2 px-4">総申請</th>
                      <th className="text-left py-2 px-4">承認</th>
                      <th className="text-left py-2 px-4">拒否</th>
                      <th className="text-left py-2 px-4">保留</th>
                      <th className="text-left py-2 px-4">平均承認時間</th>
                      <th className="text-left py-2 px-4">コンプライアンス</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvalHistory.map((history) => (
                      <tr key={history.month} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium">{history.month}</td>
                        <td className="py-2 px-4">{history.totalRequests}</td>
                        <td className="py-2 px-4 text-green-600">{history.approved}</td>
                        <td className="py-2 px-4 text-red-600">{history.rejected}</td>
                        <td className="py-2 px-4 text-blue-600">{history.pending}</td>
                        <td className="py-2 px-4">{Math.round(history.averageApprovalTime)}時間</td>
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${history.complianceScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{history.complianceScore}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 新規申請ダイアログ */}
      <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新規承認申請</DialogTitle>
            <DialogDescription>承認が必要な申請を作成します</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="requestType">申請タイプ</Label>
                <Select
                  value={newRequestForm.type}
                  onValueChange={(value) => setNewRequestForm((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="timesheet">勤怠データ承認</SelectItem>
                    <SelectItem value="leave_request">有給申請</SelectItem>
                    <SelectItem value="overtime">残業申請</SelectItem>
                    <SelectItem value="correction">修正申請</SelectItem>
                    <SelectItem value="schedule_change">スケジュール変更</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="requestUrgency">緊急度</Label>
                <Select
                  value={newRequestForm.urgency}
                  onValueChange={(value) =>
                    setNewRequestForm((prev) => ({ ...prev, urgency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="urgent">緊急</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="requestTitle">タイトル</Label>
              <Input
                id="requestTitle"
                value={newRequestForm.title}
                onChange={(e) => setNewRequestForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="申請のタイトルを入力..."
              />
            </div>

            <div>
              <Label htmlFor="requestDescription">説明</Label>
              <Textarea
                id="requestDescription"
                value={newRequestForm.description}
                onChange={(e) =>
                  setNewRequestForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="申請内容の詳細を入力..."
                rows={4}
              />
            </div>

            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>ADHD/ASD配慮</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                  <li>明確で具体的な説明を心がけてください</li>
                  <li>必要に応じて根拠となる資料も添付してください</li>
                  <li>疑問点があれば遠慮なくコメントで質問してください</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRequestDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={createNewRequest}>
              <Send className="h-4 w-4 mr-1" />
              申請作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 承認処理ダイアログ */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>承認処理</DialogTitle>
            <DialogDescription>
              申請「{selectedRequest?.title}」の承認を処理します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="approvalDecision">承認決定</Label>
              <Select
                value={approvalForm.decision}
                onValueChange={(value) => setApprovalForm((prev) => ({ ...prev, decision: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">承認</SelectItem>
                  <SelectItem value="request_changes">変更要求</SelectItem>
                  <SelectItem value="reject">拒否</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="approvalComments">コメント</Label>
              <Textarea
                id="approvalComments"
                value={approvalForm.comments}
                onChange={(e) => setApprovalForm((prev) => ({ ...prev, comments: e.target.value }))}
                placeholder="承認理由や指摘事項を入力..."
                rows={4}
              />
            </div>

            <Alert>
              <Heart className="h-4 w-4" />
              <AlertTitle>支援的コミュニケーション</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                  <li>建設的で理解しやすい表現を使用してください</li>
                  <li>拒否の場合は改善点を具体的に示してください</li>
                  <li>申請者の努力を認める言葉も含めてください</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={processApproval}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              処理実行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalDashboard;
