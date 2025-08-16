import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { TodoType } from '../hooks/useTodoForm';

interface TaskTypeSelectProps {
  value: TodoType;
  onChange: (value: TodoType) => void;
  onSuggestType?: () => void;
  isSuggestingType?: boolean;
  isPremium?: boolean;
}

export const TaskTypeSelect = React.memo<TaskTypeSelectProps>(
  ({ value, onChange, onSuggestType, isSuggestingType = false, isPremium = false }) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>タスクタイプ</Label>
          {isPremium && onSuggestType && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSuggestType}
              disabled={isSuggestingType}
              className="h-7 text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {isSuggestingType ? '提案中...' : 'AI提案'}
            </Button>
          )}
        </div>
        <Select value={value} onValueChange={(value) => onChange(value as TodoType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">👤 Personal (個人)</SelectItem>
            <SelectItem value="work">💼 Work (仕事)</SelectItem>
            <SelectItem value="study">📚 Study (学習)</SelectItem>
            <SelectItem value="health">🏃 Health (健康)</SelectItem>
            <SelectItem value="input">📥 Input (アイデア/タスク)</SelectItem>
            <SelectItem value="output">📤 Output (成果物)</SelectItem>
            <SelectItem value="other">📋 Other (その他)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
);

TaskTypeSelect.displayName = 'TaskTypeSelect';
