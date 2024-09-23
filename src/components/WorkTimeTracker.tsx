import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WorkTimeTracker: React.FC = () => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const startTimer = () => {
    if (!isRunning) {
      const id = window.setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
      setIntervalId(id);
      setIsRunning(true);
    }
  };

  const stopTimer = () => {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      setIntervalId(null);
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTime(0);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          作業時間トラッカー
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-center mb-4">
          {formatTime(time)}
        </div>
        <div className="flex justify-center space-x-2">
          <Button onClick={startTimer} disabled={isRunning}>
            開始
          </Button>
          <Button onClick={stopTimer} disabled={!isRunning}>
            停止
          </Button>
          <Button onClick={resetTimer}>リセット</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkTimeTracker;
