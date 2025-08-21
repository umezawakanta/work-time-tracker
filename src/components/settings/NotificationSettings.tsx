import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import {
  Bell,
  Mail,
  Clock,
  Calendar,
  Filter,
  TestTube,
  Save,
  AlertCircle,
  Settings,
} from 'lucide-react';
import {
  NotificationSettings as NotificationSettingsType,
  DEFAULT_NOTIFICATION_SETTINGS,
} from '@/types/notification';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const NotificationSettings: React.FC = () => {
  const userId = useSelector((state: RootState) => (state as any).user?.id) || 'demo-user';
  const [settings, setSettings] = useState<NotificationSettingsType>({
    ...DEFAULT_NOTIFICATION_SETTINGS,
    userId,
    emailAddress: '',
  } as NotificationSettingsType);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ ready: boolean; message: string } | null>(null);

  // 設定を読み込み
  useEffect(() => {
    loadSettings();
    checkEmailServiceStatus();
  }, [userId]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/notifications/settings/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSettings(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEmailServiceStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/notifications/status');
      const data = await response.json();
      if (data.success) {
        setEmailStatus({
          ready: data.data.emailServiceReady,
          message: data.data.message,
        });
      }
    } catch (error) {
      console.error('Failed to check email service status:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:3001/api/notifications/settings/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('通知設定を保存しました');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error('設定の保存に失敗しました');
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'daily_digest' }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('テストメールを送信しました');
      } else {
        toast.error(data.message || 'テストメールの送信に失敗しました');
      }
    } catch (error) {
      toast.error('テストメールの送信に失敗しました');
      console.error('Failed to send test notification:', error);
    }
  };

  const updateSetting = <K extends keyof NotificationSettingsType>(
    key: K,
    value: NotificationSettingsType[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8 text-purple-600" />
            メール通知設定
          </h1>
          <p className="text-gray-600 mt-2">タスクの追加や期限についてメールで通知を受け取る設定</p>
        </div>
      </div>

      {/* サービス状態 */}
      <Card
        className={
          settings.emailUser && settings.emailPass
            ? 'border-green-500'
            : emailStatus?.ready
              ? 'border-blue-500'
              : 'border-yellow-500'
        }
      >
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle
              className={`h-5 w-5 ${
                settings.emailUser && settings.emailPass
                  ? 'text-green-500'
                  : emailStatus?.ready
                    ? 'text-blue-500'
                    : 'text-yellow-500'
              }`}
            />
            <span
              className={
                settings.emailUser && settings.emailPass
                  ? 'text-green-700'
                  : emailStatus?.ready
                    ? 'text-blue-700'
                    : 'text-yellow-700'
              }
            >
              {settings.emailUser && settings.emailPass
                ? 'ユーザー個別のメール設定が有効です'
                : emailStatus?.message || 'メールサービスが設定されていません'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 基本設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            基本設定
          </CardTitle>
          <CardDescription>メール通知の基本的な設定を行います</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="enabled">メール通知を有効化</Label>
              <p className="text-sm text-gray-500">すべてのメール通知のマスタースイッチ</p>
            </div>
            <Switch
              id="enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSetting('enabled', checked)}
              className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">通知先メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="your-email@example.com"
              value={settings.emailAddress}
              onChange={(e) => updateSetting('emailAddress', e.target.value)}
              disabled={!settings.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* メールサービス設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            メールサービス設定
          </CardTitle>
          <CardDescription>メール送信に使用するサービスの設定を行います</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="emailService">メールサービス</Label>
            <Select
              value={settings.emailService || 'gmail'}
              onValueChange={(value) => updateSetting('emailService', value as any)}
              disabled={!settings.enabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gmail">Gmail</SelectItem>
                <SelectItem value="outlook">Outlook/Hotmail</SelectItem>
                <SelectItem value="yahoo">Yahoo</SelectItem>
                <SelectItem value="custom">カスタムSMTP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailUser">送信元メールアドレス</Label>
            <Input
              id="emailUser"
              type="email"
              placeholder="your-email@gmail.com"
              value={settings.emailUser || ''}
              onChange={(e) => updateSetting('emailUser', e.target.value)}
              disabled={!settings.enabled}
            />
            <p className="text-sm text-gray-500">通知メールの送信元となるメールアドレス</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailPass">アプリパスワード</Label>
            <Input
              id="emailPass"
              type="password"
              placeholder="••••••••••••••••"
              value={settings.emailPass || ''}
              onChange={(e) => updateSetting('emailPass', e.target.value)}
              disabled={!settings.enabled}
            />
            <p className="text-sm text-gray-500">
              Gmailの場合は2段階認証を有効にしてアプリパスワードを生成してください
            </p>
          </div>

          {settings.emailService === 'custom' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTPホスト</Label>
                <Input
                  id="smtpHost"
                  type="text"
                  placeholder="smtp.example.com"
                  value={settings.smtpHost || ''}
                  onChange={(e) => updateSetting('smtpHost', e.target.value)}
                  disabled={!settings.enabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTPポート</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  placeholder="587"
                  value={settings.smtpPort || 587}
                  onChange={(e) => updateSetting('smtpPort', parseInt(e.target.value) || 587)}
                  disabled={!settings.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="smtpSecure">SSL/TLSを使用</Label>
                  <p className="text-sm text-gray-500">セキュアな接続を使用します</p>
                </div>
                <Switch
                  id="smtpSecure"
                  checked={settings.smtpSecure || false}
                  onCheckedChange={(checked) => updateSetting('smtpSecure', checked)}
                  disabled={!settings.enabled}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 通知タイミング */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            通知タイミング
          </CardTitle>
          <CardDescription>どのようなときに通知を受け取るか設定します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="taskAdd">タスク追加時</Label>
              <p className="text-sm text-gray-500">新しいタスクが追加されたときに通知</p>
            </div>
            <Switch
              id="taskAdd"
              checked={settings.notifyOnTaskAdd}
              onCheckedChange={(checked) => updateSetting('notifyOnTaskAdd', checked)}
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="taskComplete">タスク完了時</Label>
              <p className="text-sm text-gray-500">タスクが完了したときに通知</p>
            </div>
            <Switch
              id="taskComplete"
              checked={settings.notifyOnTaskComplete}
              onCheckedChange={(checked) => updateSetting('notifyOnTaskComplete', checked)}
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="deadline">締切接近時</Label>
              <p className="text-sm text-gray-500">タスクの締切が近づいたときに通知</p>
            </div>
            <Switch
              id="deadline"
              checked={settings.notifyOnDeadlineApproaching}
              onCheckedChange={(checked) => updateSetting('notifyOnDeadlineApproaching', checked)}
              disabled={!settings.enabled}
            />
          </div>

          {settings.notifyOnDeadlineApproaching && (
            <div className="ml-8 space-y-2">
              <Label htmlFor="deadlineHours">締切何時間前に通知</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="deadlineHours"
                  type="number"
                  min="1"
                  max="168"
                  value={settings.deadlineWarningHours}
                  onChange={(e) =>
                    updateSetting('deadlineWarningHours', parseInt(e.target.value) || 24)
                  }
                  disabled={!settings.enabled}
                  className="w-24"
                />
                <span className="text-gray-600">時間前</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 定期レポート */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            定期レポート
          </CardTitle>
          <CardDescription>定期的なサマリーレポートの送信設定</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="dailyDigest">デイリーダイジェスト</Label>
              <p className="text-sm text-gray-500">毎日のタスクサマリーを送信</p>
            </div>
            <Switch
              id="dailyDigest"
              checked={settings.dailyDigest}
              onCheckedChange={(checked) => updateSetting('dailyDigest', checked)}
              disabled={!settings.enabled}
            />
          </div>

          {settings.dailyDigest && (
            <div className="ml-8 space-y-2">
              <Label htmlFor="dailyTime">送信時刻</Label>
              <Input
                id="dailyTime"
                type="time"
                value={settings.dailyDigestTime}
                onChange={(e) => updateSetting('dailyDigestTime', e.target.value)}
                disabled={!settings.enabled}
                className="w-32"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="weeklyReport">週次レポート</Label>
              <p className="text-sm text-gray-500">週間のタスクレポートを送信</p>
            </div>
            <Switch
              id="weeklyReport"
              checked={settings.weeklyReport}
              onCheckedChange={(checked) => updateSetting('weeklyReport', checked)}
              disabled={!settings.enabled}
            />
          </div>

          {settings.weeklyReport && (
            <div className="ml-8 space-y-2">
              <Label htmlFor="weeklyDay">送信曜日</Label>
              <Select
                value={settings.weeklyReportDay.toString()}
                onValueChange={(value) => updateSetting('weeklyReportDay', parseInt(value))}
                disabled={!settings.enabled}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">日曜日</SelectItem>
                  <SelectItem value="1">月曜日</SelectItem>
                  <SelectItem value="2">火曜日</SelectItem>
                  <SelectItem value="3">水曜日</SelectItem>
                  <SelectItem value="4">木曜日</SelectItem>
                  <SelectItem value="5">金曜日</SelectItem>
                  <SelectItem value="6">土曜日</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* フィルター設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            通知フィルター
          </CardTitle>
          <CardDescription>通知するタスクの条件を設定します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="minPriority">最小優先度</Label>
            <p className="text-sm text-gray-500">この優先度以上のタスクのみ通知</p>
            <Select
              value={settings.minPriorityForNotification.toString()}
              onValueChange={(value) =>
                updateSetting('minPriorityForNotification', parseInt(value))
              }
              disabled={!settings.enabled}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 (最低) 以上</SelectItem>
                <SelectItem value="2">2 (低) 以上</SelectItem>
                <SelectItem value="3">3 (中) 以上</SelectItem>
                <SelectItem value="4">4 (高) 以上</SelectItem>
                <SelectItem value="5">5 (最高) のみ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* アクションボタン */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={sendTestNotification}
          disabled={!settings.enabled || !settings.emailAddress || !emailStatus?.ready}
          className="flex items-center gap-2"
        >
          <TestTube className="h-4 w-4" />
          テスト送信
        </Button>
        <Button
          onClick={saveSettings}
          disabled={saving || !settings.emailAddress}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? '保存中...' : '設定を保存'}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
