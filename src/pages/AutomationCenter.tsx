import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

// Placeholder components
const ActiveAutomations = () => (
  <Card>
    <CardContent>アクティブな自動化</CardContent>
  </Card>
);
const AutomationTemplates = () => (
  <Card>
    <CardContent>テンプレート</CardContent>
  </Card>
);
const AutomationAnalytics = () => (
  <Card>
    <CardContent>効果分析</CardContent>
  </Card>
);

const AutomationCenter: React.FC = () => {
  // TODO: 自動化作成ダイアログの実装
  const handleCreateWorkflow = () => {
    console.log('自動化作成機能は開発中です');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">自動化センター</h1>
        <Button onClick={handleCreateWorkflow}>
          <Plus className="h-4 w-4 mr-2" />
          新しい自動化を作成
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">アクティブな自動化</TabsTrigger>
          <TabsTrigger value="templates">テンプレート</TabsTrigger>
          <TabsTrigger value="analytics">効果分析</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <ActiveAutomations />
        </TabsContent>

        <TabsContent value="templates">
          <AutomationTemplates />
        </TabsContent>

        <TabsContent value="analytics">
          <AutomationAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};
