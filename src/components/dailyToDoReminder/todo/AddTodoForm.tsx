import React, { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Calendar,
  Flag,
  Tag,
  Clock,
  Target,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { addTodoItem } from "@/store/todoSlice";
import { AppDispatch } from "@/store";
import { getErrorMessage } from "../utils/errorUtils";

interface AddTodoFormProps {
  readonly isVisible: boolean;
  readonly onClose: () => void;
  readonly isPremium?: boolean;
}

type TodoType = "input" | "output";
type PriorityLevel = 1 | 2 | 3 | 4 | 5;

interface FormData {
  text: string;
  description: string;
  type: TodoType;
  priority: PriorityLevel;
  deadline: string;
  estimatedDuration: number;
  category: string;
  tags: readonly string[];
  isPrioritized: boolean;
}

const initialFormData: FormData = {
  text: "",
  description: "",
  type: "input",
  priority: 3,
  deadline: "",
  estimatedDuration: 60,
  category: "",
  tags: [],
  isPrioritized: false,
};

const PREDEFINED_CATEGORIES = [
  "仕事", "学習", "健康", "趣味", "家事", "買い物", "会議", "プロジェクト"
] as const;

const PRIORITY_LABELS: Record<PriorityLevel, { label: string; color: string; }> = {
  1: { label: "最低", color: "text-gray-500" },
  2: { label: "低", color: "text-blue-500" },
  3: { label: "普通", color: "text-green-500" },
  4: { label: "高", color: "text-orange-500" },
  5: { label: "最高", color: "text-red-500" },
};

/**
 * Add Todo Form Component
 * Advanced task creation form with premium features
 */
export const AddTodoForm: React.FC<AddTodoFormProps> = ({
  isVisible,
  onClose,
  isPremium = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [tagInput, setTagInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleInputChange = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]): void => {
      setFormData(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleAddTag = useCallback((): void => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      handleInputChange("tags", [...formData.tags, trimmedTag]);
      setTagInput("");
    }
  }, [tagInput, formData.tags, handleInputChange]);

  const handleRemoveTag = useCallback((tagToRemove: string): void => {
    handleInputChange("tags", formData.tags.filter(tag => tag !== tagToRemove));
  }, [formData.tags, handleInputChange]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  }, [handleAddTag]);

  const validateForm = useCallback((): boolean => {
    if (!formData.text.trim()) {
      toast.error("タスク名を入力してください");
      return false;
    }

    if (formData.text.length > 100) {
      toast.error("タスク名は100文字以内で入力してください");
      return false;
    }

    if (formData.deadline && new Date(formData.deadline) < new Date()) {
      toast.error("期限は現在時刻より後に設定してください");
      return false;
    }

    return true;
  }, [formData.text, formData.deadline]);

  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Create the new todo object that matches the expected format for the store
      const newTodo = {
        task: formData.text.trim(),
        priority: formData.priority,
        isPrioritized: formData.isPrioritized,
        type: formData.type,
        deadline: formData.deadline || undefined,
        // Note: category and tags are not supported by the global TodoItem type
        // You may need to adjust the store action to handle these
      };

      await dispatch(addTodoItem(newTodo)).unwrap();
      
      toast.success("タスクを追加しました！");
      setFormData(initialFormData);
      setTagInput("");
      onClose();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(`タスクの追加に失敗しました: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, dispatch, onClose, validateForm]);

  const handleReset = useCallback((): void => {
    setFormData(initialFormData);
    setTagInput("");
  }, []);

  if (!isVisible) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" aria-hidden="true" />
            新しいタスクを追加
            {isPremium && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800">
                <Sparkles className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="閉じる">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="task-name">タスク名 *</Label>
              <Input
                id="task-name"
                placeholder="今日やることを入力してください"
                value={formData.text}
                onChange={(e) => handleInputChange("text", e.target.value)}
                maxLength={100}
                required
                aria-describedby="task-name-hint"
              />
              <p id="task-name-hint" className="text-xs text-gray-500">
                {formData.text.length}/100 文字
              </p>
            </div>

            {isPremium && (
              <div className="grid w-full gap-2">
                <Label htmlFor="task-description">詳細説明</Label>
                <Textarea
                  id="task-description"
                  placeholder="タスクの詳細な説明（オプション）"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  maxLength={500}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Task Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>タスクタイプ</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value as TodoType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="input">
                    📚 インプット（学習・情報収集）
                  </SelectItem>
                  <SelectItem value="output">
                    🚀 アウトプット（作成・実行）
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>優先度</Label>
              <Select
                value={formData.priority.toString()}
                onValueChange={(value) => handleInputChange("priority", parseInt(value) as PriorityLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_LABELS).map(([value, { label, color }]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <Flag className={`h-3 w-3 ${color}`} />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Options (Premium) */}
          {isPremium && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deadline">期限</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="deadline"
                        type="datetime-local"
                        value={formData.deadline}
                        onChange={(e) => handleInputChange("deadline", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">予想作業時間（分）</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="duration"
                        type="number"
                        min="5"
                        max="480"
                        step="5"
                        value={formData.estimatedDuration}
                        onChange={(e) => handleInputChange("estimatedDuration", parseInt(e.target.value) || 60)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">カテゴリ</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリを選択（オプション）" />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>タグ</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="タグを入力してEnter"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-10"
                      />
                    </div>
                    <Button type="button" onClick={handleAddTag} variant="outline">
                      追加
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-500"
                            aria-label={`タグ ${tag} を削除`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="prioritized"
                    checked={formData.isPrioritized}
                    onCheckedChange={(checked) => handleInputChange("isPrioritized", checked)}
                  />
                  <Label htmlFor="prioritized" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    今日の重要タスクとしてマーク
                  </Label>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Form Actions */}
          <div className="flex justify-between gap-3">
            <Button type="button" variant="outline" onClick={handleReset}>
              リセット
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "追加中..." : "タスクを追加"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};