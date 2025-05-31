import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TodoType } from '../hooks/useTodoForm';

interface TaskTypeSelectProps {
  value: TodoType;
  onChange: (value: TodoType) => void;
}

export const TaskTypeSelect = React.memo<TaskTypeSelectProps>(({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label>タスクタイプ</Label>
      <Select value={value} onValueChange={(value) => onChange(value as TodoType)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="input">📚 インプット（学習・情報収集）</SelectItem>
          <SelectItem value="output">🚀 アウトプット（作成・実行）</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
});

TaskTypeSelect.displayName = 'TaskTypeSelect';
