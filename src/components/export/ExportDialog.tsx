import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileImage,
  Calendar as CalendarIcon,
  Filter,
  Settings,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TodoItem } from '@/types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf' | 'json';
  includeCompleted: boolean;
  includePending: boolean;
  includeMetadata: boolean;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  fields: string[];
  groupBy: 'none' | 'category' | 'priority' | 'status';
}

interface ExportDialogProps {
  trigger?: React.ReactNode;
  onExport?: (data: any, options: ExportOptions) => void;
}

const availableFields = [
  { id: 'task', label: 'タスク名', required: true },
  { id: 'completed', label: '完了状態', required: false },
  { id: 'priority', label: '優先度', required: false },
  { id: 'category', label: 'カテゴリ', required: false },
  { id: 'type', label: 'タイプ', required: false },
  { id: 'deadline', label: '期限', required: false },
  { id: 'createdAt', label: '作成日', required: false },
  { id: 'completedDate', label: '完了日', required: false },
  { id: 'estimatedDuration', label: '予定時間', required: false },
  { id: 'tags', label: 'タグ', required: false },
  { id: 'note', label: 'メモ', required: false },
];

const formatOptions = [
  {
    value: 'csv',
    label: 'CSV形式',
    description: 'Excel等で開けるカンマ区切りファイル',
    icon: FileSpreadsheet,
    color: 'text-green-600',
  },
  {
    value: 'xlsx',
    label: 'Excel形式',
    description: 'Microsoft Excel形式のスプレッドシート',
    icon: FileSpreadsheet,
    color: 'text-blue-600',
  },
  {
    value: 'pdf',
    label: 'PDF形式',
    description: '印刷可能なPDFレポート',
    icon: FileText,
    color: 'text-red-600',
  },
  {
    value: 'json',
    label: 'JSON形式',
    description: 'プログラム処理用のJSONデータ',
    icon: FileText,
    color: 'text-purple-600',
  },
];

