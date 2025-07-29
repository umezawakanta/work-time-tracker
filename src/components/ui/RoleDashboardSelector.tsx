import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Settings,
  Code,
  TrendingUp,
  Shield,
  Database,
  GitBranch,
  DollarSign,
  Activity,
  Target,
  BarChart3,
  Globe,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface DashboardOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  roles: string[];
  features: string[];
}

const RoleDashboardSelector: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const dashboards: DashboardOption[] = [
    {
      id: 'admin',
      title: '管理者ダッシュボード',
      description: 'システム全体の監視と管理、ユーザー管理、売上分析',
      icon: <Shield className="w-8 h-8 text-red-600" />,
      path: '/admin-dashboard',
      color: 'border-red-200 hover:border-red-300',
      roles: ['admin', 'manager'],
      features: ['ユーザー管理', '売上分析', 'システム監視', '設定管理', 'セキュリティ監査'],
    },
    {
      id: 'operations',
      title: '運用ダッシュボード',
      description: 'インフラ監視、パフォーマンス管理、障害対応',
      icon: <Database className="w-8 h-8 text-blue-600" />,
      path: '/operations-dashboard',
      color: 'border-blue-200 hover:border-blue-300',
      roles: ['operations', 'devops', 'admin'],
      features: [
        'サーバー監視',
        'パフォーマンス分析',
        'インシデント管理',
        'メンテナンス計画',
        'ログ管理',
      ],
    },
    {
      id: 'developer',
      title: '開発ダッシュボード',
      description: '開発進捗、コード品質、デプロイ管理',
      icon: <Code className="w-8 h-8 text-green-600" />,
      path: '/developer-dashboard',
      color: 'border-green-200 hover:border-green-300',
      roles: ['developer', 'tech-lead', 'admin'],
      features: ['タスク管理', 'コード品質監視', 'PR管理', 'デプロイ管理', 'テスト結果'],
    },
    {
      id: 'sales',
      title: '営業ダッシュボード',
      description: 'リード管理、売上追跡、顧客関係管理',
      icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
      path: '/sales-dashboard',
      color: 'border-purple-200 hover:border-purple-300',
      roles: ['sales', 'marketing', 'admin'],
      features: ['リード管理', '商談追跡', '売上分析', '顧客管理', 'パフォーマンス分析'],
    },
    {
      id: 'finance',
      title: '経理ダッシュボード',
      description: '財務管理、請求書処理、税務申告、経費管理',
      icon: <DollarSign className="w-8 h-8 text-emerald-600" />,
      path: '/finance-dashboard',
      color: 'border-emerald-200 hover:border-emerald-300',
      roles: ['finance', 'accounting', 'admin'],
      features: ['財務分析', '請求書管理', '税務処理', '経費承認', '予算管理'],
    },
    {
      id: 'legal',
      title: '法務ダッシュボード',
      description: '契約管理、コンプライアンス、リーガルリスク管理',
      icon: <GitBranch className="w-8 h-8 text-indigo-600" />,
      path: '/legal-dashboard',
      color: 'border-indigo-200 hover:border-indigo-300',
      roles: ['legal', 'compliance', 'admin'],
      features: [
        '契約管理',
        'コンプライアンス監視',
        'リスク評価',
        'プライバシー対応',
        '知的財産管理',
      ],
    },
  ];

  // ユーザーの役割に基づいてアクセス可能なダッシュボードをフィルタリング
  const accessibleDashboards = dashboards.filter((dashboard) => {
    if (!user) return false;
    // Userタイプにroleプロパティがない場合の対応
    const userRole = (user as any).role || 'user';
    return dashboard.roles.includes(userRole) || user.isAdmin;
  });

  const handleDashboardSelect = (path: string) => {
    navigate(path);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">役割別ダッシュボード</h1>
        <p className="text-gray-600">あなたの役割に適したダッシュボードを選択してください</p>
      </div>

      {user && (
        <div className="text-center">
          <Badge variant="outline" className="text-sm">
            現在の役割: {(user as any).role || 'user'} {user.isAdmin && '(管理者権限)'}
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accessibleDashboards.map((dashboard) => (
          <Card
            key={dashboard.id}
            className={`cursor-pointer transition-all duration-200 ${dashboard.color} hover:shadow-lg`}
            onClick={() => handleDashboardSelect(dashboard.path)}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                {dashboard.icon}
                <div>
                  <CardTitle className="text-xl">{dashboard.title}</CardTitle>
                  <CardDescription className="mt-1">{dashboard.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">主な機能:</h4>
                  <div className="flex flex-wrap gap-1">
                    {dashboard.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">対象役割:</h4>
                  <div className="flex flex-wrap gap-1">
                    {dashboard.roles.map((role, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button className="w-full mt-4">
                  <Activity className="w-4 h-4 mr-2" />
                  ダッシュボードを開く
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {accessibleDashboards.length === 0 && (
        <Card className="text-center p-6">
          <CardContent>
            <div className="space-y-4">
              <Globe className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium">アクセス可能なダッシュボードがありません</h3>
                <p className="text-gray-600">
                  管理者にお問い合わせいただくか、適切な役割の設定をお願いします。
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                <BarChart3 className="w-4 h-4 mr-2" />
                メインダッシュボードに戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center text-sm text-gray-500">
        <p>各ダッシュボードは役割に応じてカスタマイズされた情報とアクションを提供します。</p>
      </div>
    </div>
  );
};

export default RoleDashboardSelector;
