import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import BankAccountManager from '@/components/BankAccountManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const BankAccountPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ログインが必要です</h3>
            <p className="text-gray-500">銀行口座を管理するにはログインしてください</p>
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
