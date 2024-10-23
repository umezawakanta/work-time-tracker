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
import HabitTracker from "@/components/HabitTracker";

export default function Home() {
  const assetEntries = useSelector((state: RootState) => state.asset.entries);
  const debtEntries = useSelector((state: RootState) => state.debt.entries);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        作業時間トラッカーへようこそ
      </h1>
      <div className="mt-8">
        <HabitTracker />
      </div>
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
            <Link to="/work-time-reports" className="w-full">
              <Button variant="outline" className="w-full">
                作業時間レポートを見る
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>資産/負債レポート</CardTitle>
            <CardDescription>資産と負債の状況を分析</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              資産と負債の推移を確認し、財務状況を把握できます。
              グラフや表を使って、長期的な傾向を分析することができます。
            </p>
            <Link to="/reports" className="w-full">
              <Button variant="secondary" className="w-full">
                資産/負債レポートを見る
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
        <Card className="w-full">
          <CardHeader>
            <CardTitle>衆議院選挙 候補者擁立状況</CardTitle>
            <CardDescription>選挙候補者の情報を管理・閲覧</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              衆議院選挙の候補者情報を登録・管理できます。
              政党別、選挙区別の候補者一覧を簡単に確認することができます。
            </p>
            <Link to="/election-candidates" className="w-full">
              <Button variant="default" className="w-full">
                候補者情報を見る
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>睡眠トラッカー</CardTitle>
            <CardDescription>睡眠パターンを記録・分析</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              起床時間と就寝時間を記録し、睡眠パターンを可視化します。
              グラフやカレンダーで睡眠習慣を分析し、より良い睡眠を目指しましょう。
            </p>
            <Link to="/sleep-tracker" className="w-full">
              <Button variant="secondary" className="w-full">
                睡眠トラッカーを開く
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>ブログ</CardTitle>
            <CardDescription>生産性向上のヒントや体験談を共有</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              時間管理や生産性向上に関する記事を読んだり、自分の経験を共有したりできます。
              他のユーザーとアイデアを交換し、互いに学び合いましょう。
            </p>
            <Link to="/blog" className="w-full">
              <Button variant="secondary" className="w-full">
                ブログを見る
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>ユーザープロフィール</CardTitle>
            <CardDescription>あなたの情報を管理</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              ユーザー情報の確認や更新ができます。
              名前やメールアドレスなど、プロフィール情報を最新の状態に保ちましょう。
            </p>
            <Link to="/profile" className="w-full">
              <Button variant="outline" className="w-full">
                プロフィールを見る
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>WBS作成ツール</CardTitle>
            <CardDescription>プロジェクトの作業分解構造を作成</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              プロジェクトの作業を階層的に分解し、視覚化します。
              効率的なプロジェクト管理と進捗把握に役立ちます。
            </p>
            <Link to="/wbs-creator" className="w-full">
              <Button variant="secondary" className="w-full">
                WBS作成ツールを開く
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