export const ExportDialog: React.FC<ExportDialogProps> = ({ trigger, onExport }) => {
  const todos = useSelector((state: RootState) => state.todo.items);
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    includeCompleted: true,
    includePending: true,
    includeMetadata: true,
    dateRange: {
      from: null,
      to: null,
    },
    fields: ['task', 'completed', 'priority', 'deadline'],
    groupBy: 'none',
  });

  // フィルタリングされたタスクの計算
  const filteredTasks = useMemo(() => {
    return todos.filter((todo) => {
      // 完了状態でフィルタ
      if (!options.includeCompleted && todo.completed) return false;
      if (!options.includePending && !todo.completed) return false;

      // 日付範囲でフィルタ
      if (options.dateRange.from || options.dateRange.to) {
        const taskDate = todo.deadline
          ? new Date(todo.deadline)
          : new Date(todo.createdAt || new Date());

        if (options.dateRange.from && taskDate < options.dateRange.from) return false;
        if (options.dateRange.to && taskDate > options.dateRange.to) return false;
      }

      return true;
    });
  }, [todos, options.includeCompleted, options.includePending, options.dateRange]);

  // エクスポート実行
  const handleExport = async () => {
    setIsExporting(true);

    try {
      const exportData = prepareExportData();

      switch (options.format) {
        case 'csv':
          downloadCSV(exportData);
          break;
        case 'xlsx':
          await downloadExcel(exportData);
          break;
        case 'pdf':
          await downloadPDF(exportData);
          break;
        case 'json':
          downloadJSON(exportData);
          break;
      }

      toast.success(`${options.format.toUpperCase()}ファイルをダウンロードしました`);
      onExport?.(exportData, options);
      setOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('エクスポートに失敗しました');
    } finally {
      setIsExporting(false);
    }
  };

  // エクスポートデータの準備
  const prepareExportData = () => {
    const data = filteredTasks.map((todo) => {
      const row: Record<string, any> = {};

      options.fields.forEach((field) => {
        switch (field) {
          case 'task':
            row['タスク名'] = todo.task;
            break;
          case 'completed':
            row['完了状態'] = todo.completed ? '完了' : '未完了';
            break;
          case 'priority':
            row['優先度'] = getPriorityLabel(todo.priority);
            break;
          case 'category':
            row['カテゴリ'] = todo.category || '未設定';
            break;
          case 'type':
            row['タイプ'] = todo.type || '未設定';
            break;
          case 'deadline':
            row['期限'] = todo.deadline
              ? format(new Date(todo.deadline), 'yyyy/MM/dd', { locale: ja })
              : '';
            break;
          case 'createdAt':
            row['作成日'] = todo.createdAt
              ? format(new Date(todo.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })
              : '';
            break;
          case 'completedDate':
            row['完了日'] = todo.completedDate
              ? format(new Date(todo.completedDate), 'yyyy/MM/dd HH:mm', { locale: ja })
              : '';
            break;
          case 'estimatedDuration':
            row['予定時間'] = todo.estimatedDuration
              ? `${Math.ceil(todo.estimatedDuration / 60)}時間`
              : '';
            break;
          case 'tags':
            row['タグ'] = todo.tags?.join(', ') || '';
            break;
          case 'note':
            row['メモ'] = todo.note || '';
            break;
        }
      });

      if (options.includeMetadata) {
        row['ID'] = todo._id;
        row['isPrioritized'] = todo.isPrioritized ? 'はい' : 'いいえ';
      }

      return row;
    });

    // グループ化
    if (options.groupBy !== 'none') {
      return groupData(data);
    }

    return data;
  };

  // データのグループ化
  const groupData = (data: Record<string, any>[]) => {
    const groups: Record<string, Record<string, any>[]> = {};

    data.forEach((row) => {
      let groupKey = '未分類';

      switch (options.groupBy) {
        case 'category':
          groupKey = row['カテゴリ'] || '未分類';
          break;
        case 'priority':
          groupKey = row['優先度'] || '未設定';
          break;
        case 'status':
          groupKey = row['完了状態'] || '未設定';
          break;
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(row);
    });

    return groups;
  };

  // CSV ダウンロード
  const downloadCSV = (data: any) => {
    const isGrouped = options.groupBy !== 'none';
    let csvContent = '';

    if (isGrouped) {
      Object.entries(data).forEach(([groupName, items]) => {
        csvContent += `\n【${groupName}】\n`;
        csvContent += convertToCSV(items as Record<string, any>[]);
        csvContent += '\n';
      });
    } else {
      csvContent = convertToCSV(data);
    }

    downloadFile(csvContent, 'tasks-export.csv', 'text/csv;charset=utf-8;');
  };

  // Excel ダウンロード
  const downloadExcel = async (data: any) => {
    // xlsx ライブラリが利用可能な場合の実装
    // 簡易版として CSV と同じ処理
    toast('Excel形式は現在開発中です。CSV形式をお試しください。');
  };

  // PDF ダウンロード
  const downloadPDF = async (data: any) => {
    // jsPDF ライブラリが利用可能な場合の実装
    toast('PDF形式は現在開発中です。CSV形式をお試しください。');
  };

  // JSON ダウンロード
  const downloadJSON = (data: any) => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, 'tasks-export.json', 'application/json;charset=utf-8;');
  };

  // ファイルダウンロード共通処理
  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // CSV変換
  const convertToCSV = (data: Record<string, any>[]): string => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]?.toString() || '';
            // カンマや改行を含む場合はダブルクォートで囲む
            return value.includes(',') || value.includes('\n') || value.includes('"')
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          })
          .join(',')
      ),
    ];

    return csvRows.join('\n');
  };

  // 優先度ラベル取得
  const getPriorityLabel = (priority: number): string => {
    if (priority <= 2) return '高';
    if (priority <= 4) return '中';
    return '低';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            エクスポート
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            📊 データエクスポート
          </DialogTitle>
          <DialogDescription>
            タスクデータを様々な形式でエクスポートできます。設定をカスタマイズしてください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* エクスポート形式選択 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📁 エクスポート形式</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formatOptions.map((format) => {
                  const Icon = format.icon;
                  return (
                    <Card
                      key={format.value}
                      className={`cursor-pointer transition-all duration-200 ${
                        options.format === format.value
                          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      onClick={() => setOptions({ ...options, format: format.value as any })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Icon className={`h-6 w-6 ${format.color}`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{format.label}</h3>
                              {options.format === format.value && (
                                <CheckCircle className="h-4 w-4 text-blue-500" />
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {format.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* フィルタ設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                🔍 フィルタ設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 完了状態フィルタ */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">含めるタスク</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCompleted"
                      checked={options.includeCompleted}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, includeCompleted: !!checked })
                      }
                    />
                    <Label htmlFor="includeCompleted">完了済みタスク</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includePending"
                      checked={options.includePending}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, includePending: !!checked })
                      }
                    />
                    <Label htmlFor="includePending">未完了タスク</Label>
                  </div>
                </div>
              </div>

              {/* 日付範囲 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">期間指定</Label>
                <div className="flex gap-2 items-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {options.dateRange.from
                          ? format(options.dateRange.from, 'yyyy/MM/dd')
                          : '開始日'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={options.dateRange.from || undefined}
                        onSelect={(date) =>
                          setOptions({
                            ...options,
                            dateRange: { ...options.dateRange, from: date || null },
                          })
                        }
                      />
                    </PopoverContent>
                  </Popover>

                  <span>〜</span>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {options.dateRange.to
                          ? format(options.dateRange.to, 'yyyy/MM/dd')
                          : '終了日'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={options.dateRange.to || undefined}
                        onSelect={(date) =>
                          setOptions({
                            ...options,
                            dateRange: { ...options.dateRange, to: date || null },
                          })
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 出力項目設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                ⚙️ 出力項目設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* フィールド選択 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">出力する項目</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableFields.map((field) => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={field.id}
                        checked={options.fields.includes(field.id)}
                        disabled={field.required}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setOptions({
                              ...options,
                              fields: [...options.fields, field.id],
                            });
                          } else {
                            setOptions({
                              ...options,
                              fields: options.fields.filter((f) => f !== field.id),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={field.id} className={field.required ? 'text-slate-500' : ''}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* グループ化設定 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">グループ化</Label>
                <Select
                  value={options.groupBy}
                  onValueChange={(value) => setOptions({ ...options, groupBy: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">グループ化しない</SelectItem>
                    <SelectItem value="category">カテゴリ別</SelectItem>
                    <SelectItem value="priority">優先度別</SelectItem>
                    <SelectItem value="status">完了状態別</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* メタデータ含める */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMetadata"
                  checked={options.includeMetadata}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, includeMetadata: !!checked })
                  }
                />
                <Label htmlFor="includeMetadata">技術情報（ID等）を含める</Label>
              </div>
            </CardContent>
          </Card>

          {/* プレビュー */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">👁️ プレビュー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <p>
                  📋 対象タスク数: <strong>{filteredTasks.length}</strong>件
                </p>
                <p>
                  📊 出力項目数: <strong>{options.fields.length}</strong>項目
                </p>
                <p>
                  📁 ファイル形式:{' '}
                  <strong>{formatOptions.find((f) => f.value === options.format)?.label}</strong>
                </p>
                {options.groupBy !== 'none' && (
                  <p>
                    📂 グループ化:{' '}
                    <strong>
                      {options.groupBy === 'category'
                        ? 'カテゴリ別'
                        : options.groupBy === 'priority'
                          ? '優先度別'
                          : '完了状態別'}
                    </strong>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* アクションボタン */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || filteredTasks.length === 0}
              className="gap-2"
            >
              {isExporting ? (
                <>処理中...</>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  エクスポート実行
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
