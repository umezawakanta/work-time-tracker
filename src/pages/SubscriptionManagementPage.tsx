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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  LockIcon,
  ExternalLink,
  PlusCircle,
  LightbulbIcon,
  CheckCheck,
  Building,
  DollarSign,
  SmartphoneIcon,
  SparklesIcon,
  PlusIcon,
  CrownIcon,
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
                <li>
                  <span className="font-medium">名称</span>
                  ：サービス名（例：「Netflix」「Spotify」）
                </li>
                <li>
                  <span className="font-medium">引き落とし日</span>
                  ：毎月の課金日（例：「2024/01/25」）
                </li>
                <li>
                  <span className="font-medium">種別</span>
                  ：カテゴリー（例：「動画」「音楽」「ソフトウェア」）
                </li>
                <li>
                  <span className="font-medium">金額</span>：毎月の支払額
                </li>
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

    years.forEach((year) => {
      status[year] = {};
      for (let month = 1; month <= 12; month++) {
        // 各月の状態を初期化
        const monthKey = `${month}`.padStart(2, "0");
        status[year][monthKey] = {
          registered: false,
          count: 0,
          totalAmount: 0,
        };
      }
    });

    // サブスクリプションデータから登録状況を更新
    subscriptions.forEach((sub) => {
      if (sub.billingDate) {
        const [subYear, subMonth] = sub.billingDate.split("/");

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
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
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
            {years.map((year) => (
              <TabsTrigger key={year} value={year.toString()}>
                {year}年
              </TabsTrigger>
            ))}
          </TabsList>

          {years.map((year) => (
            <TabsContent key={year} value={year.toString()}>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {monthNames.map((name, index) => {
                  const monthKey = `${index + 1}`.padStart(2, "0");
                  const status = monthlyStatus[year][monthKey];

                  return (
                    <Card
                      key={`${year}-${monthKey}`}
                      className={`
                      ${
                        status.registered
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200 bg-gray-50"
                      }
                    `}
                    >
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
                              <span className="font-medium">
                                {status.count}件
                              </span>
                            </p>
                            <p className="text-sm flex justify-between">
                              <span>合計:</span>
                              <span className="font-medium">
                                {status.totalAmount.toLocaleString()}円
                              </span>
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
  // 新規ステート
  const [selectedBankAccount, setSelectedBankAccount] = useState("smbc_main");
  const [paymentSource, setPaymentSource] = useState("all"); // "all", "credit", "bank"
  const [checkStatus, setCheckStatus] = useState("all"); // "all", "checked", "unchecked"

  const [newSubscription, setNewSubscription] = useState<
    Omit<Subscription, "_id">
  >({
    name: "",
    billingDate: "",
    type: "",
    amount: 0,
    paymentMethod: "credit", // 新規フィールド: "credit", "bank", "paypal", "apple", "google"
    bankAccount: null, // 新規フィールド: 銀行口座ID
    checkedMonths: [], // 新規フィールド: 確認済み月のリスト ["2024/01", "2024/02", ...]
    isActive: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // サブスクリプション登録時に選択した支払い方法を設定
  const handlePaymentMethodChange = (method) => {
    setNewSubscription({
      ...newSubscription,
      paymentMethod: method,
      bankAccount: method === "bank" ? selectedBankAccount : null,
    });
  };

  // 未確認月のモックデータ
  const unregisteredMonths = [
    "2024/01",
    "2023/11",
    "2023/10",
    "2023/06",
    "2023/05",
  ];

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
        isActive: true,
        expiresAt: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
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
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
      const monthFilter =
        filterMonth === "all" ||
        (() => {
          const [year, month] = sub.billingDate.split("/");
          return `${year}/${month}` === filterMonth;
        })();
      const typeFilter = filterType === "all" || sub.type === filterType;

      // Add check status filter
      const checkFilter =
        checkStatus === "all" ||
        (checkStatus === "checked" && (sub.checkedMonths?.length ?? 0) > 0) ||
        (checkStatus === "unchecked" &&
          (!sub.checkedMonths || sub.checkedMonths?.length === 0));

      // 支払い方法フィルター
      const paymentFilter =
        paymentSource === "all" || sub.paymentMethod === paymentSource;

      // 最終的なフィルター適用
      return monthFilter && typeFilter && checkFilter && paymentFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.billingDate.replace(/\//g, "-"));
      const dateB = new Date(b.billingDate.replace(/\//g, "-"));
      return sortOrder === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });

  const totalAmount = sortedAndFilteredSubscriptions.reduce(
    (sum, sub) => sum + sub.amount,
    0
  );

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
        <DialogTitle className="text-2xl">
          サブスクリプション管理の詳細ガイド
        </DialogTitle>
        <DialogDescription>
          効率的にサブスクリプションを管理して無駄な支出を削減しましょう
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        <div>
          <h3 className="text-lg font-medium">
            カード明細からサブスクリプションを見つける方法
          </h3>
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
                <li>
                  メールボックスで「サブスクリプション」「定期購入」などで検索
                </li>
              </ol>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium">登録時のヒント</h3>
          <div className="mt-2 space-y-2">
            <p>効率的な管理のために以下の点に注意してください：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="font-medium">名称の統一</span>
                ：同じサービスは同じ名前で登録（例：「Netflix」「ネットフリックス」ではなく一貫して「Netflix」）
              </li>
              <li>
                <span className="font-medium">種別の分類</span>
                ：カテゴリーを一貫して使用（例：「動画サービス」「ビデオ」ではなく「動画」で統一）
              </li>
              <li>
                <span className="font-medium">引き落とし日の正確な入力</span>
                ：「2024/01/15」のようにYYYY/MM/DD形式で入力
              </li>
              <li>
                <span className="font-medium">税込金額</span>
                ：実際に引き落とされる金額（税込）を入力
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium">分析と最適化</h3>
          <div className="mt-2 space-y-2">
            <p>登録したデータを活用して支出を最適化しましょう：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                種別ごとの合計金額を確認し、優先順位の低いカテゴリーの解約を検討
              </li>
              <li>利用頻度の低いサービスを特定し、解約または一時停止</li>
              <li>
                同じカテゴリーの重複サービスを見直す（例：複数の音楽サービス）
              </li>
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

  // 銀行アカウント選択コンポーネント
  const BankAccountSelector = ({ selectedAccount, onSelectAccount }) => {
    // 登録済み銀行口座リスト
    const bankAccounts = [
      {
        id: "smbc_main",
        name: "三井住友銀行 (メイン口座)",
        type: "普通",
        accountNumber: "1234567",
        url: "direct3.smbc.co.jp/ib/web/top/TPALTOPaccountFutsuDetail.smbc",
      },
      {
        id: "mizuho_savings",
        name: "みずほ銀行",
        type: "普通",
        accountNumber: "7654321",
        url: "web.ib.mizuhobank.co.jp/servlet/LOGBNK0000000B.do",
      },
      {
        id: "japan_post",
        name: "ゆうちょ銀行",
        type: "普通",
        accountNumber: "00123456789",
        url: "direct.jp-bank.japanpost.jp/tp1web/U010101SCK.do?link_id=ycZc",
      },
    ];

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            登録済み口座
          </CardTitle>
          <CardDescription>
            サブスクリプションの引き落とし元となる口座を選択してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className={`p-4 border rounded-lg cursor-pointer ${
                  selectedAccount === account.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/30"
                }`}
                onClick={() => onSelectAccount(account.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{account.name}</h3>
                    <p className="text-sm text-gray-600">
                      {account.type}：{account.accountNumber.substring(0, 3)}
                      ＊＊＊＊
                      {account.accountNumber.substring(
                        account.accountNumber.length - 2
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={`https://${account.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      ログイン
                    </a>
                    {selectedAccount === account.id && (
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 rounded-b-lg">
          <Button variant="outline" size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            新しい口座を追加
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // 登録月確認リマインダーコンポーネント
  const RegistrationReminderCard = ({ unregisteredMonths }) => {
    return (
      <Card className="mb-6 border-amber-200">
        <CardHeader className="bg-amber-50">
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            未確認月のサブスクリプション
          </CardTitle>
          <CardDescription className="text-amber-700">
            過去の引き落とし履歴を確認して、サブスクリプション登録を完了しましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm">
              以下の月の引き落とし履歴をまだ確認していません。オンラインバンキングで確認し、サブスクリプションを登録してください。
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {unregisteredMonths.map((month) => (
                <div
                  key={month}
                  className="p-2 border border-amber-200 rounded bg-amber-50 text-center"
                >
                  <span className="text-amber-800 font-medium">{month}</span>
                </div>
              ))}
            </div>

            <div className="bg-amber-100/50 p-3 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-800 flex items-center gap-1 mb-1">
                <LightbulbIcon className="h-4 w-4" />
                ヒント
              </h4>
              <p className="text-sm text-amber-700">
                オンラインバンキングでは「定期的な引き落とし」や「自動支払い」などの項目を確認すると、サブスクリプションを見つけやすくなります。
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between bg-gray-50 rounded-b-lg">
          <Button variant="outline" size="sm" className="gap-1">
            <CalendarDays className="h-4 w-4" />
            すべての月を表示
          </Button>
          <Button className="gap-1 bg-amber-600 hover:bg-amber-700">
            <CheckCheck className="h-4 w-4" />
            確認済みとしてマーク
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // 支払い方法タグコンポーネント
  const PaymentMethodTag = ({ method }) => {
    const methods = {
      credit: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <CreditCard className="h-3 w-3 mr-1" />,
      },
      bank: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <Building className="h-3 w-3 mr-1" />,
      },
      paypal: {
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        icon: <DollarSign className="h-3 w-3 mr-1" />,
      },
      apple: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <SmartphoneIcon className="h-3 w-3 mr-1" />,
      },
      google: {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: <SmartphoneIcon className="h-3 w-3 mr-1" />,
      },
    };

    const { color, icon } = methods[method] || methods.credit;

    return (
      <Badge
        variant="outline"
        className={`${color} flex items-center text-xs font-normal py-0.5 px-1.5`}
      >
        {icon}
        {method === "credit"
          ? "カード"
          : method === "bank"
          ? "銀行振替"
          : method === "paypal"
          ? "PayPal"
          : method === "apple"
          ? "Apple"
          : method === "google"
          ? "Google"
          : method}
      </Badge>
    );
  };

  // スマート提案コンポーネント
  const SmartSuggestions = () => {
    const suggestedServices = [
      {
        name: "Amazon Prime",
        description: "月額¥500、年払いで¥4,900 (18%お得)",
        logo: "/images/amazon-logo.png",
        color: "#FF9900",
        type: "動画/ショッピング",
      },
      {
        name: "Netflix",
        description: "スタンダードプラン ¥1,490/月",
        logo: "/images/netflix-logo.png",
        color: "#E50914",
        type: "動画",
      },
      {
        name: "Spotify",
        description: "プレミアムプラン ¥980/月",
        logo: "/images/spotify-logo.png",
        color: "#1DB954",
        type: "音楽",
      },
    ];

    // 色をTailwindの定義済みカラークラスにマッピングする関数
    function getColorClass(color, opacity = 20) {
      // よく使われる色のマッピング
      const colorMap = {
        "#FF9900": "bg-amber-500",
        "#E50914": "bg-red-600",
        "#1DB954": "bg-green-500",
        "#4285F4": "bg-blue-500",
        "#EA4335": "bg-red-500",
        "#FBBC05": "bg-yellow-500",
        "#34A853": "bg-green-500",
        // 他の色を必要に応じて追加
      };

      // 透明度のマッピング
      const opacityClass = {
        10: "bg-opacity-10",
        20: "bg-opacity-20",
        30: "bg-opacity-30",
        40: "bg-opacity-40",
        50: "bg-opacity-50",
        // 他の透明度を必要に応じて追加
      };

      // マッピングされた色があればそれを使用、なければデフォルトの色を使用
      const bgClass = colorMap[color] || "bg-gray-500";
      const opacityValue = opacityClass[opacity] || "bg-opacity-20";

      return `${bgClass} ${opacityValue}`;
    }

    return (
      <Card className="border-blue-200 mb-6">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <SparklesIcon className="h-5 w-5 text-blue-600" />
            よくあるサブスクリプションの候補
          </CardTitle>
          <CardDescription className="text-blue-600">
            登録されていない一般的なサブスクリプションです
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestedServices.map((service) => (
              <div
                key={service.name}
                className="flex items-center p-3 border rounded-lg hover:bg-blue-50/30 hover:border-blue-200 cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-full mr-4 flex items-center justify-center ${getColorClass(
                    service.color,
                    20
                  )}`}
                >
                  {service.logo ? (
                    <img
                      src={service.logo}
                      alt={service.name}
                      className="w-6 h-6"
                    />
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${getColorClass(
                        service.color
                      )}`}
                    >
                      <span className="text-white font-bold">
                        {service.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="font-medium">{service.name}</h3>
                    <Badge className="ml-2 text-xs bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {service.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Dialog>
        {detailedGuideContent}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">サブスクリプション管理</h1>
            <p className="text-gray-600">
              毎月の自動引き落とし金額:{" "}
              <span className="font-bold text-lg">
                {monthlyTotal.toLocaleString()}円
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setShowGuide(!showGuide)}
            >
              {showGuide ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <HelpCircle className="h-4 w-4" />
              )}
              {showGuide ? "ガイドを隠す" : "ガイドを表示"}
            </Button>
          </div>
        </div>

        {/* ガイド */}
        {showGuide && <SubscriptionManagementGuide />}

        {/* 未確認月リマインダー */}
        <RegistrationReminderCard unregisteredMonths={unregisteredMonths} />

        {/* タブナビゲーション */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="manage" className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">サブスク</span>
              <span className="sm:hidden">登録</span>
            </TabsTrigger>
            <TabsTrigger value="bank" className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">銀行口座</span>
              <span className="sm:hidden">口座</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">登録状況</span>
              <span className="sm:hidden">状況</span>
            </TabsTrigger>
            <TabsTrigger value="chart" className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4" />
              <span className="hidden sm:inline">分析</span>
              <span className="sm:hidden">分析</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">履歴</span>
              <span className="sm:hidden">履歴</span>
            </TabsTrigger>
          </TabsList>

          {/* 登録・管理タブ */}
          <TabsContent value="manage">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左側：登録フォーム */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>サブスクリプション登録</CardTitle>
                    <CardDescription>
                      カード明細や銀行口座から発見したサブスクリプションを登録してください
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleSubscriptionSubmit}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">名称</Label>
                          <Input
                            id="name"
                            value={newSubscription.name}
                            onChange={(e) =>
                              setNewSubscription({
                                ...newSubscription,
                                name: e.target.value,
                              })
                            }
                            placeholder="例：Netflix、Spotify"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingDate">
                            引き落とし日 (YYYY/MM/DD)
                          </Label>
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
                              setNewSubscription({
                                ...newSubscription,
                                type: e.target.value,
                              })
                            }
                            placeholder="例：動画、音楽、ソフトウェア"
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
                                amount:
                                  e.target.value === ""
                                    ? 0
                                    : parseInt(e.target.value, 10),
                              })
                            }
                            placeholder="月額金額（税込）"
                            required
                          />
                        </div>
                      </div>

                      {/* 支払い方法選択 */}
                      <div>
                        <Label className="mb-2 block">支払い方法</Label>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant={
                              newSubscription.paymentMethod === "credit"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className="gap-1"
                            onClick={() => handlePaymentMethodChange("credit")}
                          >
                            <CreditCard className="h-4 w-4" />
                            クレジットカード
                          </Button>
                          <Button
                            type="button"
                            variant={
                              newSubscription.paymentMethod === "bank"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className="gap-1"
                            onClick={() => handlePaymentMethodChange("bank")}
                          >
                            <Building className="h-4 w-4" />
                            銀行口座振替
                          </Button>
                          <Button
                            type="button"
                            variant={
                              newSubscription.paymentMethod === "paypal"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className="gap-1"
                            onClick={() => handlePaymentMethodChange("paypal")}
                          >
                            <DollarSign className="h-4 w-4" />
                            PayPal
                          </Button>
                          <Button
                            type="button"
                            variant={
                              newSubscription.paymentMethod === "apple"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className="gap-1"
                            onClick={() => handlePaymentMethodChange("apple")}
                          >
                            <SmartphoneIcon className="h-4 w-4" />
                            Apple
                          </Button>
                          <Button
                            type="button"
                            variant={
                              newSubscription.paymentMethod === "google"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className="gap-1"
                            onClick={() => handlePaymentMethodChange("google")}
                          >
                            <SmartphoneIcon className="h-4 w-4" />
                            Google Play
                          </Button>
                        </div>
                      </div>

                      {/* 銀行口座選択（銀行振替の場合のみ表示） */}
                      {newSubscription.paymentMethod === "bank" && (
                        <div>
                          <Label className="mb-2 block">引き落とし口座</Label>
                          <Select
                            value={selectedBankAccount}
                            onValueChange={(value) => {
                              setSelectedBankAccount(value);
                              setNewSubscription({
                                ...newSubscription,
                                bankAccount: value,
                              });
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="口座を選択" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="smbc_main">
                                三井住友銀行 (メイン口座)
                              </SelectItem>
                              <SelectItem value="mizuho_savings">
                                みずほ銀行
                              </SelectItem>
                              <SelectItem value="japan_post">
                                ゆうちょ銀行
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button type="submit">
                          {editingSubscription ? "更新" : "登録"}
                        </Button>
                        {editingSubscription && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setEditingSubscription(null);
                              setNewSubscription({
                                name: "",
                                billingDate: "",
                                type: "",
                                amount: 0,
                                paymentMethod: "credit",
                                bankAccount: null,
                                checkedMonths: [],
                                isActive: true,
                                expiresAt: new Date(
                                  Date.now() + 30 * 24 * 60 * 60 * 1000
                                ).toISOString(),
                              });
                            }}
                          >
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
                        <div className="flex gap-2">
                          <Button
                            onClick={toggleSortOrder}
                            variant="outline"
                            className="flex-shrink-0"
                          >
                            引き落とし日でソート
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>

                          {/* 支払い方法フィルター */}
                          <Select
                            value={paymentSource}
                            onValueChange={setPaymentSource}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue placeholder="支払い方法" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                すべての支払い方法
                              </SelectItem>
                              <SelectItem value="credit">
                                クレジットカード
                              </SelectItem>
                              <SelectItem value="bank">銀行振替</SelectItem>
                              <SelectItem value="paypal">PayPal</SelectItem>
                              <SelectItem value="apple">Apple</SelectItem>
                              <SelectItem value="google">
                                Google Play
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          {/* 確認ステータスフィルター */}
                          <Select
                            value={checkStatus}
                            onValueChange={setCheckStatus}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue placeholder="確認ステータス" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                全ての確認状態
                              </SelectItem>
                              <SelectItem value="checked">確認済み</SelectItem>
                              <SelectItem value="unchecked">未確認</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                          <Select
                            value={filterMonth}
                            onValueChange={setFilterMonth}
                          >
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
                          <Select
                            value={filterType}
                            onValueChange={setFilterType}
                          >
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
                        のサブスクリプションの合計金額:{" "}
                        {totalAmount.toLocaleString()}円
                      </div>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>名称</TableHead>
                              <TableHead>引き落とし日</TableHead>
                              <TableHead>支払い方法</TableHead>
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
                                    <PaymentMethodTag
                                      method={sub.paymentMethod || "credit"}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{sub.type}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    {sub.amount.toLocaleString()}円
                                  </TableCell>
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
                                <TableCell
                                  colSpan={6}
                                  className="text-center py-8 text-gray-500"
                                >
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
              </div>

              {/* 右側：サジェスト */}
              <div>
                <SmartSuggestions />

                {/* プレミアム機能案内 */}
                <Card className="border-amber-200 bg-gradient-to-tr from-amber-50 to-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CrownIcon className="h-5 w-5 text-amber-500" />
                      プレミアム機能
                    </CardTitle>
                    <CardDescription>
                      有料プランでより多くの機能にアクセス
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">銀行引き落とし自動検出</h4>
                        <p className="text-sm text-gray-600">
                          銀行口座の明細を分析し、サブスクリプションを自動で検出します
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">予算計画と節約提案</h4>
                        <p className="text-sm text-gray-600">
                          毎月のサブスク予算を設定し、最適化のアドバイスを受け取れます
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">リマインダーとアラート</h4>
                        <p className="text-sm text-gray-600">
                          無料トライアル終了前や価格変更時に通知を受け取れます
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-amber-600 hover:bg-amber-700">
                      プレミアムにアップグレード
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 銀行口座タブ */}
          <TabsContent value="bank">
            <BankAccountSelector
              selectedAccount={selectedBankAccount}
              onSelectAccount={setSelectedBankAccount}
            />

            <Card>
              <CardHeader>
                <CardTitle>オンラインバンキング情報</CardTitle>
                <CardDescription>
                  各銀行のオンラインバンキングへのリンクと確認手順
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-blue-800">
                      銀行口座からのサブスクリプション引き落としを確認するには、各銀行のオンラインバンキングにログインして明細を確認してください。
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* 三井住友銀行 */}
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Building className="h-4 w-4 text-blue-600" />
                          三井住友銀行
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <ol className="list-decimal list-inside text-sm space-y-1">
                          <li>SMBCダイレクトにログイン</li>
                          <li>「残高照会・入出金明細」を選択</li>
                          <li>該当口座を選択し、「入出金明細」をクリック</li>
                          <li>「照会する」ボタンをクリック</li>
                        </ol>
                        <div className="mt-2">
                          <a
                            href="https://direct3.smbc.co.jp/ib/web/top/TPALTOPaccountFutsuDetail.smbc"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            SMBCダイレクトへ
                          </a>
                        </div>
                      </CardContent>
                    </Card>

                    {/* みずほ銀行 */}
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Building className="h-4 w-4 text-blue-600" />
                          みずほ銀行
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <ol className="list-decimal list-inside text-sm space-y-1">
                          <li>みずほダイレクトにログイン</li>
                          <li>「入出金明細照会」をクリック</li>
                          <li>照会したい口座を選択</li>
                          <li>「照会」ボタンをクリック</li>
                        </ol>
                        <div className="mt-2">
                          <a
                            href="https://web.ib.mizuhobank.co.jp/servlet/LOGBNK0000000B.do"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            みずほダイレクトへ
                          </a>
                        </div>
                      </CardContent>
                    </Card>

                    {/* ゆうちょ銀行 */}
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Building className="h-4 w-4 text-blue-600" />
                          ゆうちょ銀行
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <ol className="list-decimal list-inside text-sm space-y-1">
                          <li>ゆうちょダイレクトにログイン</li>
                          <li>「入出金明細照会」を選択</li>
                          <li>照会範囲を指定</li>
                          <li>「照会」ボタンをクリック</li>
                        </ol>
                        <div className="mt-2">
                          <a
                            href="https://direct.jp-bank.japanpost.jp/tp1web/U010101SCK.do?link_id=ycZc"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            ゆうちょダイレクトへ
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-medium mb-2">
                      銀行口座からサブスクリプションを見つけるには
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>月ごとに同じ日付で同じ金額の引き落としを確認する</li>
                      <li>
                        「自動支払」「自動引落」などの表記がある取引に注目する
                      </li>
                      <li>
                        引き落とし元の事業者名で検索すると、対応するサービスが分かることが多い
                      </li>
                      <li>
                        不明な引き落としはメールボックスで「ご利用のお知らせ」などを検索してみる
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 登録状況カレンダータブ */}
          <TabsContent value="calendar">
            <MonthlyRegistrationStatus subscriptions={subscriptions} />

            <Card>
              <CardHeader>
                <CardTitle>月別登録状況の概要</CardTitle>
                <CardDescription>
                  月ごとの登録進捗と未対応の月を確認できます
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">登録進捗状況</span>
                      <span className="text-sm font-medium">
                        {uniqueMonths.length} / 36 ヶ月
                      </span>
                    </div>
                    <Progress
                      value={(uniqueMonths.length / 36) * 100}
                      className="h-2"
                    />
                  </div>

                  {uniqueMonths.length < 36 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <h3 className="text-yellow-800 font-medium flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5" />
                        未登録の月があります
                      </h3>
                      <p className="text-sm text-yellow-700 mb-2">
                        一部の月のサブスクリプション情報が登録されていません。過去のカード明細と銀行口座明細を確認して、すべての月のデータを登録することで、より正確な分析が可能になります。
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-yellow-800 border-yellow-300 bg-yellow-100 hover:bg-yellow-200"
                        >
                          未登録の月に移動
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <CalendarDays className="h-4 w-4" />
                          確認カレンダーを表示
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* 支払い方法別月次登録状況 */}
                  <div className="pt-4">
                    <h3 className="font-medium mb-3">支払い方法別の登録状況</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-blue-600" />
                            クレジットカード決済
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>登録済み月</span>
                              <span className="font-medium">12/36 月</span>
                            </div>
                            <Progress value={(12 / 36) * 100} className="h-2" />
                            <p className="text-xs text-gray-500">
                              未登録月: 2024/01, 2023/11, 2023/10...
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Building className="h-4 w-4 text-green-600" />
                            銀行口座振替
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>登録済み月</span>
                              <span className="font-medium">8/36 月</span>
                            </div>
                            <Progress value={(8 / 36) * 100} className="h-2" />
                            <p className="text-xs text-gray-500">
                              未登録月: 2024/01, 2023/11, 2023/06...
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* グラフ分析タブとヒストリータブは前回のコードとほぼ同じため省略 */}
          <TabsContent value="chart">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>サブスクリプション分析</CardTitle>
                  <CardDescription>
                    種別ごとの支出分布と月別推移
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SubscriptionCharts subscriptions={subscriptions} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>支払い方法別分析</CardTitle>
                  <CardDescription>支払い方法ごとの金額分布</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <div className="max-w-md w-full text-center">
                      <div className="text-sm text-gray-500 mb-4">
                        支払い方法ごとの月額合計
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                          <CreditCard className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                          <div className="text-xl font-bold">8,500円</div>
                          <div className="text-xs text-gray-600">
                            クレジットカード
                          </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                          <Building className="h-5 w-5 text-green-600 mx-auto mb-1" />
                          <div className="text-xl font-bold">4,200円</div>
                          <div className="text-xs text-gray-600">銀行振替</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                          <DollarSign className="h-4 w-4 text-indigo-600 mx-auto mb-1" />
                          <div className="text-lg font-bold">1,500円</div>
                          <div className="text-xs text-gray-600">PayPal</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <SmartphoneIcon className="h-4 w-4 text-gray-600 mx-auto mb-1" />
                          <div className="text-lg font-bold">980円</div>
                          <div className="text-xs text-gray-600">Apple</div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                          <SmartphoneIcon className="h-4 w-4 text-orange-600 mx-auto mb-1" />
                          <div className="text-lg font-bold">650円</div>
                          <div className="text-xs text-gray-600">Google</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>月別サブスクリプション推移</CardTitle>
                  <CardDescription>
                    月ごとの支出推移を確認できます
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MonthlySubscriptionChart subscriptions={subscriptions} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>カード・銀行口座履歴確認</CardTitle>
                <CardDescription>
                  各金融機関の明細確認サイトへのリンクと確認手順
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* コンテンツは前回のコードとほぼ同じ */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>確認履歴</CardTitle>
                <CardDescription>
                  カード明細と銀行口座の確認履歴を記録して、どの月まで確認したかを管理できます
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  ※このセクションはプレミアム機能です。有料プランにアップグレードすると使用できるようになります。
                </p>
                <div className="bg-gray-100 border border-gray-200 rounded-md p-8 text-center">
                  <LockIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-500">
                    プレミアム機能
                  </h3>
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
