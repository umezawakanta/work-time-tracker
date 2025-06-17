import React from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { deleteWorkTimeEntry } from '@/store/workTimeSlice';
import { WorkTimeEntry } from '@/types/workTimeEntry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { useLocale } from '@/hooks/useLocale';
import { formatDateAndTime } from '@/utils/dateUtils';
import { Timer, Hash, Clock } from 'lucide-react';

interface WorkTimeListProps {
  workTimeEntries: WorkTimeEntry[];
}

// ポモドーロエントリの型拡張
interface PomodoroWorkTimeEntry extends WorkTimeEntry {
  isFromPomodoro?: boolean;
  pomodoroSessionId?: string;
  pomodoroData?: {
    sessionNumber: number;
    totalSessions: number;
    efficiency?: number;
  };
}

export const WorkTimeList: React.FC<WorkTimeListProps> = ({ workTimeEntries }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { locale } = useLocale();
  const [selectedEntries, setSelectedEntries] = React.useState<string[]>([]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '未設定';

    // YYYY-MM-DD形式の場合は適切なDate文字列に変換してフォーマット
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      try {
        const date = new Date(dateString + 'T00:00:00'); // タイムゾーン問題を避けるため時刻を追加
        return formatDateAndTime(date, locale, { dateStyle: 'short' });
      } catch (error) {
        console.warn('日付フォーマットエラー:', { dateString, error });
        return dateString;
      }
    }

    // ISO文字列やその他の形式の場合は従来通りフォーマット
    try {
      return formatDateAndTime(dateString, locale, { dateStyle: 'short' });
    } catch (error) {
      console.warn('日付フォーマットエラー:', { dateString, error });
      return dateString; // エラーの場合は元の文字列をそのまま返す
    }
  };

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return '未設定';

    // 既にHH:MM形式の文字列の場合はそのまま返す（ポモドーロエントリ対応）
    if (/^\d{2}:\d{2}$/.test(dateString)) {
      return dateString;
    }

    // ISO文字列やDate形式の場合は従来通りフォーマット
    try {
      return formatDateAndTime(dateString, locale, { timeStyle: 'short' });
    } catch (error) {
      console.warn('時刻フォーマットエラー:', { dateString, error });
      return dateString; // エラーの場合は元の文字列をそのまま返す
    }
  };

  const formatDuration = (duration: number | undefined) => {
    if (duration === undefined) return '未設定';
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}時間${minutes}分`;
  };

  const handleCheckboxChange = (entryId: string) => {
    setSelectedEntries((prev) =>
      prev.includes(entryId) ? prev.filter((id) => id !== entryId) : [...prev, entryId]
    );
  };

  const handleDelete = async () => {
    for (const entryId of selectedEntries) {
      try {
        await dispatch(deleteWorkTimeEntry(entryId)).unwrap();
      } catch (error) {
        console.error(`Failed to delete entry ${entryId}:`, error);
        toast({
          title: 'エラー',
          description: `エントリー ${entryId} の削除に失敗しました。`,
          variant: 'destructive',
        });
      }
    }
    setSelectedEntries([]);
    toast({
      title: '成功',
      description: '選択されたエントリーが削除されました。',
    });
  };

  // ポモドーロエントリかどうかを判定
  const isPomodoroEntry = (entry: WorkTimeEntry): entry is PomodoroWorkTimeEntry => {
    return (entry as any).isFromPomodoro === true;
  };

  // エントリをソート: ポモドーロエントリを上位に表示
  const sortedEntries = [...workTimeEntries].sort((a, b) => {
    const aIsPomodoro = isPomodoroEntry(a);
    const bIsPomodoro = isPomodoroEntry(b);

    if (aIsPomodoro && !bIsPomodoro) return -1;
    if (!aIsPomodoro && bIsPomodoro) return 1;

    // 同じタイプなら日付順
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          作業時間エントリー
          <Badge variant="outline" className="text-xs">
            {workTimeEntries.filter(isPomodoroEntry).length} / {workTimeEntries.length} ポモドーロ
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedEntries.length > 0 ? (
          <div>
            {sortedEntries.map((entry) => {
              const isPomodoro = isPomodoroEntry(entry);

              return (
                <div
                  key={entry._id}
                  className={`flex items-center justify-between py-3 border-b transition-colors hover:bg-gray-50 ${
                    isPomodoro ? 'border-l-4 border-l-red-500 pl-3' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`select-${entry._id}`}
                      checked={selectedEntries.includes(entry._id || '')}
                      onCheckedChange={() => handleCheckboxChange(entry._id || '')}
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isPomodoro && <Timer className="h-4 w-4 text-red-500" />}
                        <p className="font-semibold">{entry.projectName}</p>
                        {isPomodoro && (
                          <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                            ポモドーロ
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(entry.date)} {formatTime(entry.startTime)} -{' '}
                            {formatTime(entry.endTime)}
                          </span>
                          <span className="font-medium text-blue-600">
                            {formatDuration(entry.duration)}
                          </span>
                        </div>

                        {/* ポモドーロ固有の情報 */}
                        {isPomodoro && entry.pomodoroData && (
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              {entry.pomodoroData.sessionNumber}セッション目
                            </span>
                            <span>今日{entry.pomodoroData.totalSessions}回完了</span>
                          </div>
                        )}

                        {/* 説明文 */}
                        {entry.description && (
                          <p className="text-xs text-gray-500 italic mt-1">{entry.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {selectedEntries.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="mt-4">
                    選択したエントリーを削除 ({selectedEntries.length}件)
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>削除の確認</AlertDialogTitle>
                    <AlertDialogDescription>
                      選択した{selectedEntries.length}
                      件のエントリーを削除してもよろしいですか？この操作は取り消せません。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>削除</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Timer className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>作業時間エントリーがありません。</p>
            <p className="text-sm mt-1">ポモドーロタイマーを使用して自動記録を開始しましょう！</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
