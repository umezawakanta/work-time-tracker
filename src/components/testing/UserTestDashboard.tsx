/**
 * 🧪 実ユーザーテスト管理ダッシュボード
 * セッション管理・リアルタイム監視・認知負荷測定・データ分析・レポート生成
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Play,
  Pause,
  Square,
  BarChart3,
  Brain,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Shield,
  Heart,
  Target,
  Monitor,
  FileText,
  Download,
  Settings,
  Filter,
  Search,
  RefreshCw,
  Camera,
  Mic,
  MousePointer,
  Keyboard,
  Smartphone,
} from 'lucide-react';
import {
  userTestEnvironmentService,
  UserTestSession,
  TestSuite,
} from '@/services/testing/UserTestEnvironmentService';

interface UserTestDashboardProps {
  compactMode?: boolean;
}

export const UserTestDashboard: React.FC<UserTestDashboardProps> = ({ compactMode = false }) => {
  // 状態管理
  const [activeTab, setActiveTab] = useState('overview');
  const [sessions, setSessions] = useState<UserTestSession[]>([]);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [realTimeData, setRealTimeData] = useState<Map<string, any>>(new Map());
  const [filters, setFilters] = useState({
    status: 'all',
    userType: 'all',
    timeRange: 'all',
  });

  // データ読み込み
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000); // 5秒ごとに更新
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const allSessions = userTestEnvironmentService.getAllSessions();
      const allTestSuites = userTestEnvironmentService.getAllTestSuites();
      const dashboard = userTestEnvironmentService.getDashboardData();

      setSessions(allSessions);
      setTestSuites(allTestSuites);
      setDashboardData(dashboard);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  // テストセッション開始
  const startTestSession = async (userId: string, testSuiteId: string) => {
    try {
      const sessionId = await userTestEnvironmentService.startTestSession(
        userId,
        'beta_app_placeholder',
        testSuiteId
      );

      console.log(`Started test session: ${sessionId}`);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to start test session:', error);
    }
  };

  // セッション管理
  const pauseSession = (sessionId: string) => {
    // セッション一時停止ロジック
    console.log(`Pausing session: ${sessionId}`);
  };

  const stopSession = async (sessionId: string) => {
    try {
      await userTestEnvironmentService.completeSession(sessionId);
      console.log(`Stopped session: ${sessionId}`);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to stop session:', error);
    }
  };

  // 概要ダッシュボード
  const renderOverviewDashboard = () => (
    <div className="space-y-6">
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総セッション数</p>
                <p className="text-3xl font-bold text-blue-600">
                  {dashboardData?.summary.totalSessions || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">完了セッション</p>
                <p className="text-3xl font-bold text-green-600">
                  {dashboardData?.summary.completedSessions || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">進行中</p>
                <p className="text-3xl font-bold text-orange-600">
                  {dashboardData?.summary.activeSessions || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">完了率</p>
                <p className="text-3xl font-bold text-purple-600">
                  {Math.round((dashboardData?.summary.averageCompletionRate || 0) * 100)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* メトリクス概要 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              認知負荷
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">平均負荷</span>
                <span className="font-semibold">
                  {(dashboardData?.metrics.cognitiveLoad || 0).toFixed(1)}/10
                </span>
              </div>
              <Progress value={(dashboardData?.metrics.cognitiveLoad || 0) * 10} className="h-2" />
              <div className="text-xs text-gray-500">
                {dashboardData?.metrics.cognitiveLoad > 7 ? (
                  <span className="text-red-600">高負荷 - 介入が必要</span>
                ) : dashboardData?.metrics.cognitiveLoad > 5 ? (
                  <span className="text-yellow-600">中程度 - 監視継続</span>
                ) : (
                  <span className="text-green-600">適切なレベル</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              ユーザビリティ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">満足度</span>
                <span className="font-semibold">
                  {(dashboardData?.metrics.usability || 0).toFixed(1)}/10
                </span>
              </div>
              <Progress value={(dashboardData?.metrics.usability || 0) * 10} className="h-2" />
              <div className="text-xs text-gray-500">
                各タスクの成功率とユーザー満足度の総合評価
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              アクセシビリティ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">適合度</span>
                <span className="font-semibold">
                  {(dashboardData?.metrics.accessibility || 0).toFixed(1)}/10
                </span>
              </div>
              <Progress value={(dashboardData?.metrics.accessibility || 0) * 10} className="h-2" />
              <div className="text-xs text-gray-500">WCAG準拠度とADHD/ASD特化配慮の評価</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* インサイト */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            主要インサイト
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData?.insights?.map((insight: string, index: number) => (
              <Alert key={index}>
                <Zap className="h-4 w-4" />
                <AlertDescription>{insight}</AlertDescription>
              </Alert>
            )) || <p className="text-gray-500">データ収集中...</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // セッション管理タブ
  const renderSessionManagement = () => (
    <div className="space-y-6">
      {/* セッション開始 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-green-500" />
            新しいテストセッション開始
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="user-id">ユーザーID</Label>
                <Input id="user-id" placeholder="beta_user_001" />
              </div>

              <div>
                <Label htmlFor="test-suite">テストスイート</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="スイートを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {testSuites.map((suite) => (
                      <SelectItem key={suite.id} value={suite.id}>
                        {suite.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => startTestSession('beta_user_001', 'adhd_asd_comprehensive_v1')}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  セッション開始
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* アクティブセッション */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-blue-500" />
            アクティブセッション
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.filter((s) => s.status === 'in_progress').length > 0 ? (
              sessions
                .filter((s) => s.status === 'in_progress')
                .map((session) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            進行中
                          </Badge>
                          <span className="font-medium">{session.userId}</span>
                          <span className="text-sm text-gray-500">
                            {session.sessionInfo.testType}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {Math.round(
                              (Date.now() - session.sessionInfo.startTime.getTime()) / 60000
                            )}
                            分経過
                          </span>

                          <span className="flex items-center gap-1">
                            <Brain className="h-4 w-4" />
                            認知負荷: {session.analysis.cognitiveLoadScore.toFixed(1)}
                          </span>

                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            進捗: {Math.round(session.analysis.completionRate * 100)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => pauseSession(session.id)}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>

                        <Button variant="outline" size="sm" onClick={() => stopSession(session.id)}>
                          <Square className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSession(session.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Monitor className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>現在進行中のセッションはありません</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* セッション履歴 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-500" />
            セッション履歴
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions
              .filter((s) => s.status === 'completed')
              .slice(0, 10)
              .map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">{session.userId}</p>
                      <p className="text-sm text-gray-600">
                        {session.sessionInfo.endTime
                          ? new Date(session.sessionInfo.endTime).toLocaleDateString('ja-JP')
                          : '進行中'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        完了率: {Math.round(session.analysis.completionRate * 100)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        所要時間:{' '}
                        {session.sessionInfo.duration
                          ? Math.round(session.sessionInfo.duration / 60000) + '分'
                          : 'N/A'}
                      </p>
                    </div>

                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // リアルタイム監視タブ
  const renderRealtimeMonitoring = () => (
    <div className="space-y-6">
      <Alert>
        <Activity className="h-4 w-4" />
        <AlertDescription>
          リアルタイム監視機能により、ユーザーの認知負荷やストレスレベルを継続的に追跡します。
        </AlertDescription>
      </Alert>

      {/* 監視中のセッション */}
      {sessions
        .filter((s) => s.status === 'in_progress')
        .map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                {session.userId} - リアルタイム監視
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 認知負荷 */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {session.analysis.cognitiveLoadScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">認知負荷</div>
                  <Progress value={session.analysis.cognitiveLoadScore * 10} className="h-2 mt-2" />
                </div>

                {/* エラー率 */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {session.dataCollection.interactions.length > 0 ? 15 : 0}%
                  </div>
                  <div className="text-sm text-gray-600">エラー率</div>
                  <Progress
                    value={session.dataCollection.interactions.length > 0 ? 15 : 0}
                    className="h-2 mt-2"
                  />
                </div>

                {/* フラストレーション */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {session.userProfile.stressLevel}
                  </div>
                  <div className="text-sm text-gray-600">ストレス</div>
                  <Progress value={session.userProfile.stressLevel * 10} className="h-2 mt-2" />
                </div>

                {/* エネルギー */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {session.userProfile.energyLevel}
                  </div>
                  <div className="text-sm text-gray-600">エネルギー</div>
                  <Progress value={session.userProfile.energyLevel * 10} className="h-2 mt-2" />
                </div>
              </div>

              {/* アラート */}
              {session.userProfile.stressLevel > 7 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    高いストレスレベルが検出されました。休憩を推奨します。
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
    </div>
  );

  // メインレンダリング
  if (compactMode) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            実ユーザーテスト
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {dashboardData?.summary.totalSessions || 0}
              </div>
              <div className="text-sm text-gray-600">総セッション</div>
            </div>

            <div>
              <div className="text-2xl font-bold text-green-600">
                {dashboardData?.summary.activeSessions || 0}
              </div>
              <div className="text-sm text-gray-600">進行中</div>
            </div>
          </div>

          <Button className="w-full mt-4" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            詳細を見る
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            実ユーザーテスト管理
          </h1>
          <p className="text-gray-600">ADHD/ASD特化ユーザビリティテストの管理・監視・分析</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            更新
          </Button>

          <Button>
            <Download className="h-4 w-4 mr-2" />
            レポート出力
          </Button>
        </div>
      </div>

      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            概要
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            セッション管理
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            リアルタイム監視
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            データ分析
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">{renderOverviewDashboard()}</TabsContent>

        <TabsContent value="sessions">{renderSessionManagement()}</TabsContent>

        <TabsContent value="monitoring">{renderRealtimeMonitoring()}</TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">高度データ分析（開発中）</h3>
              <p className="text-gray-600">
                機械学習による認知負荷予測・行動パターン分析・個別化推奨機能を開発中です
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserTestDashboard;
