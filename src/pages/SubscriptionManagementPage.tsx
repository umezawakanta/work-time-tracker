import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  addSubscription,
  fetchSubscriptions,
  updateSubscription,
  deleteSubscription,
} from "@/store/subscriptionSlice";
import { Subscription } from "@/types/subscription";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  Pencil, 
  Trash, 
  ArrowUpDown, 
  CalendarDays, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  HelpCircle, 
  Clock, 
  Info, 
  AlertCircle,
  BarChart2,
  LockIcon
} from "lucide-react";
import { SubscriptionCharts } from "@/components/chart/SubscriptionCharts";
import { MonthlySubscriptionChart } from "@/components/chart/MonthlySubscriptionChart";

// サブスクリプション管理ガイドコンポーネント
const SubscriptionManagementGuide = () => {
  return (
    <Card className="mb-6">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <HelpCircle className="h-5 w-5" />
          サブスクリプション登録の手順
        </CardTitle>
        <CardDescription>
          カード利用履歴からサブスクリプションを簡単に登録する方法
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="step1">
            <AccordionTrigger className="text-lg font-medium">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500 text-white">ステップ 1</Badge>
                カード利用履歴の確認
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pl-10">
              <p className="text-gray-700">
                インターネットバンキングやクレジットカードアプリにログインして、最近の利用履歴を確認します。サブスクリプションの特徴として、毎月同じ日付・同じ金額で引き落とされるものを探します。
              </p>
              <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded">
                <Info className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">
                  過去3〜6ヶ月分の履歴を確認すると、四半期や半年ごとの引き落としも発見できます。
                </span>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="step2">
            <AccordionTrigger className="text-lg font-medium">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500 text-white">ステップ 2</Badge>
                サブスクリプション情報の記録
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pl-10">
              <p className="text-gray-700">
                発見したサブスクリプションごとに以下の情報を記録します：
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li><span className="font-medium">名称</span>：サービス名（例：「Netflix」「Spotify」）</li>
                <li><span className="font-medium">引き落とし日</span>：毎月の課金日（例：「2024/01/25」）</li>
                <li><span className="font-medium">種別</span>：カテゴリー（例：「動画」「音楽」「ソフトウェア」）</li>
                <li><span className="font-medium">金額</span>：毎月の支払額</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="step3">
            <AccordionTrigger className="text-lg font-medium">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500 text-white">ステップ 3</Badge>
                システムへの登録
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pl-10">
              <p className="text-gray-700">
                収集した情報を下記の登録フォームに入力します。種別ごとにまとめることで、後から分析がしやすくなります。
              </p>
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">
                  入力が完了したら「登録」ボタンをクリックします。登録されたサブスクリプションは一覧に表示されます。
                </span>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="step4">
            <AccordionTrigger className="text-lg font-medium">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500 text-white">ステップ 4</Badge>
                定期的な更新と確認
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pl-10">
              <p className="text-gray-700">
                毎月のカード明細が届いたら、登録済みのサブスクリプションと照合します。新しいサブスクリプションが見つかったら追加し、解約したものは削除します。
              </p>
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">
                  金額が変更されている場合は、該当するサブスクリプションを編集して最新の情報に更新してください。
                </span>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="bg-gray-50 flex justify-between">
        <p className="text-sm text-gray-500">
          効率的な管理で無駄なサブスクリプションを発見し、節約につなげましょう。
        </p>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <FileText className="h-4 w-4" />
            詳細ガイドを見る
          </Button>
        </DialogTrigger>
      </CardFooter>
    </Card>
  );
};

