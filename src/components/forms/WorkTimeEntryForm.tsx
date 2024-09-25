import React, { useState } from "react";
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

export default function WorkTimeEntryForm() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
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

    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

    const newEntry: Omit<WorkTimeEntry, "_id"> = {
      projectName,
      description,
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
      navigate("/reports");
    } catch (error) {
      console.error("作業時間エントリーの作成エラー:", error);
      setError(`作業時間エントリーの作成に失敗しました: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">作業時間の記録</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>エラー</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">開始時間</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">終了時間</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "送信中..." : "記録を保存"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
