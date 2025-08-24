import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Palette, Bell, Calendar, Cloud, Shield, AlertCircle, Save, X } from 'lucide-react';

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
  onSave: (_settings: TodoSettingsType) => void;
  isPremium?: boolean;
}

const TodoSettings: React.FC<TodoSettingsProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  isPremium = false,
}) => {
  const [updated, setUpdated] = useState<TodoSettingsType>(settings);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  const _update = <K extends keyof TodoSettingsType>(
    category: K,
    field: keyof TodoSettingsType[K],
    value: TodoSettingsType[K][keyof TodoSettingsType[K]]
  ) => {
    setUpdated((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] as object),
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const _handleSave = () => {
    onSave(updated);
    setHasChanges(false);
    onClose();
  };

  const _handleCancel = () => {
    setUpdated(settings);
    setHasChanges(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Settings</CardTitle>
          <Button variant="ghost" size="icon" onClick={_handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="general">
                <Palette className="h-4 w-4 mr-2" />
                荳闊ｬ
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                騾夂衍
              </TabsTrigger>
              <TabsTrigger value="schedule">
                <Calendar className="h-4 w-4 mr-2" />
                繧ｹ繧ｱ繧ｸ繝･繝ｼ繝ｫ
              </TabsTrigger>
              <TabsTrigger value="sync">
                <Cloud className="h-4 w-4 mr-2" />
                蜷梧悄
              </TabsTrigger>
              <TabsTrigger value="privacy">
                <Shield className="h-4 w-4 mr-2" />
                繝励Λ繧､繝舌す繝ｼ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={updated.theme}
                  onValueChange={(value) =>
                    _update(
                      'theme',
                      'theme' as keyof TodoSettingsType['theme'],
                      value as 'light' | 'dark' | 'system'
                    )
                  }
                >
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications-enabled">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    繧ｿ繧ｹ繧ｯ縺ｮ繝ｪ繝槭う繝ｳ繝繝ｼ縺ｨ譖ｴ譁ｰ繧貞女縺大叙繧・{' '}
                  </p>
                </div>
                <Switch
                  id="notifications-enabled"
                  checked={updated.notifications.enabled}
                  onCheckedChange={(checked) => _update('notifications', 'enabled', checked)}
                />
              </div>

              {updated.notifications.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications-sound">Sound</Label>
                      <p className="text-sm text-muted-foreground">騾夂衍髻ｳ繧貞・逕溘☆繧・ </p>
                    </div>
                    <Switch
                      id="notifications-sound"
                      checked={updated.notifications.sound}
                      onCheckedChange={(checked) => _update('notifications', 'sound', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications-desktop">繝・せ繧ｯ繝医ャ繝鈴夂衍</Label>
                      <p className="text-sm text-muted-foreground">
                        繧ｷ繧ｹ繝・Β縺ｮ騾夂衍繧定｡ｨ遉ｺ縺吶ｋ
                      </p>
                    </div>
                    <Switch
                      id="notifications-desktop"
                      checked={updated.notifications.desktop}
                      onCheckedChange={(checked) => _update('notifications', 'desktop', checked)}
                      disabled={!isPremium}
                    />
                  </div>
                </>
              )}

              {!isPremium && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    繝・せ繧ｯ繝医ャ繝鈴夂衍縺ｯ繝励Ξ繝溘い繝繝励Λ繝ｳ縺ｧ蛻ｩ逕ｨ蜿ｯ閭ｽ縺ｧ縺・{' '}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4 mt-4">
              <div>
                <Label>Working Hours</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="work-start">Start Time</Label>
                    <input
                      id="work-start"
                      type="time"
                      value={updated.workingHours.start}
                      onChange={(e) => _update('workingHours', 'start', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      aria-label="Start Time"
                    />
                  </div>
                  <div>
                    <Label htmlFor="work-end">End Time</Label>
                    <input
                      id="work-end"
                      type="time"
                      value={updated.workingHours.end}
                      onChange={(e) => _update('workingHours', 'end', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      aria-label="End Time"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Break Settings</Label>
                <div className="space-y-4 mt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="breaks-enabled">螳壽悄逧・↑莨第・</Label>
                      <p className="text-sm text-muted-foreground">菴懈･ｭ荳ｭ縺ｫ莨第・繧剃ｿ・☆</p>
                    </div>
                    <Switch
                      id="breaks-enabled"
                      checked={updated.breaks.enabled}
                      onCheckedChange={(checked) => _update('breaks', 'enabled', checked)}
                    />
                  </div>

                  {updated.breaks.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="break-duration">Break Duration (minutes)</Label>
                        <input
                          id="break-duration"
                          type="number"
                          min="5"
                          max="60"
                          value={updated.breaks.duration}
                          onChange={(e) => _update('breaks', 'duration', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border rounded-md"
                          aria-label="Break Duration in minutes"
                        />
                      </div>
                      <div>
                        <Label htmlFor="break-interval">Break Interval (minutes)</Label>
                        <input
                          id="break-interval"
                          type="number"
                          min="30"
                          max="180"
                          value={updated.breaks.interval}
                          onChange={(e) => _update('breaks', 'interval', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border rounded-md"
                          aria-label="Break Interval in minutes"
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
                  <Label htmlFor="auto-save">閾ｪ蜍穂ｿ晏ｭ・</Label>
                  <p className="text-sm text-muted-foreground">
                    螟画峩繧定・蜍慕噪縺ｫ菫晏ｭ倥☆繧・{' '}
                  </p>
                </div>
                <Switch
                  id="auto-save"
                  checked={updated.dataSync.autoSave}
                  onCheckedChange={(checked) => _update('dataSync', 'autoSave', checked)}
                />
              </div>

              <div>
                <Label htmlFor="sync-interval">蜷梧悄髢馴囈・育ｧ抵ｼ・</Label>
                <Select
                  value={updated.dataSync.syncInterval.toString()}
                  onValueChange={(value) => _update('dataSync', 'syncInterval', parseInt(value))}
                >
                  <SelectTrigger id="sync-interval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="300">5 hours</SelectItem>
                    <SelectItem value="600">10 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="share-analytics">菴ｿ逕ｨ迥ｶ豕√・蜈ｱ譛・</Label>
                  <p className="text-sm text-muted-foreground">
                    繧｢繝励Μ縺ｮ謾ｹ蝟・・縺溘ａ縺ｫ蛹ｿ蜷阪ョ繝ｼ繧ｿ繧貞・譛峨☆繧・{' '}
                  </p>
                </div>
                <Switch
                  id="share-analytics"
                  checked={updated.privacy.shareAnalytics}
                  onCheckedChange={(checked) => _update('privacy', 'shareAnalytics', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="public-profile">蜈ｬ髢九・繝ｭ繝輔ぅ繝ｼ繝ｫ</Label>
                  <p className="text-sm text-muted-foreground">
                    莉悶・繝ｦ繝ｼ繧ｶ繝ｼ縺後≠縺ｪ縺溘・繝励Ο繝輔ぅ繝ｼ繝ｫ繧帝夢隕ｧ縺ｧ縺阪ｋ
                  </p>
                </div>
                <Switch
                  id="public-profile"
                  checked={updated.privacy.showPublicProfile}
                  onCheckedChange={(checked) => _update('privacy', 'showPublicProfile', checked)}
                  disabled={!isPremium}
                />
              </div>

              {!isPremium && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    蜈ｬ髢九・繝ｭ繝輔ぅ繝ｼ繝ｫ縺ｯ繝励Ξ繝溘い繝繝励Λ繝ｳ縺ｧ蛻ｩ逕ｨ蜿ｯ閭ｽ縺ｧ縺・{' '}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-between border-t pt-4 mt-6">
            <Button variant="outline" onClick={_handleCancel}>
              繧ｭ繝｣繝ｳ繧ｻ繝ｫ
            </Button>
            <Button onClick={_handleSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              菫晏ｭ・{' '}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TodoSettings;
