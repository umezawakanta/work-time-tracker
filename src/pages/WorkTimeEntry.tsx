import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function WorkTimeTracker() {
  const [totalTime, setTotalTime] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        作業時間トラッカー
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>作業時間の記録</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              日々の作業時間を簡単に記録できます。プロジェクトごとに作業時間を記録し、効率的に時間管理を行いましょう。
            </p>
            <Button className="w-full">作業時間を記録する</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>レポート機能</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              作業時間の分析と可視化ができます。記録した作業時間をグラフや表で確認し、生産性を向上させましょう。
            </p>
            <Button variant="outline" className="w-full">
              レポートを見る
            </Button>
          </CardContent>
        </Card>
      </div>
      <Separator className="my-8" />
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>最近の統計</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">今週の総作業時間: 32時間</p>
          <p className="mb-4">
            最も作業時間が長いプロジェクト: ウェブサイトリニューアル
          </p>
        </CardContent>
      </Card>
      <Card className="mt-8">
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
      <Card className="mt-8">
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
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
