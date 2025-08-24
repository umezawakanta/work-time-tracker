import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { Calendar, Clock, CheckCircle2, GripVertical } from 'lucide-react';

interface TaskItem {
  id: string;
  title: string;
  type: 'event' | 'task';
  taskId?: string;
  completed?: boolean;
}

interface TaskCardProps {
  item: TaskItem;
  index: number;
  onItemClick: (item: TaskItem) => void;
  getDragStyle: (
    isDragging: boolean,
    draggableStyle: React.CSSProperties | undefined
  ) => React.CSSProperties;
  isDragDisabled: (taskId: string) => boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  item,
  index,
  onItemClick,
  getDragStyle,
  isDragDisabled,
}) => {
  // イベントはドラッグ不可
  if (item.type === 'event') {
    return (
      <div
        className={cn(
          'text-xs p-1 rounded cursor-pointer transition-all hover:opacity-80 truncate',
          'bg-purple-100 text-purple-800'
        )}
        onClick={(e) => {
          e.stopPropagation();
          onItemClick(item);
        }}
      >
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span className="truncate">{item.title}</span>
        </div>
      </div>
    );
  }

  // タスクの場合はドラッグ可能
  return (
    <Draggable
      draggableId={item.id}
      index={index}
      isDragDisabled={isDragDisabled(item.taskId || '')}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            'text-xs p-1 rounded cursor-pointer transition-all hover:opacity-80 truncate group',
            item.completed
              ? 'bg-green-100 text-green-800 line-through'
              : 'bg-blue-100 text-blue-800'
          )}
          style={getDragStyle(snapshot.isDragging, provided.draggableProps.style)}
          onClick={(e) => {
            e.stopPropagation();
            onItemClick(item);
          }}
        >
          <div className="flex items-center gap-1">
            <div
              {...provided.dragHandleProps}
              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-3 w-3" />
            </div>
            {item.completed ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            <span className="truncate">{item.title}</span>
          </div>
        </div>
      )}
    </Draggable>
  );
};
