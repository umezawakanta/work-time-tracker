// src/components/quadrant/TaskInputForm.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ClockIcon, TagIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { UnifiedTaskData } from '@/services/ai/QuadrantClassificationService';

interface TaskInputFormProps {
  onTaskAdd: (task: UnifiedTaskData) => void;
  onTasksImport?: (tasks: UnifiedTaskData[]) => void;
  className?: string;
}

interface TaskFormData {
  title: string;
  description: string;
  deadline: string;
  estimatedTime: number;
  category: string;
  priority: number;
  tags: string[];
}

const initialFormData: TaskFormData = {
  title: '',
  description: '',
  deadline: '',
  estimatedTime: 30,
  category: '仕事',
  priority: 5,
  tags: [],
};

const predefinedCategories = [
  '仕事',
  '個人',
  '学習',
  'プロジェクト',
  '健康',
  '家族',
  '趣味',
  'その他',
];

const TaskInputForm: React.FC<TaskInputFormProps> = ({
  onTaskAdd,
  onTasksImport,
  className = '',
}) => {
  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange =
    (field: keyof TaskFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value =
        field === 'estimatedTime' || field === 'priority'
          ? parseInt(e.target.value) || 0
          : e.target.value;

      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('タスクタイトルを入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const newTask: UnifiedTaskData = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title.trim(),
        description: formData.description.trim(),
        deadline: formData.deadline ? new Date(formData.deadline) : undefined,
        estimatedTime: formData.estimatedTime,
        category: formData.category,
        priority: formData.priority,
        tags: formData.tags,
        status: 'pending',
        type: 'user-created',
      };

      onTaskAdd(newTask);
      setFormData(initialFormData);
    } catch (error) {
      console.error('タスク追加エラー:', error);
      alert('タスクの追加に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const importSampleTasks = () => {
    const sampleTasks: UnifiedTaskData[] = [
      {
        id: 'sample-1',
        title: '月次売上レポートの作成',
        description: '先月の売上データを集計し、経営陣向けのレポートを作成する',
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2日後
        estimatedTime: 120,
        category: '仕事',
        priority: 8,
        tags: ['レポート', '緊急'],
      },
      {
        id: 'sample-2',
        title: 'プログラミングスキルの向上',
        description: 'React とTypeScript の新機能について学習する',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2週間後
        estimatedTime: 180,
        category: '学習',
        priority: 6,
        tags: ['自己啓発', 'プログラミング'],
      },
      {
        id: 'sample-3',
        title: 'SNSの更新',
        description: '個人のSNSアカウントの投稿を更新する',
        deadline: undefined,
        estimatedTime: 15,
        category: '個人',
        priority: 2,
        tags: ['SNS', '日常'],
      },
      {
        id: 'sample-4',
        title: '健康診断の予約',
        description: '年次健康診断の予約を取る',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1週間後
        estimatedTime: 30,
        category: '健康',
        priority: 7,
        tags: ['健康', '予約'],
      },
    ];

    if (onTasksImport) {
      onTasksImport(sampleTasks);
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          新しいタスクを追加
        </CardTitle>
        <CardDescription>タスクの詳細を入力すると、AI が自動的に4象限に分類します</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* タスクタイトル */}
          <div className="space-y-2">
            <Label htmlFor="title">タスクタイトル *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleInputChange('title')}
              placeholder="例: 月次売上レポートの作成"
              required
            />
          </div>

          {/* 説明 */}
          <div className="space-y-2">
            <Label htmlFor="description">詳細説明</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleInputChange('description')}
              placeholder="タスクの詳細や背景を入力してください"
              rows={3}
            />
          </div>

          {/* 期限とカテゴリ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline" className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                期限
              </Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={handleInputChange('deadline')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                <TagIcon className="w-4 h-4" />
                カテゴリ
              </Label>
              <select
                id="category"
                value={formData.category}
                onChange={handleInputChange('category')}
                className="w-full px-3 py-2 border rounded-md"
                aria-label="タスクのカテゴリを選択"
              >
                {predefinedCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 推定時間と優先度 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedTime" className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                推定時間（分）
              </Label>
              <Input
                id="estimatedTime"
                type="number"
                min="5"
                max="480"
                value={formData.estimatedTime}
                onChange={handleInputChange('estimatedTime')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">優先度（1-10）</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={handleInputChange('priority')}
              />
            </div>
          </div>

          {/* タグ */}
          <div className="space-y-2">
            <Label>タグ</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="タグを入力"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                追加
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                      aria-label={`${tag}タグを削除`}
                      title={`${tag}タグを削除`}
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ボタン */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'AI分析中...' : 'タスクを追加して分析'}
            </Button>
            {onTasksImport && (
              <Button type="button" variant="outline" onClick={importSampleTasks}>
                サンプルタスク
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TaskInputForm;
