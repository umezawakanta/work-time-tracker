"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";

interface ImpulseAction {
  id: string;
  date: string;
  action: string;
  consequence: string;
}

const ImpulseTrackerPage: React.FC = () => {
  const [actions, setActions] = useState<ImpulseAction[]>([]);
  const [newAction, setNewAction] = useState("");
  const [newConsequence, setNewConsequence] = useState("");

  useEffect(() => {
    const storedActions = localStorage.getItem("impulseActions");
    if (storedActions) {
      setActions(JSON.parse(storedActions));
    }
  }, []);

  const saveActions = (newActions: ImpulseAction[]) => {
    setActions(newActions);
    localStorage.setItem("impulseActions", JSON.stringify(newActions));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: ImpulseAction = {
      id: Date.now().toString(),
      date: format(new Date(), "yyyy-MM-dd HH:mm"),
      action: newAction,
      consequence: newConsequence,
    };
    const updatedActions = [newEntry, ...actions];
    saveActions(updatedActions);
    setNewAction("");
    setNewConsequence("");
    toast({
      title: "記録しました",
      description: "新しい行動が追加されました。",
    });
  };

  const handleDelete = (id: string) => {
    const updatedActions = actions.filter((action) => action.id !== id);
    saveActions(updatedActions);
    toast({
      title: "削除しました",
      description: "記録が削除されました。",
      variant: "destructive",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">衝動行動トラッカー</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>新しい行動を記録</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="action"
                  className="block text-sm font-medium text-gray-700"
                >
                  やってしまったこと
                </label>
                <Input
                  id="action"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  required
                  placeholder="例: 衝動買いをした"
                />
              </div>
              <div>
                <label
                  htmlFor="consequence"
                  className="block text-sm font-medium text-gray-700"
                >
                  結果や感想
                </label>
                <Textarea
                  id="consequence"
                  value={newConsequence}
                  onChange={(e) => setNewConsequence(e.target.value)}
                  placeholder="例: 財布が軽くなった。後悔している。"
                />
              </div>
              <Button type="submit">記録する</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>最近の行動</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {actions.slice(0, 5).map((action) => (
                <Card key={action.id} className="mb-4 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{action.action}</p>
                        <p className="text-sm text-gray-500">
                          {format(
                            new Date(action.date),
                            "yyyy年MM月dd日 HH:mm",
                            { locale: ja }
                          )}
                        </p>
                      </div>
                      <AlertCircle className="text-yellow-500" />
                    </div>
                    {action.consequence && (
                      <p className="mt-2 text-sm">{action.consequence}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>全ての記録</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {actions.map((action) => (
                <Card key={action.id} className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{action.action}</p>
                        <p className="text-sm text-gray-500">
                          {format(
                            new Date(action.date),
                            "yyyy年MM月dd日 HH:mm",
                            { locale: ja }
                          )}
                        </p>
                        {action.consequence && (
                          <p className="mt-2 text-sm">{action.consequence}</p>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(action.id)}
                      >
                        削除
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImpulseTrackerPage;
