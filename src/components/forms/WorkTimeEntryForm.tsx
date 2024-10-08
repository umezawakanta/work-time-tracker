import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addWorkTimeEntry } from "@/store/workTimeSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { WorkTimeEntry } from "@/types/workTimeEntry";
import { AppDispatch } from "@/store";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WorkTimeEntryForm() {
  const [projectName, setProjectName] = useState("仕事（Mighty-Link）");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [workStartTime, setWorkStartTime] = useState<Date | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  useEffect(() => {
    if (isWorking) {
      const timer = setInterval(() => {
        if (workStartTime) {
          const now = new Date();
          const duration = Math.floor((now.getTime() - workStartTime.getTime()) / 1000);
          setDescription(`作業時間: ${formatDuration(duration)}`);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isWorking, workStartTime]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartWork = () => {
    const now = new Date();
    setWorkStartTime(now);
    setStartTime(now.toISOString().slice(0, 16));
    setIsWorking(true);
  };

  const handleEndWork = async () => {
    if (!workStartTime) return;

    const now = new Date();
    setEndTime(now.toISOString().slice(0, 16));
    setIsWorking(false);

    await submitWorkTimeEntry(workStartTime, now);
  };

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

  const submitWorkTimeEntry = async (start: Date, end: Date) => {
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

    const newEntry: Omit<WorkTimeEntry, "_id"> = {
      projectName,
      description: description || `作業時間: ${formatDuration(duration)}`,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      duration,
      date: start.toISOString().split("T")[0],
    };

    setIsSubmitting(true);

    try {
      await dispatch(addWorkTimeEntry(newEntry)).unwrap();
      toast({
        title: "成功",
        description: "作業時間エントリーが作成されました。",
      });
      navigate("/work-time-reports");
    } catch (error) {
      console.error("作業時間エントリーの作成エラー:", error);
      setError(`作業時間エントリーの作成に失敗しました: ${error}`);
    } finally {
      setIsSubmitting(false);
      setWorkStartTime(null);
      setDescription("");
      setStartTime("");
      setEndTime("");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">作業時間の記録</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="auto" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="auto">自動記録</TabsTrigger>
              <TabsTrigger value="manual">手動入力</TabsTrigger>
            </TabsList>
            <TabsContent value="auto">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="autoProjectName">プロジェクト名</Label>
                  <Input
                    id="autoProjectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="autoDescription">作業内容</Label>
                  <Textarea
                    id="autoDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isWorking}
                  />
                </div>
                <div className="flex justify-between space-x-4">
                  <Button
                    onClick={handleStartWork}
                    disabled={isWorking || isSubmitting}
                    className="w-full"
                  >
                    仕事開始
                  </Button>
                  <Button
                    onClick={handleEndWork}
                    disabled={!isWorking || isSubmitting}
                    className="w-full"
                  >
                    仕事終了
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="manual">
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
                  />
                </div>
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
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "送信中..." : "記録を保存"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          {error && (
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}