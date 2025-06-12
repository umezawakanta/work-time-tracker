import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Task, SubTask } from '@/types/task';
import {
  CalendarIcon,
  Clock,
  Plus,
  X,
  Tag,
  User,
  Target,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const taskSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  description: z.string().optional(),
  status: z.enum(['todo', 'inProgress', 'completed']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.date().optional(),
  estimatedTime: z.number().min(0).optional(),
  progress: z.number().min(0).max(100),
  tags: z.array(z.string()),
  assignee: z.string().optional(),
  category: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskEditorProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => Promise<void>;
}

export const TaskEditor: React.FC<TaskEditorProps> = ({ task, isOpen, onClose, onSave }) => {
  const [subtasks, setSubtasks] = useState<SubTask[]>(task?.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');
  const [newTag, setNewTag] = useState('');
  const [dependencies, setDependencies] = useState<string[]>(task?.dependencies || []);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'todo',
      priority: task?.priority || 'medium',
      dueDate: task?.dueDate ? new Date(task.dueDate) : undefined,
      estimatedTime: task?.estimatedTime || 0,
      progress: task?.progress || 0,
      tags: task?.tags || [],
      assignee: task?.assignee || '',
      category: task?.category || '',
    },
  });

  const watchedTags = watch('tags');
  const watchedProgress = watch('progress');

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        estimatedTime: task.estimatedTime,
        progress: task.progress,
        tags: task.tags,
        assignee: task.assignee,
        category: task.category,
      });
      setSubtasks(task.subtasks);
      setDependencies(task.dependencies);
    }
  }, [task, reset]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      await onSave({
        ...data,
        subtasks,
        dependencies,
        updatedAt: new Date(),
      });
      onClose();
    } catch (error) {
      console.error('Task save error:', error);
    }
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      const subtask: SubTask = {
        id: Math.random().toString(36).substr(2, 9),
        title: newSubtask.trim(),
        completed: false,
        createdAt: new Date(),
      };
      setSubtasks([...subtasks, subtask]);
      setNewSubtask('');
    }
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st)));
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const addTag = () => {
    if (newTag.trim() && !watchedTags.includes(newTag.trim())) {
      setValue('tags', [...watchedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      'tags',
      watchedTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  const statusIcons = {
    todo: <Target className="h-4 w-4" />,
    inProgress: <Clock className="h-4 w-4" />,
    completed: <CheckSquare className="h-4 w-4" />,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {task ? 'タスクを編集' : '新しいタスクを作成'}
            {task && <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 左側 - 基本情報 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">タイトル *</Label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="title"
                      placeholder="タスクのタイトルを入力..."
                      className={errors.title ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">説明</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="description"
                      placeholder="タスクの詳細を入力..."
                      rows={3}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ステータス</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="ステータスを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">
                            <div className="flex items-center gap-2">
                              {statusIcons.todo}
                              未着手
                            </div>
                          </SelectItem>
                          <SelectItem value="inProgress">
                            <div className="flex items-center gap-2">
                              {statusIcons.inProgress}
                              進行中
                            </div>
                          </SelectItem>
                          <SelectItem value="completed">
                            <div className="flex items-center gap-2">
                              {statusIcons.completed}
                              完了
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div>
                  <Label>優先度</Label>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="優先度を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">低</SelectItem>
                          <SelectItem value="medium">中</SelectItem>
                          <SelectItem value="high">高</SelectItem>
                          <SelectItem value="urgent">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              緊急
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div>
                <Label>期限</Label>
                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, 'PPP', { locale: ja })
                            : '期限を選択...'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={ja}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>

              <div>
                <Label>進捗: {watchedProgress}%</Label>
                <Controller
                  name="progress"
                  control={control}
                  render={({ field }) => (
                    <Slider
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                  )}
                />
              </div>
            </div>

            {/* 右側 - 追加情報 */}
            <div className="space-y-4">
              <div>
                <Label>タグ</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="新しいタグ..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {watchedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button
                        type="button"
                        title="タグを削除"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="assignee">担当者</Label>
                <Controller
                  name="assignee"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <Input {...field} id="assignee" placeholder="担当者名..." />
                    </div>
                  )}
                />
              </div>

              <div>
                <Label htmlFor="estimatedTime">予想作業時間（分）</Label>
                <Controller
                  name="estimatedTime"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <Input
                        {...field}
                        id="estimatedTime"
                        type="number"
                        min="0"
                        placeholder="60"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </div>
                  )}
                />
              </div>

              <div>
                <Label htmlFor="category">カテゴリー</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id="category" placeholder="プロジェクト、業務..." />
                  )}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* サブタスク */}
          <div>
            <Label className="text-base font-semibold">サブタスク</Label>
            <div className="mt-2 space-y-2">
              {subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2 p-2 border rounded">
                  <input
                    type="checkbox"
                    title="サブタスク完了"
                    checked={subtask.completed}
                    onChange={() => toggleSubtask(subtask.id)}
                    className="rounded"
                  />
                  <span className={subtask.completed ? 'line-through text-gray-500' : ''}>
                    {subtask.title}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSubtask(subtask.id)}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="新しいサブタスク..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                />
                <Button type="button" variant="outline" onClick={addSubtask}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : task ? '更新' : '作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
