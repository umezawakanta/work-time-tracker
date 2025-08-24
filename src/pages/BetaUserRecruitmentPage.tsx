/**
 * 📋 ベータユーザー募集ページ
 * フォーム・ダッシュボード・管理機能を統合
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  UserPlus,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Settings,
  Shield,
  Star,
  Brain,
  Heart,
  Target,
  Award,
  Lightbulb,
} from 'lucide-react';
import BetaUserRecruitmentForm from '@/components/beta/BetaUserRecruitmentForm';
import {
  betaUserRecruitmentService,
  BetaUserProfile,
} from '@/services/beta/BetaUserRecruitmentService';
import { useAuth } from '@/hooks/useAuth';

export const BetaUserRecruitmentPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('apply');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentApplications, setRecentApplications] = useState<BetaUserProfile[]>([]);
  const [showThankYou, setShowThankYou] = useState(false);

  // データ読み込み
  useEffect(() => {
    loadDashboardData();
    loadRecentApplications();
  }, []);

  const loadDashboardData = () => {
    const data = betaUserRecruitmentService.getDashboardData();
    setDashboardData(data);
  };

  const loadRecentApplications = () => {
    const applications = betaUserRecruitmentService
      .getAllApplications()
      .sort(
        (a, b) =>
          new Date(b.recruitmentStatus.applicationDate).getTime() -
          new Date(a.recruitmentStatus.applicationDate).getTime()
      )
      .slice(0, 10);
    setRecentApplications(applications);
  };

  const handleApplicationComplete = (applicationId: string) => {
    setShowThankYou(true);
    setActiveTab('thank-you');
    loadDashboardData();
    loadRecentApplications();
  };

  // 概要ダッシュボード
  const renderOverviewDashboard = () => (
    <div className="space-y-6">
      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総申請数</p>
                <p className="text-3xl font-bold text-blue-600">
                  {dashboardData?.summary.totalApplications || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">承認済み</p>
                <p className="text-3xl font-bold text-green-600">
                  {dashboardData?.summary.approved || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">審査中</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {dashboardData?.summary.screening || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">待機リスト</p>
                <p className="text-3xl font-bold text-purple-600">
                  {dashboardData?.summary.waitlisted || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 多様性メトリクス */}
      {dashboardData?.diversity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              参加者の多様性
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 年齢分布 */}
              <div>
                <h4 className="font-medium mb-3">年齢分布</h4>
                <div className="space-y-2">
                  {Object.entries(dashboardData.diversity.ageDistribution || {}).map(
                    ([range, count]) => (
                      <div key={range} className="flex justify-between">
                        <span className="text-sm">{range}歳</span>
                        <Badge variant="outline">{count as number}人</Badge>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* 神経多様性 */}
              <div>
                <h4 className="font-medium mb-3">神経多様性</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">ADHDのみ</span>
                    <Badge variant="outline">
                      {dashboardData.diversity.neurodiversityMix?.adhdOnly || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">ASDのみ</span>
                    <Badge variant="outline">
                      {dashboardData.diversity.neurodiversityMix?.asdOnly || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">ADHD+ASD</span>
                    <Badge variant="outline">
                      {dashboardData.diversity.neurodiversityMix?.both || 0}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 技術スキル */}
              <div>
                <h4 className="font-medium mb-3">技術スキル</h4>
                <div className="space-y-2">
                  {Object.entries(dashboardData.diversity.techSkillDistribution || {}).map(
                    ([level, count]) => (
                      <div key={level} className="flex justify-between">
                        <span className="text-sm capitalize">{level}</span>
                        <Badge variant="outline">{count as number}人</Badge>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 最近の申請 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            最近の申請
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentApplications.length > 0 ? (
              recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">{app.personalInfo.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(app.recruitmentStatus.applicationDate).toLocaleDateString(
                          'ja-JP'
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        app.recruitmentStatus.status === 'approved'
                          ? 'default'
                          : app.recruitmentStatus.status === 'declined'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {app.recruitmentStatus.status === 'approved' && '承認済み'}
                      {app.recruitmentStatus.status === 'screening' && '審査中'}
                      {app.recruitmentStatus.status === 'waitlisted' && '待機中'}
                      {app.recruitmentStatus.status === 'declined' && '不承認'}
                      {app.recruitmentStatus.status === 'applied' && '申請済み'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      スコア: {app.recruitmentStatus.screeningScore}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">まだ申請がありません</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // 感謝ページ
  const renderThankYouPage = () => (
    <div className="text-center space-y-8 py-12">
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
          <Heart className="h-12 w-12 text-white" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900">🎉 申し込みありがとうございます！</h1>

        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          あなたの参加申し込みを受け付けました。私たちの開発チームが審査を行い、1-2営業日以内にご連絡いたします。
        </p>
      </div>

      <div className="bg-blue-50 p-8 rounded-xl max-w-4xl mx-auto">
        <h3 className="text-xl font-semibold text-blue-900 mb-6">次のステップ</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-3">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="font-medium text-blue-900">1. 審査プロセス</h4>
            <p className="text-sm text-blue-700">
              適格性と多様性を考慮した慎重な審査を行います（1-2営業日）
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="font-medium text-green-900">2. 承認通知</h4>
            <p className="text-sm text-green-700">
              承認された場合、詳細な参加ガイドと初期設定手順をお送りします
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <Star className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="font-medium text-purple-900">3. ベータテスト開始</h4>
            <p className="text-sm text-purple-700">
              専用アクセスとオンボーディングでベータテストを開始します
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 p-6 rounded-lg">
        <div className="flex items-start gap-4">
          <Lightbulb className="h-6 w-6 text-amber-600 mt-1" />
          <div className="text-left">
            <h4 className="font-medium text-amber-900 mb-2">お待ちの間に</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• 現在お使いのタスク管理ツールの課題をメモしておいてください</li>
              <li>• ADHD/ASDコミュニティでベータテストについてシェアしてください</li>
              <li>• テストに使用予定のデバイスでブラウザが最新版か確認してください</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Button onClick={() => setActiveTab('overview')} size="lg">
          <BarChart3 className="h-5 w-5 mr-2" />
          募集状況を見る
        </Button>

        <p className="text-sm text-gray-600">
          ご質問がございましたら、beta@lifesync.com までお気軽にお問い合わせください。
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-white/20 p-4 rounded-full">
                <Users className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">🌟 ベータユーザー募集</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              ADHD/ASD特化ライフマネジメントシステムの開発にご協力いただけるテスターを募集しています
            </p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="apply" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              申し込み
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              募集状況
            </TabsTrigger>
          </TabsList>

          <TabsContent value="apply" className="mt-8">
            {!showThankYou ? (
              <BetaUserRecruitmentForm
                onComplete={handleApplicationComplete}
                onCancel={() => setActiveTab('overview')}
              />
            ) : (
              renderThankYouPage()
            )}
          </TabsContent>

          <TabsContent value="overview" className="mt-8">
            {renderOverviewDashboard()}
          </TabsContent>

          <TabsContent value="thank-you" className="mt-8">
            {renderThankYouPage()}
          </TabsContent>
        </Tabs>
      </div>

      {/* フッター */}
      <div className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">🔒 プライバシーと安全</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• GDPR完全準拠</li>
                <li>• 医療情報保護法準拠</li>
                <li>• エンドツーエンド暗号化</li>
                <li>• 倫理委員会承認済み</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">🤝 コミュニティパートナー</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• ADHD当事者団体</li>
                <li>• ASD支援組織</li>
                <li>• 学術研究機関</li>
                <li>• 専門医ネットワーク</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">📞 お問い合わせ</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Email: beta@lifesync.com</li>
                <li>Discord: #beta-recruitment</li>
                <li>営業時間: 平日 9:00-18:00 JST</li>
                <li>緊急時: support@lifesync.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>
              © 2024 LifeSync. すべての権利を留保します。 | 神経多様性の未来を一緒に創造しましょう
              🌈
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetaUserRecruitmentPage;
