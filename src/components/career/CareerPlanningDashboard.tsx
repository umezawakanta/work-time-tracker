import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target,
  TrendingUp,
  Users,
  Calendar,
  BookOpen,
  Award,
  ChevronRight,
  Star,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface CareerPath {
  id: string;
  title: string;
  description: string;
  currentLevel: number;
  targetLevel: number;
  skills: Skill[];
  milestones: Milestone[];
  estimatedDuration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
}

interface Skill {
  id: string;
  name: string;
  currentLevel: number;
  targetLevel: number;
  priority: 'high' | 'medium' | 'low';
  learningResources: LearningResource[];
  assessmentDate?: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  isCompleted: boolean;
  requirements: string[];
  rewards: string[];
}

interface LearningResource {
  type: 'course' | 'book' | 'project' | 'certification' | 'mentorship';
  title: string;
  provider: string;
  duration: string;
  url?: string;
  priority: number;
}

export const CareerPlanningDashboard: React.FC = () => {
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // キャリアパスデータの初期化
    initializeCareerPaths();
  }, []);

  const initializeCareerPaths = () => {
    const paths: CareerPath[] = [
      {
        id: 'frontend-specialist',
        title: 'フロントエンド・スペシャリスト',
        description: 'モダンなフロントエンド技術を極める専門職',
        currentLevel: 3,
        targetLevel: 5,
        estimatedDuration: '18ヶ月',
        difficulty: 'intermediate',
        category: 'Frontend Development',
        skills: [
          {
            id: 'react-advanced',
            name: 'React上級',
            currentLevel: 3,
            targetLevel: 5,
            priority: 'high',
            learningResources: [
              {
                type: 'course',
                title: 'React Performance Optimization',
                provider: 'Frontend Masters',
                duration: '6 hours',
                priority: 1,
              },
              {
                type: 'project',
                title: 'Large Scale React Application',
                provider: 'Personal Project',
                duration: '3 months',
                priority: 2,
              },
            ],
            assessmentDate: '2024-03-15',
          },
          {
            id: 'typescript-expert',
            name: 'TypeScript エキスパート',
            currentLevel: 4,
            targetLevel: 5,
            priority: 'high',
            learningResources: [
              {
                type: 'book',
                title: 'Programming TypeScript',
                provider: "O'Reilly",
                duration: '2 months',
                priority: 1,
              },
            ],
          },
          {
            id: 'web-performance',
            name: 'Webパフォーマンス最適化',
            currentLevel: 2,
            targetLevel: 4,
            priority: 'medium',
            learningResources: [
              {
                type: 'certification',
                title: 'Google PageSpeed Insights Certified',
                provider: 'Google',
                duration: '1 month',
                priority: 1,
              },
            ],
          },
        ],
        milestones: [
          {
            id: 'milestone-1',
            title: 'React パフォーマンス最適化マスター',
            description: 'React アプリケーションの高度な最適化技術を習得',
            targetDate: '2024-06-30',
            isCompleted: false,
            requirements: ['React Profilerの活用', 'メモ化戦略の実装', 'コードスプリッティング'],
            rewards: ['パフォーマンス専門家認定', 'チームリード資格'],
          },
          {
            id: 'milestone-2',
            title: 'フルスタック開発能力',
            description: 'フロントエンドからバックエンドまでの統合開発',
            targetDate: '2024-12-31',
            isCompleted: false,
            requirements: ['API設計・実装', 'データベース設計', 'DevOps基礎'],
            rewards: ['フルスタック認定', '昇進候補'],
          },
        ],
      },
      {
        id: 'ai-engineer',
        title: 'AI・機械学習エンジニア',
        description: 'AI・機械学習技術を活用したソリューション開発',
        currentLevel: 1,
        targetLevel: 4,
        estimatedDuration: '24ヶ月',
        difficulty: 'advanced',
        category: 'AI/ML',
        skills: [
          {
            id: 'python-ml',
            name: 'Python機械学習',
            currentLevel: 2,
            targetLevel: 4,
            priority: 'high',
            learningResources: [
              {
                type: 'course',
                title: 'Machine Learning Specialization',
                provider: 'Coursera',
                duration: '6 months',
                priority: 1,
              },
            ],
          },
          {
            id: 'deep-learning',
            name: 'ディープラーニング',
            currentLevel: 1,
            targetLevel: 4,
            priority: 'high',
            learningResources: [
              {
                type: 'course',
                title: 'Deep Learning Specialization',
                provider: 'Coursera',
                duration: '4 months',
                priority: 1,
              },
            ],
          },
        ],
        milestones: [
          {
            id: 'ai-milestone-1',
            title: 'ML基礎マスター',
            description: '機械学習の基礎理論と実装をマスター',
            targetDate: '2024-09-30',
            isCompleted: false,
            requirements: ['回帰・分類アルゴリズム理解', 'scikit-learnでの実装', 'データ前処理'],
            rewards: ['ML基礎認定'],
          },
        ],
      },
      {
        id: 'product-manager',
        title: 'プロダクトマネージャー',
        description: 'プロダクト戦略・企画・管理の専門職',
        currentLevel: 2,
        targetLevel: 4,
        estimatedDuration: '12ヶ月',
        difficulty: 'intermediate',
        category: 'Product Management',
        skills: [
          {
            id: 'product-strategy',
            name: 'プロダクト戦略',
            currentLevel: 2,
            targetLevel: 4,
            priority: 'high',
            learningResources: [
              {
                type: 'book',
                title: 'Inspired: How to Create Tech Products Customers Love',
                provider: 'Marty Cagan',
                duration: '1 month',
                priority: 1,
              },
            ],
          },
        ],
        milestones: [
          {
            id: 'pm-milestone-1',
            title: 'プロダクト戦略立案',
            description: 'データドリブンなプロダクト戦略を立案・実行',
            targetDate: '2024-08-31',
            isCompleted: false,
            requirements: ['市場分析', 'ユーザーリサーチ', 'ロードマップ作成'],
            rewards: ['プロダクト戦略認定'],
          },
        ],
      },
    ];

    setCareerPaths(paths);
    setSelectedPath(paths[0]);
  };

  const calculateOverallProgress = (path: CareerPath): number => {
    const skillProgress =
      path.skills.reduce((acc, skill) => {
        return acc + (skill.currentLevel / skill.targetLevel) * 100;
      }, 0) / path.skills.length;

    const milestoneProgress =
      (path.milestones.filter((m) => m.isCompleted).length / path.milestones.length) * 100;

    return Math.round((skillProgress + milestoneProgress) / 2);
  };

  const getNextMilestone = (path: CareerPath): Milestone | null => {
    return path.milestones.find((m) => !m.isCompleted) || null;
  };

  const getPrioritySkills = (path: CareerPath): Skill[] => {
    return path.skills
      .filter((skill) => skill.priority === 'high' && skill.currentLevel < skill.targetLevel)
      .sort((a, b) => b.targetLevel - b.currentLevel - (a.targetLevel - a.currentLevel));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">キャリアプランニング</h1>
          <p className="text-muted-foreground mt-2">
            あなたの目標に向けた学習ロードマップと進捗管理
          </p>
        </div>
        <Button>
          <Target className="w-4 h-4 mr-2" />
          新しいパス作成
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* キャリアパス一覧 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              キャリアパス
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {careerPaths.map((path) => (
              <div
                key={path.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedPath?.id === path.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedPath(path)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm">{path.title}</h3>
                  <Badge
                    variant={
                      path.difficulty === 'beginner'
                        ? 'secondary'
                        : path.difficulty === 'intermediate'
                          ? 'default'
                          : path.difficulty === 'advanced'
                            ? 'destructive'
                            : 'outline'
                    }
                  >
                    {path.difficulty}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{path.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>進捗</span>
                    <span>{calculateOverallProgress(path)}%</span>
                  </div>
                  <Progress value={calculateOverallProgress(path)} className="h-2" />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {path.estimatedDuration}
                  </span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 詳細表示 */}
        <div className="lg:col-span-2">
          {selectedPath && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">概要</TabsTrigger>
                <TabsTrigger value="skills">スキル</TabsTrigger>
                <TabsTrigger value="milestones">マイルストーン</TabsTrigger>
                <TabsTrigger value="learning">学習リソース</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedPath.title}
                      <Badge variant="outline">{selectedPath.category}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{selectedPath.description}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>全体進捗</span>
                          <span className="font-semibold">
                            {calculateOverallProgress(selectedPath)}%
                          </span>
                        </div>
                        <Progress value={calculateOverallProgress(selectedPath)} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>現在レベル</span>
                          <span className="font-semibold">
                            {selectedPath.currentLevel}/{selectedPath.targetLevel}
                          </span>
                        </div>
                        <Progress
                          value={(selectedPath.currentLevel / selectedPath.targetLevel) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {selectedPath.skills.length}
                        </div>
                        <div className="text-xs text-muted-foreground">スキル</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {selectedPath.milestones.length}
                        </div>
                        <div className="text-xs text-muted-foreground">マイルストーン</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {selectedPath.estimatedDuration}
                        </div>
                        <div className="text-xs text-muted-foreground">推定期間</div>
                      </div>
                    </div>

                    {/* 次のマイルストーン */}
                    {getNextMilestone(selectedPath) && (
                      <Card className="border-l-4 border-l-primary">
                        <CardContent className="pt-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            次の目標
                          </h4>
                          <p className="text-sm font-medium">
                            {getNextMilestone(selectedPath)?.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            期限: {getNextMilestone(selectedPath)?.targetDate}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      スキル進捗
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedPath.skills.map((skill) => (
                      <div key={skill.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{skill.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                skill.priority === 'high'
                                  ? 'destructive'
                                  : skill.priority === 'medium'
                                    ? 'default'
                                    : 'secondary'
                              }
                            >
                              {skill.priority}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {skill.currentLevel}/{skill.targetLevel}
                            </span>
                          </div>
                        </div>
                        <Progress
                          value={(skill.currentLevel / skill.targetLevel) * 100}
                          className="h-2"
                        />
                        {skill.assessmentDate && (
                          <p className="text-xs text-muted-foreground">
                            最終評価: {skill.assessmentDate}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="milestones" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      マイルストーン
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedPath.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className={`p-4 border rounded-lg ${
                          milestone.isCompleted ? 'bg-green-50 border-green-200' : 'bg-muted/20'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            {milestone.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <div className="w-4 h-4 border-2 border-muted-foreground rounded-full" />
                            )}
                            {milestone.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {milestone.targetDate}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {milestone.description}
                        </p>

                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">要件:</h5>
                          <ul className="text-sm space-y-1">
                            {milestone.requirements.map((req, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-3 space-y-2">
                          <h5 className="text-sm font-medium">報酬:</h5>
                          <div className="flex flex-wrap gap-1">
                            {milestone.rewards.map((reward, index) => (
                              <Badge key={index} variant="outline">
                                {reward}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="learning" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      推奨学習リソース
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {getPrioritySkills(selectedPath).map((skill) => (
                      <div key={skill.id} className="space-y-3">
                        <h4 className="font-semibold text-sm">{skill.name}</h4>
                        <div className="space-y-2">
                          {skill.learningResources
                            .sort((a, b) => a.priority - b.priority)
                            .map((resource, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline">{resource.type}</Badge>
                                    <span className="font-medium text-sm">{resource.title}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {resource.provider} • {resource.duration}
                                  </p>
                                </div>
                                <Button size="sm" variant="outline">
                                  開始
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};
