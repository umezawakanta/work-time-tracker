import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addWorkTimeEntry } from "@/store/workTimeSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AppDispatch, RootState } from "@/store";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ExclamationTriangleIcon,
  InfoCircledIcon,
  PlusIcon,
  CheckIcon,
  TimerIcon,
  DesktopIcon,
  ReloadIcon,
  CalendarIcon,
  ClockIcon,
} from "@radix-ui/react-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, isToday } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/useProjects";
import { useWorkPresets } from "@/hooks/useWorkPresets";
import { IWorkTimeEntry, Project, WorkPreset } from "@/types";

export default function WorkTimeEntryForm() {
  // Redux状態と各種フック
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const navigate = useNavigate();

  // 最近の作業記録を取得
  const recentEntries = useSelector((state: RootState) =>
    state.workTime.entries.slice(0, 5)
  );

  // カスタムフックでプロジェクトとプリセットを取得
  const { projects, isLoadingProjects, createProject, updateProjectUsage } =
    useProjects();
  const { presets, isLoadingPresets, createPreset, updatePresetUsage  } =
    useWorkPresets();

  // ローカル状態
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [workStartTime, setWorkStartTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("auto");
  const [showPresets, setShowPresets] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [showCalendar, setShowCalendar] = useState(false);

  // 新規プロジェクト作成用
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectColor, setNewProjectColor] = useState("bg-blue-500");
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);

  // 新規プリセット作成用
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetDescription, setNewPresetDescription] = useState("");
  const [newPresetProjectId, setNewPresetProjectId] = useState("");
  const [newPresetDuration, setNewPresetDuration] = useState(30);
  const [showNewPresetDialog, setShowNewPresetDialog] = useState(false);

  // タイマー用のref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 作業状態の復元（アプリが閉じられても作業状態を保持）
  useEffect(() => {
    const savedWorkState = localStorage.getItem("workState");
    if (savedWorkState) {
      try {
        const { isWorking, startTime, projectName, description } =
          JSON.parse(savedWorkState);
        if (isWorking) {
          setIsWorking(true);
          setWorkStartTime(new Date(startTime));
          setProjectName(projectName);
          setDescription(description);
          setStartTime(new Date(startTime).toISOString().slice(0, 16));
        }
      } catch (e) {
        console.error("作業状態の復元エラー:", e);
      }
    }
  }, []);

  // プロジェクト読み込み後に初期値を設定
  useEffect(() => {
    if (projects.length > 0 && !projectName) {
      setProjectName(projects[0].name);

      // 新規プリセット作成用のプロジェクトIDも設定
      if (projects[0].id) {
        setNewPresetProjectId(projects[0].id);
      }
    }
  }, [projects, projectName]);

  // タイマー処理
  useEffect(() => {
    if (isWorking) {
      timerRef.current = setInterval(() => {
        if (workStartTime) {
          const now = new Date();
          const duration = Math.floor(
            (now.getTime() - workStartTime.getTime()) / 1000
          );
          document.title = `⏱️ ${formatDuration(duration)} | 作業中`;
        }
      }, 1000);

      // 作業状態を保存
      if (workStartTime) {
        localStorage.setItem(
          "workState",
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
          document.title = "Work Time Tracker";
        }
      };
    } else {
      // 作業状態クリア
      localStorage.removeItem("workState");
      document.title = "Work Time Tracker";
    }
  }, [isWorking, workStartTime, projectName, description]);

  // 時間フォーマット
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // 現在の作業時間を計算
  const getCurrentDuration = () => {
    if (!workStartTime) return 0;
    const now = new Date();
    return Math.floor((now.getTime() - workStartTime.getTime()) / 1000);
  };

  // 作業開始
  const handleStartWork = () => {
    const now = new Date();
    setWorkStartTime(now);
    setStartTime(now.toISOString().slice(0, 16));
    setIsWorking(true);

    // プロジェクトの使用状況を更新
    const project = projects.find((p) => p.name === projectName);
    if (project && project.id) {
      updateProjectUsage(project.id);
    }

    // 作業開始通知
    toast({
      title: "作業開始",
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
      setError("すべての必須フィールドを入力してください。");
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError("有効な開始時間と終了時間を入力してください。");
      return;
    }

    if (end <= start) {
      setError("終了時間は開始時間より後でなければなりません。");
      return;
    }

    await submitWorkTimeEntry(start, end);
  };

  // プリセット適用
  const handlePresetSubmit = async (preset: WorkPreset) => {
    const project = projects.find((p) => p.id === preset.projectId);
    if (!project) return;

    // プリセットの使用状況を更新
    updatePresetUsage (preset.id);

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
    if (activeTab === "presets") {
      await submitWorkTimeEntry(start, end, preset.id);
    } else {
      setActiveTab("manual");
    }

    setShowPresets(false);
  };

  // 作業記録の送信
  const submitWorkTimeEntry = async (
    start: Date,
    end: Date,
    presetId?: string
  ) => {
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

    // 対応するプロジェクトIDを取得
    const project = projects.find((p) => p.name === projectName);
    if (!project || !project.id) {
      setError("有効なプロジェクトを選択してください。");
      return;
    }

    const newEntry = {
      projectId: project.id,
      projectName,
      description: description || `作業時間: ${formatDuration(duration)}`,
      startTime: start,
      endTime: end,
      duration,
      date: start.toISOString().split("T")[0], // 文字列として渡す
      presetId: presetId || undefined,
    } as unknown as Omit<IWorkTimeEntry, "_id">;

    setIsSubmitting(true);

    try {
      await dispatch(addWorkTimeEntry(newEntry as unknown as Parameters<typeof addWorkTimeEntry>[0])).unwrap();

      // プロジェクトの使用状況を更新
      updateProjectUsage(project.id);

      toast({
        title: "記録完了",
        description: `${formatDuration(duration)}の作業を記録しました。`,
        duration: 5000,
      });

      // 成功したら報告ページへ
      navigate("/work-time-reports");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("作業時間エントリーの作成エラー:", errorMessage);
      setError(
        `作業時間エントリーの作成に失敗しました: ${errorMessage}`
      );
    } finally {
      setIsSubmitting(false);
      resetForm();
    }
  };

  // フォームリセット
  const resetForm = () => {
    setWorkStartTime(null);
    setDescription("");
    setStartTime("");
    setEndTime("");
  };

  // クイック時間設定（+15分、+30分、+1時間など）
  const handleQuickDuration = (minutes: number) => {
    if (!workStartTime) return;

    const end = new Date(workStartTime);
    end.setMinutes(end.getMinutes() + minutes);

    setEndTime(end.toISOString().slice(0, 16));
  };

  // 最近使ったプロジェクトの選択
  const handleSelectProject = (project: Project) => {
    setProjectName(project.name);
    if (project.id) {
      updateProjectUsage(project.id);
    }
  };

  // 新規プロジェクト作成
  const handleCreateProject = async () => {
    if (!newProjectName) {
      toast({
        title: "エラー",
        description: "プロジェクト名を入力してください。",
        variant: "destructive",
      });
      return;
    }

    try {
      const newProject = await createProject({
        name: newProjectName,
        color: newProjectColor,
      });

      setProjectName(newProject.name);
      setShowNewProjectDialog(false);
      setNewProjectName("");

      toast({
        title: "プロジェクト作成",
        description: `「${newProject.name}」プロジェクトを作成しました。`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: "エラー",
        description: `プロジェクト作成に失敗しました: ${
          errorMessage
        }`,
        variant: "destructive",
      });
    }
  };

  // 新規プリセット作成
  const handleCreatePreset = async () => {
    if (!newPresetName || !newPresetProjectId) {
      toast({
        title: "エラー",
        description: "プリセット名とプロジェクトを入力してください。",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPreset({
        name: newPresetName,
        description: newPresetDescription,
        projectId: newPresetProjectId,
        duration: newPresetDuration,
      });

      setShowNewPresetDialog(false);
      resetPresetForm();

      toast({
        title: "プリセット作成",
        description: `「${newPresetName}」(${newPresetDuration}分)のプリセットを作成しました。`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: "エラー",
        description: `プリセット作成に失敗しました: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  // プリセットフォームのリセット
  const resetPresetForm = () => {
    setNewPresetName("");
    setNewPresetDescription("");
    setNewPresetDuration(30);
    // プロジェクトIDはリセットしない（最後に選択したままにする）
  };

  // 手動モードのプリセット化
  const handleManualToPreset = () => {
    // 手動モードの内容をプリセット作成ダイアログに設定
    setNewPresetName(description || "新しいプリセット");
    setNewPresetDescription(description || "");

    const project = projects.find((p) => p.name === projectName);
    if (project && project.id) {
      setNewPresetProjectId(project.id);
    }

    // 開始・終了時間から所要時間を計算
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
        const durationMinutes = Math.floor(
          (end.getTime() - start.getTime()) / (60 * 1000)
        );
        setNewPresetDuration(durationMinutes);
      }
    }

    setShowNewPresetDialog(true);
  };

  // コンポーネント読み込み中の表示
  if (isLoadingProjects) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            プロジェクト情報を読み込み中...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-1">作業時間の記録</CardTitle>
              <CardDescription>
                簡単に作業時間を記録・管理できます
              </CardDescription>
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
            <div className="text-sm font-medium mb-2 text-muted-foreground">
              最近のプロジェクト
            </div>
            <div className="flex flex-wrap gap-2">
              {projects
                .sort(
                  (a, b) =>
                    new Date(b.lastUsed || 0).getTime() -
                    new Date(a.lastUsed || 0).getTime()
                )
                .map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                      "border hover:bg-muted",
                      projectName === project.name
                        ? "bg-primary/10 border-primary/30"
                        : "bg-muted/40"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-2 h-2 rounded-full ${project.color}`}
                      ></div>
                      <span>{project.name}</span>
                    </div>
                  </button>
                ))}

              <Dialog
                open={showNewProjectDialog}
                onOpenChange={setShowNewProjectDialog}
              >
                <DialogTrigger asChild>
                  <button className="px-3 py-1.5 rounded-full text-xs font-medium border hover:bg-muted transition-colors flex items-center gap-1.5">
                    <PlusIcon className="h-3 w-3" />
                    <span>新規作成</span>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新しいプロジェクトを作成</DialogTitle>
                    <DialogDescription>
                      新しいプロジェクトの名前と色を設定してください。
                    </DialogDescription>
                  </DialogHeader>
                  {/* プロジェクト作成フォーム */}
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="newProjectName">プロジェクト名</Label>
                      <Input
                        id="newProjectName"
                        placeholder="新しいプロジェクト名"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>色</Label>
                      <div className="flex gap-2">
                        {[
                          "bg-blue-500",
                          "bg-green-500",
                          "bg-red-500",
                          "bg-yellow-500",
                          "bg-purple-500",
                          "bg-pink-500",
                        ].map((color) => (
                          <div
                            key={color}
                            className={`w-8 h-8 rounded-full ${color} cursor-pointer border-2 ${
                              newProjectColor === color
                                ? "border-gray-800"
                                : "border-transparent"
                            } hover:border-gray-400`}
                            onClick={() => setNewProjectColor(color)}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateProject}>作成</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* 最近の作業記録 */}
          {recentEntries.length > 0 && (
            <div className="mb-6 space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                最近の記録
              </div>
              <div className="space-y-2">
                {recentEntries.map((entry) => (
                  <Card
                    key={entry._id}
                    className="p-3 hover:bg-muted/20 cursor-pointer"
                  >
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
                            ? format(new Date(entry.startTime), "HH:mm")
                            : format(new Date(entry.startTime), "MM/dd")}
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
              <TabsTrigger value="presets">プリセット</TabsTrigger>
            </TabsList>

            {/* タイマーモード */}
            <TabsContent value="auto" className="pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="autoProjectName">プロジェクト名</Label>
                  <Input
                    id="autoProjectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    disabled={isWorking}
                  />
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
                      <div className="text-sm text-muted-foreground">
                        経過時間
                      </div>
                      <div className="text-3xl font-bold text-blue-700">
                        {formatDuration(getCurrentDuration())}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(workStartTime, "HH:mm")}から作業中
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickDuration(15)}
                        >
                          +15分
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickDuration(30)}
                        >
                          +30分
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickDuration(60)}
                        >
                          +1時間
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between space-x-4 pt-2">
                  {!isWorking ? (
                    <Button
                      onClick={handleStartWork}
                      disabled={isSubmitting || !projectName}
                      className="w-full"
                    >
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

            {/* 手動入力モード */}
            <TabsContent value="manual" className="pt-4">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manualProjectName">プロジェクト名</Label>
                  <Input
                    id="manualProjectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                  />
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manualStartTime">開始時間</Label>
                    <Input
                      id="manualStartTime"
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manualEndTime">終了時間</Label>
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
                    onClick={handleManualToPreset}
                    className="gap-1"
                  >
                    <PlusIcon className="h-4 w-4" />
                    プリセット化
                  </Button>

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                        送信中...
                      </>
                    ) : (
                      "記録を保存"
                    )}
                  </Button>
                </div>
              </form>
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
                          format(selectedDate, "yyyy年MM月dd日", { locale: ja })
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
                      <span>{showPresets ? "簡易表示" : "詳細表示"}</span>
                    </Button>
                  </div>

                  {isLoadingPresets ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">
                        プリセットを読み込み中...
                      </p>
                    </div>
                  ) : presets.length === 0 ? (
                    <div className="text-center py-8 border rounded-lg bg-muted/20">
                      <p className="text-muted-foreground">
                        プリセットがまだありません
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        「新しいプリセットを作成」ボタンから作成できます
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {presets.map((preset) => {
                        const project = projects.find(
                          (p) => p.id === preset.projectId
                        );

                        return showPresets ? (
                          <Card key={preset.id} className="p-3">
                            <div className="flex justify-between">
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {project && (
                                    <div
                                      className={`w-2 h-2 rounded-full ${project.color}`}
                                    ></div>
                                  )}
                                  {preset.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {preset.description}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {preset.duration}分
                                </Badge>
                                <Button
                                  size="sm"
                                  onClick={() => handlePresetSubmit(preset)}
                                >
                                  適用
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ) : (
                          <button
                            key={preset.id}
                            onClick={() => handlePresetSubmit(preset)}
                            className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {project && (
                                <div
                                  className={`w-2 h-2 rounded-full ${project.color}`}
                                ></div>
                              )}
                              <span>{preset.name}</span>
                            </div>
                            <Badge variant="outline">{preset.duration}分</Badge>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Dialog
                    open={showNewPresetDialog}
                    onOpenChange={setShowNewPresetDialog}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full gap-1">
                        <PlusIcon className="h-4 w-4" />
                        新しいプリセットを作成
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>新しいプリセットを作成</DialogTitle>
                        <DialogDescription>
                          繰り返し使う作業パターンをプリセットとして保存できます。
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="presetName">プリセット名</Label>
                          <Input
                            id="presetName"
                            placeholder="例: デイリーミーティング"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="presetDescription">説明</Label>
                          <Textarea
                            id="presetDescription"
                            placeholder="作業内容の説明"
                            value={newPresetDescription}
                            onChange={(e) =>
                              setNewPresetDescription(e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="presetProject">プロジェクト</Label>
                          <Select
                            value={newPresetProjectId}
                            onValueChange={(value) =>
                              setNewPresetProjectId(value)
                            }
                          >
                            <SelectTrigger id="presetProject">
                              <SelectValue placeholder="プロジェクトを選択" />
                            </SelectTrigger>
                            <SelectContent>
                              {projects.map((project) => (
                                <SelectItem
                                  key={project.id}
                                  value={project.id || ""}
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-2 h-2 rounded-full ${project.color}`}
                                    ></div>
                                    <span>{project.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="presetDuration">所要時間（分）</Label>
                          <Input
                            id="presetDuration"
                            type="number"
                            value={newPresetDuration}
                            min="1"
                            onChange={(e) =>
                              setNewPresetDuration(
                                parseInt(e.target.value) || 30
                              )
                            }
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button onClick={handleCreatePreset}>
                          プリセットを保存
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        {error && (
          <CardFooter>
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardFooter>
        )}

        {/* プレミアム機能の案内（サブスクリプションサービス用） */}
        <CardFooter className="flex flex-col space-y-4">
          <div className="w-full bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
            <div className="flex items-start space-x-4">
              <div className="bg-amber-200 rounded-full p-2">
                <InfoCircledIcon className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-amber-800">
                  プレミアム機能を使って生産性をさらに向上
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  作業時間のAI分析、カレンダー連携、自動ポモドーロタイマーなどのプレミアム機能で時間管理を最適化しましょう。
                </p>
                <div className="mt-2 flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-amber-800 hover:bg-amber-200"
                    onClick={() => navigate("/premium-features")}
                  >
                    詳細を見る
                  </Button>
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => navigate("/subscribe")}
                  >
                    プレミアムを試す
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* 生産性ヒント */}
      <Card className="max-w-4xl mx-auto mt-6 bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">生産性向上のヒント</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex space-x-2">
              <div className="text-green-600">
                <ClockIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">ポモドーロテクニック</p>
                <p className="text-muted-foreground">
                  25分の集中作業と5分の休憩を繰り返す
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <div className="text-blue-600">
                <DesktopIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">タスク整理</p>
                <p className="text-muted-foreground">
                  重要なタスクから優先的に取り組む
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <div className="text-purple-600">
                <ReloadIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">定期的な休憩</p>
                <p className="text-muted-foreground">
                  集中力維持のため90分ごとに休憩を
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
