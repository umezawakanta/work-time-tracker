import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Bell,
  Calendar,
  Clock,
  Cloud,
  CreditCard,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Save
} from "lucide-react";
import { ViewSettings, UserSettings } from '@/types/todo';

interface TodoSettingsProps {
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  isPremium: boolean;
  onUpgradeToPremium?: () => void;
}

/**
 * TodoSettings - タスク管理の設定画面コンポーネント
 */
const TodoSettings: React.FC<TodoSettingsProps> = ({
  settings,
  onSaveSettings,
  isPremium,
  onUpgradeToPremium
}) => {
  const [updatedSettings, setUpdatedSettings] = useState<UserSettings>(settings);
  const [activeTab, setActiveTab] = useState<string>("general");
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  
  // 設定の更新ハンドラー
  const updateSettings = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setUpdatedSettings(prev => ({ ...prev, [key]: value }));
    setUnsavedChanges(true);
  };
  
  // 表示設定の更新ハンドラー
  const updateViewSettings = <K extends keyof ViewSettings>(
    key: K,
    value: ViewSettings[K]
  ) => {
    setUpdatedSettings(prev => ({
      ...prev,
      viewSettings: {
        ...prev.viewSettings,
        [key]: value
      }
    }));
    setUnsavedChanges(true);
  };
  
  // 通知設定の更新ハンドラー
  const updateNotificationSettings = <K extends keyof UserSettings['notifications']>(
    key: K,
    value: UserSettings['notifications'][K]
  ) => {
    setUpdatedSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
    setUnsavedChanges(true);
  };
  
  // 連携設定の更新ハンドラー
  const updateIntegrationSettings = <K extends keyof UserSettings['integrations']>(
    key: K,
    value: UserSettings['integrations'][K]
  ) => {
    setUpdatedSettings(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [key]: value
      }
    }));
    setUnsavedChanges(true);
  };
  
  // 設定保存ハンドラー
  const handleSaveSettings = () => {
    onSaveSettings(updatedSettings);
    setUnsavedChanges(false);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>設定</CardTitle>
            <CardDescription>タスク管理のカスタマイズと環境設定</CardDescription>
          </div>
          
          {!isPremium && onUpgradeToPremium && (
            <Button onClick={onUpgradeToPremium} className="bg-gradient-to-r from-amber-500 to-amber-600">
              <CreditCard className="mr-2 h-4 w-4" />
              プレミアムにアップグレード
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">一般</TabsTrigger>
            <TabsTrigger value="appearance">表示</TabsTrigger>
            <TabsTrigger value="notifications" disabled={!isPremium}>通知</TabsTrigger>
            <TabsTrigger value="integrations" disabled={!isPremium}>連携</TabsTrigger>
          </TabsList>
          
          {/* 一般設定タブ */}
          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <Input 
                id="name" 
                value={updatedSettings.name} 
                onChange={(e) => updateSettings('name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input 
                id="email" 
                type="email" 
                value={updatedSettings.email} 
                onChange={(e) => updateSettings('email', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone">タイムゾーン</Label>
              <Select 
                value={updatedSettings.viewSettings.timezone} 
                onValueChange={(value) => updateViewSettings('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="タイムゾーンを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Tokyo">日本時間 (UTC+9)</SelectItem>
                  <SelectItem value="America/New_York">アメリカ東部時間 (UTC-5)</SelectItem>
                  <SelectItem value="Europe/London">イギリス時間 (UTC+0)</SelectItem>
                  <SelectItem value="Europe/Paris">中央ヨーロッパ時間 (UTC+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language">言語</Label>
              <Select 
                value={updatedSettings.viewSettings.language} 
                onValueChange={(value) => updateViewSettings('language', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="言語を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          {/* 表示設定タブ */}
          <TabsContent value="appearance" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="darkMode">ダークモード</Label>
                <p className="text-sm text-gray-500">暗い配色テーマを使用します</p>
              </div>
              <Switch
                id="darkMode"
                checked={updatedSettings.viewSettings.darkMode}
                onCheckedChange={(checked) => updateViewSettings('darkMode', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compactView">コンパクト表示</Label>
                <p className="text-sm text-gray-500">タスクをより密集して表示します</p>
              </div>
              <Switch
                id="compactView"
                checked={updatedSettings.viewSettings.compactView}
                onCheckedChange={(checked) => updateViewSettings('compactView', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="sortOption">デフォルトのソート順</Label>
              <Select 
                value={updatedSettings.viewSettings.sortOption} 
                onValueChange={(value) => updateViewSettings('sortOption', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ソート順を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">優先度順</SelectItem>
                  <SelectItem value="newest">新しい順</SelectItem>
                  <SelectItem value="deadline">期限順</SelectItem>
                  <SelectItem value="type">タイプ順</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="groupBy">グループ化</Label>
              <Select 
                value={updatedSettings.viewSettings.groupBy || 'none'} 
                onValueChange={(value) => updateViewSettings('groupBy', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="グループ化" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">グループ化なし</SelectItem>
                  <SelectItem value="date">日付別</SelectItem>
                  <SelectItem value="priority">優先度別</SelectItem>
                  <SelectItem value="type">タイプ別</SelectItem>
                  <SelectItem value="tag">タグ別</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="showCompleted">完了タスクを表示</Label>
                <p className="text-sm text-gray-500">デフォルトで完了済みタスクを表示します</p>
              </div>
              <Switch
                id="showCompleted"
                checked={updatedSettings.viewSettings.showCompleted}
                onCheckedChange={(checked) => updateViewSettings('showCompleted', checked)}
              />
            </div>
          </TabsContent>
          
          {/* 通知設定タブ（プレミアム） */}
          <TabsContent value="notifications" className="space-y-4 pt-4">
            {isPremium ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">メール通知</Label>
                      <p className="text-sm text-gray-500">期限間近のタスクをメールでお知らせ</p>
                    </div>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={updatedSettings.notifications.email}
                    onCheckedChange={(checked) => updateNotificationSettings('email', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-gray-500" />
                    <div className="space-y-0.5">
                      <Label htmlFor="pushNotifications">プッシュ通知</Label>
                      <p className="text-sm text-gray-500">ブラウザ通知でタスクをお知らせ</p>
                    </div>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={updatedSettings.notifications.push}
                    onCheckedChange={(checked) => updateNotificationSettings('push', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <Label>リマインダー設定</Label>
                  </div>
                  <p className="text-sm text-gray-500">期限前にどのくらい通知するか</p>
                  
                  <div className="pt-4">
                    <Slider 
                      value={[updatedSettings.notifications.reminderTime]} 
                      min={5}
                      max={1440}
                      step={5}
                      onValueChange={(value) => updateNotificationSettings('reminderTime', value[0])}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>5分前</span>
                      <span>1時間前</span>
                      <span>1日前</span>
                    </div>
                    <div className="text-center mt-4">
                      <span className="text-sm font-medium">
                        {updatedSettings.notifications.reminderTime < 60 
                          ? `${updatedSettings.notifications.reminderTime}分前` 
                          : updatedSettings.notifications.reminderTime < 1440 
                            ? `${Math.floor(updatedSettings.notifications.reminderTime / 60)}時間前` 
                            : `${Math.floor(updatedSettings.notifications.reminderTime / 1440)}日前`}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <div className="text-amber-500 mb-2">
                  <Bell className="h-10 w-10 mx-auto" />
                </div>
                <h3 className="text-lg font-medium mb-2">プレミアム限定機能</h3>
                <p className="text-gray-500 mb-4">通知機能はプレミアムプランでご利用いただけます</p>
                
                {onUpgradeToPremium && (
                  <Button onClick={onUpgradeToPremium}>
                    プレミアムにアップグレード
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          {/* 外部連携タブ（プレミアム） */}
          <TabsContent value="integrations" className="space-y-4 pt-4">
            {isPremium ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div className="space-y-0.5">
                      <Label htmlFor="calendarSync">カレンダー連携</Label>
                      <p className="text-sm text-gray-500">期限付きタスクをカレンダーに同期</p>
                    </div>
                  </div>
                  <Switch
                    id="calendarSync"
                    checked={updatedSettings.integrations.calendar}
                    onCheckedChange={(checked) => updateIntegrationSettings('calendar', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div className="space-y-0.5">
                      <Label htmlFor="emailIntegration">メール連携</Label>
                      <p className="text-sm text-gray-500">メールからタスクを作成</p>
                    </div>
                  </div>
                  <Switch
                    id="emailIntegration"
                    checked={updatedSettings.integrations.email}
                    onCheckedChange={(checked) => updateIntegrationSettings('email', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-gray-500" />
                    <div className="space-y-0.5">
                      <Label htmlFor="slackIntegration">Slack連携</Label>
                      <p className="text-sm text-gray-500">Slackからタスクを管理</p>
                    </div>
                  </div>
                  <Switch
                    id="slackIntegration"
                    checked={updatedSettings.integrations.slack}
                    onCheckedChange={(checked) => updateIntegrationSettings('slack', checked)}
                  />
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <div className="text-amber-500 mb-2">
                  <Cloud className="h-10 w-10 mx-auto" />
                </div>
                <h3 className="text-lg font-medium mb-2">プレミアム限定機能</h3>
                <p className="text-gray-500 mb-4">外部サービス連携はプレミアムプランでご利用いただけます</p>
                
                {onUpgradeToPremium && (
                  <Button onClick={onUpgradeToPremium}>
                    プレミアムにアップグレード
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-sm text-gray-500">
          {isPremium 
            ? `プレミアム会員: ${new Date(updatedSettings.premiumUntil || '').toLocaleDateString()}まで` 
            : '無料プラン'}
        </p>
        
        <Button 
          onClick={handleSaveSettings} 
          disabled={!unsavedChanges}
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" />
          <span>設定を保存</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TodoSettings;