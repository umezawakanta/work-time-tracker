import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, AlertCircle, Download, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { TransactionImportResult, CSVTransactionData } from '@/types/transaction';

interface TransactionCSVUploaderProps {
  onUploadComplete: (result: TransactionImportResult) => void;
  userId: string;
}

export const TransactionCSVUploader: React.FC<TransactionCSVUploaderProps> = ({
  onUploadComplete,
  userId,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSVテンプレートのダウンロード
  const downloadTemplate = () => {
    const csvContent = [
      '日付,取引内容,金額,カテゴリ,口座名',
      '2024-01-01,給与,300000,給与,メイン口座',
      '2024-01-02,コンビニ,500,食費,メイン口座',
      '2024-01-03,電車代,200,交通費,メイン口座',
      '2024-01-04,スーパー,3000,食費,メイン口座',
      '2024-01-05,ガソリン代,5000,交通費,メイン口座',
      '2024-01-06,外食,2500,食費,メイン口座',
      '2024-01-07,家賃,-80000,住居費,メイン口座',
      '2024-01-08,光熱費,-15000,光熱費,メイン口座',
      '2024-01-09,携帯代,-5000,通信費,メイン口座',
      '2024-01-10,ボーナス,100000,給与,メイン口座',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transaction_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 三井住友銀行の取引明細CSVを解析
  const parseSMBCTransactionCSV = (csvText: string): CSVTransactionData[] => {
    const lines = csvText.split('\n').filter((line) => line.trim());

    // ヘッダー行を検出
    let headerIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('年月日') || line.includes('日付') || line.includes('date')) {
        headerIndex = i;
        break;
      }
    }

    const headers = lines[headerIndex].split(',').map((h) => h.trim());
    console.log('SMBC Headers detected:', headers);

    const transactions: CSVTransactionData[] = [];

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map((v) => v.trim());
      if (values.length < headers.length) continue;

      try {
        // 日付の解析
        let date = '';
        let amount = 0;
        let description = '';

        // 日付フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (header.includes('年月日') || header.includes('日付') || header.includes('date')) {
            date = values[j];
            break;
          }
        }

        // 金額フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (header.includes('金額') || header.includes('残高') || header.includes('amount')) {
            const amountStr = values[j].replace(/[^\d.-]/g, '');
            amount = parseFloat(amountStr) || 0;
            break;
          }
        }

        // 取引内容フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (
            header.includes('内容') ||
            header.includes('摘要') ||
            header.includes('description')
          ) {
            description = values[j];
            break;
          }
        }

        if (date && amount !== 0) {
          // 日付の形式を統一
          const dateObj = new Date(date);
          const formattedDate = dateObj.toISOString().split('T')[0];

          // カテゴリの自動判定
          let category = 'その他';
          const desc = description.toLowerCase();
          if (desc.includes('給与') || desc.includes('ボーナス')) category = '給与';
          else if (
            desc.includes('食費') ||
            desc.includes('コンビニ') ||
            desc.includes('スーパー') ||
            desc.includes('外食')
          )
            category = '食費';
          else if (desc.includes('交通費') || desc.includes('電車') || desc.includes('ガソリン'))
            category = '交通費';
          else if (desc.includes('住居費') || desc.includes('家賃')) category = '住居費';
          else if (desc.includes('光熱費') || desc.includes('電気') || desc.includes('ガス'))
            category = '光熱費';
          else if (desc.includes('通信費') || desc.includes('携帯')) category = '通信費';

          transactions.push({
            date: formattedDate,
            description: description || '取引',
            amount: amount,
            category: category,
            accountName: 'メイン口座',
          });
        }
      } catch (error) {
        console.error('Error parsing line:', line, error);
      }
    }

    return transactions;
  };

  // 汎用CSVを解析
  const parseGenericCSV = (csvText: string): CSVTransactionData[] => {
    const lines = csvText.split('\n').filter((line) => line.trim());
    const headers = lines[0].split(',').map((h) => h.trim());

    const transactions: CSVTransactionData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map((v) => v.trim());
      if (values.length < 5) continue;

      try {
        const [date, description, amountStr, category, accountName] = values;
        const amount = parseFloat(amountStr) || 0;

        if (date && description && amount !== 0) {
          transactions.push({
            date: date,
            description: description,
            amount: amount,
            category: category || 'その他',
            accountName: accountName || 'メイン口座',
          });
        }
      } catch (error) {
        console.error('Error parsing line:', line, error);
      }
    }

    return transactions;
  };

  // CSVファイルの解析
  const parseCSV = (csvText: string): CSVTransactionData[] => {
    // 三井住友銀行の形式かどうかを判定
    const isSMBCFormat = csvText.includes('年月日') || csvText.includes('残高');

    if (isSMBCFormat) {
      console.log('Detected SMBC format');
      return parseSMBCTransactionCSV(csvText);
    } else {
      console.log('Detected generic format');
      return parseGenericCSV(csvText);
    }
  };

  // データの検証
  const validateData = (data: CSVTransactionData[]): string[] => {
    const errors: string[] = [];

    data.forEach((item, index) => {
      const rowNum = index + 2; // ヘッダー行を考慮

      if (!item.date) {
        errors.push(`行${rowNum}: 日付が入力されていません`);
      }
      if (!item.description) {
        errors.push(`行${rowNum}: 取引内容が入力されていません`);
      }
      if (item.amount === 0) {
        errors.push(`行${rowNum}: 金額が0または入力されていません`);
      }
    });

    return errors;
  };

  // ファイルアップロード処理
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // ファイルの読み込み
      const text = await file.text();
      console.log('File content preview:', text.substring(0, 500));

      // CSVの解析
      const transactions = parseCSV(text);
      console.log('Parsed transactions:', transactions);

      if (transactions.length === 0) {
        throw new Error('有効なデータがありません');
      }

      // データの検証
      const errors = validateData(transactions);
      if (errors.length > 0) {
        throw new Error(`データの検証に失敗しました: ${errors.join(', ')}`);
      }

      setUploadProgress(50);

      // サーバーに送信
      const response = await fetch('/api/transactions/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          transactions,
        }),
      });

      setUploadProgress(80);

      const result = await response.json();
      console.log('Import result:', result);

      if (result.success) {
        setUploadProgress(100);
        toast.success(`${result.importedCount}件の取引明細をインポートしました`);
        onUploadComplete(result);
      } else {
        throw new Error(result.message || 'インポートに失敗しました');
      }
    } catch (error) {
      console.error('CSV upload error:', error);
      toast.error(
        `CSVアップロードエラー: ${error instanceof Error ? error.message : '不明なエラー'}`
      );
      onUploadComplete({
        success: false,
        message: error instanceof Error ? error.message : '不明なエラー',
        importedCount: 0,
        errors: [],
        transactions: [],
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // ドラッグ&ドロップ処理
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">取引明細CSVインポート</h3>
        <p className="text-gray-600">
          日々の収支を把握するために、銀行の取引明細CSVファイルをアップロードしてください
        </p>
      </div>

      {/* テンプレートダウンロード */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">CSVテンプレートをダウンロード</h4>
              <p className="text-sm text-blue-700">
                正しい形式でCSVファイルを作成するためのテンプレートです
              </p>
            </div>
            <Button onClick={downloadTemplate} variant="outline" className="border-blue-300">
              <Download className="h-4 w-4 mr-2" />
              テンプレートをダウンロード
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* アップロードエリア */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <CardContent
          className="p-8 text-center"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                取引明細CSVファイルをアップロード
              </h4>
              <p className="text-gray-600 mb-4">
                ファイルをドラッグ&ドロップするか、クリックして選択してください
              </p>

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="mb-4"
              >
                <FileText className="h-4 w-4 mr-2" />
                ファイルを選択
              </Button>
            </div>

            {/* 対応形式 */}
            <div className="text-sm text-gray-500">
              <p className="font-semibold mb-2">対応形式:</p>
              <ul className="space-y-1">
                <li>• 三井住友銀行の取引明細CSV</li>
                <li>• 汎用CSV形式（日付,取引内容,金額,カテゴリ,口座名）</li>
                <li>• 文字エンコーディング: Shift_JIS, UTF-8, EUC-JP</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* プログレスバー */}
      {isUploading && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>アップロード中...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
