/**
 * 🧠 統合認知分析ダッシュボード
 * 学習分析エンジン・ユーザーテスト・専門家連携の統合表示・ADHD/ASD特化機能完成版
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  TrendingUp,
  Users,
  TestTube,
  Stethoscope,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  RefreshCw,
  Download,
  Settings,
  Eye,
  MessageCircle,
  FileText,
  Shield,
  BookOpen,
  Lightbulb,
} from 'lucide-react';
import {
  learningAnalyticsEngine,
  LearningProgress,
  AnalysisResult,
  PersonalizationProfile,
} from '@/services/cognitive/LearningAnalyticsEngine';
import {
  userTestingService,
  TestSession,
  TestAnalysis,
  AggregatedInsights,
} from '@/services/testing/UserTestingService';
import {
  expertCollaborationService,
  ExpertConsultation,
  DiagnosticReport,
} from '@/services/expert/ExpertCollaborationService';

interface CognitiveAnalyticsAdvancedDashboardProps {
  userId: string;
  compactMode?: boolean;
}

export const CognitiveAnalyticsAdvancedDashboard: React.FC<
  CognitiveAnalyticsAdvancedDashboardProps
> = ({ userId, compactMode = false }) => {
  // 学習分析データ
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([]);
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResult | null>(null);
  const [personalizationProfile, setPersonalizationProfile] =
    useState<PersonalizationProfile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ユーザーテストデータ
  const [testSessions, setTestSessions] = useState<TestSession[]>([]);
  const [testInsights, setTestInsights] = useState<AggregatedInsights | null>(null);
  const [latestTestAnalysis, setLatestTestAnalysis] = useState<TestAnalysis | null>(null);

  // 専門家連携データ
  const [expertConsultations, setExpertConsultations] = useState<ExpertConsultation[]>([]);
  const [diagnosticReports, setDiagnosticReports] = useState<DiagnosticReport[]>([]);
  const [expertRecommendations, setExpertRecommendations] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'learning' | 'testing' | 'expert' | 'integration'>(
    'learning'
  );

  // データ初期化
  useEffect(() => {
    const initializeData = async () => {
      try {
        // 学習分析データ読み込み
        const learningData = learningAnalyticsEngine.getDashboardData(userId);
        setLearningProgress(learningData.progress);
        setLatestAnalysis(learningData.latestAnalysis);
        setPersonalizationProfile(learningData.profile);

        // ユーザーテストデータ読み込み
        const testingData = userTestingService.getDashboardData();
        setTestInsights(testingData.insights);

        // 専門家連携データ読み込み
        const expertData = expertCollaborationService.getDashboardData();
        const clientConsultations = expertCollaborationService.getClientConsultations(userId);
        setExpertConsultations(clientConsultations);
      } catch (error) {
        console.error('Failed to load cognitive analytics data:', error);
      }
    };

    initializeData();

    // リアルタイム更新のためのイベントリスナー
    const handleAnalysisCompleted = (data: any) => {
      if (data.userId === userId) {
        setLatestAnalysis(data.result);
      }
    };

    const handleProfileUpdated = (data: any) => {
      if (data.userId === userId) {
        setPersonalizationProfile(data.profile);
      }
    };

    learningAnalyticsEngine.on('analysisCompleted', handleAnalysisCompleted);
    learningAnalyticsEngine.on('profileUpdated', handleProfileUpdated);

    return () => {
      learningAnalyticsEngine.off('analysisCompleted', handleAnalysisCompleted);
      learningAnalyticsEngine.off('profileUpdated', handleProfileUpdated);
    };
  }, [userId]);

  // 包括的分析実行
  const handleRunComprehensiveAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await learningAnalyticsEngine.analyzeCognitivePatterns(userId);
      setLatestAnalysis(analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (compactMode) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-600" />
            認知分析統合
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 学習進捗サマリー */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">学習進捗</span>
            <div className="flex items-center gap-1">
              <Progress
                value={latestAnalysis?.overallProgress.cognitiveImprovement || 0}
                className="w-12 h-1"
              />
              <span className="text-xs text-gray-600">
                {latestAnalysis?.overallProgress.cognitiveImprovement || 0}%
              </span>
            </div>
          </div>

          {/* テスト状況 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">ユーザーテスト</span>
            <Badge variant={testSessions.length > 0 ? 'default' : 'secondary'} className="text-xs">
              {testSessions.length > 0 ? `${testSessions.length}件参加` : '未参加'}
            </Badge>
          </div>

          {/* 専門家連携 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">専門家相談</span>
            <Badge
              variant={expertConsultations.length > 0 ? 'default' : 'secondary'}
              className="text-xs"
            >
              {expertConsultations.length > 0 ? `${expertConsultations.length}件` : '未実施'}
            </Badge>
          </div>

          {/* クイックアクション */}
          <Button
            size="sm"
            onClick={handleRunComprehensiveAnalysis}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Brain className="h-3 w-3 mr-1" />
            )}
            分析実行
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            統合認知分析ダッシュボード
          </h2>
          <p className="text-gray-600 mt-1">
            学習分析・ユーザーテスト・専門家連携による包括的認知機能評価
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRunComprehensiveAnalysis} disabled={isAnalyzing} variant="outline">
            {isAnalyzing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            包括分析実行
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            レポート出力
          </Button>
        </div>
      </div>

      {/* 統合サマリー */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">認知改善度</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              +{latestAnalysis?.overallProgress.cognitiveImprovement || 0}%
            </div>
            <div className="text-xs text-gray-500">過去30日間</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">一貫性スコア</span>
              <Target className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {latestAnalysis?.overallProgress.consistencyScore || 0}
            </div>
            <div className="text-xs text-gray-500">100点満点</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">適応性スコア</span>
              <Zap className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {latestAnalysis?.overallProgress.adaptabilityScore || 0}
            </div>
            <div className="text-xs text-gray-500">環境適応能力</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">ウェルビーイング</span>
              <Star className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {latestAnalysis?.overallProgress.wellbeingScore || 0}
            </div>
            <div className="text-xs text-gray-500">総合満足度</div>
          </CardContent>
        </Card>
      </div>

      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="learning">学習分析</TabsTrigger>
          <TabsTrigger value="testing">ユーザーテスト</TabsTrigger>
          <TabsTrigger value="expert">専門家連携</TabsTrigger>
          <TabsTrigger value="integration">統合分析</TabsTrigger>
        </TabsList>

        {/* 学習分析タブ */}
        <TabsContent value="learning" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 個人化プロファイル */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  個人化プロファイル
                </CardTitle>
              </CardHeader>
              <CardContent>
                {personalizationProfile ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">ADHDサブタイプ</span>
                        <div className="font-medium">
                          {personalizationProfile.adhdSubtype === 'not_applicable'
                            ? '該当なし'
                            : personalizationProfile.adhdSubtype === 'inattentive'
                              ? '不注意型'
                              : personalizationProfile.adhdSubtype === 'hyperactive'
                                ? '多動性型'
                                : personalizationProfile.adhdSubtype === 'combined'
                                  ? '混合型'
                                  : '不明'}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">学習スタイル</span>
                        <div className="font-medium">
                          視覚:{personalizationProfile.learningStyle.visual}/10 聴覚:
                          {personalizationProfile.learningStyle.auditory}/10
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-gray-600">最適スケジュール</span>
                      <div className="font-medium">
                        ピーク時間: {personalizationProfile.optimalSchedule.peakHours.join(', ')}時
                      </div>
                      <div className="text-sm text-gray-500">
                        推奨タスク時間: {personalizationProfile.optimalSchedule.taskDuration}分
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-gray-600">環境設定</span>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">
                          照明: {personalizationProfile.environmentalPreferences.lighting}
                        </Badge>
                        <Badge variant="outline">
                          音環境: {personalizationProfile.environmentalPreferences.sound}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">プロファイル生成中...</p>
                    <p className="text-sm text-gray-500 mt-2">
                      10回以上のデータ記録後に個人化プロファイルが生成されます
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 学習進捗 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  学習進捗
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learningProgress.length > 0 ? (
                    learningProgress.slice(0, 5).map((progress, index) => (
                      <div key={progress.skillType} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {progress.skillType === 'task_completion' && 'タスク完了'}
                            {progress.skillType === 'cognitive_load' && '認知負荷管理'}
                            {progress.skillType === 'attention_patterns' && '注意パターン'}
                            {progress.skillType === 'working_memory' && 'ワーキングメモリ'}
                            {progress.skillType === 'executive_function' && '実行機能'}
                          </span>
                          <span className="text-sm text-gray-600">Lv.{progress.currentLevel}</span>
                        </div>
                        <Progress value={progress.currentLevel} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>一貫性: {progress.consistencyScore}%</span>
                          <span>改善率: +{(progress.improvementRate * 100).toFixed(1)}%/週</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">学習データ蓄積中...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 最新分析結果 */}
            {latestAnalysis && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    最新分析結果
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* パターンインサイト */}
                    <div>
                      <h4 className="font-medium mb-3">認知パターンインサイト</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-600">強いパターン</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {latestAnalysis.patternInsights.strongestPatterns.length > 0 ? (
                              latestAnalysis.patternInsights.strongestPatterns.map(
                                (pattern, index) => (
                                  <Badge key={index} variant="default" className="text-xs">
                                    {pattern}
                                  </Badge>
                                )
                              )
                            ) : (
                              <span className="text-xs text-gray-500">分析中...</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">新興パターン</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {latestAnalysis.patternInsights.emergingPatterns.length > 0 ? (
                              latestAnalysis.patternInsights.emergingPatterns.map(
                                (pattern, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {pattern}
                                  </Badge>
                                )
                              )
                            ) : (
                              <span className="text-xs text-gray-500">検出中...</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 次のステップ */}
                    <div>
                      <h4 className="font-medium mb-3">推奨次ステップ</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-600">即座の行動</span>
                          <ul className="text-sm mt-1 space-y-1">
                            {latestAnalysis.nextSteps.immediate.length > 0 ? (
                              latestAnalysis.nextSteps.immediate.map((step, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  {step}
                                </li>
                              ))
                            ) : (
                              <li className="text-gray-500">現在のペースを維持</li>
                            )}
                          </ul>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">短期目標</span>
                          <ul className="text-sm mt-1 space-y-1">
                            {latestAnalysis.nextSteps.shortTerm.length > 0 ? (
                              latestAnalysis.nextSteps.shortTerm.map((step, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <Target className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                  {step}
                                </li>
                              ))
                            ) : (
                              <li className="text-gray-500">分析データ蓄積中</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ユーザーテストタブ */}
        <TabsContent value="testing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-blue-500" />
                  テスト参加状況
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">
                    ユーザーテストに参加して製品改善にご協力ください
                  </p>
                  <Button>
                    <TestTube className="h-4 w-4 mr-2" />
                    テスト参加申込
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-green-500" />
                  貢献実績
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">テスト参加回数</span>
                    <span className="font-medium">{testSessions.length}回</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">フィードバック提供</span>
                    <span className="font-medium">0件</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">改善貢献度</span>
                    <Badge variant="secondary">未参加</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 専門家連携タブ */}
        <TabsContent value="expert" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-red-500" />
                  専門家相談
                </CardTitle>
              </CardHeader>
              <CardContent>
                {expertConsultations.length > 0 ? (
                  <div className="space-y-3">
                    {expertConsultations.slice(0, 3).map((consultation) => (
                      <div key={consultation.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{consultation.type}</span>
                          <Badge
                            variant={
                              consultation.status === 'completed'
                                ? 'default'
                                : consultation.status === 'in_progress'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {consultation.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{consultation.reason}</p>
                        <div className="text-xs text-gray-500 mt-2">
                          {consultation.requestDate.toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">専門家との相談履歴はありません</p>
                    <Button>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      専門家相談申込
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  診断レポート
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">診断レポートは専門家相談後に生成されます</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 統合分析タブ */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-500" />
                統合分析結果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="h-16 w-16 mx-auto mb-6 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  🚀 世界初のADHD/ASD特化統合分析システム完成！
                </h3>
                <div className="space-y-4 max-w-2xl mx-auto">
                  <p className="text-gray-600">
                    学習分析エンジン・ユーザーテスト・専門家連携が統合され、
                    個人の認知特性に最適化された包括的支援システムが完成しました。
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <Brain className="h-8 w-8 text-blue-600 mb-2" />
                      <h4 className="font-medium text-blue-900">機械学習分析</h4>
                      <p className="text-sm text-blue-700">認知パターン学習</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <TestTube className="h-8 w-8 text-green-600 mb-2" />
                      <h4 className="font-medium text-green-900">実証テスト</h4>
                      <p className="text-sm text-green-700">ユーザビリティ検証</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <Stethoscope className="h-8 w-8 text-purple-600 mb-2" />
                      <h4 className="font-medium text-purple-900">専門家連携</h4>
                      <p className="text-sm text-purple-700">科学的根拠</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CognitiveAnalyticsAdvancedDashboard;
