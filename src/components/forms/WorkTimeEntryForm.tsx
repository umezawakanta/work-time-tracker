import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useProjects } from '@/hooks/useProjects';
import { useWorkPresets } from '@/hooks/useWorkPresets';
import { useToast } from '@/components/ui/use-toast';

// 型定義
interface WorkTimeEntryFormProps {
  initialData?: Partial<WorkTimeEntry>;
  onSubmit: (data: WorkTimeEntry) => Promise<void>;
}

interface WorkTimeEntry {
  id?: string;
  projectId: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  duration: number;
}

// 日付をフォーマットするユーティリティ関数
const formatDate = (date: Date) => {
  return `${date.getFullYear()}/${
    String(date.getMonth() + 1).padStart(2, '0')
  }/${
    String(date.getDate()).padStart(2, '0')
  } ${
    String(date.getHours()).padStart(2, '0')
  }:${
    String(date.getMinutes()).padStart(2, '0')
  }`;
};

const WorkTimeEntryForm: React.FC<WorkTimeEntryFormProps> = ({ 
  initialData, 
  onSubmit 
}) => {
  // ローディング状態は将来的にUI表示に使用可能
  const { projects = [] } = useProjects();
  const { presets = [] } = useWorkPresets();
  const { toast } = useToast();

  // プロジェクトとプリセットの安全なソート
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => 
      (b.lastUsed ? new Date(b.lastUsed).getTime() : 0) - 
      (a.lastUsed ? new Date(a.lastUsed).getTime() : 0)
    );
  }, [projects]);

  const sortedPresets = useMemo(() => {
    return [...presets].sort((a, b) => 
      (b.usageCount || 0) - (a.usageCount || 0)
    );
  }, [presets]);

  // フォームの初期値を設定
  const defaultValues = {
    projectId: initialData?.projectId || '',
    startTime: initialData?.startTime || new Date(),
    endTime: initialData?.endTime || new Date(),
    description: initialData?.description || '',
    duration: initialData?.duration || 0
  };

  const { 
    control, 
    handleSubmit, 
    setValue, 
    watch,
    formState: { errors } 
  } = useForm<WorkTimeEntry>({
    defaultValues
  });

  // フォーム送信ハンドラー
  const onFormSubmit = async (data: WorkTimeEntry) => {
    try {
      await onSubmit(data);
      toast({
        title: '作業時間を記録しました',
        description: `${data.duration}分の作業を記録しました`
      });
    } catch (error: unknown) {
      // エラーのログ出力と詳細なエラーメッセージ
      console.error('作業時間記録エラー:', error);
      toast({
        title: 'エラー',
        description: error instanceof Error 
          ? error.message 
          : '作業時間の記録に失敗しました',
        variant: 'destructive'
      });
    }
  };

  // プリセット選択ハンドラー
  const handlePresetSelect = (presetId: string) => {
    const selectedPreset = presets.find(preset => preset.id === presetId);
    if (selectedPreset) {
      setValue('projectId', selectedPreset.projectId);
      setValue('duration', selectedPreset.duration);
    }
  };

  // 開始時間と終了時間から所要時間を計算
  const calculateDuration = () => {
    const startTime = watch('startTime');
    const endTime = watch('endTime');
    
    if (startTime && endTime) {
      const diffMs = endTime.getTime() - startTime.getTime();
      const diffMinutes = Math.round(diffMs / (1000 * 60));
      setValue('duration', diffMinutes);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>作業時間の記録</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* プリセット選択 */}
          <div className="space-y-2">
            <Label>プリセット</Label>
            <Select 
              onValueChange={handlePresetSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="プリセットを選択" />
              </SelectTrigger>
              <SelectContent>
                {sortedPresets.map(preset => (
                  <SelectItem key={preset.id} value={preset.id || ''}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* プロジェクト選択 */}
          <div className="space-y-2">
            <Label>プロジェクト</Label>
            <Controller
              name="projectId"
              control={control}
              rules={{ required: 'プロジェクトを選択してください' }}
              render={({ field }) => (
                <Select 
                  {...field}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="プロジェクトを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedProjects.map(project => (
                      <SelectItem key={project.id} value={project.id || ''}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.projectId && (
              <p className="text-red-500 text-sm">{errors.projectId.message}</p>
            )}
          </div>

          {/* 開始時間 */}
          <div className="space-y-2">
            <Label>開始時間</Label>
            <Controller
              name="startTime"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        formatDate(field.value)
                      ) : (
                        <span>開始時間を選択</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        calculateDuration();
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          {/* 終了時間 */}
          <div className="space-y-2">
            <Label>終了時間</Label>
            <Controller
              name="endTime"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        formatDate(field.value)
                      ) : (
                        <span>終了時間を選択</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        calculateDuration();
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          {/* 所要時間 */}
          <div className="space-y-2">
            <Label>所要時間（分）</Label>
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    field.onChange(isNaN(value) ? '' : value);
                  }}
                />
              )}
            />
          </div>

          {/* 説明 */}
          <div className="space-y-2">
            <Label>説明（オプション）</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea 
                  placeholder="作業内容の詳細を入力" 
                  {...field} 
                />
              )}
            />
          </div>

          <Button type="submit" className="w-full">
            作業時間を記録
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WorkTimeEntryForm;