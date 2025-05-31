import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Brain, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

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
      <div className="space-y-2">
        <Label htmlFor="task-name" className="text-sm font-medium">
          タスク名
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <div className="space-y-2">
          <Textarea
            id="task-name"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="タスクの内容を入力...&#10;詳細な説明は改行して記載できます"
            className="min-h-[80px] resize-y"
            required
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Shift+Enterで改行し、詳細な説明を追加できます</p>
            {isPremium && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAIAnalysis}
                disabled={isAnalyzing || !value.trim()}
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    AI分析
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

TaskNameInput.displayName = 'TaskNameInput';
