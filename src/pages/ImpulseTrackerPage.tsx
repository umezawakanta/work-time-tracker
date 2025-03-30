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
import { AlertCircle, Download, Filter, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/useAuth";
import "@/styles/ImpulseTrackerPage.css";

interface ImpulseAction {
  id: string;
  userId: string;
  date: string;
  action: string;
  consequence: string;
  category?: string;
  emotion?: string;
  triggerSituation?: string;
  costAmount?: number;
}

// 新しく追加する統計データの型定義
interface ImpulseStats {
  totalCount: number;
  categoryBreakdown: Record<string, number>;
  emotionBreakdown: Record<string, number>;
  monthlyCosts: Record<string, number>;
  averageCostPerImpulse: number;
}

// カテゴリーの定義
const CATEGORIES = [
  { value: "shopping", label: "買い物" },
  { value: "food", label: "食べ物" },
  { value: "entertainment", label: "娯楽" },
  { value: "social_media", label: "SNS" },
  { value: "procrastination", label: "先延ばし" },
  { value: "other", label: "その他" },
];

// 感情の定義
const EMOTIONS = [
  { value: "boredom", label: "退屈" },
  { value: "stress", label: "ストレス" },
  { value: "anxiety", label: "不安" },
  { value: "excitement", label: "興奮" },
  { value: "sadness", label: "悲しみ" },
  { value: "loneliness", label: "孤独" },
];

const ImpulseTrackerPage: React.FC = () => {
  // 認証コンテキストからユーザー情報を取得
  const { isAuthenticated, user } = useAuth();

  const [actions, setActions] = useState<ImpulseAction[]>([]);
  const [filteredActions, setFilteredActions] = useState<ImpulseAction[]>([]);
  const [newAction, setNewAction] = useState("");
  const [newConsequence, setNewConsequence] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newEmotion, setNewEmotion] = useState("");
  const [newTrigger, setNewTrigger] = useState("");
  const [newCostAmount, setNewCostAmount] = useState<number | undefined>(
    undefined
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [statsData, setStatsData] = useState<ImpulseStats | null>(null);

  // データ読み込み
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) {
        // 未認証の場合はローカルストレージからデータを読み込む
        const storedActions = localStorage.getItem("impulseActions");
        if (storedActions) {
          const parsedActions = JSON.parse(storedActions) as ImpulseAction[];
          setActions(parsedActions);
          setFilteredActions(parsedActions);
        }
        setIsLoading(false);
        return;
      }

      try {
        // 認証済みの場合はAPIからデータを取得
        setIsLoading(true);
        // TODO: 本番環境では実際のAPIエンドポイントを使用
        // const response = await fetch(`/api/impulse-actions?userId=${user.id}`);
        // if (!response.ok) throw new Error('データの取得に失敗しました');
        // const data = await response.json();
        // setActions(data);
        // setFilteredActions(data);

        // モック実装
        const storedActions = localStorage.getItem(
          `impulseActions_${user?.id}`
        );
        if (storedActions) {
          const parsedActions = JSON.parse(storedActions) as ImpulseAction[];
          setActions(parsedActions);
          setFilteredActions(parsedActions);
        }

        // ユーザーのプレミアムステータスを確認
        // TODO: 本番環境では実際のAPIエンドポイントを使用
        // const premiumResponse = await fetch(`/api/user/subscription?userId=${user.id}`);
        // if (premiumResponse.ok) {
        //   const { isPremium } = await premiumResponse.json();
        //   setIsPremium(isPremium);
        // }

        // モック実装
        setIsPremium(user?.email?.includes("premium") || false);
      } catch (error) {
        console.error("データ取得エラー:", error);
        toast({
          title: "エラー",
          description: "データの取得に失敗しました。",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, user]);

  // データ保存関数
  const saveActions = async (newActions: ImpulseAction[]) => {
    if (!isAuthenticated) {
      // 未認証の場合はローカルストレージに保存
      localStorage.setItem("impulseActions", JSON.stringify(newActions));
      setActions(newActions);
      setFilteredActions(newActions);
      return;
    }

    try {
      // 認証済みの場合はAPIに保存
      // TODO: 本番環境では実際のAPIエンドポイントを使用
      // const response = await fetch('/api/impulse-actions', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ userId: user.id, actions: newActions }),
      // });
      // if (!response.ok) throw new Error('データの保存に失敗しました');

      // モック実装
      localStorage.setItem(
        `impulseActions_${user?.id}`,
        JSON.stringify(newActions)
      );
      setActions(newActions);
      setFilteredActions(newActions);
    } catch (error) {
      console.error("データ保存エラー:", error);
      toast({
        title: "エラー",
        description: "データの保存に失敗しました。",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!newAction.trim()) {
        toast({
          title: "入力エラー",
          description: "やってしまったことを入力してください",
          variant: "destructive",
        });
        return;
      }

      const newEntry: ImpulseAction = {
        id: Date.now().toString(),
        userId: user?.id || "anonymous",
        date: format(new Date(), "yyyy-MM-dd HH:mm"),
        action: newAction,
        consequence: newConsequence,
        category: newCategory || undefined,
        emotion: newEmotion || undefined,
        triggerSituation: newTrigger || undefined,
        costAmount: newCostAmount,
      };

      const updatedActions = [newEntry, ...actions];
      const success = await saveActions(updatedActions);

      if (success) {
        setNewAction("");
        setNewConsequence("");
        setNewCategory("");
        setNewEmotion("");
        setNewTrigger("");
        setNewCostAmount(undefined);

        toast({
          title: "記録しました",
          description: "新しい行動が追加されました。",
        });
      }
    } catch (error) {
      console.error("送信エラー:", error);
      toast({
        title: "エラー",
        description: "送信中にエラーが発生しました。",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // 認証済みの場合はAPIで削除
      if (isAuthenticated) {
        // TODO: 本番環境では実際のAPIエンドポイントを使用
        // const response = await fetch(`/api/impulse-actions/${id}`, {
        //   method: 'DELETE',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({ userId: user.id }),
        // });
        // if (!response.ok) throw new Error('削除に失敗しました');
      }

      const updatedActions = actions.filter((action) => action.id !== id);
      const success = await saveActions(updatedActions);

      if (success) {
        toast({
          title: "削除しました",
          description: "記録が削除されました。",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("削除エラー:", error);
      toast({
        title: "エラー",
        description: "削除中にエラーが発生しました。",
        variant: "destructive",
      });
    }
  };

  // フィルター適用処理
  const applyFilters = () => {
    let filtered = [...actions];

    if (filterDate) {
      filtered = filtered.filter((action) =>
        action.date.startsWith(filterDate)
      );
    }

    if (filterCategory) {
      filtered = filtered.filter(
        (action) => action.category === filterCategory
      );
    }

    setFilteredActions(filtered);
    setIsFilterDialogOpen(false);
  };

  // フィルターリセット
  const resetFilters = () => {
    setFilterDate("");
    setFilterCategory("");
    setFilteredActions(actions);
    setIsFilterDialogOpen(false);
  };

  // 統計データの計算
  const calculateStats = (): ImpulseStats => {
    // カテゴリー別の集計
    const categoryBreakdown: Record<string, number> = {};
    actions.forEach((action) => {
      if (action.category) {
        categoryBreakdown[action.category] =
          (categoryBreakdown[action.category] || 0) + 1;
      }
    });

    // 感情別の集計
    const emotionBreakdown: Record<string, number> = {};
    actions.forEach((action) => {
      if (action.emotion) {
        emotionBreakdown[action.emotion] =
          (emotionBreakdown[action.emotion] || 0) + 1;
      }
    });

    // 月別コスト集計
    const monthlyCosts: Record<string, number> = {};
    actions.forEach((action) => {
      if (action.costAmount && action.costAmount > 0) {
        const month = action.date.substring(0, 7); // YYYY-MM 形式
        monthlyCosts[month] = (monthlyCosts[month] || 0) + action.costAmount;
      }
    });

    // 衝動行動あたりの平均コスト
    const validCostEntries = actions.filter(
      (action) => action.costAmount && action.costAmount > 0
    );
    const totalCost = validCostEntries.reduce(
      (sum, action) => sum + (action.costAmount || 0),
      0
    );
    const averageCostPerImpulse =
      validCostEntries.length > 0 ? totalCost / validCostEntries.length : 0;

    return {
      totalCount: actions.length,
      categoryBreakdown,
      emotionBreakdown,
      monthlyCosts,
      averageCostPerImpulse,
    };
  };

  // 分析ダイアログを開く処理
  const openAnalytics = () => {
    if (!isPremium) {
      toast({
        title: "プレミアム機能",
        description: "詳細な分析はプレミアムユーザーのみ利用可能です。",
        variant: "default",
      });
      return;
    }

    const stats = calculateStats();
    setStatsData(stats);
    setIsAnalyticsOpen(true);
  };

  // CSV形式でエクスポート
  const exportToCsv = () => {
    const header = [
      "日付",
      "やってしまったこと",
      "結果や感想",
      "カテゴリー",
      "感情",
      "きっかけ",
      "コスト",
    ].join(",");

    const rows = actions.map((action) =>
      [
        action.date,
        `"${action.action.replace(/"/g, '""')}"`,
        `"${action.consequence?.replace(/"/g, '""') || ""}"`,
        action.category || "",
        action.emotion || "",
        `"${action.triggerSituation?.replace(/"/g, '""') || ""}"`,
        action.costAmount || "",
      ].join(",")
    );

    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `衝動行動記録_${format(new Date(), "yyyyMMdd")}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 週間集計
  const getWeeklyStats = () => {
    // 最近7日間のデータを抽出
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const recentActions = actions.filter((action) => {
      const actionDate = new Date(action.date);
      return actionDate >= sevenDaysAgo && actionDate <= now;
    });

    return {
      count: recentActions.length,
      totalCost: recentActions.reduce(
        (sum, action) => sum + (action.costAmount || 0),
        0
      ),
    };
  };

  const weeklyStats = getWeeklyStats();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">衝動行動トラッカー</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsFilterDialogOpen(true)}
            className="flex items-center"
          >
            <Filter className="mr-2 h-4 w-4" />
            フィルター
          </Button>
          <Button
            variant="outline"
            onClick={openAnalytics}
            className="flex items-center"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            分析
          </Button>
          <Button
            variant="outline"
            onClick={exportToCsv}
            className="flex items-center"
          >
            <Download className="mr-2 h-4 w-4" />
            エクスポート
          </Button>
        </div>
      </div>

      {/* 週間サマリーカード */}
      <Card className="mb-4 bg-blue-50">
        <CardContent className="p-4">
          <h2 className="font-semibold text-lg mb-2">週間サマリー</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">記録数</p>
              <p className="text-2xl font-bold">{weeklyStats.count}件</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">合計コスト</p>
              <p className="text-2xl font-bold">
                ¥{weeklyStats.totalCost.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700"
                  >
                    カテゴリー
                  </label>
                  <select
                    id="category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    disabled={isSubmitting}
                  >
                    <option value="">選択してください</option>
                    {CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="emotion"
                    className="block text-sm font-medium text-gray-700"
                  >
                    その時の感情
                  </label>
                  <select
                    id="emotion"
                    value={newEmotion}
                    onChange={(e) => setNewEmotion(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    disabled={isSubmitting}
                  >
                    <option value="">選択してください</option>
                    {EMOTIONS.map((emotion) => (
                      <option key={emotion.value} value={emotion.value}>
                        {emotion.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="trigger"
                  className="block text-sm font-medium text-gray-700"
                >
                  きっかけとなった状況
                </label>
                <Input
                  id="trigger"
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  placeholder="例: SNSで広告を見た"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="cost"
                  className="block text-sm font-medium text-gray-700"
                >
                  コスト（円）
                </label>
                <Input
                  id="cost"
                  type="number"
                  min="0"
                  value={newCostAmount || ""}
                  onChange={(e) =>
                    setNewCostAmount(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="例: 5000"
                  disabled={isSubmitting}
                />
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "送信中..." : "記録する"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>最近の行動</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-4">データを読み込み中...</p>
            ) : filteredActions.length === 0 ? (
              <p className="text-center py-4">記録がありません</p>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                {filteredActions.slice(0, 5).map((action) => (
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
                          {action.category && (
                            <span className="inline-block bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full mt-1 mr-1">
                              {CATEGORIES.find(
                                (c) => c.value === action.category
                              )?.label || action.category}
                            </span>
                          )}
                          {action.emotion && (
                            <span className="inline-block bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full mt-1 mr-1">
                              {EMOTIONS.find((e) => e.value === action.emotion)
                                ?.label || action.emotion}
                            </span>
                          )}
                          {action.costAmount && (
                            <span className="inline-block bg-red-200 text-red-800 text-xs px-2 py-1 rounded-full mt-1">
                              ¥{action.costAmount.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <AlertCircle className="text-yellow-500" />
                      </div>
                      {action.consequence && (
                        <p className="mt-2 text-sm">{action.consequence}</p>
                      )}
                      {action.triggerSituation && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">
                            きっかけ:
                          </span>
                          <p className="text-sm">{action.triggerSituation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>全ての記録</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-4">データを読み込み中...</p>
            ) : filteredActions.length === 0 ? (
              <p className="text-center py-4">記録がありません</p>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                {filteredActions.map((action) => (
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
                          <div className="flex flex-wrap gap-1 mt-1">
                            {action.category && (
                              <span className="inline-block bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                {CATEGORIES.find(
                                  (c) => c.value === action.category
                                )?.label || action.category}
                              </span>
                            )}
                            {action.emotion && (
                              <span className="inline-block bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {EMOTIONS.find(
                                  (e) => e.value === action.emotion
                                )?.label || action.emotion}
                              </span>
                            )}
                            {action.costAmount && (
                              <span className="inline-block bg-red-200 text-red-800 text-xs px-2 py-1 rounded-full">
                                ¥{action.costAmount.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {action.consequence && (
                            <p className="mt-2 text-sm">{action.consequence}</p>
                          )}
                          {action.triggerSituation && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500">
                                きっかけ:
                              </span>
                              <p className="text-sm">
                                {action.triggerSituation}
                              </p>
                            </div>
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* フィルターダイアログ */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>記録のフィルター</DialogTitle>
            <DialogDescription>表示する記録を絞り込みます</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="filter-date"
                className="block text-sm font-medium text-gray-700"
              >
                日付
              </label>
              <Input
                id="filter-date"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="filter-category"
                className="block text-sm font-medium text-gray-700"
              >
                カテゴリー
              </label>
              <select
                id="filter-category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">すべて</option>
                {CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetFilters}>
              リセット
            </Button>
            <Button onClick={applyFilters}>適用</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 分析ダイアログ */}
      <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>衝動行動の分析</DialogTitle>
            <DialogDescription>あなたの衝動行動の統計と傾向</DialogDescription>
          </DialogHeader>
          {!statsData ? (
            <p className="text-center py-4">データを読み込み中...</p>
          ) : (
            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-lg font-medium">概要</h3>
                <p className="text-sm text-gray-500">
                  合計記録数: {statsData.totalCount}件
                </p>
                <p className="text-sm text-gray-500">
                  平均コスト: ¥
                  {statsData.averageCostPerImpulse.toLocaleString()}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">カテゴリー別統計</h3>
                <div className="mt-2 space-y-2">
                  {Object.entries(statsData.categoryBreakdown).map(
                    ([category, count]) => {
                      const percent = Math.round(
                        (count / statsData.totalCount) * 100
                      );
                      return (
                        <div key={category} className="flex items-center">
                          <div className="w-1/3 text-sm">
                            {CATEGORIES.find((c) => c.value === category)
                              ?.label || category}
                          </div>
                          <div className="w-2/3">
                            <div className="relative h-4 bg-gray-200 rounded-full">
                              <div
                                className="progress-bar progress-bar-blue"
                                data-percent={percent}
                              ></div>
                            </div>
                            <div className="text-xs text-right mt-1">
                              {count}件
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">感情別統計</h3>
                <div className="mt-2 space-y-2">
                  {Object.entries(statsData.emotionBreakdown).map(
                    ([emotion, count]) => {
                      const percent = Math.round(
                        (count / statsData.totalCount) * 100
                      );
                      return (
                        <div key={emotion} className="flex items-center">
                          <div className="w-1/3 text-sm">
                            {EMOTIONS.find((e) => e.value === emotion)?.label ||
                              emotion}
                          </div>
                          <div className="w-2/3">
                            <div className="relative h-4 bg-gray-200 rounded-full">
                              <div
                                className="progress-bar progress-bar-green"
                                data-percent={percent}
                              ></div>
                            </div>
                            <div className="text-xs text-right mt-1">
                              {count}件
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">月別コスト</h3>
                <div className="mt-2 space-y-2">
                  {Object.entries(statsData.monthlyCosts)
                    .sort((a, b) => b[0].localeCompare(a[0])) // 最新月を上に
                    .slice(0, 6) // 直近6ヶ月のみ表示
                    .map(([month, cost]) => (
                      <div key={month} className="flex items-center">
                        <div className="w-1/3 text-sm">
                          {month.replace("-", "年")}月
                        </div>
                        <div className="w-2/3">
                          <div className="text-sm font-medium">
                            ¥{cost.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">改善のためのヒント</h3>
                <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
                  <li>
                    {statsData.categoryBreakdown.shopping > 0
                      ? "買い物をする前に、本当に必要かどうか24時間考える時間を持ちましょう。"
                      : "新しい習慣を形成するために、衝動を感じたら別の活動に切り替えましょう。"}
                  </li>
                  <li>
                    {statsData.emotionBreakdown.boredom > 0 ||
                    statsData.emotionBreakdown.stress > 0
                      ? "退屈やストレスを感じたら、事前に計画した健全な対処法を実践しましょう。"
                      : "感情の変化に気づき、それをメモすることで自己理解を深めましょう。"}
                  </li>
                  <li>
                    衝動を感じた時の「きっかけ」「行動」「結果」の記録を続けることで、パターンが見えてきます。
                  </li>
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsAnalyticsOpen(false)}>閉じる</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImpulseTrackerPage;
