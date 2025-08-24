import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Database,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Server,
  HardDrive,
  Lock,
  Zap,
  Activity,
} from 'lucide-react';
import {
  databaseBackupService,
  BackupMetadata,
  RecoveryPlan,
  BackupStatistics,
  DisasterRecoveryStatus,
} from '@/services/database/DatabaseBackupService';
import { toast } from '@/components/ui/use-toast';

export const DatabaseBackupDashboard: React.FC = () => {
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [recoveryPlans, setRecoveryPlans] = useState<RecoveryPlan[]>([]);
  const [statistics, setStatistics] = useState<BackupStatistics>({
    totalBackups: 0,
    successfulBackups: 0,
    failedBackups: 0,
    totalSize: 0,
    compressionRatio: 0,
    averageBackupTime: 0,
    lastBackupTime: null,
    uptime: 0,
    dataIntegrityScore: 0,
  });
  const [drStatus, setDrStatus] = useState<DisasterRecoveryStatus>({
    isActive: false,
    lastTestDate: null,
    rpo: 0,
    rto: 0,
    backupFrequency: 0,
    healthScore: 0,
  });

  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRunningDrTest, setIsRunningDrTest] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();

    // 30秒間隔でデータ更新
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = () => {
    setBackups(databaseBackupService.getBackups());
    setRecoveryPlans(databaseBackupService.getRecoveryPlans());
    setStatistics(databaseBackupService.getStatistics());
    setDrStatus(databaseBackupService.getDisasterRecoveryStatus());
  };

  const handleCreateManualBackup = async () => {
    setIsCreatingBackup(true);
    try {
      await databaseBackupService.createManualBackup('ダッシュボードからの手動バックアップ');
      loadDashboardData();
    } catch (error) {
      console.error('手動バックアップ失敗:', error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRunDrTest = async () => {
    setIsRunningDrTest(true);
    try {
      await databaseBackupService.performDisasterRecoveryTest();
      loadDashboardData();
    } catch (error) {
      console.error('DR テスト失敗:', error);
    } finally {
      setIsRunningDrTest(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedBackup || !selectedPlan) {
      toast({
        title: '選択エラー',
        description: 'バックアップと復旧プランを選択してください',
        variant: 'destructive',
      });
      return;
    }

    const backup = backups.find((b) => b.id === selectedBackup);
    const plan = recoveryPlans.find((p) => p.id === selectedPlan);

    if (!backup || !plan) return;

    const confirmed = window.confirm(
      `${plan.name}を実行してデータを復旧しますか？\n\n` +
        `復旧時間: 約${plan.estimatedDuration}分\n` +
        `リスクレベル: ${plan.riskLevel}\n` +
        `ロールバック可能: ${plan.rollbackCapable ? 'はい' : 'いいえ'}`
    );

    if (confirmed) {
      const success = await databaseBackupService.restoreFromBackup(selectedBackup, plan);
      if (success) {
        loadDashboardData();
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'corrupted':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      completed: 'default',
      failed: 'destructive',
      corrupted: 'secondary',
      in_progress: 'outline',
    };

    const labels: Record<string, string> = {
      completed: '完了',
      failed: '失敗',
      corrupted: '破損',
      in_progress: '実行中',
    };

    return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
  };

  const getRiskBadge = (riskLevel: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      low: 'default',
      medium: 'secondary',
      high: 'destructive',
    };

    const labels: Record<string, string> = {
      low: '低リスク',
      medium: '中リスク',
      high: '高リスク',
    };

    return (
      <Badge variant={variants[riskLevel] || 'outline'}>{labels[riskLevel] || riskLevel}</Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    return databaseBackupService.formatFileSize(bytes);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            🗄️ データベースバックアップ・リカバリ
          </h2>
          <p className="text-muted-foreground">高度なバックアップ戦略と災害復旧システム</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateManualBackup} disabled={isCreatingBackup} variant="default">
            {isCreatingBackup ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            手動バックアップ
          </Button>
          <Button onClick={handleRunDrTest} disabled={isRunningDrTest} variant="outline">
            {isRunningDrTest ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            DR テスト
          </Button>
        </div>
      </div>

      {/* サマリーメトリクス */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総バックアップ数</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalBackups}</div>
            <p className="text-xs text-muted-foreground">
              成功: {statistics.successfulBackups} / 失敗: {statistics.failedBackups}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">データ整合性</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(statistics.dataIntegrityScore)}`}>
              {statistics.dataIntegrityScore.toFixed(1)}%
            </div>
            <Progress value={statistics.dataIntegrityScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ストレージ使用量</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(statistics.totalSize)}</div>
            <p className="text-xs text-muted-foreground">
              圧縮率: {(statistics.compressionRatio * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DR 健全性</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(drStatus.healthScore)}`}>
              {drStatus.healthScore}%
            </div>
            <p className="text-xs text-muted-foreground">
              RPO: {drStatus.rpo}分 / RTO: {drStatus.rto}分
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 災害復旧ステータス */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <div className="flex justify-between items-center">
            <span>
              災害復旧システム: <strong>{drStatus.isActive ? '有効' : '無効'}</strong>
              {drStatus.lastTestDate && (
                <span className="ml-4">最終テスト: {formatDate(drStatus.lastTestDate)}</span>
              )}
            </span>
            <Badge variant={drStatus.isActive ? 'default' : 'destructive'}>
              {drStatus.isActive ? '稼働中' : '停止'}
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* タブコンテンツ */}
      <Tabs defaultValue="backups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="backups">バックアップ一覧</TabsTrigger>
          <TabsTrigger value="recovery">復旧管理</TabsTrigger>
          <TabsTrigger value="monitoring">監視・統計</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
        </TabsList>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>バックアップ履歴</CardTitle>
              <CardDescription>作成されたバックアップファイルの一覧</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backups.map((backup) => (
                  <div
                    key={backup.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedBackup === backup.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedBackup(backup.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(backup.status)}
                          <span className="font-medium">{backup.description}</span>
                          {getStatusBadge(backup.status)}
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>ID: {backup.id}</div>
                          <div>作成日時: {formatDate(backup.timestamp)}</div>
                          <div>サイズ: {formatFileSize(backup.size)}</div>
                          <div>コレクション: {backup.collections.join(', ')}</div>
                        </div>
                      </div>

                      <div className="text-right space-y-2">
                        <div className="flex gap-1">
                          {backup.compression && <Lock className="h-4 w-4 text-green-500" />}
                          {backup.encryption && <Shield className="h-4 w-4 text-blue-500" />}
                        </div>

                        <Badge variant="outline">
                          {backup.type === 'automatic'
                            ? '自動'
                            : backup.type === 'manual'
                              ? '手動'
                              : 'スケジュール'}
                        </Badge>

                        <div className="text-xs text-muted-foreground">
                          保持:{' '}
                          {backup.retentionPolicy === 'daily'
                            ? '日次'
                            : backup.retentionPolicy === 'weekly'
                              ? '週次'
                              : backup.retentionPolicy === 'monthly'
                                ? '月次'
                                : '永続'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recovery" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>復旧プラン</CardTitle>
                <CardDescription>利用可能なデータ復旧戦略</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recoveryPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedPlan === plan.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{plan.name}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            推定時間: {plan.estimatedDuration}分
                          </div>
                          <div className="text-xs text-muted-foreground">
                            対象: {plan.targetCollections.join(', ')}
                          </div>
                        </div>
                        <div className="space-y-1">
                          {getRiskBadge(plan.riskLevel)}
                          {plan.rollbackCapable && (
                            <Badge variant="outline" className="block text-center">
                              ロールバック可能
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>復旧実行</CardTitle>
                <CardDescription>選択したバックアップからデータを復旧</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">選択されたバックアップ:</label>
                    <div className="text-sm text-muted-foreground">
                      {selectedBackup
                        ? backups.find((b) => b.id === selectedBackup)?.description ||
                          selectedBackup
                        : 'バックアップを選択してください'}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">選択された復旧プラン:</label>
                    <div className="text-sm text-muted-foreground">
                      {selectedPlan
                        ? recoveryPlans.find((p) => p.id === selectedPlan)?.name || selectedPlan
                        : '復旧プランを選択してください'}
                    </div>
                  </div>

                  <Button
                    onClick={handleRestore}
                    disabled={!selectedBackup || !selectedPlan}
                    className="w-full"
                    variant="destructive"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    データ復旧実行
                  </Button>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      データ復旧は不可逆的な操作です。実行前に必ず最新のバックアップを作成してください。
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>バックアップ統計</CardTitle>
                <CardDescription>バックアップシステムのパフォーマンス</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>成功率</span>
                      <span>
                        {((statistics.successfulBackups / statistics.totalBackups) * 100).toFixed(
                          1
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={(statistics.successfulBackups / statistics.totalBackups) * 100}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>データ整合性</span>
                      <span>{statistics.dataIntegrityScore.toFixed(1)}%</span>
                    </div>
                    <Progress value={statistics.dataIntegrityScore} className="mt-1" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>システム稼働率</span>
                      <span>{statistics.uptime.toFixed(1)}%</span>
                    </div>
                    <Progress value={statistics.uptime} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>災害復旧メトリクス</CardTitle>
                <CardDescription>DR システムの性能指標</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">RPO (目標復旧ポイント)</span>
                    <Badge variant="outline">{drStatus.rpo} 分</Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">RTO (目標復旧時間)</span>
                    <Badge variant="outline">{drStatus.rto} 分</Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">バックアップ頻度</span>
                    <Badge variant="outline">{drStatus.backupFrequency} 分間隔</Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">DR健全性スコア</span>
                    <Badge variant={drStatus.healthScore >= 90 ? 'default' : 'secondary'}>
                      {drStatus.healthScore}%
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">最終 DR テスト</span>
                    <span className="text-xs text-muted-foreground">
                      {drStatus.lastTestDate ? formatDate(drStatus.lastTestDate) : 'なし'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>バックアップ設定</CardTitle>
              <CardDescription>システム設定とポリシー</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">自動バックアップ頻度</label>
                    <Badge variant="outline">{drStatus.backupFrequency} 分間隔</Badge>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">暗号化</label>
                    <Badge variant="default">AES-256 有効</Badge>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">圧縮</label>
                    <Badge variant="default">
                      gzip 有効 ({(statistics.compressionRatio * 100).toFixed(1)}% 圧縮率)
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">保持ポリシー</label>
                    <div className="text-sm text-muted-foreground">
                      日次: 7日 / 週次: 30日 / 月次: 365日
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">監視対象コレクション</h4>
                  <div className="flex flex-wrap gap-2">
                    {['todos', 'users', 'worktime', 'analytics', 'subscription', 'archive'].map(
                      (collection) => (
                        <Badge key={collection} variant="outline">
                          {collection}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
