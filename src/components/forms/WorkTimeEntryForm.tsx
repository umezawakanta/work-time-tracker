import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createWorkTimeEntry, fetchWorkTimeEntries } from '@/store/workTimeSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { WorkTimeEntry } from '@/types/workTimeEntry';
import { AppDispatch, RootState } from '@/store';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ExclamationTriangleIcon,
  InfoCircledIcon,
  PlusIcon,
  CheckIcon,
  TimerIcon,
  ReloadIcon,
  CalendarIcon,
  ClockIcon,
} from '@radix-ui/react-icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/useAuth';
import userSubscriptionApi from '@/services/api/userSubscriptionApi';
import projectApi from '@/services/api/projectApi';
import presetApi from '@/services/api/presetApi';

// プロジェクトのインターフェース定義
interface Project {
  _id: string;
  name: string;
  color: string;
  lastUsed?: Date;
  userId: string;
}

// プリセットのインターフェース定義
interface WorkPreset {
  _id: string;
  name: string;
  description: string;
  projectId: string;
  duration: number; // 分単位
  userId: string;
}

// サブスクリプション情報のインターフェース
interface UserSubscription {
  _id: string;
  userId: string;
  planId: string;
  status: 'active' | 'inactive' | 'canceled';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export default function WorkTimeEntryForm() {
  // コンテキストフック
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redux
  const dispatch = useDispatch<AppDispatch>();
  const recentEntries = useSelector((state: RootState) => state.workTime.entries.slice(0, 5));

  // ローカル状態
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [workStartTime, setWorkStartTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('auto');
  const [showPresets, setShowPresets] = useState(false);
  const [presetDuration, setPresetDuration] = useState(30); // 分単位
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  // データ状態
  const [projects, setProjects] = useState<Project[]>([]);
  const [presets, setPresets] = useState<WorkPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('bg-blue-500');
  const [isNewPresetDialogOpen, setIsNewPresetDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');
  const [newPresetProjectId, setNewPresetProjectId] = useState('');
  const [newPresetDuration, setNewPresetDuration] = useState(30);

  // ルーティング
  const navigate = useNavigate();

  // タイマー用のref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // データの取得
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // プロジェクト情報の取得
        const projectResponse = await projectApi.getUserProjects(user.id);
        setProjects(projectResponse?.data || []);

        // プロジェクトが存在しない場合、デフォルトプロジェクトを作成
        if (!projectResponse.data || projectResponse.data.length === 0) {
          // デフォルトプロジェクトの作成
          const defaultProject = await projectApi.createProject({
            name: 'マイプロジェクト',
            color: 'bg-blue-500',
            userId: user.id,
            lastUsed: new Date(),
          });
          setProjects([defaultProject.data]);
          setProjectName(defaultProject.data.name);
        } else {
          // 最後に使用したプロジェクトを初期値に設定
          const sortedProjects = [...projectResponse.data].sort(
            (a, b) => new Date(b.lastUsed || 0).getTime() - new Date(a.lastUsed || 0).getTime()
          );
          if (sortedProjects.length > 0) {
            setProjectName(sortedProjects[0].name);
          }
        }
        // サブスクリプション情報の取得
        try {
          const subscriptionResponse = await userSubscriptionApi.getUserSubscription(user.id);
          setSubscription(subscriptionResponse.data);
        } catch (subscriptionError) {
          console.warn('サブスクリプション情報取得エラー:', subscriptionError);
          // サブスクリプション情報がなくても主要機能に影響しないため、エラーを表示せず続行
        }
      } catch (error) {
        // エラーハンドリングを改善
        console.error('プロジェクト取得エラー:', error);

        // APIエラーの場合は、デフォルトプロジェクトを作成
        try {
          const defaultProject = await projectApi.createProject({
            name: 'マイプロジェクト',
            color: 'bg-blue-500',
            userId: user.id,
            lastUsed: new Date(),
          });
          setProjects([defaultProject.data]);
          setProjectName(defaultProject.data.name);
        } catch (e) {
          console.error('デフォルトプロジェクト作成エラー:', e);
          toast({
            title: 'エラー',
            description: 'プロジェクト情報の取得と作成に失敗しました。',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user, toast]);

  useEffect(() => {
    // コンポーネント読み込み時に作業時間を取得
    if (isAuthenticated && user) {
      dispatch(fetchWorkTimeEntries());
    }
  }, [isAuthenticated, user, dispatch]);

  // 作業状態の復元 (アプリが閉じられても作業状態を保持)
  useEffect(() => {
    const savedWorkState = localStorage.getItem('workState');
    if (savedWorkState) {
      try {
        const { isWorking, startTime, projectName, description } = JSON.parse(savedWorkState);
        if (isWorking) {
          setIsWorking(true);
          setWorkStartTime(new Date(startTime));
          setProjectName(projectName);
          setDescription(description);
          setStartTime(new Date(startTime).toISOString().slice(0, 16));
        }
      } catch (e) {
        console.error('作業状態の復元エラー:', e);
      }
    }
  }, []);

  // タイマー処理
  useEffect(() => {
    if (isWorking) {
      timerRef.current = setInterval(() => {
        if (workStartTime) {
          const now = new Date();
          const duration = Math.floor((now.getTime() - workStartTime.getTime()) / 1000);
          document.title = `⏱️ ${formatDuration(duration)} | 作業中`;
        }
      }, 1000);

      // 作業状態を保存
      if (workStartTime) {
        localStorage.setItem(
          'workState',
          JSON.stringify({
            isWorking,
            startTime: workStartTime.toISOString(),
            projectName,
            description,
          })
        );
      }

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          document.title = 'Work Time Tracker';
        }
      };
    } else {
      // 作業状態クリア
      localStorage.removeItem('workState');
      document.title = 'Work Time Tracker';
    }
  }, [isWorking, workStartTime, projectName, description]);

  // 時間フォーマット
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 現在の作業時間を計算
  const getCurrentDuration = () => {
    if (!workStartTime) return 0;
    const now = new Date();
    return Math.floor((now.getTime() - workStartTime.getTime()) / 1000);
  };

  // 作業開始
  const handleStartWork = () => {
    if (!projectName) {
      setError('プロジェクト名を入力してください。');
      return;
    }

    const now = new Date();
    setWorkStartTime(now);
    setStartTime(now.toISOString().slice(0, 16));
    setIsWorking(true);
    setError(null);

    // 作業開始通知
    toast({
      title: '作業開始',
      description: `${projectName}の作業を開始しました。`,
      duration: 3000,
    });
  };

  // 作業終了
  const handleEndWork = async () => {
    if (!workStartTime) return;

    const now = new Date();
    setEndTime(now.toISOString().slice(0, 16));
    setIsWorking(false);

    await submitWorkTimeEntry(workStartTime, now);
  };

  // 手動入力送信
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSubmitting) {
      return;
    }

    if (!projectName || !startTime || !endTime) {
      setError('すべての必須フィールドを入力してください。');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError('有効な開始時間と終了時間を入力してください。');
      return;
    }

    if (end <= start) {
      setError('終了時間は開始時間より後でなければなりません。');
      return;
    }

    await submitWorkTimeEntry(start, end);
  };

