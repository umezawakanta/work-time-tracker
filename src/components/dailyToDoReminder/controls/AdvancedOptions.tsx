import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Save, Download, Upload, Info, AlertCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

// 型定義とサービスのインポート
import { TodoStats } from '@/types/todo';
import {
  exportTasks,
  importTasks,
  adjustTaskPriorities,
  checkPremiumStatus,
} from '@/services/todoStatsService';

// サブコンポーネントのインポート
import { StatisticsSummary } from './StatisticsSummary';
import { PremiumFeatureBanner } from './PremiumFeatureBanner';

interface AdvancedOptionsProps {
  autoAdjustEnabled: boolean;
  setAutoAdjustEnabled: (enabled: boolean) => void;
  onAdjustPriorities: () => void;
  recentActions: Array<{ action: string; timestamp: number }>;
  getElapsedTime: (timestamp: number) => string;
  statistics?: TodoStats;
  onShowFullStats?: () => void;
}

/**
 * プレミアム向け高度なオプションコンポーネント
 * インポート/エクスポート、最近のアクション、自動調整設定を含む
 */
const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  autoAdjustEnabled,
  setAutoAdjustEnabled,
  onAdjustPriorities,
  recentActions,
  getElapsedTime,
  statistics,
  onShowFullStats,
}) => {
  // 状態管理
  const [exportFormat, setExportFormat] = useState<string>(
    () => localStorage.getItem('exportFormat') || 'csv'
  );
  const [importFormat, setImportFormat] = useState<string>('auto');
  const [showAllActivities, setShowAllActivities] = useState<boolean>(false);
  const [achievementDetails, setAchievementDetails] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [exportError, setExportError] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [premiumExpiry, setPremiumExpiry] = useState<string | undefined>(undefined);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState<boolean>(false);

  // 統計データが存在しない場合のフォールバック
  const defaultStats: TodoStats = {
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    averageCompletionTime: 0,
    inputTasks: 0,
    outputTasks: 0,
    inputOutputRatio: 1,
    tasksCompletedBeforeDeadline: 0,
    tasksCompletedAfterDeadline: 0,
    deadlineMeetRate: 0,
    streakDays: 0,
    longestStreak: 0,
  };

  const stats = statistics || defaultStats;

  // プレミアムステータスの確認
  useEffect(() => {
    const checkUserPremiumStatus = async () => {
      try {
        const status = await checkPremiumStatus();
        setIsPremium(status.isPremium);
        setPremiumExpiry(status.expiresAt);
      } catch (error) {
        console.error('プレミアムステータス確認エラー:', error);
        setIsPremium(false);
      }
    };

    checkUserPremiumStatus();
  }, []);

  // ファイル形式を自動検出
  const detectFileFormat = (file: File | null): string => {
    if (!file) return 'unknown';

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'csv') return 'csv';
    if (extension === 'json') return 'json';
    if (extension === 'ics' || extension === 'ical') return 'ical';
    return 'unknown';
  };

  useEffect(() => {
    if (importFile) {
      const format = detectFileFormat(importFile);
      setImportFormat(format);
    }
  }, [importFile]);

  // ファイルのバリデーション
  const validateImportFile = (file: File | null): boolean => {
    if (!file) return false;

    // ファイルサイズの制限（10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setExportError('ファイルサイズが大きすぎます（最大10MB）');
      return false;
    }

    const format = detectFileFormat(file);
    if (format === 'unknown') {
      setExportError('サポートされていないファイル形式です');
      return false;
    }

    setExportError(null);
    return true;
  };

  // 実際のインポート処理
  const handleImport = async () => {
    if (!importFile) return;

    if (!validateImportFile(importFile)) return;

    setIsImporting(true);
    setImportProgress(10);

    try {
      // インポート開始
      const format = importFormat === 'auto' ? detectFileFormat(importFile) : importFormat;

      // 進捗表示のためのタイマー
      const progressTracker = setInterval(() => {
        setImportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressTracker);
            return 90;
          }
          return prev + 5;
        });
      }, 200);

      // 実際のインポート処理を呼び出し
      const result = await importTasks(importFile, format);

      // プログレストラッカーをクリア
      clearInterval(progressTracker);

      // 成功時の処理
      if (result.success) {
        setImportProgress(100);
        setExportError(null);

        // リセット
        setTimeout(() => {
          setImportProgress(0);
          setIsImporting(false);
          setImportFile(null);
        }, 1000);
      } else {
        // 失敗時の処理
        setImportProgress(0);
        setIsImporting(false);
        setExportError(result.error || 'インポートに失敗しました');
      }
    } catch (error) {
      console.error('インポートエラー:', error);
      setExportError('インポート中にエラーが発生しました');
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  // 実際のエクスポート処理
  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      // エクスポート形式を保存
      localStorage.setItem('exportFormat', exportFormat);

      // 実際のエクスポート処理を呼び出し
      const result = await exportTasks(exportFormat);

      if (!result.success) {
        setExportError(result.error || 'エクスポートに失敗しました');
      }

      // 完了
      setTimeout(() => {
        setIsExporting(false);
      }, 1000);
    } catch (error) {
      console.error('エクスポートエラー:', error);
      setExportError('エクスポート中にエラーが発生しました');
      setIsExporting(false);
    }
  };

  // 優先度調整処理
  const handleAdjustPriorities = async () => {
    try {
      const result = await adjustTaskPriorities();

      if (result.success) {
        // 親コンポーネントのコールバックを呼び出し
        onAdjustPriorities();
      } else {
        setExportError(result.error || '優先度調整に失敗しました');
      }
    } catch (error) {
      console.error('優先度調整エラー:', error);
      setExportError('優先度調整中にエラーが発生しました');
    }
  };

  // アクションのフィルタリングと表示
  const filteredActions = showAllActivities ? recentActions : recentActions.slice(0, 5);

  // 達成率のスタイル計算
  const getCompletionRateStyle = (rate: number) => {
    if (rate >= 80) return 'text-green-700 bg-green-50';
    if (rate >= 60) return 'text-blue-700 bg-blue-50';
    if (rate >= 40) return 'text-amber-700 bg-amber-50';
    return 'text-gray-700 bg-gray-50';
  };

  // アップグレード処理
  const handleUpgrade = () => {
    setShowUpgradeDialog(true);
  };

  return (
    <>
      <PremiumFeatureBanner
        isPremium={isPremium}
        expiresAt={premiumExpiry}
        onUpgrade={handleUpgrade}
      />

      <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="import-export">
            <AccordionTrigger className="text-sm py-2">インポート/エクスポート</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col sm:flex-row gap-2 py-2">
                <div className="flex-1">
                  <Label htmlFor="file-upload" className="block text-xs mb-1 text-gray-500">
                    タスクのインポート (CSV/JSON)
                  </Label>
                  <div className="flex gap-2">
                    <input
                      id="file-upload"
                      type="file"
                      accept=".csv,.json"
                      className="text-xs w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      aria-label="タスクファイルをインポート"
                      disabled={isImporting || !isPremium}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!importFile || isImporting || !isPremium}
                      onClick={handleImport}
                    >
                      {isImporting ? (
                        <span className="text-xs">処理中...</span>
                      ) : (
                        <>
                          <Upload className="h-3 w-3 mr-1" />
                          <span className="text-xs">読込</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {isImporting && (
                    <div className="mt-2">
                      <Progress value={importProgress} className="h-1" />
                      <p className="text-xs text-gray-500 mt-1">
                        インポート中... {importProgress}%
                      </p>
                    </div>
                  )}

                  {importFile && !isImporting && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs bg-blue-50">
                        {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                      </Badge>
                      <span className="text-xs ml-2">
                        形式:{' '}
                        {importFormat === 'auto' ? detectFileFormat(importFile) : importFormat}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start mt-2">
                    <Info className="h-3 w-3 text-gray-400 mt-0.5 mr-1 flex-shrink-0" />
                    <p className="text-xs text-gray-500">
                      CSVファイル形式: ID,タスク名,タイプ,優先度,期限,完了状態
                    </p>
                  </div>

                  {exportError && (
                    <div className="flex items-start mt-2 text-red-600">
                      <AlertCircle className="h-3 w-3 mt-0.5 mr-1 flex-shrink-0" />
                      <p className="text-xs">{exportError}</p>
                    </div>
                  )}
                </div>

                <div className="md:min-w-[160px]">
                  <Label className="block text-xs mb-1 text-gray-500">タスクのエクスポート</Label>
                  <Select
                    value={exportFormat}
                    onValueChange={setExportFormat}
                    disabled={isExporting}
                  >
                    <SelectTrigger className="w-full text-xs h-8">
                      <SelectValue placeholder="形式を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV形式</SelectItem>
                      <SelectItem value="json">JSON形式</SelectItem>
                      <SelectItem value="ical">iCal形式</SelectItem>
                    </SelectContent>
                  </Select>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        disabled={isExporting || !isPremium}
                      >
                        {isExporting ? (
                          <span className="text-xs">処理中...</span>
                        ) : (
                          <>
                            <Download className="h-3 w-3 mr-1" />
                            <span className="text-xs">エクスポート</span>
                          </>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          setExportFormat('csv');
                          handleExport();
                        }}
                      >
                        CSV形式（汎用）
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setExportFormat('json');
                          handleExport();
                        }}
                      >
                        JSON形式（詳細）
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setExportFormat('ical');
                          handleExport();
                        }}
                      >
                        iCal形式（カレンダー）
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="mt-3 text-xs text-gray-500">
                    <p>エクスポート内容：</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>完了/未完了タスク</li>
                      <li>期限情報</li>
                      <li>タスクタイプ</li>
                      {exportFormat === 'json' && <li>詳細な統計データ</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="recent-activity">
            <AccordionTrigger className="text-sm py-2">最近のアクティビティ</AccordionTrigger>
            <AccordionContent>
              {filteredActions.length > 0 ? (
                <ul className="space-y-1 py-2">
                  {filteredActions.map((action, index) => (
                    <li
                      key={index}
                      className="text-xs flex justify-between items-center py-1 border-b border-gray-100 last:border-0"
                    >
                      <span>{action.action}</span>
                      <span className="text-gray-500">{getElapsedTime(action.timestamp)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500 py-2">アクティビティはまだありません</p>
              )}

              {recentActions.length > 5 && (
                <div className="mt-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setShowAllActivities(!showAllActivities)}
                  >
                    {showAllActivities ? '一部を表示' : 'すべて表示'}
                  </Button>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="auto-adjust">
            <AccordionTrigger className="text-sm py-2">自動調整オプション</AccordionTrigger>
            <AccordionContent>
              <div className="py-2">
                <Badge
                  variant="outline"
                  className={`cursor-pointer transition-colors ${
                    !isPremium
                      ? 'opacity-50'
                      : autoAdjustEnabled
                        ? 'bg-green-50 hover:bg-green-100'
                        : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => isPremium && setAutoAdjustEnabled(!autoAdjustEnabled)}
                >
                  自動優先度調整: {autoAdjustEnabled ? 'オン' : 'オフ'}
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdjustPriorities}
                  className="ml-2 text-xs"
                  disabled={!isPremium}
                >
                  <Save className="h-3 w-3 mr-1" />
                  <span>今すぐ調整</span>
                </Button>

                <p className="text-xs text-gray-500 mt-2">
                  期限に基づいて自動的にタスクの優先度を調整します。
                  重要なタスクが期限に近づくと優先度が上がります。
                </p>

                <div className="mt-3 bg-amber-50 p-2 rounded text-xs text-amber-800">
                  <p className="font-medium">自動調整ルール</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>今日が期限のタスク: 優先度 +2</li>
                    <li>明日が期限のタスク: 優先度 +1</li>
                    <li>期限切れのタスク: 優先度最大</li>
                    <li>期限なしのタスク: 変更なし</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="achievements">
            <AccordionTrigger className="text-sm py-2">実績と統計</AccordionTrigger>
            <AccordionContent>
              <StatisticsSummary
                stats={stats}
                achievementDetails={achievementDetails}
                setAchievementDetails={setAchievementDetails}
                onShowFullStats={isPremium ? onShowFullStats : undefined}
                getCompletionRateStyle={getCompletionRateStyle}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* プレミアムアップグレードダイアログ */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>プレミアムプランにアップグレード</DialogTitle>
            <DialogDescription>
              高度な機能とプレミアム特典をすべて利用できるようになります。
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="rounded-lg border p-3">
              <h3 className="font-medium mb-2">プレミアム特典</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>タスクのインポート/エクスポート機能</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>自動優先度調整機能</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>詳細な統計と分析ダッシュボード</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>高度なタスクフィルタリングとソート</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="border rounded-lg p-3 text-center">
                <h3 className="font-medium">月額プラン</h3>
                <p className="text-2xl font-bold my-2">¥980</p>
                <p className="text-xs text-gray-500">毎月自動更新</p>
                <Button
                  className="w-full mt-2"
                  variant="outline"
                  onClick={() => {
                    // 決済処理へリダイレクト
                    window.location.href = '/checkout?plan=monthly';
                  }}
                >
                  選択する
                </Button>
              </div>

              <div className="border rounded-lg p-3 text-center bg-blue-50 border-blue-200">
                <h3 className="font-medium">年間プラン</h3>
                <div className="flex justify-center items-center my-2">
                  <p className="text-2xl font-bold">¥9,800</p>
                  <Badge className="ml-2 bg-green-100 text-green-800 border-0">17%お得</Badge>
                </div>
                <p className="text-xs text-gray-500">年間一括払い</p>
                <Button
                  className="w-full mt-2"
                  onClick={() => {
                    // 決済処理へリダイレクト
                    window.location.href = '/checkout?plan=annual';
                  }}
                >
                  選択する
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" size="sm" onClick={() => setShowUpgradeDialog(false)}>
              キャンセル
            </Button>
            <p className="text-xs text-gray-500">安全な決済システムで処理されます</p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdvancedOptions;
