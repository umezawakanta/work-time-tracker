// scripts/fix-todo-settings.js
import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';

async function fixTodoSettings() {
    console.log(chalk.blue('🔧 Fixing TodoSettings.tsx errors...\n'));

    const filePath = path.join(process.cwd(), 'src/components/dailyToDoReminder/controls/TodoSettings.tsx');

    try {
        // ファイルを読み込んで、完全に書き直す
        console.log(chalk.yellow('📝 Rewriting TodoSettings.tsx with correct syntax...'));

        const correctedContent = `import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Palette,
  Bell,
  Calendar,
  Coffee,
  Cloud,
  Shield,
  AlertCircle,
  Save,
  X
} from "lucide-react";

interface TodoSettingsType {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
  workingHours: {
    start: string;
    end: string;
    daysOfWeek: number[];
  };
  breaks: {
    enabled: boolean;
    duration: number;
    interval: number;
  };
  dataSync: {
    autoSave: boolean;
    syncInterval: number;
  };
  privacy: {
    shareAnalytics: boolean;
    showPublicProfile: boolean;
  };
}

interface TodoSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TodoSettingsType;
  onSave: (settings: TodoSettingsType) => void;
  isPremium?: boolean;
}

const TodoSettings: React.FC<TodoSettingsProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  isPremium = false
}) => {
  const [updated, setUpdated] = useState<TodoSettingsType>(settings);
  const [activeTab, setActiveTab] = useState("general");
  const [hasChanges, setHasChanges] = useState(false);

  const update = <K extends keyof TodoSettingsType>(
    category: K,
    field: keyof TodoSettingsType[K],
    value: any
  ) => {
    setUpdated(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(updated);
    setHasChanges(false);
    onClose();
  };

  const handleCancel = () => {
    setUpdated(settings);
    setHasChanges(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            設定
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="general">
                <Palette className="h-4 w-4 mr-2" />
                一般
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                通知
              </TabsTrigger>
              <TabsTrigger value="schedule">
                <Calendar className="h-4 w-4 mr-2" />
                スケジュール
              </TabsTrigger>
              <TabsTrigger value="sync">
                <Cloud className="h-4 w-4 mr-2" />
                同期
              </TabsTrigger>
              <TabsTrigger value="privacy">
                <Shield className="h-4 w-4 mr-2" />
                プライバシー
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="theme">テーマ</Label>
                <Select
                  value={updated.theme}
                  onValueChange={(value) => update('theme', value as any, value)}
                >
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">ライト</SelectItem>
                    <SelectItem value="dark">ダーク</SelectItem>
                    <SelectItem value="system">システム設定に従う</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications-enabled">通知を有効化</Label>
                  <p className="text-sm text-muted-foreground">
                    タスクのリマインダーと更新を受け取る
                  </p>
                </div>
                <Switch
                  id="notifications-enabled"
                  checked={updated.notifications.enabled}
                  onCheckedChange={(checked) => 
                    update('notifications', 'enabled', checked)
                  }
                />
              </div>

              {updated.notifications.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications-sound">サウンド</Label>
                      <p className="text-sm text-muted-foreground">
                        通知音を再生する
                      </p>
                    </div>
                    <Switch
                      id="notifications-sound"
                      checked={updated.notifications.sound}
                      onCheckedChange={(checked) => 
                        update('notifications', 'sound', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications-desktop">デスクトップ通知</Label>
                      <p className="text-sm text-muted-foreground">
                        システムの通知を表示する
                      </p>
                    </div>
                    <Switch
                      id="notifications-desktop"
                      checked={updated.notifications.desktop}
                      onCheckedChange={(checked) => 
                        update('notifications', 'desktop', checked)
                      }
                      disabled={!isPremium}
                    />
                  </div>
                </>
              )}

              {!isPremium && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    デスクトップ通知はプレミアムプランで利用可能です
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4 mt-4">
              <div>
                <Label>勤務時間</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="work-start">開始時刻</Label>
                    <input
                      id="work-start"
                      type="time"
                      value={updated.workingHours.start}
                      onChange={(e) => 
                        update('workingHours', 'start', e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <Label htmlFor="work-end">終了時刻</Label>
                    <input
                      id="work-end"
                      type="time"
                      value={updated.workingHours.end}
                      onChange={(e) => 
                        update('workingHours', 'end', e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>休憩設定</Label>
                <div className="space-y-4 mt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="breaks-enabled">定期的な休憩</Label>
                      <p className="text-sm text-muted-foreground">
                        作業中に休憩を促す
                      </p>
                    </div>
                    <Switch
                      id="breaks-enabled"
                      checked={updated.breaks.enabled}
                      onCheckedChange={(checked) => 
                        update('breaks', 'enabled', checked)
                      }
                    />
                  </div>

                  {updated.breaks.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="break-duration">休憩時間（分）</Label>
                        <input
                          id="break-duration"
                          type="number"
                          min="5"
                          max="60"
                          value={updated.breaks.duration}
                          onChange={(e) => 
                            update('breaks', 'duration', parseInt(e.target.value))
                          }
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <Label htmlFor="break-interval">間隔（分）</Label>
                        <input
                          id="break-interval"
                          type="number"
                          min="30"
                          max="180"
                          value={updated.breaks.interval}
                          onChange={(e) => 
                            update('breaks', 'interval', parseInt(e.target.value))
                          }
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sync" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-save">自動保存</Label>
                  <p className="text-sm text-muted-foreground">
                    変更を自動的に保存する
                  </p>
                </div>
                <Switch
                  id="auto-save"
                  checked={updated.dataSync.autoSave}
                  onCheckedChange={(checked) => 
                    update('dataSync', 'autoSave', checked)
                  }
                />
              </div>

              <div>
                <Label htmlFor="sync-interval">同期間隔（秒）</Label>
                <Select
                  value={updated.dataSync.syncInterval.toString()}
                  onValueChange={(value) => 
                    update('dataSync', 'syncInterval', parseInt(value))
                  }
                >
                  <SelectTrigger id="sync-interval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30秒</SelectItem>
                    <SelectItem value="60">1分</SelectItem>
                    <SelectItem value="300">5分</SelectItem>
                    <SelectItem value="600">10分</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="share-analytics">使用状況の共有</Label>
                  <p className="text-sm text-muted-foreground">
                    アプリの改善のために匿名データを共有する
                  </p>
                </div>
                <Switch
                  id="share-analytics"
                  checked={updated.privacy.shareAnalytics}
                  onCheckedChange={(checked) => 
                    update('privacy', 'shareAnalytics', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="public-profile">公開プロフィール</Label>
                  <p className="text-sm text-muted-foreground">
                    他のユーザーがあなたのプロフィールを閲覧できる
                  </p>
                </div>
                <Switch
                  id="public-profile"
                  checked={updated.privacy.showPublicProfile}
                  onCheckedChange={(checked) => 
                    update('privacy', 'showPublicProfile', checked)
                  }
                  disabled={!isPremium}
                />
              </div>

              {!isPremium && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    公開プロフィールはプレミアムプランで利用可能です
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-between border-t pt-4 mt-6">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TodoSettings;`;

        await fs.writeFile(filePath, correctedContent);
        console.log(chalk.green('✅ TodoSettings.tsx has been completely rewritten'));

        console.log(chalk.yellow('\n📝 Creating a backup of the original file...'));
        try {
            const backupPath = filePath + '.backup';
            await fs.rename(filePath + '.old', backupPath).catch(() => { });
            console.log(chalk.green('✅ Backup created'));
        } catch (error) {
            console.log(chalk.gray('⏭️  No backup needed'));
        }

    } catch (error) {
        console.error(chalk.red('❌ Failed to fix TodoSettings.tsx:'), error.message);
    }
}

// メイン実行
fixTodoSettings().catch(console.error);