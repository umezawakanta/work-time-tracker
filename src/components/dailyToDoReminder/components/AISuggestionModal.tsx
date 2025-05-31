import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, RefreshCw, Clock, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { AppDispatch } from '@/store';
import { addTodoItem, selectTodos, selectAnalysisSummary } from '@/store/todoSlice';
import AdvancedAIService from '@/services/ai/AdvancedAIService';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

interface AISuggestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TaskSuggestion {
  task: string;
  type: 'input' | 'output';
  priority: number;
  estimatedDuration?: number;
  reason?: string;
  deadline?: string;
}

export const AISuggestionModal: React.FC<AISuggestionModalProps> = ({ open, onOpenChange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector(selectTodos);
  const analysisSummary = useSelector(selectAnalysisSummary);

  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  // AI提案を生成
  const generateSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const completedTodos = todos.filter((t) => t.completed);
      const currentGoals = ['生産性向上', 'スキルアップ', 'タスク効率化']; // デフォルト目標

      // Map TodoItem[] to Todo[] by adding the missing updatedAt property
      const todosForAI = completedTodos.map((todo) => ({
        ...todo,
        type: todo.type || 'input',
        createdAt: todo.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      const aiSuggestions = await AdvancedAIService.suggestNextTasks(todosForAI, currentGoals);

      const formattedSuggestions: TaskSuggestion[] = aiSuggestions.map((s) => ({
        task: s.task,
        type: s.type || 'output',
        priority: s.priority || 3,
        deadline: s.deadline,
      }));

      // AIが提案を返さない場合のフォールバック
      if (formattedSuggestions.length === 0) {
        // 分析データに基づいた提案を生成
        const needsMoreOutput =
          todos.filter((t) => t.type === 'input').length >
          todos.filter((t) => t.type === 'output').length * 1.5;

        formattedSuggestions.push(
          {
            task: needsMoreOutput
              ? '学んだことをブログ記事やドキュメントにまとめる'
              : '新しいスキルやツールについて学習する',
            type: needsMoreOutput ? 'output' : 'input',
            priority: 4,
            estimatedDuration: 60,
            reason: needsMoreOutput
              ? 'インプットとアウトプットのバランスを改善'
              : '継続的な学習による成長',
          },
          {
            task: '週次振り返りとプランニング',
            type: 'output',
            priority: 5,
            estimatedDuration: 30,
            reason: '定期的な振り返りで生産性を向上',
          },
          {
            task: 'タスクの優先順位を見直す',
            type: 'output',
            priority: 4,
            estimatedDuration: 20,
            reason: '効率的なタスク管理の実現',
          }
        );
      }

      setSuggestions(formattedSuggestions);
      setSelectedSuggestions(new Set());
      toast.success(`${formattedSuggestions.length}個の提案を生成しました`);
    } catch (error) {
      console.error('AI suggestion error:', error);
      toast.error('提案の生成に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [todos]);

  // 初回表示時に自動生成
  React.useEffect(() => {
    if (open && suggestions.length === 0) {
      generateSuggestions();
    }
  }, [open, suggestions.length, generateSuggestions]);

  // 選択の切り替え
  const toggleSelection = (index: number) => {
    const newSelection = new Set(selectedSuggestions);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedSuggestions(newSelection);
  };

  // 選択したタスクを追加
  const addSelectedTasks = async () => {
    const tasksToAdd = Array.from(selectedSuggestions).map((index) => suggestions[index]);

    if (tasksToAdd.length === 0) {
      toast.error('追加するタスクを選択してください');
      return;
    }

    try {
      for (const suggestion of tasksToAdd) {
        await dispatch(
          addTodoItem({
            task: suggestion.task,
            type: suggestion.type,
            priority: suggestion.priority,
            isPrioritized: suggestion.priority >= 4,
            deadline: suggestion.deadline,
          })
        ).unwrap();
      }

      toast.success(`${tasksToAdd.length}個のタスクを追加しました`);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add tasks:', error);
      toast.error('タスクの追加に失敗しました');
    }
  };

  const getTypeIcon = (type: 'input' | 'output') => {
    return type === 'output' ? '🚀' : '📚';
  };

  const getPriorityBadgeVariant = (priority: number): 'destructive' | 'secondary' | 'outline' => {
    if (priority >= 4) return 'destructive';
    if (priority >= 3) return 'secondary';
    return 'outline';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI タスク提案
          </DialogTitle>
          <DialogDescription>
            あなたの作業履歴と目標に基づいて、次に取り組むべきタスクを提案します
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>提案を生成中です...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <Card
                  key={index}
                  className={cn(
                    'p-4 cursor-pointer transition-all',
                    selectedSuggestions.has(index)
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-gray-50'
                  )}
                  onClick={() => toggleSelection(index)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedSuggestions.has(index)}
                      onChange={() => toggleSelection(index)}
                      className="mt-1"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`選択: ${suggestion.task}`}
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                        <h4 className="font-medium">{suggestion.task}</h4>
                      </div>

                      {suggestion.reason && (
                        <p className="text-sm text-muted-foreground mb-2">{suggestion.reason}</p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getPriorityBadgeVariant(suggestion.priority)}>
                          優先度 {suggestion.priority}
                        </Badge>

                        {suggestion.estimatedDuration && (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            {suggestion.estimatedDuration}分
                          </Badge>
                        )}

                        {suggestion.deadline && (
                          <Badge variant="outline">
                            <Target className="h-3 w-3 mr-1" />
                            {new Date(suggestion.deadline).toLocaleDateString('ja-JP')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-4 border-t">
          <Button variant="outline" onClick={generateSuggestions} disabled={loading} size="sm">
            <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
            再生成
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button onClick={addSelectedTasks} disabled={selectedSuggestions.size === 0}>
              <Plus className="h-4 w-4 mr-2" />
              {selectedSuggestions.size > 0
                ? `${selectedSuggestions.size}個のタスクを追加`
                : 'タスクを選択してください'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
