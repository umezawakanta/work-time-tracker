// GoalForm.tsx
// FinancialGoalの設定と編集を行うフォームコンポーネント

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Target } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

// 目標のタイプ定義
interface Goal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  targetDate: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface GoalFormProps {
  initialData?: Goal;
  onSubmit: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

interface GoalFormData {
  title: string;
  description: string;
  status: Goal['status'];
  priority: Goal['priority'];
  progress: number;
  targetDate: string;
  category: string;
}

export const GoalForm: React.FC<GoalFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState<GoalFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'active',
    priority: initialData?.priority || 'medium',
    progress: initialData?.progress || 0,
    targetDate: initialData?.targetDate || '',
    category: initialData?.category || '',
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // フォームバリデーション
  const isValid = formData.title.trim() && formData.targetDate && formData.category.trim();

  const handleInputChange = (field: keyof GoalFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      toast.error('必須項目を入力してください');
      return;
    }

    setIsSubmitting(true);
    try {
      onSubmit(formData);
      toast.success(isEditing ? '目標を更新しました' : '目標を追加しました');
    } catch (error) {
      toast.error('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      status: 'active',
      priority: 'medium',
      progress: 0,
      targetDate: '',
      category: '',
    });
  };

  const categories = [
    'personal',
    'work',
    'health',
    'financial',
    'education',
    'hobby',
    'travel',
    'family',
    'social',
    'other',
  ];

  const statusOptions = [
    { value: 'active', label: '進行中' },
    { value: 'paused', label: '一時停止' },
    { value: 'completed', label: '完了' },
  ];

  const priorityOptions = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* タイトル */}
      <div className="space-y-2">
        <Label htmlFor="title">目標タイトル *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="目標のタイトルを入力"
          required
        />
      </div>

      {/* 説明 */}
      <div className="space-y-2">
        <Label htmlFor="description">説明</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="目標の詳細説明（任意）"
          rows={3}
        />
      </div>

      {/* カテゴリとステータス */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">カテゴリ *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleInputChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">ステータス</Label>
          <Select
            value={formData.status}
            onValueChange={(value: Goal['status']) => handleInputChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 優先度と目標日 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">優先度</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: Goal['priority']) => handleInputChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetDate">目標日 *</Label>
          <Input
            id="targetDate"
            type="date"
            value={formData.targetDate}
            onChange={(e) => handleInputChange('targetDate', e.target.value)}
            required
          />
        </div>
      </div>

      {/* 進捗 */}
      {isEditing && (
        <div className="space-y-2">
          <Label htmlFor="progress">進捗 ({formData.progress}%)</Label>
          <Input
            id="progress"
            type="range"
            min="0"
            max="100"
            value={formData.progress}
            onChange={(e) => handleInputChange('progress', parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {/* フォームアクション */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={!isValid || isSubmitting} className="flex-1">
          {isSubmitting ? '保存中...' : isEditing ? '更新' : '追加'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        {!isEditing && (
          <Button type="button" variant="outline" onClick={handleReset}>
            リセット
          </Button>
        )}
      </div>
    </form>
  );
};