// 月次登録状況カレンダーコンポーネント
const MonthlyRegistrationStatus = ({ subscriptions }) => {
  // 現在の年を取得
  const currentYear = new Date().getFullYear();
  
  // 過去2年分のデータを表示
  const years = [currentYear, currentYear - 1, currentYear - 2];
  
  // 月ごとのサブスクリプション登録状況を計算
  const getMonthlyStatus = () => {
    const status = {};
    
    years.forEach(year => {
      status[year] = {};
      for (let month = 1; month <= 12; month++) {
        // 各月の状態を初期化
        const monthKey = `${month}`.padStart(2, '0');
        status[year][monthKey] = {
          registered: false,
          count: 0,
          totalAmount: 0
        };
      }
    });
    
    // サブスクリプションデータから登録状況を更新
    subscriptions.forEach(sub => {
      if (sub.billingDate) {
        const [subYear, subMonth] = sub.billingDate.split('/');
        
        if (status[subYear] && status[subYear][subMonth]) {
          status[subYear][subMonth].registered = true;
          status[subYear][subMonth].count += 1;
          status[subYear][subMonth].totalAmount += sub.amount;
        }
      }
    });
    
    return status;
  };
  
  const monthlyStatus = getMonthlyStatus();
  
  // 月の名前
  const monthNames = [
    "1月", "2月", "3月", "4月", "5月", "6月", 
    "7月", "8月", "9月", "10月", "11月", "12月"
  ];
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          サブスクリプション登録状況カレンダー
        </CardTitle>
        <CardDescription>
          月ごとのサブスクリプション登録状況を確認できます
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={currentYear.toString()} className="w-full">
          <TabsList className="mb-4">
            {years.map(year => (
              <TabsTrigger key={year} value={year.toString()}>
                {year}年
              </TabsTrigger>
            ))}
          </TabsList>
          
          {years.map(year => (
            <TabsContent key={year} value={year.toString()}>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {monthNames.map((name, index) => {
                  const monthKey = `${index + 1}`.padStart(2, '0');
                  const status = monthlyStatus[year][monthKey];
                  
                  return (
                    <Card key={`${year}-${monthKey}`} className={`
                      ${status.registered ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}
                    `}>
                      <CardHeader className="py-3 px-4">
                        <CardTitle className="text-base flex justify-between items-center">
                          <span>{name}</span>
                          {status.registered ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-300" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        {status.registered ? (
                          <div className="space-y-1">
                            <p className="text-sm flex justify-between">
                              <span>登録数:</span>
                              <span className="font-medium">{status.count}件</span>
                            </p>
                            <p className="text-sm flex justify-between">
                              <span>合計:</span>
                              <span className="font-medium">{status.totalAmount.toLocaleString()}円</span>
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">未登録</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

// メインコンポーネント
export default function SubscriptionManagementPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { subscriptions, status, error } = useSelector(
    (state: RootState) => state.subscription
  );

  const [newSubscription, setNewSubscription] = useState<
    Omit<Subscription, "_id">
  >({
    name: "",
    billingDate: "",
    type: "",
    amount: 0,
  });

  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showGuide, setShowGuide] = useState(true);
  const [activeTab, setActiveTab] = useState("manage");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchSubscriptions());
    }
  }, [status, dispatch]);

  const handleSubscriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubscription) {
        await dispatch(
          updateSubscription({
            _id: editingSubscription._id,
            subscription: newSubscription,
          })
        ).unwrap();
        setEditingSubscription(null);
      } else {
        await dispatch(addSubscription(newSubscription)).unwrap();
      }
      setNewSubscription({
        name: "",
        billingDate: "",
        type: "",
        amount: 0,
      });
    } catch (err) {
      console.error("Failed to save the subscription: ", err);
    }
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setNewSubscription({
      name: subscription.name,
      billingDate: subscription.billingDate,
      type: subscription.type,
      amount: subscription.amount,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteSubscription(id)).unwrap();
    } catch (err) {
      console.error("Failed to delete the subscription: ", err);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const sortedAndFilteredSubscriptions = subscriptions
    .filter((sub) => {
      const monthFilter = filterMonth === "all" || (() => {
        const [year, month] = sub.billingDate.split("/");
        return `${year}/${month}` === filterMonth;
      })();
      const typeFilter = filterType === "all" || sub.type === filterType;
      return monthFilter && typeFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.billingDate.replace(/\//g, "-"));
      const dateB = new Date(b.billingDate.replace(/\//g, "-"));
      return sortOrder === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });

  const totalAmount = sortedAndFilteredSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  const uniqueMonths = Array.from(
    new Set(
      subscriptions.map((sub) => {
        const [year, month] = sub.billingDate.split("/");
        return `${year}/${month}`;
      })
    )
  ).sort();

  const uniqueTypes = Array.from(
    new Set(subscriptions.map((sub) => sub.type))
  ).sort();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <Alert variant="destructive">
        <AlertTitle>エラー</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // 毎月の合計サブスク金額
  const monthlyTotal = subscriptions.reduce((total, sub) => {
    return total + sub.amount;
  }, 0);

  // 詳細ガイドのダイアログコンテンツ
  const detailedGuideContent = (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl">サブスクリプション管理の詳細ガイド</DialogTitle>
        <DialogDescription>
          効率的にサブスクリプションを管理して無駄な支出を削減しましょう
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6 py-4">
        <div>
          <h3 className="text-lg font-medium">カード明細からサブスクリプションを見つける方法</h3>
          <div className="mt-2 space-y-2">
            <p>サブスクリプションは以下の特徴があります：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>毎月同じ日付または同じ周期で引き落とされる</li>
              <li>金額が同一または非常に近い</li>
              <li>サービス提供会社名や識別名が表示される</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-50 rounded-md">
              <p className="font-medium text-blue-700">具体的な探し方：</p>
              <ol className="list-decimal pl-5 space-y-1 mt-1">
                <li>3ヶ月分の明細を並べて比較する</li>
                <li>同じ金額の引き落としを探す</li>
                <li>不明な請求は検索エンジンで会社名を調べる</li>
                <li>メールボックスで「サブスクリプション」「定期購入」などで検索</li>
              </ol>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium">登録時のヒント</h3>
          <div className="mt-2 space-y-2">
            <p>効率的な管理のために以下の点に注意してください：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-medium">名称の統一</span>：同じサービスは同じ名前で登録（例：「Netflix」「ネットフリックス」ではなく一貫して「Netflix」）</li>
              <li><span className="font-medium">種別の分類</span>：カテゴリーを一貫して使用（例：「動画サービス」「ビデオ」ではなく「動画」で統一）</li>
              <li><span className="font-medium">引き落とし日の正確な入力</span>：「2024/01/15」のようにYYYY/MM/DD形式で入力</li>
              <li><span className="font-medium">税込金額</span>：実際に引き落とされる金額（税込）を入力</li>
            </ul>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium">分析と最適化</h3>
          <div className="mt-2 space-y-2">
            <p>登録したデータを活用して支出を最適化しましょう：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>種別ごとの合計金額を確認し、優先順位の低いカテゴリーの解約を検討</li>
              <li>利用頻度の低いサービスを特定し、解約または一時停止</li>
              <li>同じカテゴリーの重複サービスを見直す（例：複数の音楽サービス）</li>
              <li>年払いに変更すると割引があるサービスを探す</li>
            </ul>
          </div>
        </div>
        
        <div className="p-4 bg-green-50 rounded-md border border-green-200">
          <h3 className="text-lg font-medium flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            プロのヒント
          </h3>
          <div className="mt-2 space-y-2">
            <p>サブスクリプション見直しのスケジュールを設定しましょう：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>毎月の明細確認時に新規サブスクリプションを登録</li>
              <li>四半期ごとに全サブスクリプションの利用状況を見直し</li>
              <li>年に一度、すべての続行可否を検討</li>
              <li>無料トライアル開始時に終了日をカレンダーに登録</li>
            </ul>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button>ガイドを印刷</Button>
      </DialogFooter>
    </DialogContent>
  );

  return (
    <div className="container mx-auto p-4">
      <Dialog>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">サブスクリプション管理</h1>
            <p className="text-gray-600">
              毎月の自動引き落とし金額: <span className="font-bold text-lg">{monthlyTotal.toLocaleString()}円</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => setShowGuide(!showGuide)}
            >
              {showGuide ? <XCircle className="h-4 w-4" /> : <HelpCircle className="h-4 w-4" />}
              {showGuide ? 'ガイドを隠す' : 'ガイドを表示'}
            </Button>
          </div>
        </div>

        {/* ガイド（表示/非表示切り替え可能） */}
        {showGuide && <SubscriptionManagementGuide />}

        {detailedGuideContent}

        {/* タブナビゲーション */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="manage" className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">サブスクリプション</span>
              <span className="sm:hidden">登録</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">登録状況</span>
              <span className="sm:hidden">状況</span>
            </TabsTrigger>
            <TabsTrigger value="chart" className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4" />
              <span className="hidden sm:inline">グラフ分析</span>
              <span className="sm:hidden">分析</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">履歴トラッカー</span>
              <span className="sm:hidden">履歴</span>
            </TabsTrigger>
          </TabsList>
          
          {/* 登録・管理タブ */}
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>サブスクリプション登録</CardTitle>
                <CardDescription>
                  カード明細から発見したサブスクリプションを登録してください
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubscriptionSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">名称</Label>
                      <Input
                        id="name"
                        value={newSubscription.name}
                        onChange={(e) =>
                          setNewSubscription({ ...newSubscription, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="billingDate">引き落とし日 (YYYY/MM/DD)</Label>
                      <Input
                        id="billingDate"
                        value={newSubscription.billingDate}
                        onChange={(e) =>
                          setNewSubscription({
                            ...newSubscription,
                            billingDate: e.target.value,
                          })
                        }
                        pattern="\d{4}/\d{2}/\d{2}"
                        placeholder="2024/01/01"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">種別</Label>
                      <Input
                        id="type"
                        value={newSubscription.type}
                        onChange={(e) =>
                          setNewSubscription({ ...newSubscription, type: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">金額</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="1"
                        value={newSubscription.amount.toString()}
                        onChange={(e) =>
                          setNewSubscription({
                            ...newSubscription,
                            amount: e.target.value === "" ? 0 : parseInt(e.target.value, 10),
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">{editingSubscription ? "更新" : "登録"}</Button>
                    {editingSubscription && (
                      <Button type="button" variant="outline" onClick={() => {
                        setEditingSubscription(null);
                        setNewSubscription({
                          name: "",
                          billingDate: "",
                          type: "",
                          amount: 0,
                        });
                      }}>
                        キャンセル
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>サブスクリプション一覧</CardTitle>
                  <CardDescription>
                    登録されているサブスクリプションをフィルタリングして表示します
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <Button onClick={toggleSortOrder} variant="outline" className="flex-shrink-0">
                      引き落とし日でソート
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                      <Select value={filterMonth} onValueChange={setFilterMonth}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="月でフィルター" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全ての月</SelectItem>
                          {uniqueMonths.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="種別でフィルター" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全ての種別</SelectItem>
                          {uniqueTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mb-4 text-lg font-semibold">
                    {filterMonth === "all" ? "全ての月" : filterMonth}
                    {filterType !== "all" && `、${filterType}`}
                    のサブスクリプションの合計金額: {totalAmount.toLocaleString()}円
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>名称</TableHead>
                          <TableHead>引き落とし日</TableHead>
                          <TableHead>種別</TableHead>
                          <TableHead>金額</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedAndFilteredSubscriptions.length > 0 ? (
                          sortedAndFilteredSubscriptions.map((sub) => (
                            <TableRow key={sub._id}>
                              <TableCell>{sub.name}</TableCell>
                              <TableCell>{sub.billingDate}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{sub.type}</Badge>
                              </TableCell>
                              <TableCell>{sub.amount.toLocaleString()}円</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(sub)}
                                  >
                                    <Pencil size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(sub._id)}
                                  >
                                    <Trash size={16} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              表示するサブスクリプションがありません
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 登録状況カレンダータブ */}
          <TabsContent value="calendar">
            <MonthlyRegistrationStatus subscriptions={subscriptions} />

            <Card>
              <CardHeader>
                <CardTitle>月別登録状況の概要</CardTitle>
                <CardDescription>月ごとの登録進捗と未対応の月を確認できます</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">登録進捗状況</span>
                      <span className="text-sm font-medium">{uniqueMonths.length} / 36 ヶ月</span>
                    </div>
                    <Progress value={(uniqueMonths.length / 36) * 100} className="h-2" />
                  </div>

                  {uniqueMonths.length < 36 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <h3 className="text-yellow-800 font-medium flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5" />
                        未登録の月があります
                      </h3>
                      <p className="text-sm text-yellow-700 mb-2">
                        一部の月のサブスクリプション情報が登録されていません。過去のカード明細を確認して、すべての月のデータを登録することで、より正確な分析が可能になります。
                      </p>
                      <Button variant="outline" size="sm" className="text-yellow-800 border-yellow-300 bg-yellow-100 hover:bg-yellow-200">
                        未登録の月に移動
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* グラフ分析タブ */}
          <TabsContent value="chart">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>サブスクリプション分析</CardTitle>
                  <CardDescription>種別ごとの支出分布と月別推移</CardDescription>
                </CardHeader>
                <CardContent>
                  <SubscriptionCharts subscriptions={subscriptions} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>月別サブスクリプション推移</CardTitle>
                  <CardDescription>月ごとの支出推移を確認できます</CardDescription>
                </CardHeader>
                <CardContent>
                  <MonthlySubscriptionChart subscriptions={subscriptions} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 履歴トラッカータブ */}
          <TabsContent value="history">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>カード履歴確認ガイド</CardTitle>
                <CardDescription>
                  各カード会社の明細確認サイトへのリンクと確認手順
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-blue-800">
                      サブスクリプションを登録するには、まずカード明細を確認しましょう。以下の手順に従ってください：
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* クレジットカード会社の例 */}
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">三井住友カード</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <ol className="list-decimal list-inside text-sm space-y-1">
                          <li>三井住友カードのサイトにログイン</li>
                          <li>「ご利用明細」をクリック</li>
                          <li>確認したい月を選択</li>
                        </ol>
                        <Button variant="link" className="text-sm p-0 h-auto mt-2" size="sm">
                          三井住友カードサイトへ
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">楽天カード</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <ol className="list-decimal list-inside text-sm space-y-1">
                          <li>楽天eナビにログイン</li>
                          <li>「明細を見る」をクリック</li>
                          <li>確認したい月を選択</li>
                        </ol>
                        <Button variant="link" className="text-sm p-0 h-auto mt-2" size="sm">
                          楽天カードサイトへ
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">ビューカード</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <ol className="list-decimal list-inside text-sm space-y-1">
                          <li>ビューカードサイトにログイン</li>
                          <li>「ご利用明細」メニューをクリック</li>
                          <li>確認したい月を選択</li>
                        </ol>
                        <Button variant="link" className="text-sm p-0 h-auto mt-2" size="sm">
                          ビューカードサイトへ
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-medium mb-2">明細確認のヒント</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>過去3-6ヶ月分の明細を比較して定期的な支払いを見つけましょう</li>
                      <li>同じ金額で繰り返し請求されているものに注目してください</li>
                      <li>不明な請求は検索エンジンで調べると特定できることがあります</li>
                      <li>確認した月は上部の登録状況カレンダーにマークしておくと管理しやすくなります</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50">
                <Button variant="outline" size="sm" className="gap-1">
                  <FileText className="h-4 w-4" />
                  履歴確認チェックリストを表示
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>確認履歴</CardTitle>
                <CardDescription>
                  カード明細の確認履歴を記録して、どの月まで確認したかを管理できます
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  ※このセクションはプレミアム機能です。有料プランにアップグレードすると使用できるようになります。
                </p>
                <div className="bg-gray-100 border border-gray-200 rounded-md p-8 text-center">
                  <LockIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-500">プレミアム機能</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    確認履歴トラッカーはプレミアムプランでご利用いただけます
                  </p>
                  <Button>プレミアムにアップグレード</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Dialog>
    </div>
  );
}