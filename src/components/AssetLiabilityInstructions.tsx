import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, DollarSign, TrendingUp, PieChart, FileText, Building2, CreditCard, Target } from 'lucide-react';

export const AssetLiabilityInstructions: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          資産負債レポートの使い方
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 基本操作 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">📊 基本操作</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>資産・負債データを入力して財務状況を把握する</li>
              <li>銀行口座情報を連携して自動で資産に反映させる</li>
              <li>財務指標を確認して資産形成の進捗をチェックする</li>
              <li>トレンド分析で資産・負債の推移を可視化する</li>
              <li>レポートをエクスポートして記録を保存する</li>
            </ol>
          </div>

          {/* データ入力方法 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">💾 データ入力方法</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h5 className="font-medium text-gray-800">資産データ</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>現金・預金の残高</li>
                  <li>投資信託・株式の評価額</li>
                  <li>不動産の時価評価</li>
                  <li>その他の資産</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium text-gray-800">負債データ</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>住宅ローン残高</li>
                  <li>クレジットカード未払い</li>
                  <li>カードローン残高</li>
                  <li>その他の借金</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 関連ページ・外部サイト */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">🔗 関連ページ・外部サイト</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <Building2 className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <a
                    href="/bank-accounts"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    銀行口座管理
                  </a>
                  <p className="text-xs text-gray-600 mt-1">銀行口座情報の登録・CSVインポート</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <ExternalLink className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <a
                    href="https://www.smbc.co.jp/kojin/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    三井住友銀行オンラインバンキング
                  </a>
                  <p className="text-xs text-gray-600 mt-1">銀行口座の残高確認・取引明細ダウンロード</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <ExternalLink className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <a
                    href="https://www.yokohamabank.co.jp/kojin/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    横浜銀行オンラインバンキング
                  </a>
                  <p className="text-xs text-gray-600 mt-1">横浜銀行の残高確認・取引明細ダウンロード</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <ExternalLink className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <a
                    href="https://www.jibunbank.co.jp/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    じぶん銀行オンラインバンキング
                  </a>
                  <p className="text-xs text-gray-600 mt-1">じぶん銀行の残高確認・取引明細ダウンロード</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <ExternalLink className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <a
                    href="https://www.acom.co.jp/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    アコムオンラインサービス
                  </a>
                  <p className="text-xs text-gray-600 mt-1">アコムカードローン・ショッピングの残高確認</p>
                </div>
              </div>
            </div>
          </div>

          {/* 財務指標の説明 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">📈 財務指標の説明</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium">純資産</span>
                </div>
                <p className="text-gray-600 ml-6">総資産から総負債を引いた金額</p>
                
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">資産成長率</span>
                </div>
                <p className="text-gray-600 ml-6">前月比での資産の増減率</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">負債比率</span>
                </div>
                <p className="text-gray-600 ml-6">総負債を総資産で割った比率</p>
                
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">緊急資金比率</span>
                </div>
                <p className="text-gray-600 ml-6">流動資産の月支出に対する比率</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
