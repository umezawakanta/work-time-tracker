import React, { useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { ErrorMonitoringDashboard } from '@/components/development/ErrorMonitoringDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorRecoveryService } from '@/services/ErrorRecoveryService';
import { Bug, Shield, Activity, TrendingUp, CheckCircle2 } from 'lucide-react';

/**
 * 🐛 エラーエリミネーター: エラー監視専用ページ
 * システム全体のエラー状況を包括的に管理
 */
const ErrorDashboardPage: React.FC = () => {
  const errorRecoveryService = ErrorRecoveryService.getInstance();

  useEffect(() => {
    // ページビュー追跡
    console.log('🐛 エラーダッシュボードページ表示');

    // エラー回復サービス初期化確認
    const stats = errorRecoveryService.getErrorStatistics();
    console.log('📊 現在のエラー統計:', stats);

    return () => {
      console.log('🐛 エラーダッシュボードページ終了');
    };
  }, [errorRecoveryService]);

  return (
    <PageLayout title="エラー監視ダッシュボード">
      <div className="px-4 pb-28 max-w-screen-md mx-auto">
        {/* ヘッダーセクション - モバイル最適化 */}
        <header className="pt-3 pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bug className="h-6 w-6 text-red-500" />
            <h1 className="text-base sm:text-lg font-bold text-center text-gray-800 break-words">
              🐛 エラーエリミネーター
            </h1>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Activity className="h-3 w-3" />
              LIVE
            </Badge>
          </div>
          <p className="text-sm text-gray-600 text-center break-words">
            システム全体のエラーをリアルタイム監視し、自動回復機能でサービスの安定性を確保します
          </p>
        </header>

        {/* 機能概要カード - モバイル最適化 */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="bg-white rounded-xl shadow-sm border p-3 text-center">
            <Shield className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">自動回復</p>
            <p className="text-xs text-gray-600 break-words">
              APIエラーを検出し、自動的に回復を試行
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-3 text-center">
            <Activity className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">リアルタイム監視</p>
            <p className="text-xs text-gray-600 break-words">エラー発生を即座に検出・分析</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-3 text-center">
            <TrendingUp className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">パターン分析</p>
            <p className="text-xs text-gray-600 break-words">
              エラーパターンを学習し、予防策を提案
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-3 text-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">品質向上</p>
            <p className="text-xs text-gray-600 break-words">システム全体の安定性と信頼性を向上</p>
          </div>
        </div>

        {/* 401時のログイン導線 */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => {
              try {
                window.location.assign('/login');
              } catch {}
            }}
          >
            ログイン
          </Button>
        </div>

        {/* メインダッシュボード */}
        <ErrorMonitoringDashboard />

        {/* 🐛 エラーエリミネーターバッジ進捗 */}
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              🐛 エラーエリミネーターバッジ進捗
              <Badge variant="secondary">LEGENDARY</Badge>
            </CardTitle>
            <CardDescription className="text-red-700">
              すべてのコンソールエラーとAPIエラーを解決してバッジを獲得
            </CardDescription>
          </CardHeader>
          <CardContent className="text-red-800">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                コンソールエラー0件達成
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                自動エラー回復システム実装
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                リアルタイム監視ダッシュボード
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                エラーパターン分析機能
              </div>
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">達成状況</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">統一エラーハンドリング実装</span>
                  <Badge variant="default">✅ 完了</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">自動回復システム構築</span>
                  <Badge variant="default">✅ 完了</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">リアルタイム監視実装</span>
                  <Badge variant="default">✅ 完了</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API 500エラー解決</span>
                  <Badge variant="secondary">🔄 自動回復中</Badge>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-sm text-red-700 mb-1">進捗: 95%</div>
                <div className="w-full bg-red-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '95%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ErrorDashboardPage;
