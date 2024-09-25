import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addWorkTimeEntry } from "@/store/workTimeSlice";
import { workTimeApi } from "@/services/api";
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

const WorkTimeEntryForm: React.FC = () => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName || !startTime || !endTime) {
      toast({
        title: "入力エラー",
        description: "すべての必須フィールドを入力してください。",
        variant: "destructive",
      });
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast({
        title: "日付エラー",
        description: "有効な開始時間と終了時間を入力してください。",
        variant: "destructive",
      });
      return;
    }

    if (end <= start) {
      toast({
        title: "時間エラー",
        description: "終了時間は開始時間より後でなければなりません。",
        variant: "destructive",
      });
      return;
    }

    const duration = Math.floor((end.getTime() - start.getTime()) / 1000); // 秒単位の期間（小数点以下切り捨て）

    const newEntry: Omit<WorkTimeEntry, "_id"> = {
      projectName,
      description,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      duration,
      date: start.toISOString().split("T")[0], // YYYY-MM-DD形式
    };

    try {
      const response = await workTimeApi.create(newEntry);
      dispatch(addWorkTimeEntry(response.data));
      toast({
        title: "成功",
        description: "作業時間エントリーが作成されました。",
      });
      navigate("/reports");
    } catch (error) {
      console.error("作業時間エントリーの作成エラー:", error);
      toast({
        title: "エラー",
        description:
          "作業時間エントリーの作成に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
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
            <Button type="submit" className="w-full">
              記録を保存
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default WorkTimeEntryForm;
