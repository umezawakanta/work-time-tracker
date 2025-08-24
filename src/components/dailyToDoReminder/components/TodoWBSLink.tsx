import React from 'react';
import { Link2, GitBranch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TodoWBSLinkProps {
  readonly isLinked: boolean;
  readonly wbsNodeName?: string;
  readonly projectName?: string;
  readonly onLinkClick?: () => void;
}

export const TodoWBSLink: React.FC<TodoWBSLinkProps> = ({
  isLinked,
  wbsNodeName,
  projectName = 'サイト開発プロジェクト',
  onLinkClick,
}) => {
  if (!isLinked) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="secondary"
          className="cursor-pointer flex items-center gap-1 text-xs"
          onClick={onLinkClick}
        >
          <GitBranch className="h-3 w-3" />
          WBS連携
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1">
          <p className="font-semibold">{projectName}</p>
          {wbsNodeName && <p className="text-xs text-muted-foreground">{wbsNodeName}</p>}
          <p className="text-xs">クリックしてWBSを開く</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
