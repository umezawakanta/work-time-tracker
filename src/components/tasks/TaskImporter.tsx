import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  FileJson,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  X,
} from 'lucide-react';
import { AppDispatch } from '@/store';
import { addTodoItem } from '@/store/todoSlice';
import { TodoItem } from '@/types';
import {
  convertImportDataToTodoItems,
  convertCSVToTodoItems,
  validateImportData,
} from '@/utils/taskImportUtils';
import { toast } from 'react-hot-toast';

interface TaskImporterProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImportPreview {
  tasks: Omit<TodoItem, '_id'>[];
  summary: {
    totalTasks: number;
    phaseCount: number;
    categories: string[];
    priorityDistribution: Record<number, number>;
    typeDistribution: Record<string, number>;
  };
}

export const TaskImporter: React.FC<TaskImporterProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'json' | 'csv'>('json');

  // ファイル選択処理
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);
    setImportPreview(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;

        if (activeTab === 'json') {
          parseJSONFile(content);
        } else {
          parseCSVFile(content);
        }
      } catch (error) {
        setError('ファイルの読み込みに失敗しました');
      }
    };

    reader.readAsText(file);
  };

  // JSONファイルの解析
  const parseJSONFile = (content: string) => {
    try {
      const data = JSON.parse(content);
      validateImportData(data);

      const todoItems = convertImportDataToTodoItems(data);
      generatePreview(todoItems, data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'JSONファイルの形式が正しくありません');
    }
  };

  // CSVファイルの解析
  const parseCSVFile = (content: string) => {
    try {
      const todoItems = convertCSVToTodoItems(content);
      generatePreview(todoItems);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'CSVファイルの形式が正しくありません');
    }
  };

  // プレビューデータの生成
  const generatePreview = (todoItems: Omit<TodoItem, '_id'>[], originalData?: any) => {
    const categories = Array.from(new Set(todoItems.map((item) => item.category || '未分類')));
    const priorityDistribution: Record<number, number> = {};
    const typeDistribution: Record<string, number> = {};

    todoItems.forEach((item) => {
      priorityDistribution[item.priority] = (priorityDistribution[item.priority] || 0) + 1;
      typeDistribution[item.type || 'input'] = (typeDistribution[item.type || 'input'] || 0) + 1;
    });

    const phaseCount = originalData ? originalData.length : 1;

    setImportPreview({
      tasks: todoItems,
      summary: {
        totalTasks: todoItems.length,
        phaseCount,
        categories,
        priorityDistribution,
        typeDistribution,
      },
    });
  };

  // タスクのインポート実行
  const handleImport = async () => {
    if (!importPreview) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      const tasks = importPreview.tasks;
      const totalTasks = tasks.length;

      for (let i = 0; i < totalTasks; i++) {
        const task = tasks[i];
        await dispatch(
          addTodoItem({
            task: task.task,
            priority: task.priority,
            isPrioritized: task.isPrioritized,
            type: task.type,
            deadline: task.deadline,
          })
        ).unwrap();

        setImportProgress(Math.round(((i + 1) / totalTasks) * 100));

        // UIの応答性を保つために小さな遅延を追加
        if (i % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }

      toast.success(`${totalTasks}個のタスクをインポートしました`);
      onClose();
      resetState();
    } catch (error) {
      toast.error('タスクのインポートに失敗しました');
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  // 状態のリセット
  const resetState = () => {
    setSelectedFile(null);
    setImportPreview(null);
    setError(null);
    setImportProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 優先度のラベル取得
  const getPriorityLabel = (priority: number) => {
    const labels = { 1: '最高', 2: '高', 3: '中', 4: '低', 5: '最低' };
    return labels[priority as keyof typeof labels] || '未設定';
  };

  // サンプルJSONのダウンロード
  const downloadSampleJSON = () => {
    const sampleData = [
      {
        phase: 'サンプルフェーズ',
        tasks: [
          {
            task: 'サンプルタスク1',
            description: 'サンプルタスクの説明',
            priority: 2,
            type: 'output',
            category: '開発',
            estimatedDuration: 60,
          },
        ],
      },
    ];

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-tasks.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // サンプルCSVのダウンロード
  const downloadSampleCSV = () => {
    const csvContent = `task,description,priority,type,category,estimatedDuration
サンプルタスク1,サンプルタスクの説明,2,output,開発,60
サンプルタスク2,別のサンプルタスク,3,input,設計,30`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-tasks.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            タスクインポート
          </DialogTitle>
          <DialogDescription>
            JSONまたはCSVファイルからタスクを一括インポートできます
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'json' | 'csv')}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="json" className="flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              JSON形式
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              CSV形式
            </TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">JSON形式でインポート</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileJson className="h-4 w-4" />
                  test-tasks.json と同じ形式のファイルをアップロードしてください
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    ファイルを選択
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={downloadSampleJSON}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    サンプルダウンロード
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="csv" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">CSV形式でインポート</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  task, description, priority, type, category, estimatedDuration の列が必要です
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    ファイルを選択
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={downloadSampleCSV}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    サンプルダウンロード
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <input
          ref={fileInputRef}
          type="file"
          accept={activeTab === 'json' ? '.json' : '.csv'}
          onChange={handleFileSelect}
          className="hidden"
          aria-label="タスクファイルを選択"
        />

        {selectedFile && (
          <Alert>
            <FileJson className="h-4 w-4" />
            <AlertDescription>
              選択ファイル: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {importPreview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                インポートプレビュー
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {importPreview.summary.totalTasks}
                  </div>
                  <div className="text-sm text-gray-600">総タスク数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {importPreview.summary.phaseCount}
                  </div>
                  <div className="text-sm text-gray-600">フェーズ数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {importPreview.summary.categories.length}
                  </div>
                  <div className="text-sm text-gray-600">カテゴリ数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {importPreview.summary.typeDistribution.output || 0}
                  </div>
                  <div className="text-sm text-gray-600">アウトプット</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">カテゴリ</h4>
                <div className="flex flex-wrap gap-1">
                  {importPreview.summary.categories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">優先度分布</h4>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(importPreview.summary.priorityDistribution).map(
                    ([priority, count]) => (
                      <Badge key={priority} variant="outline">
                        {getPriorityLabel(Number(priority))}: {count}個
                      </Badge>
                    )
                  )}
                </div>
              </div>

              {isImporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>インポート中...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onClose();
              resetState();
            }}
            disabled={isImporting}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={!importPreview || isImporting}
            className="flex items-center gap-2"
          >
            {isImporting ? (
              <>処理中...</>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                {importPreview?.summary.totalTasks || 0}個のタスクをインポート
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskImporter;
