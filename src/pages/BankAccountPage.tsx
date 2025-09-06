import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import BankAccountManager from '@/components/BankAccountManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const BankAccountPage: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // デバッグ情報を表示
  console.log('BankAccountPage - Auth state:', {
    user,
    isAuthenticated,
    loading,
    userExists: !!user,
    userId: user?.id,
  });

  // ローディング中の場合
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">認証状態を確認中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 認証されていない場合
  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ログインが必要です</h3>
            <p className="text-gray-500 mb-4">銀行口座を管理するにはログインしてください</p>
            <div className="text-sm text-gray-400 mb-4">
              <p>デバッグ情報:</p>
              <p>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</p>
              <p>user: {user ? 'exists' : 'null'}</p>
              <p>loading: {loading ? 'true' : 'false'}</p>
            </div>
            <Button onClick={() => navigate('/login')}>ログインページに移動</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">銀行口座管理</h1>
            <p className="text-lg text-gray-600">
              メイン銀行口座を登録・管理して、「毎日20のこと」を効率的に進めましょう
            </p>
          </div>
        </div>

        {/* 操作手順ガイド */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Building2 className="h-5 w-5" />
              銀行口座管理の使い方
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-blue-900 mb-3">🏦 口座の登録方法</h4>
                <ol className="list-decimal list-inside space-y-2 text-blue-700">
                  <li>「新しい口座を追加」ボタンをクリック</li>
                  <li>銀行名、口座種別、口座名を入力</li>
                  <li>「メイン口座に設定」で主要な口座を指定</li>
                  <li>「データ同期」ボタンで残高を自動取得</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-3">🔄 自動同期機能</h4>
                <ol className="list-decimal list-inside space-y-2 text-blue-700">
                  <li>「データ同期」で最新の残高を取得</li>
                  <li>「自動同期を有効化」で定期的な更新を設定</li>
                  <li>「毎日20のこと」で資産確認タスクが自動完了</li>
                  <li>資産負債レポートに自動反映</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 銀行口座管理の特徴 */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Building2 className="h-5 w-5" />
              銀行口座管理の特徴
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-green-700">
              <p className="mb-2">
                <strong>実際の銀行口座データを管理：</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>複数の銀行口座を一元管理</li>
                <li>メイン口座の設定と自動同期</li>
                <li>残高情報のリアルタイム更新</li>
                <li>「毎日20のこと」との自動連携</li>
                <li>資産負債レポートへの自動反映</li>
              </ul>
              <p className="mt-3 text-xs text-green-600">
                ※ 銀行口座を登録すると、自動的に「毎日20のこと」のタスクが完了します
              </p>
            </div>
          </CardContent>
        </Card>

        {/* メインコンテンツ */}
        <BankAccountManager
          userId={user.id}
          onAccountChange={() => {
            // 口座変更時のコールバック（必要に応じて実装）
            console.log('Bank account changed');
          }}
        />

        {/* 機能説明 */}
        <Card>
          <CardHeader>
            <CardTitle>「毎日20のこと」との連携</CardTitle>
            <CardDescription>
              メイン銀行口座を登録することで、以下のタスクが効率的に管理できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-600">
                  メイン銀行口座の入出金履歴を確認する
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 登録したメイン口座の情報が表示されます</li>
                  <li>• 銀行データ取り込み機能で履歴を自動取得</li>
                  <li>• 収入・支出の確認が簡単になります</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">現在の資産と負債をすべて把握する</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 銀行口座の残高を資産管理に自動反映</li>
                  <li>• 複数口座の統合管理</li>
                  <li>• リアルタイムでの資産状況把握</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BankAccountPage;
