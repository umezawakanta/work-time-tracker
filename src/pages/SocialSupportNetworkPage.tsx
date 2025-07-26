/**
 * 🤝 ソーシャルサポートネットワークページ
 * ADHD/ASDコミュニティとピアサポートの統合プラットフォーム
 */

import React from 'react';
import SocialSupportDashboard from '@/components/social/SocialSupportDashboard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Heart,
  Shield,
  Handshake,
  MessageCircle,
  Star,
  Award,
  Clock,
  Globe,
  BookOpen,
  Phone,
  ExternalLink,
  CheckCircle2,
  UserPlus,
  Coffee,
  Lightbulb,
  Target,
  Activity,
  Brain,
  Sparkles,
  AlertTriangle,
  Lock,
  Eye,
  Bell,
} from 'lucide-react';

const SocialSupportNetworkPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ページヘッダー */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">ソーシャルサポートネットワーク</h1>
              <p className="text-lg text-gray-600 mt-2">
                ADHD/ASDコミュニティによる包括的ピアサポートプラットフォーム
              </p>
            </div>
          </div>

          {/* システム説明 */}
          <div className="max-w-4xl mx-auto">
            <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <Heart className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">🤝 コミュニティ駆動サポート</AlertTitle>
              <AlertDescription className="text-blue-700">
                当事者同士の相互支援、専門家との連携、豊富な知識リソースにより、
                ADHD/ASD特性を持つ方が安心して成長できる包括的なサポート環境を提供します。
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* サポート機能ハイライト */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <MessageCircle className="h-6 w-6" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  コミュニティ
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">安全なコミュニティ</h3>
              <p className="text-sm text-blue-100">ADHD/ASD特性を理解し合える安心できる交流空間</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Handshake className="h-6 w-6" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  マッチング
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">ピアサポート</h3>
              <p className="text-sm text-green-100">
                AIによる最適なサポーターとのマッチングシステム
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Award className="h-6 w-6" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  専門家
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">専門家連携</h3>
              <p className="text-sm text-purple-100">
                認定された専門家による専門的ガイダンスとサポート
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Shield className="h-6 w-6" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  クライシス
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">24時間サポート</h3>
              <p className="text-sm text-orange-100">
                緊急時・危機状況での即座の専門的介入サポート
              </p>
            </CardContent>
          </Card>
        </div>

        {/* メインダッシュボード */}
        <SocialSupportDashboard />

        {/* サポートグループ種別紹介 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                サポートグループ種別
              </CardTitle>
              <CardDescription>多様なニーズに対応する専門的サポートグループ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity className="w-3 h-3 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">ADHD総合サポート</h4>
                    <p className="text-xs text-gray-600">
                      ADHD当事者・家族・支援者のための包括的コミュニティ
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Brain className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">ASD総合サポート</h4>
                    <p className="text-xs text-gray-600">
                      自閉スペクトラム症の理解と日常生活支援コミュニティ
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Target className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">併存診断サポート</h4>
                    <p className="text-xs text-gray-600">
                      ADHD・ASD両方の特性を持つ方専用のサポート
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Coffee className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">職場サポート</h4>
                    <p className="text-xs text-gray-600">働く大人のためのキャリア・職場適応支援</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Heart className="w-3 h-3 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">家族・支援者</h4>
                    <p className="text-xs text-gray-600">
                      当事者の家族・友人・支援者のためのサポート
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  グループに参加する
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                知識リソース・学習支援
              </CardTitle>
              <CardDescription>科学的根拠に基づく包括的な学習リソース</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">基本理解ガイド</h4>
                    <p className="text-xs text-gray-600">
                      ADHD/ASDの基本的特性と診断プロセスの理解
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">実践ツールキット</h4>
                    <p className="text-xs text-gray-600">
                      日常生活で実際に使える具体的なツールと戦略
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">最新研究情報</h4>
                    <p className="text-xs text-gray-600">科学的研究に基づく最新の知見と治療法</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">専門家レビュー済み</h4>
                    <p className="text-xs text-gray-600">
                      全てのリソースは専門家による審査・認証済み
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>📚 100以上の学習リソース</p>
                  <p>⭐ 平均評価4.8/5.0</p>
                  <p>🎯 ADHD/ASD特化度90%以上</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 安全性・プライバシー */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              安全性・プライバシー保護
            </CardTitle>
            <CardDescription>安心して利用できる包括的な安全対策</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">プライバシー制御</span>
                </div>
                <span className="text-sm text-gray-600">個人情報の公開範囲を細かく設定可能</span>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="font-medium">24時間モデレーション</span>
                </div>
                <span className="text-sm text-gray-600">専門スタッフによる常時コンテンツ監視</span>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">クライシス検出</span>
                </div>
                <span className="text-sm text-gray-600">AIによる危機状況の自動検出と即座介入</span>
              </Button>
            </div>

            <div className="mt-6 p-4 bg-green-100 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                <Lock className="h-4 w-4" />
                安全ガイドライン
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• すべてのメンバーは身元確認済み</li>
                <li>• ゼロトレラント方針：ハラスメント・差別を即座に対処</li>
                <li>• 専門家による定期的なコミュニティヘルスチェック</li>
                <li>• 個人医療情報は厳重に保護され外部共有なし</li>
                <li>• 緊急時は適切な専門機関と連携</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 専門家ネットワーク */}
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              専門家ネットワーク
            </CardTitle>
            <CardDescription>ADHD/ASD専門の認定プロフェッショナルチーム</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-purple-800">連携専門家</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>臨床心理士 - 心理療法・カウンセリング</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>精神科医 - 診断・薬物療法</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>作業療法士 - 感覚統合・生活スキル</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span>ADHDコーチ - 実行機能・ライフスキル</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <span>特別支援教育専門家 - 学習支援</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-purple-800">提供サービス</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>初回相談無料（30分）</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>オンライン・対面両対応</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>保険診療・自費診療選択可</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>緊急時24時間対応</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>多言語対応（日英中韓）</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <Button className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                専門家相談を予約
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* システム統合・効果 */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-600" />
              システム統合による相乗効果
            </CardTitle>
            <CardDescription>他のADHD/ASD支援システムとの連携による包括的サポート</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <div className="text-center">
                  <div className="font-medium text-xs">AI認知コーチング</div>
                  <div className="text-xs text-gray-600">個人最適化</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <div className="text-center">
                  <div className="font-medium text-xs">リアルタイム適応</div>
                  <div className="text-xs text-gray-600">動的サポート</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                <div className="text-center">
                  <div className="font-medium text-xs">認知最適化</div>
                  <div className="text-xs text-gray-600">特性理解</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <Lightbulb className="h-4 w-4 text-orange-600" />
                <div className="text-center">
                  <div className="font-medium text-xs">統合ダッシュボード</div>
                  <div className="text-xs text-gray-600">一元管理</div>
                </div>
              </Button>
            </div>

            <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 font-medium mb-2">
                <Globe className="h-4 w-4" />
                包括的サポート効果
              </div>
              <p className="text-sm text-yellow-700">
                ソーシャルサポートネットワークが他の全システムと連携することで、
                個人の認知特性理解、AI支援、コミュニティサポート、専門家ガイダンスが統合され、
                ADHD/ASDの方が「普通の生活」を送るための最も包括的な支援環境を実現します。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 参加ガイド */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              コミュニティ参加ガイド
            </CardTitle>
            <CardDescription>安全で有意義なコミュニティ体験のためのステップガイド</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-800">はじめの一歩</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                      1
                    </div>
                    <span>プロフィール作成（匿名可）</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                      2
                    </div>
                    <span>興味のあるグループに参加</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                      3
                    </div>
                    <span>コミュニティガイドラインの確認</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-800">積極的参加</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium">
                      4
                    </div>
                    <span>まずは他の人の投稿に反応</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium">
                      5
                    </div>
                    <span>自分の経験や質問を投稿</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium">
                      6
                    </div>
                    <span>ピアサポートマッチングに参加</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                <Bell className="h-4 w-4" />
                参加時の心構え
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 完璧である必要はありません - ありのままの自分で参加</li>
                <li>• 他の人のペースを尊重し、急がず焦らず関係を築く</li>
                <li>• 困った時は遠慮なくモデレーターや専門家に相談</li>
                <li>• 自分の境界線を大切にし、無理のない範囲で参加</li>
                <li>• 多様性を尊重し、判断せずに聞く姿勢を大切に</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* フッター情報 */}
        <div className="text-center text-gray-500 text-sm space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Users className="h-4 w-4" />
            <span>ソーシャルサポートネットワーク v1.0</span>
          </div>
          <p>ADHD/ASDコミュニティによる、当事者のための、包括的支援プラットフォーム</p>
          <p>24時間365日、あなたは一人ではありません</p>
        </div>
      </div>
    </div>
  );
};

export default SocialSupportNetworkPage;
