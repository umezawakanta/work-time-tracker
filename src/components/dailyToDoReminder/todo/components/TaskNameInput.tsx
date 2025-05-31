import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Brain, Loader2 } from 'lucide-react';

interface TaskNameInputProps {
  value: string;
  onChange: (value: string) => void;
  onAIAnalysis: () => void;
  isAnalyzing: boolean;
  isPremium?: boolean;
}

export const TaskNameInput = React.memo<TaskNameInputProps>(
  ({ value, onChange, onAIAnalysis, isAnalyzing, isPremium = false }) => {
    return (
      <div className="grid w-full gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="task-name">タスク名 *</Label>
          {isPremium && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAIAnalysis}
              disabled={!value.trim() || isAnalyzing}
              className="flex items-center gap-1"
            >
              {isAnalyzing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Brain className="h-3 w-3" />
              )}
              <span className="text-xs">AI分析</span>
            </Button>
          )}
        </div>
        <Input
          id="task-name"
          placeholder="今日やることを入力してください"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={100}
          required
          aria-describedby="task-name-hint"
        />
        <p id="task-name-hint" className="text-xs text-gray-500">
          {value.length}/100 文字
        </p>
      </div>
    );
  }
);

TaskNameInput.displayName = 'TaskNameInput';
