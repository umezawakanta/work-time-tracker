import React, { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GripVertical,
  MoreHorizontal,
  Edit3,
  Trash2,
  Flag,
  Calendar,
  Clock,
  Tag,
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
} from "lucide-react";

import { Todo } from "@/types/todo";

interface TodoItemProps {
  readonly todo: Todo;
  readonly onToggle: (todo: Todo) => Promise<void>;
  readonly onDelete: (todoId: string) => Promise<void>;
  readonly onUpdate: (todoId: string, updates: Partial<Todo>) => Promise<void>;
  readonly isPremium?: boolean;
  readonly dragHandleProps?: Record<string, unknown> | null;
  readonly isHighPriority?: boolean;
  readonly isCompleted?: boolean;
}

const PRIORITY_CONFIG: Record<number, { color: string; label: string; }> = {
  5: { color: "text-red-500", label: "最高" },
  4: { color: "text-orange-500", label: "高" },
  3: { color: "text-blue-500", label: "普通" },
  2: { color: "text-green-500", label: "低" },
  1: { color: "text-gray-500", label: "最低" },
};

/**
 * Todo Item Component
 * Individual task item with advanced features and interactions
 */
export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onDelete,
  onUpdate,
  isPremium = false,
  dragHandleProps,
  isHighPriority = false,
  isCompleted = false,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleToggle = useCallback(async (): Promise<void> => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onToggle(todo);
    } finally {
      setIsLoading(false);
    }
  }, [todo, onToggle, isLoading]);

  const handleDelete = useCallback(async (): Promise<void> => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onDelete(todo.id);
    } finally {
      setIsLoading(false);
    }
  }, [todo.id, onDelete, isLoading]);

  const formatDeadline = (deadline: string): string => {
    const date = new Date(deadline);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "期限切れ";
    if (diffDays === 0) return "今日";
    if (diffDays === 1) return "明日";
    if (diffDays <= 7) return `${diffDays}日後`;
    
    return date.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = todo.deadline && new Date(todo.deadline) < new Date();
  const isToday = todo.deadline && 
    new Date(todo.deadline).toDateString() === new Date().toDateString();

  const priorityConfig = PRIORITY_CONFIG[todo.priority] || PRIORITY_CONFIG[3];

  const cardClassName = [
    "group relative transition-all duration-200 hover:shadow-md",
    isCompleted ? "opacity-75" : "",
    isHighPriority ? "border-l-4 border-l-red-500 bg-red-50/30" : "",
    isOverdue && !isCompleted ? "border-l-4 border-l-red-500 bg-red-50" : "",
    isToday && !isCompleted ? "border-l-4 border-l-orange-500 bg-orange-50" : "",
  ].filter(Boolean).join(" ");

  return (
    <Card className={cardClassName}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          {dragHandleProps && (
            <div
              {...dragHandleProps}
              className="flex-shrink-0 p-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
          )}

          {/* Checkbox */}
          <div className="flex-shrink-0 pt-0.5">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={handleToggle}
              disabled={isLoading}
              className="h-5 w-5"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {/* Task Text */}
                <h4 className={`font-medium text-sm leading-tight ${
                  todo.completed ? "line-through text-gray-500" : "text-gray-900"
                }`}>
                  {todo.text}
                </h4>

                {/* Meta Information */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {/* Type Badge */}
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      todo.type === "input" 
                        ? "bg-blue-100 text-blue-700 border-blue-300" 
                        : "bg-orange-100 text-orange-700 border-orange-300"
                    }`}
                  >
                    {todo.type === "input" ? (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    )}
                    {todo.type === "input" ? "インプット" : "アウトプット"}
                  </Badge>

                  {/* Priority Badge */}
                  {todo.priority > 3 && (
                    <Badge variant="outline" className="text-xs">
                      <Flag className={`h-3 w-3 mr-1 ${priorityConfig.color}`} />
                      {priorityConfig.label}
                    </Badge>
                  )}

                  {/* Priority Mark */}
                  {todo.isPrioritized && (
                    <Badge variant="destructive" className="text-xs">
                      <Target className="h-3 w-3 mr-1" />
                      重要
                    </Badge>
                  )}

                  {/* Deadline */}
                  {todo.deadline && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        isOverdue ? "bg-red-100 text-red-700 border-red-300" :
                        isToday ? "bg-orange-100 text-orange-700 border-orange-300" :
                        "bg-gray-100 text-gray-700 border-gray-300"
                      }`}
                    >
                      {isOverdue && <AlertCircle className="h-3 w-3 mr-1" />}
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDeadline(todo.deadline)}
                    </Badge>
                  )}

                  {/* Estimated Duration */}
                  {isPremium && todo.estimatedDuration && (
                    <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                      <Clock className="h-3 w-3 mr-1" />
                      {todo.estimatedDuration}分
                    </Badge>
                  )}

                  {/* Category */}
                  {isPremium && todo.category && (
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                      <Tag className="h-3 w-3 mr-1" />
                      {todo.category}
                    </Badge>
                  )}
                </div>

                {/* Tags */}
                {isPremium && todo.tags && todo.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {todo.tags.slice(0, 3).map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-xs bg-gray-100 text-gray-600"
                      >
                        #{tag}
                      </Badge>
                    ))}
                    {todo.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                        +{todo.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Completion Time */}
                {todo.completed && todo.completedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    完了: {new Date(todo.completedAt).toLocaleString("ja-JP", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    編集
                  </DropdownMenuItem>
                  
                  {!todo.isPrioritized && (
                    <DropdownMenuItem 
                      onClick={() => onUpdate(todo.id, { isPrioritized: true })}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      重要タスクにする
                    </DropdownMenuItem>
                  )}

                  {todo.isPrioritized && (
                    <DropdownMenuItem 
                      onClick={() => onUpdate(todo.id, { isPrioritized: false })}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      重要タスクを解除
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};