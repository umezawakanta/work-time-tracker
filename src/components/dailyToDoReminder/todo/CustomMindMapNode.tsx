import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, AlertCircle, Clock, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomNodeData {
  label: string;
  type: 'root' | 'category' | 'priority' | 'status' | 'task';
  count?: number;
  icon?: string;
  priority?: number;
  todo?: any;
}

export const CustomMindMapNode: React.FC<NodeProps<CustomNodeData>> = ({ data, isConnectable }) => {
  const getNodeStyle = () => {
    switch (data.type) {
      case 'root':
        return 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg';
      case 'category':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md';
      case 'priority':
        return getPriorityGradient(data.priority || 1);
      case 'status':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md';
      case 'task':
        return data.todo?.completed
          ? 'bg-green-50 border-green-300 text-green-800'
          : 'bg-white border-gray-300 text-gray-800 hover:shadow-md transition-shadow';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getPriorityGradient = (priority: number) => {
    if (priority >= 4) return 'bg-gradient-to-r from-red-500 to-orange-500 text-white';
    if (priority >= 3) return 'bg-gradient-to-r from-orange-400 to-yellow-500 text-white';
    if (priority >= 2) return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
    return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
  };

  const getIcon = () => {
    if (data.icon) return <span className="text-2xl">{data.icon}</span>;

    switch (data.type) {
      case 'task':
        return data.todo?.completed ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Circle className="h-4 w-4" />
        );
      case 'priority':
        return <AlertCircle className="h-4 w-4" />;
      case 'status':
        return <Clock className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  return (
    <div
      className={cn(
        'px-4 py-2 rounded-lg border-2 min-w-[150px] transition-all duration-200',
        getNodeStyle()
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2"
      />

      <div className="flex items-center gap-2">
        {getIcon()}
        <div className="flex-1">
          <div className="font-medium text-sm">{data.label}</div>
          {data.count !== undefined && data.type !== 'task' && (
            <Badge
              variant={data.type === 'root' ? 'secondary' : 'outline'}
              className="text-xs mt-1"
            >
              {data.count} タスク
            </Badge>
          )}
          {data.todo && (
            <div className="text-xs opacity-75 mt-1">
              {data.todo.estimatedDuration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {data.todo.estimatedDuration}分
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2"
      />
    </div>
  );
};
