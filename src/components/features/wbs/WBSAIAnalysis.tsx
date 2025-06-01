import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WBSNode } from '@/types/wbs';

interface WBSAIAnalysisProps {
  nodes: WBSNode[];
  selectedNode?: WBSNode | null;
  onOptimizationApply?: (nodeId: string, optimization: any) => void;
}

const WBSAIAnalysis: React.FC<WBSAIAnalysisProps> = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <p>AI Analysis - Coming Soon</p>
      </CardContent>
    </Card>
  );
};

export default WBSAIAnalysis;
