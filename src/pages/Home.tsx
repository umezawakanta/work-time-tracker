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
import BalanceUpdateReminder from "@/components/BalanceUpdateReminder";
import DailyTodoReminder from "@/components/DailyTodoReminder";

export default function Home() {
  const assetEntries = useSelector((state: RootState) => state.asset.entries);
  const debtEntries = useSelector((state: RootState) => state.debt.entries);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        作業時間トラッカーへようこそ
      </h1>
      <div className="mb-8">
        <BalanceUpdateReminder
          assetEntries={assetEntries}
          debtEntries={debtEntries}
        />
        <DailyTodoReminder />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>効率的な時間管理</CardTitle>
            <CardDescription>
              作業時間を記録し、生産性を向上させましょう。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              プロジェクトごとに作業時間を追跡し、効率的に時間を管理することで、
              生産性を最大化し、目標達成をサポートします。
            </p>
            <Link to="/work-time" className="w-full">
              <Button className="w-full">作業時間トラッカーを開始</Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>詳細な分析</CardTitle>
            <CardDescription>
              作業時間のデータを可視化し、インサイトを得る
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              記録した作業時間をグラフや表で分析し、時間の使い方を最適化。
              プロジェクトの進捗状況を把握し、改善点を見つけることができます。
            </p>
            <Link to="/reports" className="w-full">
              <Button variant="outline" className="w-full">
                レポートを見る
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>資産増減カレンダー</CardTitle>
            <CardDescription>日々の資産変動を視覚的に確認</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              カレンダー形式で資産の増減を確認できます。
              日々の変動を色分けして表示し、資産管理を視覚的にサポートします。
            </p>
            <Link to="/asset-calendar" className="w-full">
              <Button variant="secondary" className="w-full">
                資産カレンダーを見る
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
