import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import BankAccountManager from '@/components/BankAccountManager';
import { BankCSVUploader } from '@/components/BankCSVUploader';
import BankAccountForm from '@/components/BankAccountForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, ArrowLeft, Upload, FileText, Plus, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const BankAccountPage: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manage');
  const [showAddForm, setShowAddForm] = useState(false);

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

        {/* タブナビゲーション */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              口座管理
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              CSVインポート
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-6">
            {/* 操作手順ガイド */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Building2 className="h-5 w-5" />
                  銀行口座管理完全ガイド
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-3">🏦 口座の登録方法</h4>
                    <ol className="list-decimal list-inside space-y-2 text-blue-700">
                      <li>
                        <strong>手動登録</strong>
                        <br />
                        「新しい口座を追加」ボタンで個別登録
                      </li>
                      <li>
                        <strong>CSVインポート</strong>
                        <br />
                        三井住友銀行のCSVファイルをアップロード
                      </li>
                      <li>
                        <strong>複数口座対応</strong>
                        <br />
                        メイン口座以外も複数登録可能
                      </li>
                      <li>
                        <strong>メイン口座設定</strong>
                        <br />
                        主要な口座を1つ指定
                      </li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-3">🔄 データ管理機能</h4>
                    <ol className="list-decimal list-inside space-y-2 text-blue-700">
                      <li>
                        <strong>残高更新</strong>
                        <br />
                        「データ同期」で最新の残高を取得
                      </li>
                      <li>
                        <strong>自動同期</strong>
                        <br />
                        定期的な更新を設定可能
                      </li>
                      <li>
                        <strong>データ永続化</strong>
                        <br />
                        ページ再読み込みでもデータ保持
                      </li>
                      <li>
                        <strong>セキュリティ</strong>
                        <br />
                        暗号化された安全な保存
                      </li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-3">💡 毎日の使い方</h4>
                    <ol className="list-decimal list-inside space-y-2 text-blue-700">
                      <li>
                        <strong>朝の確認</strong>
                        <br />
                        「毎日20のこと」で資産確認タスクを完了
                      </li>
                      <li>
                        <strong>残高更新</strong>
                        <br />
                        銀行口座の残高を最新に更新
                      </li>
                      <li>
                        <strong>レポート確認</strong>
                        <br />
                        資産負債レポートで全体を把握
                      </li>
                      <li>
                        <strong>目標管理</strong>
                        <br />
                        設定した目標に対する進捗を確認
                      </li>
                    </ol>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h5 className="font-semibold text-yellow-800 mb-2">⚠️ 重要な注意事項</h5>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• メイン口座は1つのみ設定可能です（他の口座は通常口座として登録）</li>
                    <li>• CSVファイルは三井住友銀行の形式に対応しています</li>
                    <li>• データは自動的に保存され、セッション切れでも保持されます</li>
                    <li>• 個人情報は暗号化されて保存され、第三者と共有されることはありません</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 口座追加ボタン */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">登録済み口座一覧</h3>
              <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                新しい口座を追加
              </Button>
            </div>

            {/* 口座追加フォーム */}
            {showAddForm && (
              <BankAccountForm
                onAccountAdded={(account) => {
                  setShowAddForm(false);
                  // 口座一覧を更新するためにページをリロード
                  window.location.reload();
                }}
                onCancel={() => setShowAddForm(false)}
                existingMainAccount={false} // TODO: 既存のメイン口座をチェック
              />
            )}

            {/* 銀行口座管理コンポーネント */}
            <BankAccountManager userId={user.id} />
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            {/* CSVインポートガイド */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <FileText className="h-5 w-5" />
                  CSVファイルで一括インポート
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-semibold text-green-900 mb-3">📋 CSVファイルの準備</h4>
                    <ol className="list-decimal list-inside space-y-2 text-green-700">
                      <li>「テンプレートをダウンロード」でCSV形式を取得</li>
                      <li>銀行名、口座種別、口座番号、口座名を入力</li>
                      <li>残高、メイン口座設定も可能</li>
                      <li>複数の口座を一度に登録可能</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 mb-3">🚀 インポート手順</h4>
                    <ol className="list-decimal list-inside space-y-2 text-green-700">
                      <li>CSVファイルをドラッグ&ドロップまたは選択</li>
                      <li>データの検証が自動実行される</li>
                      <li>エラーがあれば修正して再アップロード</li>
                      <li>成功すると口座一覧に反映される</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CSVアップロードコンポーネント */}
            <BankCSVUploader
              userId={user.id}
              onUploadComplete={(result) => {
                if (result.success) {
                  // 成功時は口座管理タブに切り替え
                  setActiveTab('manage');
                }
              }}
            />
          </TabsContent>
        </Tabs>

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
