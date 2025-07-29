import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Scale,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Plus,
  RefreshCw,
  Download,
  Upload,
  Globe,
  Lock,
  Users,
  Building2,
  Gavel,
  BookOpen,
  Search,
  Bell,
  Target,
  Activity,
  BarChart3,
  Calendar,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface LegalMetrics {
  contracts: {
    active: number;
    expiring: number;
    renewal: number;
    drafts: number;
  };
  compliance: {
    score: number;
    risks: number;
    audits: number;
    violations: number;
  };
  privacy: {
    gdprCompliance: number;
    dataRequests: number;
    breaches: number;
    assessments: number;
  };
  intellectual: {
    trademarks: number;
    patents: number;
    copyrights: number;
    disputes: number;
  };
}

interface Contract {
  id: string;
  title: string;
  party: string;
  type: 'service' | 'employment' | 'nda' | 'license' | 'vendor';
  status: 'draft' | 'review' | 'negotiation' | 'signed' | 'expired';
  startDate: string;
  endDate: string;
  value?: number;
  autoRenewal: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  assignedLawyer?: string;
}

interface ComplianceTask {
  id: string;
  title: string;
  description: string;
  category: 'gdpr' | 'employment' | 'corporate' | 'tax' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  assignee?: string;
  documents: string[];
}

interface LegalRisk {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  impact: string;
  mitigation: string;
  status: 'identified' | 'assessed' | 'mitigating' | 'resolved';
  owner: string;
}

const LegalDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<LegalMetrics | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [complianceTasks, setComplianceTasks] = useState<ComplianceTask[]>([]);
  const [legalRisks, setLegalRisks] = useState<LegalRisk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  // メトリクス取得
  const fetchMetrics = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/legal/metrics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setContracts(data.contracts);
        setComplianceTasks(data.complianceTasks);
        setLegalRisks(data.legalRisks);
      } else {
        // フォールバック: デモデータ
        setMetrics({
          contracts: {
            active: 45,
            expiring: 7,
            renewal: 12,
            drafts: 5,
          },
          compliance: {
            score: 87,
            risks: 8,
            audits: 3,
            violations: 1,
          },
          privacy: {
            gdprCompliance: 92,
            dataRequests: 15,
            breaches: 0,
            assessments: 4,
          },
          intellectual: {
            trademarks: 12,
            patents: 3,
            copyrights: 28,
            disputes: 2,
          },
        });

        setContracts([
          {
            id: 'contract-001',
            title: 'クラウドサービス契約',
            party: 'AWS Japan株式会社',
            type: 'vendor',
            status: 'signed',
            startDate: '2024-01-01',
            endDate: '2025-12-31',
            value: 2400000,
            autoRenewal: true,
            riskLevel: 'low',
            assignedLawyer: '田中弁護士',
          },
          {
            id: 'contract-002',
            title: '業務委託契約',
            party: 'フリーランス開発者A',
            type: 'service',
            status: 'review',
            startDate: '2025-02-01',
            endDate: '2025-07-31',
            value: 1800000,
            autoRenewal: false,
            riskLevel: 'medium',
            assignedLawyer: '佐藤弁護士',
          },
          {
            id: 'contract-003',
            title: '秘密保持契約',
            party: 'XYZ商事株式会社',
            type: 'nda',
            status: 'negotiation',
            startDate: '2025-02-01',
            endDate: '2027-01-31',
            autoRenewal: false,
            riskLevel: 'low',
          },
        ]);

        setComplianceTasks([
          {
            id: 'compliance-001',
            title: 'GDPR年次監査',
            description: '個人データ処理活動の包括的レビューと監査',
            category: 'gdpr',
            priority: 'high',
            dueDate: '2025-03-31',
            status: 'in-progress',
            assignee: '法務部',
            documents: ['audit-checklist.pdf', 'data-mapping.xlsx'],
          },
          {
            id: 'compliance-002',
            title: '就業規則改定',
            description: 'リモートワーク規定の追加と既存規則の見直し',
            category: 'employment',
            priority: 'medium',
            dueDate: '2025-02-28',
            status: 'pending',
            assignee: '人事部',
            documents: ['current-rules.pdf'],
          },
          {
            id: 'compliance-003',
            title: 'セキュリティポリシー更新',
            description: '情報セキュリティポリシーの年次見直し',
            category: 'security',
            priority: 'critical',
            dueDate: '2025-02-15',
            status: 'overdue',
            assignee: 'IT部',
            documents: ['security-policy.pdf', 'risk-assessment.docx'],
          },
        ]);

        setLegalRisks([
          {
            id: 'risk-001',
            title: 'データプライバシー規制強化',
            description: '新しいプライバシー法制への対応が必要',
            category: 'プライバシー',
            severity: 'high',
            probability: 85,
            impact: '高額な制裁金のリスク',
            mitigation: 'プライバシー・バイ・デザインの実装',
            status: 'mitigating',
            owner: '法務部',
          },
          {
            id: 'risk-002',
            title: '契約更新期限切れ',
            description: '重要な業務委託契約の期限が迫っている',
            category: '契約管理',
            severity: 'medium',
            probability: 70,
            impact: 'サービス継続に影響',
            mitigation: '早期更新交渉の開始',
            status: 'identified',
            owner: '営業部',
          },
        ]);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch legal metrics:', error);
      toast.error('法務メトリクスの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 契約ステータス更新
  const updateContractStatus = async (contractId: string, status: string) => {
    try {
      const response = await fetch(`/api/legal/contracts/${contractId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setContracts((prev) =>
          prev.map((contract) =>
            contract.id === contractId ? { ...contract, status: status as any } : contract
          )
        );
        toast.success('契約ステータスを更新しました');
      }
    } catch (error) {
      console.error('Failed to update contract:', error);
      toast.error('契約の更新に失敗しました');
    }
  };

  // コンプライアンスタスク完了
  const completeComplianceTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/legal/compliance/${taskId}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        setComplianceTasks((prev) =>
          prev.map((task) => (task.id === taskId ? { ...task, status: 'completed' } : task))
        );
        toast.success('コンプライアンスタスクを完了しました');
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error('タスクの完了に失敗しました');
    }
  };

  // リーガルレポート生成
  const generateLegalReport = async (type: string) => {
    try {
      const response = await fetch(`/api/legal/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `legal-report-${type}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('法務レポートをダウンロードしました');
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('レポート生成に失敗しました');
    }
  };

  useEffect(() => {
    fetchMetrics();

    // 30秒ごとに自動更新
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !metrics) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">法務ダッシュボード</h1>
          <p className="text-gray-600">
            最終更新: {lastUpdate.toLocaleString()} | 自動更新: 30秒間隔
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            更新
          </Button>
          <Button variant="outline" size="sm" onClick={() => generateLegalReport('compliance')}>
            <Download className="w-4 h-4 mr-1" />
            コンプライアンスレポート
          </Button>
          <Button variant="default" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            新規契約
          </Button>
        </div>
      </div>

      {/* 緊急アラート */}
      {complianceTasks.filter((task) => task.status === 'overdue' || task.priority === 'critical')
        .length > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">緊急対応が必要です</AlertTitle>
          <AlertDescription className="text-red-700">
            {complianceTasks.filter((task) => task.status === 'overdue').length}件の期限超過タスクと
            {complianceTasks.filter((task) => task.priority === 'critical').length}
            件の重要タスクがあります。
          </AlertDescription>
        </Alert>
      )}

      {/* メトリクス概要 */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">アクティブ契約</p>
                  <p className="text-2xl font-bold">{metrics.contracts.active}</p>
                  <p className="text-xs text-orange-600">
                    期限切迫: {metrics.contracts.expiring}件
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-2 text-xs text-gray-600">
                更新予定: {metrics.contracts.renewal}件
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">コンプライアンススコア</p>
                  <p className="text-2xl font-bold">{metrics.compliance.score}%</p>
                  <p className="text-xs text-red-600">リスク: {metrics.compliance.risks}件</p>
                </div>
                <Scale className="w-8 h-8 text-green-600" />
              </div>
              <Progress value={metrics.compliance.score} className="mt-2" />
              <p className="text-xs text-gray-600 mt-1">違反: {metrics.compliance.violations}件</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">GDPR準拠率</p>
                  <p className="text-2xl font-bold">{metrics.privacy.gdprCompliance}%</p>
                  <p className="text-xs text-blue-600">
                    データ要求: {metrics.privacy.dataRequests}件
                  </p>
                </div>
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <Progress value={metrics.privacy.gdprCompliance} className="mt-2" />
              <p className="text-xs text-gray-600 mt-1">侵害: {metrics.privacy.breaches}件</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">知的財産</p>
                  <p className="text-2xl font-bold">
                    {metrics.intellectual.trademarks + metrics.intellectual.patents}
                  </p>
                  <p className="text-xs text-purple-600">
                    商標: {metrics.intellectual.trademarks} | 特許: {metrics.intellectual.patents}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="mt-2 text-xs text-gray-600">
                争議: {metrics.intellectual.disputes}件
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* タブコンテンツ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="contracts">契約管理</TabsTrigger>
          <TabsTrigger value="compliance">コンプライアンス</TabsTrigger>
          <TabsTrigger value="risks">リスク管理</TabsTrigger>
          <TabsTrigger value="reports">レポート</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 今日の重要タスク */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  今日の重要タスク
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <p className="font-medium text-red-800">セキュリティポリシー更新</p>
                      <p className="text-sm text-red-600">期限超過 - 緊急対応必要</p>
                    </div>
                    <Badge variant="destructive">緊急</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                    <div>
                      <p className="font-medium text-orange-800">GDPR年次監査</p>
                      <p className="text-sm text-orange-600">期限: 2025-03-31</p>
                    </div>
                    <Badge variant="secondary">高</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                    <div>
                      <p className="font-medium text-yellow-800">業務委託契約レビュー</p>
                      <p className="text-sm text-yellow-600">フリーランス開発者との契約確認</p>
                    </div>
                    <Badge variant="outline">中</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* リーガルリスク概要 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  リーガルリスク概要
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {legalRisks.slice(0, 3).map((risk) => (
                    <div key={risk.id} className="border-l-4 border-l-red-500 pl-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{risk.title}</h4>
                        <Badge
                          variant={
                            risk.severity === 'critical'
                              ? 'destructive'
                              : risk.severity === 'high'
                                ? 'default'
                                : 'secondary'
                          }
                        >
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{risk.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">確率: {risk.probability}%</span>
                        <span className="text-xs text-gray-500">担当: {risk.owner}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>契約管理</CardTitle>
              <CardDescription>進行中の契約と契約管理</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <Card key={contract.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium">{contract.title}</h3>
                            <Badge
                              variant={
                                contract.status === 'signed'
                                  ? 'default'
                                  : contract.status === 'review'
                                    ? 'secondary'
                                    : 'outline'
                              }
                            >
                              {contract.status}
                            </Badge>
                            <Badge
                              variant={
                                contract.riskLevel === 'critical'
                                  ? 'destructive'
                                  : contract.riskLevel === 'high'
                                    ? 'default'
                                    : 'outline'
                              }
                            >
                              {contract.riskLevel}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">相手方: {contract.party}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>種類: {contract.type}</span>
                            <span>
                              期間: {contract.startDate} - {contract.endDate}
                            </span>
                            {contract.value && (
                              <span>金額: ¥{contract.value.toLocaleString()}</span>
                            )}
                            <span>自動更新: {contract.autoRenewal ? 'あり' : 'なし'}</span>
                          </div>
                          {contract.assignedLawyer && (
                            <p className="text-xs text-blue-600 mt-1">
                              担当: {contract.assignedLawyer}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col space-y-2">
                          {contract.status !== 'signed' && (
                            <Button
                              size="sm"
                              onClick={() => updateContractStatus(contract.id, 'signed')}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              署名完了
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            詳細
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>コンプライアンス管理</CardTitle>
              <CardDescription>法的要件とコンプライアンスタスク</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceTasks.map((task) => (
                  <Card key={task.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium">{task.title}</h3>
                            <Badge
                              variant={
                                task.priority === 'critical'
                                  ? 'destructive'
                                  : task.priority === 'high'
                                    ? 'default'
                                    : 'secondary'
                              }
                            >
                              {task.priority}
                            </Badge>
                            <Badge
                              variant={
                                task.status === 'completed'
                                  ? 'default'
                                  : task.status === 'overdue'
                                    ? 'destructive'
                                    : 'outline'
                              }
                            >
                              {task.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>カテゴリ: {task.category}</span>
                            <span>期限: {task.dueDate}</span>
                            {task.assignee && <span>担当: {task.assignee}</span>}
                          </div>
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">
                              関連文書: {task.documents.join(', ')}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {task.status !== 'completed' && (
                            <Button size="sm" onClick={() => completeComplianceTask(task.id)}>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              完了
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            詳細
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>リーガルリスク管理</CardTitle>
              <CardDescription>法的リスクの識別と対策</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {legalRisks.map((risk) => (
                  <Card key={risk.id} className="border-l-4 border-l-red-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium">{risk.title}</h3>
                            <Badge
                              variant={
                                risk.severity === 'critical'
                                  ? 'destructive'
                                  : risk.severity === 'high'
                                    ? 'default'
                                    : 'secondary'
                              }
                            >
                              {risk.severity}
                            </Badge>
                            <Badge variant="outline">{risk.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{risk.description}</p>
                          <div className="space-y-1 text-sm text-gray-500">
                            <div>カテゴリ: {risk.category}</div>
                            <div>確率: {risk.probability}%</div>
                            <div>影響: {risk.impact}</div>
                            <div>対策: {risk.mitigation}</div>
                            <div>責任者: {risk.owner}</div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3 mr-1" />
                            対策更新
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            詳細
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>法務レポート生成</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    className="w-full justify-start"
                    onClick={() => generateLegalReport('compliance')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    コンプライアンスレポート
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => generateLegalReport('contracts')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    契約管理レポート
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => generateLegalReport('risks')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    リスク評価レポート
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => generateLegalReport('privacy')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    プライバシー監査レポート
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>法務KPI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">契約レビュー効率</span>
                      <span className="text-sm text-green-600">87%</span>
                    </div>
                    <Progress value={87} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">コンプライアンス達成率</span>
                      <span className="text-sm text-blue-600">92%</span>
                    </div>
                    <Progress value={92} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">リスク軽減率</span>
                      <span className="text-sm text-purple-600">75%</span>
                    </div>
                    <Progress value={75} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">法的問題解決率</span>
                      <span className="text-sm text-orange-600">95%</span>
                    </div>
                    <Progress value={95} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LegalDashboard;
