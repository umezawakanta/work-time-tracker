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

interface DiaryEntry {
  id: string;
  date: string;
  achievement: string;
}

const DiaryPage: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [newAchievement, setNewAchievement] = useState("");
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

  useEffect(() => {
    const storedEntries = localStorage.getItem("diaryEntries");
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
  }, []);

  const saveEntries = (newEntries: DiaryEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem("diaryEntries", JSON.stringify(newEntries));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = format(new Date(), "yyyy-MM-dd");
    if (editingEntry) {
      const updatedEntries = entries.map((entry) =>
        entry.id === editingEntry.id
          ? { ...entry, achievement: newAchievement }
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
  };

  const handleEdit = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setNewAchievement(entry.achievement);
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
                placeholder="今日達成できたことを1つ書いてください"
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                required
              />
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
                    <p>{entry.achievement}</p>
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
