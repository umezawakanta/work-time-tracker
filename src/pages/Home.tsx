import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  BarChart2,
  LineChart,
  Calendar,
  Database,
  FileText,
  UserCircle,
  Activity,
  Eye,
  Briefcase,
  Twitter,
  Moon,
  PieChart,
  TrendingUp,
  Users,
  CheckCircle,
  Crown,
  Lock,
  Sparkles,
  Star,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { setTrialActivated } from "@/store/userSlice";
import BalanceUpdateReminder from "@/components/BalanceUpdateReminder";
import DailyTodoReminder from "@/components/dailyToDoReminder/DailyTodoReminder";
import HabitTracker from "@/components/habitTracker/HabitTracker";
import {
  FeatureCard,
  FeatureCardVariant,
  PricingCard,
} from "@/components/FeatureCard"; // 改善版コンポーネントのインポート

// プラン比較コンポーネント
const PlanComparisonTable = () => (
  <div className="w-full overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="text-left p-3 border-b-2 border-gray-200"></th>
          <th className="text-center p-3 border-b-2 border-gray-200">
            無料プラン
          </th>
          <th className="text-center p-3 border-b-2 border-amber-200 bg-amber-50">
            <div className="flex items-center justify-center gap-2">
              <Crown className="h-5 w-5 text-amber-600" aria-hidden="true" />
              <span className="text-amber-800">プレミアムプラン</span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="p-3 border-b border-gray-200 font-medium">
            作業時間トラッキング
          </td>
          <td className="text-center p-3 border-b border-gray-200">
            <CheckCircle
              className="inline h-5 w-5 text-green-500"
              aria-hidden="true"
            />
            <span className="ml-2">基本機能</span>
          </td>
          <td className="text-center p-3 border-b border-amber-100 bg-amber-50">
            <CheckCircle
              className="inline h-5 w-5 text-green-600"
              aria-hidden="true"
            />
            <span className="ml-2">高度な分析機能付き</span>
          </td>
        </tr>
        <tr>
          <td className="p-3 border-b border-gray-200 font-medium">ToDo管理</td>
          <td className="text-center p-3 border-b border-gray-200">
            <CheckCircle
              className="inline h-5 w-5 text-green-500"
              aria-hidden="true"
            />
            <span className="ml-2">最大10件</span>
          </td>
          <td className="text-center p-3 border-b border-amber-100 bg-amber-50">
            <CheckCircle
              className="inline h-5 w-5 text-green-600"
              aria-hidden="true"
            />
            <span className="ml-2">無制限 + カテゴリ分け</span>
          </td>
        </tr>
        <tr>
          <td className="p-3 border-b border-gray-200 font-medium">資産管理</td>
          <td className="text-center p-3 border-b border-gray-200">
            <CheckCircle
              className="inline h-5 w-5 text-green-500"
              aria-hidden="true"
            />
            <span className="ml-2">基本記録のみ</span>
          </td>
          <td className="text-center p-3 border-b border-amber-100 bg-amber-50">
            <CheckCircle
              className="inline h-5 w-5 text-green-600"
              aria-hidden="true"
            />
            <span className="ml-2">詳細分析 + ポートフォリオ</span>
          </td>
        </tr>
        <tr>
          <td className="p-3 border-b border-gray-200 font-medium">睡眠管理</td>
          <td className="text-center p-3 border-b border-gray-200">
            <CheckCircle
              className="inline h-5 w-5 text-green-500"
              aria-hidden="true"
            />
            <span className="ml-2">基本記録</span>
          </td>
          <td className="text-center p-3 border-b border-amber-100 bg-amber-50">
            <CheckCircle
              className="inline h-5 w-5 text-green-600"
              aria-hidden="true"
            />
            <span className="ml-2">AI分析 + 改善提案</span>
          </td>
        </tr>
        <tr>
          <td className="p-3 border-b border-gray-200 font-medium">選挙分析</td>
          <td className="text-center p-3 border-b border-gray-200">
            <div className="text-gray-400">
              <Lock className="inline h-5 w-5" aria-hidden="true" />
              <span className="ml-2">利用不可</span>
            </div>
          </td>
          <td className="text-center p-3 border-b border-amber-100 bg-amber-50">
            <CheckCircle
              className="inline h-5 w-5 text-green-600"
              aria-hidden="true"
            />
            <span className="ml-2">完全アクセス</span>
          </td>
        </tr>
        <tr>
          <td className="p-3 border-b border-gray-200 font-medium">広告</td>
          <td className="text-center p-3 border-b border-gray-200">
            <span className="text-gray-600">あり</span>
          </td>
          <td className="text-center p-3 border-b border-amber-100 bg-amber-50">
            <span className="font-medium text-green-600">なし</span>
          </td>
        </tr>
        <tr>
          <td className="p-3 border-b border-gray-200 font-medium">
            レポート出力
          </td>
          <td className="text-center p-3 border-b border-gray-200">
            <span className="text-gray-600">PDF基本形式のみ</span>
          </td>
          <td className="text-center p-3 border-b border-amber-100 bg-amber-50">
            <span className="font-medium">PDF/Excel/CSV</span>
          </td>
        </tr>
        <tr>
          <td className="p-3 border-gray-200 font-medium">サポート</td>
          <td className="text-center p-3 border-gray-200">
            <span className="text-gray-600">メールのみ</span>
          </td>
          <td className="text-center p-3 border-amber-100 bg-amber-50">
            <span className="font-medium">優先サポート + チャット</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const assetEntries = useSelector((state: RootState) => state.asset.entries);
  const debtEntries = useSelector((state: RootState) => state.debt.entries);
  const isUserLoggedIn = useSelector(
    (state: RootState) => state.user.isLoggedIn
  );
  const hasActiveSubscription = useSelector(
    (state: RootState) => state.user.hasActiveSubscription
  );
  const trialActivated = useSelector(
    (state: RootState) => state.user.trialActivated
  );

  const [showGetStartedDialog, setShowGetStartedDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentDialogStep, setCurrentDialogStep] = useState("intro"); // intro, plans, trial, signup

  // カテゴリー別の機能カード - useMemoで最適化
  const productivityTools = useMemo(
    () => [
      {
        title: "効率的な時間管理",
        description: "作業時間を記録し、生産性を向上させましょう。",
        icon: <Clock className="h-6 w-6 text-primary" aria-hidden="true" />,
        path: "/work-time",
        buttonText: "作業時間トラッカーを開始",
        variant: "default" as FeatureCardVariant, // 型アサーションを追加
      },
      {
        title: "詳細な分析",
        description: "作業時間のデータを可視化し、インサイトを得る",
        icon: (
          <BarChart2 className="h-6 w-6 text-indigo-500" aria-hidden="true" />
        ),
        path: "/work-time-reports",
        buttonText: "作業時間レポートを見る",
        variant: "outline" as FeatureCardVariant, // 型アサーションを追加
      },
      {
        title: "WBS作成ツール",
        description: "プロジェクトの作業分解構造を作成",
        icon: (
          <Briefcase className="h-6 w-6 text-emerald-500" aria-hidden="true" />
        ),
        path: "/wbs-creator",
        buttonText: "WBS作成ツールを開く",
        variant: "secondary" as FeatureCardVariant, // 型アサーションを追加
        isPremium: true,
      },
      {
        title: "睡眠トラッカー",
        description: "睡眠パターンを記録・分析",
        icon: <Moon className="h-6 w-6 text-blue-500" aria-hidden="true" />,
        path: "/sleep-tracker",
        buttonText: "睡眠トラッカーを開く",
        variant: "secondary" as FeatureCardVariant, // 型アサーションを追加
      },
    ],
    []
  );

  const financeTools = useMemo(
    () => [
      {
        title: "資産/負債レポート",
        description: "資産と負債の状況を分析",
        icon: (
          <Database className="h-6 w-6 text-emerald-500" aria-hidden="true" />
        ),
        path: "/reports",
        buttonText: "資産/負債レポートを見る",
        variant: "secondary" as FeatureCardVariant, // 型アサーションを追加
      },
      {
        title: "資産増減カレンダー",
        description: "日々の資産変動を視覚的に確認",
        icon: (
          <Calendar className="h-6 w-6 text-amber-500" aria-hidden="true" />
        ),
        path: "/asset-calendar",
        buttonText: "資産カレンダーを見る",
        variant: "secondary" as FeatureCardVariant, // 型アサーションを追加
        isPremium: true,
      },
    ],
    []
  );

  const politicalTools = useMemo(
    () => [
      {
        title: "政党支持率トレンド",
        description: "政党支持率の推移を分析",
        icon: (
          <TrendingUp className="h-6 w-6 text-blue-500" aria-hidden="true" />
        ),
        path: "/political-trends",
        buttonText: "政党支持率を見る",
        variant: "secondary" as FeatureCardVariant, // 型アサーションを追加
        isPremium: true,
      },
      {
        title: "衆議院選挙 候補者擁立状況",
        description: "選挙候補者の情報を管理・閲覧",
        icon: <Users className="h-6 w-6 text-red-500" aria-hidden="true" />,
        path: "/election-candidates",
        buttonText: "候補者情報を見る",
        variant: "default" as FeatureCardVariant, // 型アサーションを追加
        isPremium: true,
      },
    ],
    []
  );

  const personalTools = useMemo(
    () => [
      {
        title: "ブログ",
        description: "生産性向上のヒントや体験談を共有",
        icon: (
          <FileText className="h-6 w-6 text-orange-500" aria-hidden="true" />
        ),
        path: "/blog",
        buttonText: "ブログを見る",
        variant: "secondary" as FeatureCardVariant, // 型アサーションを追加
      },
      {
        title: "Twitter投稿",
        description: "つぶやきを共有・記録",
        icon: <Twitter className="h-6 w-6 text-sky-500" aria-hidden="true" />,
        path: "/twitter",
        buttonText: "Twitter投稿を見る",
        variant: "secondary" as FeatureCardVariant, // 型アサーションを追加
      },
      {
        title: "ユーザープロフィール",
        description: "あなたの情報を管理",
        icon: (
          <UserCircle className="h-6 w-6 text-purple-500" aria-hidden="true" />
        ),
        path: "/profile",
        buttonText: "プロフィールを見る",
        variant: "outline" as FeatureCardVariant, // 型アサーションを追加
      },
    ],
    []
  );

  // 料金プラン - useMemoで最適化
  const pricingPlans = useMemo(
    () => [
      {
        plan: "無料プラン",
        price: 0,
        features: [
          "基本的な時間トラッキング",
          "ToDo管理（最大10件）",
          "基本的な資産管理",
          "メールサポート",
          "広告あり",
        ],
        isPopular: false,
      },
      {
        plan: "プレミアムプラン",
        price: 980,
        features: [
          "高度な時間分析と予測",
          "無制限のToDoとプロジェクト管理",
          "詳細な資産分析とポートフォリオ管理",
          "選挙分析ツール完全アクセス",
          "広告なし",
          "優先サポート",
        ],
        isPopular: true,
      },
      {
        plan: "チームプラン",
        price: 4980,
        features: [
          "5ユーザーまで利用可能",
          "プレミアムプランのすべての機能",
          "チーム連携ツール",
          "管理者ダッシュボード",
          "APIアクセス",
          "専任サポート担当者",
        ],
        isPopular: false,
      },
    ],
    []
  );

  // 「今すぐ始める」ボタンのハンドラー - useCallbackで最適化
  const handleGetStarted = useCallback(() => {
    if (!isUserLoggedIn) {
      // 未ログインの場合はダイアログを表示
      setShowGetStartedDialog(true);
      setCurrentDialogStep("intro");
    } else if (hasActiveSubscription) {
      // プレミアム会員の場合はメインツールへ誘導
      navigate("/work-time");
    } else if (trialActivated) {
      // 無料トライアル中ユーザーはプラン選択へ
      setShowGetStartedDialog(true);
      setCurrentDialogStep("plans");
    } else {
      // 無料会員はトライアル案内へ
      setShowGetStartedDialog(true);
      setCurrentDialogStep("trial");
    }
  }, [isUserLoggedIn, hasActiveSubscription, trialActivated, navigate]);

  // プラン選択ハンドラー - useCallbackで最適化
  const handleSelectPlan = useCallback(
    (plan) => {
      setSelectedPlan(plan);

      if (plan === "無料プラン") {
        if (isUserLoggedIn) {
          // すでにログイン済みの場合はダイアログを閉じて無料プランのメイン機能へ
          setShowGetStartedDialog(false);
          navigate("/work-time");
        } else {
          // 未ログインの場合はサインアップへ誘導
          setCurrentDialogStep("signup");
        }
      } else {
        // プレミアムプランやチームプランの場合は支払い情報入力へ
        if (isUserLoggedIn) {
          navigate("/subscription/checkout?plan=" + encodeURIComponent(plan));
        } else {
          setCurrentDialogStep("signup");
        }
      }
    },
    [isUserLoggedIn, navigate]
  );

  // トライアル開始ハンドラー - useCallbackで最適化
  const handleStartTrial = useCallback(() => {
    dispatch(setTrialActivated(true));
    setShowGetStartedDialog(false);
    navigate("/work-time");
    // トースト通知などで「14日間の無料トライアルが開始されました」などを表示するとよい
  }, [dispatch, navigate]);

  // ダイアログコンテンツ - メモ化
  const dialogContent = useMemo(() => {
    switch (currentDialogStep) {
      case "intro":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                作業時間トラッカーへようこそ
              </DialogTitle>
              <DialogDescription className="text-center pt-2">
                あなたの生産性と効率性を最大限に引き出す最高のツールです
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles
                      className="h-24 w-24 text-primary/20"
                      aria-hidden="true"
                    />
                  </div>
                  <Clock
                    className="h-24 w-24 text-primary relative z-10"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 text-center border rounded-lg">
                  <Star
                    className="h-8 w-8 text-amber-500 mx-auto mb-2"
                    aria-hidden="true"
                  />
                  <h3 className="font-medium">生産性向上</h3>
                  <p className="text-sm text-gray-600">時間の使い方を最適化</p>
                </div>
                <div className="p-4 text-center border rounded-lg">
                  <BarChart2
                    className="h-8 w-8 text-blue-500 mx-auto mb-2"
                    aria-hidden="true"
                  />
                  <h3 className="font-medium">詳細分析</h3>
                  <p className="text-sm text-gray-600">データから洞察を得る</p>
                </div>
                <div className="p-4 text-center border rounded-lg">
                  <Crown
                    className="h-8 w-8 text-amber-500 mx-auto mb-2"
                    aria-hidden="true"
                  />
                  <h3 className="font-medium">プレミアム機能</h3>
                  <p className="text-sm text-gray-600">選挙分析や資産管理</p>
                </div>
              </div>
              <p className="text-center text-gray-600 mb-4">
                まずは無料プランから、高度な機能はプレミアムプランで利用できます。
              </p>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="sm:flex-1"
                onClick={() => setCurrentDialogStep("plans")}
              >
                プランを比較
              </Button>
              <Button
                className="sm:flex-1"
                onClick={() => setCurrentDialogStep("trial")}
              >
                14日間無料トライアル
              </Button>
            </DialogFooter>
          </>
        );

      case "plans":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                利用プランを選択
              </DialogTitle>
              <DialogDescription>
                あなたのニーズに合ったプランをお選びください
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {pricingPlans.map((plan, index) => (
                  <PricingCard
                    key={index}
                    {...plan}
                    onSelect={handleSelectPlan}
                  />
                ))}
              </div>
              <div className="mt-4">
                <Button
                  variant="link"
                  className="text-sm"
                  onClick={() => setCurrentDialogStep("comparison")}
                >
                  プランの詳細比較を見る →
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCurrentDialogStep("intro")}
              >
                戻る
              </Button>
            </DialogFooter>
          </>
        );

      case "comparison":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                プラン比較
              </DialogTitle>
              <DialogDescription>
                各プランの機能を詳しく比較してください
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 overflow-x-auto">
              <PlanComparisonTable />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCurrentDialogStep("plans")}
              >
                戻る
              </Button>
            </DialogFooter>
          </>
        );

      case "trial":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                14日間の無料トライアル
              </DialogTitle>
              <DialogDescription className="text-center pt-2">
                プレミアム機能をすべて無料でお試しいただけます
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="flex justify-center mb-6">
                <Crown
                  className="h-16 w-16 text-amber-500"
                  aria-hidden="true"
                />
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-medium">すべてのプレミアム機能</h3>
                    <p className="text-sm text-gray-600">
                      14日間、すべての機能を制限なく利用可能
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-medium">クレジットカード不要</h3>
                    <p className="text-sm text-gray-600">
                      トライアル開始時にお支払い情報は必要ありません
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-medium">自動更新なし</h3>
                    <p className="text-sm text-gray-600">
                      トライアル終了後に自動課金されることはありません
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-center text-sm text-gray-500 mb-4">
                トライアル終了後はいつでもアップグレードできます。
                <br />
                トライアル期間中のデータはそのまま保持されます。
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="sm:flex-1"
                onClick={() => setCurrentDialogStep("plans")}
              >
                プランを比較する
              </Button>
              <Button className="sm:flex-1" onClick={handleStartTrial}>
                無料トライアルを開始
              </Button>
            </DialogFooter>
          </>
        );

      case "signup":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                アカウント作成
              </DialogTitle>
              <DialogDescription className="text-center pt-2">
                {selectedPlan
                  ? `${selectedPlan}をご利用になるには、アカウント作成が必要です`
                  : "サービスを利用するにはアカウントが必要です"}
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <p className="text-center mb-6">
                アカウント作成ページへ移動します
              </p>
              <div className="flex justify-center">
                <Progress
                  value={100}
                  className="w-2/3 h-2"
                  aria-label="アカウント作成準備完了"
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentDialogStep("plans")}
              >
                キャンセル
              </Button>
              <Button
                onClick={() => {
                  setShowGetStartedDialog(false);
                  navigate("/signup", { state: { selectedPlan } });
                }}
              >
                アカウント作成へ進む
              </Button>
            </DialogFooter>
          </>
        );

      default:
        return null;
    }
  }, [
    currentDialogStep,
    handleSelectPlan,
    handleStartTrial,
    pricingPlans,
    selectedPlan,
    navigate,
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* ヒーローセクション */}
      <section className="mb-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            作業時間トラッカーへようこそ
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            あなたの時間を最大限に活用し、生産性を向上させるための総合ツールです。
            作業時間の記録から分析、資産管理、様々なトラッキングまで、すべてを一つのアプリで。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="rounded-full gap-2"
              onClick={handleGetStarted}
            >
              <Clock className="h-5 w-5" aria-hidden="true" /> 今すぐ始める
            </Button>
            <Button size="lg" variant="outline" className="rounded-full gap-2">
              <Eye className="h-5 w-5" aria-hidden="true" /> ツアーを見る
            </Button>
          </div>
        </div>
      </section>

      {/* リマインダーセクション */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Card className="h-full shadow-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                  習慣トラッカー
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HabitTracker />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <div>
              <BalanceUpdateReminder
                assetEntries={assetEntries}
                debtEntries={debtEntries}
              />
            </div>
            <div>
              <DailyTodoReminder
                isPremium={hasActiveSubscription || trialActivated}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 機能タブセクション */}
      <section>
        <h2 className="text-3xl font-bold mb-6 text-center">
          あなたのためのツール
        </h2>

        <Tabs defaultValue="productivity" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList
              className="grid grid-cols-4 w-full max-w-2xl"
              aria-label="機能カテゴリ"
            >
              <TabsTrigger
                value="productivity"
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" aria-hidden="true" /> 生産性
              </TabsTrigger>
              <TabsTrigger value="finance" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" aria-hidden="true" /> 資産管理
              </TabsTrigger>
              <TabsTrigger
                value="political"
                className="flex items-center gap-2"
              >
                <PieChart className="h-4 w-4" aria-hidden="true" /> 政治分析
              </TabsTrigger>
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" aria-hidden="true" /> パーソナル
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="productivity">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {productivityTools.map((tool, index) => (
                <FeatureCard key={`productivity-${index}`} {...tool} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="finance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {financeTools.map((tool, index) => (
                <FeatureCard key={`finance-${index}`} {...tool} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="political">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {politicalTools.map((tool, index) => (
                <FeatureCard key={`political-${index}`} {...tool} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="personal">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {personalTools.map((tool, index) => (
                <FeatureCard key={`personal-${index}`} {...tool} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* CTAセクション */}
      <section className="mt-16 text-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8">
        <h2 className="text-3xl font-bold mb-4">もっと効率的な日々へ</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
          ワンクリックであなたの生活を最適化。今すぐ始めて、時間の使い方をコントロールしましょう。
        </p>
        <Button size="lg" className="rounded-full" onClick={handleGetStarted}>
          今すぐ始める
        </Button>
      </section>

      {/* プレミアムプラン案内ダイアログ */}
      <Dialog
        open={showGetStartedDialog}
        onOpenChange={setShowGetStartedDialog}
      >
        <DialogContent className="sm:max-w-md md:max-w-2xl">
          {dialogContent}
        </DialogContent>
      </Dialog>
    </div>
  );
}
