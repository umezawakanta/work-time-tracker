const AutomationCenter: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">自動化センター</h1>
        <Button onClick={() => setCreateWorkflowOpen(true)}>
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
