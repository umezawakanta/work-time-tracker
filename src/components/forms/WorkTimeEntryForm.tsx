import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addWorkTimeEntry } from "../../store/workTimeSlice";
import { workTimeApi } from "../../services/api";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { WorkTimeEntry } from "@/types/workTimeEntry";
import { AppDispatch } from "@/store"; // AppDispatchをインポート

export default function WorkTimeEntryForm() {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>(); // AppDispatchを使用
  const { toast } = useToast();

  useEffect(() => {
    let interval: number | undefined;
    if (isTracking && !isPaused) {
      interval = window.setInterval(() => {
        setTotalTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (interval !== undefined) {
        window.clearInterval(interval);
      }
    };
  }, [isTracking, isPaused]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    setStartTime(new Date());
    setIsTracking(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleReset = () => {
    setIsTracking(false);
    setIsPaused(false);
    setTotalTime(0);
    setStartTime(null);
    setEndTime(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime) {
      toast({
        title: "エラー",
        description: "開始時間が設定されていません。",
        variant: "destructive",
      });
      return;
    }
    const newEndTime = endTime || new Date();
    const newEntry: WorkTimeEntry = {
      projectName,
      description,
      startTime,
      endTime: newEndTime,
      duration: totalTime,
      date: new Date().toISOString(),
    };
    try {
      const response = await workTimeApi.create({
        ...newEntry,
        startTime: new Date(newEntry.startTime),
        endTime: new Date(newEntry.endTime),
      });
      await dispatch(addWorkTimeEntry(response.data));
      toast({
        title: "作業時間を記録しました",
        description: "作業時間が正常に記録されました。",
      });
      navigate("/reports");
    } catch (error) {
      console.error("Error creating work time entry:", error);
      toast({
        title: "エラー",
        description:
          "作業時間の記録中にエラーが発生しました。もう一度お試しください。",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        作業時間トラッカー
      </h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">タイムトラッカー</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold mb-4 text-center">
            {formatTime(totalTime)}
          </p>
          <div className="flex justify-center space-x-4">
            {!isTracking ? (
              <Button
                onClick={handleStart}
                className="bg-green-500 hover:bg-green-600"
              >
                開始
              </Button>
            ) : isPaused ? (
              <Button
                onClick={handleResume}
                className="bg-blue-500 hover:bg-blue-600"
              >
                再開
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                一時停止
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-gray-300"
            >
              リセット
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">作業時間の記録</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName" className="text-sm font-medium">
                プロジェクト名
              </Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                作業内容
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground"
              disabled={!isTracking && totalTime === 0}
            >
              記録を保存
            </Button>
          </CardFooter>
        </form>
      </Card>
      <Separator className="my-8" />
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">使い方</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>「開始」ボタンをクリックして作業を開始します。</li>
            <li>作業中に休憩が必要な場合は「一時停止」をクリックします。</li>
            <li>休憩後、「再開」をクリックして作業を再開します。</li>
            <li>
              作業が完了したら「リセット」をクリックして記録をリセットします。
            </li>
            <li>
              プロジェクト名と作業内容を入力し、「記録を保存」をクリックして作業時間を記録します。
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
