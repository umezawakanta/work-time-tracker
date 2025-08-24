import React, { useState } from 'react';
import { WBSNode } from '@/types/wbs';
import { ChevronRight, ChevronDown, Edit2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface WBSTreeViewProps {
  nodes: WBSNode[];
  onNodeClick: (node: WBSNode) => void;
  onNodeUpdate: (nodeId: string, updates: Partial<WBSNode>) => Promise<void>;
}

interface TreeNodeProps {
  node: WBSNode;
  children: WBSNode[];
  nodes: WBSNode[];
  onNodeClick: (node: WBSNode) => void;
  onNodeUpdate: (nodeId: string, updates: Partial<WBSNode>) => Promise<void>;
  level: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  children,
  nodes,
  onNodeClick,
  onNodeUpdate,
  level,
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 2); // 最初の2レベルは展開
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.name);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEdit = async () => {
    if (editValue.trim() && editValue !== node.name) {
      setIsUpdating(true);
      try {
        await onNodeUpdate(node.id, { name: editValue.trim() });
      } catch (error) {
        console.error('Failed to update node:', error);
        setEditValue(node.name); // エラー時は元に戻す
      }
      setIsUpdating(false);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(node.name);
    setIsEditing(false);
  };

  const getStatusColor = (status: WBSNode['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in-progress':
        return 'text-blue-600';
      case 'delayed':
        return 'text-red-600';
      case 'cancelled':
        return 'text-gray-400';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadgeVariant = (status: WBSNode['status']) => {
    switch (status) {
      case 'completed':
        return 'outline';
      case 'in-progress':
        return 'default';
      case 'delayed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: WBSNode['status']) => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'in-progress':
        return '進行中';
      case 'delayed':
        return '遅延';
      case 'cancelled':
        return 'キャンセル';
      default:
        return '未開始';
    }
  };

  return (
    <div className="mb-1">
      <div
        className={cn(
          'flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer',
          'transition-colors duration-150'
        )}
        style={{ paddingLeft: `${level * 24}px` }}
      >
        {/* 展開/折りたたみボタン */}
        {children.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-gray-200 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        {children.length === 0 && <div className="w-5" />}

        {/* ノード名 */}
        <div className="flex-1 flex items-center gap-2" onClick={() => onNodeClick(node)}>
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEdit();
                  if (e.key === 'Escape') handleCancel();
                }}
                className="h-7 text-sm"
                disabled={isUpdating}
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                disabled={isUpdating}
                className="h-7 w-7 p-0"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                disabled={isUpdating}
                className="h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <span className={cn('font-medium text-sm', getStatusColor(node.status))}>
                {node.icon && <span className="mr-1">{node.icon}</span>}
                {node.name}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>

        {/* ステータスバッジ */}
        <Badge variant={getStatusBadgeVariant(node.status)} className="text-xs">
          {getStatusLabel(node.status)}
        </Badge>

        {/* 進捗バー */}
        <div className="w-24 flex items-center gap-2">
          <Progress value={node.progress} className="h-2" />
          <span className="text-xs text-gray-600 min-w-[3ch]">{node.progress}%</span>
        </div>

        {/* 工数情報 */}
        <div className="text-xs text-gray-500">
          {node.actualHours}/{node.estimatedHours}h
        </div>
      </div>

      {/* 子ノード */}
      {isExpanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              children={nodes.filter((n) => n.parentId === child.id)}
              nodes={nodes}
              onNodeClick={onNodeClick}
              onNodeUpdate={onNodeUpdate}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const WBSTreeView: React.FC<WBSTreeViewProps> = ({ nodes, onNodeClick, onNodeUpdate }) => {
  // ルートノード（parentIdがnullまたは空）を取得
  const rootNodes = nodes.filter((n) => !n.parentId || n.parentId === '');

  return (
    <div className="wbs-tree-view bg-white rounded-lg">
      {rootNodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          children={nodes.filter((n) => n.parentId === node.id)}
          nodes={nodes}
          onNodeClick={onNodeClick}
          onNodeUpdate={onNodeUpdate}
          level={0}
        />
      ))}
    </div>
  );
};

export default WBSTreeView;
