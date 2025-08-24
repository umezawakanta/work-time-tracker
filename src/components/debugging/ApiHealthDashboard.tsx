import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Wrench } from 'lucide-react';

interface HealthCheckResult {
  endpoint: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime: number;
  statusCode: number | null;
  error: string | null;
  timestamp: string;
}

interface ApiHealthReport {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheckResult[];
  issues: string[];
  recommendations: string[];
}

/**
 * 🏥 API健全性ダッシュボード - 本番環境問題の迅速診断
 */
export const ApiHealthDashboard: React.FC = () => {
  const [healthReport, setHealthReport] = useState<ApiHealthReport | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairLog, setRepairLog] = useState<string[]>([]);

  /**
   * 🩺 健全性チェック実行
   */
  const performHealthCheck = async () => {
    setIsChecking(true);
    try {
      console.log('🩺 Starting manual health check...');

      const criticalEndpoints = [
        '/api/auth/tokens',
        '/api/auth/login',
        '/api/auth/refresh',
        '/api/todos',
      ];

      const checks: HealthCheckResult[] = [];

      for (const endpoint of criticalEndpoints) {
        const startTime = Date.now();
        const url = `${window.location.origin}${endpoint}`;

        try {
          const response = await fetch(url, {
            method: 'HEAD',
            signal: AbortSignal.timeout(10000),
          });

          const responseTime = Date.now() - startTime;
          const isHealthy = response.status < 500;

          checks.push({
            endpoint,
            status: isHealthy ? 'healthy' : 'unhealthy',
            responseTime,
            statusCode: response.status,
            error: isHealthy ? null : `HTTP ${response.status}`,
            timestamp: new Date().toISOString(),
          });
        } catch (error: any) {
          const responseTime = Date.now() - startTime;
          checks.push({
            endpoint,
            status: 'unhealthy',
            responseTime,
            statusCode: null,
            error: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }

      // 全体健全性判定
      const healthyCount = checks.filter((c) => c.status === 'healthy').length;
      const unhealthyCount = checks.filter((c) => c.status === 'unhealthy').length;

      let overall: 'healthy' | 'degraded' | 'unhealthy';
      if (unhealthyCount === 0) {
        overall = 'healthy';
      } else if (healthyCount > unhealthyCount) {
        overall = 'degraded';
      } else {
        overall = 'unhealthy';
      }

      // 問題と推奨事項生成
      const issues: string[] = [];
      const recommendations: string[] = [];

      checks.forEach((check) => {
        if (check.status === 'unhealthy') {
          issues.push(`${check.endpoint}: ${check.error}`);
        }
        if (check.responseTime > 5000) {
          issues.push(`${check.endpoint}: 応答時間が遅い (${check.responseTime}ms)`);
        }
      });

      const tokensIssue = checks.find(
        (c) => c.endpoint === '/api/auth/tokens' && c.status !== 'healthy'
      );
      if (tokensIssue) {
        if (tokensIssue.statusCode === null) {
          recommendations.push('🔧 Vercelデプロイメント確認が必要');
          recommendations.push('📄 vercel.json設定を確認してください');
        } else if (tokensIssue.statusCode === 404) {
          recommendations.push('📂 APIファイルの存在確認が必要');
        }
      }

      if (issues.length === 0) {
        recommendations.push('✅ 全システム正常動作中');
      }

      setHealthReport({
        overall,
        checks,
        issues,
        recommendations,
      });
    } catch (error: any) {
      console.error('❌ Health check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  /**
   * 🩹 自動修復試行
   */
  const attemptAutoRepair = async () => {
    setIsRepairing(true);
    setRepairLog([]);

    const log = (message: string) => {
      setRepairLog((prev) => [...prev, message]);
      console.log(message);
    };

    try {
      log('🩹 自動修復を開始します...');

      // 1. ブラウザキャッシュクリア
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        log('✅ ブラウザキャッシュをクリアしました');
      }

      // 2. ローカルストレージクリア
      const authKeys = Object.keys(localStorage).filter((key) => key.includes('auth'));
      authKeys.forEach((key) => localStorage.removeItem(key));
      if (authKeys.length > 0) {
        log(`✅ 認証関連データをクリアしました (${authKeys.length}件)`);
      }

      // 3. サービスワーカー再登録
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
        log('✅ サービスワーカーを再登録しました');
      }

      // 4. 再チェック実行
      log('🔄 システム状態を再確認中...');
      await performHealthCheck();

      log('✅ 自動修復が完了しました');
    } catch (error: any) {
      log(`❌ 修復エラー: ${error.message}`);
    } finally {
      setIsRepairing(false);
    }
  };

  // コンポーネント初期化時に自動チェック
  useEffect(() => {
    performHealthCheck();
  }, []);

  /**
   * 🎨 ステータスアイコン取得
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  /**
   * 🎨 ステータスバッジ取得
   */
  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default' as const,
      unhealthy: 'destructive' as const,
      degraded: 'secondary' as const,
      unknown: 'outline' as const,
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status === 'healthy'
          ? '正常'
          : status === 'unhealthy'
            ? '異常'
            : status === 'degraded'
              ? '劣化'
              : '不明'}
      </Badge>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                🏥 API健全性ダッシュボード
                {healthReport && getStatusIcon(healthReport.overall)}
              </CardTitle>
              <CardDescription>本番環境でのAPI問題の迅速診断と修復</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={performHealthCheck}
                disabled={isChecking}
                variant="outline"
                size="sm"
              >
                {isChecking ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                再チェック
              </Button>
              <Button
                onClick={attemptAutoRepair}
                disabled={isRepairing || !healthReport || healthReport.overall === 'healthy'}
                variant="secondary"
                size="sm"
              >
                {isRepairing ? (
                  <Wrench className="h-4 w-4 animate-pulse mr-2" />
                ) : (
                  <Wrench className="h-4 w-4 mr-2" />
                )}
                自動修復
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {healthReport && (
            <div className="space-y-6">
              {/* 全体ステータス */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(healthReport.overall)}
                  <span className="font-medium">システム全体</span>
                  {getStatusBadge(healthReport.overall)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {healthReport.checks.filter((c) => c.status === 'healthy').length} /{' '}
                  {healthReport.checks.length} エンドポイント正常
                </div>
              </div>

              {/* エンドポイント詳細 */}
              <div className="grid gap-4">
                <h3 className="font-medium">エンドポイント詳細</h3>
                {healthReport.checks.map((check, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <span className="font-mono text-sm">{check.endpoint}</span>
                      {getStatusBadge(check.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{check.responseTime}ms</span>
                      {check.statusCode && (
                        <span className={check.statusCode >= 400 ? 'text-red-500' : ''}>
                          {check.statusCode}
                        </span>
                      )}
                      {check.error && (
                        <span className="text-red-500 max-w-xs truncate">{check.error}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 問題と推奨事項 */}
              {healthReport.issues.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <strong>検出された問題:</strong>
                      <ul className="list-disc list-inside space-y-1">
                        {healthReport.issues.map((issue, index) => (
                          <li key={index} className="text-sm">
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {healthReport.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">推奨事項</h4>
                  <ul className="space-y-2">
                    {healthReport.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-500">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 修復ログ */}
              {repairLog.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">修復ログ</h4>
                  <div className="bg-black text-green-400 p-3 rounded text-sm font-mono max-h-40 overflow-y-auto">
                    {repairLog.map((log, index) => (
                      <div key={index}>{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
