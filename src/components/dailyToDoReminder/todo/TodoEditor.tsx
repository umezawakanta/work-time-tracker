import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// 共通の型をインポート
import { TaskType } from '@/types/todo';

interface TodoEditorProps {
  text: string;
  type: TaskType;
  deadline?: string;
  onTextChange: (text: string) => void;
  onTypeChange: (type: TaskType) => void;
  onDeadlineChange: (deadline: string | undefined) => void;
  onCancel: () => void;
  onSave: () => void;
}

/**
 * Todoアイテム編集コンポーネント
 */
const TodoEditor: React.FC<TodoEditorProps> = ({
  text,
  type,
  deadline,
  onTextChange,
  onTypeChange,
  onDeadlineChange,
  onCancel,
  onSave,
}) => {
  // 期限の最小値は今日
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // 日付フォーマットを正規化
  const normalizeDateValue = (value: string): string => {
    if (!value) return '';
    // すでに datetime-local 形式 (YYYY-MM-DDTHH:MM) の場合はそのまま
    if (value.includes('T')) return value;
    // date形式 (YYYY-MM-DD) の場合は時刻を追加
    return `${value}T00:00`;
  };

  // Enterキーで保存、Escキーでキャンセル
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="flex-grow pl-3">
      <div className="space-y-2">
        <Input
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          className="w-full"
          placeholder="タスク内容を入力"
          onKeyDown={handleKeyDown}
          autoFocus
        />

        <div className="flex gap-2 items-center">
          <Select value={type} onValueChange={(value: TaskType) => onTypeChange(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="タイプを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="input">
                <div className="flex items-center">
                  <Download className="h-4 w-4 mr-2 text-blue-500" />
                  <span>インプット</span>
                </div>
              </SelectItem>
              <SelectItem value="output">
                <div className="flex items-center">
                  <Upload className="h-4 w-4 mr-2 text-green-500" />
                  <span>アウトプット</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <input
            type="datetime-local"
            value={deadline ? (deadline.includes('T') ? deadline : `${deadline}T00:00`) : ''}
            min={`${getTodayString()}T00:00`}
            onChange={(e) => {
              const value = e.target.value;
              // Normalize the date format
              onDeadlineChange(value || undefined);
            }}
            className="p-2 text-sm border rounded flex-1"
            placeholder="期限日時を選択"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button size="sm" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button size="sm" onClick={onSave} disabled={!text.trim()}>
            保存
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TodoEditor;
