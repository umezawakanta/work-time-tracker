"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DiaryEntry {
  id: string;
  date: string;
  achievement: string;
  mood: string;
}

interface Goal {
  id: string;
  description: string;
  completed: boolean;
}

const DiaryPage: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [newAchievement, setNewAchievement] = useState("");
  const [newMood, setNewMood] = useState("");
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");

  useEffect(() => {
    const storedEntries = localStorage.getItem("diaryEntries");
    const storedGoals = localStorage.getItem("diaryGoals");
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    }
  }, []);

  const saveEntries = (newEntries: DiaryEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem("diaryEntries", JSON.stringify(newEntries));
  };

  const saveGoals = (newGoals: Goal[]) => {
    setGoals(newGoals);
    localStorage.setItem("diaryGoals", JSON.stringify(newGoals));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = format(new Date(), "yyyy-MM-dd");
    if (editingEntry) {
      const updatedEntries = entries.map((entry) =>
        entry.id === editingEntry.id
          ? { ...entry, achievement: newAchievement, mood: newMood }
          : entry
      );
      saveEntries(updatedEntries);
      setEditingEntry(null);
      toast({
        title: "エントリーを更新しました",
        description: "日記のエントリーが正常に更新されました。",
      });
    } else {
      const newEntry: DiaryEntry = {
        id: Date.now().toString(),
        date: today,
        achievement: newAchievement,
        mood: newMood,
      };
      const updatedEntries = [
        newEntry,
        ...entries.filter((entry) => entry.date !== today),
      ];
      saveEntries(updatedEntries);
      toast({
        title: "新しいエントリーを追加しました",
        description: "新しい日記のエントリーが正常に追加されました。",
      });
    }
    setNewAchievement("");
    setNewMood("");
  };

  const handleEdit = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setNewAchievement(entry.achievement);
    setNewMood(entry.mood);
  };

  const handleDelete = (id: string) => {
    const updatedEntries = entries.filter((entry) => entry.id !== id);
    saveEntries(updatedEntries);
    toast({
      title: "エントリーを削除しました",
      description: "日記のエントリーが正常に削除されました。",
      variant: "destructive",
    });
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.trim()) {
      const newGoalItem: Goal = {
        id: Date.now().toString(),
        description: newGoal,
        completed: false,
      };
      saveGoals([...goals, newGoalItem]);
      setNewGoal("");
      toast({
        title: "新しい目標を追加しました",
        description: "目標が正常に追加されました。",
      });
    }
  };

  const handleToggleGoal = (id: string) => {
    const updatedGoals = goals.map((goal) =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    );
    saveGoals(updatedGoals);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ADHD改善日記</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEntry ? "エントリーを編集" : "今日の達成"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                className="min-h-[240px]"
                placeholder="今日達成できたことを1つ書いてください"
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                required
              />
              <Select value={newMood} onValueChange={setNewMood}>
                <SelectTrigger>
                  <SelectValue placeholder="今日の気分は？" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="great">とても良い</SelectItem>
                  <SelectItem value="good">良い</SelectItem>
                  <SelectItem value="neutral">普通</SelectItem>
                  <SelectItem value="bad">悪い</SelectItem>
                  <SelectItem value="terrible">とても悪い</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit">
                {editingEntry ? "更新" : "記録する"}
              </Button>
              {editingEntry && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingEntry(null)}
                >
                  キャンセル
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>目標設定</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="新しい目標を入力"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                />
                <Button type="submit">追加</Button>
              </div>
            </form>
            <ScrollArea className="h-[200px] mt-4">
              {goals.map((goal) => (
                <div key={goal.id} className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    id={`goal-${goal.id}`}
                    checked={goal.completed}
                    onChange={() => handleToggleGoal(goal.id)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                    title={`目標を完了としてマーク: ${goal.description}`}
                    aria-label={`目標を完了としてマーク: ${goal.description}`}
                  />
                  <Label
                    htmlFor={`goal-${goal.id}`}
                    className={goal.completed ? "line-through" : ""}
                  >
                    {goal.description}
                  </Label>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>過去の記録</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {entries.map((entry) => (
                <Card key={entry.id} className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {format(new Date(entry.date), "yyyy年MM月dd日（E）", {
                        locale: ja,
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{entry.achievement}</p>
                    <p className="mt-2">
                      気分: {entry.mood ? entry.mood : "記録なし"}
                    </p>
                  </CardContent>
                  <CardFooter className="justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(entry)}
                    >
                      編集
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                    >
                      削除
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiaryPage;

