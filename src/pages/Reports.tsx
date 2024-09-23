import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Reports() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">作業時間レポート</h1>
      <Card>
        <CardHeader>
          <CardTitle>レポート概要</CardTitle>
        </CardHeader>
        <CardContent>
          <p>ここに作業時間のレポートが表示されます。現在開発中です。</p>
        </CardContent>
      </Card>
    </div>
  );
}
