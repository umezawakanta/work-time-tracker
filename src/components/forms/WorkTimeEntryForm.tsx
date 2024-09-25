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
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast({
        title: "Invalid date",
        description: "Please enter valid start and end times.",
        variant: "destructive",
      });
      return;
    }

    const duration = (end.getTime() - start.getTime()) / 1000; // duration in seconds

    if (duration < 0) {
      toast({
        title: "Invalid time range",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    const newEntry: Omit<WorkTimeEntry, "_id"> = {
      projectName,
      description,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      duration,
      date: start.toISOString().split("T")[0], // YYYY-MM-DD format
    };

    try {
      const response = await workTimeApi.create(newEntry);
      dispatch(addWorkTimeEntry(response.data));
      toast({
        title: "Success",
        description: "Work time entry has been created.",
      });
      navigate("/reports");
    } catch (error) {
      console.error("Error creating work time entry:", error);
      toast({
        title: "Error",
        description: "Failed to create work time entry. Please try again.",
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
