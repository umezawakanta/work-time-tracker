import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { WBSNode } from '@/types/wbs';
import wbsAIService from '@/services/ai/WBSAIService';

export const AIWBSGenerator: React.FC<{
  projectName: string;
  projectGoals: string;
  onGenerate: (wbs: WBSNode[]) => void;
}> = ({ projectName, projectGoals, onGenerate }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateWBS = async () => {
    setIsGenerating(true);

    try {
      const prompt = `
        プロジェクト名: ${projectName}
        目標: ${projectGoals}
        
        このプロジェクトのWBS（作業分解構造）を生成してください。
        以下の形式で出力してください：
        - レベル1: 主要な成果物/フェーズ
        - レベル2: 具体的な作業パッケージ
        - レベル3: 個別のタスク
        
        各項目には工数見積もり（時間）も含めてください。
      `;

      const wbsStructure = await wbsAIService.generateWBS(prompt);

      onGenerate(wbsStructure);
      toast.success('WBSを生成しました');
    } catch (error) {
      toast.error('WBS生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI WBS生成</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={generateWBS} disabled={isGenerating} className="w-full">
          {isGenerating ? '生成中...' : 'WBSを自動生成'}
        </Button>
      </CardContent>
    </Card>
  );
};
