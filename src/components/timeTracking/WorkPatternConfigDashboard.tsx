/**
 * ⚙️ 勤務パターン設定ダッシュボード
 * 勤務時間・休憩・残業設定とADHD/ASD特性に応じた個人最適化
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Settings,
  Clock,
  Coffee,
  Bell,
  Users,
  Copy,
  Plus,
  Edit,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  Brain,
  Zap,
  Target,
  Calendar,
  Timer,
  Palette,
  Volume2,
  Eye,
  Activity,
  TrendingUp,
  Star,
  Download,
  Upload,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import WorkPatternSettingsService from '@/services/timeTracking/WorkPatternSettingsService';
import { toast } from 'react-hot-toast';

// インスタンス作成
const patternService = new WorkPatternSettingsService();

interface WorkPatternConfigDashboardProps {
  userId?: string;
}

export const WorkPatternConfigDashboard: React.FC<WorkPatternConfigDashboardProps> = ({
  userId = 'demo-user',
}) => {
  const [patterns, setPatterns] = useState(patternService.getUserPatterns(userId));
  const [activePattern, setActivePattern] = useState(patternService.getActivePattern(userId));
  const [templates] = useState(patternService.getTemplates());
  const [editingPattern, setEditingPattern] = useState<any>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showNewPatternDialog, setShowNewPatternDialog] = useState(false);
  const [showExceptionDialog, setShowExceptionDialog] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  // 編集フォームの状態
  const [formData, setFormData] = useState<any>({});

  // 新しい例外の状態
  const [newException, setNewException] = useState({
    date: '',
    type: 'custom',
    customStartTime: '',
    customEndTime: '',
    reason: '',
    isRecurring: false,
  });

  // パターンデータの更新
  const refreshPatterns = () => {
    setPatterns(patternService.getUserPatterns(userId));
    setActivePattern(patternService.getActivePattern(userId));
  };

  // パターンの編集開始
  const startEditing = (pattern: any) => {
    setEditingPattern(pattern);
    setFormData({ ...pattern });
  };

  // パターンの保存
  const savePattern = () => {
    if (!editingPattern) return;

    const validation = patternService.validatePattern(formData);
    setValidationResult(validation);

    if (!validation.isValid) {
      toast.error('設定にエラーがあります。確認してください。');
      return;
    }

    const success = patternService.updatePattern(userId, editingPattern.id, formData);
    if (success) {
      toast.success('勤務パターンを更新しました');
      setEditingPattern(null);
      refreshPatterns();
    } else {
      toast.error('更新に失敗しました');
    }
  };

  // テンプレートから作成
  const createFromTemplate = (templateId: string, name: string) => {
    const patternId = patternService.createFromTemplate(userId, templateId, name);
    if (patternId) {
      toast.success('勤務パターンを作成しました');
      refreshPatterns();
      setShowTemplateDialog(false);
    } else {
      toast.error('作成に失敗しました');
    }
  };

  // アクティブパターンの変更
  const changeActivePattern = (patternId: string) => {
    const success = patternService.setActivePattern(userId, patternId);
    if (success) {
      toast.success('アクティブパターンを変更しました');
      refreshPatterns();
    }
  };

  // パターンの削除
  const deletePattern = (patternId: string) => {
    const success = patternService.deletePattern(userId, patternId);
    if (success) {
      toast.success('勤務パターンを削除しました');
      refreshPatterns();
    } else {
      toast.error('削除に失敗しました');
    }
  };

  // 例外日の追加
  const addException = () => {
    if (!activePattern || !newException.date) return;

    const exceptionId = patternService.addException(userId, activePattern.id, {
      date: new Date(newException.date),
      type: newException.type as any,
      customStartTime: newException.customStartTime || undefined,
      customEndTime: newException.customEndTime || undefined,
      reason: newException.reason || undefined,
      isRecurring: newException.isRecurring,
    });

    if (exceptionId) {
      toast.success('例外設定を追加しました');
      refreshPatterns();
      setShowExceptionDialog(false);
      setNewException({
        date: '',
        type: 'custom',
        customStartTime: '',
        customEndTime: '',
        reason: '',
        isRecurring: false,
      });
    }
  };

  // フィールド更新ヘルパー
  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ネストされたフィールド更新ヘルパー
  const updateNestedField = (parent: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  // 時間フォーマット
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  // バリデーション表示
  const ValidationDisplay = ({ result }: { result: any }) => {
    if (!result) return null;

    return (
      <div className="space-y-2 mt-4">
        {result.errors.map((error: any, index: number) => (
          <Alert key={index} variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ))}

        {result.warnings.map((warning: any, index: number) => (
          <Alert key={index}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>警告</AlertTitle>
            <AlertDescription>{warning.message}</AlertDescription>
          </Alert>
        ))}

        {result.suggestions.map((suggestion: string, index: number) => (
          <Alert key={index}>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>提案</AlertTitle>
            <AlertDescription>{suggestion}</AlertDescription>
          </Alert>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-8 w-8 text-blue-600" />
            勤務パターン設定
          </h1>
          <p className="text-gray-600 mt-1">
            あなたの認知特性に最適化された勤務時間を設定しましょう
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                テンプレート
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>勤務パターンテンプレート</DialogTitle>
                <DialogDescription>
                  あなたの特性に合ったテンプレートを選択してください
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:bg-gray-50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge
                          variant={template.category === 'adhd_friendly' ? 'default' : 'secondary'}
                        >
                          {template.category === 'adhd_friendly' && '特性配慮'}
                          {template.category === 'standard' && '標準'}
                          {template.category === 'flexible' && '柔軟'}
                          {template.category === 'strict' && '厳格'}
                        </Badge>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-green-800">メリット:</p>
                          <ul className="text-xs text-green-700 list-disc list-inside">
                            {template.benefits.map((benefit, index) => (
                              <li key={index}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-orange-800">考慮事項:</p>
                          <ul className="text-xs text-orange-700 list-disc list-inside">
                            {template.considerations.map((consideration, index) => (
                              <li key={index}>{consideration}</li>
                            ))}
                          </ul>
                        </div>
                        <Button
                          onClick={() => createFromTemplate(template.id, template.name)}
                          className="w-full mt-2"
                          size="sm"
                        >
                          このテンプレートを使用
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Button size="sm" onClick={() => setShowNewPatternDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            新規作成
          </Button>
        </div>
      </div>

      {/* アクティブパターン表示 */}
      {activePattern && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="h-5 w-5" />
              現在のアクティブパターン: {activePattern.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-green-700">勤務時間</p>
                <p className="font-semibold">
                  {activePattern.startTime} - {activePattern.endTime}
                </p>
              </div>
              <div>
                <p className="text-sm text-green-700">休憩時間</p>
                <p className="font-semibold">{activePattern.lunchBreakDuration}分</p>
              </div>
              <div>
                <p className="text-sm text-green-700">フレックス</p>
                <p className="font-semibold">{activePattern.flexTimeEnabled ? '有効' : '無効'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* メインコンテンツ */}
      <Tabs defaultValue="patterns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patterns">パターン管理</TabsTrigger>
          <TabsTrigger value="settings">詳細設定</TabsTrigger>
          <TabsTrigger value="cognitive">認知最適化</TabsTrigger>
          <TabsTrigger value="exceptions">例外設定</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          {/* パターン一覧 */}
          <div className="grid gap-4">
            {patterns.map((pattern) => (
              <Card key={pattern.id} className={pattern.isActive ? 'border-blue-200' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{pattern.name}</CardTitle>
                      {pattern.isActive && (
                        <Badge className="bg-blue-100 text-blue-800">アクティブ</Badge>
                      )}
                      {pattern.isDefault && <Badge variant="outline">デフォルト</Badge>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEditing(pattern)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!pattern.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => changeActivePattern(pattern.id)}
                        >
                          <Target className="h-4 w-4" />
                        </Button>
                      )}
                      {!pattern.isDefault && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>パターンを削除</AlertDialogTitle>
                              <AlertDialogDescription>
                                「{pattern.name}」を削除しますか？この操作は取り消せません。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deletePattern(pattern.id)}>
                                削除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">勤務時間</p>
                      <p className="font-semibold">
                        {pattern.startTime} - {pattern.endTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">標準時間</p>
                      <p className="font-semibold">{pattern.standardWorkHours}時間</p>
                    </div>
                    <div>
                      <p className="text-gray-600">昼休憩</p>
                      <p className="font-semibold">{pattern.lunchBreakDuration}分</p>
                    </div>
                    <div>
                      <p className="text-gray-600">フレックス</p>
                      <p className="font-semibold">{pattern.flexTimeEnabled ? '有効' : '無効'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {editingPattern && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  基本設定編集: {editingPattern.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 基本勤務時間 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startTime">開始時刻</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime || ''}
                      onChange={(e) => updateField('startTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">終了時刻</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime || ''}
                      onChange={(e) => updateField('endTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="standardWorkHours">標準労働時間</Label>
                    <Input
                      id="standardWorkHours"
                      type="number"
                      min="1"
                      max="12"
                      step="0.5"
                      value={formData.standardWorkHours || 8}
                      onChange={(e) => updateField('standardWorkHours', parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                {/* 休憩設定 */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Coffee className="h-5 w-5" />
                    休憩設定
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="lunchBreakDuration">昼休憩時間（分）</Label>
                      <Input
                        id="lunchBreakDuration"
                        type="number"
                        min="30"
                        max="120"
                        value={formData.lunchBreakDuration || 60}
                        onChange={(e) =>
                          updateField('lunchBreakDuration', parseInt(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="lunchBreakStart">昼休憩開始時刻</Label>
                      <Input
                        id="lunchBreakStart"
                        type="time"
                        value={formData.lunchBreakStart || ''}
                        onChange={(e) => updateField('lunchBreakStart', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="shortBreakFrequency">短い休憩の頻度（分おき）</Label>
                      <Input
                        id="shortBreakFrequency"
                        type="number"
                        min="30"
                        max="240"
                        value={formData.shortBreakFrequency || 120}
                        onChange={(e) =>
                          updateField('shortBreakFrequency', parseInt(e.target.value))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* フレックス設定 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      フレックスタイム
                    </h3>
                    <Switch
                      checked={formData.flexTimeEnabled || false}
                      onCheckedChange={(checked) => updateField('flexTimeEnabled', checked)}
                    />
                  </div>

                  {formData.flexTimeEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="coreTimeStart">コアタイム開始</Label>
                        <Input
                          id="coreTimeStart"
                          type="time"
                          value={formData.coreTimeStart || ''}
                          onChange={(e) => updateField('coreTimeStart', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="coreTimeEnd">コアタイム終了</Label>
                        <Input
                          id="coreTimeEnd"
                          type="time"
                          value={formData.coreTimeEnd || ''}
                          onChange={(e) => updateField('coreTimeEnd', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 残業・労働時間制限 */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    労働時間制限
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="maxOvertimePerDay">1日最大残業（分）</Label>
                      <Input
                        id="maxOvertimePerDay"
                        type="number"
                        min="0"
                        max="480"
                        value={formData.maxOvertimePerDay || 180}
                        onChange={(e) => updateField('maxOvertimePerDay', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxOvertimePerWeek">週最大残業（分）</Label>
                      <Input
                        id="maxOvertimePerWeek"
                        type="number"
                        min="0"
                        max="2400"
                        value={formData.maxOvertimePerWeek || 720}
                        onChange={(e) =>
                          updateField('maxOvertimePerWeek', parseInt(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxOvertimePerMonth">月最大残業（分）</Label>
                      <Input
                        id="maxOvertimePerMonth"
                        type="number"
                        min="0"
                        max="14400"
                        value={formData.maxOvertimePerMonth || 2880}
                        onChange={(e) =>
                          updateField('maxOvertimePerMonth', parseInt(e.target.value))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* 保存・キャンセル */}
                <div className="flex gap-2 pt-4">
                  <Button onClick={savePattern}>
                    <Save className="h-4 w-4 mr-2" />
                    保存
                  </Button>
                  <Button variant="outline" onClick={() => setEditingPattern(null)}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    キャンセル
                  </Button>
                </div>

                {/* バリデーション結果 */}
                <ValidationDisplay result={validationResult} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cognitive" className="space-y-4">
          {editingPattern && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  ADHD/ASD認知最適化設定
                </CardTitle>
                <CardDescription>あなたの認知特性に基づいて最適化された設定</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 集中ブロック設定 */}
                <div>
                  <Label htmlFor="focusBlockDuration">集中ブロック時間（分）</Label>
                  <div className="mt-2">
                    <Slider
                      value={[formData.cognitiveOptimization?.focusBlockDuration || 90]}
                      onValueChange={(value) =>
                        updateNestedField('cognitiveOptimization', 'focusBlockDuration', value[0])
                      }
                      max={180}
                      min={30}
                      step={15}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>30分</span>
                      <span className="font-semibold">
                        {formData.cognitiveOptimization?.focusBlockDuration || 90}分
                      </span>
                      <span>180分</span>
                    </div>
                  </div>
                </div>

                {/* タスク間バッファ */}
                <div>
                  <Label htmlFor="transitionBuffer">タスク間バッファ時間（分）</Label>
                  <div className="mt-2">
                    <Slider
                      value={[formData.cognitiveOptimization?.transitionBuffer || 15]}
                      onValueChange={(value) =>
                        updateNestedField('cognitiveOptimization', 'transitionBuffer', value[0])
                      }
                      max={60}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>5分</span>
                      <span className="font-semibold">
                        {formData.cognitiveOptimization?.transitionBuffer || 15}分
                      </span>
                      <span>60分</span>
                    </div>
                  </div>
                </div>

                {/* 感覚的配慮設定 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sensoryBreakNeeds">感覚休憩ニーズ</Label>
                    <Select
                      value={formData.cognitiveOptimization?.sensoryBreakNeeds || 'medium'}
                      onValueChange={(value) =>
                        updateNestedField('cognitiveOptimization', 'sensoryBreakNeeds', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">低 - 感覚的刺激に強い</SelectItem>
                        <SelectItem value="medium">中 - 標準的な配慮</SelectItem>
                        <SelectItem value="high">高 - 頻繁な休憩が必要</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="stimulationPreference">刺激度の好み</Label>
                    <Select
                      value={formData.cognitiveOptimization?.stimulationPreference || 'moderate'}
                      onValueChange={(value) =>
                        updateNestedField('cognitiveOptimization', 'stimulationPreference', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">最小 - 静かな環境を好む</SelectItem>
                        <SelectItem value="moderate">適度 - バランスの取れた環境</SelectItem>
                        <SelectItem value="high">高 - 刺激的な環境を好む</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 推奨事項表示 */}
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle>認知最適化のヒント</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                      <li>集中ブロックは90分以下に設定することで疲労を軽減できます</li>
                      <li>感覚休憩ニーズが高い場合、60-90分おきの休憩を推奨します</li>
                      <li>タスク間バッファは切り替えコストを軽減し、集中力を維持します</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="exceptions" className="space-y-4">
          {/* 例外設定 */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">例外設定</h2>
            <Dialog open={showExceptionDialog} onOpenChange={setShowExceptionDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  例外追加
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>例外日の追加</DialogTitle>
                  <DialogDescription>特定日の勤務パターンを変更します</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="exceptionDate">日付</Label>
                    <Input
                      id="exceptionDate"
                      type="date"
                      value={newException.date}
                      onChange={(e) =>
                        setNewException((prev) => ({ ...prev, date: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="exceptionType">種別</Label>
                    <Select
                      value={newException.type}
                      onValueChange={(value) =>
                        setNewException((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="holiday">休日</SelectItem>
                        <SelectItem value="short_day">短縮勤務</SelectItem>
                        <SelectItem value="long_day">延長勤務</SelectItem>
                        <SelectItem value="custom">カスタム</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newException.type === 'custom' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customStartTime">開始時刻</Label>
                        <Input
                          id="customStartTime"
                          type="time"
                          value={newException.customStartTime}
                          onChange={(e) =>
                            setNewException((prev) => ({
                              ...prev,
                              customStartTime: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="customEndTime">終了時刻</Label>
                        <Input
                          id="customEndTime"
                          type="time"
                          value={newException.customEndTime}
                          onChange={(e) =>
                            setNewException((prev) => ({
                              ...prev,
                              customEndTime: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="exceptionReason">理由</Label>
                    <Textarea
                      id="exceptionReason"
                      value={newException.reason}
                      onChange={(e) =>
                        setNewException((prev) => ({
                          ...prev,
                          reason: e.target.value,
                        }))
                      }
                      placeholder="例外設定の理由を入力"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="recurring"
                      checked={newException.isRecurring}
                      onCheckedChange={(checked) =>
                        setNewException((prev) => ({
                          ...prev,
                          isRecurring: checked,
                        }))
                      }
                    />
                    <Label htmlFor="recurring">繰り返し設定</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowExceptionDialog(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={addException}>追加</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* 例外一覧 */}
          {activePattern && activePattern.exceptions.length > 0 ? (
            <div className="space-y-2">
              {activePattern.exceptions.map((exception: any) => (
                <Card key={exception.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {format(new Date(exception.date), 'yyyy年MM月dd日', { locale: ja })}
                        </p>
                        <p className="text-sm text-gray-600">{exception.reason}</p>
                        {exception.customStartTime && exception.customEndTime && (
                          <p className="text-sm text-blue-600">
                            {exception.customStartTime} - {exception.customEndTime}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {exception.type === 'holiday' && '休日'}
                          {exception.type === 'short_day' && '短縮'}
                          {exception.type === 'long_day' && '延長'}
                          {exception.type === 'custom' && 'カスタム'}
                        </Badge>
                        {exception.isRecurring && <Badge variant="secondary">繰り返し</Badge>}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            patternService.removeException(userId, activePattern.id, exception.id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">例外設定はありません</p>
                <p className="text-sm text-gray-500">
                  特定日の勤務パターンを変更したい場合は例外を追加してください
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkPatternConfigDashboard;
