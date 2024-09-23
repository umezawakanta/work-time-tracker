import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        作業時間トラッカーへようこそ
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>作業時間の記録</CardTitle>
            <CardDescription>
              日々の作業時間を簡単に記録できます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              プロジェクトごとに作業時間を記録し、効率的に時間管理を行いましょう。
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/work-time">作業時間を記録する</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>レポート機能</CardTitle>
            <CardDescription>
              作業時間の分析と可視化ができます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              記録した作業時間をグラフや表で確認し、生産性を向上させましょう。
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link to="/reports">レポートを見る</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">最近の統計</h2>
        <p className="text-lg">今週の総作業時間: 32時間</p>
        <p className="text-lg">
          最も作業時間が長いプロジェクト: ウェブサイトリニューアル
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">使い方</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>「作業時間を記録する」ボタンをクリックします。</li>
          <li>プロジェクト名、開始時間、終了時間を入力します。</li>
          <li>必要に応じて詳細な説明を追加します。</li>
          <li>「保存」ボタンをクリックして記録を完了します。</li>
        </ol>
      </section>
    </div>
  );
}
