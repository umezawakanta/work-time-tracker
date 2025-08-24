import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, XCircle, Activity, Trash2 } from 'lucide-react';
import ErrorHandler, { ErrorReport } from '@/lib/errorHandler';

export const ErrorMonitorDashboard: React.FC = () => {
  const [errorStats, setErrorStats] = useState({
    totalErrors: 0,
    recentErrors: 0,
    criticalErrors: 0,
    isUnderLimit: false,
    progress: 0,
  });
  const [recentErrorLogs, setRecentErrorLogs] = useState<ErrorReport[]>([]);
  const [apiStatus, setApiStatus] = useState<'healthy' | 'error' | 'checking'>('checking');

  const errorHandler = ErrorHandler.getInstance();

  // エラー統計の更新
  const updateErrorStats = () => {
    const stats = errorHandler.getErrorStats();
    setErrorStats(stats);

    const errors = errorHandler.getStoredErrors();
    setRecentErrorLogs(errors.slice(-10).reverse()); // 最新10件を表示
  };

  // API健全性チェック
  const checkApiHealth = async () => {
    setApiStatus('checking');
    try {
      const response = await fetch('/api/health');
      setApiStatus(response.ok ? 'healthy' : 'error');
    } catch {
      setApiStatus('error');
    }
  };

  useEffect(() => {
    updateErrorStats();
    checkApiHealth();

    // エラー統計更新イベントの監視
    const handleErrorUpdate = () => {
      updateErrorStats();
    };

    window.addEventListener('errorStatsUpdated', handleErrorUpdate);

    // 定期的な更新
    const interval = setInterval(() => {
      updateErrorStats();
      checkApiHealth();
    }, 30000); // 30秒ごと

    return () => {
      window.removeEventListener('errorStatsUpdated', handleErrorUpdate);
      clearInterval(interval);
    };
  }, []);

  const clearAllErrors = () => {
    errorHandler.clearErrorLogs();
    updateErrorStats();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getApiStatusIcon = () => {
    switch (apiStatus) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <Activity className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🐛 エラーエリミネーター監視
          </h1>
          <p className="text-gray-600">リアルタイムエラー監視とバッジ進捗追跡</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={updateErrorStats} variant="outline">
            更新
          </Button>
          <Button onClick={clearAllErrors} variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-1" />
            ログクリア
          </Button>
        </div>
      </div>

      {/* エラーエリミネーター進捗 */}
      <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🐛 エラーエリミネーター進捗</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">バッジ進捗</span>
                <span className="text-sm font-medium">{Math.round(errorStats.progress)}%</span>
              </div>
              <Progress value={errorStats.progress} className="h-3" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${errorStats.isUnderLimit ? 'text-green-600' : 'text-red-600'}`}
                >
                  {errorStats.totalErrors}
                </div>
                <div className="text-sm text-gray-600">総エラー数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{errorStats.recentErrors}</div>
                <div className="text-sm text-gray-600">24時間以内</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{errorStats.criticalErrors}</div>
                <div className="text-sm text-gray-600">重大エラー</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">50</div>
                <div className="text-sm text-gray-600">目標上限</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API健全性 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getApiStatusIcon()}
              API健全性
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>ステータス:</span>
                <Badge
                  className={
                    apiStatus === 'healthy'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {apiStatus === 'healthy'
                    ? '正常'
                    : apiStatus === 'error'
                      ? 'エラー'
                      : 'チェック中'}
                </Badge>
              </div>
              <Button onClick={checkApiHealth} variant="outline" size="sm" className="w-full">
                再チェック
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* エラー分類 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              エラー分類
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['critical', 'high', 'medium', 'low'].map((severity) => {
                const count = errorHandler
                  .getStoredErrors()
                  .filter((e) => e.severity === severity).length;
                return (
                  <div key={severity} className="flex justify-between">
                    <Badge className={getSeverityColor(severity)}>{severity.toUpperCase()}</Badge>
                    <span className="font-medium">{count}件</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最新エラーログ */}
      <Card>
        <CardHeader>
          <CardTitle>最新エラーログ (10件)</CardTitle>
        </CardHeader>
        <CardContent>
          {recentErrorLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              エラーはありません！🎉
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentErrorLogs.map((error, index) => (
                <div key={index} className="border rounded p-3 text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <Badge className={getSeverityColor(error.severity)}>{error.severity}</Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(error.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="font-medium">{error.message}</div>
                  {error.endpoint && (
                    <div className="text-gray-600 text-xs">API: {error.endpoint}</div>
                  )}
                  {error.component && (
                    <div className="text-gray-600 text-xs">Component: {error.component}</div>
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
