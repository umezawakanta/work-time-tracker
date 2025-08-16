import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Flag, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { addTodoItem, updateTodoItem } from '@/store/todoSlice';
import { AppDispatch } from '@/store';
import { Todo } from '@/types/todo';

interface TaskFormProps {
  task?: Todo;
  onClose: () => void;
  onSubmit?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onClose, onSubmit }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState({
    title: task?.task || '',
    description: task?.note || '',
    priority: task?.priority || 3,
    category: 'general',
    deadline: task?.deadline ? new Date(task.deadline) : undefined,
    estimatedTime: '',
    tags: task?.tags?.join(', ') || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const priorityOptions = [
    { value: 1, label: '最高', color: 'text-red-600' },
    { value: 2, label: '高', color: 'text-orange-600' },
    { value: 3, label: '中', color: 'text-yellow-600' },
    { value: 4, label: '低', color: 'text-green-600' },
    { value: 5, label: '最低', color: 'text-gray-600' },
  ];

  const categoryOptions = [
    { value: 'work', label: '仕事', icon: '💼' },
    { value: 'personal', label: '個人', icon: '👤' },
    { value: 'health', label: '健康', icon: '🏃' },
    { value: 'learning', label: '学習', icon: '📚' },
    { value: 'finance', label: '金融', icon: '💰' },
    { value: 'general', label: '一般', icon: '📝' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    setIsSubmitting(true);

    try {
      const taskData = {
        task: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        deadline: formData.deadline?.toISOString(),
        estimatedTime: formData.estimatedTime,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        type: 'input' as const,
        isPrioritized: formData.priority <= 2,
      };

      if (task) {
        await dispatch(
          updateTodoItem({
            _id: task._id,
            updates: taskData,
          })
        ).unwrap();
      } else {
        await dispatch(addTodoItem(taskData)).unwrap();
      }

      onSubmit?.();
      onClose();
    } catch (error) {
      console.error('Task save error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          {task ? 'タスクを編集' : '新しいタスクを作成'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* タイトル */}
          <div className="space-y-2">
            <Label htmlFor="title">タスクタイトル *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="何をする必要がありますか？"
              required
            />
          </div>

          {/* 説明 */}
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="タスクの詳細を入力してください..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 優先度 */}
            <div className="space-y-2">
              <Label>優先度</Label>
              <Select
                value={formData.priority.toString()}
                onValueChange={(value) => setFormData({ ...formData, priority: parseInt(value) })}
              >
                <SelectTrigger>
                  <Flag className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      <span className={option.color}>{option.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* カテゴリ */}
            <div className="space-y-2">
              <Label>カテゴリ</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 期限 */}
            <div className="space-y-2">
              <Label>期限</Label>
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.deadline ? (
                      format(formData.deadline, 'PPP', { locale: ja })
                    ) : (
                      <span>期限を選択</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.deadline}
                    onSelect={(date) => {
                      setFormData({ ...formData, deadline: date });
                      setShowCalendar(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 予想時間 */}
            <div className="space-y-2">
              <Label htmlFor="estimatedTime">予想時間</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                  placeholder="例: 2時間, 30分"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* タグ */}
          <div className="space-y-2">
            <Label htmlFor="tags">タグ</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="タグをカンマ区切りで入力 (例: 重要, 急ぎ, プロジェクトA)"
            />
          </div>

          {/* アクションボタン */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : task ? '更新' : '作成'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TaskForm;
