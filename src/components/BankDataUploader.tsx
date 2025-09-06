import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BankTransaction {
  date: string;
  description: string;
  amount: number;
  balance: number;
  category?: string;
}

interface BankDataUploaderProps {
  onDataProcessed: (transactions: BankTransaction[]) => void;
  onProgressUpdate: (progress: number) => void;
}

const BankDataUploader: React.FC<BankDataUploaderProps> = ({
  onDataProcessed,
  onProgressUpdate,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processedData, setProcessedData] = useState<BankTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  // CSVファイルの解析
  const parseCSV = (csvText: string): BankTransaction[] => {
    const lines = csvText.split('\n').filter((line) => line.trim());
    const transactions: BankTransaction[] = [];

    // ヘッダー行をスキップ（最初の行）
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // CSVの各列を分割（カンマ区切り）
      const columns = line.split(',').map((col) => col.trim().replace(/"/g, ''));

      if (columns.length >= 4) {
        try {
          const transaction: BankTransaction = {
            date: columns[0],
            description: columns[1],
            amount: parseFloat(columns[2]) || 0,
            balance: parseFloat(columns[3]) || 0,
          };
          transactions.push(transaction);
        } catch (err) {
          console.warn('Failed to parse line:', line, err);
        }
      }
    }

    return transactions;
  };

  // ファイル処理
  const processFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const text = await file.text();
      setUploadProgress(50);

      const transactions = parseCSV(text);
      setUploadProgress(80);

      // データの検証
      if (transactions.length === 0) {
        throw new Error('有効な取引データが見つかりませんでした');
      }

      setProcessedData(transactions);
      setUploadProgress(100);

      toast.success(`${transactions.length}件の取引データを読み込みました`);
      onDataProcessed(transactions);
      onProgressUpdate(100);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'ファイルの処理中にエラーが発生しました';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // ドロップゾーンの設定
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('CSVファイルを選択してください');
        return;
      }
      setUploadedFile(file);
      processFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  // ファイルをクリア
  const clearFile = () => {
    setUploadedFile(null);
    setProcessedData([]);
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* アップロードエリア */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            銀行データアップロード
          </CardTitle>
          <CardDescription>
            銀行の入出金履歴CSVファイルをアップロードして、自動でデータを解析・取り込みます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-lg text-blue-600">ファイルをここにドロップしてください</p>
            ) : (
              <div>
                <p className="text-lg text-gray-600 mb-2">
                  ファイルをドラッグ&ドロップするか、クリックして選択
                </p>
                <p className="text-sm text-gray-500">CSVファイルのみ対応</p>
              </div>
            )}
          </div>

          {/* プログレスバー */}
          {isUploading && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-600 mt-2">処理中... {uploadProgress}%</p>
            </div>
          )}

          {/* エラー表示 */}
          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* アップロードされたファイル情報 */}
          {uploadedFile && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">{uploadedFile.name}</p>
                    <p className="text-sm text-green-600">{processedData.length}件の取引データ</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* データプレビュー */}
      {processedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              読み込み完了
            </CardTitle>
            <CardDescription>
              {processedData.length}件の取引データが正常に読み込まれました
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {processedData.slice(0, 10).map((transaction, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm"
                >
                  <div>
                    <span className="font-medium">{transaction.date}</span>
                    <span className="ml-2 text-gray-600">{transaction.description}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-medium ${
                        transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.amount >= 0 ? '+' : ''}
                      {transaction.amount.toLocaleString()}円
                    </span>
                    <div className="text-xs text-gray-500">
                      残高: {transaction.balance.toLocaleString()}円
                    </div>
                  </div>
                </div>
              ))}
              {processedData.length > 10 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  他 {processedData.length - 10} 件の取引...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 使用方法の説明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用方法</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium mb-2">1. 銀行からCSVファイルをダウンロード</h4>
            <p className="text-sm text-gray-600">
              各銀行のオンラインバンキングから、過去3ヶ月の入出金履歴をCSV形式でダウンロードしてください
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">2. ファイル形式</h4>
            <p className="text-sm text-gray-600">CSVファイルの形式: 日付, 取引内容, 金額, 残高</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">3. 自動処理</h4>
            <p className="text-sm text-gray-600">
              アップロード後、自動でデータが解析され、資産管理システムに取り込まれます
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankDataUploader;
