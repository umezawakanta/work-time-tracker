import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BankDataUploader from '@/components/BankDataUploader';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  TrendingUp,
  Calendar,
  DollarSign,
  Building2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BankDataSummary {
  id: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    netAmount: number;
    transactionCount: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
  bankInfo: {
    name: string;
    accountType: string;
  };
  transactionCount: number;
  dateRange: {
    start: string;
    end: string;
  };
  textSummary: string;
}

const BankImportPage: React.FC = () => {
  const { user } = useAuth();
  const [uploadedData, setUploadedData] = useState<BankDataSummary | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [importedAssets, setImportedAssets] = useState<any[]>([]);

  // データ処理完了時のコールバック
  const handleDataProcessed = async (transactions: any[]) => {
    try {
      const csvData = transactions
        .map((t) => `${t.date},${t.description},${t.amount},${t.balance}`)
        .join('\n');

      const response = await fetch('/api/bank/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csvData,
          userId: user?.id || 'anonymous',
          bankName: 'auto-detect',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setUploadedData(result.data);
        toast.success('銀行データが正常に解析されました');
      } else {
        toast.error(result.message || 'データの解析に失敗しました');
      }
    } catch (error) {
      console.error('Error processing bank data:', error);
      toast.error('データの処理中にエラーが発生しました');
    }
  };

  // 進捗更新のコールバック
  const handleProgressUpdate = (progress: number) => {
    // 進捗表示のロジック（必要に応じて実装）
  };

  // 資産管理システムへの取り込み
  const handleImportToAssets = async () => {
    if (!uploadedData || !accountName.trim()) {
      toast.error('口座名を入力してください');
      return;
    }

    setIsImporting(true);

    try {
      const response = await fetch('/api/bank/import-to-assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataId: uploadedData.id,
          userId: user?.id || 'anonymous',
          accountName: accountName.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setImportedAssets((prev) => [...prev, result.data]);
        toast.success('資産管理システムに正常に取り込まれました！');

        // フォームをリセット
        setAccountName('');
        setUploadedData(null);
      } else {
        toast.error(result.message || '取り込みに失敗しました');
      }
    } catch (error) {
      console.error('Error importing to assets:', error);
      toast.error('取り込み中にエラーが発生しました');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* ヘッダー */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">銀行データ取り込み</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            銀行の入出金履歴CSVファイルをアップロードして、自動でデータを解析・資産管理システムに取り込みます
          </p>
        </div>

        {/* メインコンテンツ */}
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">データアップロード</TabsTrigger>
            <TabsTrigger value="preview">データプレビュー</TabsTrigger>
            <TabsTrigger value="import">資産管理へ取り込み</TabsTrigger>
          </TabsList>

          {/* アップロードタブ */}
          <TabsContent value="upload" className="space-y-6">
            <BankDataUploader
              onDataProcessed={handleDataProcessed}
              onProgressUpdate={handleProgressUpdate}
            />
          </TabsContent>

          {/* プレビュータブ */}
          <TabsContent value="preview" className="space-y-6">
            {uploadedData ? (
              <div className="space-y-6">
                {/* データサマリー */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      データサマリー
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">収入合計</p>
                        <p className="text-xl font-bold text-green-600">
                          {uploadedData.summary.totalIncome.toLocaleString()}円
                        </p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <TrendingUp className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">支出合計</p>
                        <p className="text-xl font-bold text-red-600">
                          {uploadedData.summary.totalExpense.toLocaleString()}円
                        </p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">差額</p>
                        <p
                          className={`text-xl font-bold ${
                            uploadedData.summary.netAmount >= 0 ? 'text-blue-600' : 'text-red-600'
                          }`}
                        >
                          {uploadedData.summary.netAmount.toLocaleString()}円
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <FileText className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">取引件数</p>
                        <p className="text-xl font-bold text-gray-600">
                          {uploadedData.transactionCount}件
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 期間情報 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      期間情報
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">データ期間</p>
                        <p className="text-lg font-semibold">
                          {uploadedData.dateRange.start} ～ {uploadedData.dateRange.end}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">銀行名</p>
                        <Badge variant="secondary" className="text-lg">
                          {uploadedData.bankInfo.name}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* テキストサマリー */}
                <Card>
                  <CardHeader>
                    <CardTitle>データ詳細</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {uploadedData.textSummary}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    データがアップロードされていません
                  </h3>
                  <p className="text-gray-500">
                    まず「データアップロード」タブでCSVファイルをアップロードしてください
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 取り込みタブ */}
          <TabsContent value="import" className="space-y-6">
            {uploadedData ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>資産管理システムへの取り込み</CardTitle>
                    <CardDescription>
                      解析された銀行データを資産管理システムに取り込みます
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="accountName">口座名</Label>
                      <Input
                        id="accountName"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="例: 三菱UFJ銀行 普通預金"
                        className="mt-1"
                      />
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        取り込み後、最新の残高が資産管理システムに追加されます。
                        「毎日20のこと」のサブタスクも自動完了します。
                      </AlertDescription>
                    </Alert>

                    <Button
                      onClick={handleImportToAssets}
                      disabled={isImporting || !accountName.trim()}
                      className="w-full"
                    >
                      {isImporting ? '取り込み中...' : '資産管理システムに取り込み'}
                    </Button>
                  </CardContent>
                </Card>

                {/* 取り込み履歴 */}
                {importedAssets.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>取り込み履歴</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {importedAssets.map((asset, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium">{asset.accountName}</p>
                                <p className="text-sm text-gray-600">
                                  {asset.importedBalance.toLocaleString()}円
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary">{asset.transactionCount}件の取引</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    データがアップロードされていません
                  </h3>
                  <p className="text-gray-500">
                    まず「データアップロード」タブでCSVファイルをアップロードしてください
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* 使用方法の説明 */}
        <Card>
          <CardHeader>
            <CardTitle>使用方法</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  1. CSVファイルをアップロード
                </h4>
                <p className="text-sm text-gray-600">
                  銀行のオンラインバンキングから過去3ヶ月の入出金履歴をCSV形式でダウンロードし、アップロードしてください
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  2. データを確認
                </h4>
                <p className="text-sm text-gray-600">
                  アップロードされたデータの内容、収支、期間などを確認できます
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  3. 資産管理に取り込み
                </h4>
                <p className="text-sm text-gray-600">
                  確認後、資産管理システムに取り込んで「毎日20のこと」のタスクを自動完了できます
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BankImportPage;
