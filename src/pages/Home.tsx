import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, BarChart2, LineChart, Calendar, Database, 
  FileText, UserCircle, Activity, Eye,
  Briefcase, Twitter, Moon, PieChart, TrendingUp, Users,
} from "lucide-react";
import BalanceUpdateReminder from "@/components/BalanceUpdateReminder";
import DailyTodoReminder from "@/components/DailyTodoReminder";
import HabitTracker from "@/components/HabitTracker";

// アニメーション設定は framer-motion がないため削除

// FeatureCardコンポーネント
const FeatureCard = ({ title, description, icon, path, buttonText, variant = "default" }) => (
  <div>
    <Card className="w-full h-full hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary">
      <CardHeader className="flex flex-row items-center gap-4">
        {icon}
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          {description}
        </p>
        <Link to={path} className="w-full">
          <Button variant={variant === "default" ? "default" : variant === "outline" ? "outline" : "secondary"} className="w-full flex items-center gap-2">
            {buttonText} <span className="ml-1">→</span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  </div>
);

export default function Home() {
  const assetEntries = useSelector((state: RootState) => state.asset.entries);
  const debtEntries = useSelector((state: RootState) => state.debt.entries);

  // カテゴリー別の機能カード
  const productivityTools = [
    {
      title: "効率的な時間管理",
      description: "作業時間を記録し、生産性を向上させましょう。",
      icon: <Clock className="h-6 w-6 text-primary" />,
      path: "/work-time",
      buttonText: "作業時間トラッカーを開始",
      variant: "default"
    },
    {
      title: "詳細な分析",
      description: "作業時間のデータを可視化し、インサイトを得る",
      icon: <BarChart2 className="h-6 w-6 text-indigo-500" />,
      path: "/work-time-reports",
      buttonText: "作業時間レポートを見る",
      variant: "outline"
    },
    {
      title: "WBS作成ツール",
      description: "プロジェクトの作業分解構造を作成",
      icon: <Briefcase className="h-6 w-6 text-emerald-500" />,
      path: "/wbs-creator",
      buttonText: "WBS作成ツールを開く",
      variant: "secondary"
    },
    {
      title: "睡眠トラッカー",
      description: "睡眠パターンを記録・分析",
      icon: <Moon className="h-6 w-6 text-blue-500" />,
      path: "/sleep-tracker",
      buttonText: "睡眠トラッカーを開く",
      variant: "secondary"
    },
  ];

  const financeTools = [
    {
      title: "資産/負債レポート",
      description: "資産と負債の状況を分析",
      icon: <Database className="h-6 w-6 text-emerald-500" />,
      path: "/reports",
      buttonText: "資産/負債レポートを見る",
      variant: "secondary"
    },
    {
      title: "資産増減カレンダー",
      description: "日々の資産変動を視覚的に確認",
      icon: <Calendar className="h-6 w-6 text-amber-500" />,
      path: "/asset-calendar",
      buttonText: "資産カレンダーを見る",
      variant: "secondary"
    },
  ];

  const politicalTools = [
    {
      title: "政党支持率トレンド",
      description: "政党支持率の推移を分析",
      icon: <TrendingUp className="h-6 w-6 text-blue-500" />,
      path: "/political-trends",
      buttonText: "政党支持率を見る",
      variant: "secondary"
    },
    {
      title: "衆議院選挙 候補者擁立状況",
      description: "選挙候補者の情報を管理・閲覧",
      icon: <Users className="h-6 w-6 text-red-500" />,
      path: "/election-candidates",
      buttonText: "候補者情報を見る",
      variant: "default"
    },
  ];

  const personalTools = [
    {
      title: "ブログ",
      description: "生産性向上のヒントや体験談を共有",
      icon: <FileText className="h-6 w-6 text-orange-500" />,
      path: "/blog",
      buttonText: "ブログを見る",
      variant: "secondary"
    },
    {
      title: "Twitter投稿",
      description: "つぶやきを共有・記録",
      icon: <Twitter className="h-6 w-6 text-sky-500" />,
      path: "/twitter",
      buttonText: "Twitter投稿を見る",
      variant: "secondary"
    },
    {
      title: "ユーザープロフィール",
      description: "あなたの情報を管理",
      icon: <UserCircle className="h-6 w-6 text-purple-500" />,
      path: "/profile",
      buttonText: "プロフィールを見る",
      variant: "outline"
    },
  ];

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
            <Button size="lg" className="rounded-full gap-2">
              <Clock className="h-5 w-5" /> 今すぐ始める
            </Button>
            <Button size="lg" variant="outline" className="rounded-full gap-2">
              <Eye className="h-5 w-5" /> ツアーを見る
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
                  <Activity className="h-5 w-5 text-primary" />
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
              <DailyTodoReminder />
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
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
              <TabsTrigger value="productivity" className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> 生産性
              </TabsTrigger>
              <TabsTrigger value="finance" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" /> 資産管理
              </TabsTrigger>
              <TabsTrigger value="political" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" /> 政治分析
              </TabsTrigger>
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" /> パーソナル
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
        <Button size="lg" className="rounded-full">今すぐ始める</Button>
      </section>
    </div>
  );
}