  // プリセット適用
  const handlePresetSubmit = async (preset: WorkPreset) => {
    const project = projects.find((p) => p._id === preset.projectId);
    if (!project) return;

    const now = new Date();
    const start = selectedDate ? new Date(selectedDate) : now;
    start.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + preset.duration);

    setProjectName(project.name);
    setDescription(preset.description);
    setStartTime(start.toISOString().slice(0, 16));
    setEndTime(end.toISOString().slice(0, 16));

    // プリセットを直接送信するか、フォームに入力して確認してから送信
    if (activeTab === 'presets') {
      await submitWorkTimeEntry(start, end);
    } else {
      setActiveTab('manual');
    }

    setShowPresets(false);
  };

  // 作業記録の送信
  const submitWorkTimeEntry = async (start: Date, end: Date) => {
    if (!projectName.trim() || !description.trim()) {
      setError('プロジェクト名と説明は必須項目です');
      return;
    }

    try {
      setIsSubmitting(true);

      const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

      const entryData = {
        projectName: projectName.trim(),
        description: description.trim(),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        duration,
        date: start.toISOString().split('T')[0],
      };

      // Redux経由で作業時間を作成
      await dispatch(createWorkTimeEntry(entryData)).unwrap();

      toast({
        title: '作業時間が記録されました',
        description: `${projectName} - ${formatDuration(duration)}`,
      });

      resetForm();
    } catch (error) {
      setError(error as string);
      toast({
        title: 'エラー',
        description: error as string,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // フォームリセット
  const resetForm = () => {
    setWorkStartTime(null);
    setDescription('');
    setStartTime('');
    setEndTime('');
  };

  // 最終使用プロジェクトの更新
  const updateLastUsedProject = async (name: string) => {
    try {
      const project = projects.find((p) => p.name === name);
      if (project) {
        const updatedProject = await projectApi.updateProject(project._id, {
          ...project,
          lastUsed: new Date(),
        });

        setProjects((prev) =>
          prev.map((p) => (p._id === updatedProject.data._id ? updatedProject.data : p))
        );
      }
    } catch (error) {
      console.error('プロジェクト更新エラー:', error);
    }
  };

  // クイック時間設定（+15分、+30分、+1時間など）
  const handleQuickDuration = (minutes: number) => {
    if (!workStartTime) return;

    const end = new Date(workStartTime);
    end.setMinutes(end.getMinutes() + minutes);

    setEndTime(end.toISOString().slice(0, 16));
  };

  // 最近使ったプロジェクトの選択
  const handleSelectProject = async (project: Project) => {
    setProjectName(project.name);
    await updateLastUsedProject(project.name);
  };

  // 新規プロジェクト作成
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: 'エラー',
        description: 'プロジェクト名を入力してください。',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const newProject = await projectApi.createProject({
        name: newProjectName,
        color: newProjectColor,
        userId: user?.id || '',
        lastUsed: new Date(),
      });

      setProjects((prev) => [...prev, newProject.data]);
      setProjectName(newProject.data.name);
      setIsNewProjectDialogOpen(false);
      setNewProjectName('');

      toast({
        title: 'プロジェクト作成',
        description: `「${newProject.data.name}」プロジェクトを作成しました。`,
      });
    } catch (error) {
      console.error('プロジェクト作成エラー:', error);
      toast({
        title: 'エラー',
        description: 'プロジェクトの作成に失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 新規プリセット作成
  const handleCreatePreset = async () => {
    if (activeTab === 'manual') {
      // 手動入力モードからプリセット作成開始時は現在の値を設定
      setNewPresetName(description || '新しいプリセット');
      setNewPresetDescription(description || '');
      const selectedProject = projects.find((p) => p.name === projectName);
      if (selectedProject) {
        setNewPresetProjectId(selectedProject._id);
      }
      setNewPresetDuration(presetDuration);
    }

    setIsNewPresetDialogOpen(true);
  };

  // プリセットの保存
  const handleSavePreset = async () => {
    if (!newPresetName.trim() || !newPresetProjectId) {
      toast({
        title: 'エラー',
        description: 'プリセット名とプロジェクトを入力してください。',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const newPreset = await presetApi.createPreset({
        name: newPresetName,
        description: newPresetDescription,
        projectId: newPresetProjectId,
        duration: newPresetDuration,
        userId: user?.id || '',
      });

      setPresets((prev) => [...prev, newPreset.data]);
      setIsNewPresetDialogOpen(false);

      toast({
        title: 'プリセット作成',
        description: `「${newPreset.data.name}」(${newPresetDuration}分)のプリセットを作成しました。`,
      });
    } catch (error) {
      console.error('プリセット作成エラー:', error);
      toast({
        title: 'エラー',
        description: 'プリセットの作成に失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // プレミアムプラン確認
  const isPremium =
    subscription && subscription.status === 'active' && subscription.planId !== 'free';

  // プレミアム機能へのアクセス確認
  const checkPremiumAccess = (featureName: string) => {
    if (!isPremium) {
      toast({
        title: 'プレミアム機能',
        description: `${featureName}はプレミアムプラン限定の機能です。アップグレードしてご利用ください。`,
        variant: 'default',
      });
      return false;
    }
    return true;
  };

  // プレミアムプランへのアップグレード
  const handleUpgradeToPremium = () => {
    navigate('/subscription');
  };

  // ローディング表示
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  // カラーオプションの定義
  const colorOptions = [
    { id: 'bg-blue-500', name: '青', color: 'blue-500' },
    { id: 'bg-green-500', name: '緑', color: 'green-500' },
    { id: 'bg-red-500', name: '赤', color: 'red-500' },
    { id: 'bg-yellow-500', name: '黄', color: 'yellow-500' },
    { id: 'bg-purple-500', name: '紫', color: 'purple-500' },
    { id: 'bg-pink-500', name: 'ピンク', color: 'pink-500' },
    { id: 'bg-indigo-500', name: '藍', color: 'indigo-500' },
    { id: 'bg-gray-500', name: '灰色', color: 'gray-500' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-1">作業時間の記録</CardTitle>
              <CardDescription>簡単に作業時間を記録・管理できます</CardDescription>
            </div>

            {isWorking && workStartTime && (
              <Badge
                variant="outline"
                className="text-lg font-semibold bg-blue-50 text-blue-700 flex items-center gap-1 py-1.5 px-3"
              >
                <TimerIcon className="h-4 w-4 animate-pulse" />
                <span>{formatDuration(getCurrentDuration())}</span>
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* 最近使用したプロジェクト */}
          <div className="mb-6">
            <div className="text-sm font-medium mb-2 text-muted-foreground">最近のプロジェクト</div>
            <div className="flex flex-wrap gap-2">
              {projects
                .sort(
                  (a, b) =>
                    new Date(b.lastUsed || 0).getTime() - new Date(a.lastUsed || 0).getTime()
                )
                .map((project) => (
                  <button
                    key={project._id}
                    onClick={() => handleSelectProject(project)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                      'border hover:bg-muted',
                      projectName === project.name
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-muted/40'
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${project.color}`}></div>
                      <span>{project.name}</span>
                    </div>
                  </button>
                ))}

              <button
                className="px-3 py-1.5 rounded-full text-xs font-medium border hover:bg-muted transition-colors flex items-center gap-1.5"
                onClick={() => setIsNewProjectDialogOpen(true)}
              >
                <PlusIcon className="h-3 w-3" />
                <span>新規作成</span>
              </button>
            </div>
          </div>

          {/* 最近の作業記録 */}
          {recentEntries.length > 0 && (
            <div className="mb-6 space-y-2">
              <div className="text-sm font-medium text-muted-foreground">最近の記録</div>
              <div className="space-y-2">
                {recentEntries.map((entry) => (
                  <Card key={entry._id} className="p-3 hover:bg-muted/20 cursor-pointer">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">{entry.projectName}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {entry.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {formatDuration(entry.duration)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isToday(new Date(entry.startTime))
                            ? format(new Date(entry.startTime), 'HH:mm')
                            : format(new Date(entry.startTime), 'MM/dd')}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Tabs
            defaultValue="auto"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="auto">タイマー</TabsTrigger>
              <TabsTrigger value="manual">手動入力</TabsTrigger>
              <TabsTrigger
                value="presets"
                onClick={() => {
                  if (!isPremium && presets.length >= 3) {
                    checkPremiumAccess('3つ以上のプリセット');
                  }
                }}
              >
                プリセット
              </TabsTrigger>
            </TabsList>

            {/* タイマーモード */}
            <TabsContent value="auto" className="pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="autoProjectName">プロジェクト名</Label>
                  <Select
                    value={projectName}
                    onValueChange={(value) => {
                      setProjectName(value);
                      const selectedProject = projects.find((p) => p.name === value);
                      if (selectedProject) {
                        updateLastUsedProject(selectedProject.name);
                      }
                    }}
                    disabled={isWorking}
                  >
                    <SelectTrigger id="autoProjectName">
                      <SelectValue placeholder="プロジェクトを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project._id} value={project.name}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${project.color}`}></div>
                            <span>{project.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="autoDescription">作業内容</Label>
                  <Textarea
                    id="autoDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isWorking}
                    placeholder="今日の作業内容を簡潔に記録してください"
                  />
                </div>

                {isWorking && workStartTime && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-center mb-6">
                      <div className="text-sm text-muted-foreground">経過時間</div>
                      <div className="text-3xl font-bold text-blue-700">
                        {formatDuration(getCurrentDuration())}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(workStartTime, 'HH:mm')}から作業中
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleQuickDuration(15)}>
                          +15分
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickDuration(30)}>
                          +30分
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickDuration(60)}>
                          +1時間
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between space-x-4 pt-2">
                  {!isWorking ? (
                    <Button onClick={handleStartWork} disabled={isSubmitting} className="w-full">
                      <TimerIcon className="mr-2 h-4 w-4" />
                      作業開始
                    </Button>
                  ) : (
                    <Button
                      onClick={handleEndWork}
                      disabled={isSubmitting}
                      className="w-full"
                      variant="default"
                    >
                      <CheckIcon className="mr-2 h-4 w-4" />
                      作業完了
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* プリセットモード */}
            <TabsContent value="presets" className="pt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>作業日</Label>

                  <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-[240px] justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, 'yyyy年MM月dd日', { locale: ja })
                        ) : (
                          <span>日付を選択</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setShowCalendar(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>よく使うプリセット</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs"
                      onClick={() => setShowPresets(!showPresets)}
                    >
                      <span>{showPresets ? '簡易表示' : '詳細表示'}</span>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {presets.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>プリセットがまだありません</p>
                        <p className="text-sm mt-1">
                          よく使う作業内容をプリセットとして保存できます
                        </p>
                      </div>
                    ) : (
                      presets.map((preset) => {
                        const project = projects.find((p) => p._id === preset.projectId);

                        return showPresets ? (
                          <Card key={preset._id} className="p-3">
                            <div className="flex justify-between">
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {project && (
                                    <div className={`w-2 h-2 rounded-full ${project.color}`}></div>
                                  )}
                                  {preset.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {preset.description}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{preset.duration}分</Badge>
                                <Button size="sm" onClick={() => handlePresetSubmit(preset)}>
                                  適用
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ) : (
                          <button
                            key={preset._id}
                            onClick={() => handlePresetSubmit(preset)}
                            className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {project && (
                                <div className={`w-2 h-2 rounded-full ${project.color}`}></div>
                              )}
                              <span>{preset.name}</span>
                            </div>
                            <Badge variant="outline">{preset.duration}分</Badge>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full gap-1"
                    onClick={() => {
                      setNewPresetName('');
                      setNewPresetDescription('');
                      setNewPresetProjectId(projects[0]?._id || '');
                      setNewPresetDuration(30);
                      setIsNewPresetDialogOpen(true);
                    }}
                  >
                    <PlusIcon className="h-4 w-4" />
                    新しいプリセットを作成
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* 手動入力モード */}
            <TabsContent value="manual" className="pt-4">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manualProjectName">プロジェクト名</Label>
                  <Select
                    value={projectName}
                    onValueChange={(value) => {
                      setProjectName(value);
                      const selectedProject = projects.find((p) => p.name === value);
                      if (selectedProject) {
                        updateLastUsedProject(selectedProject.name);
                      }
                    }}
                  >
                    <SelectTrigger id="manualProjectName">
                      <SelectValue placeholder="プロジェクトを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project._id} value={project.name}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${project.color}`}></div>
                            <span>{project.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manualDescription">作業内容</Label>
                  <Textarea
                    id="manualDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="作業内容を記入してください"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="manualStartTime">開始時間</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const now = new Date();
                          setStartTime(now.toISOString().slice(0, 16));
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        現在時刻
                      </Button>
                    </div>
                    <Input
                      id="manualStartTime"
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="manualEndTime">終了時間</Label>
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="presetDuration">プリセット用の期間（分）</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="presetDuration"
                            type="range"
                            min="5"
                            max="180"
                            step="5"
                            value={presetDuration}
                            onChange={(e) => setPresetDuration(parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <span className="w-16 text-center">{presetDuration}分</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const now = new Date();
                          setEndTime(now.toISOString().slice(0, 16));
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        現在時刻
                      </Button>
                    </div>
                    <Input
                      id="manualEndTime"
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCreatePreset}
                    className="gap-1"
                  >
                    <PlusIcon className="h-4 w-4" />
                    プリセット化
                  </Button>

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        送信中...
                      </>
                    ) : (
                      '記録を保存'
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* フリープラン制限の警告 */}
          {!isPremium && recentEntries.length >= 5 && (
            <Alert className="mt-4 bg-amber-50">
              <InfoCircledIcon className="h-4 w-4" />
              <AlertTitle>フリープラン制限</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <p>
                  フリープランでは10件までの作業記録が保存できます。 あと
                  {10 - recentEntries.length}件です。
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUpgradeToPremium}
                  className="self-start"
                >
                  プレミアムプランにアップグレード
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t pt-6">
          <Button
            variant="outline"
            onClick={() => navigate('/work-time-reports')}
            className="gap-2"
          >
            <ClockIcon className="h-4 w-4" />
            すべての作業記録を表示
          </Button>
        </CardFooter>
      </Card>

      {/* 新規プロジェクト作成ダイアログ */}
      <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新しいプロジェクトを作成</DialogTitle>
            <DialogDescription>
              作業を整理するための新しいプロジェクトを作成します。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newProjectName">プロジェクト名</Label>
              <Input
                id="newProjectName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="新しいプロジェクト名"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>カラー</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((colorOption) => (
                  <button
                    key={colorOption.id}
                    type="button"
                    aria-label={`${colorOption.name}色を選択`}
                    className={cn(
                      'w-8 h-8 rounded-full',
                      colorOption.id,
                      newProjectColor === colorOption.id ? 'ring-2 ring-offset-2 ring-primary' : ''
                    )}
                    onClick={() => setNewProjectColor(colorOption.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewProjectDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleCreateProject} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  作成中...
                </>
              ) : (
                '作成'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新規プリセット作成ダイアログ */}
      <Dialog open={isNewPresetDialogOpen} onOpenChange={setIsNewPresetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新しいプリセットを作成</DialogTitle>
            <DialogDescription>よく使う作業内容をプリセットとして保存できます。</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPresetName">プリセット名</Label>
              <Input
                id="newPresetName"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="プリセット名"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPresetDescription">説明（オプション）</Label>
              <Textarea
                id="newPresetDescription"
                value={newPresetDescription}
                onChange={(e) => setNewPresetDescription(e.target.value)}
                placeholder="この作業の詳細"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPresetProjectId">プロジェクト</Label>
              <Select value={newPresetProjectId} onValueChange={setNewPresetProjectId}>
                <SelectTrigger id="newPresetProjectId">
                  <SelectValue placeholder="プロジェクトを選択" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${project.color}`}></div>
                        <span>{project.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPresetDuration">所要時間（分）</Label>
              <Input
                id="newPresetDuration"
                type="number"
                min="1"
                max="1440"
                value={newPresetDuration}
                onChange={(e) => setNewPresetDuration(parseInt(e.target.value))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewPresetDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSavePreset} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
