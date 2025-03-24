// DiaryForm.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DiaryEntry, TagOption } from "@/types";
import { LightbulbIcon } from "lucide-react";

interface DiaryFormProps {
  editingEntry: DiaryEntry | null;
  newAchievement: string;
  setNewAchievement: (value: string) => void;
  newMood: string;
  setNewMood: (value: string) => void;
  selectedTags: string[];
  handleTagToggle: (tag: string) => void;
  difficulty: number;
  setDifficulty: (value: number) => void;
  isImportant: boolean;
  setIsImportant: (value: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
  setEditingEntry: (entry: DiaryEntry | null) => void;
  tagOptions: TagOption[];
  moodEmojis: Record<string, string>;
  moodLabels: Record<string, string>;
  showTips?: boolean;
  encouragementMessage?: string;
}

const DiaryForm: React.FC<DiaryFormProps> = ({
  editingEntry,
  newAchievement,
  setNewAchievement,
  newMood,
  setNewMood,
  selectedTags,
  handleTagToggle,
  difficulty,
  setDifficulty,
  isImportant,
  setIsImportant,
  handleSubmit,
  resetForm,
  setEditingEntry,
  tagOptions,
  moodEmojis,
  moodLabels,
  showTips = false,
  encouragementMessage = "",
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingEntry ? "エントリーを編集" : "今日の達成"}
        </CardTitle>
        <CardDescription>
          今日達成できたことを記録して、自己肯定感を高めましょう
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showTips && encouragementMessage && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4 text-sm">
            <div className="flex items-center gap-2 font-medium mb-1 text-amber-700">
              <LightbulbIcon className="h-4 w-4" />
              <span>今日のヒント</span>
            </div>
            <p className="text-gray-700">{encouragementMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="achievement">達成内容</Label>
            <Textarea
              id="achievement"
              className="min-h-[120px]"
              placeholder="今日達成できたことを書いてください。小さなことでも大丈夫です。"
              value={newAchievement}
              onChange={(e) => setNewAchievement(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="mood">今日の気分</Label>
            <Select value={newMood} onValueChange={setNewMood}>
              <SelectTrigger id="mood">
                <SelectValue placeholder="今日の気分は？">
                  {newMood && (
                    <div className="flex items-center">
                      <span className="mr-2">
                        {moodEmojis[newMood]}
                      </span>
                      <span>{moodLabels[newMood]}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="great">
                  <div className="flex items-center">
                    <span className="mr-2">😄</span>
                    <span>とても良い</span>
                  </div>
                </SelectItem>
                <SelectItem value="good">
                  <div className="flex items-center">
                    <span className="mr-2">🙂</span>
                    <span>良い</span>
                  </div>
                </SelectItem>
                <SelectItem value="neutral">
                  <div className="flex items-center">
                    <span className="mr-2">😐</span>
                    <span>普通</span>
                  </div>
                </SelectItem>
                <SelectItem value="bad">
                  <div className="flex items-center">
                    <span className="mr-2">😕</span>
                    <span>悪い</span>
                  </div>
                </SelectItem>
                <SelectItem value="terrible">
                  <div className="flex items-center">
                    <span className="mr-2">😞</span>
                    <span>とても悪い</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">タグ付け</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {tagOptions.map((tag) => (
                <Badge
                  key={tag.value}
                  variant={
                    selectedTags.includes(tag.value)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag.value)}
                >
                  {tag.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="difficulty">難易度</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm">簡単</span>
              <input
                id="difficulty"
                type="range"
                min="1"
                max="5"
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(parseInt(e.target.value))
                }
                className="flex-1"
                aria-label="難易度を選択"
              />
              <span className="text-sm">難しい</span>
              <span className="ml-2 text-sm font-medium">
                {difficulty}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="important-achievement"
              checked={isImportant}
              onCheckedChange={setIsImportant}
            />
            <Label htmlFor="important-achievement">
              これは重要な達成
            </Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit">
              {editingEntry ? "更新" : "記録する"}
            </Button>
            {editingEntry && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingEntry(null);
                  resetForm();
                }}
              >
                キャンセル
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DiaryForm;