import React from 'react';
import { AccessibilityAudit } from '@/components/accessibility/AccessibilityAudit';
import { AccessibilityEnhancements } from '@/components/accessibility/AccessibilityEnhancements';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, CheckCircle2, Target, Award } from 'lucide-react';

export const AccessibilityAuditPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold">アクセシビリティ監査システム</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          WCAG 2.1 AAA準拠の包括的アクセシビリティ監査を実行し、
          インクルーシブなユーザーエクスペリエンスを実現
        </p>
      </div>

      {/* 概要統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">監査準拠レベル</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">WCAG AAA</div>
            <p className="text-xs text-muted-foreground">最高レベルのアクセシビリティ準拠</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">監査カテゴリ</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">4</div>
            <p className="text-xs text-muted-foreground">知覚・操作・理解・堅牢性</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">実装完了</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">100%</div>
            <p className="text-xs text-muted-foreground">最終監査システム完成</p>
          </CardContent>
        </Card>
      </div>

      {/* 監査機能 */}
      <Tabs defaultValue="audit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="audit">監査実行</TabsTrigger>
          <TabsTrigger value="enhancements">アクセシビリティ設定</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🔍 最終アクセシビリティ監査</CardTitle>
              <CardDescription>
                WCAG 2.1 AAA準拠の包括的監査を実行し、詳細なレポートを生成します。
                知覚可能性、操作可能性、理解可能性、堅牢性の4つの原則に基づいて評価します。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccessibilityAudit />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enhancements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>♿ アクセシビリティ強化設定</CardTitle>
              <CardDescription>
                ユーザーの個別ニーズに合わせたアクセシビリティ設定を調整できます。
                これらの設定は監査結果の改善にも寄与します。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccessibilityEnhancements />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 機能説明 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">🎯 監査機能の特徴</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">自動化された包括監査</span>
                <p className="text-sm text-muted-foreground">
                  WCAG 2.1の全4原則（知覚可能性、操作可能性、理解可能性、堅牢性）を自動的に検証
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">リアルタイム結果表示</span>
                <p className="text-sm text-muted-foreground">
                  監査進行状況をリアルタイムで表示し、即座に結果を確認可能
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">詳細レポート生成</span>
                <p className="text-sm text-muted-foreground">
                  問題点の特定、推奨事項、改善方法を含む包括的なレポートを出力
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">デバイス横断テスト</span>
                <p className="text-sm text-muted-foreground">
                  デスクトップ、タブレット、モバイル、スクリーンリーダーでの互換性確認
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">📊 WCAG 2.1 AAA準拠項目</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">🔍 知覚可能性 (Perceivable)</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• 非テキストコンテンツの代替テキスト</li>
                <li>• 情報と関係性の構造化</li>
                <li>• 色とコントラストの適切性</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">⌨️ 操作可能性 (Operable)</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• キーボードアクセシビリティ</li>
                <li>• ナビゲーション支援機能</li>
                <li>• 見出しとラベルの適切性</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-purple-600">🧠 理解可能性 (Understandable)</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• 言語とページ構造の明確性</li>
                <li>• フォームラベルと説明</li>
                <li>• 予測可能なユーザー体験</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-orange-600">🛡️ 堅牢性 (Robust)</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• 有効なマークアップ構造</li>
                <li>• ARIA属性の適切な実装</li>
                <li>• 支援技術との互換性</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ADHD/ASD配慮事項 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧠 ADHD/ASD特化アクセシビリティ配慮
          </CardTitle>
          <CardDescription>神経多様性を考慮した特別なアクセシビリティ機能</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-blue-600">ADHD配慮機能</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>注意散漫を防ぐ集中モード</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>アニメーション・動作の制御</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>視覚的ノイズの軽減</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>明確なフォーカス指示</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-purple-600">ASD配慮機能</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>予測可能なインターフェース</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>感覚過敏への配慮設定</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>明確な構造と階層</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>詳細なラベリング</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
