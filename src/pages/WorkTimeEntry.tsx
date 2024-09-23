import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

export default function WorkTimeEntry() {
  const [totalTime, setTotalTime] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && !isPaused) {
      interval = setInterval(() => {
        setTotalTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, isPaused]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission logic here
    console.log({ projectName, totalTime, description });
    navigate("/reports");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        作業時間トラッカー
      </h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>タイムトラッカー</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold mb-4 text-center">
            {formatTime(totalTime)}
          </p>
          <div className="flex justify-center space-x-4">
            {!isTracking ? (
              <Button onClick={handleStart}>開始</Button>
            ) : isPaused ? (
              <Button onClick={handleResume}>再開</Button>
            ) : (
              <Button onClick={handlePause}>一時停止</Button>
            )}
            <Button variant="outline" onClick={handleReset}>
              リセット
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>作業時間の記録</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">プロジェクト名</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">作業内容</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              記録を保存
            </Button>
          </CardFooter>
        </form>
      </Card>
      <Separator className="my-8" />
      <Card>
        <CardHeader>
          <CardTitle>使い方</CardTitle>
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
