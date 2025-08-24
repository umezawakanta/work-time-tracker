// DiaryHistory.tsx
import React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Edit, Trash2 } from 'lucide-react';
import { DiaryEntry, TagOption } from '@/types';

interface DiaryHistoryProps {
  entries: DiaryEntry[];
  currentView: string;
  setCurrentView: (view: string) => void;
  isPremium: boolean;
  renderWeeklyView: () => React.ReactNode;
  renderMonthlyCalendar: () => React.ReactNode;
  handleEdit: (entry: DiaryEntry) => void;
  handleDelete: (id: string) => void;
  getEntryClass: (entry: DiaryEntry) => string;
  tagOptions: TagOption[];
  moodEmojis: Record<string, string>;
  showMonthlyCalendar: boolean;
  setShowMonthlyCalendar: React.Dispatch<React.SetStateAction<boolean>>;
}

const DiaryHistory: React.FC<DiaryHistoryProps> = ({
  entries,
  currentView,
  setCurrentView,
  isPremium,
  renderWeeklyView,
  renderMonthlyCalendar,
  handleEdit,
  handleDelete,
  getEntryClass,
  tagOptions,
  moodEmojis,
  showMonthlyCalendar,
  setShowMonthlyCalendar,
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>過去の記録</CardTitle>
          <div className="flex gap-2 mt-2">
            <Button
              variant={currentView === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('day')}
            >
              リスト表示
            </Button>
            <Button
              variant={currentView === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('week')}
            >
              週表示
            </Button>

            {/* カレンダー表示ボタンを追加 */}
            {isPremium && (
              <Button
                variant={currentView === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('calendar')}
              >
                カレンダー
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {currentView === 'week' ? (
            renderWeeklyView()
          ) : currentView === 'calendar' && isPremium ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMonthlyCalendar(!showMonthlyCalendar)}
                >
                  {showMonthlyCalendar ? 'シンプル表示' : '詳細カレンダー表示'}
                </Button>
              </div>
              {renderMonthlyCalendar()}
            </>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              {entries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>記録がありません。新しいエントリーを追加しましょう！</p>
                </div>
              ) : (
                entries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((entry) => (
                    <Card key={entry.id} className="mb-4">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {format(new Date(entry.date), 'yyyy年MM月dd日（E）', {
                              locale: ja,
                            })}
                            {entry.mood && <span className="ml-2">{moodEmojis[entry.mood]}</span>}
                          </CardTitle>
                          {entry.isImportant && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                              重要な達成
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className={getEntryClass(entry)}>
                          <p className="whitespace-pre-wrap mb-2">{entry.achievement}</p>

                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {entry.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tagOptions.find((t) => t.value === tag)?.label || tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center mt-2 text-sm text-muted-foreground">
                            <span>難易度: {entry.difficulty || 1}</span>
                          </div>
                        </div>
                      </CardContent>
                      <div className="p-3 pt-0 flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(entry)}>
                          <Edit className="h-4 w-4 mr-1" />
                          編集
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          削除
                        </Button>
                      </div>
                    </Card>
                  ))
              )}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DiaryHistory;
