import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CSVUploadResult {
  success: boolean;
  message: string;
  importedCount: number;
  errors: string[];
}

interface BankCSVUploaderProps {
  onUploadComplete: (result: CSVUploadResult) => void;
  userId: string;
}

export const BankCSVUploader: React.FC<BankCSVUploaderProps> = ({ onUploadComplete, userId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSVテンプレートのダウンロード
  const downloadTemplate = () => {
    const csvContent = [
      '銀行名,口座種別,口座番号,支店名,口座名,残高,メイン口座',
      '三井住友銀行,普通預金,1234567,新宿支店,メイン口座,1500000,true',
      '三菱UFJ銀行,貯蓄預金,7654321,渋谷支店,貯蓄口座,3000000,false',
      '楽天銀行,普通預金,9876543,本店,楽天口座,500000,false',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'bank_accounts_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSVファイルの解析
  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter((line) => line.trim());
    const headers = lines[0].split(',').map((h) => h.trim());

    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map((v) => v.trim());
      const row: any = {};

      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });

      return {
        ...row,
        rowNumber: index + 2, // ヘッダー行を除いた行番号
      };
    });
  };

  // データの検証
  const validateData = (data: any[]): { valid: any[]; errors: string[] } => {
    const valid: any[] = [];
    const errors: string[] = [];

    data.forEach((row, index) => {
      const rowErrors: string[] = [];

      // 必須フィールドのチェック
      if (!row['銀行名']) rowErrors.push('銀行名が入力されていません');
      if (!row['口座種別']) rowErrors.push('口座種別が入力されていません');
      if (!row['口座番号']) rowErrors.push('口座番号が入力されていません');
      if (!row['口座名']) rowErrors.push('口座名が入力されていません');

      // 残高の数値チェック
      if (row['残高'] && isNaN(Number(row['残高']))) {
        rowErrors.push('残高は数値で入力してください');
      }

      // メイン口座の真偽値チェック
      if (
        row['メイン口座'] &&
        !['true', 'false', '1', '0', 'yes', 'no'].includes(row['メイン口座'].toLowerCase())
      ) {
        rowErrors.push('メイン口座は true/false で入力してください');
      }

      if (rowErrors.length > 0) {
        errors.push(`行${row.rowNumber}: ${rowErrors.join(', ')}`);
      } else {
        valid.push({
          bankName: row['銀行名'],
          accountType: mapAccountType(row['口座種別']),
          accountNumber: row['口座番号'],
          branchName: row['支店名'] || '',
          accountName: row['口座名'],
          lastBalance: row['残高'] ? Number(row['残高']) : 0,
          isMain: ['true', '1', 'yes'].includes(row['メイン口座']?.toLowerCase() || 'false'),
        });
      }
    });

    return { valid, errors };
  };

  // 口座種別のマッピング
  const mapAccountType = (
    type: string
  ): 'checking' | 'savings' | 'time_deposit' | 'credit_card' => {
    const typeMap: { [key: string]: 'checking' | 'savings' | 'time_deposit' | 'credit_card' } = {
      普通預金: 'checking',
      当座預金: 'checking',
      貯蓄預金: 'savings',
      定期預金: 'time_deposit',
      クレジットカード: 'credit_card',
      checking: 'checking',
      savings: 'savings',
      time_deposit: 'time_deposit',
      credit_card: 'credit_card',
    };

    return typeMap[type] || 'checking';
  };

  // ファイルアップロード処理
  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('CSVファイルを選択してください');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const text = await file.text();
      setUploadProgress(25);

      const parsedData = parseCSV(text);
      setUploadProgress(50);

      const { valid, errors } = validateData(parsedData);
      setUploadProgress(75);

      if (valid.length === 0) {
        throw new Error('有効なデータがありません');
      }

      // サーバーにデータを送信
      const response = await fetch('/api/bank-accounts/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          accounts: valid,
        }),
      });

      setUploadProgress(90);

      const result = await response.json();
      setUploadProgress(100);

      if (result.success) {
        toast.success(`${valid.length}件の口座データをインポートしました`);
        onUploadComplete({
          success: true,
          message: `${valid.length}件の口座データをインポートしました`,
          importedCount: valid.length,
          errors,
        });
      } else {
        throw new Error(result.message || 'インポートに失敗しました');
      }
    } catch (error) {
      console.error('CSVアップロードエラー:', error);
      toast.error(error instanceof Error ? error.message : 'ファイルの処理に失敗しました');
      onUploadComplete({
        success: false,
        message: error instanceof Error ? error.message : 'ファイルの処理に失敗しました',
        importedCount: 0,
        errors: [],
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          CSVファイルで銀行口座をインポート
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* テンプレートダウンロード */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            📋 CSVテンプレートをダウンロード
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            正しい形式でCSVファイルを作成するために、テンプレートをダウンロードしてください。
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadTemplate}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <Download className="h-4 w-4 mr-2" />
            テンプレートをダウンロード
          </Button>
        </div>

        {/* アップロードエリア */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
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

          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />

          <h3 className="text-lg font-medium text-gray-900 mb-2">CSVファイルをアップロード</h3>

          <p className="text-sm text-gray-600 mb-4">
            ファイルをドラッグ&ドロップするか、クリックして選択してください
          </p>

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="mb-2"
          >
            <FileText className="h-4 w-4 mr-2" />
            ファイルを選択
          </Button>

          <p className="text-xs text-gray-500">対応形式: CSV (.csv)</p>
        </div>

        {/* アップロード進捗 */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>アップロード中...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* 使用方法の説明 */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">📝 CSVファイルの形式</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              <strong>必須項目:</strong> 銀行名, 口座種別, 口座番号, 口座名
            </p>
            <p>
              <strong>任意項目:</strong> 支店名, 残高, メイン口座
            </p>
            <p>
              <strong>口座種別:</strong> 普通預金, 貯蓄預金, 定期預金, クレジットカード
            </p>
            <p>
              <strong>メイン口座:</strong> true/false または 1/0
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
