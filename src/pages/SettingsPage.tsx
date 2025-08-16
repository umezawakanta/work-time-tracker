import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { usePremiumFeatures } from '@/components/dailyToDoReminder/controls/usePremiumFeatures';
import { toast } from 'react-hot-toast';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Database,
  HelpCircle,
  Sparkles,
  Crown,
  CreditCard,
  Settings,
  Moon,
  Sun,
  Monitor,
  Info,
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isPremium, features: premiumFeatures, expiresAt } = usePremiumFeatures();

  const [activeTab, setActiveTab] = useState('general');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    taskReminders: true,
    weeklyReport: false,
  });

  const [language, setLanguage] = useState('ja');
  const [timezone, setTimezone] = useState('Asia/Tokyo');
  const [dateFormat, setDateFormat] = useState('YYYY/MM/DD');
  const [username, setUsername] = useState(user?.name || '');

  // ユーザー情報が変更された場合に状態を更新
  useEffect(() => {
    setUsername(user?.name || '');
  }, [user?.name]);

  const handleSaveSettings = () => {
    // 設定を保存する処理
    toast.success('設定を保存しました');
  };

  const handleExportData = () => {
    // データエクスポート処理
    toast('データのエクスポートを開始しました', { icon: '💾' });
  };

  const handleDeleteAccount = () => {
    // アカウント削除確認ダイアログを表示
    if (window.confirm('本当にアカウントを削除しますか？この操作は取り消せません。')) {
      toast.error('アカウント削除機能は現在実装中です');
    }
  };

  return (
    <PageLayout title="設定">
      <div className="max-w-6xl mx-auto space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">一般</TabsTrigger>
            <TabsTrigger value="account">アカウント</TabsTrigger>
            <TabsTrigger value="notifications">通知</TabsTrigger>
            <TabsTrigger value="api">API設定</TabsTrigger>
            <TabsTrigger value="premium">プレミアム</TabsTrigger>
          </TabsList>

          {/* 一般設定 */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  外観
                </CardTitle>
                <CardDescription>アプリケーションの見た目をカスタマイズします</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="theme">テーマ</Label>
                    <p className="text-sm text-gray-500">
                      ライトモードとダークモードを切り替えます
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <Switch id="theme" checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                    <Moon className="h-4 w-4" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="language">言語</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ja">日本語</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timezone">タイムゾーン</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger id="timezone" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Tokyo">東京 (GMT+9)</SelectItem>
                        <SelectItem value="America/New_York">ニューヨーク (GMT-5)</SelectItem>
                        <SelectItem value="Europe/London">ロンドン (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date-format">日付形式</Label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger id="date-format" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YYYY/MM/DD">2024/01/20</SelectItem>
                        <SelectItem value="DD/MM/YYYY">20/01/2024</SelectItem>
                        <SelectItem value="MM/DD/YYYY">01/20/2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* アカウント設定 */}
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  プロフィール
                </CardTitle>
                <CardDescription>アカウント情報を管理します</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">ユーザー名</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ユーザー名を入力"
                  />
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveSettings}>プロフィールを更新</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  データ管理
                </CardTitle>
                <CardDescription>データのエクスポートやアカウントの削除</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">データエクスポート</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      すべてのタスク、設定、履歴データをJSON形式でダウンロードします
                    </p>
                    <Button variant="outline" onClick={handleExportData}>
                      データをエクスポート
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2 text-red-600">危険な操作</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      アカウントを削除すると、すべてのデータが永久に失われます
                    </p>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      アカウントを削除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 通知設定 */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  通知設定
                </CardTitle>
                <CardDescription>通知の受信設定を管理します</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">メール通知</Label>
                      <p className="text-sm text-gray-500">重要な更新をメールで受け取る</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notifications.email}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, email: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">プッシュ通知</Label>
                      <p className="text-sm text-gray-500">ブラウザのプッシュ通知を有効にする</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notifications.push}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, push: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="task-reminders">タスクリマインダー</Label>
                      <p className="text-sm text-gray-500">期限が近づいたタスクの通知</p>
                    </div>
                    <Switch
                      id="task-reminders"
                      checked={notifications.taskReminders}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, taskReminders: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weekly-report">週次レポート</Label>
                      <p className="text-sm text-gray-500">毎週の生産性レポートを受け取る</p>
                    </div>
                    <Switch
                      id="weekly-report"
                      checked={notifications.weeklyReport}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, weeklyReport: checked })
                      }
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveSettings}>通知設定を保存</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API設定 */}
          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API設定
                </CardTitle>
                <CardDescription>外部サービスのAPI設定を管理します</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    APIキーは暗号化されて安全に保管されます。環境変数での設定を推奨します。
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gemini-key">Gemini API Key</Label>
                    <Input
                      id="gemini-key"
                      type="password"
                      placeholder="AIzaSy..."
                      className="font-mono"
                    />
                    <p className="text-xs text-gray-500">
                      Google AI Studioで取得したAPIキーを入力してください
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="claude-key">Claude API Key</Label>
                    <Input
                      id="claude-key"
                      type="password"
                      placeholder="sk-ant-api03-..."
                      className="font-mono"
                    />
                    <p className="text-xs text-gray-500">
                      Anthropic Consoleで取得したAPIキーを入力してください
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <Input
                      id="openai-key"
                      type="password"
                      placeholder="sk-..."
                      className="font-mono"
                    />
                    <p className="text-xs text-gray-500">
                      OpenAI Platformで取得したAPIキーを入力してください
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveSettings}>API設定を保存</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* プレミアム設定 */}
          <TabsContent value="premium" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  プレミアムステータス
                </CardTitle>
                <CardDescription>プレミアム機能の状態と特典</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isPremium ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Premium Active
                      </Badge>
                      {expiresAt && (
                        <span className="text-sm text-gray-500">
                          有効期限: {new Date(expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">利用可能な機能:</h4>
                      <ul className="space-y-1 text-sm">
                        {premiumFeatures?.dataExport && (
                          <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span> データエクスポート
                          </li>
                        )}
                        {premiumFeatures?.priorityAdjustment && (
                          <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span> AI優先度調整
                          </li>
                        )}
                        {premiumFeatures?.advancedStats && (
                          <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span> 高度な統計分析
                          </li>
                        )}
                        {premiumFeatures?.unlimitedTasks && (
                          <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span> 無制限タスク
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert>
                      <Crown className="h-4 w-4" />
                      <AlertDescription>
                        プレミアムにアップグレードして、すべての機能を利用しましょう
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <h4 className="font-medium">プレミアム特典:</h4>
                      <ul className="space-y-1 text-sm text-gray-500">
                        <li className="flex items-center gap-2">
                          <span>○</span> AI自動タスク設定
                        </li>
                        <li className="flex items-center gap-2">
                          <span>○</span> 無制限タスク作成
                        </li>
                        <li className="flex items-center gap-2">
                          <span>○</span> 高度な分析機能
                        </li>
                        <li className="flex items-center gap-2">
                          <span>○</span> 優先サポート
                        </li>
                      </ul>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500">
                      <Crown className="h-4 w-4 mr-2" />
                      プレミアムにアップグレード
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
