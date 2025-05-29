import React from 'react';
import { WBSNode } from '@/types/wbs';

interface WBSTreeViewProps {
  nodes: WBSNode[];
  onNodeClick: (_node: any) => void;
  onNodeUpdate: (_nodeId: any) => Promise<void>;
}

const WBSTreeView: React.FC<WBSTreeViewProps> = ({ nodes, onNodeClick, onNodeUpdate }) => {
  return (
    <div className="wbs-tree-view">
      {nodes.map(node => (
        <div key={node.id} onClick={() => onNodeClick(node)}>
          {node.name}
        </div>
      ))}
    </div>
  );
};

export default WBSTreeView;
