import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, RefreshCw, Code, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AppDispatch } from '@/store';
import { addTodoItem } from '@/store/todoSlice';
import { selectTodos as selectTodoItems } from '@/store/todoSlice';
import SiteDevAIService from '@/services/ai/SiteDevAIService';
import { cn } from '@/lib/utils';

interface TaskSuggestion {
  task: string;
  type: 'input' | 'output';
  priority: number;
  estimatedHours: number;
  category: string;
  reason: string;
  relatedWBSNode?: string;
  deadline?: string;
  tags: string[];
}

export const SiteDevTaskSuggester: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentTodos = useSelector(selectTodoItems);
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());

  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const completedTodos = currentTodos.filter((t) => t.completed);
      const activeTodos = currentTodos.filter((t) => !t.completed);

      const newSuggestions = await SiteDevAIService.suggestSiteDevTasks(
        activeTodos,
        completedTodos,
        'current-user' // TODO: 実際のユーザーIDを使用
      );

      setSuggestions(newSuggestions);
      setSelectedSuggestions(new Set());

      if (newSuggestions.length === 0) {
        toast.error('タスク提案を生成できませんでした');
      } else {
        toast.success(`${newSuggestions.length}個のタスクを提案しました`);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      toast.error('提案の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [currentTodos]);

  const toggleSelection = (index: number) => {
    const newSelection = new Set(selectedSuggestions);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedSuggestions(newSelection);
  };

  const addSelectedTasks = async () => {
    const tasksToAdd = Array.from(selectedSuggestions).map((index) => suggestions[index]);

    if (tasksToAdd.length === 0) {
      toast.error('タスクを選択してください');
      return;
    }

    try {
      for (const suggestion of tasksToAdd) {
        await dispatch(
          addTodoItem({
            task: `[${suggestion.category}] ${suggestion.task}`,
            type: suggestion.type,
            priority: suggestion.priority,
            isPrioritized: suggestion.priority >= 4,
            deadline: suggestion.deadline,
          })
        ).unwrap();
      }

      toast.success(`${tasksToAdd.length}個のタスクを追加しました`);

      // 追加したタスクを提案から削除
      setSuggestions((prev) => prev.filter((_, index) => !selectedSuggestions.has(index)));
      setSelectedSuggestions(new Set());
    } catch (error) {
      console.error('Failed to add tasks:', error);
      toast.error('タスクの追加に失敗しました');
    }
  };

  const getPriorityColor = (priority: number): string => {
    const colors = {
      5: 'text-red-600 bg-red-50',
      4: 'text-orange-600 bg-orange-50',
      3: 'text-yellow-600 bg-yellow-50',
      2: 'text-green-600 bg-green-50',
      1: 'text-blue-600 bg-blue-50',
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  const getTypeIcon = (type: 'input' | 'output') => {
    return type === 'output' ? '🚀' : '📚';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            サイト開発タスク提案
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              AI提案
            </Badge>
          </CardTitle>
          <Button onClick={loadSuggestions} disabled={loading} size="sm" variant="outline">
            <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
            {loading ? '生成中...' : '提案を生成'}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>「提案を生成」をクリックして</p>
            <p>AIがサイト開発に必要なタスクを提案します</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={cn(
                  'border rounded-lg p-4 cursor-pointer transition-all',
                  selectedSuggestions.has(index)
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                )}
                onClick={() => toggleSelection(index)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                      <h4 className="font-medium">{suggestion.task}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{suggestion.reason}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedSuggestions.has(index)}
                    onChange={() => toggleSelection(index)}
                    className="mt-1"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`選択: ${suggestion.task}`}
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getPriorityColor(suggestion.priority)}>
                    優先度 {suggestion.priority}
                  </Badge>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    {suggestion.estimatedHours}時間
                  </Badge>
                  <Badge variant="outline">{suggestion.category}</Badge>

                  {suggestion.deadline && (
                    <Badge variant="outline" className="text-orange-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {new Date(suggestion.deadline).toLocaleDateString('ja-JP')}
                    </Badge>
                  )}

                  {suggestion.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}

            {selectedSuggestions.size > 0 && (
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setSelectedSuggestions(new Set())}>
                  選択をクリア
                </Button>
                <Button onClick={addSelectedTasks}>
                  <Plus className="h-4 w-4 mr-2" />
                  {selectedSuggestions.size}個のタスクを追加
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
