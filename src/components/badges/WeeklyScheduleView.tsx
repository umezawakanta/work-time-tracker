import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Star,
  ArrowRight,
  ChevronRight,
  PlayCircle,
} from 'lucide-react';

// 週次計画のインターフェース
interface WeeklyBadgePlan {
  badgeId: string;
  badgeName: string;
  badgeEmoji: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  actualHours: number;
  targetDate: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  dependencies: string[];
  progress: number; // 0-100
  confidence: number; // 0-100
}

interface WeeklySchedule {
  weekNumber: number;
  startDate: string;
  endDate: string;
  theme: string; // その週のテーマ
  plannedBadges: WeeklyBadgePlan[];
  totalPlannedHours: number;
  totalActualHours: number;
  completionRate: number;
  efficiency: number;
  onTrackScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  keyMilestones: string[];
  notes: string;
}

interface WeeklyScheduleViewProps {
  selectedWeek?: number;
  onWeekSelect: (weekNumber: number) => void;
}

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  selectedWeek,
  onWeekSelect,
}) => {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  // 12週間のサンプルデータ
  const weeklySchedules: WeeklySchedule[] = [
    {
      weekNumber: 1,
      startDate: '2025-06-28',
      endDate: '2025-07-04',
      theme: 'セキュリティ基盤構築',
      plannedBadges: [
        {
          badgeId: 'security-basics',
          badgeName: 'セキュリティ基礎',
          badgeEmoji: '🔐',
          category: 'セキュリティ',
          priority: 'high',
          estimatedHours: 12,
          actualHours: 8,
          targetDate: '2025-07-02',
          status: 'in_progress',
          dependencies: [],
          progress: 65,
          confidence: 85,
        },
        {
          badgeId: 'network-security',
          badgeName: 'ネットワークセキュリティ',
          badgeEmoji: '🛡️',
          category: 'セキュリティ',
          priority: 'high',
          estimatedHours: 8,
          actualHours: 0,
          targetDate: '2025-07-04',
          status: 'not_started',
          dependencies: ['security-basics'],
          progress: 0,
          confidence: 75,
        },
      ],
      totalPlannedHours: 20,
      totalActualHours: 8,
      completionRate: 32.5,
      efficiency: 85,
      onTrackScore: 78,
      riskLevel: 'low',
      keyMilestones: ['セキュリティ基礎概念の理解', 'ネットワーク脆弱性スキャン実践'],
      notes: '基礎から着実に積み上げる週。理論と実践のバランスを重視。',
    },
    {
      weekNumber: 2,
      startDate: '2025-07-05',
      endDate: '2025-07-11',
      theme: 'ペネトレーションテスト実践',
      plannedBadges: [
        {
          badgeId: 'penetration-testing',
          badgeName: 'ペネトレーションテスト',
          badgeEmoji: '🔍',
          category: 'セキュリティ',
          priority: 'high',
          estimatedHours: 15,
          actualHours: 0,
          targetDate: '2025-07-11',
          status: 'not_started',
          dependencies: ['network-security'],
          progress: 0,
          confidence: 70,
        },
        {
          badgeId: 'vulnerability-assessment',
          badgeName: '脆弱性評価',
          badgeEmoji: '🎯',
          category: 'セキュリティ',
          priority: 'medium',
          estimatedHours: 5,
          actualHours: 0,
          targetDate: '2025-07-09',
          status: 'not_started',
          dependencies: ['security-basics'],
          progress: 0,
          confidence: 80,
        },
      ],
      totalPlannedHours: 20,
      totalActualHours: 0,
      completionRate: 0,
      efficiency: 85,
      onTrackScore: 72,
      riskLevel: 'medium',
      keyMilestones: ['Kali Linuxツール習得', '実際のシステムでのテスト実施'],
      notes: '実践的なスキル構築。ハンズオン重視で進める。',
    },
    {
      weekNumber: 3,
      startDate: '2025-07-12',
      endDate: '2025-07-18',
      theme: 'セキュリティツール習得',
      plannedBadges: [
        {
          badgeId: 'security-tools-mastery',
          badgeName: 'セキュリティツールマスター',
          badgeEmoji: '⚒️',
          category: 'セキュリティ',
          priority: 'high',
          estimatedHours: 18,
          actualHours: 0,
          targetDate: '2025-07-18',
          status: 'not_started',
          dependencies: ['penetration-testing'],
          progress: 0,
          confidence: 75,
        },
      ],
      totalPlannedHours: 20,
      totalActualHours: 0,
      completionRate: 0,
      efficiency: 85,
      onTrackScore: 70,
      riskLevel: 'medium',
      keyMilestones: ['複数ツールの組み合わせ活用', 'カスタムスクリプト作成'],
      notes: 'ツールの深い理解と応用力を身につける。',
    },
    {
      weekNumber: 4,
      startDate: '2025-07-19',
      endDate: '2025-07-25',
      theme: 'セキュリティ統合・完成',
      plannedBadges: [
        {
          badgeId: 'security-specialist-final',
          badgeName: 'サイバーセキュリティスペシャリスト',
          badgeEmoji: '🔐',
          category: 'セキュリティ',
          priority: 'high',
          estimatedHours: 10,
          actualHours: 0,
          targetDate: '2025-07-25',
          status: 'not_started',
          dependencies: ['security-tools-mastery'],
          progress: 0,
          confidence: 85,
        },
        {
          badgeId: 'skill-map-expert',
          badgeName: 'スキルマップエキスパート',
          badgeEmoji: '🗺️',
          category: 'プロジェクト管理',
          priority: 'medium',
          estimatedHours: 8,
          actualHours: 0,
          targetDate: '2025-07-25',
          status: 'not_started',
          dependencies: [],
          progress: 0,
          confidence: 90,
        },
      ],
      totalPlannedHours: 18,
      totalActualHours: 0,
      completionRate: 0,
      efficiency: 85,
      onTrackScore: 88,
      riskLevel: 'low',
      keyMilestones: ['セキュリティ分野完全習得', 'スキルマップ作成開始'],
      notes: 'セキュリティ分野の集大成。次のフェーズの準備も開始。',
    },
    {
      weekNumber: 5,
      startDate: '2025-07-26',
      endDate: '2025-08-01',
      theme: 'UX・アクセシビリティ強化',
      plannedBadges: [
        {
          badgeId: 'accessibility-champion',
          badgeName: 'アクセシビリティチャンピオン',
          badgeEmoji: '♿',
          category: 'アクセシビリティ',
          priority: 'high',
          estimatedHours: 7,
          actualHours: 0,
          targetDate: '2025-08-01',
          status: 'not_started',
          dependencies: [],
          progress: 0,
          confidence: 85,
        },
        {
          badgeId: 'ux-researcher',
          badgeName: 'UXリサーチスペシャリスト',
          badgeEmoji: '🔍',
          category: 'デザイン',
          priority: 'medium',
          estimatedHours: 7,
          actualHours: 0,
          targetDate: '2025-08-01',
          status: 'not_started',
          dependencies: [],
          progress: 0,
          confidence: 80,
        },
        {
          badgeId: 'requirements-specialist',
          badgeName: '要件定義スペシャリスト',
          badgeEmoji: '📊',
          category: 'PM',
          priority: 'high',
          estimatedHours: 6,
          actualHours: 0,
          targetDate: '2025-08-01',
          status: 'not_started',
          dependencies: [],
          progress: 0,
          confidence: 90,
        },
      ],
      totalPlannedHours: 20,
      totalActualHours: 0,
      completionRate: 0,
      efficiency: 85,
      onTrackScore: 85,
      riskLevel: 'low',
      keyMilestones: ['WCAG準拠サイト構築', 'ユーザビリティテスト実施'],
      notes: 'ユーザー中心設計の理解を深める。実践的なUXスキル習得。',
    },
    {
      weekNumber: 6,
      startDate: '2025-08-02',
      endDate: '2025-08-08',
      theme: 'AI・機械学習基礎',
      plannedBadges: [
        {
          badgeId: 'ai-fundamentals',
          badgeName: 'AI基礎',
          badgeEmoji: '🤖',
          category: 'AI・機械学習',
          priority: 'high',
          estimatedHours: 15,
          actualHours: 0,
          targetDate: '2025-08-08',
          status: 'not_started',
          dependencies: [],
          progress: 0,
          confidence: 70,
        },
      ],
      totalPlannedHours: 15,
      totalActualHours: 0,
      completionRate: 0,
      efficiency: 85,
      onTrackScore: 75,
      riskLevel: 'medium',
      keyMilestones: ['Python機械学習環境構築', '基本アルゴリズム理解'],
      notes: 'AI分野への本格参入。数学的基礎も並行して学習。',
    },
  ];

  // 優先度カラー
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // ステータスカラー
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'delayed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // リスクレベルカラー
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // オントラックスコアカラー
  const getOnTrackColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* 週次スケジュール概要 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            📅 12週間スケジュール概要
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {weeklySchedules.reduce((sum, week) => sum + week.totalPlannedHours, 0)}h
              </div>
              <div className="text-sm text-muted-foreground">総予定時間</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {weeklySchedules.reduce((sum, week) => sum + week.plannedBadges.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">予定バッジ数</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(
                  weeklySchedules.reduce((sum, week) => sum + week.onTrackScore, 0) /
                    weeklySchedules.length
                )}
                %
              </div>
              <div className="text-sm text-muted-foreground">平均達成予測</div>
            </div>
          </div>

          {/* 週別プログレスバー */}
          <div className="space-y-2">
            <h4 className="font-semibold">週別進捗予測</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {weeklySchedules.slice(0, 12).map((week) => (
                <div key={week.weekNumber} className="text-center">
                  <div className="text-xs font-medium mb-1">Week {week.weekNumber}</div>
                  <Progress value={week.onTrackScore} className="h-2" />
                  <div className={`text-xs mt-1 ${getOnTrackColor(week.onTrackScore)}`}>
                    {week.onTrackScore}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 詳細な週次計画 */}
      <div className="space-y-4">
        {weeklySchedules.slice(0, 6).map((week) => (
          <Card
            key={week.weekNumber}
            className={expandedWeek === week.weekNumber ? 'ring-2 ring-blue-200' : ''}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExpandedWeek(expandedWeek === week.weekNumber ? null : week.weekNumber)
                    }
                    className="p-1"
                  >
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${expandedWeek === week.weekNumber ? 'rotate-90' : ''}`}
                    />
                  </Button>
                  <div>
                    <CardTitle className="text-lg">
                      Week {week.weekNumber}: {week.theme}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {week.startDate} - {week.endDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      week.onTrackScore >= 80
                        ? 'default'
                        : week.onTrackScore >= 60
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {week.onTrackScore}% 達成予測
                  </Badge>
                  <Badge variant="outline" className={getRiskColor(week.riskLevel)}>
                    {week.riskLevel} risk
                  </Badge>
                </div>
              </div>
            </CardHeader>

            {/* 基本情報（常に表示） */}
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="font-bold text-blue-600">{week.totalPlannedHours}h</div>
                  <div className="text-xs text-muted-foreground">予定時間</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">{week.plannedBadges.length}</div>
                  <div className="text-xs text-muted-foreground">バッジ数</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-600">{week.efficiency}%</div>
                  <div className="text-xs text-muted-foreground">効率予測</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-orange-600">{week.completionRate.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">現在進捗</div>
                </div>
              </div>

              {/* バッジ概要 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {week.plannedBadges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 text-sm bg-muted px-2 py-1 rounded"
                  >
                    <span>{badge.badgeEmoji}</span>
                    <span>{badge.badgeName}</span>
                    <Badge variant={getPriorityColor(badge.priority)} className="text-xs">
                      {badge.priority}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* 展開時の詳細情報 */}
              {expandedWeek === week.weekNumber && (
                <div className="border-t pt-4 space-y-4">
                  {/* 詳細なバッジ情報 */}
                  <div>
                    <h4 className="font-semibold mb-3">📋 詳細計画</h4>
                    <div className="space-y-3">
                      {week.plannedBadges.map((badge, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{badge.badgeEmoji}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{badge.badgeName}</span>
                                <Badge variant={getPriorityColor(badge.priority)}>
                                  {badge.priority}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {badge.estimatedHours}h
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">
                                カテゴリ: {badge.category} | 目標: {badge.targetDate}
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>進捗</span>
                                    <span>{badge.progress}%</span>
                                  </div>
                                  <Progress value={badge.progress} className="h-2" />
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>信頼度</span>
                                    <span
                                      className={
                                        badge.confidence >= 80
                                          ? 'text-green-600'
                                          : badge.confidence >= 60
                                            ? 'text-yellow-600'
                                            : 'text-red-600'
                                      }
                                    >
                                      {badge.confidence}%
                                    </span>
                                  </div>
                                  <Progress value={badge.confidence} className="h-2" />
                                </div>
                              </div>
                              {badge.dependencies.length > 0 && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  依存: {badge.dependencies.join(', ')}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-sm font-medium ${getStatusColor(badge.status)}`}
                              >
                                {badge.status === 'completed'
                                  ? '完了'
                                  : badge.status === 'in_progress'
                                    ? '進行中'
                                    : badge.status === 'delayed'
                                      ? '遅延'
                                      : '未開始'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* マイルストーンと注意事項 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">🎯 キーマイルストーン</h4>
                      <ul className="text-sm space-y-1">
                        {week.keyMilestones.map((milestone, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Target className="w-3 h-3 mt-1 text-blue-600" />
                            <span>{milestone}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">📝 週の特記事項</h4>
                      <p className="text-sm text-muted-foreground">{week.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WeeklyScheduleView;
